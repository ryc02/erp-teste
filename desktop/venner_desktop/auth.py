from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass

from .config import AppConfig


@dataclass(frozen=True)
class HubSession:
    access_token: str
    token_type: str
    username: str
    display_name: str
    role_name: str
    permissoes: str | None = None


def _read_json_response(request: urllib.request.Request, timeout_seconds: float) -> dict[str, object]:
    with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
        body = response.read().decode("utf-8", errors="replace").strip()
        if not body:
            return {}
        return json.loads(body)


def _extract_error_detail(raw_detail: str, fallback: str) -> str:
    detail = raw_detail.strip()
    if not detail:
        return fallback

    try:
        payload = json.loads(detail)
    except json.JSONDecodeError:
        return detail

    if isinstance(payload, dict):
        return str(payload.get("detail", detail)).strip() or fallback
    return detail


def authenticate_hub_session(
    config: AppConfig,
    *,
    username: str,
    password: str,
    timeout_seconds: float = 8.0,
) -> HubSession:
    login_payload = urllib.parse.urlencode(
        {
            "username": username,
            "password": password,
        }
    ).encode("utf-8")

    login_request = urllib.request.Request(
        f"{config.base_url}/api/v1/auth/login",
        data=login_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        login_response = _read_json_response(login_request, timeout_seconds)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace").strip()
        raise RuntimeError(_extract_error_detail(detail, f"Falha no login ({exc.code}).")) from exc
    except Exception as exc:
        raise RuntimeError(f"Não foi possível autenticar no servidor: {exc}") from exc

    access_token = str(login_response.get("access_token", "")).strip()
    token_type = str(login_response.get("token_type", "bearer")).strip() or "bearer"
    if not access_token:
        raise RuntimeError("O servidor não retornou um token de acesso.")

    profile_request = urllib.request.Request(
        f"{config.base_url}/api/v1/usuarios/me",
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET",
    )

    display_name = username
    role_name = ""
    resolved_username = username

    try:
        profile_response = _read_json_response(profile_request, timeout_seconds)
        resolved_username = str(profile_response.get("username", username)).strip() or username
        display_name = str(
            profile_response.get("nome_completo", resolved_username)
        ).strip() or resolved_username
        permissoes = str(profile_response.get("permissoes", "")).strip() or None

        role_payload = profile_response.get("role")
        if isinstance(role_payload, dict):
            role_name = str(role_payload.get("nome", "")).strip()
            # Se não houver permissões granulares no usuário, usa as da Role
            if not permissoes:
                permissoes = str(role_payload.get("permissoes", "")).strip() or None
    except Exception:
        # Mantemos a sessão mesmo sem o perfil, usando o username informado.
        permissoes = None
        pass

    return HubSession(
        access_token=access_token,
        token_type=token_type,
        username=resolved_username,
        display_name=display_name,
        role_name=role_name,
        permissoes=permissoes,
    )
