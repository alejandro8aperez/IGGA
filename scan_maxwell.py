import os
from collections import Counter

folder = r"C:\KAVE\SGC DE maxwell"
if not os.path.exists(folder):
    print(f"Carpeta no encontrada: {folder}")
else:
    ext_counts = Counter()
    total_files = 0
    total_size = 0
    for root, dirs, files in os.walk(folder):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            ext_counts[ext] += 1
            total_files += 1
            total_size += os.path.getsize(os.path.join(root, f))
    
    print(f"Total archivos: {total_files}")
    print(f"Tamaño total: {total_size / (1024*1024):.2f} MB")
    print("Extensiones encontradas:")
    for ext, count in ext_counts.items():
        print(f"  {ext if ext else 'Sin extensión'}: {count}")
