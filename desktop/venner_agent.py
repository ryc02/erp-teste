from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import socket
from dataclasses import asdict, dataclass
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import error as urllib_error
from urllib import request as urllib_request
from urllib.parse import unquote, urlparse

from venner_desktop.config import AppConfig, get_agent_cache_dir, load_config
from venner_desktop.runtime import open_url_in_desktop_shell


@dataclass(frozen=True)
class AgentCapabilities:
    printer_bridge: bool
    files_bridge: bool
    serial_bridge: bool
    open_url_bridge: bool
    document_bridge: bool
    local_pdf_print: bool
    zpl_label_bridge: bool


@dataclass(frozen=True)
class CachedDocument:
    url: str
    filename: str
    local_path: str
    content_type: str
    size_bytes: int


@dataclass(frozen=True)
class AgentStatus:
    module: str
    server_url: str
    agent_url: str
    label_printer_target: str
    machine_name: str
    started_at: str
    capabilities: AgentCapabilities


class VennerAgentService:
    def __init__(self, config: AppConfig) -> None:
        self.config = config
        self.started_at = datetime.now().isoformat(timespec="seconds")
        self.cache_dir = get_agent_cache_dir()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._cleanup_cache()
        self.capabilities = AgentCapabilities(
            printer_bridge=True,
            files_bridge=True,
            serial_bridge=False,
            open_url_bridge=True,
            document_bridge=True,
            local_pdf_print=True,
            zpl_label_bridge=self.config.has_label_printer,
        )

    def open_url(
        self,
        url: str,
        *,
        prefer_app_mode: bool,
        width: int | None,
        height: int | None,
        kiosk_printing: bool = False,
    ) -> None:
        open_url_in_desktop_shell(
            url,
            width=width,
            height=height,
            prefer_app_mode=prefer_app_mode,
            kiosk_printing=kiosk_printing,
        )

    def open_local_file(self, local_path: Path) -> None:
        os.startfile(str(local_path))

    def print_local_file(self, local_path: Path) -> None:
        os.startfile(str(local_path), "print")

    def get_label_printer_target(self) -> str:
        if not self.config.has_label_printer:
            return ""
        return f"{self.config.label_printer_host}:{self.config.label_printer_port}"

    def is_allowed_url(self, url: str) -> bool:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            return False

        allowed_hosts = {
            self.config.server_host.strip().lower(),
            self.config.agent_host.strip().lower(),
            "127.0.0.1",
            "localhost",
        }
        return (parsed.hostname or "").lower() in allowed_hosts

    def is_label_printer_configured(self) -> bool:
        return self.config.has_label_printer

    def _cleanup_cache(self, *, keep_files: int = 80) -> None:
        cached_files = sorted(
            (path for path in self.cache_dir.glob("*") if path.is_file()),
            key=lambda item: item.stat().st_mtime,
            reverse=True,
        )
        for stale_file in cached_files[keep_files:]:
            try:
                stale_file.unlink()
            except OSError:
                continue

    def _normalize_authorization(self, value: object) -> str | None:
        if value is None:
            return None

        authorization = str(value).strip()
        if not authorization:
            return None

        if authorization.lower().startswith("bearer "):
            return authorization
        return f"Bearer {authorization}"

    def _build_request_headers(self, authorization: str | None) -> dict[str, str]:
        headers = {
            "User-Agent": "VennerAgent/1.0",
            "Accept": "application/pdf,text/html,text/plain,application/octet-stream,*/*",
        }
        if authorization:
            headers["Authorization"] = authorization
        return headers

    def _guess_extension(self, filename: str, content_type: str) -> str:
        existing_suffix = Path(filename).suffix
        if existing_suffix:
            return existing_suffix

        normalized_type = (content_type or "").split(";", 1)[0].strip().lower()
        if normalized_type == "application/pdf":
            return ".pdf"
        if normalized_type == "text/html":
            return ".html"

        guessed = mimetypes.guess_extension(normalized_type or "application/octet-stream")
        return guessed or ".bin"

    def _extract_filename_from_disposition(self, disposition: str) -> str | None:
        if not disposition:
            return None

        utf8_match = re.search(r"filename\*=UTF-8''([^;]+)", disposition, flags=re.IGNORECASE)
        if utf8_match:
            return unquote(utf8_match.group(1)).strip()

        plain_match = re.search(r'filename="?([^";]+)"?', disposition, flags=re.IGNORECASE)
        if plain_match:
            return plain_match.group(1).strip()

        return None

    def _sanitize_filename(self, value: str) -> str:
        cleaned = re.sub(r'[<>:"/\\\\|?*]+', "_", value).strip().strip(".")
        return cleaned or "documento"

    def _resolve_filename(self, url: str, content_type: str, disposition: str) -> str:
        filename = self._extract_filename_from_disposition(disposition)
        if not filename:
            raw_name = unquote(Path(urlparse(url).path).name)
            filename = raw_name or "documento"

        filename = self._sanitize_filename(filename)
        suffix = self._guess_extension(filename, content_type)
        stem = Path(filename).stem or "documento"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        return f"{stem}_{timestamp}{suffix}"

    def _should_handle_locally(self, *, document_kind: str, url: str) -> bool:
        normalized_kind = document_kind.strip().lower() or "auto"
        if normalized_kind in {"pdf", "document", "file", "download", "local"}:
            return True
        if normalized_kind in {"label", "html", "browser"}:
            return False

        normalized_path = urlparse(url).path.lower()
        return normalized_path.endswith(".pdf") or "/pdf" in normalized_path

    def fetch_document(self, url: str, *, authorization: str | None) -> CachedDocument:
        request = urllib_request.Request(
            url,
            headers=self._build_request_headers(authorization),
            method="GET",
        )

        try:
            with urllib_request.urlopen(request, timeout=20) as response:
                payload = response.read()
                content_type = response.headers.get("Content-Type", "application/octet-stream")
                normalized_type = content_type.split(";", 1)[0].strip().lower() or "application/octet-stream"
                filename = self._resolve_filename(
                    url,
                    normalized_type,
                    response.headers.get("Content-Disposition", ""),
                )
        except urllib_error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace").strip()
            message = detail or exc.reason or "falha de autenticação ou acesso ao documento"
            raise RuntimeError(f"Servidor respondeu HTTP {exc.code}: {message}") from exc
        except Exception as exc:
            raise RuntimeError(f"Falha ao baixar documento remoto: {exc}") from exc

        local_path = self.cache_dir / filename
        local_path.write_bytes(payload)

        return CachedDocument(
            url=url,
            filename=filename,
            local_path=str(local_path),
            content_type=normalized_type,
            size_bytes=len(payload),
        )

    def fetch_text_document(self, url: str, *, authorization: str | None) -> str:
        request = urllib_request.Request(
            url,
            headers=self._build_request_headers(authorization),
            method="GET",
        )

        try:
            with urllib_request.urlopen(request, timeout=20) as response:
                payload = response.read()
                charset = response.headers.get_content_charset() or "utf-8"
        except urllib_error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace").strip()
            message = detail or exc.reason or "falha de autenticação ou acesso ao documento"
            raise RuntimeError(f"Servidor respondeu HTTP {exc.code}: {message}") from exc
        except Exception as exc:
            raise RuntimeError(f"Falha ao baixar conteúdo remoto: {exc}") from exc

        return payload.decode(charset, errors="replace")

    def send_zpl_to_label_printer(self, zpl_content: str) -> str:
        if not self.is_label_printer_configured():
            raise RuntimeError(
                "Nenhuma impressora de etiqueta foi configurada no Hub. Informe host e porta da impressora ZPL."
            )

        target = self.get_label_printer_target()
        try:
            with socket.create_connection(
                (self.config.label_printer_host, self.config.label_printer_port),
                timeout=8,
            ) as printer_socket:
                printer_socket.sendall(zpl_content.encode("utf-8"))
        except Exception as exc:
            raise RuntimeError(f"Falha ao enviar ZPL para {target}: {exc}") from exc

        return target

    def build_status(self) -> AgentStatus:
        return AgentStatus(
            module="agent",
            server_url=self.config.base_url,
            agent_url=self.config.agent_url,
            label_printer_target=self.get_label_printer_target(),
            machine_name=socket.gethostname(),
            started_at=self.started_at,
            capabilities=self.capabilities,
        )

    def create_handler(self):
        service = self

        class Handler(BaseHTTPRequestHandler):
            def _read_json_payload(self) -> dict[str, object] | None:
                content_length = int(self.headers.get("Content-Length", "0"))
                raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"

                try:
                    return json.loads(raw_body.decode("utf-8"))
                except json.JSONDecodeError:
                    self._send_json(
                        {
                            "status": "error",
                            "detail": "Payload JSON inválido.",
                        },
                        status=HTTPStatus.BAD_REQUEST,
                    )
                    return None

            def _send_json(self, payload: dict[str, object], status: HTTPStatus = HTTPStatus.OK) -> None:
                body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.end_headers()
                self.wfile.write(body)

            def _validate_url(self, url: str) -> bool:
                if not url:
                    self._send_json(
                        {
                            "status": "error",
                            "detail": "A URL é obrigatória.",
                        },
                        status=HTTPStatus.BAD_REQUEST,
                    )
                    return False

                if not service.is_allowed_url(url):
                    self._send_json(
                        {
                            "status": "error",
                            "detail": "A URL solicitada não pertence aos hosts permitidos do ambiente Venner.",
                        },
                        status=HTTPStatus.FORBIDDEN,
                    )
                    return False

                return True

            def do_OPTIONS(self) -> None:
                self.send_response(HTTPStatus.NO_CONTENT)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.end_headers()

            def do_GET(self) -> None:
                if self.path == "/health":
                    self._send_json(
                        {
                            "status": "ok",
                            "module": "agent",
                            "agent_url": service.config.agent_url,
                            "server_url": service.config.base_url,
                        }
                    )
                    return

                if self.path == "/status":
                    self._send_json(asdict(service.build_status()))
                    return

                if self.path == "/capabilities":
                    self._send_json(asdict(service.capabilities))
                    return

                self._send_json(
                    {
                        "status": "error",
                        "detail": f"Rota {self.path} não encontrada.",
                    },
                    status=HTTPStatus.NOT_FOUND,
                )

            def do_POST(self) -> None:
                if self.path == "/actions/open-document":
                    payload = self._read_json_payload()
                    if payload is None:
                        return

                    url = str(payload.get("url", "")).strip()
                    prefer_app_mode = bool(payload.get("prefer_app_mode", True))
                    width = payload.get("width")
                    height = payload.get("height")
                    document_kind = str(payload.get("document_kind", "auto")).strip() or "auto"
                    authorization = service._normalize_authorization(payload.get("authorization"))

                    if not self._validate_url(url):
                        return

                    try:
                        width = int(width) if width is not None else None
                        height = int(height) if height is not None else None

                        if service._should_handle_locally(document_kind=document_kind, url=url):
                            document = service.fetch_document(url, authorization=authorization)
                            service.open_local_file(Path(document.local_path))
                            self._send_json(
                                {
                                    "status": "ok",
                                    "detail": "Documento aberto localmente pelo Agent.",
                                    "mode": "local_file",
                                    **asdict(document),
                                }
                            )
                            return

                        service.open_url(url, prefer_app_mode=prefer_app_mode, width=width, height=height)
                    except Exception as exc:
                        self._send_json(
                            {
                                "status": "error",
                                "detail": f"Falha ao abrir documento no desktop: {exc}",
                            },
                            status=HTTPStatus.INTERNAL_SERVER_ERROR,
                        )
                        return

                    self._send_json(
                        {
                            "status": "ok",
                            "detail": "Documento aberto no shell desktop.",
                            "mode": "browser",
                            "url": url,
                        }
                    )
                    return

                if self.path == "/actions/open-url":
                    payload = self._read_json_payload()
                    if payload is None:
                        return

                    url = str(payload.get("url", "")).strip()
                    prefer_app_mode = bool(payload.get("prefer_app_mode", True))
                    width = payload.get("width")
                    height = payload.get("height")

                    if not self._validate_url(url):
                        return

                    try:
                        width = int(width) if width is not None else None
                        height = int(height) if height is not None else None
                        service.open_url(url, prefer_app_mode=prefer_app_mode, width=width, height=height)
                    except Exception as exc:
                        self._send_json(
                            {
                                "status": "error",
                                "detail": f"Falha ao abrir URL no desktop: {exc}",
                            },
                            status=HTTPStatus.INTERNAL_SERVER_ERROR,
                        )
                        return

                    self._send_json(
                        {
                            "status": "ok",
                            "detail": "URL aberta com sucesso no shell desktop.",
                            "mode": "browser",
                            "url": url,
                        }
                    )
                    return

                if self.path == "/actions/print-document":
                    payload = self._read_json_payload()
                    if payload is None:
                        return

                    url = str(payload.get("url", "")).strip()
                    width = payload.get("width")
                    height = payload.get("height")
                    document_kind = str(payload.get("document_kind", "auto")).strip() or "auto"
                    authorization = service._normalize_authorization(payload.get("authorization"))
                    prefer_browser_print = bool(payload.get("prefer_browser_print", False))

                    if not self._validate_url(url):
                        return

                    try:
                        width = int(width) if width is not None else None
                        height = int(height) if height is not None else None

                        if not prefer_browser_print and service._should_handle_locally(document_kind=document_kind, url=url):
                            document = service.fetch_document(url, authorization=authorization)
                            service.print_local_file(Path(document.local_path))
                            self._send_json(
                                {
                                    "status": "ok",
                                    "detail": "Documento enviado para impressão local pelo Agent.",
                                    "mode": "local_file",
                                    **asdict(document),
                                }
                            )
                            return

                        service.open_url(
                            url,
                            prefer_app_mode=True,
                            width=width,
                            height=height,
                            kiosk_printing=True,
                        )
                    except Exception as exc:
                        self._send_json(
                            {
                                "status": "error",
                                "detail": f"Falha ao enviar documento para impressão: {exc}",
                            },
                            status=HTTPStatus.INTERNAL_SERVER_ERROR,
                        )
                        return

                    self._send_json(
                        {
                            "status": "ok",
                            "detail": "Documento encaminhado para impressão pelo shell desktop.",
                            "mode": "browser",
                            "url": url,
                        }
                    )
                    return

                if self.path == "/actions/print-zpl":
                    payload = self._read_json_payload()
                    if payload is None:
                        return

                    url = str(payload.get("url", "")).strip()
                    authorization = service._normalize_authorization(payload.get("authorization"))

                    if not self._validate_url(url):
                        return

                    try:
                        zpl_content = service.fetch_text_document(url, authorization=authorization)
                        printer_target = service.send_zpl_to_label_printer(zpl_content)
                    except Exception as exc:
                        self._send_json(
                            {
                                "status": "error",
                                "detail": f"Falha ao imprimir etiqueta ZPL: {exc}",
                            },
                            status=HTTPStatus.INTERNAL_SERVER_ERROR,
                        )
                        return

                    self._send_json(
                        {
                            "status": "ok",
                            "detail": "Etiqueta ZPL enviada para a impressora configurada no Agent.",
                            "mode": "raw_tcp",
                            "printer_target": printer_target,
                            "url": url,
                        }
                    )
                    return

                if self.path == "/actions/print-url":
                    payload = self._read_json_payload()
                    if payload is None:
                        return

                    url = str(payload.get("url", "")).strip()
                    width = payload.get("width")
                    height = payload.get("height")

                    if not self._validate_url(url):
                        return

                    try:
                        width = int(width) if width is not None else None
                        height = int(height) if height is not None else None
                        service.open_url(
                            url,
                            prefer_app_mode=True,
                            width=width,
                            height=height,
                            kiosk_printing=True,
                        )
                    except Exception as exc:
                        self._send_json(
                            {
                                "status": "error",
                                "detail": f"Falha ao enviar documento para impressão: {exc}",
                            },
                            status=HTTPStatus.INTERNAL_SERVER_ERROR,
                        )
                        return

                    self._send_json(
                        {
                            "status": "ok",
                            "detail": "Documento encaminhado para impressão pelo shell desktop.",
                            "mode": "browser",
                            "url": url,
                        }
                    )
                    return

                if self.path == "/actions/ping":
                    self._send_json(
                        {
                            "status": "ok",
                            "detail": "Bridge local alcançada com sucesso.",
                        }
                    )
                    return

                self._send_json(
                    {
                        "status": "error",
                        "detail": f"Ação {self.path} ainda não foi implementada.",
                    },
                    status=HTTPStatus.NOT_IMPLEMENTED,
                )

            def log_message(self, format: str, *args) -> None:  # noqa: A003
                return

        return Handler

    def serve_forever(self) -> None:
        server = ThreadingHTTPServer((self.config.agent_host, self.config.agent_port), self.create_handler())
        try:
            server.serve_forever()
        finally:
            server.server_close()


def build_status(config: AppConfig) -> AgentStatus:
    return VennerAgentService(config).build_status()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Venner Agent")
    parser.add_argument("--print-status", action="store_true", help="Imprime o status atual e encerra.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config = load_config()

    if args.print_status:
        print(json.dumps(asdict(build_status(config)), indent=2, ensure_ascii=False))
        return 0

    service = VennerAgentService(config)
    service.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
