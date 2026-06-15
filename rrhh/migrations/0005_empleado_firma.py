from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rrhh', '0004_conceptonomina_periodonomina_nomina_detallenomina'),
    ]

    operations = [
        migrations.AddField(
            model_name='empleado',
            name='firma',
            field=models.ImageField(blank=True, null=True, upload_to='rrhh/firmas/'),
        ),
    ]
