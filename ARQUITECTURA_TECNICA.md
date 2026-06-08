# 🏗️ ARQUITECTURA TÉCNICA - CONTABILIDAD & TESORERÍA v2.0

## DIAGRAMA DE MODELOS MEJORADOS

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MÓDULO CONTABILIDAD v2.0                          │
└─────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │ PeriodoContable │ ← Abre/Cierra períodos
                         ├─────────────────┤
                         │ - nombre        │
                         │ - fecha_inicio  │
                         │ - fecha_fin     │
                         │ - estado        │ ✓ NUEVO: usuario_cierre
                         │ - usuario_cierre│ ✓ NUEVO: puede_cerrarse()
                         └────────┬────────┘
                                  │
                                  │ agrupa
                                  ▼
    ┌─────────────────────────────────────────────────────────┐
    │        AsientoContable (Central del Libro Mayor)        │
    ├─────────────────────────────────────────────────────────┤
    │ - numero_asiento    ✓ NUEVO: Secuencial único         │
    │ - fecha             │                                    │
    │ - descripcion       │                                    │
    │ - total_debe        │                                    │
    │ - total_haber       │ ✓ NUEVO: estado (workflow)        │
    │ - estado            │ ✓ NUEVO: usuario_creador          │
    │ - usuario_creador   │ ✓ NUEVO: usuario_modificador      │
    │ - usuario_modif.    │ ✓ NUEVO: asiento_original (reverso)
    │ - asiento_original  │                                    │
    │ - motivo_reverso    │ Métodos:                           │
    │ - comentarios       │ • confirmar() → Inmutable ✓        │
    │ - metadata (JSON)   │ • reversar() → Contra-asiento ✓   │
    │                     │ • validar_integridad() ✓          │
    └──────────┬──────────┘
               │
               │ contiene múltiples
               ▼
    ┌─────────────────────────────────────────────────────────┐
    │      MovimientoContable (Partida Doble Individual)      │
    ├─────────────────────────────────────────────────────────┤
    │ - cuenta            ──┐                                  │
    │ - debe              │ ✓ NUEVO: centro_costo             │
    │ - haber             │ ✓ NUEVO: proyecto                 │
    │ - descripcion       │ ✓ NUEVO: linea (secuencia)        │
    │ - linea             │ ✓ NUEVO: tercero                  │
    │ - centro_costo ─────┘ ✓ NUEVO: documento_referencia     │
    │ - proyecto          │ ✓ NUEVO: porcentaje               │
    │ - tercero           │                                    │
    │ - documento_ref.    │ Validación en clean():            │
    │ - porcentaje        │ • No debe + haber simultáneo ✓   │
    │                     │ • Valida requerimientos cuenta ✓  │
    └──────────┬──────────┘
               │
               ├──────────────────────────────┬──────────────────────────┐
               ▼                              ▼                          ▼
    ┌──────────────────┐       ┌──────────────────┐      ┌──────────────────┐
    │ Cuenta (Mejorada)│       │ CentroCosto(NUEVO)│      │Proyecto(externo) │
    ├──────────────────┤       ├──────────────────┤      ├──────────────────┤
    │ - codigo (PUC)   │       │ - codigo         │      │ - nombre         │
    │ - nombre         │       │ - nombre         │      │ - presupuesto    │
    │ - tipo           │       │ - tipo           │      │                  │
    │ - nivel          │       │ - responsable    │      │ Opcional en      │
    │ - naturaleza ✓   │       │ - presupuesto    │      │ movimientos      │
    │ - req_tercero ✓  │       │ - activo         │      │                  │
    │ - req_centro ✓   │       │                  │      │                  │
    │ - req_proyecto ✓ │       │ Relaciones:      │      │                  │
    │ - activa         │       │ • 1 a Muchos     │      │                  │
    │ - saldo_min ✓    │       │ • con Movs       │      │                  │
    │ - saldo_max ✓    │       │                  │      │                  │
    │ - clasif_dian ✓  │       │                  │      │                  │
    │                  │       │                  │      │                  │
    │ Métodos:         │       └──────────────────┘      └──────────────────┘
    │ • get_saldo() ✓  │
    │ • get_saldo_per()│
    │ • validar_lim. ✓ │
    │                  │
    └──────────────────┘

                         ┌─────────────────┐
                         │  Retencion(NUEVO) ─→ Gestión DIAN
                         ├─────────────────┤
                         │ - RTE-FUENTE    │
                         │ - RETEICA       │
                         │ - RETE-IVA      │
                         └─────────────────┘

                    ┌──────────────────────────┐
                    │ ControlAuditoria(NUEVO)  │
                    ├──────────────────────────┤
                    │ - asiento (FK)           │
                    │ - usuario (FK)           │
                    │ - accion                 │
                    │ - descripcion            │
                    │ - datos_anteriores (JSON)│
                    │ - datos_nuevos (JSON)    │
                    │ - fecha_hora             │
                    │ - direccion_ip           │
                    │                          │
                    │ Trail Completo de:       │
                    │ ✓ Creación               │
                    │ ✓ Modificación           │
                    │ ✓ Confirmación           │
                    │ ✓ Reverso                │
                    │ ✓ Acceso                 │
                    └──────────────────────────┘
```

---

## FLUJO DE OPERACIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CREACIÓN Y CONFIRMACIÓN DE ASIENTO                  │
└─────────────────────────────────────────────────────────────────────┘

1. CREAR ASIENTO
   ┌─────────────────┐
   │ Usuario/Sistema │
   └────────┬────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ crear_asiento_contable()             │
   │ (con validaciones automáticas)       │
   │                                      │
   │ ✓ Valida período abierto             │
   │ ✓ Calcula totales debe/haber         │
   │ ✓ Valida balance                     │
   │ ✓ Valida mínimo 2 movimientos        │
   │ ✓ Crea asiento en estado 'borrador'  │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ ASIENTO CREADO (Borrador)            │
   │ ✓ Editable                           │
   │ ✓ Puede eliminarse                   │
   │ ✗ No afecta reportes                 │
   └────────┬─────────────────────────────┘
            │
            ▼
2. CONFIRMAR ASIENTO
   ┌──────────────────────────────────────┐
   │ confirmar_asiento(asiento, usuario)  │
   │                                      │
   │ ✓ Valida integridad final            │
   │ ✓ Cambia estado a 'confirmado'       │
   │ ✓ Registra en auditoría              │
   │ ✓ Ahora es INMUTABLE                 │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ ASIENTO CONFIRMADO                   │
   │ ✓ Aparece en reportes                │
   │ ✗ No se puede editar                 │
   │ ✓ Se puede reversar                  │
   │ ✓ Afecta saldos de cuentas           │
   └────────┬─────────────────────────────┘
            │
            ▼
3. SI HAY ERROR → REVERSAR
   ┌──────────────────────────────────────┐
   │ reversar_asiento(asiento,motivo,usr) │
   │                                      │
   │ ✓ Crea asiento contrario auto.       │
   │ ✓ Vincula asientos (original↔reverso)│
   │ ✓ Registra motivo                    │
   │ ✓ Registra en auditoría              │
   │ ✓ Trazabilidad completa              │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ ASIENTO REVERSADO                    │
   │ Original: estado='reversado'         │
   │ Reverso: estado='confirmado'         │
   │ Ambos vinculados en auditoría        │
   └──────────────────────────────────────┘
```

---

## ARQUITECTURA DE SERVICIOS

```
┌──────────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS (services.py)                │
└──────────────────────────────────────────────────────────────────┘

                ┌──────────────────────────┐
                │ ValidacionAsientos       │ ← Clase de Validaciones
                ├──────────────────────────┤
                │ + validar_integridad()   │ Debe = Haber
                │ + validar_periodo()      │ Período abierto
                │ + validar_cuenta()       │ Cuenta activa
                │ + validar_limites()      │ Min/Max saldo
                │ + validar_requerimientos │ Centro costo, proyecto
                └────────────┬─────────────┘
                             │
                ┌────────────▼────────────┐
                │ CalculoSaldos           │ ← Clase de Cálculos
                ├────────────────────────┤
                │ + get_saldo_periodo()  │ Saldo período específico
                │ + get_saldo_acumulado()│ Saldo histórico
                │ + get_balance_general()│ Balance completo
                │ + get_estado_result.() │ Estado de resultados
                └────────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ Operaciones │  │ Operaciones │  │ Operaciones │
    │ Generales   │  │ Específicas │  │ Período     │
    ├─────────────┤  ├─────────────┤  ├─────────────┤
    │ + crear()   │  │ + venta()   │  │ + cerrar()  │
    │ + confirmar │  │ + cobro()   │  │ + apertura()│
    │ + reversar()│  │ + compra()  │  │             │
    │             │  │             │  │             │
    └─────────────┘  └─────────────┘  └─────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        VALIDACIÓN PIPELINE                        │
└──────────────────────────────────────────────────────────────────┘

Input → Validar Período → Validar Movimientos → Validar Balance
   │         ✓              ✓ (each)              ✓
   │         Abierto        Cuenta Activa         Debe=Haber
   │         Fecha OK       Centro Costo OK      Min 2 Movs
   │         No Cerrado     Proyecto OK           OK?
   │                                              │
   │                                         ┌────▼────┐
   │                                         │   ✓     │
   │                                         │  OK!    │
   └─────────────────────────────────────────▶  Crear  │
                                                │  &    │
                                                │ Audit │
                                                └───────┘
```

---

## FLUJO DE CÁLCULO DE SALDOS

```
┌──────────────────────────────────────────────────────────────────┐
│                   CÁLCULO CORRECTO DE SALDOS                      │
└──────────────────────────────────────────────────────────────────┘

                    get_saldo_cuenta_periodo()
                            │
                ┌───────────▼────────────┐
                │ Filtrar movimientos:   │
                │ - Cuenta específica    │
                │ - Período específico   │
                │ - Estado confirmado    │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │ Sumar:                 │
                │ total_debe = ∑ debe    │
                │ total_haber = ∑ haber  │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │ ¿Naturaleza?           │
                └───────┬────────┬───────┘
                        │        │
                  DEUDORA│        │ACREEDORA
                        │        │
        ┌───────────────▼┐     ┌─▼───────────────┐
        │ saldo =        │     │ saldo =         │
        │ debe - haber   │     │ haber - debe    │
        │                │     │                 │
        │ Ej: Caja       │     │ Ej: Proveedores │
        │ D: 5000        │     │ D: 1000         │
        │ H: 2000        │     │ H: 3000         │
        │ SALDO: 3000    │     │ SALDO: 2000     │
        └───────────────┘     └─────────────────┘

    RESULTADO: Saldos CORRECTOS según naturaleza ✓
```

---

## MATRIZ DE DECISIONES

```
┌──────────────────────────────────────────────────────────────────┐
│          DECISIONES AUTOMÁTICAS EN SERVICIOS                      │
└──────────────────────────────────────────────────────────────────┘

¿CREAR ASIENTO?
├─ ¿Datos válidos? 
│  ├─ NO → Lanzar ValidationError
│  └─ SÍ → Continuar
├─ ¿Período abierto?
│  ├─ NO → Lanzar ValidationError
│  └─ SÍ → Continuar
├─ ¿Debe = Haber?
│  ├─ NO → Lanzar ValidationError
│  └─ SÍ → Crear en estado 'borrador'
└─ ✓ Crear en BD, registrar en auditoría

¿CONFIRMAR ASIENTO?
├─ ¿Estado = borrador?
│  ├─ NO → Lanzar ValidationError
│  └─ SÍ → Continuar
├─ ¿Integridad OK?
│  ├─ NO → Lanzar ValidationError
│  └─ SÍ → Cambiar a 'confirmado'
├─ Registrar en ControlAuditoria
└─ ✓ Asiento INMUTABLE, afecta reportes

¿REVERSAR ASIENTO?
├─ ¿Se puede reversar?
│  ├─ NO → Lanzar ValidationError
│  └─ SÍ → Continuar
├─ Crear contra-asiento automático:
│  ├─ Invertir debe ↔ haber
│  ├─ Vincular con original
│  └─ Registrar motivo
├─ Cambiar original a 'reversado'
├─ Confirmar reverso automático
└─ ✓ Trail completo en auditoría

¿CERRAR PERÍODO?
├─ ¿Todas cuentas balanceadas?
│  ├─ NO (y permite_descuadre=False) → Error
│  └─ SÍ → Continuar
├─ Calcular resultado:
│  └─ Ingresos - Gastos
├─ Crear asiento de cierre (si necesario)
├─ Cambiar estado a 'cerrado'
├─ Registrar usuario y fecha
└─ ✓ Período clausurado
```

---

## ÍNDICES DE BASE DE DATOS (Performance)

```
┌──────────────────────────────────────────────────────────────────┐
│              ÍNDICES PARA BÚSQUEDAS RÁPIDAS                       │
└──────────────────────────────────────────────────────────────────┘

Tabla: contabilidad_cuenta
├─ INDEX(codigo, activa)           ← Búsqueda rápida de cuentas
└─ INDEX(tipo)                     ← Filtro por tipo

Tabla: contabilidad_asientocontable
├─ INDEX(fecha, modulo_origen)     ← Auditoría rápida
├─ INDEX(estado, periodo_contable) ← Filtro por estado/período
└─ INDEX(numero_asiento)           ← Búsqueda por número

Tabla: contabilidad_movimientocontable
├─ INDEX(asiento_contable, linea)  ← Movimientos de asiento
└─ INDEX(cuenta, centro_costo)     ← Análisis por centro

Tabla: contabilidad_controlauditoria
├─ INDEX(asiento, fecha_hora)      ← Trail por asiento
└─ INDEX(usuario, accion)          ← Trail por usuario
```

---

## FLUJO DE DATOS (END-TO-END)

```
┌──────────────────────────────────────────────────────────────────┐
│              FLUJO COMPLETO: VENTA A CONTABILIDAD                │
└──────────────────────────────────────────────────────────────────┘

1. VENTA
   Usuario en Facturacion.jsx
   └─ Crea factura: $1,000
           │
           ▼
   Factura.save()
           │
           ├─ Dispara signal/webhook
           │
           ▼
2. CONTABILIDAD
   crear_asiento_venta(factura, usuario)
           │
           ├─ ValidacionAsientos.validar_periodo_abierto()
           │  └─ OK: Período Junio 2026 abierto
           │
           ├─ ValidacionAsientos.validar_cuenta_activa()
           │  ├─ CxC (110101): OK ✓
           │  └─ Ingresos (410101): OK ✓
           │
           ├─ Crear asiento:
           │  ├─ numero_asiento: 'VENTA-12345'
           │  ├─ fecha: 2026-06-08
           │  ├─ total_debe: 1,000
           │  ├─ total_haber: 1,000
           │  └─ estado: 'borrador'
           │
           ├─ Crear movimientos:
           │  ├─ Mov 1: CxC debe $1,000
           │  └─ Mov 2: Ingresos haber $1,000
           │
           ├─ confirmar_asiento()
           │  ├─ Validar integridad ✓
           │  ├─ Cambiar a 'confirmado'
           │  └─ Registrar en auditoría
           │
           ▼
3. REPORTES ACTUALIZADOS
   get_balance_general(periodo_junio)
           │
           ├─ Cuenta CxC: saldo = 1,000 (DEBE - HABER)
           ├─ Cuenta Ingresos: saldo = 1,000 (HABER - DEBE)
           │
           ▼
4. AUDITORIA TRAIL
   ControlAuditoria:
   ├─ 2026-06-08 10:30 - Usuario: Juan - Acción: creacion
   │  └─ Asiento VENTA-12345 creado
   ├─ 2026-06-08 10:31 - Usuario: Juan - Acción: confirmacion
   │  └─ Asiento VENTA-12345 confirmado
   │  └─ IP: 192.168.1.100
   └─ ✓ TRAIL COMPLETO
```

---

## RESUMEN ARQUITECTÓNICO

| Componente | Tipo | Cantidad | Descripción |
|-----------|------|----------|------------|
| **Modelos** | ORM Django | 7 | Contabilidad, Auditoría, Validación |
| **Métodos Modelo** | Python | 12+ | Cálculos, validaciones |
| **Clases Servicio** | Python | 3 | Validación, Cálculo, Operaciones |
| **Funciones Servicio** | Python | 25+ | Crear, confirmar, reversar, reportes |
| **Validaciones** | Reglas | 19 | Integridad, balance, limites |
| **Índices BD** | SQL | 9 | Performance de queries |
| **Auditoría Trail** | Logging | ∞ | Cada acción registrada |
| **Reportes** | Queries | 4+ | Balance, resultados, flujo, auditoria |

---

**Arquitectura Lista para Producción** ✅  
**Próximo Milestone:** Tesorería Independiente (Fase 2)

