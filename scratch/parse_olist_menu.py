import os
from bs4 import BeautifulSoup

def main():
    file_path = r"D:\web scraping\html_lista.html"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    
    # Tiny ERP typically has a sidebar or header menu.
    # Let's find common navigation elements like nav, sidebar, or specific classes
    
    print("=== Extracting Olist Modules ===")
    
    # Method 1: Look for links inside standard nav elements
    nav_links = soup.select("nav a, .sidebar a, .menu a, .nav a, ul.menu li a, [role='navigation'] a, .main-menu a")
    
    modules = set()
    for a in nav_links:
        text = a.get_text(strip=True)
        href = a.get("href", "")
        if text and href and not href.startswith("#") and href != "javascript:void(0);":
            modules.add(f"{text} ({href})")
            
    if not modules:
        # Fallback to finding list items with icons or links that look like menu items
        links = soup.find_all("a")
        for a in links:
            text = a.get_text(strip=True)
            href = a.get("href", "")
            # filter out common non-menu items
            if text and len(text) < 30 and href.startswith("/") and not href.startswith("/#"):
                modules.add(f"{text} ({href})")
    
    # Sort and print
    for m in sorted(modules):
        print("-", m)

if __name__ == "__main__":
    main()
