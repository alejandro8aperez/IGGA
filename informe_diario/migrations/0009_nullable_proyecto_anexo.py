"""
Migration 0009 — Hace proyecto (InformeDiario) e informe (AnexoFoto) nullable
Permite crear drafts sin obra asignada y subir fotos sin informe guardado
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('informe_diario', '0008_proyecto_fix'),
    ]

    operations = [
        migrations.AlterField(
            model_name='informediario',
            name='proyecto',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='informes_diarios',
                to='operaciones.Proyecto',
                verbose_name='Proyecto/Obra',
            ),
        ),
        migrations.AlterField(
            model_name='anexofoto',
            name='informe',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='anexos',
                to='informe_diario.informediario',
            ),
        ),
    ]
