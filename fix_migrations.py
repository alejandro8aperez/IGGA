import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.db import connection
cursor = connection.cursor()
cursor.execute("DELETE FROM django_migrations WHERE app='informe_diario' AND name LIKE '0008%'")
connection.commit()
print(f"Filas eliminadas: {cursor.rowcount}")
print("Listo — ahora corre: python manage.py migrate")
