import os
import re

css_path = r"d:\ERP Venner\frontend\style.css"

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace #sidebar block
old_sidebar_regex = r'#sidebar \{.*?\}'
# We'll just append our new classes and let them override, or carefully replace.
# Actually, since it's safer, let's just append at the end of the file or after the sidebar definition.

new_css = """
/* === DUAL PANE SIDEBAR OVERRIDES === */
#sidebar-container {
    display: flex;
    height: 100vh;
    z-index: 100;
}

#sidebar-primary {
    width: 220px; /* Base width, but we can make it narrower */
    width: 200px;
    background: #111219;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    z-index: 101;
}

#sidebar-primary .logo-area {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

#sidebar-primary .nav-menu {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
}

#sidebar-primary .sidebar-bottom {
    padding: 12px;
    border-top: 1px solid var(--border-color);
}

#sidebar-secondary {
    width: 260px;
    background: #15161b; /* Slightly lighter than primary */
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: width 0.3s ease;
}

#sidebar-secondary.collapsed {
    width: 0;
    overflow: hidden;
    border-right: none;
}

.secondary-header {
    padding: 24px 20px 16px 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

#sidebar-secondary .nav-menu {
    padding: 12px;
    flex: 1;
    overflow-y: auto;
}

/* Nav Items Specifics */
#sidebar-primary .nav-item {
    font-size: 14px;
    padding: 10px 12px;
    color: var(--text-secondary);
    border-radius: 8px;
}
#sidebar-primary .nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: #fff;
    transform: none;
}
#sidebar-primary .nav-item.active {
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary);
    box-shadow: none;
    font-weight: 600;
}
#sidebar-primary .nav-item.active i {
    color: var(--primary);
}

#sidebar-secondary .nav-item {
    font-size: 13px;
    padding: 8px 12px;
    color: var(--text-secondary);
}
#sidebar-secondary .nav-item.active {
    background: transparent;
    color: var(--primary);
    box-shadow: inset 3px 0 0 var(--primary);
}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write("\n" + new_css)
    
print("Appended sidebar CSS.")
