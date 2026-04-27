import os
import django
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from inventarios.models import Producto
from django.core.files.base import ContentFile

# Crear carpeta de media si no existe
MEDIA_DIR = Path('media/productos/')
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Paleta de colores por categoría
COLORES = {
    'Panadería': [(218, 165, 32), (210, 180, 140), (184, 134, 11)],      # Dorado/marrón pan
    'Pastelería': [(255, 182, 193), (255, 192, 203), (255, 160, 122)],   # Rosa/salmón
    'Cafetería y Bebidas': [(139, 69, 19), (160, 82, 45), (165, 42, 42)],  # Marrón café
}

PRODUCTOS_INFO = {
    'PAN001': {'nombre': 'Pan Aliñado\nGrande', 'cat': 'Panadería', 'emoji': '🍞'},
    'PAN002': {'nombre': 'Pan de Bono', 'cat': 'Panadería', 'emoji': '🥐'},
    'PAN003': {'nombre': 'Buñuelo\nCalientito', 'cat': 'Panadería', 'emoji': '🍩'},
    'PAN004': {'nombre': 'Croissant\nMantequilla', 'cat': 'Panadería', 'emoji': '🥐'},
    'PAN005': {'nombre': 'Pan de Queso', 'cat': 'Panadería', 'emoji': '🧀'},
    'PAS001': {'nombre': 'Pastel de\nPollo', 'cat': 'Pastelería', 'emoji': '🥧'},
    'PAS002': {'nombre': 'Milhoja\nArequipe', 'cat': 'Pastelería', 'emoji': '🎂'},
    'PAS003': {'nombre': 'Torta\nChocolate', 'cat': 'Pastelería', 'emoji': '🍫'},
    'PAS004': {'nombre': 'Donas\nVariadas', 'cat': 'Pastelería', 'emoji': '🍩'},
    'BEB001': {'nombre': 'Café Tinto', 'cat': 'Cafetería y Bebidas', 'emoji': '☕'},
    'BEB002': {'nombre': 'Café con\nLeche', 'cat': 'Cafetería y Bebidas', 'emoji': '☕'},
    'BEB003': {'nombre': 'Gaseosa\nMini', 'cat': 'Cafetería y Bebidas', 'emoji': '🥤'},
    'BEB004': {'nombre': 'Jugo\nNatural', 'cat': 'Cafetería y Bebidas', 'emoji': '🧃'},
    'BEB005': {'nombre': 'Chocolate\nSantafereño', 'cat': 'Cafetería y Bebidas', 'emoji': '🍫'},
}

def generar_imagen(sku, info):
    """Genera una imagen atractiva para el producto"""
    try:
        # Configuración de alta resolución
        ancho, alto = 400, 400
        
        # Color de fondo determinista según SKU para consistencia visual
        colores_cat = COLORES[info['cat']]
        random_gen = random.Random(sku) # Semilla fija por SKU
        color_fondo = random_gen.choice(colores_cat)
        
        # Crear imagen base
        img = Image.new('RGB', (ancho, alto), color_fondo)
        # Usamos RGBA para poder dibujar capas con transparencia (brillos)
        overlay = Image.new('RGBA', (ancho, alto), (0,0,0,0))
        draw = ImageDraw.Draw(img)
        draw_ov = ImageDraw.Draw(overlay)
        
        # Degradado radial simulado para dar profundidad
        for i in range(alto):
            factor = 1 - (i / alto) * 0.3
            r = int(color_fondo[0] * factor)
            g = int(color_fondo[1] * factor)
            b = int(color_fondo[2] * factor)
            draw.rectangle([(0, i), (ancho, i+1)], fill=(r, g, b))
            
        # Añadir un "brillo" superior (Glossy effect)
        draw_ov.ellipse([-100, -250, ancho+100, 150], fill=(255, 255, 255, 40))
        
        # Dibujar círculo decorativo
        radio = 135
        x, y = ancho//2, alto//2
        color_circulo = tuple(min(255, c+50) for c in color_fondo)
        draw.ellipse([x-radio, y-radio, x+radio, y+radio], fill=color_circulo, outline=(255,255,255, 180), width=6)
        
        # Intentar cargar fuentes de sistema (Windows) con mejor tamaño
        try:
            font_path = "C:\\Windows\\Fonts\\segoeuib.ttf" # Segoe UI Bold
            emoji_font_path = "C:\\Windows\\Fonts\\seguiemj.ttf"
            
            fuente_emoji = ImageFont.truetype(emoji_font_path, 140) if os.path.exists(emoji_font_path) else ImageFont.load_default()
            fuente_texto = ImageFont.truetype(font_path, 32) if os.path.exists(font_path) else ImageFont.load_default()
            fuente_sku = ImageFont.truetype(font_path, 16) if os.path.exists(font_path) else ImageFont.load_default()
            fuente_marca = ImageFont.truetype(font_path, 22)
        except:
            fuente_emoji = ImageFont.load_default()
            fuente_texto = ImageFont.load_default()
            fuente_sku = ImageFont.load_default()
            fuente_marca = ImageFont.load_default()
            
        # Combinar capas
        img.paste(overlay, (0,0), overlay)
        
        # Dibujar emoji en el centro
        emoji = info['emoji']
        # Sombra suave para el emoji
        draw.text((ancho//2 + 3, alto//2 - 37), emoji, fill=(0,0,0,60), font=fuente_emoji, anchor="mm")
        draw.text((ancho//2, alto//2 - 40), emoji, fill=(255,255,255), font=fuente_emoji, anchor="mm")
        
        # Nombre del producto
        nombre = info['nombre']
        draw.text((ancho//2, alto - 60), nombre, fill=(255,255,255), font=fuente_texto, anchor="mm", align="center")
        
        # SKU en esquina inferior
        draw.text((20, alto - 30), f"SKU: {sku}", fill=(240,240,240), font=fuente_sku)
        
        # Marca de LA BOQUILLA
        draw.text((ancho//2, 30), "🥖 LA BOQUILLA 🥖", fill=(255,255,255), font=fuente_marca, anchor="mm")
        
        return img
    except Exception as e:
        print(f"  Error generando imagen: {e}")
        return None

def asignar_imagenes():
    """Genera imágenes y las asigna a los productos"""
    total = len(PRODUCTOS_INFO)
    exitosos = 0
    
    print(f"\n{'='*60}")
    print("GENERANDO IMÁGENES PARA PRODUCTOS")
    print(f"{'='*60}\n")
    
    for sku, info in PRODUCTOS_INFO.items():
        try:
            producto = Producto.objects.get(codigo_sku=sku)
            
            # Si ya tiene imagen, saltar
            if producto.imagen:
                print(f"⊘ {sku} ({producto.nombre}) - Ya tiene imagen")
                continue
            
            print(f"Generando: {sku} - {producto.nombre}...")
            
            # Generar imagen
            img = generar_imagen(sku, info)
            if img:
                # Guardar temporalmente
                filename = f"{sku.lower()}.jpg"
                filepath = MEDIA_DIR / filename
                img.save(filepath, 'JPEG', quality=90)
                
                # Asignar al producto
                with open(filepath, 'rb') as f:
                    producto.imagen.save(filename, ContentFile(f.read()), save=True)
                
                print(f"✓ {filename} asignada a {producto.nombre}\n")
                exitosos += 1
            else:
                print(f"✗ No se pudo generar imagen para {sku}\n")
                
        except Producto.DoesNotExist:
            print(f"✗ Producto no encontrado: {sku}\n")
        except Exception as e:
            print(f"✗ Error procesando {sku}: {str(e)}\n")
    
    print(f"\n{'='*60}")
    print(f"RESULTADO: {exitosos}/{total} productos con imagen")
    print(f"{'='*60}\n")
    
    # Mostrar ubicación de archivos
    print(f"📁 Imágenes guardadas en: {MEDIA_DIR.resolve()}")
    print(f"🔗 Accesibles en: http://localhost:8000/media/productos/")
    print()

if __name__ == '__main__':
    asignar_imagenes()
