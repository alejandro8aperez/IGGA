from rest_framework import viewsets, permissions, status
from erp_core.permissions import IsIngenieriaUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q, F, Avg, Max
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    PlanMaestroProduccion, ListaMateriales, RutaManufactura, 
    RequerimientoMaterial, PlanCapacidad, EjecucionMRP
)
from .serializers import (
    PlanMaestroProduccionSerializer, ListaMaterialesSerializer, 
    ListaMaterialesCreateSerializer, RutaManufacturaSerializer,
    RequerimientoMaterialSerializer, PlanCapacidadSerializer,
    EjecucionMRPSerializer, BOMExplosionSerializer, MRPResultadoSerializer,
    MPSResumenSerializer, CapacidadResumenSerializer
)
from .mrp_engine import ejecutar_mrp

class PlanMaestroProduccionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Plan Maestro de Producción (MPS)"""
    queryset = PlanMaestroProduccion.objects.all()
    serializer_class = PlanMaestroProduccionSerializer
    permission_classes = []  # Sin permisos para desarrollo
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Obtener resumen del MPS"""
        total_items = PlanMaestroProduccion.objects.count()
        cantidad_total = PlanMaestroProduccion.objects.aggregate(
            total=Sum('cantidad_planificada')
        )['total'] or 0
        
        # Calcular progreso general
        cantidad_real = PlanMaestroProduccion.objects.aggregate(
            total=Sum('cantidad_real')
        )['total'] or 0
        
        porcentaje_completado = (cantidad_real / cantidad_total * 100) if cantidad_total > 0 else 0
        
        # Próximas entregas
        proximas_entregas = PlanMaestroProduccion.objects.filter(
            fecha_fin__gte=timezone.now().date(),
            estado__in=['planificado', 'en_progreso']
        ).order_by('fecha_fin')[:5]
        
        entregas_data = []
        for entrega in proximas_entregas:
            entregas_data.append({
                'id': entrega.id,
                'producto': entrega.producto.nombre,
                'cantidad': entrega.cantidad_planificada,
                'fecha': entrega.fecha_fin,
                'estado': entrega.estado,
                'progreso': entrega.progreso
            })
        
        return Response({
            'total_items': total_items,
            'cantidad_total': cantidad_total,
            'porcentaje_completado': round(porcentaje_completado, 2),
            'proximas_entregas': entregas_data
        })
    
    @action(detail=True, methods=['post'])
    def actualizar_progreso(self, request, pk=None):
        """Actualizar progreso de producción"""
        mps = self.get_object()
        cantidad_real = request.data.get('cantidad_real', 0)
        
        mps.cantidad_real = cantidad_real
        
        # Actualizar estado basado en progreso
        if cantidad_real >= mps.cantidad_planificada:
            mps.estado = 'completado'
        elif cantidad_real > 0:
            mps.estado = 'en_progreso'
        
        mps.save()
        
        serializer = self.get_serializer(mps)
        return Response(serializer.data)

class ListaMaterialesViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Bill of Materials (BOM)"""
    queryset = ListaMateriales.objects.all()
    permission_classes = []  # Sin permisos para desarrollo
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ListaMaterialesCreateSerializer
        return ListaMaterialesSerializer
    
    @action(detail=False, methods=['get'])
    def explosion(self, request):
        """Explosión de BOM para un producto"""
        producto_id = request.query_params.get('producto_id')
        if not producto_id:
            return Response(
                {'error': 'producto_id requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener BOM directa
        bom_directo = ListaMateriales.objects.filter(
            producto_padre_id=producto_id
        ).order_by('nivel')
        
        # Calcular niveles de explosión
        niveles_max = ListaMateriales.objects.filter(
            producto_padre_id=producto_id
        ).aggregate(max_nivel=Max('nivel'))['max_nivel'] or 0
        
        return Response({
            'producto': {
                'id': producto_id,
                'nombre': Producto.objects.get(id=producto_id).nombre
            },
            'componentes': ListaMaterialesSerializer(bom_directo, many=True).data,
            'niveles_explosion': niveles_max
        })
    
    @action(detail=False, methods=['post'])
    def validar_bom(self, request):
        """Validar integridad de BOM (detectar ciclos)"""
        producto_id = request.data.get('producto_id')
        if not producto_id:
            return Response(
                {'error': 'producto_id requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Implementar detección de ciclos
        visitados = set()
        ruta_actual = []
        
        def detectar_ciclo(producto_id_actual):
            if producto_id_actual in ruta_actual:
                return True, ruta_actual[ruta_actual.index(producto_id_actual):]
            
            if producto_id_actual in visitados:
                return False, []
            
            visitados.add(producto_id_actual)
            ruta_actual.append(producto_id_actual)
            
            componentes = ListaMateriales.objects.filter(
                producto_padre_id=producto_id_actual
            )
            
            for componente in componentes:
                ciclo, ruta = detectar_ciclo(componente.producto_hijo_id)
                if ciclo:
                    return True, ruta
            
            ruta_actual.pop()
            return False, []
        
        tiene_ciclo, ciclo_ruta = detectar_ciclo(producto_id)
        
        if tiene_ciclo:
            nombres_ciclo = []
            for prod_id in ciclo_ruta:
                nombres_ciclo.append(Producto.objects.get(id=prod_id).nombre)
            
            return Response({
                'valida': False,
                'ciclo_detectado': True,
                'ruta_ciclo': nombres_ciclo
            })
        else:
            return Response({
                'valida': True,
                'ciclo_detectado': False
            })

class RutaManufacturaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Rutas de Manufactura"""
    queryset = RutaManufactura.objects.all()
    serializer_class = RutaManufacturaSerializer
    permission_classes = []  # Sin permisos para desarrollo
    
    @action(detail=False, methods=['get'])
    def por_producto(self, request):
        """Obtener rutas por producto"""
        producto_id = request.query_params.get('producto_id')
        if not producto_id:
            return Response(
                {'error': 'producto_id requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rutas = RutaManufactura.objects.filter(
            producto_id=producto_id
        ).order_by('secuencia')
        
        serializer = self.get_serializer(rutas, many=True)
        return Response(serializer.data)

class RequerimientoMaterialViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Requerimientos de Material"""
    queryset = RequerimientoMaterial.objects.all()
    serializer_class = RequerimientoMaterialSerializer
    permission_classes = []  # Sin permisos para desarrollo
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener requerimientos pendientes"""
        requerimientos = RequerimientoMaterial.objects.filter(
            estado='pendiente',
            cantidad_pendiente__gt=0
        ).order_by('fecha_requerimiento')
        
        serializer = self.get_serializer(requerimientos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def marcar_ordenado(self, request, pk=None):
        """Marcar requerimiento como ordenado"""
        requerimiento = self.get_object()
        cantidad_ordenada = request.data.get('cantidad_ordenada', 0)
        
        requerimiento.cantidad_ordenada = cantidad_ordenada
        requerimiento.cantidad_pendiente = max(
            requerimiento.cantidad_requerida - cantidad_ordenada, 0
        )
        
        if requerimiento.cantidad_pendiente == 0:
            requerimiento.estado = 'ordenado'
        
        requerimiento.save()
        
        serializer = self.get_serializer(requerimiento)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generar_solicitudes_compra(self, request):
        """Genera Solicitudes de Compra a partir de requerimientos de materia prima pendientes"""
        requerimientos = RequerimientoMaterial.objects.filter(
            estado='pendiente',
            cantidad_pendiente__gt=0
        )
        
        from compras.models import SolicitudCompra, DetalleSolicitudCompra
        
        creadas = 0
        for req in requerimientos:
            # Solo si no tiene BOM (es comprado, no fabricado)
            if not ListaMateriales.objects.filter(producto_padre=req.producto).exists():
                solicitud = SolicitudCompra.objects.create(
                    solicitante="Sistema MRP",
                    departamento="Planeación",
                    fecha_requerida=req.fecha_requerimiento,
                    prioridad='alta' if (req.fecha_requerimiento - timezone.now().date()).days <= 7 else 'normal',
                    estado='pendiente',
                    origen='mrp',
                    justificacion=f"Generado automáticamente por MRP para requerimiento {req.id}"
                )
                DetalleSolicitudCompra.objects.create(
                    solicitud=solicitud,
                    producto=req.producto,
                    cantidad_solicitada=req.cantidad_pendiente
                )
                
                req.cantidad_ordenada = req.cantidad_requerida
                req.cantidad_pendiente = 0
                req.estado = 'ordenado'
                req.save(update_fields=['cantidad_ordenada', 'cantidad_pendiente', 'estado'])
                creadas += 1
                
        return Response({'status': 'ok', 'solicitudes_creadas': creadas})

    @action(detail=False, methods=['post'])
    def generar_ordenes_produccion(self, request):
        """Genera Órdenes de Producción a partir de requerimientos de productos fabricados"""
        requerimientos = RequerimientoMaterial.objects.filter(
            estado='pendiente',
            cantidad_pendiente__gt=0
        )
        
        from produccion.models import OrdenProduccion, Receta
        
        creadas = 0
        for req in requerimientos:
            # Solo si tiene Receta (es fabricado)
            receta = Receta.objects.filter(producto_terminado=req.producto).first()
            if receta:
                OrdenProduccion.objects.create(
                    receta=receta,
                    cantidad_a_producir=req.cantidad_pendiente,
                    prioridad='alta' if (req.fecha_requerimiento - timezone.now().date()).days <= 7 else 'normal',
                    estado='planeada',
                    fecha_planeada_inicio=timezone.now().date(),  # Idealmente se calcula con CRP
                    fecha_planeada_fin=req.fecha_requerimiento,
                    responsable="Sistema MRP",
                    observaciones=f"Generada automáticamente por MRP para requerimiento {req.id}"
                )
                
                req.cantidad_ordenada = req.cantidad_requerida
                req.cantidad_pendiente = 0
                req.estado = 'ordenado'
                req.save(update_fields=['cantidad_ordenada', 'cantidad_pendiente', 'estado'])
                creadas += 1
                
        return Response({'status': 'ok', 'ordenes_creadas': creadas})

class PlanCapacidadViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Plan de Capacidad"""
    queryset = PlanCapacidad.objects.all()
    serializer_class = PlanCapacidadSerializer
    permission_classes = []  # Sin permisos para desarrollo
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Obtener resumen de capacidad"""
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        
        if not fecha_desde:
            fecha_desde = timezone.now().date()
        else:
            fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
        
        if not fecha_hasta:
            fecha_hasta = fecha_desde + timedelta(days=30)
        else:
            fecha_hasta = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
        
        # Centros de trabajo únicos
        centros_count = PlanCapacidad.objects.filter(
            fecha__gte=fecha_desde,
            fecha__lte=fecha_hasta
        ).values('centro_trabajo').distinct().count()
        
        # Días planificados
        dias_count = PlanCapacidad.objects.filter(
            fecha__gte=fecha_desde,
            fecha__lte=fecha_hasta
        ).values('fecha').distinct().count()
        
        # Utilización promedio
        avg_utilizacion = PlanCapacidad.objects.filter(
            fecha__gte=fecha_desde,
            fecha__lte=fecha_hasta
        ).aggregate(promedio=Sum('carga_porcentaje'))['promedio'] or 0
        
        if centros_count > 0:
            avg_utilizacion = avg_utilizacion / centros_count
        
        # Cuellos de botella (centros sobrecargados)
        cuellos_botella = PlanCapacidad.objects.filter(
            fecha__gte=fecha_desde,
            fecha__lte=fecha_hasta,
            estado='sobrecargado'
        ).order_by('-carga_porcentaje')[:5]
        
        cuellos_data = []
        for cuello in cuellos_botella:
            cuellos_data.append({
                'centro_trabajo': cuello.centro_trabajo.nombre,
                'fecha': cuello.fecha,
                'carga_porcentaje': cuello.carga_porcentaje,
                'capacidad_disponible': cuello.capacidad_disponible,
                'carga_requerida': cuello.carga_requerida
            })
        
        return Response({
            'centros_trabajo': centros_count,
            'dias_planificados': dias_count,
            'utilizacion_promedio': round(avg_utilizacion, 2),
            'cuellos_botella': cuellos_data
        })

class EjecucionMRPViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de Ejecuciones MRP"""
    queryset = EjecucionMRP.objects.all()
    serializer_class = EjecucionMRPSerializer
    permission_classes = []  # Sin permisos para desarrollo
    
    @action(detail=False, methods=['post'])
    def ejecutar(self, request):
        """Ejecutar proceso MRP"""
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        parametros = request.data.get('parametros', {})
        
        if fecha_inicio:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        else:
            fecha_inicio = timezone.now().date()
        
        if fecha_fin:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        else:
            fecha_fin = fecha_inicio + timedelta(days=90)
        
        # Ejecutar MRP
        exito, mensaje = ejecutar_mrp(fecha_inicio, fecha_fin, parametros)
        
        if exito:
            # Obtener la ejecución creada
            ejecucion = EjecucionMRP.objects.latest('fecha_ejecucion')
            serializer = self.get_serializer(ejecucion)
            
            return Response({
                'exito': True,
                'mensaje': mensaje,
                'ejecucion': serializer.data
            })
        else:
            return Response({
                'exito': False,
                'mensaje': mensaje
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def resultados(self, request, pk=None):
        """Obtener resultados detallados de ejecución MRP"""
        ejecucion = self.get_object()
        
        # Obtener requerimientos generados
        requerimientos = RequerimientoMaterial.objects.filter(
            origen='MRP',
            fecha_creacion__gte=ejecucion.fecha_ejecucion
        )
        
        # Obtener planes de capacidad generados
        planes_capacidad = PlanCapacidad.objects.filter(
            fecha__gte=ejecucion.fecha_plan_desde,
            fecha__lte=ejecucion.fecha_plan_hasta
        )
        
        return Response({
            'ejecucion': EjecucionMRPSerializer(ejecucion).data,
            'requerimientos': RequerimientoMaterialSerializer(requerimientos, many=True).data,
            'planes_capacidad': PlanCapacidadSerializer(planes_capacidad, many=True).data,
            'resumen': ejecucion.resumen
        })
