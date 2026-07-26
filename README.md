# Plataforma VIVI — CRM Comercial (Panel del Asesor)

**SimCRM** es el componente de interfaz comercial para asesores de venta dentro de la **Plataforma VIVI — Ecosistema Inteligente para la Gestión de Prospectos de Vivienda**.

Su propósito es entregar al equipo comercial un caso contextualizado, previamente analizado, validado y priorizado por el *Motor Inteligente de Decisión*, permitiendo que el asesor concentre su tiempo en brindar una asesoría personalizada de alto valor y cerrar la venta en tiempo récord.

---

## 🧭 Desacoplamiento y Alcance de Componentes en la Plataforma VIVI

Para mantener una arquitectura limpia y modular, la documentación de la Plataforma VIVI se organiza según la responsabilidad de cada repositorio:

| Componente | Repositorio | Responsabilidad |
|---|---|---|
| 📱 **Asistente Inteligente & Roadmap** | `SimWha` / WhatsApp / Portales | Interfaz conversacional y formulario guiado de atención al prospecto. |
| 🧠 **Motor Inteligente & Reglas** | `Reto Vivienda` (Python / FastAPI) | Inteligencia de negocio, scoring, matriz de subsidios, topes legales y matching. |
| 🖥️ **CRM Comercial (Este Repositorio)** | `SimCRM` (React + Vite + Express) | **Panel visual del asesor comercial:** diagnóstico 360°, análisis de cierre financiero y gestión de leads. |

> **Nota de Alcance:** La configuración de reglas de negocio, la lógica del chatbot de WhatsApp y la evaluación matemática del scoring pertenecen al *Motor de Decisión* (`Reto Vivienda`) y al *Asistente Conversacional* (`SimWha`). Este archivo documenta exclusivamente la interfaz del **CRM Comercial**.

---

## ⚡ Funcionalidades Específicas de la Interfaz CRM Comercial

- [x] **Recepción en Tiempo Real vía Webhook (`POST /webhook/perfilamiento`):** Captura instantánea de los resultados estructurados del motor sin necesidad de recargar la página.
- [x] **Arquitectura Unificada (React 18 + Vite + Express):** Servidor unificado en Node.js que expone las APIs de leads y sirve la aplicación web compilada en la ruta raíz (`http://localhost:8002/`).
- [x] **Navegación Dinámica entre Prospectos:** Selección interactiva de leads recibidos con estado de navegación preservado durante las actualizaciones automáticas.
- [x] **Banner de Diagnóstico Comercial en 1 Segundo:**
  - 🟢 *¡Listo para el Cierre!* (Ahorro + Subsidios cubren la cuota inicial y el crédito es viable).
  - 🟡 *Requiere Gestión de Cierre Financiero* (Lead viable que requiere plan de ahorro mensual a plazo).
  - 🔴 *No Viable con la Información Actual* (Muestra motivos de rechazo).
- [x] **Score Financiero (0-100) y Explicabilidad:** Gráfico circular con el score objetivo comercial y desglose transparente de puntos por afiliación, subsidios, SISBEN, crédito preaprobado y afinidad demográfica.
- [x] **Matriz de Subsidios Concurrentes:** Visualización de subsidios de Caja de Compensación (hasta 30 SMMLV / $52.5M), Mi Casa Ya concurrente (hasta 20 SMMLV / $35M) y ruta sugerida de subsidio de arrendamiento.
- [x] **Tabla Avanzada de Opciones de Vivienda y Matching:**
  - Ordenamiento por porcentaje de afinidad histórica (`Match Score`).
  - Enlaces directos a los brochures digitales de cada proyecto (`↗`).
  - **Análisis Desplegable de Cierre Financiero en 2 Pasos:**
    - *Etapa 1 (Cuota Inicial 30%):* Comparación de aportes (cesantías + ahorros + subsidios) vs el requerido. Si hay saldo faltante, genera automáticamente una cuota mensual estimada de ahorro en el plazo de entrega (ej. 24 meses).
    - *Etapa 2 (Crédito Hipotecario 70%):* Simulación de crédito a 20 años @ 12% E.A. validado contra la capacidad máxima del 40% del salario.
- [x] **Paneles de Diagnóstico 360°:** Navegación por pestañas interactivas (*Lead Segmentation*, *Demographics*, *Financial Exposure*, *Risk Assessment* y *Activity Log*).
- [x] **Modo Demo Integrado:** Casos de prueba preconfigurados con datos realistas para presentaciones live.

---

## 📂 Estructura del Repositorio

```
SimCRM/
├── dist/                   # Build optimizado generado por Vite
├── src/
│   ├── main.jsx            # Punto de entrada de React 18 (createRoot)
│   └── LeadDashboard.jsx   # Componente principal del CRM Comercial (Plataforma VIVI)
├── index.html              # Plantilla HTML principal (ES Modules)
├── vite.config.js          # Configuración de Vite con proxy dev
├── server.js               # Servidor Express (API + Webhook + Host estático dist)
├── .env                    # Variables de entorno (Puerto, WEBHOOK_SECRET)
└── package.json            # Dependencias y scripts de ejecución
```

---

## 🚀 Cómo Ejecutar el CRM Comercial

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
La interfaz estará disponible inmediatamente en **`http://localhost:8002/`**.

---

## 🔌 Conexión Webhook con el Motor de Decisión

El motor de perfilamiento (`Reto Vivienda`) envía los prospectos evaluados a esta interfaz mediante:

```http
POST http://localhost:8002/webhook/perfilamiento
Content-Type: application/json

<payload JSON de salida del motor>
```
