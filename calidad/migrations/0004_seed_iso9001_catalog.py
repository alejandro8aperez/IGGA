from datetime import date

from django.db import migrations


def seed_iso9001_catalog(apps, schema_editor):
    DocumentoISO = apps.get_model("calidad", "DocumentoISO")
    FormatoISO9001 = apps.get_model("calidad", "FormatoISO9001")

    today = date.today()

    documentos = [
        # 1. Base del sistema
        {"codigo": "MC-001", "titulo": "Manual de Calidad SGC 8AMPERIOS", "categoria": "1_base"},
        {"codigo": "POL-001", "titulo": "Politica de Calidad y Objetivos SGC", "categoria": "1_base"},
        # 2. Procedimientos obligatorios
        {"codigo": "PR-DC-001", "titulo": "Control de Documentos e Informacion Documentada", "categoria": "2_procedimiento"},
        {"codigo": "PR-RA-001", "titulo": "Gestion de Riesgos y Oportunidades", "categoria": "2_procedimiento"},
        {"codigo": "PR-NC-001", "titulo": "Tratamiento de No Conformidades y CAPA", "categoria": "2_procedimiento"},
        {"codigo": "PR-AU-001", "titulo": "Auditorias Internas del SGC", "categoria": "2_procedimiento"},
        # 3. Instructivos de fabricacion
        {"codigo": "IT-BB-001", "titulo": "Instructivo de Bobinado Baja Tension", "categoria": "3_instructivo"},
        {"codigo": "IT-BM-001", "titulo": "Instructivo de Bobinado Media Tension", "categoria": "3_instructivo"},
        {"codigo": "IT-EN-001", "titulo": "Instructivo de Ensamble de Nucleo y Carcasa", "categoria": "3_instructivo"},
        {"codigo": "IT-PE-001", "titulo": "Instructivo de Pruebas Electricas Finales", "categoria": "3_instructivo"},
        # 4. Registros y evidencias
        {"codigo": "FR-IN-001", "titulo": "Formato de Inspeccion de Producto Terminado", "categoria": "4_registro"},
        {"codigo": "FR-NC-001", "titulo": "Formato de Reporte de No Conformidad", "categoria": "4_registro"},
        {"codigo": "FR-CP-001", "titulo": "Checklist de Proveedores Criticos", "categoria": "4_registro"},
        {"codigo": "FR-AU-001", "titulo": "Formato de Hallazgos de Auditoria", "categoria": "4_registro"},
    ]

    for d in documentos:
        DocumentoISO.objects.update_or_create(
            codigo=d["codigo"],
            defaults={
                "titulo": d["titulo"],
                "categoria": d["categoria"],
                "version": "1.0",
                "estado": "vigente",
                "fecha_aprobacion": today,
                "autor_id": None,
            },
        )

    formatos = [
        {"codigo": "F-CAL-001", "titulo": "Checklist de Inspeccion de Calidad en Recepcion", "tipo": "checklist", "modulo": "calidad", "proceso": "Inspeccion de materiales"},
        {"codigo": "F-CAL-002", "titulo": "Formato de Liberacion de Producto", "tipo": "formato_registro", "modulo": "calidad", "proceso": "Liberacion de producto terminado"},
        {"codigo": "F-CAL-003", "titulo": "Reporte de No Conformidad y Accion Correctiva", "tipo": "accion_correctiva", "modulo": "calidad", "proceso": "Gestion de no conformidades"},
        {"codigo": "F-CAL-004", "titulo": "Informe de Auditoria Interna SGC", "tipo": "informe_auditoria", "modulo": "calidad", "proceso": "Auditoria interna ISO 9001"},
        {"codigo": "F-PRO-001", "titulo": "Instructivo de Bobinado Controlado", "tipo": "instructivo", "modulo": "produccion", "proceso": "Bobinado de transformadores"},
        {"codigo": "F-PRO-002", "titulo": "Instructivo de Prueba de Rigidez Dielectrica", "tipo": "instructivo", "modulo": "produccion", "proceso": "Pruebas electricas"},
        {"codigo": "F-COM-001", "titulo": "Evaluacion de Proveedores Criticos", "tipo": "evaluacion_proveedor", "modulo": "compras", "proceso": "Homologacion y reevaluacion"},
        {"codigo": "F-MRP-001", "titulo": "Control de Cambios de Plan Maestro", "tipo": "control_proceso", "modulo": "mrp", "proceso": "Planeacion de materiales"},
        {"codigo": "F-MNT-001", "titulo": "Checklist de Mantenimiento Preventivo de Equipos", "tipo": "checklist", "modulo": "mantenimiento", "proceso": "Mantenimiento preventivo"},
        {"codigo": "F-INV-001", "titulo": "Formato de Trazabilidad de Lote", "tipo": "formato_registro", "modulo": "inventarios", "proceso": "Trazabilidad de inventario"},
    ]

    for f in formatos:
        FormatoISO9001.objects.update_or_create(
            codigo=f["codigo"],
            defaults={
                "titulo": f["titulo"],
                "tipo": f["tipo"],
                "version": "1.0",
                "estado": "vigente",
                "fecha_aprobacion": today,
                "fecha_revision": today.replace(year=today.year + 1) if today.month != 2 or today.day != 29 else today,
                "modulo_relacionado": f["modulo"],
                "proceso_afectado": f["proceso"],
                "descripcion": f"Documento base ISO 9001 para {f['proceso']}.",
                "motivo_cambio": "Carga inicial del catalogo ISO 9001",
                "creado_por_id": None,
                "aprobado_por_id": None,
                "frecuencia_actualizacion": 12,
                "obligatorio": True,
                "requiere_aprobacion": True,
            },
        )


def unseed_iso9001_catalog(apps, schema_editor):
    DocumentoISO = apps.get_model("calidad", "DocumentoISO")
    FormatoISO9001 = apps.get_model("calidad", "FormatoISO9001")

    doc_codes = [
        "MC-001", "POL-001", "PR-DC-001", "PR-RA-001", "PR-NC-001", "PR-AU-001",
        "IT-BB-001", "IT-BM-001", "IT-EN-001", "IT-PE-001",
        "FR-IN-001", "FR-NC-001", "FR-CP-001", "FR-AU-001",
    ]
    formato_codes = [
        "F-CAL-001", "F-CAL-002", "F-CAL-003", "F-CAL-004",
        "F-PRO-001", "F-PRO-002", "F-COM-001", "F-MRP-001",
        "F-MNT-001", "F-INV-001",
    ]

    DocumentoISO.objects.filter(codigo__in=doc_codes).delete()
    FormatoISO9001.objects.filter(codigo__in=formato_codes).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("calidad", "0003_formatoiso9001_procesoiso_trazabilidadiso_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_iso9001_catalog, unseed_iso9001_catalog),
    ]

