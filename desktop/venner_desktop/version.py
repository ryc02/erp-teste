from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from .config import get_runtime_base_dir


SUITE_VERSION = "2026.05.07.2"
VERSION_FILENAME = "VennerSuite.version.json"


def get_version_file_path(base_dir: Path | None = None) -> Path:
    root = base_dir or get_runtime_base_dir()
    return root / VERSION_FILENAME


def build_version_payload(
    *,
    version: str = SUITE_VERSION,
    release_name: str | None = None,
    built_at: str | None = None,
) -> dict[str, str]:
    return {
        "version": version,
        "release_name": release_name or f"Venner Desktop {version}",
        "built_at": built_at or datetime.now().isoformat(timespec="seconds"),
    }


def read_version_payload(base_dir: Path | None = None) -> dict[str, str]:
    version_file = get_version_file_path(base_dir)
    if not version_file.exists():
        return build_version_payload()

    payload = json.loads(version_file.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        return build_version_payload()

    version = str(payload.get("version", SUITE_VERSION)).strip() or SUITE_VERSION
    release_name = str(payload.get("release_name", f"Venner Desktop {version}")).strip() or f"Venner Desktop {version}"
    built_at = str(payload.get("built_at", "")).strip() or datetime.now().isoformat(timespec="seconds")
    return build_version_payload(version=version, release_name=release_name, built_at=built_at)


def get_suite_version(base_dir: Path | None = None) -> str:
    return read_version_payload(base_dir).get("version", SUITE_VERSION)


def write_version_file(
    destination_dir: Path,
    *,
    version: str = SUITE_VERSION,
    release_name: str | None = None,
    built_at: str | None = None,
) -> Path:
    destination_dir.mkdir(parents=True, exist_ok=True)
    payload = build_version_payload(version=version, release_name=release_name, built_at=built_at)
    version_file = destination_dir / VERSION_FILENAME
    version_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return version_file
