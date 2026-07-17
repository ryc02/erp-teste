import json
import os
from base64 import b64encode
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException


class CpfLookupService:
    DEFAULT_TIMEOUT = 20
    USER_AGENT = "ERP-Venner/2.1"
    DEFAULT_TOKEN_URL = "https://gateway.apiserpro.serpro.gov.br/token"

    @staticmethod
    def normalize_digits(value: Optional[str], *, limit: Optional[int] = None) -> str:
        digits = "".join(ch for ch in str(value or "") if ch.isdigit())
        return digits[:limit] if limit is not None else digits

    @classmethod
    def normalize_cpf(cls, value: Optional[str]) -> str:
        return cls.normalize_digits(value, limit=11)

    @classmethod
    def consultar(cls, cpf: str) -> dict[str, Any]:
        cpf_normalizado = cls.normalize_cpf(cpf)
        if len(cpf_normalizado) != 11:
            raise HTTPException(status_code=400, detail="Informe um CPF com 11 dígitos.")

        api_template = os.getenv("CPF_API_URL_TEMPLATE")
        if not api_template:
            raise HTTPException(
                status_code=503,
                detail="A consulta oficial de CPF não está configurada no servidor. Preencha CPF_API_URL_TEMPLATE no .env.",
            )

        provider_name = os.getenv("CPF_API_PROVIDER_NAME", "Consulta CPF")
        token = os.getenv("CPF_API_TOKEN")
        auth_header = os.getenv("CPF_API_AUTH_HEADER", "Authorization")
        auth_scheme = os.getenv("CPF_API_AUTH_SCHEME", "Bearer").strip()

        if not token:
            token = cls._obter_token_oauth(provider_name=provider_name)

        headers = cls._build_headers(token=token, auth_header=auth_header, auth_scheme=auth_scheme)
        url = api_template.format(cpf=cpf_normalizado) if "{cpf}" in api_template else f"{api_template.rstrip('/')}/{cpf_normalizado}"
        payload = cls._request_json(url, headers=headers, provider_name=provider_name)
        return cls._normalize_payload(payload, cpf=cpf_normalizado, provider_name=provider_name)

    @classmethod
    def _build_headers(
        cls,
        *,
        token: Optional[str] = None,
        auth_header: str = "Authorization",
        auth_scheme: str = "Bearer",
    ) -> dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": cls.USER_AGENT,
        }

        if token:
            headers[auth_header] = f"{auth_scheme} {token}".strip() if auth_scheme else token

        return headers

    @classmethod
    def _obter_token_oauth(cls, *, provider_name: str) -> str:
        consumer_key = os.getenv("CPF_API_CONSUMER_KEY")
        consumer_secret = os.getenv("CPF_API_CONSUMER_SECRET")
        token_url = os.getenv("CPF_API_TOKEN_URL", cls.DEFAULT_TOKEN_URL)
        scope = os.getenv("CPF_API_SCOPE")

        if not consumer_key or not consumer_secret:
            raise HTTPException(
                status_code=503,
                detail=(
                    "A consulta oficial de CPF precisa de autenticação. "
                    "Preencha CPF_API_CONSUMER_KEY e CPF_API_CONSUMER_SECRET no .env."
                ),
            )

        credentials = f"{consumer_key}:{consumer_secret}".encode("utf-8")
        authorization = b64encode(credentials).decode("ascii")
        form_payload = {"grant_type": "client_credentials"}
        if scope:
            form_payload["scope"] = scope

        request = Request(
            token_url,
            data=urlencode(form_payload).encode("utf-8"),
            headers={
                "Authorization": f"Basic {authorization}",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "User-Agent": cls.USER_AGENT,
            },
            method="POST",
        )

        try:
            with urlopen(request, timeout=cls.DEFAULT_TIMEOUT) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code in {401, 403}:
                raise HTTPException(
                    status_code=503,
                    detail=f"O provedor {provider_name} recusou o Consumer Key/Secret configurado para CPF.",
                )
            raise HTTPException(
                status_code=503,
                detail=f"Não foi possível autenticar no provedor {provider_name} para consultar CPF.",
            )
        except URLError:
            raise HTTPException(
                status_code=503,
                detail=f"Não foi possível autenticar no provedor {provider_name} para consultar CPF.",
            )

        access_token = payload.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=503,
                detail=f"O provedor {provider_name} não retornou access_token para a consulta de CPF.",
            )

        return access_token

    @classmethod
    def _request_json(cls, url: str, *, headers: dict[str, str], provider_name: str) -> dict[str, Any]:
        request = Request(url, headers=headers)

        try:
            with urlopen(request, timeout=cls.DEFAULT_TIMEOUT) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code == 404:
                raise HTTPException(status_code=404, detail="CPF não encontrado.")

            if exc.code in {401, 403}:
                raise HTTPException(
                    status_code=503,
                    detail=f"O provedor {provider_name} recusou a autenticação da consulta de CPF.",
                )

            raise HTTPException(
                status_code=503,
                detail=f"Não foi possível consultar o CPF no provedor {provider_name}.",
            )
        except URLError:
            raise HTTPException(status_code=503, detail="Não foi possível consultar o CPF no momento.")

    @staticmethod
    def _clean_text(value: Any) -> Optional[str]:
        if value is None:
            return None

        text = str(value).strip()
        return text or None

    @classmethod
    def _pick(cls, *values: Any) -> Optional[str]:
        for value in values:
            cleaned = cls._clean_text(value)
            if cleaned:
                return cleaned
        return None

    @classmethod
    def _normalize_payload(cls, payload: dict[str, Any], *, cpf: str, provider_name: str) -> dict[str, Any]:
        return {
            "fonte": provider_name,
            "cpf": cpf,
            "nome": cls._pick(
                payload.get("nome"),
                payload.get("nome_social"),
                payload.get("nomePessoaFisica"),
                payload.get("nome_contribuinte"),
            ),
            "nome_social": cls._pick(
                payload.get("nome_social"),
                payload.get("nomeSocial"),
            ),
            "situacao_cadastral": cls._pick(
                payload.get("situacao_cadastral"),
                payload.get("descricao_situacao_cadastral"),
                payload.get("status"),
            ),
        }
