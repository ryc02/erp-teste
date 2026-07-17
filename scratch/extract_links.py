import re
import urllib.request
import json
import os

files = [
    r"C:\Users\rycha\.gemini\antigravity-ide\brain\44679718-5c71-4cce-aa34-55a1bc985132\.system_generated\steps\1001\content.md",
    r"C:\Users\rycha\.gemini\antigravity-ide\brain\44679718-5c71-4cce-aa34-55a1bc985132\.system_generated\steps\1002\content.md",
    r"C:\Users\rycha\.gemini\antigravity-ide\brain\44679718-5c71-4cce-aa34-55a1bc985132\.system_generated\steps\1003\content.md"
]

all_links = set()
for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Look for typical helpjuice article links
        # They usually look like <a href="/something/article">
        # In the dumped HTML, we can find href="/xxx" where xxx doesn't start with '#'
        links = re.findall(r'href=["\'](/[^\"\'#\?]+)["\']', content)
        for link in links:
            # Filter out generic links
            if not link.startswith(('/novidades', '/erp', '/faqs', '/envios', '/credito', '/conta-digital', '/ecommerce', '/loja', '/assets', '/support')):
                # Filter out pure categories we already have, maybe keep them all and filter later
                if len(link.split('/')) >= 2 and len(link) > 15:
                    all_links.add("https://ajuda.olist.com" + link)

print("Found links:")
for l in sorted(all_links):
    print(l)
