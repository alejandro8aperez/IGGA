# 📊 PLAN DE MEJORA: MÓDULOS CONTABILIDAD & TESORERÍA
## Análisis y Recomendaciones Profesionales - Estilo SIIGO

**Fecha:** Junio 2026  
**Objetivo:** Transformar los módulos de Contabilidad y Tesorería a nivel empresarial con características de software profesional como SIIGO

---

## 🔍 ANÁLISIS ACTUAL

### ✅ Fortalezas Identificadas
- ✓ Estructura base sólida con modelos contables (Asientos, Movimientos, Cuentas)
- ✓ Plan de Cuentas colombiano (PUC) implementado
- ✓ Período contable con cierre de período
- ✓ Trazabilidad de módulos origen en asientos
- ✓ Exportación básica a Excel y PDF
- ✓ API REST estructurada

### ⚠️ Brechas Identificadas

#### **BACKEND - Modelos de Datos**
| Área | Brecha | Impacto |
|------|--------|--------|
| **Contabilidad** | Sin auxiliares contables (subcuentas de 3-4 niveles) | Falta detalle contable |
| **Centros de Costo** | No existe modelo dedicado en contabilidad | No hay análisis por área |
| **Terceros** | Sin modelo de Proveedores/Clientes vinculados | Impacta trazabilidad |
| **Presupuesto** | Módulo no existe | Sin control presupuestal |
| **Tesorería** | No es módulo independiente (usa Finanzas) | Confusión de responsabilidades |
| **Flujo Efectivo** | No hay proyección o análisis de flujo | Gestión financiera débil |
| **Retenciones** | Sin modelo de retenciones (RTE-FUENTE, RETEICA) | Tributario incompleto |

#### **BACKEND - Servicios & Lógica**
| Función | Necesidad | Prioridad |
|---------|-----------|-----------|
| Cálculo de saldos | Actualmente retorna 0.0 (TODO) | CRÍTICA |
| Validación de asientos | Sin validación de integridad | ALTA |
| Cierre de período | Básico, sin ajustes automáticos | ALTA |
| Conciliación bancaria | No existe | ALTA |
| Reportes de auditoría | No existe trail completo | MEDIA |

#### **FRONTEND - Interfaz**
- Contabilidad.jsx: UI básica, falta edición de asientos
- Tesorería.jsx: Muy simple, solo transacciones
- Sin resúmenes ejecutivos (KPIs)
- Sin dashboards de flujo efectivo
- Sin búsqueda avanzada/filtros

---

## 🏗️ ARQUITECTURA MEJORADA

### Módulo Contabilidad Nivel SIIGO

```
CONTABILIDAD/
├── models.py
│   ├── PeriodoContable (mejorado)
│   ├── Cuenta (mejorado: + atributos contables)
│   ├── CentroCosto (NUEVO)
│   ├── CuentaAuxiliar (NUEVO - 3-4 niveles)
│   ├── AsientoContable (mejorado: + validaciones)
│   ├── MovimientoContable (mejorado: + centro costo, proyecto)
│   ├── Retencion (NUEVO: RTE-FUENTE, RETEICA)
│   ├── ConciliacionBancaria (NUEVO)
│   ├── AjusteContable (NUEVO - automatizados)
│   └── ControlAuditoria (NUEVO - trazas completas)
│
├── services.py (refactorizado)
│   ├── CalculoSaldos
│   ├── ValidacionAsientos
│   ├── CierrePeriodo
│   ├── ConciliacionBancaria
│   ├── GeneracionAjustes
│   └── ReportesFinancieros
│
├── views.py (mejorado)
│   ├── AsientoContableViewSet (+ validación)
│   ├── BalanceGeneralView (+ comparativos)
│   ├── EstadoResultadosView (+ análisis)
│   ├── FlujoCajaView (NEW)
│   ├── ConciliacionBancariaView (NEW)
│   └── ReportesAuditoriaView (NEW)
│
└── tests.py (cobertura completa)
```

### Módulo Tesorería (Independiente - NUEVO)

```
TESORERIA/
├── models.py
│   ├── CuentaBancaria (NUEVO - detail account)
│   ├── MovimientoTesoreria (NUEVO)
│   ├── Cheque (NUEVO - gestión de cheques)
│   ├── TransferenciaBancaria (NUEVO)
│   ├── ConciliacionBancaria (NUEVO)
│   ├── ProyeccionFlujo (NUEVO - forecasting)
│   └── IndicadoresTesoreria (NUEVO - KPIs)
│
├── services.py
│   ├── GestionFlujoCaja
│   ├── ConciliacionBancaria
│   ├── ProyeccionFlujoCaja
│   └── IndicadoresTesoreria
│
├── views.py
│   ├── CuentaBancariaViewSet
│   ├── FlujoCajaView
│   ├── ConciliacionBancariaView
│   └── ProyeccionFlujoCajaView
│
└── urls.py
```

---

## 📋 ESPECIFICACIÓN DE MEJORAS DETALLADAS

### 1️⃣ MODELOS CONTABLES MEJORADOS

#### **Cuenta - Mejoras**
```python
class Cuenta(models.Model):
    # Actuales
    codigo: CharField  
    nombre: CharField
    tipo: CharField (activo, pasivo, patrimonio, ingreso, gasto)
    nivel: PositiveSmallIntegerField
    
    # NUEVOS CAMPOS
    naturaleza: CharField  # 'deudora' o 'acreedora'
    requiere_tercero: BooleanField  # Si vincula clientes/proveedores
    requiere_proyecto: BooleanField  # Si es proyectable
    requiere_centro_costo: BooleanField
    es_verificable: BooleanField  # Para flujo efectivo
    clasificacion_dian: CharField  # DIAN tax classification
    saldo_minimo_permitido: DecimalField
    saldo_maximo_permitido: DecimalField  
    permite_descuadre_periodo: BooleanField  # Control
    
    # MÉTODOS NUEVOS
    def get_saldo_actual()  # Calcula saldo REAL
    def get_saldo_periodo(periodo)
    def get_movimientos_periodo(periodo)
    def validar_saldo()  # Valida limites
```

#### **CentroCosto - NUEVO**
```python
class CentroCosto(models.Model):
    codigo: CharField(unique=True)
    nombre: CharField
    descripcion: TextField
    tipo: CharField  # 'produccion', 'administrativo', 'ventas', etc.
    responsable: ForeignKey(User)
    presupuesto_anual: DecimalField
    gasto_acumulado: DecimalField (calculado)
    empresa: ForeignKey(Empresa)  # Multi-empresa
    activo: BooleanField(default=True)
```

#### **AsientoContable - Mejoras**
```python
class AsientoContable(models.Model):
    # Actuales
    fecha, descripcion, referencia, valor, total_debe, total_haber
    
    # NUEVOS
    numero_asiento: CharField(unique=True)  # Secuencial
    usuario_creador: ForeignKey(User)  # Quién creó
    usuario_modificador: ForeignKey(User, null=True)  # Quién modificó
    fecha_creacion: DateTimeField(auto_now_add=True)
    fecha_modificacion: DateTimeField(auto_now=True)
    periodo_contable: ForeignKey(PeriodoContable)
    estado: CharField(['borrador','confirmado','reversado','procesado'])
    motivo_reverso: TextField(null=True)  # Por qué se revirtió
    comentarios: TextField
    
    # MÉTODOS NUEVOS
    def confirmar()  # No permite modificación
    def reversar(motivo)  # Crea asiento contrario
    def validar_integridad()  # Debe = Haber
    def puede_modificarse()  # Lógica de permisos
```

#### **MovimientoContable - Mejoras**
```python
class MovimientoContable(models.Model):
    # Actuales
    asiento_contable, cuenta, descripcion, debe, haber
    
    # NUEVOS
    centro_costo: ForeignKey(CentroCosto, null=True)
    proyecto: ForeignKey(Proyecto, null=True)
    tercero: CharField  # Cliente/Proveedor
    documento_referencia: CharField  # Factura, OC, etc.
    linea: PositiveSmallIntegerField  # Número de línea en asiento
    porcentaje: DecimalField(null=True)  # Para asignaciones
    
    # MÉTODOS
    def get_contrapartida()  # Obtiene la otra mitad del movimiento
```

### 2️⃣ MÓDULO TESORERÍA - NUEVO

#### **CuentaBancaria - NUEVO**
```python
class CuentaBancaria(models.Model):
    banco: CharField  # 'Bancolombia', 'BBVA', etc.
    numero_cuenta: CharField(unique=True)
    tipo_cuenta: CharField  # 'corriente', 'ahorro'
    saldo_sistema: DecimalField
    saldo_banco: DecimalField  # Del extracto
    ultimo_movimiento: DateField
    activa: BooleanField(default=True)
    cuenta_contable: ForeignKey(Cuenta)  # Link a contabilidad
    
    # MÉTODOS
    def get_diferencia_conciliacion()  # saldo_banco - saldo_sistema
    def obtener_movimientos_pendientes()
```

#### **MovimientoTesoreria - NUEVO**
```python
class MovimientoTesoreria(models.Model):
    TIPO_MOVIMIENTO = [
        ('ingreso', 'Ingreso'),
        ('egreso', 'Egreso'),
        ('transferencia', 'Transferencia'),
        ('retencion', 'Retención'),
    ]
    
    cuenta_banco: ForeignKey(CuentaBancaria)
    fecha: DateField
    tipo: CharField(choices=TIPO_MOVIMIENTO)
    concepto: CharField
    monto: DecimalField
    referencia_externo: CharField  # Cheque, referencia, etc.
    conciliado: BooleanField(default=False)
    documento_origen: CharField  # Factura, OC, etc.
    asiento_contable: ForeignKey(AsientoContable)  # Link contabilidad
```

#### **ConciliacionBancaria - NUEVO**
```python
class ConciliacionBancaria(models.Model):
    cuenta_banco: ForeignKey(CuentaBancaria)
    fecha_inicio: DateField
    fecha_fin: DateField
    saldo_inicial_sistema: DecimalField
    saldo_inicial_banco: DecimalField
    
    # Movimientos
    movimientos_sistema: ManyToMany
    movimientos_banco: ManyToMany
    
    # Resultados
    movimientos_sin_conciliar: DecimalField
    diferencia_total: DecimalField
    conciliada: BooleanField(default=False)
    fecha_conciliacion: DateTimeField(null=True)
    usuario_conciliador: ForeignKey(User)
```

### 3️⃣ VALIDACIONES Y REGLAS CONTABLES

```python
# VALIDACIONES DE NEGOCIO

def validar_asiento_contable(asiento):
    """Valida integridad de asiento"""
    assert asiento.total_debe == asiento.total_haber  # Partida doble
    assert len(asiento.movimientos.all()) >= 2  # Mínimo 2 movimientos
    assert asiento.periodo_contable.estado == 'abierto'  # Período abierto
    
def validar_cuenta_nueva(cuenta):
    """Valida nueva cuenta"""
    assert len(cuenta.codigo) >= 3  # PUC mínimo 3 dígitos
    assert cuenta.codigo.isdigit()  # Solo números
    assert not Cuenta.objects.filter(codigo=cuenta.codigo).exists()
    
def validar_descuadre_periodo(periodo):
    """Verifica si todas cuentas están balanceadas"""
    for cuenta in Cuenta.objects.filter(permitedescuadre=False):
        saldo = cuenta.get_saldo()
        if saldo != 0:
            raise ValidationError(f"Cuenta {cuenta.codigo} descuadrada")
```

### 4️⃣ REPORTES Y ANÁLISIS

#### **Balance General Mejorado**
```
├── Por Período (Comparativo)
├── Jerárquico (Mayor -> Auxiliares)
├── Análisis Horizontal (Variación %)
├── Análisis Vertical (% del Total)
├── Con Presupuesto vs Real
├── Auditado vs No Auditado
└── Con Notas al Pie
```

#### **Estado de Resultados Mejorado**
```
├── Por Centro de Costo
├── Por Proyecto
├── Por Línea de Negocio
├── Mensual / Trimestral / Anual
├── Comparativo Año Anterior
├── Márgenes y Ratios
└── Análisis de Variación
```

#### **Flujo de Caja**
```
├── Proyectado (30, 60, 90 días)
├── Histórico
├── Por Cuenta Bancaria
├── Ingresos vs Egresos
├── Saldo Final Proyectado
└── Alertas de Liquidez
```

### 5️⃣ CARACTERÍSTICAS OPERACIONALES

#### **Período Contable Mejorado**
- ✓ Apertura automática (primer día mes)
- ✓ Cierre con ajustes automáticos (depreciación, provisiones)
- ✓ Generación automática de contra-asientos
- ✓ Bloqueo de movimientos en períodos cerrados
- ✓ Trail de auditoría (quién cerró, cuándo)

#### **Reversión de Asientos**
- ✓ Crea asiento opuesto automáticamente
- ✓ Linkea asientos (original <-> reverso)
- ✓ Requiere aprobación
- ✓ Registro de motivo

#### **Trazabilidad Completa**
```
Para cada asiento se registra:
├── Quién lo creó y cuándo
├── Quién lo modificó y cuándo
├── Qué campo cambió (audit log)
├── Módulo origen (ventas, compras, nómina, etc.)
├── Documento referencia
└── Metadata adicional (JSON)
```

---

## 💻 MEJORAS FRONTEND

### Contabilidad.jsx
```jsx
Mejoras:
├── ✓ Búsqueda avanzada con filtros
├── ✓ Edición inline de asientos (borrador)
├── ✓ Validación en tiempo real
├── ✓ Vista de Balance General con comparativos
├── ✓ Gráficos de tendencias
├── ✓ Descarga de reportes avanzados
├── ✓ Vista jerárquica del plan de cuentas
└── ✓ Indicadores clave (ratios, márgenes)
```

### Tesorería.jsx (NUEVA)
```jsx
Componentes:
├── Dashboard
│   ├── Saldo por Banco
│   ├── Flujo Caja Hoy
│   ├── Diferencias Conciliación
│   └── Alertas de Liquidez
│
├── Cuentas Bancarias
│   ├── Listado con saldos
│   ├── Histórico movimientos
│   └── Conciliación
│
├── Movimientos
│   ├── Registro diario
│   ├── Búsqueda avanzada
│   └── Exportar
│
├── Conciliación Bancaria
│   ├── Wizard paso a paso
│   ├── Matching automático
│   ├── Movimientos pendientes
│   └── Diferencias
│
└── Proyección Flujo
    ├── 30/60/90 días
    ├── Escenarios (pesimista/optimista)
    └── Alertas de insolvencia
```

---

## 📊 INDICADORES CLAVE (KPIs)

```
CONTABILIDAD:
├── Razón Corriente (Activo Corriente / Pasivo Corriente)
├── Razón Rápida (AC - Inventarios) / PC
├── Endeudamiento (Pasivo Total / Activo Total)
├── ROA (Utilidad Neta / Activo Total)
├── ROE (Utilidad Neta / Patrimonio)
└── Margen Neto (Utilidad / Ventas)

TESORERÍA:
├── Saldo de Caja Mínimo (Recomendado)
├── Ciclo Operativo (Cobro - Pago)
├── Diferencia de Conciliación (%)
├── Proyección de Insolvencia
└── Varianza Presupuestal (%)
```

---

## 🔒 SEGURIDAD Y AUDITORÍA

### Control de Acceso
```python
# Permisos por rol
- Contador: Ver todo, crear/editar asientos
- Tesorero: Ver finanzas, gestionar bancos
- Auditor Interno: Ver solo (lectura)
- Gerente: Ver reportes
- Administrador: Control total
```

### Auditoría
```
Log de eventos:
├── Creación de asientos
├── Modificaciones (qué cambió)
├── Reversiones (motivo)
├── Acceso a reportes sensibles
└── Cambios de período
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1 (Semana 1): Modelos
- [ ] Crear migraciones para nuevas tablas
- [ ] Expandir modelos existentes
- [ ] Crear servicios de validación

### FASE 2 (Semana 2): Backend
- [ ] Implementar cálculo de saldos correcto
- [ ] Servicios de conciliación
- [ ] Reportes financieros

### FASE 3 (Semana 3): Frontend
- [ ] Mejorar Contabilidad.jsx
- [ ] Crear Tesorería.jsx
- [ ] Dashboard ejecutivo

### FASE 4 (Semana 4): Testing
- [ ] Test unitarios
- [ ] Test integración
- [ ] Validación manual

---

## 📌 PRIORIDADES

### CRÍTICA
1. Cálculo correcto de saldos
2. Validación de integridad asientos
3. Período contable con cierre

### ALTA
4. Módulo Tesorería independiente
5. Conciliación bancaria
6. Reversión de asientos

### MEDIA
7. Reportes avanzados
8. Auditoría trail completo
9. KPIs dashboard

---

## 📚 REFERENCIAS

- **SIIGO**: Software contable colombiano referencia
- **PUC Colombia**: Plan Único de Cuentas
- **Norma 2649/2020 DIAN**: Estándares contables
- **Ciclo Contable**: Principios fundamentales
- **NIIF**: Normas internacionales de información financiera

