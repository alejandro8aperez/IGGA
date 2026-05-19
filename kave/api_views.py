from rest_framework.decorators import api_view
from erp_core.permissions import IsIngenieriaUser
from rest_framework.response import Response
from rest_framework import status
from .engine import api_design_and_quote
from .models import TransformerDesign, CalculoTransformador
from .serializers import TransformerDesignSerializer, CalculoTransformadorSerializer
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import datetime
from django.http import HttpResponse
from .pdf_generator import generar_ficha_tecnica_pdf

try:
    from mrp.models import PlanMaestroProduccion, RequerimientoMaterial
    from inventarios.models import Producto, Categoria
except ImportError:
    pass

@api_view(['POST'])
def design_transformer(request):
    """
    API para diseñar y cotizar transformadores
    """
    try:
        data = request.data
        
        # Usar el serializador para validación de entrada
        temp_serializer = TransformerDesignSerializer(data=data)
        if not temp_serializer.is_valid():
            return Response(temp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Realizar cálculos
        result = api_design_and_quote(data)
        
        if result['status'] == 'error':
            print(f"API: Error en cálculos: {result.get('error', 'unknown')}")
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"API: Cálculos exitosos, intentando guardar en base de datos")
        
        # Guardar diseño del transformador
        try:
            transformer_design = TransformerDesign.objects.create(
                potencia_kva=data['potencia_kva'],
                vp=data['vp'],
                vs=data['vs'],
                tipo=data['tipo'],
                material=data['material'],
                material_bobinas=data.get('material_bobinas', 'aluminio'),
                nucleo=result['resultado'].get('material_nucleo', data.get('material', 'silicio')),  # Corregido: usar material_nucleo
                refrigeracion=data.get('refrigeracion', 'seco'),
                forma_nucleo=data.get('forma_nucleo', 'ei'),
                factor_apilamiento=data.get('factor_apilamiento', 0.96) or 0.96,
                altura_ventana=data.get('altura_ventana') or 0,
                ancho_ventana=data.get('ancho_ventana') or 0,
                ancho_pierna=data.get('ancho_pierna') or 0,
                profundidad_nucleo=data.get('profundidad_nucleo') or 0,
                diametro_interno=data.get('diametro_interno') or 0,
                diametro_externo=data.get('diametro_externo') or 0,
                altura_toroide=data.get('altura_toroide') or 0,
                canal_entre_capas=data.get('canal_entre_capas', 0.1) or 0.1,
                margen_seguridad_extremos=data.get('margen_seguridad_extremos', 5.0) or 5.0,
                aislamiento_tubo=data.get('aislamiento_tubo', 2.0) or 2.0,
                aislamiento_entre_devanados=data.get('aislamiento_entre_devanados', 1.0) or 1.0,
                levante_bobinado=data.get('levante_bobinado', 15.0) or 15.0,
                eficiencia=result['resultado']['eficiencia'],
                costo=result['resultado']['costo_estimado'],
                disenador=request.user if request.user.is_authenticated else None
            )
            print(f"API: TransformerDesign guardado exitosamente con ID: {transformer_design.id}")
        except Exception as db_error:
            print(f"API: Error al guardar TransformerDesign: {db_error}")
            raise db_error
        
        # Guardar cálculos detallados
        try:
            calculo = CalculoTransformador.objects.create(
                disenador=transformer_design,
                area_nucleo=result['resultado']['parametros_calculo']['area_nucleo_cm2'],
                vueltas_primario=result['resultado']['parametros_calculo']['vueltas_primario'],
                vueltas_secundario=result['resultado']['parametros_calculo']['vueltas_secundario'],
                area_conductor_primario=result['resultado']['parametros_calculo']['area_conductor_primario_mm2'],
                area_conductor_secundario=result['resultado']['parametros_calculo']['area_conductor_secundario_mm2'],
                tipo_conductor_primario=data.get('tipo_conductor_primario', 'awg'),
                calibre_awg_primario=result['resultado']['parametros_calculo'].get('calibre_pri', ''),
                alto_platina_primario=data.get('alto_platina_primario') or 0,
                ancho_platina_primario=data.get('ancho_platina_primario') or 0,
                tipo_conductor_secundario=data.get('tipo_conductor_secundario', 'awg'),
                calibre_awg_secundario=result['resultado']['parametros_calculo'].get('calibre_sec', ''),
                alto_platina_secundario=data.get('alto_platina_secundario') or 0,
                ancho_platina_secundario=data.get('ancho_platina_secundario') or 0,
                espesor_total_bobinado=result['resultado']['parametros_calculo'].get('espesor_total_mm', 0),
                altura_efectiva_bobinado=result['resultado']['parametros_calculo'].get('h_efec_pri_mm', 0),
                viabilidad_construccion=result['resultado']['parametros_calculo'].get('viabilidad', False),
                mensajes_viabilidad=result['resultado']['parametros_calculo'].get('mensaje_viabilidad', ''),
                peso_cobre_estimado=result['resultado']['parametros_calculo'].get('peso_bobinas_kg', 0),
                peso_nucleo_estimado=result['resultado']['parametros_calculo'].get('peso_nucleo_kg', 0),
                impedancia_z=result['resultado']['parametros_calculo'].get('impedancia_z', 0),
                elevacion_temperatura_c=result['resultado']['parametros_calculo'].get('elevacion_temperatura_c', 0),
                perdidas_nucleo=result['resultado']['perdidas']['nucleo_w'],
                perdidas_cobre=result['resultado']['perdidas']['cobre_w'],
                perdidas_totales=result['resultado']['perdidas']['totales_w']
            )
            print(f"API: CalculoTransformador guardado exitosamente con ID: {calculo.id}")
        except Exception as db_error:
            print(f"API: Error al guardar CalculoTransformador: {db_error}")
            raise db_error
        
        # Serializar y devolver respuesta
        try:
            serializer = TransformerDesignSerializer(transformer_design)
            print(f"API: Serialización exitosa")
            
            response_data = {
                'diseño': serializer.data,
                'calculos': CalculoTransformadorSerializer(calculo).data,
                'resultado_completo': result['resultado'],
                'status': 'success',
                'mensaje': 'Diseño de transformador completado y guardado exitosamente'
            }
            print(f"API: Respuesta construida exitosamente")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as serializer_error:
            print(f"API: Error en serialización: {serializer_error}")
            raise serializer_error
        
    except Exception as e:
        print(f"API: Error general en design_transformer: {e}")
        print(f"API: Tipo de error: {type(e).__name__}")
        import traceback
        print(f"API: Traceback completo: {traceback.format_exc()}")
        
        return Response({
            'error': f'Error en el diseño del transformador: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def list_transformers(request):
    """
    API para listar todos los diseños de transformadores
    """
    try:
        transformers = TransformerDesign.objects.all().order_by('-created_at')
        serializer = TransformerDesignSerializer(transformers, many=True)
        
        return Response({
            'transformadores': serializer.data,
            'total': transformers.count(),
            'status': 'success'
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al listar transformadores: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'DELETE'])
def transformer_detail(request, pk):
    """
    API para obtener detalles (GET) o eliminar (DELETE) un transformador específico
    """
    try:
        transformer = TransformerDesign.objects.get(pk=pk)
        
        if request.method == 'DELETE':
            # Eliminar el transformador
            transformer.delete()
            return Response({
                'status': 'success',
                'mensaje': f'Transformador {pk} eliminado exitosamente'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'GET':
            # Obtener detalles del transformador
            serializer = TransformerDesignSerializer(transformer)
            
            # Obtener cálculos asociados
            calculos = transformer.calculos.all()
            calculos_serializer = CalculoTransformadorSerializer(calculos, many=True)
            
            return Response({
                'transformador': serializer.data,
                'calculos': calculos_serializer.data,
                'status': 'success'
            })
        
    except TransformerDesign.DoesNotExist:
        return Response({
            'error': 'Transformador no encontrado',
            'status': 'error'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': f'Error al procesar transformador: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def download_ficha_tecnica(request, pk):
    """
    API para generar y descargar el PDF de la Ficha Técnica ISO 9001
    """
    try:
        transformer = TransformerDesign.objects.get(pk=pk)
        calculo = transformer.calculos.first() # Get the associated calc
        if not calculo:
             return Response({'error': 'No hay cálculos físicos guardados'}, status=400)
             
        pdf_bytes = generar_ficha_tecnica_pdf(transformer, calculo)
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ficha_SGC_KAVE_{transformer.id}.pdf"'
        return response
        
    except TransformerDesign.DoesNotExist:
        return Response({'error': 'No encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def send_to_mrp_engine(request, pk):
    """
    API para despachar los requisitos de físicos del modelo al MRP
    """
    try:
        # Verificar que los modelos MRP y Produccion estén disponibles
        try:
            from mrp.models import PlanMaestroProduccion
            from inventarios.models import Producto, Categoria
            from produccion.models import Receta, InsumoReceta, OrdenProduccion
        except ImportError:
            return Response({
                'error': 'Módulos MRP o Producción no disponibles. Asegúrese de que estén instalados.',
                'status': 'error'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        transformer = TransformerDesign.objects.get(pk=pk)
        calculo = transformer.calculos.first()
        
        if not calculo:
            return Response({'error': 'No hay cálculos físicos para conectar al MRP'}, status=400)
            
        # 1. Asegurar Producto principal (Transformador a Producir)
        categoria_trafos, _ = Categoria.objects.get_or_create(nombre='Transformadores Terminados')
        precio = Decimal(str(transformer.costo)) * Decimal('1.3') if transformer.costo else Decimal('0')
        producto_trafo, _ = Producto.objects.get_or_create(
            codigo_sku=f'TRAFO-KAVE-{transformer.id:04d}',
            defaults={
                'nombre': f'Transformador {transformer.potencia_kva}kVA {transformer.get_tipo_display()}',
                'categoria': categoria_trafos,
                'precio_venta': precio,
                'precio_compra': Decimal('0'),
            }
        )
        
        # 2. Asegurar Insumos (Cobre/Aluminio y Silicio)
        cat_insumos, _ = Categoria.objects.get_or_create(nombre='Insumos Metálicos')
        nombre_bobina = 'Cobre Esmaltado' if transformer.material_bobinas == 'cobre' else 'Aluminio Esmaltado'
        insumo_bobina, _ = Producto.objects.get_or_create(
            codigo_sku=f'INS-BOB-{transformer.material_bobinas[:3].upper()}',
            defaults={'nombre': nombre_bobina, 'categoria': cat_insumos, 'precio_compra': Decimal('0'), 'precio_venta': Decimal('0')}
        )
        
        insumo_nucleo, _ = Producto.objects.get_or_create(
            codigo_sku=f'INS-NUC-{transformer.material[:3].upper()}',
            defaults={'nombre': f'Acero de Núcleo {transformer.get_material_display()}', 'categoria': cat_insumos, 'precio_compra': Decimal('0'), 'precio_venta': Decimal('0')}
        )
        
        # 3. Generar la Receta de Producción (BOM)
        receta, created = Receta.objects.get_or_create(
            producto_terminado=producto_trafo,
            defaults={
                'tiempo_estimado_horas': 24.0,  # Valor por defecto, podría calcularse
                'costo_adicional_fijo': transformer.costo * Decimal('0.10'), # 10% indirecto
                'instrucciones': f"Construcción según diseño KAVE #{transformer.id} - {transformer.get_tipo_display()}"
            }
        )
        
        # Asignar insumos a la receta si no existen
        if created or not receta.insumos.exists():
            InsumoReceta.objects.create(
                receta=receta,
                producto_materia_prima=insumo_bobina,
                cantidad_requerida=calculo.peso_cobre_estimado or 0,
                merma_esperada_pct=2.0
            )
            InsumoReceta.objects.create(
                receta=receta,
                producto_materia_prima=insumo_nucleo,
                cantidad_requerida=calculo.peso_nucleo_estimado or 0,
                merma_esperada_pct=3.0
            )
            
        # 4. Crear Plan Maestro en MRP
        mps = PlanMaestroProduccion.objects.create(
            producto=producto_trafo,
            fecha_inicio=timezone.now().date(),
            fecha_fin=timezone.now().date() + timedelta(days=15),
            cantidad_planificada=1,
            estado='planificado'
        )
        
        # 5. Generar directamente una Orden de Producción en borrador (Opcional pero útil)
        op = OrdenProduccion.objects.create(
            receta=receta,
            cantidad_a_producir=1,
            estado='borrador',
            prioridad='normal',
            fecha_planeada_inicio=timezone.now().date(),
            fecha_planeada_fin=timezone.now().date() + timedelta(days=15),
            responsable="Ingeniería (KAVE)",
            observaciones=f"Generada desde diseño KAVE #{transformer.id}"
        )
        
        return Response({
            'status': 'success',
            'mensaje': f'Diseño volcado. Creada OP en borrador (OP-{op.numero or op.id}) y Plan Maestro #{mps.id}. Receta de producción generada.'
        })

    except TransformerDesign.DoesNotExist:
        return Response({'error': 'Transformador no encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def quick_quote(request):
    """
    API para cotización rápida sin guardar en base de datos
    """
    try:
        data = request.data
        
        # Validar datos mínimos
        if 'potencia_kva' not in data or 'vp' not in data or 'vs' not in data:
            return Response({
                'error': 'Se requieren potencia_kva, vp y vs',
                'status': 'error'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Usar valores por defecto si no se proporcionan
        data.setdefault('tipo', 'trifasico')
        data.setdefault('material', 'silicio')
        
        # Realizar cálculos
        result = api_design_and_quote(data)
        
        if result.get('status') == 'error':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener los datos del cálculo (manejar diferentes estructuras)
        cotizacion_data = result.get('resultado') or result.get('cotizacion') or result
        
        return Response({
            'cotizacion': cotizacion_data,
            'resultado': cotizacion_data,  # Para compatibilidad con frontend
            'status': 'success',
            'mensaje': 'Cotización rápida generada exitosamente'
        })
        
    except Exception as e:
        return Response({
            'error': f'Error en la cotización rápida: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def materials_catalog(request):
    """
    API para obtener catálogo de materiales disponibles
    """
    try:
        from .models import TransformerDesign
        
        materials = []
        for choice in TransformerDesign.MATERIAL_CHOICES:
            materials.append({
                'value': choice[0],
                'label': choice[1],
                'descripcion': get_material_description(choice[0])
            })
        
        tipos = []
        for choice in TransformerDesign.TIPO_CHOICES:
            tipos.append({
                'value': choice[0],
                'label': choice[1],
                'descripcion': get_tipo_description(choice[0])
            })
        
        return Response({
            'materiales': materials,
            'tipos': tipos,
            'status': 'success'
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al obtener catálogo: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_transformer(request, pk):
    """
    API para eliminar un transformador específico
    """
    try:
        transformer = TransformerDesign.objects.get(pk=pk)
        transformer.delete()
        
        return Response({
            'status': 'success',
            'mensaje': f'Transformador {pk} eliminado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except TransformerDesign.DoesNotExist:
        return Response({
            'error': 'Transformador no encontrado',
            'status': 'error'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': f'Error al eliminar transformador: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_material_description(material):
    """
    Obtener descripción detallada del material
    """
    descriptions = {
        'silicio': 'Acero al silicio - Material estándar, buen balance costo-beneficio',
        'amorfoso': 'Acero amorfo - Mayor eficiencia, menor pérdida por histéresis',
        'nanocristalino': 'Nanocristalino - Máxima eficiencia, ideal para aplicaciones de alta precisión',
        'ferrita': 'Ferrita - Excelente para alta frecuencia, compacto y ligero'
    }
    return descriptions.get(material, 'Material estándar')

def get_tipo_description(tipo):
    """
    Obtener descripción detallada del tipo
    """
    descriptions = {
        'monofasico': 'Transformador monofásico - Para aplicaciones residenciales y pequeñas comerciales',
        'trifasico': 'Transformador trifásico - Para aplicaciones industriales y comerciales',
        'autotransformador': 'Autotransformador - Más eficiente, menor tamaño, para aplicaciones específicas'
    }
    return descriptions.get(tipo, 'Tipo estándar')
