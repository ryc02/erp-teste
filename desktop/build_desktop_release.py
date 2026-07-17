from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path

from venner_desktop.version import SUITE_VERSION, build_version_payload, write_version_file


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DIST_DIR = PROJECT_ROOT / "dist"
BACKEND_DIST_DIR = PROJECT_ROOT / "backend" / "dist"
RELEASES_DIR = PROJECT_ROOT / "releases" / "desktop"

PACKAGE_FILES = {
    DIST_DIR / "Venner_Hub.exe": "Venner_Hub.exe",
    DIST_DIR / "Venner_Vendas.exe": "Venner_Vendas.exe",
    DIST_DIR / "Venner_Estoque.exe": "Venner_Estoque.exe",
    DIST_DIR / "Venner_Manutencao.exe": "Venner_Manutencao.exe",
    DIST_DIR / "Venner_PCP.exe": "Venner_PCP.exe",
    DIST_DIR / "Venner_Produtividade.exe": "Venner_Produtividade.exe",
    DIST_DIR / "Venner_Agent.exe": "Venner_Agent.exe",
    BACKEND_DIST_DIR / "ERP_Venner_Servidor.exe": "ERP_Venner_Servidor.exe",
}


def compute_sha256(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_release(*, version: str, notes: str) -> Path:
    missing_files = [str(source) for source in PACKAGE_FILES if not source.exists()]
    if missing_files:
        raise FileNotFoundError(
            "Os seguintes artefatos estão ausentes para a release desktop:\n- "
            + "\n- ".join(missing_files)
        )

    built_at = datetime.now().isoformat(timespec="seconds")
    release_name = f"Venner Desktop {version}"
    release_dir = RELEASES_DIR / version
    release_dir.mkdir(parents=True, exist_ok=True)

    staging_root = Path(tempfile.mkdtemp(prefix=f"venner_release_{version}_", dir=str(release_dir)))
    try:
        payload_dir = staging_root / f"VennerSuite-{version}"
        payload_dir.mkdir(parents=True, exist_ok=True)

        for source, destination_name in PACKAGE_FILES.items():
            shutil.copy2(source, payload_dir / destination_name)

        server_file = DIST_DIR / "servidor.txt"
        if server_file.exists():
            shutil.copy2(server_file, payload_dir / "servidor.txt")

        write_version_file(payload_dir, version=version, release_name=release_name, built_at=built_at)

        package_path = release_dir / f"VennerSuite-{version}.zip"
        with zipfile.ZipFile(package_path, mode="w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as package_zip:
            for file_path in payload_dir.rglob("*"):
                if file_path.is_file():
                    package_zip.write(file_path, arcname=file_path.relative_to(staging_root))

        manifest_payload = {
            "channel": "stable",
            "release_name": release_name,
            "latest_version": version,
            "published_at": built_at,
            "notes": notes.strip(),
            "package_path": f"./{version}/{package_path.name}",
            "package_sha256": compute_sha256(package_path),
        }
        manifest_path = RELEASES_DIR / "manifest.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest_payload, indent=2), encoding="utf-8")

        release_manifest_path = release_dir / "manifest.json"
        release_manifest_path.write_text(json.dumps(manifest_payload, indent=2), encoding="utf-8")
        (release_dir / "release_notes.txt").write_text(notes.strip(), encoding="utf-8")
        return package_path
    finally:
        shutil.rmtree(staging_root, ignore_errors=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera o pacote de release desktop do Venner.")
    parser.add_argument("--version", default=SUITE_VERSION, help="Versão da release desktop.")
    parser.add_argument(
        "--notes",
        default=(
            "Hub com login central, bridge local de documentos/PDF/ZPL e checagem de update via manifest."
        ),
        help="Notas curtas da release.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    package_path = build_release(version=args.version.strip() or SUITE_VERSION, notes=args.notes)
    print(f"release_package={package_path}")
    print(f"release_manifest={RELEASES_DIR / 'manifest.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
