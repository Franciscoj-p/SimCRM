# SimCRM — Dashboard Comercial de Perfilamiento de Leads (Vivienda Colsubsidio)

**SimCRM** es el CRM comercial y visualizador inteligente en tiempo real diseñado para los asesores de ventas de vivienda de **Colsubsidio**. Su objetivo es recibir la salida del Motor de Perfilamiento e Inteligencia Financiera mediante un **webhook** y estructurar la información clave para el cierre de venta en una única pantalla.

---

## 💡 Valor de Negocio

* **Agilidad Comercial:** Reduce el tiempo de análisis financiero y perfilamiento de días a **menos de 1 segundo**, permitiendo a los asesores comerciales atender y cerrar ventas en una sola llamada.
* **Transparencia y Explicabilidad:** Proporciona un desglose transparente y auditable de por qué un lead es calificado con una prioridad determinada (`ALTA 90/10`, `MEDIA`, `BAJA`) y cómo se estructuran sus aportes frente al valor del inmueble.
* **Estructuración Financiera de Precisión:** Elimina errores en la cotización comercial al calcular de forma exacta el monto del crédito hipotecario (70%) ajustado a la **Regla del 40% (Ley de Vivienda)** y generando planes de ahorro mensual proyectado en caso de déficit en la cuota inicial.

---

## ⚡ Checklist de Funcionalidades Implementadas

- [x] **Recepción en Tiempo Real vía Webhook (`POST /webhook/perfilamiento`):** Recibe automáticamente los resultados del Motor de Perfilamiento.
- [x] **Arquitectura Unificada (Vite + Express):** Servidor unificado en Node.js que expone las APIs de leads y sirve la aplicación web compilada con React en la ruta raíz (`http://localhost:8002/`).
- [x] **Navegación Dinámica entre Leads:** Selección interactiva de prospectos recibidos con estado preservado durante las actualizaciones automáticas.
- [x] **Banner de Diagnóstico Inmediato:** Clasificación en 1 segundo de la estrategia comercial:
  - 🟢 *¡Listo para el Cierre!* (Ahorro + Subsidios cubren la inicial y el crédito es viable).
  - 🟡 *Requiere Gestión de Cierre Financiero* (Lead viable que requiere plan de ahorro mensual a plazo).
  - 🔴 *No Viable con la Información Actual* (Muestra motivos de rechazo).
- [x] **Score Financiero (0-100) y Desglose de Factores:** Gráfico circular del score comercial con desglose de puntos otorgados por afiliación, subsidios, SISBEN, crédito preaprobado y afinidad demográfica.
- [x] **Matriz de Subsidios Concurrentes:** Cálculo y presentación de subsidios de Caja de Compensación (hasta 30 SMMLV / $52.5M), Mi Casa Ya concurrente (hasta 20 SMMLV / $35M) y ruta sugerida de subsidio de arrendamiento.
- [x] **Tabla Avanzada de Opciones de Vivienda y Matching:**
  - Clasificación de proyectos ordenados por porcentaje de afinidad (`Match Score`).
  - Enlaces directos a los brochures digitales de cada proyecto (`↗`).
  - **Análisis Desplegable de Cierre Financiero en 2 Pasos:**
    - *Etapa 1 (Cuota Inicial 30%):* Comparación de aportes (cesantías + ahorros + subsidios) vs el requerido. Si hay saldo faltante, genera automáticamente una cuota mensual estimada de ahorro en el plazo de entrega (ej. 24 meses).
    - *Etapa 2 (Crédito Hipotecario 70%):* Simulación de crédito hipotecario a 20 años @ 12% E.A. validado contra la capacidad máxima del 40% del salario.
- [x] **Paneles de Diagnóstico 360°:** Navegación por pestañas interactivas (*Lead Segmentation*, *Demographics*, *Financial Exposure*, *Risk Assessment* y *Activity Log*).
- [x] **Modo Demo Integrado:** Casos de prueba preconfigurados con datos realistas para presentaciones live.

---

## 📂 Arquitectura de Archivos

```
SimCRM/
├── dist/                   # Build optimizado generado por Vite
├── src/
│   ├── main.jsx            # Punto de entrada de React 18 (createRoot)
│   └── LeadDashboard.jsx   # Componente principal del CRM Comercial
├── index.html              # Plantilla HTML principal (ES Modules)
├── vite.config.js          # Configuración de Vite con proxy dev
├── server.js               # Servidor Express (API + Webhook + Host estático dist)
├── .env                    # Variables de entorno (Puerto, WEBHOOK_SECRET)
└── package.json            # Dependencias y scripts de ejecución
```

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Construcción del Frontend (Vite)
```bash
npm run build
```

### 3. Iniciar Servidor Unificado (Producción / Demo)
```bash
npm start
```
El sistema estará disponible inmediatamente en **`http://localhost:8002/`**.

### 4. Modo Desarrollo (Opcional)
Para desarrollo interactivo con recarga rápida (HMR):
```bash
# Terminal 1: Servidor de desarrollo Vite
npm run dev

# Terminal 2: Servidor Express API
npm run server
```

---

## 🔌 Integración con el Motor de Perfilamiento

El motor de perfilamiento (o cualquier cliente HTTP) transmite los resultados al webhook:

```http
POST http://localhost:8002/webhook/perfilamiento
Content-Type: application/json

<payload JSON de salida del motor>
```
