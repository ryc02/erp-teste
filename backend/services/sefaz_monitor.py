import time
import threading
import urllib.request
import re
from datetime import datetime
from database import SessionLocal
from models.fiscal import SefazAlerta
import ssl

def verificar_sefaz():
    """
    Lê o portal da SEFAZ Nacional (Avisos e Informes).
    Usa bibliotecas nativas para raspar as notícias.
    """
    url = "https://www.nfe.fazenda.gov.br/portal/informe.aspx?tipoConteudo=XbSeqxE8pl8="
    # O site da Sefaz muitas vezes tem cadeias de certificados difíceis para o Python padrão, desativamos verificação
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    )

    db = SessionLocal()
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=15).read().decode('utf-8', errors='ignore')
        
        # Expressão regular simples para buscar blocos de título de notícia (span class tituloNoticia ou tag <p>)
        padrao = r'<span[^>]*class="tituloNoticia"[^>]*>(.*?)</span>'
        matches = re.findall(padrao, html, re.DOTALL | re.IGNORECASE)

        if not matches:
            return

        for m in matches:
            mensagem = m.strip()
            # Limpar tags HTML residuais se houver
            mensagem = re.sub(r'<[^>]+>', '', mensagem).strip()
            
            if not mensagem:
                continue
                
            # Verifica se já existe para evitar duplicação (Item 4)
            existente = db.query(SefazAlerta).filter(SefazAlerta.mensagem == mensagem).first()
            
            if not existente:
                tipo = "CRITICAL" if "Nota Técnica" in mensagem or "Paralisação" in mensagem or "Indisponibilidade" in mensagem else "WARNING"
                
                novo_alerta = SefazAlerta(
                    tipo=tipo,
                    mensagem=mensagem,
                    fonte="Portal Nacional NF-e",
                    lido=False,
                    data_leitura=datetime.utcnow()
                )
                db.add(novo_alerta)
                
        db.commit()
    except urllib.error.HTTPError as e:
        pass # Ignora redirects ou bloqueios temporários da SEFAZ
    except Exception as e:
        print(f"[SefazMonitor] Aviso: {e}")
    finally:
        db.close()

def start_sefaz_monitor():
    """Inicia a thread do monitor em background rodando a cada 6 horas (Item 2)"""
    def _run():
        while True:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [SefazMonitor] Robô Vigia Iniciado. Buscando atualizações...")
            verificar_sefaz()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [SefazMonitor] Verificação concluída. Dormindo por 6 horas...")
            # Dorme por 6 horas (60 * 60 * 6 = 21600 segundos)
            time.sleep(21600)
        
    t = threading.Thread(target=_run, daemon=True)
    t.start()
