from datetime import date

from django.db import migrations


def seed_iso_audit_matrix(apps, schema_editor):
    DocumentoISO = apps.get_model("calidad", "DocumentoISO")
    FormatoISO9001 = apps.get_model("calidad", "FormatoISO9001")

    today = date.today()
    try:
        review_date = today.replace(year=today.year + 1)
    except ValueError:
        review_date = today

    # Documento maestro de auditoria (visible en Control de Calidad > Estructura documental)
    DocumentoISO.objects.update_or_create(
        codigo="MAT-ISO-001",
        defaults={
            "titulo": "Matriz Maestra de Cumplimiento ISO 9001 (Clausulas 4-10)",
            "categoria": "1_base",
            "version": "1.0",
            "estado": "vigente",
            "fecha_aprobacion": today,
            "autor_id": None,
        },
    )

    # Formatos transversales de auditoria/direccion/mejora continua
    formatos = [
        {
            "codigo": "MAT-CTX-001",
            "titulo": "Matriz de Contexto y Partes Interesadas",
            "tipo": "formato_registro",
            "modulo": "calidad",
            "proceso": "Planificacion estrategica del SGC",
        },
        {
            "codigo": "MAP-PROC-001",
            "titulo": "Mapa e Interaccion de Procesos SGC",
            "tipo": "control_proceso",
            "modulo": "calidad",
            "proceso": "Gestion integral por procesos",
        },
        {
            "codigo": "MAT-RACI-001",
            "titulo": "Matriz RACI de Responsabilidades del SGC",
            "tipo": "formato_registro",
            "modulo": "rrhh",
            "proceso": "Asignacion de roles y responsabilidades",
        },
        {
            "codigo": "PLAN-OBJ-001",
            "titulo": "Plan de Objetivos de Calidad e Indicadores",
            "tipo": "control_proceso",
            "modulo": "finanzas",
            "proceso": "Seguimiento de objetivos y KPIs",
        },
        {
            "codigo": "RH-COMP-001",
            "titulo": "Matriz de Competencias y Plan de Capacitacion",
            "tipo": "formato_registro",
            "modulo": "rrhh",
            "proceso": "Competencia y toma de conciencia del personal",
        },
        {
            "codigo": "ACT-RD-001",
            "titulo": "Acta de Revision por la Direccion",
            "tipo": "informe_auditoria",
            "modulo": "multi_empresa",
            "proceso": "Revision por la direccion",
        },
        {
            "codigo": "PLAN-MC-001",
            "titulo": "Plan de Mejora Continua del SGC",
            "tipo": "accion_correctiva",
            "modulo": "calidad",
            "proceso": "Mejora continua y eficacia del SGC",
        },
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
                "fecha_revision": review_date,
                "modulo_relacionado": f["modulo"],
                "proceso_afectado": f["proceso"],
                "descripcion": f"Formato maestro ISO 9001 para auditoria externa: {f['proceso']}.",
                "motivo_cambio": "Incorporacion de matriz maestra de auditoria ISO 9001",
                "creado_por_id": None,
                "aprobado_por_id": None,
                "frecuencia_actualizacion": 12,
                "obligatorio": True,
                "requiere_aprobacion": True,
            },
        )


def rollback_iso_audit_matrix(apps, schema_editor):
    DocumentoISO = apps.get_model("calidad", "DocumentoISO")
    FormatoISO9001 = apps.get_model("calidad", "FormatoISO9001")

    DocumentoISO.objects.filter(codigo="MAT-ISO-001").delete()
    FormatoISO9001.objects.filter(
        codigo__in=[
            "MAT-CTX-001",
            "MAP-PROC-001",
            "MAT-RACI-001",
            "PLAN-OBJ-001",
            "RH-COMP-001",
            "ACT-RD-001",
            "PLAN-MC-001",
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("calidad", "0005_expand_iso_transformadores_catalog"),
    ]

    operations = [
        migrations.RunPython(seed_iso_audit_matrix, rollback_iso_audit_matrix),
    ]

