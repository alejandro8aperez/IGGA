# 📘 Tutorial ERP 8Amperios - Capítulo 2: Módulos Core y Estructura de Carpetas

¡Qué excelente que pudiste presenciar cómo funciona todo el ecosistema de tu sistema ERP y arreglamos ese bug juntos! Ahora veamos de qué están compuestas esas páginas que estás viendo en la interfaz y cómo se organizan sus archivos.

## 1. Módulos Internos (Apps de Django)
Si revisas tu carpeta `C:\Postgres\ERP-8AMPERIOS`, verás subcarpetas como `crm`, `inventarios`, `finanzas`, etc. En la arquitectura de Django, a cada una de estas divisiones se les llama **"Aplicaciones (Apps)"**. 

De esta forma aplicamos un principio de sistemas llamado "Responsabilidad Única": Logramos que **Inventarios** se ocupe **solo** de los productos (y no de los cálculos de nómina), mientras que **CRM** toma la responsabilidad de las ventas y clientes.

### Anatomía de un Módulo (Ej: Carpeta `crm/`)
Si abres cualquier módulo, siempre vas a interactuar con tres archivos principales. Son el núcleo de cómo operaba el backend que recién consultamos en la terminal:

1.  **`models.py` (La Base de Datos):** Aquí se define la estructura de las tablas de PostgreSQL. Para el CRM, aquí se indica que la base de datos tendrá campos como "Nombre de Cliente", "Telf" o "Email". (Justo como hicimos cuando verificamos el modelo de la tabla `Proyecto` en el capítulo anterior).
2.  **`views.py` (La Lógica o El Cerebro):** El director de orquesta. Si tu interfaz oscura del Frontend dice "Trae a todos los clientes", este archivo pregunta a `models.py` por la info, la envuelve en un formato mágico que el código entienda (JSON) y la envía por internet.
3.  **`urls.py` (El Mapa / Las Rutas):** El que dice las direcciones de internet. Este le avisa a Django: *"Si el navegador pregunta por `http://localhost:8000/api/crm/clientes/`, dile al archivo `views.py` que responda."*

## 2. Los Módulos Centrales (Core)
El corazón de tu ERP 8Amperios reside en estos tres grandes pilares del sistema:

*   **1. Inventarios (`inventarios/`):**
    Controla absolutamente todo tu catálogo de venta y stock físico. Su modelo principal define la tabla `Producto`, incluyendo atributos invaluables de cálculo contable como el precio y el costo. A partir de aquí nacen las métricas de tu dashboard.
    
*   **2. CRM (`crm/`):**
    Más que una tabla de gente, es la *puerta de entrada del dinero*. Gestiona tu tabla `Cliente` y, lo más importante, las **"Oportunidades"** (tu Pipeline de posibles negocios). Todo gran proyecto en "Operaciones" debería originarse primero desde una oportunidad vendida o pagada en el CRM.
    
*   **3. Finanzas (`finanzas/`):**
    La caja fuerte donde terminan todas las operaciones. Aquí caen finalmente el registro de las `Transacciones` monetarias de cualquier tipo. Este módulo nos va a permitir en el futuro realizar cierres de caja avanzados.

En tu arquitectura, al igual que los `.py` manejan la lógica en el Backend, hay un archivo `.jsx` respectivo en `frontend/src/pages/` (por ejemplo, `CRM.jsx`) que es quien se encarga al 100% de la estética y los botones oscuros / luces azules que ves brillando en la página.

> [!CAUTION]
> **Pregunta Rápida para ti (Para ver si captamos la lógica Backend):**
> 
> Imagina que mañana tu empresa 8Amperios crece y ahora requieres agregar un nuevo campo de información que sea de llenado obligatorio llamado **"Número de RUC o Identificación"** para registrar a tus clientes. 
> 
> *Físicamente, ¿en cuál de los tres archivos de la carpeta `crm/` (`urls.py`, `views.py` o `models.py`) tendrías que empezar a aplicar y programar ese cambio, sabiendo que este nuevo dato se guardará en PostgreSQL?*
