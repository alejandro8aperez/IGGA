# Manual de Usuario - ERP para Panadería LA BOQUILLA

## Introducción

Este ERP está diseñado específicamente para panaderías. Permite gestionar ventas en punto de venta (POS), control de inventario, producción de recetas, facturación electrónica DIAN y reportes de caja.

---

## Módulos Principales

### 1. Punto de Venta (POS) - "LA BOQUILLA"

**Propósito:** Registrar ventas rápidas de pan, pasteles, bebidas y productos de cafetería.

**Características:**
- **Productos pre-configurados:** Panadería, Pastelería, Cafetería y Bebidas
- **Carrito de compras:** Agregar, quitar y modificar cantidades
- **Múltiples métodos de pago:** Efectivo, Tarjeta, Transferencia
- **Facturación automática:** Cada venta genera factura electrónica con CUFE
- **Control de caja:** Apertura y cierre de turno con arqueo

**Proceso de Venta:**
1. Abrir módulo **POS**
2. La caja se abre automáticamente con base de $50,000
3. Seleccionar productos del grid (clic en la tarjeta del producto)
4. Modificar cantidades en el carrito si es necesario
5. Click en **"Proceder al Pago"**
6. Seleccionar método de pago:
   - **Efectivo:** Ingresar monto recibido, el sistema calcula el cambio
   - **Tarjeta/Transferencia:** No requiere cambio
7. Click en **"FINALIZAR E IMPRIMIR"**
8. El sistema muestra el ticket con número de factura y CUFE

**Cierre de Caja:**
1. Click en botón rojo de cierre (esquina superior derecha)
2. Ingresar el efectivo real contado en caja
3. Click en **"CERRAR TURNO"**
4. El sistema genera reporte comparando sistema vs. contado

---

### 2. Inventario y Productos

**Propósito:** Controlar stock de materias primas y productos terminados.

**Categorías de Panadería:**
- **Panadería:** Pan aliñado, pan de bono, buñuelos, croissants, pan de queso
- **Pastelería:** Pasteles de pollo, milhojas, tortas, donas
- **Cafetería y Bebidas:** Café tinto, café con leche, gaseosas, jugos, chocolate

**Procesos:**
- **Consultar stock:** Ver cantidades disponibles por producto
- **Ajustar inventario:** Modificar stock cuando hay mermas o sobrantes
- **Ver valor de inventario:** Total monetario del inventario actual

**Productos iniciales incluidos:**

| SKU | Producto | Precio Venta |
|-----|----------|--------------|
| PAN001 | Pan Aliñado Grande | $5,000 |
| PAN002 | Pan de Bono (Ud) | $2,000 |
| PAN003 | Buñuelo Calientico | $1,500 |
| PAN004 | Croissant de Mantequilla | $4,500 |
| PAN005 | Pan de Queso | $2,500 |
| PAS001 | Pastel de Pollo | $5,500 |
| PAS002 | Milhoja de Arequipe | $6,500 |
| PAS003 | Torta de Chocolate (Porción) | $8,000 |
| PAS004 | Donas Variadas | $4,000 |
| BEB001 | Café Tinto | $2,500 |
| BEB002 | Café con Leche | $4,000 |
| BEB003 | Gaseosa Mini | $2,500 |
| BEB004 | Jugo Natural | $6,000 |
| BEB005 | Chocolate Santafereño | $4,500 |

---

### 3. Producción y Recetas

**Propósito:** Planificar y controlar la producción diaria de pan y pasteles.

**Características:**
- **Recetas:** Definir ingredientes por producto terminado
- **Órdenes de producción:** Programar lotes con fecha y cantidad
- **Costos automáticos:** Calcula costo de materias primas + mano de obra + indirectos
- **Descuento de insumos:** Al iniciar producción, descuenta del inventario
- **Ingreso de terminados:** Al finalizar, suma productos terminados al inventario

**Proceso de Producción:**
1. Ir a módulo **Producción**
2. Crear **Orden de Producción:**
   - Seleccionar receta (ej: Receta de Pan Aliñado)
   - Definir cantidad a producir (ej: 50 unidades)
   - Fecha de inicio
3. **Iniciar producción:** El sistema verifica stock de insumos y los descuenta
4. **Finalizar producción:** El sistema:
   - Suma productos terminados al inventario
   - Calcula costo total de producción
   - Genera asiento contable automático

---

### 4. Facturación Electrónica (DIAN)

**Propósito:** Emitir facturas de venta válidas ante la DIAN con CUFE y QR.

**Características:**
- **Resolución de facturación:** Prefijo FE, numeración automática
- **Facturas POS:** Se generan automáticamente con cada venta (prefijo POS)
- **Estados:** Borrador → Validada (con CUFE)
- **Retenciones:** Configurable Retefuente y ReteICA por factura
- **Reportes:** Historial completo con filtros

**Flujo de Factura:**
1. Venta en POS → Factura borrador creada automáticamente
2. Al finalizar venta → Se emite a DIAN con:
   - Número de factura (POS + consecutivo)
   - CUFE único
   - Estado: "Validada"
3. El cliente recibe factura electrónica válida

---

### 5. Clientes (CRM)

**Propósito:** Gestión de clientes habituales y mayoristas.

**Clientes especiales:**
- **Consumidor Final:** Cliente por defecto en ventas POS (NIT: 222222222222)
- **Clientes registrados:** Para facturación con datos específicos

---

### 6. Contabilidad

**Propósito:** Registro automático de movimientos contables.

**Cuentas pre-configuradas:**
- **140101 - Inventario producto terminado**
- **120101 - Inventario materia prima**
- **510101 - Costo de producción**

**Asientos automáticos:**
- Cada venta POS genera asiento de ingreso
- Cada producción finalizada genera asiento de costo

---

## Flujo de Trabajo Diario Recomendado

### Mañana - Apertura
1. **Abrir POS** - La caja se abre automáticamente con base de $50,000
2. **Verificar inventario** - Revisar stock de productos para el día
3. **Programar producción** - Crear órdenes de producción para lo que se va a hornear

### Durante el día
4. **Atender clientes** - Usar POS para registrar todas las ventas
5. **Iniciar producción** - Cuando se comience a preparar productos
6. **Finalizar producción** - Al terminar hornear, registrar en sistema

### Tarde - Cierre
7. **Cierre de caja** - Contar efectivo y cerrar turno
8. **Revisar reportes** - Ver ventas del día y comparar sistema vs. real

---

## Configuración Inicial (Solo una vez)

Para cargar los datos base de la panadería:

1. Ir a módulo **Configuración**
2. Buscar botón **"Cargar Datos de Panadería"**
3. Confirmar - Esto creará:
   - Categorías: Panadería, Pastelería, Cafetería y Bebidas
   - 14 productos con precios y stock inicial
   - Resolución de facturación POS
   - Cliente Consumidor Final

---

## Tips Importantes

- **No es necesario crear productos manualmente** - Vienen pre-cargados
- **Toda venta en POS genera factura electrónica automáticamente**
- **El IVA es del 19%** (configuración colombiana)
- **Cierre de caja es obligatorio** al final del turno para cuadre
- **Producción descontará insumos** del inventario al iniciarse
- **Reportes contables se generan automáticamente** - No requieren entrada manual

---

## Soporte

Si encuentras algún error:
1. Revisar que el backend esté corriendo (python manage.py runserver)
2. Verificar conexión a internet (para nube/Render)
3. Revisar consola del navegador (F12) para mensajes de error
