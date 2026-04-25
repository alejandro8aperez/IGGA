# 📘 Manual de Usuario - ERP 8AMPERIOS
## Guía de Funcionalidades

---

## 🏠 1. Módulo INICIO (Dashboard)

### ¿Qué hace?
Es la página principal del sistema después de iniciar sesión. Muestra un resumen visual de toda la operación de la empresa.

### Funcionalidades:
- **KPIs en tiempo real**: Ventas del día, compras, clientes activos, órdenes pendientes
- **Gráficos interactivos**: Ventas mensuales, compras, producción, contabilidad
- **Estado de inventario**: Productos con stock bajo, movimientos recientes
- **Acceso rápido**: Navegación directa a los módulos más usados

### ¿Cómo usarlo?
1. Al iniciar sesión, selecciona tu empresa (Industrial, Comercial o Servicios)
2. El dashboard carga automáticamente con datos de tu empresa
3. Haz clic en cualquier KPI o gráfico para ir al módulo detallado
4. Usa el botón "Exportar Excel" para descargar reportes

---

## 👥 2. Módulo CRM (Gestión de Clientes)

### ¿Qué hace?
Administra toda la información de clientes, prospectos y oportunidades de venta. Es el corazón del área comercial.

### Funcionalidades:

#### Clientes
- **Registrar cliente**: Nombre, NIT/CC, dirección, teléfono, email, representante legal
- **Ver historial**: Todas las cotizaciones, facturas y pedidos del cliente
- **Segmentar**: Clasificar clientes por tipo (Mayorista, Minorista, Corporativo)
- **Estado**: Activos, Inactivos, Prospectos

#### Oportunidades de Venta
- **Crear oportunidad**: Asociar a un cliente, definir monto estimado, probabilidad de cierre
- **Pipeline**: Ver en qué etapa está cada oportunidad (Contacto, Propuesta, Negociación, Cierre)
- **Seguimiento**: Fecha de cierre estimada, responsable asignado

#### Cotizaciones
- **Generar cotización**: Seleccionar cliente, agregar productos/servicios, precios
- **Exportar PDF**: Enviar cotización formal al cliente
- **Estados**: Borrador → Enviada → Aceptada → Rechazada

### ¿Cómo usarlo?
1. Ve a **CRM** en el menú lateral
2. Para nuevo cliente: clic en "+ Nuevo Cliente", llena los campos y guarda
3. Para cotizar: clic en "+ Nueva Cotización", selecciona cliente, agrega ítems
4. Para seguir oportunidades: usa la vista "Oportunidades" y mueve tarjetas entre columnas

---

## 🛒 3. Módulo VENTAS

### ¿Qué hace?
Gestiona todo el ciclo de ventas: desde el pedido hasta la facturación.

### Funcionalidades:

#### Pedidos de Venta
- **Crear pedido**: Seleccionar cliente, fecha de entrega, productos, cantidades
- **Estados**: Pendiente → En proceso → Despachado → Entregado
- **Asignar vendedor**: Cada pedido tiene responsable
- **Prioridad**: Normal, Urgente, Crítica

#### Facturación
- **Generar factura electrónICA**: Cumple normativa DIAN de Colombia
- **Número de factura**: Automático según resolución vigente
- **Formas de pago**: Contado, Crédito 30/60/90 días
- **Estados**: Pendiente → Pagada → Vencida → Anulada

#### Devoluciones
- **Registrar devolución**: Cliente, factura original, motivo, productos devueltos
- **Nota crédito**: Generar automáticamente para compensar

### ¿Cómo usarlo?
1. Ve a **Ventas** en el menú
2. Crear pedido: "+ Nuevo Pedido" → Selecciona cliente → Agrega productos → Guarda
3. Facturar: Abre pedido → Clic en "Generar Factura" → Verifica datos → Confirmar
4. Ver facturas: Filtros por fecha, cliente, estado de pago

---

## 📦 4. Módulo INVENTARIOS

### ¿Qué hace?
Controla todo el stock de productos, materias primas y materiales. Evita quedarse sin productos o tener exceso de inventario.

### Funcionalidades:

#### Productos
- **Catálogo completo**: Código, nombre, descripción, categoría, unidad de medida
- **Stock disponible**: Cantidad actual en bodega
- **Precios**: Costo promedio, precio de venta, margen de ganancia
- **Stock mínimo/máximo**: Alertas cuando hay que reponer

#### Categorías
- **Organizar productos**: Por tipo (Terminados, Materias primas, Servicios)
- **Jerarquía**: Categoría padre y subcategorías

#### Movimientos de Inventario
- **Entradas**: Compras, producción, ajustes positivos
- **Salidas**: Ventas, consumo interno, mermas, ajustes negativos
- **Kardex**: Historial completo de cada producto

#### Alertas
- **Stock bajo**: Productos por debajo del mínimo (se muestran en rojo)
- **Exceso de inventario**: Productos por encima del máximo

### ¿Cómo usarlo?
1. Ve a **Inventarios** en el menú
2. Ver productos: Lista con filtros por categoría, stock, estado
3. Agregar producto: "+ Nuevo" → Llena código, nombre, categoría, precios, stock inicial
4. Ver movimientos: "Movimientos" → Filtros por fecha, tipo, producto
5. Reposición: Revisa alertas de stock bajo → Ve a Compras para hacer orden

---

## 🏭 5. Módulo PRODUCCIÓN / MRP

### ¿Qué hace?
Planifica y controla la manufactura de productos. Desde la orden de producción hasta el producto terminado.

### Funcionalidades:

#### Órdenes de Producción
- **Crear OP**: Producto a fabricar, cantidad, fecha requerida
- **Lista de materiales (BOM)**: Materias primas necesarias automáticas
- **Estados**: Planeada → En proceso → Terminada → Cancelada
- **Asignar recursos**: Máquinas, operarios responsables

#### Planeación MRP
- **Calcula necesidades**: Qué materiales comprar y cuándo
- **Fechas de entrega**: Considera tiempos de proveedores
- **Alertas de faltantes**: Materias primas insuficientes para cumplir órdenes

#### Control de Calidad
- **Inspección en proceso**: Revisar calidad durante la producción
- **Producto terminado**: Inspección final antes de pasar a inventario
- **Rechazos**: Registrar defectos y motivos

### ¿Cómo usarlo?
1. Ve a **Producción** en el menú
2. Nueva orden: "+ Nueva OP" → Selecciona producto → Cantidad → Fecha entrega
3. El sistema calcula automáticamente materiales necesarios
4. Si faltan materiales: El sistema alerta → Ve a Compras
5. Ejecutar producción: Cambia estado "En proceso" → "Terminada" → Stock se actualiza automático

---

## 🛍️ 6. Módulo COMPRAS

### ¿Qué hace?
Gestiona proveedores y todas las compras de la empresa. Desde la cotización con proveedor hasta la recepción en bodega.

### Funcionalidades:

#### Proveedores
- **Directorio**: Nombre, NIT, contacto, dirección, términos de pago
- **Evaluación**: Calificar proveedores (calidad, precio, puntualidad)
- **Historial**: Todas las órdenes y compras por proveedor

#### Órdenes de Compra
- **Crear OC**: Proveedor, productos, cantidades, precios negociados
- **Estados**: Borrador → Enviada → Confirmada → Recepcionada
- **Aprobar**: Flujo de aprobación según monto

#### Recepción de Compras
- **Registrar entrada**: Productos recibidos, cantidad, fecha
- **Control de calidad**: Aceptar, rechazar parcial, rechazar total
- **Diferencias**: Comparar OC vs. lo recibido

#### Pagos
- **Seguimiento**: Qué órdenes están pagadas, pendientes, vencidas
- **Programación**: Fechas de pago según términos acordados

### ¿Cómo usarlo?
1. Ve a **Compras** en el menú
2. Nuevo proveedor: "+ Proveedor" → Datos completos → Guardar
3. Crear orden: "+ Nueva OC" → Selecciona proveedor → Agrega productos → Guardar
4. Enviar al proveedor: Descargar PDF o enviar email directo
5. Recepcionar: Cuando llega mercancía → "Recepcionar" → Verificar cantidades → Confirmar
6. El inventario se actualiza automáticamente

---

## 💰 7. Módulo FINANZAS / TESORERÍA

### ¿Qué hace?
Controla el dinero de la empresa: entradas, salidas, flujo de caja, y pagos.

### Funcionalidades:

#### Cuentas por Pagar
- **Facturas de proveedores**: Registrar lo que se debe pagar
- **Vencimientos**: Calendario de pagos próximos
- **Pagos programados**: Planificar pagos según flujo de caja

#### Cuentas por Cobrar
- **Facturas de clientes**: Ver quién debe dinero
- **Cartera**: Facturas vencidas, al día, por vencer
- **Recaudo**: Registrar pagos recibidos

#### Flujo de Caja
- **Proyección**: Cuánto dinero tendré la próxima semana/mes
- **Entradas vs. Salidas**: Comparativo visual
- **Alertas**: Cuándo habrá déficit de caja

#### Bancos
- **Múltiples cuentas**: Corriente, ahorros, inversiones
- **Conciliación**: Comparar sistema vs. extractos bancarios
- **Transferencias**: Movimientos entre cuentas propias

### ¿Cómo usarlo?
1. Ve a **Finanzas** en el menú
2. Ver por cobrar: "Cuentas por Cobrar" → Lista de facturas pendientes
3. Registrar pago recibido: Selecciona factura → "Registrar Pago" → Método, fecha, monto
4. Ver por pagar: "Cuentas por Pagar" → Prioriza por fecha de vencimiento
5. Flujo de caja: "Proyección" → Ver gráfico de entradas/salidas futuras

---

## 📊 8. Módulo CONTABILIDAD

### ¿Qué hace?
Lleva los libros contables de la empresa. Registra todos los movimientos financieros según normativa.

### Funcionalidades:

#### Plan de Cuentas
- **Estructura contable**: Activo, Pasivo, Patrimonio, Ingresos, Gastos
- **Códigos**: Nivel 1 (grupos), Nivel 2 (cuentas), Nivel 3 (subcuentas)
- **Saldos**: Débito, crédito, saldo de cada cuenta

#### Comprobantes Contables
- **Registrar asiento**: Fecha, concepto, cuentas afectadas, débitos, créditos
- **Tipos**: Ingreso, Egreso, Traslado, Nota débito/crédito
- **Anulaciones**: Reversar comprobantes erróneos

#### Estados Financieros
- **Balance General**: Activos = Pasivos + Patrimonio
- **Estado de Resultados**: Ingresos - Gastos = Utilidad
- **Flujo de Efectivo**: Origen y aplicación de recursos

#### Cierre Contable
- **Cierre mensual**: Bloquear periodo una vez conciliado
- **Depreciaciones**: Activos fijos
- **Ajustes por inflación**: Si aplica

### ¿Cómo usarlo?
1. Ve a **Contabilidad** en el menú
2. Ver plan de cuentas: Estructura completa del PUC (Plan Único de Cuentas)
3. Registrar asiento: "+ Nuevo Comprobante" → Fecha → Concepto → Agregar líneas (cuenta, débito/crédito)
4. Generar reportes: "Estados Financieros" → Selecciona fecha corte → Ver/Exportar

---

## 📈 9. Módulo REPORTES (Power BI)

### ¿Qué hace?
Análisis avanzado de toda la información del ERP. Dashboards interactivos tipo Power BI.

### Funcionalidades:

#### KPIs Generales
- **Ventas**: Total, por período, crecimiento vs. mes anterior
- **Compras**: Total, por proveedor, por categoría
- **Producción**: Unidades fabricadas, eficiencia
- **Clientes**: Nuevos, activos, inactivos

#### Gráficos Interactivos
- **Tendencias**: Líneas de tiempo con ventas/meses
- **Distribución**: Tortas (ventas por producto, compras por proveedor)
- **Comparativos**: Barras (sucursales, vendedores, períodos)

#### Análisis
- **ABC de inventario**: Qué productos generan más ventas
- **Rotación**: Qué productos se venden más rápido
- **Rentabilidad**: Margen por producto, cliente, línea

#### Exportar
- **Excel**: Descargar todos los datos para análisis externo
- **PDF**: Reportes para presentaciones
- **Automáticos**: Enviar por email periódicamente

### ¿Cómo usarlo?
1. Ve a **Reportes** en el menú
2. Selecciona rango de fechas (hoy, esta semana, este mes, personalizado)
3. Explora los gráficos: Clic en elementos para filtrar
4. Exportar: Clic en "Exportar Excel" o "Exportar PDF"

---

## 🏪 10. Módulo POS (Punto de Venta)

### ¿Qué hace?
Venta rápida para tiendas físicas. Interfaz simplificada para cajeros.

### Funcionalidades:

#### Venta Rápida
- **Escáner**: Leer código de barras
- **Teclado numérico**: Para productos sin código
- **Múltiples formas de pago**: Efectivo, tarjeta, transferencia, mixto
- **Cálculo de vueltas**: Automático

#### Caja
- **Apertura**: Registrar base inicial de dinero
- **Cierre X (parcial)**: Sin cerrar caja, solo consulta
- **Cierre Z (final)**: Corte de caja con arqueo
- **Arqueo**: Comparar sistema vs. dinero físico

#### Comprobantes
- **Factura**: Con datos del cliente
- **Ticket/Boleta**: Sin datos del cliente
- **Nota de venta**: Para casos especiales

### ¿Cómo usarlo?
1. Ve a **POS** en el menú
2. Abrir caja: "Abrir Turno" → Ingresa base inicial
3. Nueva venta: Escanea productos o busca por nombre
4. Pago: Selecciona forma de pago → Recibe dinero → Sistema calcula cambio
5. Imprimir: Ticket automático (si hay impresora configurada)
6. Cierre: "Cerrar Turno" → Cuenta dinero físico → Ingresa arqueo → Confirmar

---

## 🔧 11. Módulo CONFIGURACIÓN

### ¿Qué hace?
Ajustar parámetros del sistema, usuarios, permisos y estructura de la empresa.

### Funcionalidades:

#### Empresa
- **Datos generales**: Nombre, NIT, dirección, logo, teléfono
- **Resoluciones DIAN**: Numeración de facturación electrónica
- **Sucursales**: Múltiples puntos de venta/bodegas

#### Usuarios
- **Crear usuario**: Nombre, email, contraseña
- **Roles**: Administrador, Vendedor, Compras, Producción, Contabilidad
- **Permisos**: Qué puede ver y hacer cada usuario

#### Parámetros
- **Unidades de medida**: Unidad, kilo, litro, metro, caja, etc.
- **Monedas**: COP (peso colombiano), USD (dólar)
- **Impuestos**: IVA, retenciones
- **Formas de pago**: Efectivo, tarjeta, transferencia, cheque

#### Integraciones
- **Facturación electrónica**: Configurar proveedor tecnológico (Káve, etc.)
- **Pasarelas de pago**: Wompi, Stripe, PayU
- **Email**: Configurar SMTP para enviar correos automáticos

### ¿Cómo usarlo?
1. Ve a **Configuración** en el menú
2. Datos empresa: "Empresa" → Editar → Guardar
3. Usuarios: "Usuarios" → "+ Nuevo" → Datos → Rol → Guardar
4. Parámetros: "General" → Ajusta unidades, monedas, impuestos

---

## 🚀 Flujos de Trabajo Comunes

### Flujo 1: Venta Completa (desde cotización hasta cobro)
1. **CRM** → Nueva cotización → Enviar al cliente
2. Cliente acepta → Cotización se convierte en **Pedido**
3. **Ventas** → Pedido → Generar **Factura**
4. **Finanzas** → Cuentas por Cobrar → Registrar **Pago**
5. **Inventarios** → Stock descuenta automáticamente
6. **Contabilidad** → Se genera asiento automático (Ingreso)

### Flujo 2: Compra de Inventario
1. **Inventarios** → Ver alertas de stock bajo
2. **Compras** → Nueva orden de compra → Enviar a proveedor
3. Proveedor entrega → **Compras** → Recepcionar
4. **Inventarios** → Stock aumenta automáticamente
5. **Finanzas** → Cuentas por Pagar → Programar pago
6. **Contabilidad** → Asiento automático (Activo/Proveedores)

### Flujo 3: Producción de un Producto
1. **Producción** → Nueva orden de producción
2. Sistema verifica **Inventarios** de materias primas
3. Si falta material → **Compras** → Orden de compra urgente
4. Si hay material → **Producción** → Iniciar proceso
5. Termina producción → **Inventarios** → Producto terminado ingresa
6. Materias primas se descuentan automáticamente

### Flujo 4: Cierre Contable Mensual
1. **Contabilidad** → Revisar comprobantes del mes
2. **Finanzas** → Conciliar bancos (sistema vs. extractos)
3. **Inventarios** → Toma física y ajustes
4. **Contabilidad** → Depreciaciones y ajustes
5. **Contabilidad** → Generar Estados Financieros
6. **Contabilidad** → Cerrar periodo (bloquear edición)

---

## 💡 Tips de Productividad

### Atajos de Teclado
- `Ctrl + N`: Nuevo registro (en cualquier módulo)
- `Ctrl + B`: Buscar
- `Ctrl + P`: Imprimir/Exportar PDF
- `Esc`: Cerrar modal/volver

### Búsqueda Avanzada
- Usa filtros combinados: "Clientes de Bogotá que compraron en 2024"
- Búsqueda por código de barras en POS
- Autocompletado en campos de cliente/producto

### Alertas Automáticas
- Stock bajo (correo cada mañana)
- Facturas por vencer (3 días antes)
- Oportunidades sin seguimiento (7 días)
- Órdenes de producción atrasadas

### Reportes Programados
- Configura reportes automáticos semanales para dirección
- Dashboard enviado por email cada lunes
- Alertas de inventario crítico

---

## 🆘 Soporte y Ayuda

### Si tienes problemas:
1. Revisa tu conexión a internet
2. Verifica que la empresa seleccionada sea la correcta
3. Cierra sesión y vuelve a iniciar
4. Limpia caché del navegador (Ctrl + Shift + R)
5. Contacta al administrador del sistema

### Contacto Soporte Técnico:
- **Email**: soporte@8amperios.com
- **Teléfono**: +57 (604) XXX-XXXX
- **Horario**: Lunes a Viernes 8:00 AM - 6:00 PM

---

## 📱 Versión Móvil

El ERP 8AMPERIOS funciona en celulares y tablets:
- Accede desde el navegador de tu dispositivo
- Interfaz adaptativa (se ajusta al tamaño de pantalla)
- Funciones principales disponibles: Ventas, Inventarios, Clientes
- POS optimizado para tablets en punto de venta

---

**Versión del Manual**: 1.0  
**Última actualización**: Abril 2026  
**ERP 8AMPERIOS** - Potenciando tu Empresa
