from django.db import models
from django.contrib.auth.models import User
import json

class MenuConfig(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    modulos_visibles = models.JSONField(default=list)  # Lista de módulos visibles, e.g. ['venta', 'compras']
    menu_personalizado = models.JSONField(default=dict)  # JSON con configuración de menú

    def __str__(self):
        return f"Config menú {self.usuario.username}"

class FormFormat(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    json_design = models.JSONField()
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre
