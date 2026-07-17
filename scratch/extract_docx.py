import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r'C:\Users\rycha\OneDrive\Documents\ERP_Documentacao_Completa_v2.docx'
namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            paragraphs = []
            for p in tree.findall('.//w:p', namespace):
                texts = [t.text for t in p.findall('.//w:t', namespace) if t.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    text = get_docx_text(docx_path)
    print(text)
