# IMPLEMENTACIÓN FASE 2: TESORERÍA - GUÍA PASO A PASO

## 🎯 Objetivo Final

Crear un módulo **Tesorería (Treasury) independiente pero integrado** que:
- ✅ Gestione todas las operaciones bancarias
- ✅ Genere automáticamente asientos contables en Phase 1
- ✅ Mantenga sincronización perfecta Tesorería ↔ Contabilidad
- ✅ Proporcione proyecciones y análisis de flujo de caja

---

## 📋 PASO 1: Generación de Migraciones

### 1.1 Generar migraciones iniciales

```bash
cd c:\Postgres\ERP-8AMPERIOS
python manage.py makemigrations tesoreria
```

**Salida esperada:**
```
Migrations for 'tesoreria':
  tesoreria/migrations/0001_initial.py
    - Create model CuentaBancaria
    - Create model MovimientoTesoreria
    - Create model ConciliacionBancaria
    - Create model Cheque
    - Create model ProyeccionFlujoCaja
    - Create model IndicadorTesoreria
    - Create model RegistroIndicador
```

### 1.2 Revisar migraciones

```bash
python manage.py migrate --plan
```

**Verificar que incluya:**
```
tesoreria.0001_initial
```

### 1.3 Aplicar migraciones

```bash
python manage.py migrate tesoreria
```

**Salida esperada:**
```
Operations to perform:
  Apply all migrations: tesoreria
Running migrations:
  Applying tesoreria.0001_initial... OK
```

---

## 📋 PASO 2: Verificación de la Instalación

### 2.1 Verificar modelos en la BD

```bash
python manage.py dbshell
```

```sql
-- Verificar tablas creadas
\dt tesoreria_*

-- Debería mostrar:
-- tesoreria_cuentabancaria
-- tesoreria_movimientotesoreria
-- tesoreria_conciliacionbancaria
-- tesoreria_cheque
-- tesoreria_proyeccionflujoaja
-- tesoreria_indicadortesoreria
-- tesoreria_registroindicador
```

### 2.2 Verificar que contabilidad está lista

```bash
python manage.py shell
```

```python
from contabilidad.models import Cuenta, AsientoContable, PeriodoContable

# Verificar cuentas contables
print(f"Total cuentas: {Cuenta.objects.count()}")

# Verificar períodos abiertos
periodos = PeriodoContable.objects.filter(estado='abierto')
print(f"Períodos abiertos: {periodos.count()}")
for p in periodos:
    print(f"  - {p.nombre}: {p.fecha_inicio} a {p.fecha_fin}")
```

---

## 📋 PASO 3: Carga de Datos Iniciales

### 3.1 Crear indicadores de tesorería

```python
python manage.py shell
```

```python
from tesoreria.models import IndicadorTesoreria

# Indicador: Liquidez Inmediata
IndicadorTesoreria.objects.create(
    nombre='Liquidez Inmediata',
    codigo='LIQ_INM',
    tipo='liquidez',
    descripcion='Saldo disponible / Egresos diarios promedio',
    formula='Saldo_Actual / (Egresos_30dias / 30)',
    valor_minimo=Decimal('0.5'),
    valor_objetivo=Decimal('1.5'),
    valor_maximo=Decimal('5.0'),
    activo=True
)

# Indicador: Ciclo Operativo
IndicadorTesoreria.objects.create(
    nombre='Ciclo Operativo',
    codigo='CIC_OP',
    tipo='cobertura',
    descripcion='Días para cobrar a clientes + días para pagar',
    formula='Dias_Cobro + Dias_Pago',
    valor_minimo=Decimal('0'),
    valor_objetivo=Decimal('30'),
    valor_maximo=Decimal('90'),
    activo=True
)

# Indicador: Cobertura de Deuda
IndicadorTesoreria.objects.create(
    nombre='Cobertura de Deuda',
    codigo='COB_DUD',
    tipo='solvencia',
    descripcion='Flujo de caja / Pagos de deuda',
    formula='Flujo_Caja_Positivo / (Pagos_Deuda * 12)',
    valor_minimo=Decimal('1.0'),
    valor_objetivo=Decimal('2.0'),
    valor_maximo=None,
    activo=True
)

print("✅ Indicadores de tesorería creados")
```

### 3.2 Crear cuentas bancarias vinculadas

```python
from tesoreria.models import CuentaBancaria
from contabilidad.models import Cuenta
from decimal import Decimal

# Obtener/crear cuenta contable
cuenta_contable, created = Cuenta.objects.get_or_create(
    codigo='100101',
    defaults={
        'nombre': 'Bancos',
        'tipo': 'activo',
        'naturaleza': 'deudora',
        'nivel': 3
    }
)

# Crear cuenta bancaria vinculada
cuenta_bancaria = CuentaBancaria.objects.create(
    banco='bancolombia',
    numero_cuenta='100002115801',
    tipo_cuenta='corriente',
    titulares='EMPRESA S.A.S.',
    saldo_inicial=Decimal('5000000.00'),
    saldo_sistema=Decimal('5000000.00'),
    saldo_banco=Decimal('5000000.00'),
    cuenta_contable=cuenta_contable,
    activa=True,
    saldo_minimo_permitido=Decimal('500000.00'),
    saldo_maximo_permitido=Decimal('50000000.00')
)

print(f"✅ Cuenta bancaria creada: {cuenta_bancaria}")
print(f"   Banco: {cuenta_bancaria.banco}")
print(f"   Número: {cuenta_bancaria.numero_cuenta}")
print(f"   Vinculada a Cuenta Contable: {cuenta_contable.nombre}")
```

---

## 📋 PASO 4: Pruebas Funcionales

### 4.1 Test: Registrar un ingreso

```python
from tesoreria.models import CuentaBancaria, MovimientoTesoreria
from tesoreria.services import GestionFlujoCaja
from django.contrib.auth.models import User
from datetime import date
from decimal import Decimal

# Obtener datos
cuenta = CuentaBancaria.objects.get(numero_cuenta='100002115801')
usuario = User.objects.get(username='admin')

# PASO 1: Registrar movimiento (pendiente)
print("\n1️⃣  Registrando movimiento...")
movimiento = GestionFlujoCaja.registrar_movimiento(
    cuenta_banco=cuenta,
    fecha=date.today(),
    tipo='ingreso',
    concepto='Venta a cliente XYZ',
    monto=Decimal('1000000.00'),
    tercero_nombre='Cliente XYZ',
    tercero_nit='123456789',
    referencia_bancaria='TRF001',
    usuario=usuario
)

print(f"   ✓ Número: {movimiento.numero_movimiento}")
print(f"   ✓ Tipo: {movimiento.tipo}")
print(f"   ✓ Monto: ${movimiento.monto:,.2f}")
print(f"   ✓ Estado: {movimiento.estado}")

# PASO 2: Confirmar movimiento (genera asiento)
print("\n2️⃣  Confirmando movimiento...")
movimiento = GestionFlujoCaja.confirmar_movimiento(movimiento, usuario)

print(f"   ✓ Estado: {movimiento.estado}")
print(f"   ✓ Asiento Contable: {movimiento.asiento_contable}")

if movimiento.asiento_contable:
    asiento = movimiento.asiento_contable
    print(f"   ✓ Número Asiento: {asiento.numero_asiento}")
    print(f"   ✓ Movimientos contables: {asiento.movimientos.count()}")
    for mov in asiento.movimientos.all():
        print(f"     - {mov.cuenta.codigo} ({mov.cuenta.nombre}): Debe=${mov.debe} Haber=${mov.haber}")

# PASO 3: Verificar saldo actualizado
print("\n3️⃣  Verificando saldo...")
cuenta.refresh_from_db()
print(f"   ✓ Saldo sistema: ${cuenta.saldo_sistema:,.2f}")
print(f"   ✓ Saldo banco: ${cuenta.saldo_banco:,.2f}")
print(f"   ✓ Diferencia: ${cuenta.get_diferencia_conciliacion():,.2f}")

print("\n✅ Test exitoso: Ingreso registrado y asiento contable creado automáticamente")
```

### 4.2 Test: Conciliación bancaria

```python
from tesoreria.models import ConciliacionBancaria
from tesoreria.services import ServicioConciliacionBancaria
from datetime import date
from decimal import Decimal

print("\n📊 TEST: Conciliación Bancaria")
print("=" * 60)

# Obtener cuenta y usuario
cuenta = CuentaBancaria.objects.get(numero_cuenta='100002115801')
usuario = User.objects.get(username='admin')

# PASO 1: Crear conciliación
print("\n1️⃣  Creando conciliación para enero...")
conciliacion = ServicioConciliacionBancaria.crear_conciliacion(
    cuenta_banco=cuenta,
    fecha_inicio=date(2024, 1, 1),
    fecha_fin=date(2024, 1, 31),
    saldo_inicial_banco=Decimal('5000000.00'),
    usuario=usuario
)

print(f"   ✓ Número: {conciliacion.numero_conciliacion}")
print(f"   ✓ Estado: {conciliacion.estado}")

# PASO 2: Calcular totales
print("\n2️⃣  Calculando totales del período...")
conciliacion = ServicioConciliacionBancaria.calcular_totales_periodo(conciliacion)

print(f"   ✓ Total Ingresos (Sistema): ${conciliacion.total_ingresos_sistema:,.2f}")
print(f"   ✓ Total Egresos (Sistema): ${conciliacion.total_egresos_sistema:,.2f}")
print(f"   ✓ Saldo Final (Sistema): ${conciliacion.saldo_final_sistema:,.2f}")

# PASO 3: Completar conciliación
print("\n3️⃣  Completando conciliación...")
# Simulamos saldo del banco igual al sistema
saldo_final_banco = conciliacion.saldo_final_sistema

conciliacion = ServicioConciliacionBancaria.completar_conciliacion(
    conciliacion=conciliacion,
    saldo_final_banco=saldo_final_banco,
    usuario=usuario
)

print(f"   ✓ Saldo Final (Banco): ${conciliacion.saldo_final_banco:,.2f}")
print(f"   ✓ Diferencia: ${conciliacion.diferencia_total:,.2f}")
print(f"   ✓ Estado: {conciliacion.estado}")
print(f"   ✓ ¿Conciliada?: {conciliacion.conciliada}")

if conciliacion.diferencia_total == 0:
    print("\n✅ Conciliación exitosa - Bancos sincronizados")
    
    # Verificar movimientos conciliados
    movimientos_conciliados = cuenta.movimientos.filter(conciliado=True).count()
    print(f"   ✓ Movimientos marcados como conciliados: {movimientos_conciliados}")
else:
    print(f"\n⚠️  Diferencia de ${conciliacion.diferencia_total:,.2f} sin conciliar")
```

### 4.3 Test: Proyección flujo caja

```python
from tesoreria.services import ServicioProyeccionFlujoCaja
from datetime import timedelta

print("\n📈 TEST: Proyección de Flujo de Caja")
print("=" * 60)

cuenta = CuentaBancaria.objects.get(numero_cuenta='100002115801')
usuario = User.objects.get(username='admin')

# Crear proyección para 30 días - escenario CONSERVADOR
print("\n1️⃣  Creando proyección (conservador, 30 días)...")
proyeccion = ServicioProyeccionFlujoCaja.crear_proyeccion(
    cuenta_banco=cuenta,
    fecha_inicio=date.today(),
    fecha_fin=date.today() + timedelta(days=30),
    escenario='conservador',
    usuario=usuario
)

print(f"   ✓ Número: {proyeccion.numero_proyeccion}")

# Calcular proyecciones basadas en histórico
print("\n2️⃣  Calculando proyecciones...")
proyeccion = ServicioProyeccionFlujoCaja.proyectar_flujos(proyeccion)

print(f"   ✓ Saldo Inicial: ${proyeccion.saldo_inicial:,.2f}")
print(f"   ✓ Ingresos Proyectados: ${proyeccion.ingresos_proyectados:,.2f}")
print(f"   ✓ Egresos Proyectados: ${proyeccion.egresos_proyectados:,.2f}")
print(f"   ✓ Saldo Final Proyectado: ${proyeccion.saldo_final_proyectado:,.2f}")
print(f"   ✓ Días de Cobertura: {proyeccion.dias_cobertura} días")
print(f"   ✓ ¿Alerta de Insolvencia?: {'SÍ 🚨' if proyeccion.alerta_insolvencia else 'NO ✓'}")

print("\n✅ Proyección calculada exitosamente")
```

---

## 📋 PASO 5: Pruebas API REST

### 5.1 Obtener token JWT

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "tu_contraseña"
  }'
```

Guardar el token devuelto como:
```
TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 5.2 Listar cuentas bancarias

```bash
curl -X GET "http://localhost:8000/api/tesoreria/cuentas-bancarias/" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.3 Registrar movimiento

```bash
curl -X POST http://localhost:8000/api/tesoreria/movimientos/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "cuenta_banco": 1,
    "fecha": "2024-01-15",
    "tipo": "ingreso",
    "concepto": "Pago de cliente",
    "monto": "2500000.00",
    "tercero_nombre": "Cliente ABC",
    "tercero_nit": "900123456"
  }'
```

### 5.4 Confirmar movimiento

```bash
MOVIMIENTO_ID=1

curl -X POST "http://localhost:8000/api/tesoreria/movimientos/$MOVIMIENTO_ID/confirmar/" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.5 Ver conciliaciones

```bash
curl -X GET "http://localhost:8000/api/tesoreria/conciliaciones/" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 PASO 6: Verificación de Integración con Contabilidad

### 6.1 Verificar asientos creados

```python
from contabilidad.models import AsientoContable

# Buscar asientos generados por tesorería
asientos = AsientoContable.objects.filter(
    modulo_origen='tesoreria'
).order_by('-fecha_creacion')

print(f"Total asientos tesorería: {asientos.count()}\n")

for asiento in asientos[:5]:  # Últimos 5
    print(f"Asiento: {asiento.numero_asiento}")
    print(f"  Descripción: {asiento.descripcion}")
    print(f"  Estado: {asiento.estado}")
    print(f"  Total Debe: ${asiento.get_total_debe():,.2f}")
    print(f"  Total Haber: ${asiento.get_total_haber():,.2f}")
    print(f"  ¿Cuadra?: {'SÍ ✓' if asiento.get_total_debe() == asiento.get_total_haber() else 'NO ✗'}")
    print()
```

### 6.2 Verificar auditoria

```python
from contabilidad.models import ControlAuditoria

# Auditoría de cambios en tesorería
auditorias = ControlAuditoria.objects.filter(
    descripcion__icontains='tesoreria'
).order_by('-fecha_hora')[:10]

print(f"Últimas acciones auditadas:\n")
for audit in auditorias:
    print(f"Usuario: {audit.usuario.username}")
    print(f"Acción: {audit.accion}")
    print(f"Descripción: {audit.descripcion}")
    print(f"Hora: {audit.fecha_hora}")
    print()
```

---

## ✅ Checklist de Verificación

Después de completar todos los pasos:

- [ ] Migraciones ejecutadas sin errores
- [ ] Tablas creadas en PostgreSQL
- [ ] Cuentas bancarias creadas y vinculadas
- [ ] Indicadores de tesorería cargados
- [ ] Test de ingreso exitoso
- [ ] Asiento contable generado automáticamente
- [ ] Test de conciliación exitoso
- [ ] Test de proyección exitoso
- [ ] API REST funcionando
- [ ] Tokens JWT generados
- [ ] Integración con Contabilidad verificada
- [ ] Auditoría registrada

---

## 🐛 Troubleshooting

### Error: "PeriodoContable matching query does not exist"

**Causa:** No hay período abierto para la fecha del movimiento

**Solución:**
```python
from contabilidad.models import PeriodoContable
from datetime import date

# Crear un período si no existe
periodo, created = PeriodoContable.objects.get_or_create(
    nombre='Enero 2024',
    defaults={
        'fecha_inicio': date(2024, 1, 1),
        'fecha_fin': date(2024, 1, 31),
        'estado': 'abierto'
    }
)

print("Período creado" if created else "Período existente")
```

### Error: "Cuenta bancaria no tiene vinculación contable"

**Causa:** CuentaBancaria.cuenta_contable es NULL

**Solución:**
```python
from tesoreria.models import CuentaBancaria
from contabilidad.models import Cuenta

cuenta = CuentaBancaria.objects.get(id=1)
cuenta_contable = Cuenta.objects.get(codigo='100101')
cuenta.cuenta_contable = cuenta_contable
cuenta.save()
```

### Error: "Monto debe ser mayor a 0"

**Causa:** Se intentó crear movimiento con monto ≤ 0

**Solución:** Verificar que `monto > Decimal('0.00')`

---

## 🎯 Siguiente Paso: Frontend

Una vez completada la Fase 2 Backend, proceder a crear:

1. **Tesoreria.jsx** en `frontend/src/pages/`
2. Componentes para:
   - Gestión de cuentas bancarias
   - Registro de movimientos
   - Conciliación bancaria
   - Proyecciones
   - Dashboards con KPIs

---

## 📚 Documentación Adicional

- [FASE2_TESORERIA_ARQUITECTURA.md](./FASE2_TESORERIA_ARQUITECTURA.md) - Arquitectura completa
- [PLAN_MEJORA_CONTABILIDAD_TESORERIA.md](./PLAN_MEJORA_CONTABILIDAD_TESORERIA.md) - Plan original
- [tesoreria/models.py](./tesoreria/models.py) - Modelos detallados
- [tesoreria/services.py](./tesoreria/services.py) - Lógica de negocio
- [tesoreria/tests.py](./tesoreria/tests.py) - Suite de tests
