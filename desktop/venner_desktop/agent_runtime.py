from __future__ import annotations

import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

from .config import AppConfig, get_runtime_base_dir
from .runtime import _windows_creation_flags, is_local_host, is_port_open


def get_agent_health_url(config: AppConfig) -> str:
    return f"{config.agent_url}/health"


def get_agent_status_url(config: AppConfig) -> str:
    return f"{config.agent_url}/status"


def get_agent_capabilities_url(config: AppConfig) -> str:
    return f"{config.agent_url}/capabilities"


def _read_json(url: str, timeout_seconds: float = 3.0) -> tuple[bool, dict[str, object] | str]:
    try:
        request = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8", errors="replace").strip()
            if not body:
                return True, {}
            return True, json.loads(body)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace").strip()
        return False, detail or f"HTTP {exc.code}"
    except Exception as exc:
        return False, str(exc)


def check_agent_health(config: AppConfig, timeout_seconds: float = 3.0) -> tuple[bool, str]:
    ok, payload = _read_json(get_agent_health_url(config), timeout_seconds=timeout_seconds)
    if not ok:
        return False, str(payload)

    if isinstance(payload, dict):
        status = str(payload.get("status", "unknown"))
        return status == "ok", json.dumps(payload, ensure_ascii=False)
    return False, str(payload)


def fetch_agent_status(config: AppConfig, timeout_seconds: float = 3.0) -> tuple[bool, dict[str, object] | str]:
    return _read_json(get_agent_status_url(config), timeout_seconds=timeout_seconds)


def fetch_agent_capabilities(config: AppConfig, timeout_seconds: float = 3.0) -> tuple[bool, dict[str, object] | str]:
    return _read_json(get_agent_capabilities_url(config), timeout_seconds=timeout_seconds)


def _find_agent_executable(base_dir: Path) -> Path | None:
    candidates = [
        base_dir / "dist" / "Venner_Agent.exe",
        Path(sys.executable).resolve().parent / "Venner_Agent.exe",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def _find_agent_source(base_dir: Path) -> Path | None:
    candidate = base_dir / "desktop" / "venner_agent.py"
    return candidate if candidate.exists() else None


def try_start_local_agent(config: AppConfig) -> subprocess.Popen | None:
    if not is_local_host(config.agent_host):
        return None

    if is_port_open(config.agent_host, config.agent_port):
        return None

    base_dir = get_runtime_base_dir()
    creation_flags = _windows_creation_flags()
    agent_source = _find_agent_source(base_dir)

    if agent_source and not getattr(sys, "frozen", False):
        return subprocess.Popen(
            [
                sys.executable,
                str(agent_source),
            ],
            cwd=str(base_dir),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
        )

    agent_executable = _find_agent_executable(base_dir)
    if agent_executable:
        return subprocess.Popen(
            [str(agent_executable)],
            cwd=str(agent_executable.parent),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
        )

    return None
