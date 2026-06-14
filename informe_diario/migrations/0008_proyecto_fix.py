"""
Migración 0008 — ERP-8AMPERIOS
Reemplaza el campo 'obra' (FK a informe_diario.Obra) por
'proyecto' (FK a operaciones.Proyecto) en InformeDiario.

Orden seguro para SQLite:
  1. Eliminar unique_together viejo  (obra, fecha)
  2. Agregar campo proyecto nullable
  3. Eliminar campo obra
  4. Crear unique_together nuevo  (proyecto, fecha)
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('informe_diario', '0007_informediario_elaborado_por_texto_and_more'),
        ('operaciones', '0001_initial'),
    ]

    operations = [
        # ── 1. Quitar el unique_together viejo ──────────────────────────
        migrations.AlterUniqueTogether(
            name='informediario',
            unique_together=set(),
        ),

        # ── 2. Agregar proyecto (null=True para no romper filas viejas) ──
        migrations.AddField(
            model_name='informediario',
            name='proyecto',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='informes_diarios',
                to='operaciones.proyecto',
                verbose_name='Proyecto/Obra',
            ),
        ),

        # ── 3. Eliminar campo obra y modelo Obra ─────────────────────────
        migrations.RemoveField(
            model_name='informediario',
            name='obra',
        ),
        migrations.DeleteModel(
            name='Obra',
        ),

        # ── 4. Nuevo unique_together con proyecto ────────────────────────
        migrations.AlterUniqueTogether(
            name='informediario',
            unique_together={('proyecto', 'fecha')},
        ),
    ]
