from rest_framework import serializers
from .models import (
    Proveedor, SolicitudCompra, DetalleSolicitudCompra,
    OrdenCompra, DetalleOrdenCompra,
    RecepcionCompra, DetalleRecepcion,
    PagoCompra, Contrato, ProductoProveedor,
)


class ProveedorSerializer(serializers.ModelSerializer):
    categoria_display = serializers.ReadOnlyField(source='get_categoria_display')
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    total_ordenes = serializers.ReadOnlyField()
    total_comprado = serializers.ReadOnlyField()

    class Meta:
        model = Proveedor
        fields = '__all__'


class ProveedorListSerializer(serializers.ModelSerializer):
    """Serializer ligero para selects y listados"""
    categoria_display = serializers.ReadOnlyField(source='get_categoria_display')

    class Meta:
        model = Proveedor
        fields = (
            'id', 'razon_social', 'nit', 'nombre_comercial',
            'categoria', 'categoria_display', 'estado',
            'contacto_nombre', 'contacto_email', 'contacto_telefono',
            'ciudad',
        )


# --- Solicitud de Compra ---

class DetalleSolicitudCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_sku = serializers.ReadOnlyField(source='producto.codigo_sku')
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor_sugerido.razon_social')

    class Meta:
        model = DetalleSolicitudCompra
        fields = '__all__'


class SolicitudCompraSerializer(serializers.ModelSerializer):
    detalles = DetalleSolicitudCompraSerializer(many=True, read_only=True)
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    prioridad_display = serializers.ReadOnlyField(source='get_prioridad_display')
    origen_display = serializers.ReadOnlyField(source='get_origen_display')

    class Meta:
        model = SolicitudCompra
        fields = '__all__'


# --- Orden de Compra ---

class DetalleOrdenCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_sku = serializers.ReadOnlyField(source='producto.codigo_sku')
    cantidad_pendiente = serializers.ReadOnlyField()
    completamente_recibido = serializers.ReadOnlyField()

    class Meta:
        model = DetalleOrdenCompra
        fields = '__all__'


class OrdenCompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    detalles = DetalleOrdenCompraSerializer(many=True, read_only=True)
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    saldo_por_pagar = serializers.ReadOnlyField()
    porcentaje_recibido = serializers.ReadOnlyField()
    esta_pagada = serializers.ReadOnlyField()

    class Meta:
        model = OrdenCompra
        fields = '__all__'


class OrdenCompraListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados"""
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    saldo_por_pagar = serializers.ReadOnlyField()

    class Meta:
        model = OrdenCompra
        fields = (
            'id', 'numero', 'proveedor', 'proveedor_nombre',
            'fecha_emision', 'fecha_entrega_esperada',
            'estado', 'estado_display', 'total', 'saldo_por_pagar',
        )


# --- Recepción ---

class DetalleRecepcionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.SerializerMethodField()

    class Meta:
        model = DetalleRecepcion
        fields = '__all__'

    def get_producto_nombre(self, obj):
        return obj.detalle_orden.producto.nombre if obj.detalle_orden else None


class RecepcionCompraSerializer(serializers.ModelSerializer):
    detalles_recepcion = DetalleRecepcionSerializer(many=True, read_only=True)
    orden_numero = serializers.ReadOnlyField(source='orden.numero')

    class Meta:
        model = RecepcionCompra
        fields = '__all__'


# --- Pago ---

class PagoCompraSerializer(serializers.ModelSerializer):
    orden_numero = serializers.ReadOnlyField(source='orden.numero')
    metodo_display = serializers.ReadOnlyField(source='get_metodo_display')

    class Meta:
        model = PagoCompra
        fields = '__all__'


# --- Contrato ---

class ContratoSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    duracion = serializers.SerializerMethodField()
    esta_vigente = serializers.ReadOnlyField()
    tipo_display = serializers.ReadOnlyField(source='get_tipo_display')
    estado_display = serializers.ReadOnlyField(source='get_estado_display')

    class Meta:
        model = Contrato
        fields = '__all__'

    def get_duracion(self, obj):
        return obj.duracion_dias()


# --- Producto-Proveedor ---

class ProductoProveedorSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_codigo_sku = serializers.ReadOnlyField(source='producto.codigo_sku')
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    proveedor_nit = serializers.ReadOnlyField(source='proveedor.nit')

    class Meta:
        model = ProductoProveedor
        fields = '__all__'
