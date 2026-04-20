import os
import re

directory = r'c:\Postgres\ERP-8AMPERIOS\frontend\src'

def replace_api_urls(file_path):
    content = None
    for enc in ['utf-8', 'utf-16', 'latin-1']:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
            break
        except UnicodeDecodeError:
            continue
    
    if content is None: return

    # Replacements
    # 1. Single quotes: 'http://localhost:8000/api/...' -> (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/...'
    # Actually, the safest way is to replace 'http://localhost:8000/api with (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '
    # Wait, simpler:
    content = re.sub(
        r"'http://localhost:8000/api([^']*)'",
        r"(import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '\1'",
        content
    )

    # 2. Backticks: `http://localhost:8000/api/...` -> `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/...`
    content = re.sub(
        r"`http://localhost:8000/api([^`]*)`",
        r"`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}\1`",
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(directory):
    for filename in files:
        if filename.endswith('.jsx') or filename.endswith('.js'):
            replace_api_urls(os.path.join(root, filename))

print("URL replacement complete.")
