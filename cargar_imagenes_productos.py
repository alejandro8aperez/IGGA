import os
import django
import requests
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from inventarios.models import Producto
from django.core.files.base import ContentFile

# Crear carpeta de media si no existe
MEDIA_DIR = Path('media/productos/')
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Mapeo de productos con palabras clave de búsqueda en Unsplash
PRODUCTOS_IMAGENES = {
    'PAN001': 'fresh bread baking',      # Pan Aliñado
    'PAN002': 'round bread roll',         # Pan de Bono
    'PAN003': 'fried dough pastry',       # Buñuelo
    'PAN004': 'croissant butter',         # Croissant
    'PAN005': 'cheese bread rolls',       # Pan de Queso
    'PAS001': 'chicken pasty food',       # Pastel de Pollo
    'PAS002': 'dessert pastry sweet',     # Milhoja
    'PAS003': 'chocolate cake slice',     # Torta de Chocolate
    'PAS004': 'donuts glazed pastry',     # Donas
    'BEB001': 'black coffee cup',         # Café Tinto
    'BEB002': 'coffee with milk latte',   # Café con Leche
    'BEB003': 'soda drink bottle',        # Gaseosa
    'BEB004': 'fresh juice orange',       # Jugo Natural
    'BEB005': 'hot chocolate drink',      # Chocolate
}

def descargar_imagen(query, filename):
    """Descarga imagen de Unsplash usando URL directa sin API key"""
    try:
        # Usar loremflickr que es mucho más estable y rápido para desarrollo
        url = f"https://loremflickr.com/400/400/{query.replace(' ', ',')}"
        
        print(f"Descargando: {query}...")
        response = requests.get(url, timeout=10, allow_redirects=True)
        
        if response.status_code == 200:
            filepath = MEDIA_DIR / filename
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"✓ Guardado: {filename}")
            return True
        else:
            print(f"✗ Error al descargar {query}: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error en {query}: {str(e)}")
        return False

def asignar_imagenes():
    """Descarga imágenes y las asigna a los productos"""
    total = len(PRODUCTOS_IMAGENES)
    exitosos = 0
    
    print(f"\n{'='*60}")
    print("INICIANDO DESCARGA DE IMÁGENES DE PRODUCTOS")
    print(f"{'='*60}\n")
    
    for sku, query in PRODUCTOS_IMAGENES.items():
        try:
            producto = Producto.objects.get(codigo_sku=sku)
            filename = f"{sku.lower()}.jpg"
            
            # Eliminamos el bloqueo para permitir sobrescribir las imágenes
            # de los círculos con fotos reales
            print(f"Buscando foto real para: {sku} - {producto.nombre}...")
            
            # Descargar imagen
            if descargar_imagen(query, filename):
                # Limpieza profunda para evitar duplicados y sufijos
                if producto.imagen:
                    producto.imagen.delete(save=True)
                producto.imagen = None
                
                # Asignar la nueva foto real
                filepath = MEDIA_DIR / filename
                with open(filepath, 'rb') as f:
                    producto.imagen.save(filename, ContentFile(f.read()), save=True)
                print(f"  → Asignada a: {producto.nombre}\n")
                exitosos += 1
            else:
                print(f"  → No se pudo asignar a: {producto.nombre}\n")
                
        except Producto.DoesNotExist:
            print(f"✗ Producto no encontrado: {sku}\n")
        except Exception as e:
            print(f"✗ Error procesando {sku}: {str(e)}\n")
    
    print(f"\n{'='*60}")
    print(f"RESULTADO: {exitosos}/{total} productos con imagen")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    # Verificar conexión a internet
    try:
        requests.head('https://loremflickr.com', timeout=5)
        asignar_imagenes()
    except:
        print("⚠ Error: No hay conexión a internet o el servicio de imágenes no está disponible")
        print("Intenta nuevamente o carga las imágenes manualmente desde el admin.")
