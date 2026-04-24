from decimal import Decimal

from django.db import transaction

from .models import AsientoContable, Cuenta, MovimientoContable


def obtener_cuenta(codigo, nombre, tipo, nivel=2):
    cuenta, _ = Cuenta.objects.get_or_create(
        codigo=codigo,
        defaults={'nombre': nombre, 'tipo': tipo, 'nivel': nivel}
    )
    return cuenta


def crear_asiento_con_movimientos(fecha, descripcion, referencia, movimientos):
    total_debe = Decimal('0.00')
    total_haber = Decimal('0.00')
    for movimiento in movimientos:
        total_debe += Decimal(str(movimiento.get('debe', 0) or 0))
        total_haber += Decimal(str(movimiento.get('haber', 0) or 0))

    if total_debe != total_haber:
        raise ValueError('El asiento debe quedar balanceado: suma debe igual suma haber.')

    with transaction.atomic():
        asiento = AsientoContable.objects.create(
            fecha=fecha,
            descripcion=descripcion,
            referencia=referencia,
            total_debe=total_debe,
            total_haber=total_haber,
        )

        for movimiento in movimientos:
            MovimientoContable.objects.create(asiento=asiento, **movimiento)

    return asiento


def crear_asiento_pago_proveedor(fecha, orden, monto):
    cuenta_pagar = obtener_cuenta('210101', 'Cuentas por pagar proveedores', 'pasivo')
    cuenta_caja = obtener_cuenta('100101', 'Caja y bancos', 'activo')

    return crear_asiento_con_movimientos(
        fecha=fecha,
        descripcion=f"Pago OC-{orden.id} / {orden.proveedor.razon_social}",
        referencia=f"PagoCompra:{orden.id}",
        movimientos=[
            {'cuenta': cuenta_pagar, 'debe': 0, 'haber': monto, 'descripcion': f'Pago proveedor {orden.proveedor.razon_social}'},
            {'cuenta': cuenta_caja, 'debe': monto, 'haber': 0, 'descripcion': 'Salida de caja por pago de compra'},
        ],
    )


def crear_asiento_venta(factura):
    cuenta_cxc = obtener_cuenta('110101', 'Cuentas por cobrar clientes', 'activo')
    cuenta_ingresos = obtener_cuenta('410101', 'Ingresos por ventas', 'ingreso')

    return crear_asiento_con_movimientos(
        fecha=factura.fecha_emision,
        descripcion=f"Venta factura {factura.numero_factura} - {factura.orden_venta.cliente.nombre}",
        referencia=f"FacturaVenta:{factura.id}",
        movimientos=[
            {'cuenta': cuenta_cxc, 'debe': factura.total, 'haber': 0, 'descripcion': f'Venta a cliente {factura.orden_venta.cliente.nombre}'},
            {'cuenta': cuenta_ingresos, 'debe': 0, 'haber': factura.total, 'descripcion': 'Ingreso por ventas'},
        ],
    )


def crear_asiento_cobro(factura):
    cuenta_caja = obtener_cuenta('100101', 'Caja y bancos', 'activo')
    cuenta_cxc = obtener_cuenta('110101', 'Cuentas por cobrar clientes', 'activo')

    return crear_asiento_con_movimientos(
        fecha=factura.fecha_emision,
        descripcion=f"Cobro factura {factura.numero_factura} - {factura.orden_venta.cliente.nombre}",
        referencia=f"FacturaVentaCobro:{factura.id}",
        movimientos=[
            {'cuenta': cuenta_caja, 'debe': factura.total, 'haber': 0, 'descripcion': f'Cobro de factura {factura.numero_factura}'},
            {'cuenta': cuenta_cxc, 'debe': 0, 'haber': factura.total, 'descripcion': f'Baja cuenta por cobrar cliente {factura.orden_venta.cliente.nombre}'},
        ],
    )


def crear_asiento_costo_produccion(orden, costo_total, costo_materias, costo_indirecto, costo_mano_obra):
    cuenta_inventario_pt = obtener_cuenta('140101', 'Inventario producto terminado', 'activo')
    cuenta_inventario_mp = obtener_cuenta('120101', 'Inventario materia prima', 'activo')
    cuenta_costo = obtener_cuenta('510101', 'Costo de producción', 'gasto')

    movimientos = [
        {'cuenta': cuenta_inventario_pt, 'debe': costo_total, 'haber': 0, 'descripcion': f'Ingreso de producto terminado OC-{orden.id}'},
        {'cuenta': cuenta_inventario_mp, 'debe': 0, 'haber': costo_materias, 'descripcion': 'Consumo de materia prima'},
    ]

    if costo_mano_obra + costo_indirecto:
        movimientos.append(
            {'cuenta': cuenta_costo, 'debe': 0, 'haber': Decimal(str(costo_mano_obra + costo_indirecto)), 'descripcion': 'Costo recurrente y mano de obra'}
        )

    return crear_asiento_con_movimientos(
        fecha=orden.fecha_fin_estimada or orden.fecha_inicio,
        descripcion=f"Costo de producción OC-{orden.id}",
        referencia=f"CostoProduccion:{orden.id}",
        movimientos=movimientos,
    )


def crear_asiento_mantenimiento(orden, costo_total, costo_mano_obra, costo_repuestos):
    cuenta_costo_maint = obtener_cuenta('520101', 'Costo Mantenimiento', 'gasto')
    cuenta_banco = obtener_cuenta('100101', 'Caja y bancos', 'activo')

    movimientos = [
        {'cuenta': cuenta_costo_maint, 'debe': costo_total, 'haber': 0, 'descripcion': 'Costo de mano de obra y repuestos'},
        {'cuenta': cuenta_banco, 'debe': 0, 'haber': costo_total, 'descripcion': 'Pago de mantenimiento'},
    ]

    return crear_asiento_con_movimientos(
        fecha=orden.fecha_ejecución or orden.fecha_creación,
        descripcion=f"Costo mantenimiento orden {orden.numero}",
        referencia=f"Mantenimiento:{orden.numero}",
        movimientos=movimientos,
    )
