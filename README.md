# CRM Comercial — Dashboard de Lead Perfilado

Este es un proyecto **aparte** del Asesor Digital (el chat). No usa ningún
LLM. Su única función es recibir, por webhook, la salida real de
`POST /perfilar` (sección 6 de `API.md`) y mostrársela al asesor comercial
de forma que en un vistazo sepa si el lead está listo para el cierre.

## Piezas

- **`server/server.js`**: recibe el webhook en
  `POST /webhook/perfilamiento`, lo guarda en memoria, y expone
  `GET /api/leads` (lista) y `GET /api/leads/:id` (detalle) para el
  dashboard.
- **`client/LeadDashboard.jsx`**: el CRM visual. Todo lo que pinta sale de
  las claves reales del JSON de `/perfilar` — nada se inventa ni se
  recalcula en el cliente:
  - Banner de estado (listo para cierre / requiere gestión / no viable) →
    derivado de `financial_score.viable` y `cierre_financiero.cierre_viable`.
  - Score detallado → `score_detalle.score_total` y cada entrada real de
    `score_detalle.factores` (no las categorías genéricas del mockup
    visual que me compartiste — esas las reemplacé por los factores que
    tu API realmente entrega).
  - Subsidios aplicables → `financial_score.subsidio_estimado`,
    `subsidio_concurrente_mi_casa_ya`, `subsidio_arrendamiento`.
  - Tabla de proyectos → `matching_projects[]`, con el excedente/faltante
    de cada uno calculado como `ahorro_disponible − cuota_inicial_requerida`.
  - Perfil del cliente / Información registrada → `lead_original`.
  - Resumen → el campo `ai_summary` que ya viene en la respuesta del motor
    (no lo genera esta app).
  - Pestañas de la barra lateral (Demographics, Financial Exposure, Risk
    Assessment, Activity Log) muestran otros grupos de campos del mismo
    JSON. "Activity Log" solo registra el momento real en que este
    servidor recibió el webhook — no hay datos de actividad histórica en
    la API, así que no inventé ninguno.

## Cómo correrlo

```bash
cd server
cp .env.example .env
npm install
npm start        # http://localhost:3002
```

Apunta el envío del resultado de tu Motor de Perfilamiento a:

```
POST http://localhost:3002/webhook/perfilamiento
Content-Type: application/json

<exactamente el JSON de la sección 6 de API.md>
```

`client/LeadDashboard.jsx` consulta `http://localhost:3002` (constante
`API_BASE_URL` al inicio del archivo) cada 8 segundos por nuevos leads.
Si no hay ningún webhook recibido, muestra un lead de demostración con un
aviso amarillo arriba para que no lo confundas con datos reales.

## Lo que falta para producción (mismo checklist honesto que la vez pasada)

- No pude probar esto contra tu Motor real, solo con un payload de prueba
  que arma esta misma sandbox.
- `WEBHOOK_SECRET` es opcional y muy básico; en producción necesitas una
  verificación de firma más robusta (HMAC) si el Motor la soporta, más
  autenticación en `/api/leads*` para que no cualquiera vea leads ajenos.
- El almacenamiento es en memoria: se pierde todo al reiniciar el
  servidor. Necesitas una base de datos real antes de ir a producción.
- No hay paginación ni búsqueda en la lista de leads — hoy asume que
  vas revisando uno a la vez.
