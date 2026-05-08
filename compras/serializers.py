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
        exclude = ('orden',)


class OrdenCompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.razon_social')
    detalles = DetalleOrdenCompraSerializer(many=True, required=False)
    estado_display = serializers.ReadOnlyField(source='get_estado_display')
    saldo_por_pagar = serializers.ReadOnlyField()
    porcentaje_recibido = serializers.ReadOnlyField()
    esta_pagada = serializers.ReadOnlyField()

    class Meta:
        model = OrdenCompra
        fields = '__all__'

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        orden = OrdenCompra.objects.create(**validated_data)
        for det in detalles_data:
            DetalleOrdenCompra.objects.create(
                orden=orden,
                **det
            )
        orden.recalcular_totales()
        return orden

    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)
        
        # Update main order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update details
        if detalles_data is not None:
            instance.detalles.all().delete()
            for det in detalles_data:
                DetalleOrdenCompra.objects.create(
                    orden=instance,
                    **det
                )
        
        instance.recalcular_totales()
        return instance


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
    proveedor_nombre = serializers.ReadOnlyField(source='orden.proveedor.razon_social')
    cantidad_total = serializers.SerializerMethodField()

    def get_cantidad_total(self, obj):
        from django.db.models import Sum
        return obj.detalles_recepcion.aggregate(total=Sum('cantidad_recibida'))['total'] or 0

    class Meta:
        model = RecepcionCompra
        fields = '__all__'

    def create(self, validated_data):
        # Mapear campos del frontend si vienen con nombres distintos
        fecha = self.initial_data.get('fecha_recepcion') or self.initial_data.get('fecha') or validated_data.get('fecha')
        if fecha:
            validated_data['fecha'] = fecha
            
        cantidad = self.initial_data.get('cantidad_recibida')
        
        recepcion = RecepcionCompra.objects.create(**validated_data)
        
        # Si se envió una cantidad total, crear un detalle para el primer producto de la OC
        # (Simplificación para el flujo rápido del frontend)
        if cantidad:
            from .models import DetalleOrdenCompra, DetalleRecepcion
            primer_detalle_oc = DetalleOrdenCompra.objects.filter(orden=recepcion.orden).first()
            if primer_detalle_oc:
                DetalleRecepcion.objects.create(
                    recepcion=recepcion,
                    detalle_orden=primer_detalle_oc,
                    cantidad_recibida=cantidad
                )
        
        return recepcion

    def update(self, instance, validated_data):
        fecha = self.initial_data.get('fecha_recepcion') or self.initial_data.get('fecha')
        if fecha:
            validated_data['fecha'] = fecha
            
        cantidad = self.initial_data.get('cantidad_recibida')
        
        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Si se envió una nueva cantidad, actualizar el primer detalle
        if cantidad:
            from .models import DetalleRecepcion
            primer_detalle = instance.detalles_recepcion.first()
            if primer_detalle:
                primer_detalle.cantidad_recibida = cantidad
                primer_detalle.save()
                
        return instance


# --- Pago ---

class PagoCompraSerializer(serializers.ModelSerializer):
    orden_numero = serializers.ReadOnlyField(source='orden.numero')
    metodo_display = serializers.ReadOnlyField(source='get_metodo_display')

    class Meta:
        model = PagoCompra
        fields = '__all__'

    def validate(self, data):
        orden = data.get('orden')
        if orden and orden.estado == 'cancelada':
            raise serializers.ValidationError("No se puede registrar pago para una orden cancelada.")
        if data.get('monto', 0) <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a cero.")
        return data


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
