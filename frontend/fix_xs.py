import os
import re

pages_dir = os.path.join("src", "pages")

def clean_and_inject():
    for filename in os.listdir(pages_dir):
        if not filename.endswith(".jsx"): continue
        if 'Login' in filename or 'Home' in filename or 'Dashboard' in filename or 'FormatosISO' in filename: continue
        
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # First remove any `<button ...> X </button>` that has `window.location.href = '/'`
        content = re.sub(r'<button\s+onClick=\{\(\) => window\.location\.href = \'/\'\}.*?>\s+X\s+</button>', '', content, flags=re.DOTALL)
        content = content.replace("style={{ position: 'relative',  position: 'relative' }}>", "style={{ position: 'relative' }}>")
        
        # Now we want to inject it in the main return.
        # usually it is `return (\n        <div className="container">` or similar
        # let's look for the LAST `<div className="container">` or `<div className="glass-card">` or `<div className="modal-overlay"` before a `<h1` or `<div className="page-header"`
        # Actually, let's just insert it right before `<h1` or `<h2` that has "header-title" or "page-header", but inside a `<div style={{ position: 'fixed'...` 
        
        # If we just insert a fixed button, it doesn't need to be inside a relative container!
        fixed_button = """                <button 
                    onClick={() => window.location.href = '/'} 
                    className="btn btn-ghost modal-close-btn" 
                    title="Cerrar Módulo"
                    style={{ 
                        position: 'fixed', 
                        top: '1.5rem', 
                        right: '1.5rem',
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                        fontSize: '2rem',
                        padding: '0.75rem',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        zIndex: 9999999,
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
                
        # Inject just before the final `</div` or just after `return (` 
        # The safest place in a JSX component return is right after the main wrapper.
        # Since it's fixed, it doesn't matter where it is structurally as long as it's returned.
        # We can look for `return (` and insert it right after the first HTML tag following it.
        
        # Or better, just inject it before the `<h1` since we know almost all modules have an `h1`
        if '<h1' in content:
            content = content.replace('<h1', fixed_button + '\n<h1', 1)
            print(f"Injected in {filename} before <h1")
        elif 'header-actions' in content:
            content = content.replace('header-actions', 'header-actions">\n' + fixed_button + '\n<div className="DUMMY', 1)
            content = content.replace('<div className="DUMMY', '')
            print(f"Injected in {filename} before header-actions")
        else:
            print(f"Could not find injection point for {filename}")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

clean_and_inject()
