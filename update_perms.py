import os
import glob
import re

base_dir = r"c:\Postgres\ERP-8AMPERIOS"

modules = {
    'inventarios': 'IsInventarioUser',
    'compras': 'IsComprasUser',
    'produccion': 'IsProduccionUser',
    'mrp': 'IsIngenieriaUser',
    'kave': 'IsIngenieriaUser',
    'contabilidad': 'IsContabilidadUser'
}

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == 'views.py' or file == 'api_views.py':
            filepath = os.path.join(root, file)
            app_name = os.path.basename(root)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove AllowAny imports
            content = re.sub(r'from rest_framework\.permissions import AllowAny\n?', '', content)
            
            # Add custom permissions import if in our targeted modules
            if app_name in modules and 'from erp_core.permissions import' not in content:
                import_stmt = f"from erp_core.permissions import {modules[app_name]}\n"
                # Add after other imports
                content = re.sub(r'(from rest_framework.*?)\n', r'\1\n' + import_stmt, content, count=1)
            
            # Replace permission_classes
            if app_name in modules:
                perm_class = modules[app_name]
                content = re.sub(r'permission_classes\s*=\s*\[.*?AllowAny.*?\]', f'permission_classes = [{perm_class}]', content)
            else:
                # Fallback to empty list so it uses default IsAuthenticated, or just remove
                content = re.sub(r'permission_classes\s*=\s*\[.*?AllowAny.*?\]\s*\n', '', content)
            
            # For @permission_classes decorators
            content = re.sub(r'@permission_classes\(\[.*?AllowAny.*?\]\)\n', '', content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
print("Permisos actualizados en todos los views.")
