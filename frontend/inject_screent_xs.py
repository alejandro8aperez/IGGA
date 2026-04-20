import os
import re

pages_dir = os.path.join("src", "pages")

big_x_button = """                <button 
                    onClick={() => window.location.href = '/'} 
                    className="btn btn-ghost modal-close-btn" 
                    title="Cerrar Módulo"
                    style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem',
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                        fontSize: '2rem',
                        padding: '0.75rem',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        zIndex: 99999,
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(255, 0, 0, 0.8)'
                    }}
                >
                    X
                </button>"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Si ya lo tiene inyectado
    if "Cerrar Módulo" in content and "window.location.href = '/'" in content:
        return

    # Skip files that are not main modules
    if 'Login' in filepath or 'Home' in filepath or 'Dashboard' in filepath or 'FormatosISO' in filepath:
        return

    # Buscamos <div className="glass-card"> o <div className="container"> (el primero de la pagina que parece return principal)
    # Preferimos glass-card o container. Usaremos una busqueda manual
    
    match = re.search(r'(<div[^>]*className=["\'][^"\']*(?:glass-card|container)[^"\']*["\'][^>]*>)', content)
    if match:
        tag = match.group(1)
        # Asegurarnos de que el padre sea relative
        if 'style={{' in tag:
            new_tag = tag.replace('style={{', 'style={{ position: \'relative\', ')
        else:
            new_tag = tag.replace('>', ' style={{ position: \'relative\' }}>')
            
        modified_content = content.replace(tag, new_tag + "\n" + big_x_button, 1)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        print(f"Modified {filepath}")
    else:
        print(f"Skipping {filepath} - no glass-card/container found")

for filename in os.listdir(pages_dir):
    if filename.endswith(".jsx"):
        process_file(os.path.join(pages_dir, filename))

print("Done processing.")
