import os

folder = r"c:\KAVE"
if not os.path.exists(folder):
    print("La carpeta no existe.")
else:
    count = 0
    for root, dirs, files in os.walk(folder):
        for name in files:
            print(os.path.join(root, name))
            count += 1
    print(f"Total: {count} archivos")
