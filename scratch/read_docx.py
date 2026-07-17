import zipfile
import re

docx_path = r"C:\Users\rycha\OneDrive\Documents\ERP_Documentacao_Completa_v2.docx"

try:
    with zipfile.ZipFile(docx_path, 'r') as zip_ref:
        doc_xml = zip_ref.read('word/document.xml').decode('utf-8')
        # Remove XML tags to get raw text
        raw_text = re.sub(r'<[^>]+>', ' ', doc_xml)
        # Normalize whitespace
        raw_text = re.sub(r'\s+', ' ', raw_text)
        
        # Let's search for keywords
        print("Docx Length:", len(raw_text))
        
        # Print some paragraphs or search for terms
        keywords = ["vender", "preço", "preco", "valor", "modulo", "módulo", "financeiro", "vendas", "estoque", "pcp", "manutenção", "produtividade", "R$", "comercializar"]
        for kw in keywords:
            matches = [m.start() for m in re.finditer(re.escape(kw), raw_text, re.IGNORECASE)]
            if matches:
                print(f"Keyword '{kw}' found {len(matches)} times.")
                for idx in matches[:5]:
                    start = max(0, idx - 100)
                    end = min(len(raw_text), idx + 200)
                    print(f"  Snippet: ... {raw_text[start:end]} ...")
                    print("-" * 30)
except Exception as e:
    print("Error reading docx:", e)
