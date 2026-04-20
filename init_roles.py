#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from venta.models import OrdenVenta
from compras.models import OrdenCompra
from produccion.models import OrdenProduccion
from mantenimiento.models import OrdenMantenimiento

# Crear grupos
admin_group, created = Group.objects.get_or_create(name='Admin')
vendedor_group, created = Group.objects.get_or_create(name='Vendedor')
comprador_group, created = Group.objects.get_or_create(name='Comprador')
produccion_group, created = Group.objects.get_or_create(name='Producción')
mantenimiento_group, created = Group.objects.get_or_create(name='Mantenimiento')

# Asignar permisos
# Vendedor: ventas
venta_ct = ContentType.objects.get_for_model(OrdenVenta)
venta_perms = Permission.objects.filter(content_type=venta_ct)
vendedor_group.permissions.set(venta_perms)

# Comprador: compras
compra_ct = ContentType.objects.get_for_model(OrdenCompra)
compra_perms = Permission.objects.filter(content_type=compra_ct)
comprador_group.permissions.set(compra_perms)

# Producción: ordenes producción
orden_prod_ct = ContentType.objects.get_for_model(OrdenProduccion)
orden_prod_perms = Permission.objects.filter(content_type=orden_prod_ct)
produccion_group.permissions.set(orden_prod_perms)

# Mantenimiento: ordenes mantenimiento
orden_mant_ct = ContentType.objects.get_for_model(OrdenMantenimiento)
orden_mant_perms = Permission.objects.filter(content_type=orden_mant_ct)
mantenimiento_group.permissions.set(orden_mant_perms)

# Admin: todos los permisos
all_perms = Permission.objects.all()
admin_group.permissions.set(all_perms)

print('Roles and permissions initialized')