import sys
import json
import urllib.request
import urllib.error
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import concurrent.futures
import re
import os

def get_article_links(category_url):
    req = urllib.request.Request(category_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find all links on the page
            links = []
            parsed_cat = urlparse(category_url)
            base_url = f"{parsed_cat.scheme}://{parsed_cat.netloc}"
            cat_path = parsed_cat.path.rstrip('/')
            
            for a in soup.find_all('a', href=True):
                href = a['href']
                
                # Full URL resolution
                full_url = urljoin(base_url, href)
                parsed_href = urlparse(full_url)
                
                # Check if it belongs to the same domain and starts with the category path, but isn't just the category path
                if parsed_href.netloc == parsed_cat.netloc and parsed_href.path.startswith(cat_path):
                    if len(parsed_href.path) > len(cat_path) + 1: # It's an article inside the category
                        if full_url not in links:
                            links.append(full_url)
                            
            return links
    except Exception as e:
        print(f"Error fetching category {category_url}: {e}")
        return []

def fetch_article(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, 'html.parser')
            
            article = soup.find('article') or soup.find(class_=re.compile('article.*content')) or soup.find(class_='article')
            if article:
                text = article.get_text(separator='\n', strip=True)
            else:
                text = soup.body.get_text(separator='\n', strip=True)[:1000]
                
            return f"### SOURCE: {url}\n\n{text}\n\n"
    except Exception as e:
        return f"### SOURCE: {url}\n\nERROR: {str(e)}\n\n"

def main():
    if len(sys.argv) < 2:
        print("Usage: python fetch_category_articles.py <category_url>")
        sys.exit(1)
        
    category_url = sys.argv[1]
    print(f"Fetching links from category: {category_url}")
    
    links = get_article_links(category_url)
    print(f"Found {len(links)} articles.")
    
    if not links:
        print("No articles found or error occurred.")
        sys.exit(0)
        
    results = [""] * len(links)
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_index = {executor.submit(fetch_article, url): i for i, url in enumerate(links)}
        for future in concurrent.futures.as_completed(future_to_index):
            index = future_to_index[future]
            results[index] = future.result()
            print(f"Fetched {links[index]}")
            
    # Save to file
    parsed_cat = urlparse(category_url)
    category_slug = parsed_cat.path.strip('/').replace('/', '_')
    if not category_slug:
        category_slug = "articles"
        
    output_filename = os.path.join(r"d:\ERP Venner\scratch", f"olist_{category_slug}.md")
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(f"# Articles for {category_url}\n\n")
        for res in results:
            f.write(res)
        f.write("\n\nDone.\n")
        
    print(f"Saved {len(links)} articles to {output_filename}")

if __name__ == "__main__":
    main()
