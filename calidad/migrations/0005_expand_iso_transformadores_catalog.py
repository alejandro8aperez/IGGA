from datetime import date

from django.db import migrations


def _safe_next_year(d):
    try:
        return d.replace(year=d.year + 1)
    except ValueError:
        return d


def expand_iso_catalog(apps, schema_editor):
    DocumentoISO = apps.get_model("calidad", "DocumentoISO")
    FormatoISO9001 = apps.get_model("calidad", "FormatoISO9001")
    ProcesoISO = apps.get_model("calidad", "ProcesoISO")

    today = date.today()
    next_review = _safe_next_year(today)

    documentos_nuevos = [
        {"codigo": "PR-CP-001", "titulo": "Procedimiento de Compras y Evaluacion de Proveedores", "categoria": "2_procedimiento"},
        {"codigo": "PR-PR-001", "titulo": "Procedimiento de Produccion de Transformadores", "categoria": "2_procedimiento"},
        {"codigo": "PR-TR-001", "titulo": "Procedimiento de Trazabilidad de Lotes", "categoria": "2_procedimiento"},
        {"codigo": "PR-LB-001", "titulo": "Procedimiento de Liberacion y Entrega de Producto", "categoria": "2_procedimiento"},
        {"codigo": "IT-SEC-001", "titulo": "Instructivo de Secado y Barnizado de Bobinas", "categoria": "3_instructivo"},
        {"codigo": "IT-TAN-001", "titulo": "Instructivo de Armado de Tanque y Accesorios", "categoria": "3_instructivo"},
        {"codigo": "IT-PLA-001", "titulo": "Instructivo de Conexionado de Placas y Bornes", "categoria": "3_instructivo"},
        {"codigo": "IT-EMP-001", "titulo": "Instructivo de Embalaje y Despacho", "categoria": "3_instructivo"},
        {"codigo": "FR-PE-002", "titulo": "Registro de Pruebas Electricas de Rutina", "categoria": "4_registro"},
        {"codigo": "FR-DIM-001", "titulo": "Formato de Verificacion Dimensional", "categoria": "4_registro"},
        {"codigo": "FR-REC-001", "titulo": "Formato de Recepcion de Materiales Criticos", "categoria": "4_registro"},
        {"codigo": "FR-DESP-001", "titulo": "Checklist de Inspeccion Pre-Despacho", "categoria": "4_registro"},
    ]

    for doc in documentos_nuevos:
        DocumentoISO.objects.update_or_create(
            codigo=doc["codigo"],
            defaults={
                "titulo": doc["titulo"],
                "categoria": doc["categoria"],
                "version": "1.0",
                "estado": "vigente",
                "fecha_aprobacion": today,
                "autor_id": None,
            },
        )

    formatos_nuevos = [
        # Produccion / pruebas de transformadores
        {"codigo": "F-PRO-003", "titulo": "Control de Bobinado BT/MT", "tipo": "control_proceso", "modulo": "produccion", "proceso": "Fabricacion de bobinas"},
        {"codigo": "F-PRO-004", "titulo": "Registro de Secado de Bobinas", "tipo": "formato_registro", "modulo": "produccion", "proceso": "Secado y barnizado"},
        {"codigo": "F-PRO-005", "titulo": "Checklist de Ensamble Final de Transformador", "tipo": "checklist", "modulo": "produccion", "proceso": "Ensamble final"},
        {"codigo": "F-PRO-006", "titulo": "Protocolo de Pruebas de Rutina IEC", "tipo": "control_proceso", "modulo": "produccion", "proceso": "Pruebas electricas de rutina"},
        # Calidad
        {"codigo": "F-CAL-005", "titulo": "Formato de Inspeccion Dimensional y Visual", "tipo": "formato_registro", "modulo": "calidad", "proceso": "Inspeccion final"},
        {"codigo": "F-CAL-006", "titulo": "Matriz de Riesgos de Calidad por Proceso", "tipo": "formato_registro", "modulo": "calidad", "proceso": "Gestion de riesgos y oportunidades"},
        # Compras / proveedores
        {"codigo": "F-COM-002", "titulo": "Acta de Homologacion de Proveedor", "tipo": "evaluacion_proveedor", "modulo": "compras", "proceso": "Homologacion de proveedores"},
        {"codigo": "F-COM-003", "titulo": "Formato de Recepcion Tecnica de Material", "tipo": "checklist", "modulo": "compras", "proceso": "Recepcion tecnica"},
        # Inventarios / trazabilidad
        {"codigo": "F-INV-002", "titulo": "Trazabilidad de Serie y Lote de Transformador", "tipo": "formato_registro", "modulo": "inventarios", "proceso": "Control de serie y lote"},
        # Ventas / despacho
        {"codigo": "F-VEN-001", "titulo": "Checklist de Documentacion de Entrega al Cliente", "tipo": "checklist", "modulo": "ventas", "proceso": "Liberacion y despacho"},
        # Mantenimiento
        {"codigo": "F-MNT-002", "titulo": "Registro de Calibracion de Equipos de Prueba", "tipo": "control_proceso", "modulo": "mantenimiento", "proceso": "Calibracion y metrologia"},
        # MRP / planeacion
        {"codigo": "F-MRP-002", "titulo": "Revision de Capacidad y Carga de Produccion", "tipo": "control_proceso", "modulo": "mrp", "proceso": "Planeacion de capacidad"},
    ]

    for f in formatos_nuevos:
        FormatoISO9001.objects.update_or_create(
            codigo=f["codigo"],
            defaults={
                "titulo": f["titulo"],
                "tipo": f["tipo"],
                "version": "1.0",
                "estado": "vigente",
                "fecha_aprobacion": today,
                "fecha_revision": next_review,
                "modulo_relacionado": f["modulo"],
                "proceso_afectado": f["proceso"],
                "descripcion": f"Formato ISO 9001 para {f['proceso']} en entorno de transformadores.",
                "motivo_cambio": "Expansion de catalogo ISO para fabrica de transformadores",
                "creado_por_id": None,
                "aprobado_por_id": None,
                "frecuencia_actualizacion": 12,
                "obligatorio": True,
                "requiere_aprobacion": True,
            },
        )

    procesos_nuevos = [
        {"nombre_proceso": "Diseno y Desarrollo de Transformadores", "modulo_erp": "kave", "descripcion": "Gestion de especificaciones, planos, listas de materiales y validaciones de diseno."},
        {"nombre_proceso": "Compras y Homologacion de Proveedores", "modulo_erp": "compras", "descripcion": "Evaluacion, aprobacion y seguimiento de proveedores criticos."},
        {"nombre_proceso": "Produccion y Ensamble de Transformadores", "modulo_erp": "produccion", "descripcion": "Bobinado, secado, ensamble de nucleo, tanque y accesorios."},
        {"nombre_proceso": "Pruebas Electricas y Liberacion", "modulo_erp": "calidad", "descripcion": "Ejecucion de pruebas de rutina, inspeccion final y liberacion del equipo."},
        {"nombre_proceso": "Trazabilidad de Lotes y Serie", "modulo_erp": "inventarios", "descripcion": "Control de materiales y equipos por lote, serie y registros asociados."},
        {"nombre_proceso": "Entrega y Satisfaccion de Cliente", "modulo_erp": "ventas", "descripcion": "Despacho, entrega documental y cierre de servicio al cliente."},
    ]

    created_processes = {}
    for p in procesos_nuevos:
        proceso, _ = ProcesoISO.objects.update_or_create(
            nombre_proceso=p["nombre_proceso"],
            modulo_erp=p["modulo_erp"],
            defaults={
                "descripcion": p["descripcion"],
                "indicadores": {},
                "frecuencia_auditoria": 12,
                "estado": "activo",
                "responsable_proceso_id": None,
            },
        )
        created_processes[(p["nombre_proceso"], p["modulo_erp"])] = proceso

    asociaciones = {
        ("Diseno y Desarrollo de Transformadores", "kave"): ["F-MRP-001", "F-MRP-002"],
        ("Compras y Homologacion de Proveedores", "compras"): ["F-COM-001", "F-COM-002", "F-COM-003"],
        ("Produccion y Ensamble de Transformadores", "produccion"): ["F-PRO-001", "F-PRO-003", "F-PRO-004", "F-PRO-005"],
        ("Pruebas Electricas y Liberacion", "calidad"): ["F-PRO-006", "F-CAL-002", "F-CAL-005"],
        ("Trazabilidad de Lotes y Serie", "inventarios"): ["F-INV-001", "F-INV-002"],
        ("Entrega y Satisfaccion de Cliente", "ventas"): ["F-VEN-001"],
    }

    for key, codigos in asociaciones.items():
        proceso = created_processes.get(key)
        if not proceso:
            continue
        formatos = list(FormatoISO9001.objects.filter(codigo__in=codigos))
        if formatos:
            proceso.formatos_iso.set(formatos)


def rollback_expand_iso_catalog(apps, schema_editor):
    DocumentoISO = apps.get_model("calidad", "DocumentoISO")
    FormatoISO9001 = apps.get_model("calidad", "FormatoISO9001")
    ProcesoISO = apps.get_model("calidad", "ProcesoISO")

    doc_codes = [
        "PR-CP-001", "PR-PR-001", "PR-TR-001", "PR-LB-001",
        "IT-SEC-001", "IT-TAN-001", "IT-PLA-001", "IT-EMP-001",
        "FR-PE-002", "FR-DIM-001", "FR-REC-001", "FR-DESP-001",
    ]
    formato_codes = [
        "F-PRO-003", "F-PRO-004", "F-PRO-005", "F-PRO-006",
        "F-CAL-005", "F-CAL-006", "F-COM-002", "F-COM-003",
        "F-INV-002", "F-VEN-001", "F-MNT-002", "F-MRP-002",
    ]
    procesos = [
        ("Diseno y Desarrollo de Transformadores", "kave"),
        ("Compras y Homologacion de Proveedores", "compras"),
        ("Produccion y Ensamble de Transformadores", "produccion"),
        ("Pruebas Electricas y Liberacion", "calidad"),
        ("Trazabilidad de Lotes y Serie", "inventarios"),
        ("Entrega y Satisfaccion de Cliente", "ventas"),
    ]

    DocumentoISO.objects.filter(codigo__in=doc_codes).delete()
    FormatoISO9001.objects.filter(codigo__in=formato_codes).delete()
    for nombre, modulo in procesos:
        ProcesoISO.objects.filter(nombre_proceso=nombre, modulo_erp=modulo).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("calidad", "0004_seed_iso9001_catalog"),
    ]

    operations = [
        migrations.RunPython(expand_iso_catalog, rollback_expand_iso_catalog),
    ]

