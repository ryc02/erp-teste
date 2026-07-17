import json
import urllib.request
import urllib.error
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

links = [
    "https://ajuda.olist.com/configuracoes-financeiras/banco-inter",
    "https://ajuda.olist.com/configuracoes-financeiras/categorias-de-receitas-e-despesas",
    "https://ajuda.olist.com/configuracoes-financeiras/como-integrar-sua-maquininha-de-cartao",
    "https://ajuda.olist.com/configuracoes-financeiras/contas-bancarias",
    "https://ajuda.olist.com/configuracoes-financeiras/contas-financeiras",
    "https://ajuda.olist.com/configuracoes-financeiras/financas-configuracoes-gerais",
    "https://ajuda.olist.com/configuracoes-financeiras/formas-de-recebimento",
    "https://ajuda.olist.com/configuracoes-financeiras/gateway-de-pagamento-tipo-outros",
    "https://ajuda.olist.com/configuracoes-financeiras/gateway-financeiro-o-que-e-para-que-serve-e-como-instalar",
    "https://ajuda.olist.com/configuracoes-financeiras/gateway-pagarme",
    "https://ajuda.olist.com/configuracoes-financeiras/gateway-pagarme-20",
    "https://ajuda.olist.com/configuracoes-financeiras/integracao-stone-pos-configuracoes",
    "https://ajuda.olist.com/configuracoes-financeiras/stone-pos-minha-cobranca-gerada-no-pdv-nao-aparece-na-maquina",
    "https://ajuda.olist.com/configuracoes-financeiras/visao-geral-do-modulo-de-financas",
    "https://ajuda.olist.com/gestao-financeira/ajuste-nos-lancamentos-do-extrato-bancario",
    "https://ajuda.olist.com/gestao-financeira/caixa",
    "https://ajuda.olist.com/gestao-financeira/cobrancas-bancarias",
    "https://ajuda.olist.com/gestao-financeira/contas-a-pagar",
    "https://ajuda.olist.com/gestao-financeira/contas-a-receber",
    "https://ajuda.olist.com/gestao-financeira/extratos-bancarios",
    "https://ajuda.olist.com/gestao-financeira/fechamento-financeiro",
    "https://ajuda.olist.com/relatorios-de-financas/balancete",
    "https://ajuda.olist.com/relatorios-de-financas/como-funciona-o-relatorio-dre",
    "https://ajuda.olist.com/relatorios-de-financas/demonstracao-do-resultado-do-exercicio-dre",
    "https://ajuda.olist.com/relatorios-de-financas/faq-%E2%80%93-painel-de-contadores-olist",
    "https://ajuda.olist.com/relatorios-de-financas/fluxo-de-caixa"
]

def fetch_url(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, 'html.parser')
            # The article content is usually inside an element with class "article__body" or "article" or something.
            # Usually in helpjuice, it's <article> or <div class="article-content">. 
            # We'll just grab the text of <article> if it exists, otherwise the body.
            article = soup.find('article') or soup.find(class_='article') or soup.find(class_='article-content') or soup.find(id='article-body')
            if article:
                text = article.get_text(separator='\n', strip=True)
            else:
                # fallback
                text = soup.body.get_text(separator='\n', strip=True)[:1000] # just grab a snippet if we fail to find the article body
            
            return f"### SOURCE: {url}\n\n{text}\n\n"
    except Exception as e:
        return f"### SOURCE: {url}\n\nERROR: {str(e)}\n\n"

import concurrent.futures

results = [""] * len(links)
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    future_to_index = {executor.submit(fetch_url, url): i for i, url in enumerate(links)}
    for future in concurrent.futures.as_completed(future_to_index):
        index = future_to_index[future]
        results[index] = future.result()

with open(r'd:\ERP Venner\scratch\olist_financas_all.md', 'w', encoding='utf-8') as f:
    f.write("# Olist Finance Articles\n\n")
    for res in results:
        f.write(res)
    f.write("\n\nDone.")
print("Saved all articles to d:\\ERP Venner\\scratch\\olist_financas_all.md")
