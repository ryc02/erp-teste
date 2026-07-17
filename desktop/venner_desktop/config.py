from __future__ import annotations

import json
import os
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path


APP_NAME = "VennerERP"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000
DEFAULT_AGENT_HOST = "127.0.0.1"
DEFAULT_AGENT_PORT = 18777
DEFAULT_LABEL_PRINTER_PORT = 9100
DEFAULT_UPDATE_CHANNEL = "stable"


def get_runtime_base_dir() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parents[2]


def get_appdata_dir() -> Path:
    appdata = os.getenv("APPDATA")
    if appdata:
        return Path(appdata) / APP_NAME
    return get_runtime_base_dir() / ".venner"


def get_config_path() -> Path:
    return get_appdata_dir() / "config.json"


def get_agent_cache_dir() -> Path:
    return get_appdata_dir() / "agent-cache"


def get_update_cache_dir() -> Path:
    return get_appdata_dir() / "updates"


def get_default_update_manifest_path() -> Path:
    return get_runtime_base_dir() / "releases" / "desktop" / "manifest.json"


def get_legacy_server_file() -> Path:
    return get_runtime_base_dir() / "servidor.txt"


@dataclass
class WindowState:
    width: int = 1440
    height: int = 900


@dataclass
class AppConfig:
    server_host: str = DEFAULT_HOST
    server_port: int = DEFAULT_PORT
    use_https: bool = False
    company_name: str = "Venner"
    last_username: str = ""
    agent_host: str = DEFAULT_AGENT_HOST
    agent_port: int = DEFAULT_AGENT_PORT
    label_printer_host: str = ""
    label_printer_port: int = DEFAULT_LABEL_PRINTER_PORT
    update_source: str = ""
    update_channel: str = DEFAULT_UPDATE_CHANNEL
    auto_start_agent: bool = True
    last_module: str = "hub"
    hub_window: WindowState = field(default_factory=WindowState)
    vendas_window: WindowState = field(default_factory=lambda: WindowState(width=1360, height=860))

    @property
    def scheme(self) -> str:
        return "https" if self.use_https else "http"

    @property
    def base_url(self) -> str:
        return f"{self.scheme}://{self.server_host}:{self.server_port}"

    @property
    def agent_url(self) -> str:
        return f"http://{self.agent_host}:{self.agent_port}"

    @property
    def has_label_printer(self) -> bool:
        return bool(self.label_printer_host.strip())

    @property
    def effective_update_source(self) -> str:
        if self.update_source.strip():
            return self.update_source.strip()
        return str(get_default_update_manifest_path())


def _coerce_window_state(raw_value: object, *, fallback: WindowState) -> WindowState:
    if not isinstance(raw_value, dict):
        return fallback

    width = int(raw_value.get("width", fallback.width))
    height = int(raw_value.get("height", fallback.height))
    return WindowState(width=width, height=height)


def _build_config_from_dict(payload: dict[str, object]) -> AppConfig:
    default = AppConfig()
    return AppConfig(
        server_host=str(payload.get("server_host", default.server_host)).strip() or default.server_host,
        server_port=int(payload.get("server_port", default.server_port)),
        use_https=bool(payload.get("use_https", default.use_https)),
        company_name=str(payload.get("company_name", default.company_name)).strip() or default.company_name,
        last_username=str(payload.get("last_username", default.last_username)).strip(),
        agent_host=str(payload.get("agent_host", default.agent_host)).strip() or default.agent_host,
        agent_port=int(payload.get("agent_port", default.agent_port)),
        label_printer_host=str(payload.get("label_printer_host", default.label_printer_host)).strip(),
        label_printer_port=int(payload.get("label_printer_port", default.label_printer_port)),
        update_source=str(payload.get("update_source", default.update_source)).strip(),
        update_channel=str(payload.get("update_channel", default.update_channel)).strip() or default.update_channel,
        auto_start_agent=bool(payload.get("auto_start_agent", default.auto_start_agent)),
        last_module=str(payload.get("last_module", default.last_module)).strip() or default.last_module,
        hub_window=_coerce_window_state(payload.get("hub_window"), fallback=default.hub_window),
        vendas_window=_coerce_window_state(payload.get("vendas_window"), fallback=default.vendas_window),
    )


def _load_legacy_host() -> str | None:
    legacy_file = get_legacy_server_file()
    if not legacy_file.exists():
        return None

    value = legacy_file.read_text(encoding="utf-8").strip()
    return value or None


def load_config() -> AppConfig:
    config_path = get_config_path()
    if config_path.exists():
        payload = json.loads(config_path.read_text(encoding="utf-8"))
        return _build_config_from_dict(payload)

    config = AppConfig()
    legacy_host = _load_legacy_host()
    if legacy_host:
        config.server_host = legacy_host
    return config


def save_config(config: AppConfig) -> Path:
    config_path = get_config_path()
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(json.dumps(asdict(config), indent=2), encoding="utf-8")
    get_legacy_server_file().write_text(config.server_host, encoding="utf-8")
    return config_path
