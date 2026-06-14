from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('informe_diario', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='informediario',
            old_name='obra',
            new_name='proyecto',
        ),
        migrations.AlterField(
            model_name='informediario',
            name='proyecto',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='informes_diarios', to='operaciones.proyecto', verbose_name='Proyecto/Obra'),
        ),
        migrations.DeleteModel(
            name='Obra',
        ),
    ]