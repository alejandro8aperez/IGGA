import os

input_file = r"C:\Postgres\SGC_maxwell_Consolidado.txt"
output_prefix = r"C:\Postgres\SGC_maxwell_Parte_"

# NotebookLM word limit is 500k words, which is ~ 3MB. We will split by 2MB chunks.
CHUNK_SIZE = 2 * 1024 * 1024  # 2MB 

if not os.path.exists(input_file):
    print("El archivo base no existe.")
else:
    file_count = 1
    current_size = 0
    current_lines = []
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        for line in infile:
            current_lines.append(line)
            current_size += len(line.encode('utf-8'))
            
            if current_size >= CHUNK_SIZE:
                # Escribimos el chunk
                out_name = f"{output_prefix}{file_count}.txt"
                with open(out_name, 'w', encoding='utf-8') as outf:
                    outf.writelines(current_lines)
                print(f"Generado: {out_name} ({current_size/1024/1024:.2f} MB)")
                
                # Reset
                file_count += 1
                current_size = 0
                current_lines = []
                
        # Escribir lo restante si hay
        if current_lines:
            out_name = f"{output_prefix}{file_count}.txt"
            with open(out_name, 'w', encoding='utf-8') as outf:
                outf.writelines(current_lines)
            print(f"Generado: {out_name} ({current_size/1024/1024:.2f} MB)")

print("¡División completada!")
