"""
MRP Engine - Algoritmo core de Material Requirements Planning
Implementación del algoritmo clásico MRP con capacidades avanzadas
"""

from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum, Q, F
from django.utils import timezone
from .models import (
    PlanMaestroProduccion, ListaMateriales, RequerimientoMaterial, 
    PlanCapacidad, EjecucionMRP
)
from inventarios.models import Producto, MovimientoInventario

class MRPProcessor:
    """Procesador principal de MRP"""
    
    def __init__(self, fecha_inicio, fecha_fin, parametros=None):
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.parametros = parametros or {}
        self.ejecucion = None
        self.requerimientos_brutos = {}
        self.requerimientos_netos = {}
        
    def ejecutar_mrp(self):
        """Ejecutar proceso MRP completo"""
        try:
            # Crear registro de ejecución
            self.ejecucion = EjecucionMRP.objects.create(
                fecha_plan_desde=self.fecha_inicio,
                fecha_plan_hasta=self.fecha_fin,
                parametros=self.parametros
            )
            
            # Paso 1: Obtener requerimientos brutos del MPS
            self.calcular_requerimientos_brutos()
            
            # Paso 2: Explosion de BOM para todos los niveles
            self.explotar_bom_todos_niveles()
            
            # Paso 3: Calcular requerimientos netos
            self.calcular_requerimientos_netos()
            
            # Paso 4: Planificación de capacidad (CRP)
            self.planificar_capacidad()
            
            # Paso 5: Generar recomendaciones
            self.generar_recomendaciones()
            
            # Actualizar estado de ejecución
            self.ejecucion.estado = 'completado'
            self.ejecucion.resumen = {
                'requerimientos_brutos': len(self.requerimientos_brutos),
                'requerimientos_netos': len(self.requerimientos_netos),
                'productos_afectados': len(set(k[0] for k in self.requerimientos_netos.keys())),
                'periodo_plan': f"{self.fecha_inicio} - {self.fecha_fin}"
            }
            self.ejecucion.save()
            
            return True, "MRP ejecutado exitosamente"
            
        except Exception as e:
            if self.ejecucion:
                self.ejecucion.estado = 'error'
                self.ejecucion.mensaje = str(e)
                self.ejecucion.save()
            return False, f"Error en ejecución MRP: {str(e)}"
    
    def calcular_requerimientos_brutos(self):
        """Paso 1: Calcular requerimientos brutos desde MPS"""
        mps_items = PlanMaestroProduccion.objects.filter(
            fecha_inicio__gte=self.fecha_inicio,
            fecha_fin__lte=self.fecha_fin,
            estado__in=['planificado', 'en_progreso']
        ).order_by('fecha_inicio')
        
        for mps in mps_items:
            # Distribuir la cantidad planificada en el período
            dias_totales = (mps.fecha_fin - mps.fecha_inicio).days + 1
            cantidad_diaria = mps.cantidad_planificada / dias_totales
            
            fecha_actual = mps.fecha_inicio
            while fecha_actual <= mps.fecha_fin:
                clave = (mps.producto.id, fecha_actual)
                if clave not in self.requerimientos_brutos:
                    self.requerimientos_brutos[clave] = Decimal('0')
                self.requerimientos_brutos[clave] += Decimal(str(cantidad_diaria))
                fecha_actual += timedelta(days=1)
    
    def explotar_bom_todos_niveles(self):
        """Paso 2: Explosion de BOM recursiva para todos los niveles"""
        requerimientos_expandidos = {}
        
        # Procesar cada requerimiento bruto
        for (producto_id, fecha), cantidad in self.requerimientos_brutos.items():
            self._explotar_bom_recursivo(
                producto_id, 
                cantidad, 
                fecha, 
                requerimientos_expandidos,
                nivel=0
            )
        
        # Combinar requerimientos brutos originales con los expandidos
        for clave, cantidad in requerimientos_expandidos.items():
            if clave in self.requerimientos_brutos:
                self.requerimientos_brutos[clave] += cantidad
            else:
                self.requerimientos_brutos[clave] = cantidad
    
    def _explotar_bom_recursivo(self, producto_id, cantidad, fecha, 
                              requerimientos_expandidos, nivel=0, 
                              ruta_productos=None):
        """Explosión BOM recursiva"""
        if ruta_productos is None:
            ruta_productos = []
        
        # Evitar ciclos
        if producto_id in ruta_productos:
            return
        
        ruta_productos.append(producto_id)
        
        # Obtener BOM para este producto
        bom_items = ListaMateriales.objects.filter(
            producto_padre_id=producto_id,
            efectiva_desde__lte=fecha
        ).filter(
            Q(efectiva_hasta__isnull=True) | Q(efectiva_hasta__gte=fecha)
        )
        
        for bom in bom_items:
            # Calcular cantidad requerida con desperdicio
            desperdicio_factor = (100 + bom.porcentaje_desperdicio) / 100
            cantidad_requerida = cantidad * Decimal(str(bom.cantidad_requerida)) * Decimal(str(desperdicio_factor))
            
            # Aplicar tiempo de espera
            fecha_requerimiento = fecha - timedelta(days=bom.tiempo_espera)
            
            clave = (bom.producto_hijo.id, fecha_requerimiento)
            if clave not in requerimientos_expandidos:
                requerimientos_expandidos[clave] = Decimal('0')
            requerimientos_expandidos[clave] += cantidad_requerida
            
            # Recursión para subensambles
            if bom.tipo_componente == 'subensamble':
                self._explotar_bom_recursivo(
                    bom.producto_hijo.id,
                    cantidad_requerida,
                    fecha_requerimiento,
                    requerimientos_expandidos,
                    nivel + 1,
                    ruta_productos.copy()
                )
    
    def calcular_requerimientos_netos(self):
        """Paso 3: Calcular requerimientos netos considerando inventario"""
        # Obtener inventario disponible por producto
        inventario_actual = {}
        productos_ids = set(producto_id for (producto_id, _) in self.requerimientos_brutos.keys())
        
        for producto_id in productos_ids:
            stock = Producto.objects.filter(id=producto_id).aggregate(
                total=Sum('stock_actual')
            )['total'] or 0
            inventario_actual[producto_id] = Decimal(str(stock))
        
        # Calcular requerimientos netos
        for (producto_id, fecha), cantidad_bruta in self.requerimientos_brutos.items():
            clave = (producto_id, fecha)
            
            # Requerimiento neto = bruto - inventario disponible
            inventario_disponible = inventario_actual.get(producto_id, Decimal('0'))
            cantidad_neta = max(cantidad_bruta - inventario_disponible, Decimal('0'))
            
            if cantidad_neta > 0:
                self.requerimientos_netos[clave] = cantidad_neta
                # Reducir inventario disponible
                inventario_actual[producto_id] = max(
                    inventario_actual[producto_id] - cantidad_bruta, 
                    Decimal('0')
                )
                
                # Guardar en base de datos
                RequerimientoMaterial.objects.update_or_create(
                    producto_id=producto_id,
                    fecha_requerimiento=fecha,
                    defaults={
                        'tipo_requerimiento': 'neto',
                        'cantidad_requerida': cantidad_neta,
                        'cantidad_pendiente': cantidad_neta,
                        'origen': 'MRP',
                        'estado': 'pendiente'
                    }
                )
    
    def planificar_capacidad(self):
        """Paso 4: Planificación de capacidad (CRP)"""
        # Agrupar requerimientos por centro de trabajo y fecha
        carga_centros = {}
        
        for (producto_id, fecha), cantidad in self.requerimientos_netos.items():
            # Obtener rutas de manufactura para este producto
            rutas = ListaMateriales.objects.filter(
                producto_padre_id=producto_id
            ).order_by('nivel')
            
            for ruta in rutas:
                # Calcular tiempo de procesamiento
                tiempo_total = ruta.tiempo_preparacion + (ruta.tiempo_operacion * cantidad)
                horas_requeridas = tiempo_total / 60  # Convertir minutos a horas
                
                # Aplicar eficiencia
                if ruta.eficiencia > 0:
                    horas_requeridas = horas_requeridas * (100 / ruta.eficiencia)
                
                # Agrupar por centro y fecha
                if ruta.centro_trabajo.id not in carga_centros:
                    carga_centros[ruta.centro_trabajo.id] = {}
                if fecha not in carga_centros[ruta.centro_trabajo.id]:
                    carga_centros[ruta.centro_trabajo.id][fecha] = Decimal('0')
                
                carga_centros[ruta.centro_trabajo.id][fecha] += Decimal(str(horas_requeridas))
        
        # Crear planes de capacidad
        for centro_id, fechas_carga in carga_centros.items():
            for fecha, carga_horas in fechas_carga.items():
                PlanCapacidad.objects.update_or_create(
                    centro_trabajo_id=centro_id,
                    fecha=fecha,
                    defaults={
                        'capacidad_disponible': Decimal('8.0'),  # 8 horas estándar
                        'carga_requerida': carga_horas
                    }
                )
                
                # Calcular estado automáticamente
                plan = PlanCapacidad.objects.get(centro_trabajo_id=centro_id, fecha=fecha)
                plan.calcular_estado()
    
    def generar_recomendaciones(self):
        """Paso 5: Generar recomendaciones de órdenes"""
        recomendaciones = []
        
        # Agrupar requerimientos por producto para crear órdenes
        requerimientos_por_producto = {}
        
        for (producto_id, fecha), cantidad in self.requerimientos_netos.items():
            if producto_id not in requerimientos_por_producto:
                requerimientos_por_producto[producto_id] = []
            requerimientos_por_producto[producto_id].append((fecha, cantidad))
        
        # Generar recomendaciones para cada producto
        for producto_id, requerimientos in requerimientos_por_producto.items():
            producto = Producto.objects.get(id=producto_id)
            
            # Agrupar por períodos (lotes)
            lotes = self._agrupar_en_lotes(requerimientos)
            
            for lote in lotes:
                recomendacion = {
                    'producto': producto,
                    'cantidad': lote['cantidad'],
                    'fecha': lote['fecha_inicio'],
                    'tipo': self._determinar_tipo_orden(producto),
                    'prioridad': self._calcular_prioridad(lote['fecha_inicio'])
                }
                recomendaciones.append(recomendacion)
        
        # Ordenar por prioridad y fecha
        recomendaciones.sort(key=lambda x: (x['prioridad'], x['fecha']))
        
        return recomendaciones
    
    def _agrupar_en_lotes(self, requerimientos, dias_lote=7):
        """Agrupar requerimientos en lotes para optimizar órdenes"""
        if not requerimientos:
            return []
        
        # Ordenar por fecha
        requerimientos.sort(key=lambda x: x[0])
        
        lotes = []
        lote_actual = None
        
        for fecha, cantidad in requerimientos:
            if (lote_actual is None or 
                fecha > lote_actual['fecha_fin'] + timedelta(days=dias_lote)):
                
                # Iniciar nuevo lote
                if lote_actual:
                    lotes.append(lote_actual)
                
                lote_actual = {
                    'fecha_inicio': fecha,
                    'fecha_fin': fecha,
                    'cantidad': cantidad
                }
            else:
                # Extender lote actual
                lote_actual['fecha_fin'] = fecha
                lote_actual['cantidad'] += cantidad
        
        if lote_actual:
            lotes.append(lote_actual)
        
        return lotes
    
    def _determinar_tipo_orden(self, producto):
        """Determinar si es orden de compra o producción"""
        # Verificar si el producto se fabrica (tiene BOM)
        tiene_bom = ListaMateriales.objects.filter(producto_padre=producto).exists()
        
        if tiene_bom:
            return 'orden_produccion'
        else:
            return 'orden_compra'
    
    def _calcular_prioridad(self, fecha):
        """Calcular prioridad basada en fecha de requerimiento"""
        hoy = timezone.now().date()
        dias_restantes = (fecha - hoy).days
        
        if dias_restantes <= 7:
            return 1  # Alta
        elif dias_restantes <= 21:
            return 3  # Media
        else:
            return 5  # Baja

def ejecutar_mrp(fecha_inicio=None, fecha_fin=None, parametros=None):
    """
    Función principal para ejecutar MRP
    """
    if fecha_inicio is None:
        fecha_inicio = timezone.now().date()
    if fecha_fin is None:
        fecha_fin = fecha_inicio + timedelta(days=90)  # 3 meses por defecto
    
    processor = MRPProcessor(fecha_inicio, fecha_fin, parametros)
    return processor.ejecutar_mrp()
