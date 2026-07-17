import json
import os
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException


class CnpjLookupService:
    DEFAULT_TIMEOUT = 20
    DEFAULT_PROVIDER_NAME = "CNPJ WS"
    PUBLIC_PROVIDER_URL = "https://publica.cnpj.ws/cnpj/{cnpj}"
    USER_AGENT = "ERP-Venner/2.1"

    @staticmethod
    def normalize_digits(value: Optional[str], *, limit: Optional[int] = None) -> str:
        digits = "".join(ch for ch in str(value or "") if ch.isdigit())
        return digits[:limit] if limit is not None else digits

    @classmethod
    def normalize_cnpj(cls, value: Optional[str]) -> str:
        return cls.normalize_digits(value, limit=14)

    @classmethod
    def consultar(cls, cnpj: str) -> dict[str, Any]:
        cnpj_normalizado = cls.normalize_cnpj(cnpj)
        if len(cnpj_normalizado) != 14:
            raise HTTPException(status_code=400, detail="Informe um CNPJ com 14 dígitos.")

        api_template = os.getenv("CNPJ_API_URL_TEMPLATE")
        if api_template:
            return cls._consultar_custom(cnpj_normalizado, api_template)

        return cls._consultar_publico(cnpj_normalizado)

    @classmethod
    def _consultar_custom(cls, cnpj: str, url_template: str) -> dict[str, Any]:
        provider_name = os.getenv("CNPJ_API_PROVIDER_NAME", "Consulta CNPJ")
        token = os.getenv("CNPJ_API_TOKEN")
        auth_header = os.getenv("CNPJ_API_AUTH_HEADER", "Authorization")
        auth_scheme = os.getenv("CNPJ_API_AUTH_SCHEME", "Bearer").strip()

        headers = cls._build_headers(token=token, auth_header=auth_header, auth_scheme=auth_scheme)
        url = url_template.format(cnpj=cnpj) if "{cnpj}" in url_template else f"{url_template.rstrip('/')}/{cnpj}"
        payload = cls._request_json(url, headers=headers, provider_name=provider_name)
        return cls._normalize_payload(payload, cnpj=cnpj, provider_name=provider_name)

    @classmethod
    def _consultar_publico(cls, cnpj: str) -> dict[str, Any]:
        payload = cls._request_json(
            cls.PUBLIC_PROVIDER_URL.format(cnpj=cnpj),
            headers=cls._build_headers(),
            provider_name=cls.DEFAULT_PROVIDER_NAME,
        )
        return cls._normalize_payload(payload, cnpj=cnpj, provider_name=cls.DEFAULT_PROVIDER_NAME)

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
    def _request_json(cls, url: str, *, headers: dict[str, str], provider_name: str) -> dict[str, Any]:
        request = Request(url, headers=headers)

        try:
            with urlopen(request, timeout=cls.DEFAULT_TIMEOUT) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code == 404:
                raise HTTPException(status_code=404, detail="CNPJ não encontrado.")

            if exc.code in {401, 403}:
                raise HTTPException(
                    status_code=503,
                    detail=f"O provedor {provider_name} recusou a autenticação da consulta de CNPJ.",
                )

            raise HTTPException(
                status_code=503,
                detail=f"Não foi possível consultar o CNPJ no provedor {provider_name}.",
            )
        except URLError:
            raise HTTPException(status_code=503, detail="Não foi possível consultar o CNPJ no momento.")

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
    def _compose_logradouro(cls, *parts: Any) -> Optional[str]:
        chunks: list[str] = []
        for part in parts:
            cleaned = cls._clean_text(part)
            if cleaned:
                chunks.append(cleaned)

        if not chunks:
            return None

        return " ".join(chunks)

    @classmethod
    def _compose_phone(cls, *parts: Any) -> Optional[str]:
        for part in parts:
            cleaned = cls._clean_text(part)
            if cleaned:
                return cleaned
        return None

    @classmethod
    def _normalize_payload(cls, payload: dict[str, Any], *, cnpj: str, provider_name: str) -> dict[str, Any]:
        estabelecimento = payload.get("estabelecimento")
        estabelecimento = estabelecimento if isinstance(estabelecimento, dict) else {}

        cidade_info = estabelecimento.get("cidade")
        cidade_info = cidade_info if isinstance(cidade_info, dict) else {}

        estado_info = estabelecimento.get("estado")
        estado_info = estado_info if isinstance(estado_info, dict) else {}

        telefone = cls._compose_phone(
            estabelecimento.get("telefone1"),
            estabelecimento.get("telefone"),
            payload.get("telefone"),
            payload.get("ddd_telefone_1"),
        )

        return {
            "fonte": provider_name,
            "cnpj": cnpj,
            "razao_social": cls._pick(
                payload.get("razao_social"),
                payload.get("nome_empresarial"),
            ),
            "nome_fantasia": cls._pick(
                estabelecimento.get("nome_fantasia"),
                payload.get("nome_fantasia"),
            ),
            "cep": cls.normalize_digits(cls._pick(estabelecimento.get("cep"), payload.get("cep")), limit=8),
            "endereco": cls._compose_logradouro(
                estabelecimento.get("tipo_logradouro"),
                payload.get("descricao_tipo_logradouro"),
                estabelecimento.get("logradouro"),
                payload.get("logradouro"),
            ),
            "numero": cls._pick(estabelecimento.get("numero"), payload.get("numero")),
            "complemento": cls._pick(estabelecimento.get("complemento"), payload.get("complemento")),
            "bairro": cls._pick(estabelecimento.get("bairro"), payload.get("bairro")),
            "cidade": cls._pick(
                cidade_info.get("nome"),
                estabelecimento.get("cidade"),
                payload.get("municipio"),
                payload.get("cidade"),
                payload.get("localidade"),
            ),
            "uf": cls._pick(
                estado_info.get("sigla"),
                estabelecimento.get("uf"),
                payload.get("uf"),
            ),
            "email": cls._pick(estabelecimento.get("email"), payload.get("email")),
            "telefone": telefone,
            "situacao_cadastral": cls._pick(
                estabelecimento.get("situacao_cadastral"),
                payload.get("descricao_situacao_cadastral"),
                payload.get("situacao_cadastral"),
            ),
        }
