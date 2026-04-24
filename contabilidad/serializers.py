from decimal import Decimal

from rest_framework import serializers
from .models import AsientoContable, Cuenta, MovimientoContable, PeriodoContable


class CuentaSerializer(serializers.ModelSerializer):
    padre_codigo = serializers.CharField(source='padre.codigo', read_only=True)
    saldo_actual = serializers.SerializerMethodField()

    class Meta:
        model = Cuenta
        fields = ('id', 'codigo', 'nombre', 'tipo', 'nivel', 'padre', 'padre_codigo', 'saldo_actual')
        read_only_fields = ('saldo_actual', 'padre_codigo')

    def get_saldo_actual(self, obj):
        return float(obj.saldo)


class MovimientoContableSerializer(serializers.ModelSerializer):
    cuenta_nombre = serializers.CharField(source='cuenta.nombre', read_only=True)

    class Meta:
        model = MovimientoContable
        fields = '__all__'

    def validate(self, attrs):
        debe = attrs.get('debe', 0) or 0
        haber = attrs.get('haber', 0) or 0

        if debe < 0 or haber < 0:
            raise serializers.ValidationError('Los valores de debe y haber deben ser positivos.')
        if debe and haber:
            raise serializers.ValidationError('Un movimiento contable no puede tener valores en debe y haber al mismo tiempo.')
        if not debe and not haber:
            raise serializers.ValidationError('Un movimiento contable debe tener valor en debe o en haber.')

        return attrs


class MovimientoContableNestedSerializer(serializers.ModelSerializer):
    cuenta_nombre = serializers.CharField(source='cuenta.nombre', read_only=True)

    class Meta:
        model = MovimientoContable
        fields = ('id', 'cuenta', 'debe', 'haber', 'descripcion', 'cuenta_nombre')


class AsientoContableSerializer(serializers.ModelSerializer):
    movimientos = MovimientoContableNestedSerializer(many=True)

    class Meta:
        model = AsientoContable
        fields = ('id', 'fecha', 'descripcion', 'referencia', 'total_debe', 'total_haber', 'movimientos')
        read_only_fields = ('total_debe', 'total_haber')

    def validate(self, attrs):
        movimientos_data = self.initial_data.get('movimientos')

        if movimientos_data is None:
            return attrs

        if len(movimientos_data) < 2:
            raise serializers.ValidationError('Un asiento contable debe contener al menos dos movimientos.')

        total_debe = Decimal('0.00')
        total_haber = Decimal('0.00')

        for movimiento in movimientos_data:
            total_debe += Decimal(str(movimiento.get('debe', 0) or 0))
            total_haber += Decimal(str(movimiento.get('haber', 0) or 0))

        if total_debe != total_haber:
            raise serializers.ValidationError('El asiento contable debe estar balanceado: suma del debe debe ser igual a suma del haber.')

        attrs['total_debe'] = total_debe
        attrs['total_haber'] = total_haber
        return attrs

    def create(self, validated_data):
        movimientos_data = validated_data.pop('movimientos', [])
        asiento = AsientoContable.objects.create(**validated_data)

        for movimiento_data in movimientos_data:
            MovimientoContable.objects.create(asiento=asiento, **movimiento_data)

        asiento.recalcular_totales()
        asiento.save(update_fields=['total_debe', 'total_haber'])
        return asiento

    def update(self, instance, validated_data):
        movimientos_data = validated_data.pop('movimientos', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if movimientos_data is not None:
            instance.movimientos.all().delete()
            for movimiento_data in movimientos_data:
                MovimientoContable.objects.create(asiento=instance, **movimiento_data)
            instance.recalcular_totales()
            instance.save(update_fields=['total_debe', 'total_haber'])

        return instance


class PeriodoContableSerializer(serializers.ModelSerializer):
    asiento_cierre_referencia = serializers.CharField(source='asiento_cierre.referencia', read_only=True)

    class Meta:
        model = PeriodoContable
        fields = '__all__'
        read_only_fields = ('resultado', 'fecha_cierre', 'asiento_cierre_referencia')
