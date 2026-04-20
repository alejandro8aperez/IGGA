import os
import io

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    from docx import Document
except ImportError:
    Document = None

source_folder = r"C:\KAVE\SGC DE maxwell"
output_file = r"C:\Postgres\SGC_maxwell_Consolidado.txt"

def extract_pdf(file_path):
    if not PyPDF2: return ""
    text = ""
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"  [x] Error leyendo PDF {os.path.basename(file_path)}")
    return text

def extract_docx(file_path):
    if not Document: return ""
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"  [x] Error leyendo DOCX {os.path.basename(file_path)}")
    return text

def extract_txt(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
        except Exception:
            print(f"  [x] Error codificando texto {os.path.basename(file_path)}")
            return ""

print("Iniciando extracción masiva de texto...")
print("Ruta Origen:", source_folder)
print("Archivo Destino:", output_file)

archivos_procesados = 0

with open(output_file, 'w', encoding='utf-8') as outfile:
    outfile.write("="*60 + "\n")
    outfile.write("ARCHIVO MAESTRO CONSOLIDADO: SGC DE MAXWELL\n")
    outfile.write("Generado automáticamente por Antigravity para NotebookLM\n")
    outfile.write("="*60 + "\n\n")

    for root, dirs, files in os.walk(source_folder):
        for name in files:
            ext = os.path.splitext(name)[1].lower()
            file_path = os.path.join(root, name)
            
            content = ""
            if ext == '.pdf':
                content = extract_pdf(file_path)
            elif ext == '.docx':
                content = extract_docx(file_path)
            elif ext in ['.txt', '.md', '.csv', '.py', '.html', '.js']:
                content = extract_txt(file_path)
            
            if content and content.strip():
                archivos_procesados += 1
                outfile.write("\n" + "="*80 + "\n")
                outfile.write(f"+++ REFERENCIA ORIGINAL: {file_path} +++\n")
                outfile.write("="*80 + "\n\n")
                outfile.write(content)
                outfile.write("\n\n")

print(f"¡Extracción finalizada exitosamente! Se procesaron {archivos_procesados} documentos legibles.")
print(f"El archivo listo para NotebookLM se encuentra en: {output_file}")
