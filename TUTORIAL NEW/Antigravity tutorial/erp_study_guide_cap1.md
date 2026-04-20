# 📘 Tutorial ERP 8Amperios - Capítulo 1: Arquitectura General

¡Bienvenido al inicio del tutorial interactivo sobre tu sistema ERP! En este primer capítulo, entenderemos las bases de cómo está construido tu proyecto.

## 1. El "Big Picture" (La Visión General)
Un ERP (Enterprise Resource Planning) es un sistema masivo que conecta todas las áreas de una empresa. En el caso de **8Amperios**, tu ERP está compuesto por 10 módulos principales:
- `crm`, `inventarios`, `rrhh`, `finanzas`, `compras`, `facturacion`, `produccion`, `operaciones`, `reportes` y `configuracion`.

El objetivo central de un ERP es la interconexión. Por ejemplo, cuando *Operaciones* registre un nuevo proyecto finalizado, esto debe impactar automáticamente en *Finanzas* (para cobrar) y verse reflejado en el *Dashboard* en tiempo real.

## 2. Nuestra Pila Tecnológica (Tech Stack)
Tu ERP está construido usando una arquitectura altamente escalable:

*   **Backend (El Cerebro): `Python` y `Django`**
    Django se encarga de la lógica de negocio, de crear las APIs REST y administrar la seguridad. Es el "intermediario" estricto entre la base de datos y la interfaz gráfica.
*   **Base de Datos (La Memoria): `PostgreSQL`**
    El motor de base de datos relacional más avanzado del mundo. Aquí es donde guardamos todos los datos (como la tabla `proyectos` o `clientes` que creamos previamente) de manera estructurada y tolerante a fallos.
*   **Frontend (La Cara Visible): Vanilla CSS/JS con diseño "Premium Dark Mode"**
    La interfaz con la que interactúan los empleados. Mantiene un diseño oscuro profesional con acentos eléctricos para resaltar acciones clave y brindar una experiencia rica y moderna sin recargar el navegador.

## 3. El Flujo de Información (Ejemplo)
1. Un empleado hace clic en "Nuevo Cliente" en el CRM de la pantalla (Frontend).
2. Se envía un mensaje al servidor de Django mediante una ruta específica (`urls.py`).
3. Una función (`views.py`) toma los datos y le pide a PostgreSQL que guarde el cliente de forma segura (`models.py`).
4. Django devuelve un mensaje de éxito, y la interfaz actualiza la lista al instante.

> [!TIP]
> **Tu turno / Revisión de Conceptos:**
> ¿Hasta aquí está clara la diferencia y responsabilidad entre el Backend (Django) y el Frontend en el contexto de tu sistema?
> 
> *Responde en el chat, hazme cualquier pregunta técnica sobre esta primera parte, o simplemente di "Continuemos" para avanzar al Capítulo 2 (Estructura de Carpetas e Inventarios).*
