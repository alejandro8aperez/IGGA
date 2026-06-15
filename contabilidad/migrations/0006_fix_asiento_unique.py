from django.db import migrations, models


def assign_unique_asiento_numbers(apps, schema_editor):
    AsientoContable = apps.get_model('contabilidad', 'AsientoContable')
    from django.db.models import Count
    qs = AsientoContable.objects.values('numero_asiento').annotate(cnt=Count('id')).filter(cnt__gt=1)
    dups = [r['numero_asiento'] for r in qs]
    for na in dups:
        rows = list(AsientoContable.objects.filter(numero_asiento=na).order_by('id'))
        for i, row in enumerate(rows[1:], 1):
            row.numero_asiento = f'{na}-{i}'
            row.save(update_fields=['numero_asiento'])


class Migration(migrations.Migration):
    dependencies = [
        ('contabilidad', '0005_centrocosto_controlauditoria_retencion_and_more'),
    ]

    operations = [
        migrations.RunPython(assign_unique_asiento_numbers, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='asientocontable',
            name='numero_asiento',
            field=models.CharField(default=1, max_length=20, unique=True, verbose_name='Número Asiento'),
        ),
    ]
