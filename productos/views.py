from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch
from erp_core.permissions import IsInventarioUser
from inventarios.models import Producto
from .models import (
    GrupoMaterial, FamiliaProducto, TipoEmpaque, FichaProducto,
    CodigoBarras, UnidadEmpaque, UnidadMedidaAlternativa,
)
from .serializers import (
    GrupoMaterialSerializer, FamiliaProductoSerializer, TipoEmpaqueSerializer,
    FichaProductoSerializer, CodigoBarrasSerializer, UnidadEmpaqueSerializer,
    UnidadMedidaAlternativaSerializer,
    ProductoMaestroSerializer, ProductoMaestroListSerializer,
)


class GrupoMaterialViewSet(viewsets.ModelViewSet):
    queryset = GrupoMaterial.objects.filter(activo=True)
    serializer_class = GrupoMaterialSerializer
    permission_classes = [IsInventarioUser]


class FamiliaProductoViewSet(viewsets.ModelViewSet):
    queryset = FamiliaProducto.objects.select_related('padre').all()
    serializer_class = FamiliaProductoSerializer
    permission_classes = [IsInventarioUser]


class TipoEmpaqueViewSet(viewsets.ModelViewSet):
    queryset = TipoEmpaque.objects.filter(activo=True)
    serializer_class = TipoEmpaqueSerializer
    permission_classes = [IsInventarioUser]


class CodigoBarrasViewSet(viewsets.ModelViewSet):
    queryset = CodigoBarras.objects.select_related('producto').all()
    serializer_class = CodigoBarrasSerializer
    permission_classes = [IsInventarioUser]

    def get_queryset(self):
        qs = super().get_queryset()
        producto_id = self.request.query_params.get('producto')
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        codigo = self.request.query_params.get('codigo')
        if codigo:
            qs = qs.filter(codigo=codigo)
        return qs


class UnidadEmpaqueViewSet(viewsets.ModelViewSet):
    queryset = UnidadEmpaque.objects.select_related('producto').all()
    serializer_class = UnidadEmpaqueSerializer
    permission_classes = [IsInventarioUser]

    def get_queryset(self):
        qs = super().get_queryset()
        producto_id = self.request.query_params.get('producto')
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        return qs


class UnidadMedidaAlternativaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedidaAlternativa.objects.select_related('producto', 'unidad').all()
    serializer_class = UnidadMedidaAlternativaSerializer
    permission_classes = [IsInventarioUser]

    def get_queryset(self):
        qs = super().get_queryset()
        producto_id = self.request.query_params.get('producto')
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        return qs


class ProductoMaestroViewSet(viewsets.ModelViewSet):
    """
    Maestro de productos estilo SAP MM.
    CRUD completo con ficha extendida, codigos de barras y empaques.
    """
    permission_classes = [IsInventarioUser]

    def get_queryset(self):
        qs = Producto.objects.select_related(
            'categoria', 'almacen', 'ficha__grupo_material',
            'ficha__familia', 'ficha__tipo_empaque',
        ).prefetch_related(
            'codigos_barras', 'unidades_empaque', 'unidades_alternativas__unidad',
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(nombre__icontains=search) |
                Q(codigo_sku__icontains=search) |
                Q(marca__icontains=search) |
                Q(referencia_fabrica__icontains=search) |
                Q(ficha__codigo_gtin__icontains=search) |
                Q(codigos_barras__codigo__icontains=search)
            ).distinct()

        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)

        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo_producto=tipo)

        grupo = self.request.query_params.get('grupo_material')
        if grupo:
            qs = qs.filter(ficha__grupo_material_id=grupo)

        familia = self.request.query_params.get('familia')
        if familia:
            qs = qs.filter(ficha__familia_id=familia)

        estado = self.request.query_params.get('estado_material')
        if estado:
            qs = qs.filter(ficha__estado_material=estado)

        activo = self.request.query_params.get('activo')
        if activo is not None:
            qs = qs.filter(activo=activo.lower() == 'true')

        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductoMaestroListSerializer
        return ProductoMaestroSerializer

    # NUEVO: Asegurar que el contexto 'request' se pase al serializer en list
    def get_serializer(self, *args, **kwargs):
        kwargs.setdefault('context', self.get_serializer_context())
        return super().get_serializer(*args, **kwargs)

    @action(detail=False, methods=['get'], url_path='por-codigo-barras')
    def por_codigo_barras(self, request):
        """Buscar producto por codigo de barras (POS, almacen)."""
        codigo = request.query_params.get('codigo', '').strip()
        if not codigo:
            return Response({'detail': 'Parametro codigo requerido'}, status=400)

        cb = CodigoBarras.objects.filter(codigo=codigo, activo=True).select_related('producto').first()
        if cb:
            producto = Producto.objects.filter(pk=cb.producto_id).select_related(
                'categoria', 'almacen', 'ficha'
            ).prefetch_related('codigos_barras', 'unidades_empaque').first()
            return Response(ProductoMaestroSerializer(producto, context={'request': request}).data)

        ficha = FichaProducto.objects.filter(codigo_gtin=codigo).select_related('producto').first()
        if ficha:
            producto = Producto.objects.filter(pk=ficha.producto_id).select_related(
                'categoria', 'almacen', 'ficha'
            ).prefetch_related('codigos_barras', 'unidades_empaque').first()
            return Response(ProductoMaestroSerializer(producto, context={'request': request}).data)

        producto = Producto.objects.filter(codigo_sku=codigo, activo=True).first()
        if producto:
            return Response(ProductoMaestroSerializer(producto, context={'request': request}).data)

        return Response({'detail': 'Producto no encontrado'}, status=404)

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        total = Producto.objects.filter(activo=True).count()
        con_ficha = FichaProducto.objects.filter(producto__activo=True).count()
        con_barras = CodigoBarras.objects.filter(activo=True).values('producto').distinct().count()
        grupos = GrupoMaterial.objects.filter(activo=True).count()
        return Response({
            'total_productos': total,
            'con_ficha_sap': con_ficha,
            'con_codigo_barras': con_barras,
            'grupos_material': grupos,
            'sin_ficha': total - con_ficha,
        })

    @action(detail=True, methods=['post'], url_path='crear-ficha')
    def crear_ficha(self, request, pk=None):
        """Crea ficha SAP vacia si no existe."""
        producto = self.get_object()
        ficha, created = FichaProducto.objects.get_or_create(producto=producto)
        return Response(
            FichaProductoSerializer(ficha).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
