# FASE 2: TESORERÍA - ARQUITECTURA E IMPLEMENTACIÓN COMPLETA

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Modelos de Datos](#modelos-de-datos)
4. [Servicios](#servicios)
5. [API REST](#api-rest)
6. [Integración con Contabilidad](#integración-con-contabilidad)
7. [Instrucciones de Uso](#instrucciones-de-uso)
8. [Tests](#tests)

---

## 🎯 Introducción

**Tesorería (Phase 2)** es un módulo **independiente pero fuertemente vinculado** a Contabilidad (Phase 1). 

Propósito:
- ✅ Gestionar cuentas bancarias, movimientos, cheques
- ✅ Realizar conciliaciones bancarias automáticas
- ✅ Proyectar flujo de caja (30/60/90 días)
- ✅ Calcular indicadores financieros (KPIs)
- ✅ **Generar asientos contables automáticos** para cada movimiento

**Principio de Integración:** Cada movimiento de tesorería genera automáticamente un asiento contable en el módulo de Contabilidad, manteniendo la sincronización.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 2: TESORERÍA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   MODELOS    │  │  SERVICIOS   │  │ API VIEWSETS │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ • Cuenta     │  │ • Gestión    │  │ • REST API   │           │
│  │   Bancaria   │  │   Flujo      │  │   Endpoints  │           │
│  │ • Movimiento │  │ • Conciliación   │ • Serializers│          │
│  │ • Cheque     │  │ • Proyección │  │ • Paginación │          │
│  │ • Proyecto   │  │ • Indicadores│  │             │           │
│  │   Flujo Caja │  │              │  │             │           │
│  │ • Indicador  │  │              │  │             │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INTEGRACION CON CONTABILIDAD (FASE 1)                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • FK a contabilidad.Cuenta (CuentaBancaria)             │  │
│  │ • Auto-create contabilidad.AsientoContable              │  │
│  │ • Auto-create contabilidad.MovimientoContable           │  │
│  │ • Validación de períodos abiertos                       │  │
│  │ • Signals para sincronización automática                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│         ┌─────────────────┴─────────────────┐                   │
│         ▼                                    ▼                   │
│    ┌─────────────┐                   ┌──────────────┐           │
│    │  POSTGRESQL │                   │  AUDIT TRAIL │           │
│    │   DATABASE  │                   │  (Fase 1)    │           │
│    └─────────────┘                   └──────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
┌──────────────────┐
│  Banco físico    │
│  (estado real)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      Descarga de        ┌─────────────────┐
│ Extracto Banco   │◄─────movimientos────┬──►│ Movimientos     │
│ (saldo_banco)    │                     │   │ Tesorería       │
└────────┬─────────┘                     │   │ (saldo_sistema) │
         │                               │   └────────┬────────┘
         │                               │            │
         ▼                               ▼            ▼
    ┌────────────────────────────────────────┐
    │  CONCILIACIÓN BANCARIA                 │
    │  Diferencia = Banco - Sistema          │
    │  Objetivo: Diferencia = 0              │
    └────────────────┬───────────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Asientos         │ (Auto-creados)
            │ Contables        │ vía Signals
            │ (Fase 1)         │
            └──────────────────┘
```

---

## 📊 Modelos de Datos

### 1. **CuentaBancaria** - Gestión de cuentas bancarias

```python
CuentaBancaria
├── Identificación
│   ├── banco: CharField (bancolombia, bbva, davivienda, etc.)
│   ├── numero_cuenta: CharField (UNIQUE)
│   ├── tipo_cuenta: CharField (corriente, ahorro, moneda extranjera)
│   └── titulares: CharField (nombres de titulares)
│
├── Saldos
│   ├── saldo_inicial: DecimalField (saldo de apertura)
│   ├── saldo_sistema: DecimalField (cálculo de movimientos confirmados)
│   ├── saldo_banco: DecimalField (estado real del banco)
│   └── get_diferencia_conciliacion(): Decimal (banco - sistema)
│
├── Vinculación Contable
│   └── cuenta_contable: FK → contabilidad.Cuenta
│
├── Control
│   ├── activa: BooleanField
│   ├── fecha_apertura: DateField
│   ├── ultimo_movimiento: DateField
│   ├── saldo_minimo_permitido: DecimalField (opcional)
│   └── saldo_maximo_permitido: DecimalField (opcional)
│
└── Auditoría
    ├── fecha_creacion: DateTimeField
    └── fecha_actualizacion: DateTimeField

Métodos principales:
- get_diferencia_conciliacion() → Decimal (para alertas)
- actualizar_saldo_sistema() → Decimal (recalcula con movimientos)
```

### 2. **MovimientoTesoreria** - Movimientos bancarios

```python
MovimientoTesoreria
├── Identificación
│   ├── numero_movimiento: CharField (UNIQUE) [AUTO-GENERATED]
│   │   Ej: "123456789-20240115-00001"
│   └── cuenta_banco: FK → CuentaBancaria
│
├── Datos del Movimiento
│   ├── fecha: DateField
│   ├── fecha_valor: DateField (opcional)
│   ├── tipo: CharField (ingreso, egreso, transferencia, retencion, devolucion)
│   ├── concepto: CharField (descripción)
│   ├── monto: DecimalField (siempre positivo)
│   ├── referencia_bancaria: CharField (cheque, número ref)
│   └── documento_origen: CharField (factura, OC, etc.)
│
├── Información del Tercero
│   ├── tercero_nombre: CharField
│   ├── tercero_nit: CharField
│   ├── tercero_banco: CharField
│   └── tercero_cuenta: CharField
│
├── Control
│   ├── estado: CharField (pendiente → confirmado → conciliado → reversado)
│   ├── conciliado: BooleanField
│   └── fecha_conciliacion: DateField
│
├── Vinculación Contable
│   ├── asiento_contable: FK → contabilidad.AsientoContable [AUTO]
│   │   (se crea automáticamente al confirmar)
│   └── Signal: auto_create_asiento() [ON CONFIRM]
│
└── Auditoría
    ├── usuario_creador: FK → User
    ├── fecha_creacion: DateTimeField
    └── observaciones: TextField

Estados: borrador → pendiente → confirmado → conciliado → reversado
```

### 3. **ConciliacionBancaria** - Conciliación mensual

```python
ConciliacionBancaria
├── Identificación
│   ├── numero_conciliacion: CharField (UNIQUE) [AUTO-GENERATED]
│   │   Ej: "CONC-123456789-202401-001"
│   ├── cuenta_banco: FK → CuentaBancaria
│   └── fecha_inicio/fin: DateField (período a conciliar)
│
├── Saldos Iniciales
│   ├── saldo_inicial_sistema: DecimalField
│   └── saldo_inicial_banco: DecimalField
│
├── Movimientos del Período
│   ├── total_ingresos_sistema: DecimalField
│   ├── total_ingresos_banco: DecimalField
│   ├── total_egresos_sistema: DecimalField
│   └── total_egresos_banco: DecimalField
│
├── Saldos Finales
│   ├── saldo_final_sistema: DecimalField
│   ├── saldo_final_banco: DecimalField
│   └── diferencia_total: DecimalField (banco - sistema = 0?)
│
├── Control
│   ├── estado: CharField (en_proceso, completada, reversada)
│   ├── conciliada: BooleanField
│   ├── usuario_conciliador: FK → User
│   └── notas: TextField (observaciones sobre diferencias)
│
└── Auditoría
    ├── fecha_creacion: DateTimeField
    └── fecha_actualizacion: DateTimeField

Métodos:
- calcular_diferencia() → Decimal
- obtener_movimientos_sin_conciliar() → QuerySet
```

### 4. **Cheque** - Gestión de cheques

```python
Cheque
├── numero_cheque: CharField (UNIQUE)
├── tipo: CharField (emitido, recibido)
├── cuenta_banco: FK → CuentaBancaria
├── fecha_emision/vencimiento: DateField
├── monto: DecimalField
├── beneficiario/concepto: CharField
├── estado: CharField (emitido, entregado, cobrado, devuelto, cancelado)
├── fecha_cobro: DateField
├── razon_devolucion: TextField
├── movimiento_tesoreria: FK → MovimientoTesoreria (vinculado al cobro)
└── fecha_creacion: DateTimeField
```

### 5. **ProyeccionFlujoCaja** - Proyección de flujo (30/60/90 días)

```python
ProyeccionFlujoCaja
├── numero_proyeccion: CharField [AUTO-GENERATED]
├── cuenta_banco: FK → CuentaBancaria
├── fecha_inicio/fin: DateField
├── escenario: CharField (pesimista, conservador, optimista)
│
├── Datos Calculados
│   ├── saldo_inicial: DecimalField
│   ├── ingresos_proyectados: DecimalField (basado en histórico)
│   ├── egresos_proyectados: DecimalField (basado en histórico)
│   ├── saldo_final_proyectado: DecimalField
│   ├── dias_cobertura: IntegerField (cuántos días de operación)
│   └── alerta_insolvencia: BooleanField
│
└── usuario_creador: FK → User

Métodos:
- calcular_saldo_final() → Decimal
- calcular_dias_cobertura() → IntegerField
- obtener_alerta_insolvencia() → Boolean
```

### 6. **IndicadorTesoreria** - KPIs y métricas

```python
IndicadorTesoreria
├── nombre: CharField
├── codigo: CharField (UNIQUE)
├── tipo: CharField (liquidez, solvencia, cobertura, eficiencia)
├── descripcion: TextField
├── formula: TextField (cómo se calcula)
├── valor_minimo/maximo: DecimalField (rangos aceptables)
├── valor_objetivo: DecimalField (meta)
└── activo: BooleanField

RegistroIndicador (histórico)
├── indicador: FK → IndicadorTesoreria
├── fecha: DateField
├── valor_real: DecimalField (valor calculado)
├── estado: CharField (excelente, bueno, aceptable, alerta, crítico)
├── observaciones: TextField
└── fecha_registro: DateTimeField
```

---

## 🔧 Servicios (Business Logic)

### **ValidacionTesoreria**

```python
class ValidacionTesoreria:
    @staticmethod
    def validar_cuenta_activa(cuenta_banco) → True/ValidationError
    
    @staticmethod
    def validar_limites_saldo(cuenta_banco, nuevo_saldo) → True/ValidationError
    
    @staticmethod
    def validar_movimiento(movimiento) → True/ValidationError
```

### **GestionFlujoCaja**

```python
class GestionFlujoCaja:
    
    @staticmethod
    def registrar_movimiento(
        cuenta_banco,
        fecha,
        tipo,  # ingreso|egreso|transferencia
        concepto,
        monto,
        referencia_bancaria='',
        tercero_nombre='',
        usuario=None
    ) → MovimientoTesoreria (estado=pendiente)
    
    @staticmethod
    def confirmar_movimiento(
        movimiento,
        usuario=None
    ) → MovimientoTesoreria (estado=confirmado)
        └─ Triggers: generar_asiento_contable(movimiento)
    
    @staticmethod
    def generar_asiento_movimiento(
        movimiento,
        usuario=None
    ) → AsientoContable (CREADO AUTOMÁTICAMENTE)
        ├─ Ingreso: Débito Banco | Crédito CxC
        ├─ Egreso: Débito CxP | Crédito Banco
        ├─ Transferencia: Débito Banco2 | Crédito Banco1
        └─ Signal: @post_save(MovimientoTesoreria)
```

**Diagrama: Flujo de Creación de Movimiento**

```
┌─────────────────────────────┐
│ 1. registrar_movimiento()   │
│    (estado = "pendiente")   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 2. confirmar_movimiento()   │ ◄─── Usuario lo confirma
│    (estado = confirmado)    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐      ┌──────────────────────────┐
│ Signal: @post_save()        │─────►│ 3. generar_asiento_      │
│ Update fields detected      │      │    movimiento()          │
└─────────────────────────────┘      └────────┬─────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────────┐
                                    │ AsientoContable (CREATED)│
                                    │ • Período validado       │
                                    │ • Debe = Haber          │
                                    │ • Naturaleza validada    │
                                    └────────┬─────────────────┘
                                             │
                                             ▼
                                    ┌──────────────────────────┐
                                    │ confirmar_asiento()      │
                                    │ (auto estado=confirmado) │
                                    │ (ControlAuditoria log)   │
                                    └──────────────────────────┘
```

### **ServicioConciliacionBancaria**

```python
class ServicioConciliacionBancaria:
    
    @staticmethod
    def crear_conciliacion(
        cuenta_banco,
        fecha_inicio,
        fecha_fin,
        saldo_inicial_banco,
        usuario=None
    ) → ConciliacionBancaria (estado=en_proceso)
    
    @staticmethod
    def calcular_totales_periodo(
        conciliacion
    ) → ConciliacionBancaria (con totales calculados)
    
    @staticmethod
    def completar_conciliacion(
        conciliacion,
        saldo_final_banco,
        usuario=None
    ) → ConciliacionBancaria
        ├─ Si diferencia = 0:
        │  └─ Marca MovimientoTesoreria como conciliado
        ├─ Si diferencia ≠ 0:
        │  └─ Registra notas sobre diferencia pendiente
        └─ Estado = completada
    
    @staticmethod
    def obtener_movimientos_pendientes(
        conciliacion
    ) → QuerySet MovimientoTesoreria
```

### **ServicioProyeccionFlujoCaja**

```python
class ServicioProyeccionFlujoCaja:
    
    @staticmethod
    def crear_proyeccion(
        cuenta_banco,
        fecha_inicio,
        fecha_fin,
        escenario='conservador',
        usuario=None
    ) → ProyeccionFlujoCaja
    
    @staticmethod
    def proyectar_flujos(
        proyeccion
    ) → ProyeccionFlujoCaja
        ├─ Analiza histórico últimos 90 días
        ├─ Aplica factores según escenario:
        │  ├─ Pesimista: ingresos×0.7, egresos×1.2
        │  ├─ Conservador: ingresos×1.0, egresos×1.0
        │  └─ Optimista: ingresos×1.3, egresos×0.8
        ├─ Calcula días de cobertura
        ├─ Detecta alertas de insolvencia (saldo<0)
        └─ Retorna proyección completa
```

### **ServicioIndicadores**

```python
class ServicioIndicadores:
    
    @staticmethod
    def calcular_indicador_liquidez_inmediata(
        cuenta_banco
    ) → {valor: float, interpretacion: str}
        └─ Liquidez = Saldo / Egresos_diarios_promedio
    
    @staticmethod
    def calcular_ciclo_operativo(
        cuenta_banco
    ) → {valor: float, dias_cobro: float, dias_pago: float}
    
    @staticmethod
    def registrar_indicador(
        indicador,
        valor,
        usuario=None
    ) → RegistroIndicador
```

---

## 🔌 API REST

### Endpoints disponibles

#### **Cuentas Bancarias**

```
GET    /api/tesoreria/cuentas-bancarias/
POST   /api/tesoreria/cuentas-bancarias/
GET    /api/tesoreria/cuentas-bancarias/{id}/
PUT    /api/tesoreria/cuentas-bancarias/{id}/
PATCH  /api/tesoreria/cuentas-bancarias/{id}/
DELETE /api/tesoreria/cuentas-bancarias/{id}/

# Acciones personalizadas
POST   /api/tesoreria/cuentas-bancarias/{id}/actualizar_saldo/
GET    /api/tesoreria/cuentas-bancarias/{id}/estado_cuenta/
```

#### **Movimientos Tesorería**

```
GET    /api/tesoreria/movimientos/
POST   /api/tesoreria/movimientos/
GET    /api/tesoreria/movimientos/{id}/
PUT    /api/tesoreria/movimientos/{id}/
PATCH  /api/tesoreria/movimientos/{id}/

# Acciones
POST   /api/tesoreria/movimientos/{id}/confirmar/
POST   /api/tesoreria/movimientos/registrar_lote/
```

#### **Conciliaciones**

```
GET    /api/tesoreria/conciliaciones/
POST   /api/tesoreria/conciliaciones/
GET    /api/tesoreria/conciliaciones/{id}/

# Acciones
POST   /api/tesoreria/conciliaciones/{id}/completar/
POST   /api/tesoreria/conciliaciones/crear_mensual/
```

#### **Cheques**

```
GET    /api/tesoreria/cheques/
POST   /api/tesoreria/cheques/
GET    /api/tesoreria/cheques/{id}/
PUT    /api/tesoreria/cheques/{id}/
```

#### **Proyecciones Flujo Caja**

```
GET    /api/tesoreria/proyecciones/
POST   /api/tesoreria/proyecciones/crear_proyeccion/
GET    /api/tesoreria/proyecciones/{id}/
```

#### **Indicadores**

```
GET    /api/tesoreria/indicadores/
GET    /api/tesoreria/registros-indicadores/
```

---

## 🔗 Integración con Contabilidad (Phase 1)

### Vínculo automático: Tesorería → Contabilidad

```
MovimientoTesoreria (Confirmed)
        │
        ▼ Signal: post_save
┌────────────────────────────┐
│ generar_asiento_movimiento │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ AsientoContable (AUTO-CREATED)             │
├────────────────────────────────────────────┤
│ numero_asiento: "TES-{numero_movimiento}"  │
│ periodo_contable: (validado automático)    │
│ fecha_documento: fecha del movimiento      │
│ descripcion: "Tesorería: {concepto}"       │
│ referencia: numero_movimiento              │
│ tipo: 'ingreso' o 'egreso'                 │
│ modulo_origen: 'tesoreria'                 │
│ estado: 'confirmado' (auto-confirmed)      │
└────────────────────────────────────────────┘
             │
             ▼
┌─ MovimientoContable 1 ─┐
│  • Cuenta: Banco       │
│  • Debe: X o Haber: X  │
└────────────────────────┘
             +
┌─ MovimientoContable 2 ─┐
│  • Cuenta: CxC/CxP     │
│  • Debe: Y o Haber: Y  │
│  • Debe = Haber        │
└────────────────────────┘
             │
             ▼
┌────────────────────────────┐
│  ControlAuditoria (logged) │
│  usuario, accion, timestamp│
└────────────────────────────┘
```

### Requisitos de Integración

1. **CuentaBancaria debe tener `cuenta_contable` asignada** (FK a contabilidad.Cuenta)
2. **Período Contable debe estar ABIERTO** para la fecha del movimiento
3. **Validación de naturaleza** automática según tipo de movimiento
4. **Asiento se confirma automáticamente** (no espera confirmación manual)

### Validaciones Automáticas

```python
# Al confirmar MovimientoTesoreria:

1. ✅ Cuenta bancaria está activa
2. ✅ Cuenta tiene vinculación contable
3. ✅ Período está abierto
4. ✅ Monto > 0
5. ✅ Naturaleza de cuentas validadas
6. ✅ Debe = Haber en el asiento
7. ✅ Sin excepciones, crear asiento automático
8. ✅ Registrar en ControlAuditoria
```

---

## 📖 Instrucciones de Uso

### Instalación y Migraciones

```bash
# 1. Generar migraciones
python manage.py makemigrations tesoreria

# 2. Aplicar migraciones
python manage.py migrate tesoreria

# 3. Verificar modelos
python manage.py migrate --plan

# 4. (Opcional) Crear datos de prueba
python manage.py shell
```

### Workflow Típico

#### Escenario 1: Registrar un ingreso bancario

```python
from tesoreria.services import GestionFlujoCaja
from tesoreria.models import CuentaBancaria
from django.contrib.auth.models import User

# 1. Obtener cuenta
cuenta = CuentaBancaria.objects.get(numero_cuenta='123456789')

# 2. Usuario
usuario = User.objects.get(username='admin')

# 3. Registrar movimiento (estado=pendiente)
movimiento = GestionFlujoCaja.registrar_movimiento(
    cuenta_banco=cuenta,
    fecha=date(2024, 1, 15),
    tipo='ingreso',
    concepto='Venta a cliente ABC',
    monto=Decimal('500000.00'),
    tercero_nombre='ABC Company',
    tercero_nit='123456789',
    referencia_bancaria='REF001',
    documento_origen='FC-2024-001',
    usuario=usuario
)
print(f"Movimiento registrado: {movimiento.numero_movimiento}")
# Output: Movimiento registrado: 123456789-20240115-00001

# 4. Confirmar movimiento (genera asiento automático)
movimiento = GestionFlujoCaja.confirmar_movimiento(movimiento, usuario)
print(f"Estado: {movimiento.estado}")
# Output: Estado: confirmado
# ⚡ NOTA: Aquí se genera automáticamente el asiento contable en Fase 1
```

#### Escenario 2: Conciliación bancaria mensual

```python
from tesoreria.services import ServicioConciliacionBancaria
from datetime import date

# 1. Crear conciliación para enero
conciliacion = ServicioConciliacionBancaria.crear_conciliacion(
    cuenta_banco=cuenta,
    fecha_inicio=date(2024, 1, 1),
    fecha_fin=date(2024, 1, 31),
    saldo_inicial_banco=Decimal('1000000.00'),
    usuario=usuario
)

# 2. Calcular totales
conciliacion = ServicioConciliacionBancaria.calcular_totales_periodo(conciliacion)

# 3. Completar con saldo final del banco
conciliacion = ServicioConciliacionBancaria.completar_conciliacion(
    conciliacion=conciliacion,
    saldo_final_banco=Decimal('1450000.00'),
    usuario=usuario
)

print(f"Diferencia: ${conciliacion.diferencia_total:,.2f}")
if conciliacion.diferencia_total == 0:
    print("✅ Conciliación OK - Movimientos marcados como conciliados")
else:
    print("⚠️  Diferencia pendiente de investigar")
```

#### Escenario 3: Proyección de flujo de caja

```python
from tesoreria.services import ServicioProyeccionFlujoCaja
from datetime import timedelta

# 1. Crear proyección para 30 días
proyeccion = ServicioProyeccionFlujoCaja.crear_proyeccion(
    cuenta_banco=cuenta,
    fecha_inicio=date.today(),
    fecha_fin=date.today() + timedelta(days=30),
    escenario='conservador',
    usuario=usuario
)

# 2. Calcular proyecciones
proyeccion = ServicioProyeccionFlujoCaja.proyectar_flujos(proyeccion)

# 3. Analizar resultados
print(f"Saldo Inicial: ${proyeccion.saldo_inicial:,.2f}")
print(f"Ingresos Proyectados: ${proyeccion.ingresos_proyectados:,.2f}")
print(f"Egresos Proyectados: ${proyeccion.egresos_proyectados:,.2f}")
print(f"Saldo Final: ${proyeccion.saldo_final_proyectado:,.2f}")
print(f"Días de Cobertura: {proyeccion.dias_cobertura}")

if proyeccion.alerta_insolvencia:
    print("🚨 ALERTA: Posible insolvencia en el período")
```

### Uso vía API REST

#### Crear movimiento

```bash
curl -X POST http://localhost:8000/api/tesoreria/movimientos/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "cuenta_banco": 1,
    "fecha": "2024-01-15",
    "tipo": "ingreso",
    "concepto": "Venta a cliente",
    "monto": "500000.00",
    "tercero_nombre": "ABC Company",
    "tercero_nit": "123456789"
  }'
```

#### Confirmar movimiento

```bash
curl -X POST http://localhost:8000/api/tesoreria/movimientos/1/confirmar/ \
  -H "Authorization: Bearer {TOKEN}"
```

#### Crear conciliación mensual

```bash
curl -X POST http://localhost:8000/api/tesoreria/conciliaciones/crear_mensual/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "cuenta_banco": 1,
    "saldo_inicial_banco": "1000000.00"
  }'
```

---

## ✅ Tests

Ejecutar tests del módulo:

```bash
# Tests básicos
python manage.py test tesoreria.tests.CuentaBancariaTest

# Tests de movimientos
python manage.py test tesoreria.tests.MovimientoTesoreriaTest

# Tests de conciliación
python manage.py test tesoreria.tests.ConciliacionBancariaTest

# Tests de integración con Contabilidad
python manage.py test tesoreria.tests.IntegracionContabilidadTesoreriaTest

# Todos los tests
python manage.py test tesoreria
```

---

## 📁 Estructura de Archivos

```
tesoreria/
├── __init__.py                    # Configuración app
├── apps.py                        # Registra signals
├── models.py                      # 7 modelos (Cuenta, Movimiento, Conciliación, etc.)
├── services.py                    # 4 clases de servicios (Gestión, Conciliación, Proyección, KPIs)
├── serializers.py                 # 8 serializers REST
├── views.py                       # 7 ViewSets REST
├── urls.py                        # Rutas API
├── admin.py                       # Interfaces Admin Django
├── tests.py                       # Suite de tests
├── signals.py                     # Auto-creación de asientos contables
└── migrations/
    ├── __init__.py
    └── 0001_initial.py           # (Generada por makemigrations)
```

---

## 🎯 Resumen de Características

### Tesorería (Phase 2) Completa
- ✅ Gestión de cuentas bancarias
- ✅ Registro de movimientos (ingresos, egresos, transferencias)
- ✅ Gestión de cheques (emitidos/recibidos)
- ✅ Conciliación bancaria automática
- ✅ Proyección de flujo de caja (3 escenarios)
- ✅ Indicadores y KPIs
- ✅ **Integración automática con Contabilidad (Phase 1)**
- ✅ API REST completa
- ✅ Admin Django con visualización
- ✅ Tests unitarios e integración

### Integración Phase 1 ↔ Phase 2
- ✅ Cada movimiento genera automáticamente asiento contable
- ✅ Validación de períodos contables
- ✅ Naturaleza de cuentas validada automáticamente
- ✅ Signals para sincronización en tiempo real
- ✅ Audit trail completo en ControlAuditoria (Phase 1)

---

## 🚀 Próximos Pasos

1. **Generar migraciones**: `python manage.py makemigrations tesoreria`
2. **Ejecutar migraciones**: `python manage.py migrate`
3. **Cargar datos iniciales** (bancos, indicadores)
4. **Pruebas funcionales** del workflow
5. **Desarrollo Frontend** (React/Vite) - Tesoreria.jsx
6. **Reportes avanzados** de tesorería

---

## 📞 Soporte

Para preguntas sobre la integración:
- Ver `IMPLEMENTACION_FASE2_TESORERIA.md`
- Revisar tests en `tesoreria/tests.py`
- Consultar servicios en `tesoreria/services.py`
