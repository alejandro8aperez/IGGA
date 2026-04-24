from django.db import migrations, models
import django.db.models.deletion
import decimal


class Migration(migrations.Migration):

    dependencies = [
        ('contabilidad', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PeriodoContable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=120)),
                ('fecha_inicio', models.DateField()),
                ('fecha_fin', models.DateField()),
                ('estado', models.CharField(choices=[('abierto', 'Abierto'), ('cerrado', 'Cerrado')], default='abierto', max_length=10)),
                ('descripcion', models.TextField(blank=True)),
                ('fecha_cierre', models.DateField(blank=True, null=True)),
                ('resultado', models.DecimalField(decimal_places=2, default=decimal.Decimal('0.00'), max_digits=14)),
                ('asiento_cierre', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='periodo_cierre', to='contabilidad.asientocontable')),
            ],
            options={
                'ordering': ['-fecha_inicio'],
                'verbose_name': 'Periodo Contable',
                'verbose_name_plural': 'Periodos Contables',
            },
        ),
    ]
