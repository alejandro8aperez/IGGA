import os, sys, django
sys.path.insert(0, r'C:\Postgres\ERP-8AMPERIOS')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
os.environ['DEBUG'] = 'True'
os.environ['SECRET_KEY'] = 'django-insecure-test'
import django; django.setup()
from django.contrib.auth.models import User
u = User.objects.get(username='admin')
u.set_password('admin123')
u.save()
print(f'Password set. Verification: {u.check_password("admin123")}')
