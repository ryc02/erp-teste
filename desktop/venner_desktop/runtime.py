from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlencode

from .config import AppConfig, get_runtime_base_dir, load_config, save_config


@dataclass(frozen=True)
class ModuleDefinition:
    module_id: str
    title: str
    login_target: str
    window_width: int
    window_height: int


def is_local_host(host: str) -> bool:
    return host.strip().lower() in {"127.0.0.1", "localhost", "0.0.0.0", "::1"}


def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            return sock.connect_ex((host, port)) == 0
    except OSError:
        return False


def wait_for_server(config: AppConfig, retries: int = 8, interval_seconds: float = 1.0) -> bool:
    for _ in range(retries):
        if is_port_open(config.server_host, config.server_port):
            return True
        time.sleep(interval_seconds)
    return False


def build_login_url(
    config: AppConfig,
    login_target: str,
    *,
    auth_token: str | None = None,
    auth_username: str | None = None,
) -> str:
    query = urlencode(
        {
            "target": login_target,
            "desktop": "1",
            "agent": config.agent_url,
        },
        safe="/:",
    )
    url = f"{config.base_url}/login.html?{query}"

    fragment_payload: dict[str, str] = {}
    if auth_token:
        fragment_payload["hub_token"] = auth_token
    if auth_username:
        fragment_payload["hub_user"] = auth_username

    if fragment_payload:
        fragment_payload["hub_auto"] = "1"
        url = f"{url}#{urlencode(fragment_payload)}"

    return url


def _windows_creation_flags() -> int:
    return getattr(subprocess, "CREATE_NO_WINDOW", 0)


def _find_backend_executable(base_dir: Path) -> Path | None:
    candidates = [
        base_dir / "backend" / "dist" / "ERP_Venner_Servidor.exe",
        base_dir / "dist" / "ERP_Venner_Servidor.exe",
        Path(sys.executable).resolve().parent / "ERP_Venner_Servidor.exe",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def _find_backend_source_dir(base_dir: Path) -> Path | None:
    candidate = base_dir / "backend"
    return candidate if candidate.exists() else None


def try_start_local_server(config: AppConfig) -> subprocess.Popen | None:
    if not is_local_host(config.server_host):
        return None

    if is_port_open(config.server_host, config.server_port):
        return None

    base_dir = get_runtime_base_dir()
    creation_flags = _windows_creation_flags()
    backend_source_dir = _find_backend_source_dir(base_dir)

    # Em ambiente de desenvolvimento, preferimos sempre o backend fonte
    # para aproveitar o código atual do workspace.
    if backend_source_dir and not getattr(sys, "frozen", False):
        return subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "main:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(config.server_port),
            ],
            cwd=str(backend_source_dir),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
        )

    backend_executable = _find_backend_executable(base_dir)
    if backend_executable:
        return subprocess.Popen(
            [str(backend_executable)],
            cwd=str(backend_executable.parent),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
        )

    return None


def _browser_path_candidates() -> list[Path]:
    candidates = []
    program_files = [os.getenv("ProgramFiles"), os.getenv("ProgramFiles(x86)"), os.getenv("LOCALAPPDATA")]

    relative_paths = [
        Path("Microsoft/Edge/Application/msedge.exe"),
        Path("Google/Chrome/Application/chrome.exe"),
        Path("BraveSoftware/Brave-Browser/Application/brave.exe"),
    ]

    for base in program_files:
        if not base:
            continue
        for relative in relative_paths:
            candidates.append(Path(base) / relative)

    return candidates


def find_browser_executable() -> str | None:
    override = os.getenv("VENNER_DESKTOP_BROWSER")
    if override:
        override_path = Path(override)
        if override_path.exists():
            return str(override_path)
        resolved = shutil.which(override)
        if resolved:
            return resolved

    for executable_name in ("msedge.exe", "chrome.exe", "brave.exe"):
        resolved = shutil.which(executable_name)
        if resolved:
            return resolved

    for candidate in _browser_path_candidates():
        if candidate.exists():
            return str(candidate)

    return None


def _launch_browser_app_mode(definition: ModuleDefinition, url: str) -> bool:
    browser_executable = find_browser_executable()
    if not browser_executable:
        return False

    subprocess.Popen(
        [
            browser_executable,
            f"--app={url}",
            f"--window-size={definition.window_width},{definition.window_height}",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=_windows_creation_flags(),
    )
    return True


def open_url_in_desktop_shell(
    url: str,
    *,
    width: int | None = None,
    height: int | None = None,
    prefer_app_mode: bool = True,
    kiosk_printing: bool = False,
) -> bool:
    if prefer_app_mode:
        browser_executable = find_browser_executable()
        if browser_executable:
            command = [browser_executable, f"--app={url}"]
            if kiosk_printing:
                command.append("--kiosk-printing")
            if width and height:
                command.append(f"--window-size={width},{height}")

            subprocess.Popen(
                command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=_windows_creation_flags(),
            )
            return True

    if kiosk_printing:
        browser_executable = find_browser_executable()
        if browser_executable:
            command = [browser_executable, "--kiosk-printing", url]
            if width and height:
                command.append(f"--window-size={width},{height}")

            subprocess.Popen(
                command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=_windows_creation_flags(),
            )
            return True

    _fallback_to_browser(url)
    return True


def _fallback_to_browser(url: str) -> None:
    webbrowser.open(url)


def get_health_url(config: AppConfig) -> str:
    return f"{config.base_url}/api/v1/health"


def check_server_health(config: AppConfig, timeout_seconds: float = 3.0) -> tuple[bool, str]:
    try:
        request = urllib.request.Request(get_health_url(config), method="GET")
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8", errors="replace").strip()
            return True, body or "Servidor respondeu sem conteúdo."
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace").strip()
        return False, detail or f"HTTP {exc.code}"
    except Exception as exc:
        return False, str(exc)


def launch_web_module(
    definition: ModuleDefinition,
    *,
    config: AppConfig | None = None,
    auth_token: str | None = None,
    auth_username: str | None = None,
) -> int:
    config = config or load_config()
    config.last_module = definition.module_id
    save_config(config)

    url = build_login_url(
        config,
        definition.login_target,
        auth_token=auth_token,
        auth_username=auth_username,
    )
    if config.auto_start_agent:
        from .agent_runtime import try_start_local_agent

        try_start_local_agent(config)
    try_start_local_server(config)
    server_ready = wait_for_server(config)

    if os.getenv("VENNER_DESKTOP_DRY_RUN", "0") == "1":
        print(f"module={definition.module_id}")
        print(f"url={url}")
        print(f"server_ready={server_ready}")
        print(f"browser_app_available={bool(find_browser_executable())}")
        return 0

    try:
        import webview
    except ImportError:
        if _launch_browser_app_mode(definition, url):
            return 0

        print("pywebview não está disponível. Abrindo no navegador padrão.", file=sys.stderr)
        _fallback_to_browser(url)
        return 0

    debug_mode = os.getenv("VENNER_DESKTOP_DEBUG", "0") == "1"
    try:
        window = webview.create_window(
            title=definition.title,
            url=url,
            width=definition.window_width,
            height=definition.window_height,
            resizable=True,
            min_size=(1024, 720),
        )
        webview.start(debug=debug_mode)
        return 0 if window else 1
    except Exception as exc:
        print(f"Falha ao iniciar pywebview ({exc}). Tentando modo app do navegador.", file=sys.stderr)
        if _launch_browser_app_mode(definition, url):
            return 0
        _fallback_to_browser(url)
        return 0
