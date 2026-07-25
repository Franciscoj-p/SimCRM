import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const { PORT = 3002, WEBHOOK_SECRET } = process.env;

// Almacenamiento en memoria para el prototipo. En producción esto sería
// una tabla real (lead_id, payload, received_at) en tu base de datos.
const leads = [];

// El Motor de Perfilamiento (o quien orqueste la llamada a POST /perfilar)
// debe apuntar su webhook aquí con la salida exacta descrita en la
// sección 6 de API.md.
app.post("/webhook/perfilamiento", (req, res) => {
  if (WEBHOOK_SECRET) {
    const firma = req.get("x-webhook-secret");
    if (firma !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Firma de webhook inválida" });
    }
  }

  const payload = req.body;
  const pareceValido =
    payload && payload.lead_info && payload.financial_score && payload.score_detalle;

  if (!pareceValido) {
    return res.status(400).json({
      error: "El cuerpo no tiene la forma del JSON de salida de /perfilar (ver sección 6 de API.md)",
    });
  }

  const id = payload.lead_original?.id_usuario || payload.lead_info?.nombre || `lead_${Date.now()}`;
  const registro = { id, receivedAt: new Date().toISOString(), data: payload };

  const idx = leads.findIndex((l) => l.id === id);
  if (idx >= 0) leads[idx] = registro;
  else leads.unshift(registro);

  res.status(201).json({ status: "recibido", id });
});

// Resumen para listar leads en la barra de "recién recibidos" del dashboard.
app.get("/api/leads", (_req, res) => {
  res.json(
    leads.map((l) => ({
      id: l.id,
      receivedAt: l.receivedAt,
      nombre: l.data.lead_info?.nombre,
      prioridad: l.data.lead_info?.prioridad,
      viable: l.data.financial_score?.viable,
    }))
  );
});

// Payload completo para renderizar el dashboard de un lead específico.
app.get("/api/leads/:id", (req, res) => {
  const l = leads.find((x) => x.id === req.params.id);
  if (!l) return res.status(404).json({ error: "No encontrado" });
  res.json(l);
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", leads_almacenados: leads.length }));

// Servir archivos estáticos del frontend compilado por Vite en la raíz
app.use(express.static(path.join(__dirname, "dist")));

// Redirigir cualquier otra petición de navegación al index.html del frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`[crm-comercial] Escuchando en http://localhost:${PORT}`);
  console.log(`[crm-comercial] Apunta el webhook del motor a POST http://localhost:${PORT}/webhook/perfilamiento`);
});
