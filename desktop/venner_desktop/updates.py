from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import zipfile
from dataclasses import asdict, dataclass
from datetime import datetime
from itertools import zip_longest
from pathlib import Path
from urllib.parse import urljoin, urlparse

from .config import AppConfig, get_runtime_base_dir, get_update_cache_dir
from .runtime import _windows_creation_flags
from .version import get_suite_version


@dataclass(frozen=True)
class UpdateManifest:
    source: str
    latest_version: str
    package_source: str
    channel: str
    release_name: str
    notes: str
    published_at: str
    package_sha256: str = ""


@dataclass(frozen=True)
class UpdateCheckResult:
    current_version: str
    manifest_source: str
    update_available: bool
    detail: str
    manifest: UpdateManifest | None = None

    @property
    def latest_version(self) -> str:
        if self.manifest:
            return self.manifest.latest_version
        return self.current_version


@dataclass(frozen=True)
class PreparedUpdate:
    version: str
    release_name: str
    manifest_source: str
    archive_path: Path
    extract_dir: Path
    payload_dir: Path
    manifest_snapshot_path: Path


def _looks_like_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme.lower() in {"http", "https", "file"}


def _normalize_source(source: str) -> str:
    raw_value = os.path.expandvars(source.strip())
    if not raw_value:
        raise ValueError("Nenhuma fonte de atualização foi configurada.")

    if _looks_like_url(raw_value):
        return raw_value

    return str(Path(raw_value).expanduser())


def _read_text(source: str, *, timeout_seconds: float = 10.0) -> tuple[str, str]:
    normalized_source = _normalize_source(source)
    if _looks_like_url(normalized_source):
        try:
            with urllib.request.urlopen(normalized_source, timeout=timeout_seconds) as response:
                return response.read().decode("utf-8", errors="replace"), normalized_source
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace").strip()
            raise RuntimeError(detail or f"HTTP {exc.code}") from exc
        except Exception as exc:
            raise RuntimeError(str(exc)) from exc

    path = Path(normalized_source)
    if not path.exists():
        raise FileNotFoundError(f"Manifesto de atualização não encontrado em {path}")
    return path.read_text(encoding="utf-8"), str(path)


def _resolve_reference(base_source: str, reference: str) -> str:
    normalized_reference = reference.strip()
    if not normalized_reference:
        raise ValueError("O manifesto não informou o pacote da atualização.")

    if _looks_like_url(normalized_reference):
        return normalized_reference

    if _looks_like_url(base_source):
        return urljoin(base_source, normalized_reference)

    base_path = Path(base_source)
    return str((base_path.parent / normalized_reference).resolve())


def _tokenize_version(value: str) -> list[tuple[int, object]]:
    tokens: list[tuple[int, object]] = []
    for chunk in value.replace("-", ".").replace("_", ".").split("."):
        chunk = chunk.strip()
        if not chunk:
            continue
        if chunk.isdigit():
            tokens.append((0, int(chunk)))
        else:
            tokens.append((1, chunk.lower()))
    return tokens or [(0, 0)]


def compare_versions(left: str, right: str) -> int:
    for left_token, right_token in zip_longest(
        _tokenize_version(left),
        _tokenize_version(right),
        fillvalue=(0, 0),
    ):
        if left_token == right_token:
            continue
        return 1 if left_token > right_token else -1
    return 0


def load_update_manifest(source: str) -> UpdateManifest:
    payload_text, manifest_source = _read_text(source)
    payload = json.loads(payload_text)
    if not isinstance(payload, dict):
        raise ValueError("Manifesto de atualização inválido.")

    latest_version = str(payload.get("latest_version", "")).strip()
    package_path = str(
        payload.get("package_path")
        or payload.get("package_url")
        or payload.get("package")
        or ""
    ).strip()
    if not latest_version:
        raise ValueError("O manifesto não contém latest_version.")
    if not package_path:
        raise ValueError("O manifesto não contém package_path.")

    return UpdateManifest(
        source=manifest_source,
        latest_version=latest_version,
        package_source=_resolve_reference(manifest_source, package_path),
        channel=str(payload.get("channel", "stable")).strip() or "stable",
        release_name=str(payload.get("release_name", f"Venner Desktop {latest_version}")).strip()
        or f"Venner Desktop {latest_version}",
        notes=str(payload.get("notes", "")).strip(),
        published_at=str(payload.get("published_at", "")).strip(),
        package_sha256=str(payload.get("package_sha256", "")).strip().lower(),
    )


def check_for_updates(config: AppConfig, *, current_version: str | None = None) -> UpdateCheckResult:
    manifest = load_update_manifest(config.effective_update_source)
    installed_version = current_version or get_suite_version()
    has_update = compare_versions(manifest.latest_version, installed_version) > 0

    if has_update:
        detail = (
            f"Atualização disponível: {manifest.release_name} "
            f"({installed_version} -> {manifest.latest_version})."
        )
    else:
        detail = f"Esta estação já está na versão {installed_version}."

    return UpdateCheckResult(
        current_version=installed_version,
        manifest_source=manifest.source,
        update_available=has_update,
        detail=detail,
        manifest=manifest,
    )


def _compute_sha256(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _download_or_copy_package(package_source: str, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return destination

    if _looks_like_url(package_source):
        with urllib.request.urlopen(package_source, timeout=60) as response:
            with destination.open("wb") as target:
                shutil.copyfileobj(response, target)
        return destination

    source_path = Path(package_source)
    if not source_path.exists():
        raise FileNotFoundError(f"Pacote de atualização não encontrado em {source_path}")

    shutil.copy2(source_path, destination)
    return destination


def _detect_payload_dir(extract_dir: Path) -> Path:
    direct_candidates = [extract_dir / "Venner_Hub.exe", extract_dir / "VennerSuite.version.json"]
    if any(candidate.exists() for candidate in direct_candidates):
        return extract_dir

    children = [child for child in extract_dir.iterdir()]
    if len(children) == 1 and children[0].is_dir():
        nested = children[0]
        nested_candidates = [nested / "Venner_Hub.exe", nested / "VennerSuite.version.json"]
        if any(candidate.exists() for candidate in nested_candidates):
            return nested

    raise RuntimeError("O pacote não contém a estrutura esperada da suíte desktop.")


def stage_update_package(check_result: UpdateCheckResult) -> PreparedUpdate:
    manifest = check_result.manifest
    if not manifest:
        raise RuntimeError("Nenhum manifesto de atualização foi carregado.")
    if not check_result.update_available:
        raise RuntimeError("Não há atualização disponível para aplicar.")

    update_root = get_update_cache_dir() / manifest.latest_version
    update_root.mkdir(parents=True, exist_ok=True)

    package_name = Path(urlparse(manifest.package_source).path).name or f"VennerSuite-{manifest.latest_version}.zip"
    archive_path = _download_or_copy_package(manifest.package_source, update_root / package_name)

    if manifest.package_sha256:
        current_sha = _compute_sha256(archive_path)
        if current_sha.lower() != manifest.package_sha256.lower():
            raise RuntimeError("O hash SHA-256 do pacote não confere com o manifesto.")

    if archive_path.suffix.lower() != ".zip":
        raise RuntimeError("No momento o updater suporta apenas pacotes .zip.")

    extract_dir = Path(tempfile.mkdtemp(prefix=f"venner_update_{manifest.latest_version}_", dir=str(update_root)))
    with zipfile.ZipFile(archive_path) as package_zip:
        package_zip.extractall(extract_dir)

    payload_dir = _detect_payload_dir(extract_dir)
    manifest_snapshot_path = update_root / "manifest_snapshot.json"
    manifest_snapshot_path.write_text(json.dumps(asdict(manifest), indent=2), encoding="utf-8")

    return PreparedUpdate(
        version=manifest.latest_version,
        release_name=manifest.release_name,
        manifest_source=manifest.source,
        archive_path=archive_path,
        extract_dir=extract_dir,
        payload_dir=payload_dir,
        manifest_snapshot_path=manifest_snapshot_path,
    )


def _write_update_script(
    prepared: PreparedUpdate,
    *,
    target_dir: Path,
    wait_for_pid: int,
    relaunch_executable: str,
) -> Path:
    script_path = prepared.extract_dir / "apply_update.ps1"
    script_content = f"""$ErrorActionPreference = 'Stop'
$pidToWait = {wait_for_pid}
$sourceDir = '{prepared.payload_dir}'
$targetDir = '{target_dir}'
$hubExecutable = Join-Path $targetDir '{relaunch_executable}'

Start-Sleep -Milliseconds 1200
try {{
    Wait-Process -Id $pidToWait -Timeout 90 -ErrorAction Stop
}} catch {{
}}

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
Get-ChildItem -LiteralPath $sourceDir -Force | ForEach-Object {{
    Copy-Item -LiteralPath $_.FullName -Destination $targetDir -Recurse -Force
}}

if (Test-Path -LiteralPath $hubExecutable) {{
    Start-Process -FilePath $hubExecutable
}}
"""
    script_path.write_text(script_content, encoding="utf-8")
    return script_path


def launch_update_installer(
    prepared: PreparedUpdate,
    *,
    wait_for_pid: int,
    relaunch_executable: str = "Venner_Hub.exe",
    target_dir: Path | None = None,
) -> Path:
    if not getattr(sys, "frozen", False):
        raise RuntimeError("A aplicação automática de update foi liberada apenas para os executáveis empacotados.")

    install_target = target_dir or get_runtime_base_dir()
    script_path = _write_update_script(
        prepared,
        target_dir=install_target,
        wait_for_pid=wait_for_pid,
        relaunch_executable=relaunch_executable,
    )
    subprocess.Popen(
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(script_path),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=_windows_creation_flags(),
    )
    return script_path
