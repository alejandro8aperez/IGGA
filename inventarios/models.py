from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    class Meta:
        db_table = 'inventarios_categoriaproducto'
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    codigo_sku = models.CharField(max_length=50, unique=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2)
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5)

    def __str__(self):
        return f"[{self.codigo_sku}] {self.nombre}"

class MovimientoInventario(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    tipo = models.CharField(max_length=10, choices=[('entrada', 'Entrada'), ('salida', 'Salida')])
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.tipo} de {self.cantidad} {self.producto.nombre}"
