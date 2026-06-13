#!/usr/bin/env python
"""
Script para crear categorías de supermercado/panadería en ERP 8AMPERIOS.
Ejecutar: D:\postgres\erp-8amperios\venv\Scripts\python.exe crear_categorias.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from inventarios.models import Categoria

CATEGORIAS = [
    # === PANADERIA Y REPOSTERIA (La Boquilla) ===
    {"nombre": "Pan de Molde", "descripcion": "Pan blanco, integral, multicereal"},
    {"nombre": "Pan Artesanal", "descripcion": "Baguettes, ciabatta, focaccia"},
    {"nombre": "Pan Dulce", "descripcion": "Conchas, besos, orejas, cuernitos"},
    {"nombre": "Pasteles y Tortas", "descripcion": "Tortas de cumpleaños, bodas, eventos"},
    {"nombre": "Cupcakes y Muffins", "descripcion": "Cupcakes decorados, muffins de sabores"},
    {"nombre": "Galletas", "descripcion": "Galletas de mantequilla, chispas, avena"},
    {"nombre": "Brownies y Barras", "descripcion": "Brownies, blondies, barras de cereal"},
    {"nombre": "Postres en Vaso", "descripcion": "Tiramisu, cheesecake, mousse"},
    {"nombre": "Dulces Tipicos", "descripcion": "Cocadas, alegrias, panelitas"},
    {"nombre": "Pan Sin Gluten", "descripcion": "Pan y productos para celiacos"},
    {"nombre": "Pan Integral y Saludable", "descripcion": "Pan con semillas, bajo en sodio"},
    {"nombre": "Croissants y Hojaldres", "descripcion": "Croissants, pain au chocolat, palmeras"},
    {"nombre": "Donas y Berlinesas", "descripcion": "Donas glaseadas, rellenas, berlinesas"},
    {"nombre": "Empanadas y Pasteles", "descripcion": "Empanadas de carne, pollo, hawaiana"},
    {"nombre": "Pizza Preparada", "descripcion": "Pizzas listas para hornear"},
    
    # === LACTEOS Y HUEVOS ===
    {"nombre": "Leche", "descripcion": "Leche entera, descremada, semidescremada"},
    {"nombre": "Queso", "descripcion": "Queso fresco, mozzarella, cheddar, parmesano"},
    {"nombre": "Yogurt", "descripcion": "Yogurt natural, griego, bebible"},
    {"nombre": "Mantequilla y Margarina", "descripcion": "Mantequilla con/sin sal, margarina"},
    {"nombre": "Crema de Leche", "descripcion": "Crema para batir, crema agria"},
    {"nombre": "Huevos", "descripcion": "Huevos AA, A, B, organicos"},
    
    # === CARNES Y EMBUTIDOS ===
    {"nombre": "Carne de Res", "descripcion": "Corte de res, molida, para asar"},
    {"nombre": "Carne de Cerdo", "descripcion": "Chuleta, lomo, costilla, tocino"},
    {"nombre": "Pollo y Aves", "descripcion": "Pechuga, pierna, alitas, entero"},
    {"nombre": "Pescados y Mariscos", "descripcion": "Pescado fresco, congelado, camarones"},
    {"nombre": "Embutidos", "descripcion": "Jamon, salchicha, chorizo, mortadela"},
    {"nombre": "Carnes Frias", "descripcion": "Jamon de pavo, pechuga, salami"},
    
    # === FRUTAS Y VERDURAS ===
    {"nombre": "Frutas Frescas", "descripcion": "Manzana, banano, naranja, uva"},
    {"nombre": "Verduras Frescas", "descripcion": "Lechuga, tomate, cebolla, zanahoria"},
    {"nombre": "Frutas Congeladas", "descripcion": "Mix de frutas, pulpas, berries"},
    {"nombre": "Verduras Congeladas", "descripcion": "Brocoli, espinaca, mix de verduras"},
    {"nombre": "Hierbas y Especias Frescas", "descripcion": "Cilantro, perejil, albahaca, romero"},
    
    # === ABARROTES ===
    {"nombre": "Arroz y Granos", "descripcion": "Arroz blanco, integral, lentejas, frijoles"},
    {"nombre": "Pastas", "descripcion": "Espagueti, penne, fettuccine, lasagna"},
    {"nombre": "Aceites y Vinagres", "descripcion": "Aceite de oliva, vegetal, vinagre"},
    {"nombre": "Salsas y Aderezos", "descripcion": "Salsa de tomate, mayonesa, mostaza"},
    {"nombre": "Condimentos", "descripcion": "Sal, pimienta, comino, oregano"},
    {"nombre": "Conservas y Enlatados", "descripcion": "Atun, sardinas, vegetales enlatados"},
    {"nombre": "Cereales", "descripcion": "Avena, corn flakes, granola"},
    {"nombre": "Harinas y Polvos", "descripcion": "Harina de trigo, maiz, polvo para hornear"},
    {"nombre": "Azucar y Endulzantes", "descripcion": "Azucar blanca, morena, stevia, miel"},
    {"nombre": "Chocolate y Cacao", "descripcion": "Chocolate en barra, polvo de cacao, cobertura"},
    {"nombre": "Chocolatinas y Dulces", "descripcion": "Chocolatinas, caramelos, gomitas"},
    {"nombre": "Snacks", "descripcion": "Papas fritas, nachos, mani, palomitas"},
    
    # === BEBIDAS ===
    {"nombre": "Agua", "descripcion": "Agua sin gas, con gas, saborizada"},
    {"nombre": "Jugos y Nectares", "descripcion": "Jugo de naranja, mango, manzana"},
    {"nombre": "Gaseosas", "descripcion": "Coca-Cola, Pepsi, Sprite, gaseosas de cola"},
    {"nombre": "Bebidas Energeticas", "descripcion": "Red Bull, Monster, bebidas deportivas"},
    {"nombre": "Vinos y Licores", "descripcion": "Vino tinto, blanco, ron, whisky"},
    {"nombre": "Bebidas Calientes", "descripcion": "Cafe, te, chocolate caliente, avena"},
    
    # === LIMPIEZA Y HOGAR ===
    {"nombre": "Detergentes", "descripcion": "Detergente en polvo, liquido, para ropa"},
    {"nombre": "Jabones", "descripcion": "Jabon de bano, antibacterial, en barra"},
    {"nombre": "Papel Higienico y Servilletas", "descripcion": "Papel higienico, toallas de papel"},
    {"nombre": "Productos de Limpieza", "descripcion": "Desinfectante, cloro, limpiavidrios"},
    {"nombre": "Articulos de Cocina", "descripcion": "Platos, vasos, cubiertos desechables"},
    
    # === CONGELADOS ===
    {"nombre": "Helados", "descripcion": "Helado de vainilla, chocolate, frutas"},
    {"nombre": "Comidas Preparadas", "descripcion": "Lasagna, pasta, arroz con pollo congelado"},
    {"nombre": "Panes Congelados", "descripcion": "Pan para hornear, masas congeladas"},
    
    # === MASCOTAS ===
    {"nombre": "Alimento para Perros", "descripcion": "Croquetas, comida humeda, snacks"},
    {"nombre": "Alimento para Gatos", "descripcion": "Croquetas, comida humeda, arena"},
    
    # === BEBES ===
    {"nombre": "Panales", "descripcion": "Panales desechables, toallitas humedas"},
    {"nombre": "Formula Infantil", "descripcion": "Leche en polvo para bebes, cereales"},
]

def crear_categorias():
    creadas = 0
    existentes = 0

    for cat in CATEGORIAS:
        obj, created = Categoria.objects.get_or_create(
            nombre=cat["nombre"],
            defaults={"descripcion": cat["descripcion"]}
        )
        if created:
            creadas += 1
            print(f"Creada: {cat['nombre']}")
        else:
            existentes += 1

    print(f"\n{'='*60}")
    print(f"RESUMEN:")
    print(f"  Categorias creadas: {creadas}")
    print(f"  Categorias existentes: {existentes}")
    print(f"  Total en base de datos: {Categoria.objects.count()}")
    print(f"{'='*60}")

if __name__ == '__main__':
    crear_categorias()
