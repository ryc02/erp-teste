import re

with open(r'd:\ERP Venner\frontend\style.css', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Find the clean end marker (the last line of our clean olist block)
marker = '@media (prefers-reduced-motion: reduce) {'
idx = content.find(marker)
if idx == -1:
    print("Marker not found!")
else:
    # Find the closing brace of this @media block
    after = content[idx:]
    # Count braces to find the end
    depth = 0
    end = 0
    for i, ch in enumerate(after):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = idx + i + 1
                break
    
    if end > 0:
        clean = content[:end] + '\n'
        with open(r'd:\ERP Venner\frontend\style.css', 'w', encoding='utf-8') as f:
            f.write(clean)
        print(f"Cleaned file. Cut from {end} to {len(content)} ({len(content) - end} bytes removed)")
    else:
        print("Could not find end of @media block")
