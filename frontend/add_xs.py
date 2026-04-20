import os
import re

pages_dir = os.path.join("src", "pages")

modal_close_btn_template = """<button 
    className="btn btn-ghost modal-close-btn" 
    onClick={__CLOSE_FUNC__}
    style={{ 
        position: 'absolute', 
        top: '0.5rem', 
        right: '0.5rem',
        backgroundColor: '#ff0000',
        color: '#ffffff',
        fontSize: '2rem',
        padding: '0.75rem',
        border: '2px solid #ff0000',
        borderRadius: '8px',
        zIndex: 99999,
        minWidth: '60px',
        minHeight: '60px'
    }}
>
    X
</button>"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that already have modal-close-btn everywhere
    # Actually, we will just count and inject.
    modified = False
    
    # 1. Look for modal-overlays and their close functions if they don't have modal-close-btn
    # It's tricky with regex to find the right onClick. Let's just find onClick inside modal-overlay or the first button after modal-header.
    
    # Let's replace simple Cancel buttons or modal-header headers.
    # A common pattern is `<div className="modal-header">\n  <h2>...</h2>`
    # We want to insert our button right after `<div className="modal-header">`
    
    # To find the close function, let's look for common ones in the file:
    close_funcs = re.findall(r'(set[A-Za-z]+ModalOpen\(false\)|setShow[A-Za-z]+\(false\)|closeModal|onClose|setShowModal\(false\)|setIsModalOpen\(false\)|setMostrarModal\(false\))', content)
    
    # Fallback to navigate('/') if none found for modals? No, if it's a modal it should close the modal.
    # Let's see if we can find existing cancel buttons and replace them or just add the X.
    
    lines = content.split('\n')
    new_lines = []
    
    in_modal_overlay = False
    current_close_func = None
    
    for i, line in enumerate(lines):
        new_lines.append(line)
        
        # Detect modal overlay to try to guess close func
        if 'className="modal-overlay"' in line and 'onClick={' in line:
            match = re.search(r'onClick=\{([^}]+)\}', line)
            if match:
                current_close_func = match.group(1).replace('() =>', '').strip()
                if current_close_func == 'e => e.stopPropagation()':
                    current_close_func = None
        
        if '<div className="modal-header">' in line:
            # Check if the next few lines already contain modal-close-btn
            has_close_btn = False
            for j in range(i, min(i+10, len(lines))):
                if 'modal-close-btn' in lines[j]:
                    has_close_btn = True
                    break
            
            if not has_close_btn:
                # We need a close func. If we found one in modal-overlay, use it.
                # Else try to find one in the file
                cf = "() => console.log('close')"
                if current_close_func:
                    cf = current_close_func
                elif close_funcs:
                    # Pick the most common or first one that looks like a state setter for this modal
                    cf = close_funcs[0]
                    if not cf.startswith('() =>') and 'Modal' not in cf and 'onClose' not in cf:
                        cf = f"() => {cf}"
                    elif cf.startswith('set'):
                        cf = f"() => {cf}"
                
                # Insert the button
                btn = modal_close_btn_template.replace('__CLOSE_FUNC__', cf)
                # Indent properly
                indent = ' ' * (len(line) - len(line.lstrip()))
                btn_indented = '\n'.join(indent + '    ' + l for l in btn.split('\n'))
                new_lines.append(btn_indented)
                modified = True

    # 2. Let's make sure the MAIN SCREEN has a close button returning to home ('/').
    # Look for `<div className="container">` or `<div className="glass-card">` at the start of the return.
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"Modified {filepath}")

for filename in os.listdir(pages_dir):
    if filename.endswith(".jsx"):
        process_file(os.path.join(pages_dir, filename))

print("Done processing files.")
