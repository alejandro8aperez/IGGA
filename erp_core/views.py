from django.contrib.auth.models import User
from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
from django.db import connections
from django.db.utils import OperationalError
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer

@api_view(['GET'])
def ping(request):
    """
    Health-check robusto que verifica la conectividad con la base de datos.
    Ideal para configurar en el "Health Check Path" de Render.
    """
    db_status = "ok"
    try:
        # Verifica que la base de datos responda correctamente
        connections['default'].cursor()
    except OperationalError:
        db_status = "disconnected"

    return JsonResponse({
        'status': 'ok' if db_status == "ok" else 'error',
        'database': db_status,
        'timestamp': timezone.now().isoformat()
    }, status=200 if db_status == "ok" else 503)

@api_view(['POST'])
@permission_classes([IsAdminUser]) # SOLO administradores autenticados
def create_initial_superuser(request):
    """
    Gestión de Superusuarios de Emergencia.
    Requiere token de staff para ser ejecutado.
    """
    # En producción, esto debería estar desactivado o protegido por una API Key adicional
    if not settings.DEBUG and request.headers.get('X-Admin-Setup-Key') != os.getenv('ADMIN_SETUP_KEY'):
        return JsonResponse({'error': 'Unauthorized access'}, status=403)

    try:
        user, created = User.objects.update_or_create(
            username='admin',
            defaults={
                'email': 'admin@8amperios.com',
                'is_superuser': True,
                'is_staff': True,
            }
        )
        
        password = request.data.get('password', 'admin123')
        user.set_password(password)
        user.save()
        return JsonResponse({'success': True, 'action': 'created' if created else 'updated'})
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
def verify_credentials(request):
    """
    Endpoint para verificar credenciales de usuario.
    """
    try:
        from django.contrib.auth import authenticate
        
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'error': 'Se requiere username y password'
            }, status=400)
        
        user = authenticate(username=username, password=password)
        
        if user:
            return JsonResponse({
                'success': True,
                'message': 'Credenciales válidas',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_superuser': user.is_superuser
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Credenciales inválidas'
            }, status=401)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generar_comprobante_nomina_pdf(request):
    """
    Genera un comprobante de nómina profesional en PDF (SAP Style).
    Recibe los datos calculados desde el frontend.
    """
    from io import BytesIO
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from django.http import HttpResponse

    data = request.data
    
    # --- Integración Contable (Nivel SAP) ---
    try:
        from django.apps import apps
        AsientoContable = apps.get_model('contabilidad', 'AsientoContable')
        # Creamos el registro del gasto en el Libro Mayor
        AsientoContable.objects.create(
            descripcion=f"Nómina: {data.get('nombre')} - Periodo {data.get('periodo')}",
            valor=data.get('neto', 0),
            tipo='egreso',
            modulo_origen='rrhh',
            metadata={
                'empleado_cedula': data.get('cedula'),
                'sueldo_bruto': sum(c['valor'] for c in data.get('conceptos', []) if c['tipo'] == 'devengado'),
                'deducciones': sum(c['valor'] for c in data.get('conceptos', []) if c['tipo'] == 'deduccion')
            }
        )
        print(f"✅ Asiento contable generado para {data.get('cedula')}")
    except (LookupError, Exception) as e:
        # Si el modelo aún no existe o falla, permitimos que el PDF se genere 
        # pero dejamos rastro en los logs para auditoría
        print(f"⚠️ Nota: No se pudo registrar asiento contable: {str(e)}")

    # --- Generación de PDF ---
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # --- Diseño de Comprobante ---
    # Encabezado
    p.setFillColor(colors.HexColor("#1e293b"))
    p.rect(0, height - 80, width, 80, fill=1)
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, height - 45, "8AMPERIOS ERP - COMPROBANTE DE PAGO")
    p.setFont("Helvetica", 10)
    p.drawString(40, height - 60, f"Periodo: {data.get('periodo', 'Abril 2026')}")

    # Información del Empleado
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, height - 120, f"Empleado: {data.get('nombre', 'N/A')}")
    p.setFont("Helvetica", 10)
    p.drawString(40, height - 135, f"Cédula: {data.get('cedula', 'N/A')}")
    p.drawString(40, height - 150, f"Cargo: {data.get('cargo', 'N/A')}")

    # Tabla de Conceptos
    p.line(40, height - 170, width - 40, height - 170)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, height - 185, "CONCEPTO")
    p.drawRightString(width - 150, height - 185, "DEVENGADO")
    p.drawRightString(width - 50, height - 185, "DEDUCCIÓN")
    p.line(40, height - 195, width - 40, height - 195)

    # Cuerpo (Dinámico)
    y = height - 215
    conceptos = data.get('conceptos', [])
    p.setFont("Helvetica", 10)
    for c in conceptos:
        p.drawString(50, y, c['nombre'])
        if c['tipo'] == 'devengado':
            p.drawRightString(width - 150, y, f"$ {c['valor']:,.0f}")
        else:
            p.drawRightString(width - 50, y, f"$ {c['valor']:,.0f}")
        y -= 20

    # Totales
    p.line(40, y, width - 40, y)
    y -= 25
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "NETO A PAGAR:")
    p.drawRightString(width - 50, y, f"$ {data.get('neto', 0):,.0f}")

    # Pie de página
    p.setFont("Helvetica-Oblique", 8)
    p.drawString(40, 40, "Este documento es un soporte de pago electrónico generado por 8AMPERIOS ERP.")

    p.showPage()
    p.save()
    
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')

from django.http import FileResponse
from pathlib import Path

@api_view(['GET'])
@permission_classes([AllowAny])
def test_image(request, filename):
    """Endpoint temporal para probar acceso a imágenes"""
    import os, mimetypes, re
    base_dir = Path(__file__).parent.parent
    
    # Seguridad nivel SAP: Limpiar el filename para evitar saltos de directorio
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\w.-]', '', filename)
    
    # Intentar buscar en la raíz de media y en la subcarpeta productos
    image_path = base_dir / 'media' / 'productos' / filename
    print(f"DEBUG: Buscando imagen en: {image_path}")
    if not image_path.exists():
        image_path = base_dir / 'media' / filename
        print(f"DEBUG: No encontrada, buscando en: {image_path}")
    
    # Debug info
    debug_info = {
        'filename': filename,
        'base_dir': str(base_dir),
        'image_path': str(image_path),
        'exists': image_path.exists(),
        'cwd': os.getcwd(),
        'files_in_media': os.listdir(str(base_dir / 'media' / 'productos')) if (base_dir / 'media' / 'productos').exists() else 'directory not found'
    }
    
    if image_path.exists():
        try:
            content_type, _ = mimetypes.guess_type(str(image_path))
            response = FileResponse(open(image_path, 'rb'), content_type=content_type or 'image/jpeg')
            response['Cache-Control'] = 'public, max-age=86400' # Cache por 24 horas
            return response
        except Exception as e:
            debug_info['error'] = str(e)
            return JsonResponse(debug_info, status=500)
    
    return JsonResponse(debug_info, status=404)

from django.shortcuts import render

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Solo admins pueden gestionar usuarios

@api_view(['GET'])
def dashboard_stats(request):
    """
    Endpoint consolidado para el Dashboard de React.
    Retorna métricas de Ventas, Compras, Inventario y Facturación Electrónica.
    """
    from django.db.models import Sum, Count, F
    from facturacion.models import Factura
    from inventarios.models import Producto, MovimientoInventario
    from compras.models import OrdenCompra
    from venta.models import OrdenVenta
    
    # Rango de fecha (últimos 30 días por defecto)
    hace_30_dias = timezone.now() - timezone.timedelta(days=30)
    
    # 1. Ventas y Compras (Totales)
    total_ventas = OrdenVenta.objects.aggregate(total=Sum('total'))['total'] or 0
    total_compras = OrdenCompra.objects.aggregate(total=Sum('total'))['total'] or 0
    
    # 2. Facturación Electrónica (Estados DIAN)
    dian_stats = Factura.objects.values('estado_dian').annotate(cantidad=Count('id'))
    
    # 3. Inventario
    total_productos = Producto.objects.count()
    productos_stock_bajo = Producto.objects.filter(stock_actual__lte=F('stock_minimo')).count()
    valor_inventario = Producto.objects.aggregate(
        total=Sum(F('stock_actual') * F('precio_compra'))
    )['total'] or 0

    # 4. Movimientos recientes
    movimientos_recientes = MovimientoInventario.objects.select_related('producto').order_by('-fecha')[:5]
    movimientos_data = [{
        'id': m.id,
        'producto': m.producto.nombre,
        'tipo': m.get_tipo_display(),
        'cantidad': float(m.cantidad),
        'fecha': m.fecha.isoformat()
    } for m in movimientos_recientes]

    return JsonResponse({
        'resumen': {
            'ventas_totales': float(total_ventas),
            'compras_totales': float(total_compras),
            'balance': float(total_ventas - total_compras),
        },
        'inventario': {
            'total_items': total_productos,
            'stock_bajo': productos_stock_bajo,
            'valor_total': float(valor_inventario)
        },
        'facturacion': list(dian_stats),
        'movimientos': movimientos_data,
        'timestamp': timezone.now().isoformat()
    })

def dashboard_view(request):
    """
    Dashboard visual unificado para el ERP (Template Django).
    """
    from compras.models import OrdenCompra
    from venta.models import OrdenVenta
    from produccion.models import OrdenProduccion
    from django.db.models import Sum

    compras_total = OrdenCompra.objects.aggregate(total=Sum('total'))['total'] or 0
    ventas_total = OrdenVenta.objects.aggregate(total=Sum('total'))['total'] or 0
    produccion_count = OrdenProduccion.objects.filter(estado='en_proceso').count()

    context = {
        'compras_total': float(compras_total),
        'ventas_total': float(ventas_total),
        'produccion_en_proceso': produccion_count,
    }
    return render(request, 'dashboard.html', context)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reporte_pyl_api(request):
    """
    Analítica de Pérdidas y Ganancias (P&L) nivel SAP.
    Agrega datos del Libro Mayor para visualización ejecutiva.
    """
    from django.db.models import Sum
    from django.db.models.functions import ExtractMonth, ExtractYear
    from contabilidad.models import AsientoContable
    
    year = int(request.query_params.get('year', timezone.now().year))
    
    # 1. Agregación Mensual para Gráficos
    stats_mensuales = AsientoContable.objects.filter(fecha__year=year)\
        .annotate(mes=ExtractMonth('fecha'))\
        .values('mes', 'tipo')\
        .annotate(total=Sum('valor'))\
        .order_by('mes')

    # Transformar a formato para Recharts
    meses_nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    data_grafico = {m: {'mes': meses_nombres[m-1], 'ingresos': 0, 'egresos': 0} for m in range(1, 13)}
    
    for item in stats_mensuales:
        key = 'ingresos' if item['tipo'] == 'ingreso' else 'egresos'
        data_grafico[item['mes']][key] = float(item['total'])

    # 2. Desglose por Módulo (Trazabilidad SAP)
    desglose_modulos = AsientoContable.objects.filter(fecha__year=year)\
        .values('modulo_origen', 'tipo')\
        .annotate(total=Sum('valor'))\
        .order_by('-total')

    # 3. Cálculo de Totales
    ingresos_totales = AsientoContable.objects.filter(fecha__year=year, tipo='ingreso')\
        .aggregate(Sum('valor'))['valor__sum'] or 0
    egresos_totales = AsientoContable.objects.filter(fecha__year=year, tipo='egreso')\
        .aggregate(Sum('valor'))['valor__sum'] or 0

    return JsonResponse({
        'periodo': year,
        'resumen': {
            'ingresos_totales': float(ingresos_totales),
            'egresos_totales': float(egresos_totales),
            'utilidad_neta': float(ingresos_totales - egresos_totales),
            'margen_operativo': round(float((ingresos_totales - egresos_totales) / ingresos_totales * 100), 2) if ingresos_totales > 0 else 0
        },
        'grafico_tendencia': list(data_grafico.values()),
        'desglose_modulos': list(desglose_modulos),
        'timestamp': timezone.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """
    Endpoint para estadísticas del dashboard principal.
    Retorna datos en formato compatible con Dashboard_Moderno.jsx
    """
    from crm.models import Cliente, Cotizacion
    from venta.models import OrdenVenta, FacturaVenta
    from inventarios.models import Producto
    from compras.models import Proveedor, OrdenCompra
    from operaciones.models import Proyecto
    from rrhh.models import Empleado
    from pos.models import MovimientoCaja

    # Estructura compatible con Dashboard_Moderno.jsx
    stats = {
        'resumen': {
            'total_clientes': Cliente.objects.count(),
            'total_ordenes': OrdenVenta.objects.count(),
            'total_facturas': FacturaVenta.objects.count(),
            'total_cotizaciones': Cotizacion.objects.count(),
        },
        'inventario': {
            'total_items': Producto.objects.count(),
            'total_valor': 0  # Placeholder, calcular si es necesario
        },
        'facturacion': {
            'total_ordenes': OrdenVenta.objects.count(),
            'total_facturas': FacturaVenta.objects.count(),
        },
        'movimientos': list(MovimientoCaja.objects.values()[:10]),
        'rrhh': {
            'total_empleados': Empleado.objects.count(),
            'total_proyectos': Proyecto.objects.count()
        },
        'timestamp': timezone.now().isoformat()
    }

    return JsonResponse(stats)
