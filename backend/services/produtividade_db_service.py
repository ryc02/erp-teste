from __future__ import annotations

import unicodedata
from calendar import monthrange
from collections import Counter, defaultdict
from datetime import date, timedelta
from typing import Any

from sqlalchemy.orm import Session, joinedload

import models
import schemas


MONTH_NAMES = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
}

OCCURRENCE_LABELS = {
    "PRODUCAO": "Produção",
    "FALTA": "Falta",
    "OUTRAS_ATIVIDADES": "Outras atividades",
    "SEPAROU_PEDIDO": "Separou pedido",
    "APOIO": "Apoio",
    "TREINAMENTO": "Treinamento",
}


def normalize_key(value: str) -> str:
    text = unicodedata.normalize("NFKD", str(value or "").strip())
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = " ".join(text.upper().split())
    return text


def normalize_occurrence(value: str | None) -> str:
    raw = normalize_key(value or "PRODUCAO")
    return raw.replace(" ", "_") or "PRODUCAO"


def month_bounds(year: int, month: int) -> tuple[date, date]:
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def daterange(date_from: date, date_to: date):
    current = date_from
    while current <= date_to:
        yield current
        current += timedelta(days=1)


class ProdutividadeDBService:
    @classmethod
    def list_sectors(cls, db: Session) -> list[models.SetorProdutividade]:
        return (
            db.query(models.SetorProdutividade)
            .order_by(models.SetorProdutividade.nome.asc())
            .all()
        )

    @classmethod
    def list_collaborators(
        cls,
        db: Session,
        setor_id: int | None = None,
    ) -> list[models.ColaboradorProdutividade]:
        query = (
            db.query(models.ColaboradorProdutividade)
            .options(joinedload(models.ColaboradorProdutividade.setor))
        )
        if setor_id:
            query = query.filter(models.ColaboradorProdutividade.setor_id == setor_id)
        return (
            query.order_by(
                models.ColaboradorProdutividade.setor_id.asc(),
                models.ColaboradorProdutividade.nome.asc(),
            ).all()
        )

    @classmethod
    def upsert_sector(
        cls,
        db: Session,
        payload: schemas.SetorProdutividadeCreate,
    ) -> models.SetorProdutividade:
        nome = " ".join(payload.nome.strip().split())
        if not nome:
            raise ValueError("Informe o nome do setor.")
        if payload.meta_diaria < 0:
            raise ValueError("A meta diária não pode ser negativa.")
        if payload.meta_colaborador_diaria < 0:
            raise ValueError("A meta individual diária não pode ser negativa.")

        nome_chave = normalize_key(nome)
        setor = (
            db.query(models.SetorProdutividade)
            .filter(models.SetorProdutividade.nome_chave == nome_chave)
            .first()
        )

        if setor:
            setor.nome = nome
            setor.meta_diaria = payload.meta_diaria
            setor.meta_colaborador_diaria = payload.meta_colaborador_diaria
            setor.ativo = payload.ativo
        else:
            setor = models.SetorProdutividade(
                nome=nome,
                nome_chave=nome_chave,
                meta_diaria=payload.meta_diaria,
                meta_colaborador_diaria=payload.meta_colaborador_diaria,
                ativo=payload.ativo,
            )
            db.add(setor)

        db.commit()
        db.refresh(setor)
        return setor

    @classmethod
    def upsert_collaborator(
        cls,
        db: Session,
        payload: schemas.ColaboradorProdutividadeCreate,
    ) -> models.ColaboradorProdutividade:
        setor = (
            db.query(models.SetorProdutividade)
            .filter(models.SetorProdutividade.id == payload.setor_id)
            .first()
        )
        if not setor:
            raise ValueError("Setor não encontrado.")

        nome = " ".join(payload.nome.strip().split())
        if not nome:
            raise ValueError("Informe o nome do colaborador.")

        nome_chave = normalize_key(nome)
        colaborador = (
            db.query(models.ColaboradorProdutividade)
            .filter(models.ColaboradorProdutividade.setor_id == payload.setor_id)
            .filter(models.ColaboradorProdutividade.nome_chave == nome_chave)
            .first()
        )

        if colaborador:
            colaborador.nome = nome
            colaborador.ativo = payload.ativo
        else:
            colaborador = models.ColaboradorProdutividade(
                setor_id=payload.setor_id,
                nome=nome,
                nome_chave=nome_chave,
                ativo=payload.ativo,
            )
            db.add(colaborador)

        db.commit()
        db.refresh(colaborador)
        return colaborador

    @classmethod
    def ensure_collaborator(
        cls,
        db: Session,
        setor_id: int,
        colaborador_id: int | None = None,
        colaborador_nome: str | None = None,
    ) -> models.ColaboradorProdutividade:
        if colaborador_id:
            colaborador = (
                db.query(models.ColaboradorProdutividade)
                .filter(models.ColaboradorProdutividade.id == colaborador_id)
                .first()
            )
            if not colaborador:
                raise ValueError("Colaborador não encontrado.")
            if colaborador.setor_id != setor_id:
                raise ValueError("O colaborador selecionado não pertence ao setor informado.")
            if not colaborador.ativo:
                raise ValueError("O colaborador selecionado está inativo.")
            return colaborador

        nome = " ".join((colaborador_nome or "").strip().split())
        if not nome:
            raise ValueError("Informe o colaborador.")

        nome_chave = normalize_key(nome)
        colaborador = (
            db.query(models.ColaboradorProdutividade)
            .filter(models.ColaboradorProdutividade.setor_id == setor_id)
            .filter(models.ColaboradorProdutividade.nome_chave == nome_chave)
            .first()
        )
        if colaborador:
            if not colaborador.ativo:
                raise ValueError("O colaborador informado está inativo.")
            return colaborador

        colaborador = models.ColaboradorProdutividade(
            setor_id=setor_id,
            nome=nome,
            nome_chave=nome_chave,
            ativo=True,
        )
        db.add(colaborador)
        db.flush()
        return colaborador

    @classmethod
    def upsert_entry(
        cls,
        db: Session,
        payload: schemas.ApontamentoProdutividadeCreate,
        username: str | None = None,
    ) -> models.ApontamentoProdutividade:
        setor = (
            db.query(models.SetorProdutividade)
            .filter(models.SetorProdutividade.id == payload.setor_id)
            .first()
        )
        if not setor:
            raise ValueError("Setor não encontrado.")

        if payload.quantidade < 0:
            raise ValueError("A quantidade não pode ser negativa.")

        colaborador = cls.ensure_collaborator(
            db=db,
            setor_id=payload.setor_id,
            colaborador_id=payload.colaborador_id,
            colaborador_nome=payload.colaborador_nome,
        )
        colaborador_nome = colaborador.nome
        colaborador_chave = colaborador.nome_chave
        ocorrencia = normalize_occurrence(payload.ocorrencia)

        entry = (
            db.query(models.ApontamentoProdutividade)
            .filter(models.ApontamentoProdutividade.data_referencia == payload.data_referencia)
            .filter(models.ApontamentoProdutividade.setor_id == payload.setor_id)
            .filter(models.ApontamentoProdutividade.colaborador_chave == colaborador_chave)
            .first()
        )

        if entry:
            entry.colaborador_id = colaborador.id
            entry.colaborador_nome = colaborador_nome
            entry.colaborador_chave = colaborador_chave
            entry.quantidade = payload.quantidade
            entry.ocorrencia = ocorrencia
            entry.observacao = payload.observacao
            entry.criado_por = username or entry.criado_por
        else:
            entry = models.ApontamentoProdutividade(
                data_referencia=payload.data_referencia,
                setor_id=payload.setor_id,
                colaborador_id=colaborador.id,
                colaborador_nome=colaborador_nome,
                colaborador_chave=colaborador_chave,
                quantidade=payload.quantidade,
                ocorrencia=ocorrencia,
                observacao=payload.observacao,
                criado_por=username,
            )
            db.add(entry)

        db.commit()
        db.refresh(entry)
        return (
            db.query(models.ApontamentoProdutividade)
            .options(
                joinedload(models.ApontamentoProdutividade.setor),
                joinedload(models.ApontamentoProdutividade.colaborador),
            )
            .filter(models.ApontamentoProdutividade.id == entry.id)
            .first()
        )

    @classmethod
    def delete_entry(cls, db: Session, entry_id: int) -> None:
        entry = (
            db.query(models.ApontamentoProdutividade)
            .filter(models.ApontamentoProdutividade.id == entry_id)
            .first()
        )
        if not entry:
            raise ValueError("Apontamento não encontrado.")
        db.delete(entry)
        db.commit()

    @classmethod
    def update_sector(
        cls, db: Session, sector_id: int, payload: schemas.SetorProdutividadeUpdate
    ) -> models.SetorProdutividade:
        setor = db.query(models.SetorProdutividade).filter(models.SetorProdutividade.id == sector_id).first()
        if not setor:
            raise ValueError("Setor não encontrado.")
        
        if payload.nome is not None:
            nome = " ".join(payload.nome.strip().split())
            if not nome:
                raise ValueError("Informe o nome do setor.")
            setor.nome = nome
            setor.nome_chave = normalize_key(nome)
        
        if payload.meta_diaria is not None:
            if payload.meta_diaria < 0:
                raise ValueError("A meta diária não pode ser negativa.")
            setor.meta_diaria = payload.meta_diaria
            
        if payload.meta_colaborador_diaria is not None:
            if payload.meta_colaborador_diaria < 0:
                raise ValueError("A meta individual diária não pode ser negativa.")
            setor.meta_colaborador_diaria = payload.meta_colaborador_diaria
            
        if payload.ativo is not None:
            setor.ativo = payload.ativo
            
        db.commit()
        db.refresh(setor)
        return setor

    @classmethod
    def update_collaborator(
        cls, db: Session, collab_id: int, payload: schemas.ColaboradorProdutividadeUpdate
    ) -> models.ColaboradorProdutividade:
        colab = db.query(models.ColaboradorProdutividade).filter(models.ColaboradorProdutividade.id == collab_id).first()
        if not colab:
            raise ValueError("Colaborador não encontrado.")
            
        if payload.nome is not None:
            nome = " ".join(payload.nome.strip().split())
            if not nome:
                raise ValueError("Informe o nome do colaborador.")
            colab.nome = nome
            colab.nome_chave = normalize_key(nome)
            
        if payload.setor_id is not None:
            setor = db.query(models.SetorProdutividade).filter(models.SetorProdutividade.id == payload.setor_id).first()
            if not setor:
                raise ValueError("Setor não encontrado.")
            colab.setor_id = payload.setor_id
            
        if payload.ativo is not None:
            colab.ativo = payload.ativo
            
        db.commit()
        db.refresh(colab)
        return colab

    @classmethod
    def update_entry(
        cls, db: Session, entry_id: int, payload: schemas.ApontamentoProdutividadeUpdate, username: str | None = None
    ) -> models.ApontamentoProdutividade:
        entry = db.query(models.ApontamentoProdutividade).filter(models.ApontamentoProdutividade.id == entry_id).first()
        if not entry:
            raise ValueError("Apontamento não encontrado.")
            
        if payload.data_referencia is not None:
            entry.data_referencia = payload.data_referencia
            
        if payload.quantidade is not None:
            if payload.quantidade < 0:
                raise ValueError("A quantidade não pode ser negativa.")
            entry.quantidade = payload.quantidade
            
        if payload.ocorrencia is not None:
            entry.ocorrencia = normalize_occurrence(payload.ocorrencia)
            
        if payload.observacao is not None:
            entry.observacao = payload.observacao
            
        # Para alterar setor ou colaborador precisamos garantir as chaves
        if payload.setor_id is not None or payload.colaborador_id is not None or payload.colaborador_nome is not None:
            setor_id = payload.setor_id if payload.setor_id is not None else entry.setor_id
            colaborador_id = payload.colaborador_id if payload.colaborador_id is not None else entry.colaborador_id
            colaborador_nome = payload.colaborador_nome if payload.colaborador_nome is not None else entry.colaborador_nome
            
            if payload.setor_id is not None:
                setor = db.query(models.SetorProdutividade).filter(models.SetorProdutividade.id == setor_id).first()
                if not setor:
                    raise ValueError("Setor não encontrado.")
                entry.setor_id = setor_id
                
            colab = cls.ensure_collaborator(db=db, setor_id=setor_id, colaborador_id=colaborador_id, colaborador_nome=colaborador_nome)
            entry.colaborador_id = colab.id
            entry.colaborador_nome = colab.nome
            entry.colaborador_chave = colab.nome_chave

        if username:
            entry.criado_por = username

        db.commit()
        db.refresh(entry)
        return (
            db.query(models.ApontamentoProdutividade)
            .options(
                joinedload(models.ApontamentoProdutividade.setor),
                joinedload(models.ApontamentoProdutividade.colaborador),
            )
            .filter(models.ApontamentoProdutividade.id == entry.id)
            .first()
        )

    @classmethod
    def build_dashboard(
        cls,
        db: Session,
        year: int,
        month: int,
        setor_id: int | None = None,
    ) -> dict[str, Any]:
        period_start, period_end = month_bounds(year, month)
        today = date.today()
        if year == today.year and month == today.month and today < period_end:
            period_end = today

        sectors_query = (
            db.query(models.SetorProdutividade)
            .filter(models.SetorProdutividade.ativo == True)
        )
        if setor_id:
            sectors_query = sectors_query.filter(models.SetorProdutividade.id == setor_id)

        sectors = sectors_query.order_by(models.SetorProdutividade.nome.asc()).all()
        entries_query = (
            db.query(models.ApontamentoProdutividade)
            .options(
                joinedload(models.ApontamentoProdutividade.setor),
                joinedload(models.ApontamentoProdutividade.colaborador),
            )
            .filter(models.ApontamentoProdutividade.data_referencia >= period_start)
            .filter(models.ApontamentoProdutividade.data_referencia <= period_end)
        )
        if setor_id:
            entries_query = entries_query.filter(models.ApontamentoProdutividade.setor_id == setor_id)

        entries = (
            entries_query
            .order_by(
                models.ApontamentoProdutividade.data_referencia.desc(),
                models.ApontamentoProdutividade.updated_at.desc(),
            )
            .all()
        )

        daily_group: dict[tuple[int, date], dict[str, Any]] = defaultdict(
            lambda: {"actual": 0.0, "notes": []}
        )
        collaborator_group: dict[tuple[int, str], dict[str, Any]] = {}
        sector_occurrences: dict[int, Counter[str]] = defaultdict(Counter)

        for entry in entries:
            group_key = (entry.setor_id, entry.data_referencia)
            daily_group[group_key]["actual"] += float(entry.quantidade or 0.0)

            occurrence_label = cls.occurrence_label(entry.ocorrencia)
            if entry.ocorrencia and entry.ocorrencia != "PRODUCAO":
                daily_group[group_key]["notes"].append(
                    f"{entry.colaborador_nome}: {occurrence_label}"
                )
                sector_occurrences[entry.setor_id][occurrence_label] += 1

            collaborator_key = (entry.setor_id, entry.colaborador_chave)
            collaborator_metrics = collaborator_group.setdefault(
                collaborator_key,
                {
                    "colaborador_id": entry.colaborador_id,
                    "setor": entry.setor.nome if entry.setor else f"Setor #{entry.setor_id}",
                    "colaborador": entry.colaborador_nome,
                    "producao_total": 0.0,
                    "dias_produtivos": 0,
                    "dias_zero": 0,
                    "meta_colaborador_diaria": float(entry.setor.meta_colaborador_diaria or 0.0) if entry.setor else 0.0,
                    "ocorrencias": Counter(),
                },
            )
            collaborator_metrics["producao_total"] += float(entry.quantidade or 0.0)
            if float(entry.quantidade or 0.0) > 0:
                collaborator_metrics["dias_produtivos"] += 1
            else:
                collaborator_metrics["dias_zero"] += 1
            if entry.ocorrencia and entry.ocorrencia != "PRODUCAO":
                collaborator_metrics["ocorrencias"][occurrence_label] += 1

        summaries: list[dict[str, Any]] = []
        daily_rows: list[dict[str, Any]] = []

        for sector in sectors:
            total_actual = 0.0
            total_ideal = 0.0
            days_planned = 0
            days_meeting = 0
            days_zero = 0

            for current_day in daterange(period_start, period_end):
                daily_data = daily_group[(sector.id, current_day)]
                actual = daily_data["actual"]
                has_occurrence = bool(daily_data["notes"])
                considered_day = current_day.weekday() < 5 or actual > 0 or has_occurrence
                if not considered_day:
                    continue

                theoretical = float(sector.meta_diaria or 0.0)
                percentual = (actual / theoretical) if theoretical > 0 else 0.0
                gap = actual - theoretical

                total_actual += actual
                total_ideal += theoretical
                days_planned += 1

                if theoretical > 0 and actual >= theoretical:
                    days_meeting += 1
                if actual == 0:
                    days_zero += 1

                daily_rows.append(
                    {
                        "setor": sector.nome,
                        "data": current_day.isoformat(),
                        "producao_real": actual,
                        "producao_teorica": theoretical,
                        "percentual": percentual,
                        "gap": gap,
                        "ocorrencias": " | ".join(daily_data["notes"]),
                    }
                )

            summaries.append(
                {
                    "setor_id": sector.id,
                    "setor": sector.nome,
                    "meta_diaria": float(sector.meta_diaria or 0.0),
                    "meta_colaborador_diaria": float(sector.meta_colaborador_diaria or 0.0),
                    "dias_planejados": days_planned,
                    "producao_real": total_actual,
                    "producao_teorica": total_ideal,
                    "percentual": (total_actual / total_ideal) if total_ideal > 0 else 0.0,
                    "media_real_dia": (total_actual / days_planned) if days_planned else 0.0,
                    "meta_media_dia": float(sector.meta_diaria or 0.0),
                    "dias_batendo_meta": days_meeting,
                    "dias_sem_producao": days_zero,
                    "ocorrencias_relevantes": ", ".join(
                        f"{label} ({count})"
                        for label, count in sorted(sector_occurrences[sector.id].items())
                    ),
                }
            )

        summaries.sort(key=lambda item: item["percentual"], reverse=True)
        daily_rows.sort(key=lambda item: (item["setor"], item["data"]))

        collaborators = []
        for metrics in collaborator_group.values():
            productive_days = metrics["dias_produtivos"]
            total = metrics["producao_total"]
            collaborators.append(
                {
                    "colaborador_id": metrics["colaborador_id"],
                    "setor": metrics["setor"],
                    "colaborador": metrics["colaborador"],
                    "producao_total": total,
                    "dias_produtivos": productive_days,
                    "media_dia_produtivo": (total / productive_days) if productive_days else 0.0,
                    "meta_colaborador_diaria": metrics["meta_colaborador_diaria"],
                    "percentual_meta_colaborador": (
                        ((total / productive_days) / metrics["meta_colaborador_diaria"])
                        if productive_days and metrics["meta_colaborador_diaria"] > 0
                        else 0.0
                    ),
                    "dias_zero": metrics["dias_zero"],
                    "ocorrencias": ", ".join(
                        f"{label} ({count})"
                        for label, count in sorted(metrics["ocorrencias"].items())
                    ),
                }
            )
        collaborators.sort(key=lambda item: item["producao_total"], reverse=True)

        recent_entries = [
            {
                "id": entry.id,
                "data_referencia": entry.data_referencia.isoformat(),
                "setor_id": entry.setor_id,
                "setor": entry.setor.nome if entry.setor else f"Setor #{entry.setor_id}",
                "colaborador_id": entry.colaborador_id,
                "colaborador_nome": entry.colaborador_nome,
                "quantidade": float(entry.quantidade or 0.0),
                "ocorrencia": entry.ocorrencia,
                "ocorrencia_label": cls.occurrence_label(entry.ocorrencia),
                "observacao": entry.observacao,
                "criado_por": entry.criado_por,
                "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,
            }
            for entry in entries[:40]
        ]

        total_real = sum(item["producao_real"] for item in summaries)
        total_ideal = sum(item["producao_teorica"] for item in summaries)

        return {
            "periodo": f"{MONTH_NAMES[month]} {year}",
            "periodo_iso": f"{year:04d}-{month:02d}",
            "ano": year,
            "mes": month,
            "overview": {
                "setores": len(sectors),
                "dias_planejados": max((item["dias_planejados"] for item in summaries), default=0),
                "producao_real_total": total_real,
                "producao_teorica_total": total_ideal,
                "percentual_total": (total_real / total_ideal) if total_ideal > 0 else 0.0,
                "entries_total": len(entries),
            },
            "setores": summaries,
            "diario": daily_rows,
            "colaboradores": collaborators,
            "recent_entries": recent_entries,
            "occurrence_options": [
                {"value": value, "label": label}
                for value, label in OCCURRENCE_LABELS.items()
            ],
        }

    @staticmethod
    def occurrence_label(value: str | None) -> str:
        key = normalize_occurrence(value)
        return OCCURRENCE_LABELS.get(key, key.replace("_", " ").title())
