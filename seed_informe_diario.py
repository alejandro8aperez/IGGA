"""
Script para poblar la base de datos con las categorías y recursos iniciales
para el módulo de Informe Diario de Obra.

INSTRUCCIONES DE USO:
1. Copia este archivo a la raíz de tu proyecto Django (donde está manage.py)
2. Ejecuta: python manage.py shell < seed_informe_diario.py
   O ejecuta: python manage.py shell
   Y luego: exec(open('seed_informe_diario.py').read())

Este script crea:
- 2 Categorías de Recursos (Maquinaria y Personal)
- Recursos de Maquinaria según el formato F-141-IN
- Recursos de Personal según el formato F-141-IN
- Categorías de Actividades según el formato F-141-IN
"""

from informe_diario.models import CategoriaRecurso, Recurso, CategoriaActividad

print("=" * 60)
print("POBLANDO DATOS PARA INFORME DIARIO DE OBRA")
print("=" * 60)

# =============================================================================
# CATEGORÍAS DE RECURSOS
# =============================================================================
print("\n[1/4] Creando Categorías de Recursos...")

cat_maquinaria, created = CategoriaRecurso.objects.get_or_create(
    nombre="MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS",
    defaults={'orden': 1}
)
print(f"  {'✓ Creada' if created else '→ Ya existe'}: {cat_maquinaria.nombre}")

cat_personal, created = CategoriaRecurso.objects.get_or_create(
    nombre="PERSONAL DE OBRA",
    defaults={'orden': 2}
)
print(f"  {'✓ Creada' if created else '→ Ya existe'}: {cat_personal.nombre}")

# =============================================================================
# RECURSOS DE MAQUINARIA / EQUIPOS / VEHÍCULOS
# (Según el formato F-141-IN del PDF)
# =============================================================================
print("\n[2/4] Creando Recursos de Maquinaria/Equipos/Vehículos...")

maquinaria_items = [
    # Vehículos
    ("CAMIONETAS (Siemens)", "unidad", 1),
    ("CAMIONETAS (Edemsa)", "unidad", 2),
    ("CAMIONETAS (CTE Intercolombia)", "unidad", 3),
    ("CAMIONETAS (Interventoría)", "unidad", 4),
    ("CAMION DE HERRAMIENTAS", "unidad", 5),
    ("CAMION GRUA (Edemsa)", "unidad", 6),
    ("CAMION PLATAFORMA (Siemens)", "unidad", 7),
    ("CAMABAJA (Edemsa)", "unidad", 8),
    ("BUS (Edemsa)", "unidad", 9),
    ("BUS (Siemens)", "unidad", 10),
    
    # Equipos pesados
    ("GRUA TELESCOPICA (Edemsa)", "unidad", 11),
    ("GRUA BRAZO ARTICULADO (Edemsa)", "unidad", 12),
    ("BRAZO HIDRAULICO (Siemens)", "unidad", 13),
    ("RETROEXCAVADORA (Edemsa)", "unidad", 14),
    ("MINI CARGADOR (Edemsa)", "unidad", 15),
    ("VIBROCOMPACTADOR (Edemsa)", "unidad", 16),
    ("VOLQUETA (Edemsa)", "unidad", 17),
    ("MIXER (Edemsa)", "unidad", 18),
    ("MOTONIVELADORA", "unidad", 19),
    ("CARRO TANQUE", "unidad", 20),
    
    # Equipos de trabajo
    ("GENERADORES", "unidad", 21),
    ("PLANTA ELECTRICA", "unidad", 22),
    ("COMPRESOR", "unidad", 23),
    ("TORRE DE ILUMINACION", "unidad", 24),
    ("MOTOBOMBA", "unidad", 25),
    ("TALADRO", "unidad", 26),
    ("PULIDORA", "unidad", 27),
    ("EQUIPO DE SOLDADURA", "unidad", 28),
    ("EQUIPO DE OXICORTE", "unidad", 29),
    ("ANDAMIOS", "unidad", 30),
    ("ESCALERAS", "unidad", 31),
    ("HERRAMIENTAS MENORES", "unidad", 32),
]

for nombre, unidad, orden in maquinaria_items:
    recurso, created = Recurso.objects.get_or_create(
        categoria=cat_maquinaria,
        nombre=nombre,
        defaults={'unidad': unidad, 'orden': orden, 'activo': True}
    )
    if created:
        print(f"  ✓ {nombre}")

print(f"  → Total recursos de maquinaria: {Recurso.objects.filter(categoria=cat_maquinaria).count()}")

# =============================================================================
# RECURSOS DE PERSONAL DE OBRA
# (Según el formato F-141-IN del PDF)
# =============================================================================
print("\n[3/4] Creando Recursos de Personal de Obra...")

personal_items = [
    # Supervisión e Interventoría
    ("Coordinadora SST", "persona", 1),
    ("Director de proyecto", "persona", 2),
    ("Residente Técnico", "persona", 3),
    ("Inspector Técnico", "persona", 4),
    ("Inspector SST", "persona", 5),
    ("Inspector Ambiental", "persona", 6),
    ("Auxiliar de Interventoría", "persona", 7),
    
    # Personal Siemens
    ("Gerente de Proyecto (Siemens)", "persona", 10),
    ("Ingeniero Residente (Siemens)", "persona", 11),
    ("Ingeniero de Montaje (Siemens)", "persona", 12),
    ("Ingeniero de Pruebas (Siemens)", "persona", 13),
    ("Supervisor de Montaje (Siemens)", "persona", 14),
    ("Técnico Electricista (Siemens)", "persona", 15),
    ("Técnico de Pruebas (Siemens)", "persona", 16),
    ("Ayudante Eléctrico (Siemens)", "persona", 17),
    ("Oficial de Cableado (Siemens)", "persona", 18),
    ("Ayudante de Cableado (Siemens)", "persona", 19),
    
    # Personal CTE Intercolombia
    ("Ingeniero Residente (CTE)", "persona", 20),
    ("Supervisor (CTE)", "persona", 21),
    ("Técnico Electricista (CTE)", "persona", 22),
    ("Oficial (CTE)", "persona", 23),
    ("Ayudante (CTE)", "persona", 24),
    
    # Personal Edemsa (Obra Civil)
    ("Ingeniero Residente (Edemsa)", "persona", 30),
    ("Maestro de Obra (Edemsa)", "persona", 31),
    ("Oficial de Construcción (Edemsa)", "persona", 32),
    ("Ayudante de Construcción (Edemsa)", "persona", 33),
    ("Operador de Maquinaria (Edemsa)", "persona", 34),
    ("Conductor (Edemsa)", "persona", 35),
    ("Albañil (Edemsa)", "persona", 36),
    ("Armador (Edemsa)", "persona", 37),
    ("Carpintero (Edemsa)", "persona", 38),
    ("Soldador (Edemsa)", "persona", 39),
    ("Pintor (Edemsa)", "persona", 40),
    
    # SST y Otros
    ("Profesional SST", "persona", 50),
    ("Auxiliar SST", "persona", 51),
    ("Profesional Ambiental", "persona", 52),
    ("Profesional Social", "persona", 53),
    ("Vigía de Seguridad", "persona", 54),
    ("Almacenista", "persona", 55),
    ("Auxiliar Administrativo", "persona", 56),
]

for nombre, unidad, orden in personal_items:
    recurso, created = Recurso.objects.get_or_create(
        categoria=cat_personal,
        nombre=nombre,
        defaults={'unidad': unidad, 'orden': orden, 'activo': True}
    )
    if created:
        print(f"  ✓ {nombre}")

print(f"  → Total recursos de personal: {Recurso.objects.filter(categoria=cat_personal).count()}")

# =============================================================================
# CATEGORÍAS DE ACTIVIDADES
# (Según el formato F-141-IN del PDF)
# =============================================================================
print("\n[4/4] Creando Categorías de Actividades...")

categorias_actividades = [
    ("ACTIVIDADES ADMINISTRATIVAS Y DOCUMENTALES (INGESED)", 1),
    ("ACTIVIDADES DE CABLEADO, CONEXIONADO Y PRUEBAS (SIEMENS)", 2),
    ("ACTIVIDADES DE PRUEBAS DE EQUIPOS Y MONTAJE (CTE INTERCOLOMBIA)", 3),
    ("ACTIVIDADES DE OBRA CIVIL (EDEMSA)", 4),
    ("ACTIVIDADES DE SEGURIDAD Y SALUD EN EL TRABAJO", 5),
    ("ACTIVIDADES AMBIENTALES-SOCIALES", 6),
]

for nombre, orden in categorias_actividades:
    cat_act, created = CategoriaActividad.objects.get_or_create(
        nombre=nombre,
        defaults={'orden': orden, 'activo': True}
    )
    print(f"  {'✓ Creada' if created else '→ Ya existe'}: {nombre[:50]}...")

# =============================================================================
# RESUMEN FINAL
# =============================================================================
print("\n" + "=" * 60)
print("RESUMEN")
print("=" * 60)
print(f"Categorías de Recursos: {CategoriaRecurso.objects.count()}")
print(f"Recursos totales:       {Recurso.objects.count()}")
print(f"  - Maquinaria:         {Recurso.objects.filter(categoria=cat_maquinaria).count()}")
print(f"  - Personal:           {Recurso.objects.filter(categoria=cat_personal).count()}")
print(f"Categorías Actividades: {CategoriaActividad.objects.count()}")
print("=" * 60)
print("¡DATOS POBLADOS CORRECTAMENTE!")
print("Ahora el formulario de Informe Diario mostrará todas las secciones.")
print("=" * 60)
