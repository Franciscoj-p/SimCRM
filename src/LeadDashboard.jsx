import React, { useEffect, useState } from "react";

// Backend real: crm-comercial/server/server.js. Ajusta esto por variable
// de entorno de build en producción.
const API_BASE_URL = "";

// ---------------------------------------------------------------------
// DEMO_LEAD: se usa únicamente si el backend no responde (por ejemplo al
// previsualizar este artifact sin el servidor corriendo). Tiene la forma
// EXACTA del JSON de salida de POST /perfilar descrito en la sección 6 de
// API.md, extendido a varios proyectos para poder mostrar la tabla
// completa. En producción, todo esto lo reemplaza el payload real que
// llega por el webhook.
// ---------------------------------------------------------------------
const DEMO_LEAD = {
  receivedAt: new Date().toISOString(),
  data: {
    lead_info: {
      nombre: "Diana Martínez Rojas",
      afiliado: true,
      prioridad: "ALTA (90/10)",
      segmentacion_caja: "Medio",
    },
    financial_score: {
      viable: "SI",
      motivos_rechazo: [],
      subsidio_estimado: 52527150,
      descalifica_subsidio_por_techo_ingresos: false,
      capacidad_max_cuota: 1160000,
      cierre_financiero: {
        precio_referencia_vivienda: 150000000,
        cuota_inicial_requerida: 45000000,
        ahorro_disponible: 60527150,
        cierre_viable: true,
      },
      subsidio_concurrente_mi_casa_ya: { disponible: true, monto_adicional_estimado: 35018100 },
      subsidio_arrendamiento: { sugerido: false, monto_mensual_estimado: 1050543, meses: 24, monto_total_estimado: 25213032 },
      condiciones_subsidio: {
        dentro_de_tope_ingresos: true,
        sin_rechazo_por_reglas_duras: true,
        zona_con_cobertura_subsidio: true,
        vivienda_dentro_de_tope_vis_vip: true,
      },
    },
    score_detalle: {
      score_total: 93,
      prioridad: "ALTA",
      factores: {
        afiliado: 25,
        cierre_financiero_viable: 10,
        matching_historico: 13,
        cesantias: 8,
        ahorros: 4,
        condicion_especial: 10,
        grupo_sisben: 8,
        credito_preaprobado: 10,
        origen_organico: 5,
      },
      override_rn04_aplicado: false,
    },
    evaluacion_proyecto_interes: {
      proyecto: "Versalles",
      viable: true,
      motivo: "Proyecto de interés viable y priorizado como primera recomendación.",
    },
    matching_projects: [
      {
        proyecto: "Versalles",
        ubicacion: "Ciudadela Maiporé",
        municipio: "Soacha",
        tipo_proyecto: "VIS",
        tipologia: "Tipo E",
        precio: 180000000,
        brochure_url: "https://colsubsidio.com/brochures/versalles.pdf",
        match_score: 0.648,
        motivo: "Afinidad con el perfil histórico de compradores de Versalles (65% de match); proyecto de interés directo del lead.",
        cierre_financiero: { cuota_inicial_requerida: 54000000, ahorro_disponible: 60527150, cierre_viable: true, subsidio_aplicable: 52527150 },
      },
      {
        proyecto: "Residencial Parque",
        ubicacion: "Parque Central",
        municipio: "Bogotá",
        tipo_proyecto: "VIS",
        tipologia: "Tipo D",
        precio: 155000000,
        brochure_url: "https://colsubsidio.com/brochures/residencial-parque.pdf",
        match_score: 0.95,
        motivo: "Alta afinidad con el perfil histórico de compradores de este proyecto (95% de match).",
        cierre_financiero: { cuota_inicial_requerida: 46500000, ahorro_disponible: 60527150, cierre_viable: true, subsidio_aplicable: 50000000 },
      },
      {
        proyecto: "Mirador del Sol",
        ubicacion: "Vía Chía",
        municipio: "Chía",
        tipo_proyecto: "VIS",
        tipologia: "Tipo C",
        precio: 148000000,
        brochure_url: "https://colsubsidio.com/brochures/mirador-del-sol.pdf",
        match_score: 0.88,
        motivo: "Buena afinidad con el perfil histórico de compradores (88% de match).",
        cierre_financiero: { cuota_inicial_requerida: 44400000, ahorro_disponible: 60527150, cierre_viable: true, subsidio_aplicable: 48000000 },
      },
      {
        proyecto: "Torres de Sabana",
        ubicacion: "Sabana Norte",
        municipio: "Cota",
        tipo_proyecto: "VIP",
        tipologia: "Tipo B",
        precio: 225000000,
        brochure_url: "https://colsubsidio.com/brochures/torres-de-sabana.pdf",
        match_score: 0.75,
        motivo: "Afinidad media con el perfil histórico; precio por encima del rango recurrente del lead.",
        cierre_financiero: { cuota_inicial_requerida: 67500000, ahorro_disponible: 60527150, cierre_viable: false, subsidio_aplicable: 40000000 },
      },
    ],
    ai_summary: "Lead ALTA interesado en Soacha. Mejor match: Residencial Parque. Subsidio estimado: $52,527,150.",
    lead_original: {
      id_usuario: "1018300400",
      nombre: "Diana Martínez Rojas",
      categoria: "B",
      ingresos_mensuales: 2900000,
      grupo_sisben: "C2",
      proyecto_interes: "Versalles",
    },
  },
};

const FACTOR_LABELS = {
  afiliado: "Afiliado a Colsubsidio",
  cierre_financiero_viable: "Cierre financiero viable",
  matching_historico: "Match histórico del proyecto",
  cesantias: "Cesantías disponibles",
  ahorros: "Ahorro voluntario",
  condicion_especial: "Condición especial",
  grupo_sisben: "Grupo SISBEN",
  credito_preaprobado: "Crédito pre-aprobado",
  origen_organico: "Origen orgánico",
};

const CONDICION_LABELS = {
  dentro_de_tope_ingresos: "Dentro del tope de ingresos",
  sin_rechazo_por_reglas_duras: "Sin rechazo por reglas duras",
  zona_con_cobertura_subsidio: "Zona con cobertura de subsidio",
  vivienda_dentro_de_tope_vis_vip: "Vivienda dentro del tope VIS/VIP",
};

function money(n) {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  return `$${n.toLocaleString("es-CO")}`;
}

function pct(n) {
  return `${Math.round(n * 100)}%`;
}

const CheckIcon = ({ color = "#16A34A" }) => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
    <path d="M4 10.5 8 14.5 16 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DashIcon = () => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
    <path d="M5 10h10" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
    <circle cx="10" cy="10" r="8" stroke="#9CA3AF" strokeWidth="1.6" />
    <path d="M10 9v5" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="10" cy="6.3" r="1" fill="#9CA3AF" />
  </svg>
);

function bannerConfig(d) {
  const viable = d.financial_score.viable === "SI";
  const cierreViable = d.financial_score.cierre_financiero?.cierre_viable;
  const proyecto = d.lead_original?.proyecto_interes || d.evaluacion_proyecto_interes?.proyecto || "el proyecto de interés";

  if (viable && cierreViable) {
    return {
      tone: "success",
      title: "¡Listo para el cierre!",
      detail: `Perfil financiero y ahorro suficiente para ${proyecto}.`,
    };
  }
  if (viable && !cierreViable) {
    return {
      tone: "warning",
      title: "Requiere gestión de cierre financiero",
      detail: `El lead es viable, pero el ahorro actual no alcanza a cubrir la cuota inicial de ${proyecto}.`,
    };
  }
  const motivos = d.financial_score.motivos_rechazo || [];
  return {
    tone: "danger",
    title: "No viable con la información actual",
    detail: motivos.length ? motivos.join(" ") : "Revisa los motivos de rechazo con el equipo de riesgo.",
  };
}

const TONE_STYLES = {
  success: { bg: "#DCFCE7", border: "#86EFAC", text: "#166534" },
  warning: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  danger: { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B" },
};

const NAV_ITEMS = ["Lead Segmentation", "Demographics", "Financial Exposure", "Risk Assessment", "Activity Log"];

export default function LeadDashboard() {
  const [record, setRecord] = useState(null);
  const [leadsList, setLeadsList] = useState([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("Lead Segmentation");
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const r = await fetch(`${API_BASE_URL}/api/leads`);
        if (!r.ok) throw new Error("sin datos");
        const lista = await r.json();
        if (cancelado) return;
        setLeadsList(lista);
        if (lista.length === 0) {
          setRecord(DEMO_LEAD);
          setUsingDemo(true);
          return;
        }
        const detalle = await fetch(`${API_BASE_URL}/api/leads/${lista[0].id}`);
        const full = await detalle.json();
        if (cancelado) return;
        setRecord(full);
        setUsingDemo(false);
      } catch {
        if (cancelado) return;
        setRecord(DEMO_LEAD);
        setUsingDemo(true);
      }
    }

    cargar();
    const interval = setInterval(cargar, 8000);
    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, []);

  async function seleccionarLead(id) {
    try {
      const r = await fetch(`${API_BASE_URL}/api/leads/${id}`);
      const full = await r.json();
      setRecord(full);
      setUsingDemo(false);
    } catch {
      // si falla, se queda con lo que ya estaba mostrando
    }
  }

  if (!record) {
    return <div style={styles.page}>Cargando…</div>;
  }

  const d = record.data;
  const banner = bannerConfig(d);
  const tone = TONE_STYLES[banner.tone];

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.brand}>Commercial Advisor CRM</div>
        <div style={styles.topNav}>
          <span style={styles.topNavItem}>Dashboard</span>
          <span style={{ ...styles.topNavItem, ...styles.topNavItemActive }}>Leads</span>
          <span style={styles.topNavItem}>Properties</span>
          <span style={styles.topNavItem}>Pipeline</span>
          <span style={styles.topNavItem}>Insights</span>
        </div>
        <div style={styles.searchBox}>Buscar…</div>
      </div>

      {usingDemo && (
        <div style={styles.demoNotice}>
          Mostrando datos de demostración — no se ha recibido ningún webhook real todavía en{" "}
          <code>{API_BASE_URL}/webhook/perfilamiento</code>.
        </div>
      )}

      {leadsList.length > 1 && (
        <div style={styles.leadsStrip}>
          {leadsList.map((l) => (
            <button key={l.id} style={styles.leadChip} onClick={() => seleccionarLead(l.id)}>
              {l.nombre || l.id} · {l.prioridad}
            </button>
          ))}
        </div>
      )}

      <div style={styles.body}>
        <div style={styles.sidebar}>
          <button style={styles.qualifyBtn}>Qualify Lead</button>
          <div style={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item}
                style={activeTab === item ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.main}>
          <div style={styles.leadHeader}>
            <div style={styles.leadHeaderLeft}>
              <div style={styles.avatarCircle}>{(d.lead_info.nombre || "?").charAt(0)}</div>
              <div>
                <div style={styles.leadName}>
                  {d.lead_info.nombre}{" "}
                  <span style={styles.prioridadBadge}>{d.lead_info.prioridad}</span>
                </div>
                <div style={styles.leadSub}>
                  Prospecto para Proyecto {d.lead_original?.proyecto_interes || "—"} · Comercial Advisor CRM
                </div>
              </div>
            </div>
            <div style={styles.leadHeaderRight}>
              <button style={styles.secondaryBtn}>Seguimiento</button>
              <button style={styles.primaryBtn}>Llamar para cerrar venta</button>
            </div>
          </div>

          <div style={{ ...styles.banner, background: tone.bg, borderColor: tone.border }}>
            <span style={{ color: tone.text, fontWeight: 700 }}>{banner.title}</span>
            <span style={{ color: tone.text, marginLeft: 8 }}>{banner.detail}</span>
          </div>

          <div style={styles.contentGrid}>
            <div style={styles.leftCol}>
              {activeTab === "Lead Segmentation" && (
                <>
                  <ScoreCard d={d} />
                  <SubsidiosCard d={d} />
                  <ProyectosTable
                    d={d}
                    expandedProject={expandedProject}
                    setExpandedProject={setExpandedProject}
                  />
                </>
              )}

              {activeTab === "Demographics" && <DemographicsPanel d={d} full />}

              {activeTab === "Financial Exposure" && <FinancialExposurePanel d={d} />}

              {activeTab === "Risk Assessment" && <RiskAssessmentPanel d={d} />}

              {activeTab === "Activity Log" && <ActivityLogPanel record={record} />}
            </div>

            <div style={styles.rightCol}>
              <PerfilClienteCard d={d} />
              <InfoRegistradaCard d={d} />
              <ResumenCard d={d} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ d }) {
  const total = d.score_detalle.score_total;
  const factores = Object.entries(d.score_detalle.factores);
  const circunferencia = 2 * Math.PI * 42;
  const progreso = (total / 100) * circunferencia;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeaderRow}>
        <div style={styles.cardTitle}>Detalle del Score Financiero</div>
        <div style={styles.scoreBadge}>{total}/100</div>
      </div>
      <div style={styles.scoreBody}>
        <svg width="110" height="110" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="10" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#16A34A"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${progreso} ${circunferencia}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">
            {total}
          </text>
        </svg>
        <div style={styles.factorGrid}>
          {factores.map(([key, valor]) => (
            <div key={key} style={styles.factorRow}>
              {valor > 0 ? <CheckIcon /> : <DashIcon />}
              <span style={styles.factorLabel}>{FACTOR_LABELS[key] || key}</span>
              <span style={styles.factorValue}>{valor > 0 ? `+${valor}` : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubsidiosCard({ d }) {
  const fs = d.financial_score;
  return (
    <div style={styles.card}>
      <div style={styles.sectionLabel}>Subsidios aplicables</div>
      <div style={styles.subsidiosRow}>
        <div style={styles.subsidioCard}>
          <div style={styles.subsidioTitle}>Subsidio Principal</div>
          <div style={styles.subsidioAmount}>{money(fs.subsidio_estimado)}</div>
          {fs.subsidio_estimado > 0 ? (
            <span style={styles.tagApproved}>PRE-APROBADO</span>
          ) : (
            <span style={styles.tagMuted}>No aplica</span>
          )}
        </div>
        <div style={styles.subsidioCard}>
          <div style={styles.subsidioTitle}>Mi Casa Ya</div>
          <div style={styles.subsidioAmount}>
            {fs.subsidio_concurrente_mi_casa_ya?.disponible
              ? money(fs.subsidio_concurrente_mi_casa_ya.monto_adicional_estimado)
              : "—"}
          </div>
          {fs.subsidio_concurrente_mi_casa_ya?.disponible ? (
            <span style={styles.tagAvailable}>
              <CheckIcon color="#166534" /> Disponible
            </span>
          ) : (
            <span style={styles.tagMuted}>No disponible</span>
          )}
        </div>
        <div style={{ ...styles.subsidioCard, opacity: fs.subsidio_arrendamiento?.sugerido ? 1 : 0.55 }}>
          <div style={styles.subsidioTitle}>Arrendamiento</div>
          <div style={styles.subsidioAmount}>
            {fs.subsidio_arrendamiento?.sugerido ? money(fs.subsidio_arrendamiento.monto_total_estimado) : "---"}
          </div>
          <span style={styles.tagMuted}>{fs.subsidio_arrendamiento?.sugerido ? "Sugerido" : "No sugerido"}</span>
        </div>
      </div>
    </div>
  );
}

function ProyectosTable({ d, expandedProject, setExpandedProject }) {
  return (
    <div style={styles.card}>
      <div style={styles.sectionLabel}>Opciones de vivienda recomendadas</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Proyecto</th>
            <th style={styles.th}>Match</th>
            <th style={styles.th}>Precio</th>
            <th style={styles.th}>Cuota inicial</th>
            <th style={styles.th}>Ahorro disponible</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {d.matching_projects.map((p) => {
            const diff = p.cierre_financiero.ahorro_disponible - p.cierre_financiero.cuota_inicial_requerida;
            const isOpen = expandedProject === p.proyecto;
            return (
              <React.Fragment key={p.proyecto}>
                <tr>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{p.proyecto}</div>
                    <div style={styles.tdSub}>{p.municipio} · {p.tipologia}</div>
                  </td>
                  <td style={styles.td}>{pct(p.match_score)}</td>
                  <td style={styles.td}>{money(p.precio)}</td>
                  <td style={styles.td}>{money(p.cierre_financiero.cuota_inicial_requerida)}</td>
                  <td style={styles.td}>{money(p.cierre_financiero.ahorro_disponible)}</td>
                  <td style={styles.td}>
                    <span style={p.cierre_financiero.cierre_viable ? styles.tagViable : styles.tagDeficit}>
                      {p.cierre_financiero.cierre_viable ? "VIABLE" : "DÉFICIT"}
                    </span>
                    <div style={{ fontSize: 11, color: diff >= 0 ? "#166534" : "#991B1B", marginTop: 2 }}>
                      {diff >= 0 ? `+${money(diff)} excedente` : `${money(diff)} faltante`}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.verBtn}
                      onClick={() => setExpandedProject(isOpen ? null : p.proyecto)}
                    >
                      {isOpen ? "Ocultar" : "Ver"}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={7} style={styles.expandedRow}>
                      <div style={styles.expandedGrid}>
                        <div><b>Ubicación:</b> {p.ubicacion}</div>
                        <div><b>Tipo:</b> {p.tipo_proyecto}</div>
                        <div><b>Subsidio aplicable:</b> {money(p.cierre_financiero.subsidio_aplicable)}</div>
                        <div><b>Motivo del match:</b> {p.motivo}</div>
                        <div>
                          <a href={p.brochure_url} target="_blank" rel="noreferrer" style={styles.brochureLink}>
                            Ver brochure ↗
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PerfilClienteCard({ d }) {
  const lo = d.lead_original || {};
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Perfil del Cliente</div>
      <Row label="Edad" value={lo.edad ? `${lo.edad} años` : "—"} />
      <Row label="Cargas familiares" value={lo.personas_a_cargo != null ? `${lo.personas_a_cargo} personas` : "—"} />
      <Row label="Afiliado" value={d.lead_info.afiliado ? <span style={styles.okText}><CheckIcon /> Sí</span> : "No"} />
      <Row label="Segmentación" value={<span style={styles.segBadge}>{(d.lead_info.segmentacion_caja || "—").toUpperCase()}</span>} />
    </div>
  );
}

function InfoRegistradaCard({ d }) {
  const lo = d.lead_original || {};
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Información Registrada</div>
      <div style={styles.infoGrid}>
        <div>
          <div style={styles.infoLabel}>ID Identificación</div>
          <div style={styles.infoValue}>{lo.id_usuario || "—"}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Categoría</div>
          <div style={styles.infoValue}>{lo.categoria ? `Cat ${lo.categoria}` : "—"}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Ingresos mensuales</div>
          <div style={styles.infoValue}>{money(lo.ingresos_mensuales)}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Grupo SISBEN</div>
          <div style={styles.infoValue}>{lo.grupo_sisben || "—"}</div>
        </div>
      </div>
    </div>
  );
}

function ResumenCard({ d }) {
  return (
    <div style={{ ...styles.card, background: "#F8FAFF" }}>
      <div style={styles.cardTitle}>
        <InfoIcon /> <span style={{ marginLeft: 6 }}>Resumen</span>
      </div>
      <div style={styles.resumenText}>{d.ai_summary}</div>
    </div>
  );
}

function DemographicsPanel({ d }) {
  const lo = d.lead_original || {};
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Demographics</div>
      <div style={styles.infoGrid}>
        <div><div style={styles.infoLabel}>Nombre</div><div style={styles.infoValue}>{d.lead_info.nombre}</div></div>
        <div><div style={styles.infoLabel}>Edad</div><div style={styles.infoValue}>{lo.edad ?? "—"}</div></div>
        <div><div style={styles.infoLabel}>Cargas familiares</div><div style={styles.infoValue}>{lo.personas_a_cargo ?? "—"}</div></div>
        <div><div style={styles.infoLabel}>Zona</div><div style={styles.infoValue}>{lo.zona ?? "—"}</div></div>
        <div><div style={styles.infoLabel}>Zona preferida</div><div style={styles.infoValue}>{lo.zona_preferida ?? "—"}</div></div>
        <div><div style={styles.infoLabel}>Categoría de caja</div><div style={styles.infoValue}>{lo.categoria ? `Cat ${lo.categoria}` : "—"}</div></div>
        <div><div style={styles.infoLabel}>Grupo SISBEN</div><div style={styles.infoValue}>{lo.grupo_sisben ?? "—"}</div></div>
        <div><div style={styles.infoLabel}>Origen del lead</div><div style={styles.infoValue}>{lo.origen ?? "—"}</div></div>
      </div>
    </div>
  );
}

function FinancialExposurePanel({ d }) {
  const fs = d.financial_score;
  const cf = fs.cierre_financiero || {};
  const cond = fs.condiciones_subsidio || {};
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Financial Exposure</div>
      <div style={styles.infoGrid}>
        <div><div style={styles.infoLabel}>Capacidad máx. de cuota</div><div style={styles.infoValue}>{money(fs.capacidad_max_cuota)}</div></div>
        <div><div style={styles.infoLabel}>Precio de referencia</div><div style={styles.infoValue}>{money(cf.precio_referencia_vivienda)}</div></div>
        <div><div style={styles.infoLabel}>Cuota inicial requerida</div><div style={styles.infoValue}>{money(cf.cuota_inicial_requerida)}</div></div>
        <div><div style={styles.infoLabel}>Ahorro disponible</div><div style={styles.infoValue}>{money(cf.ahorro_disponible)}</div></div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={styles.sectionLabel}>Condiciones de subsidio</div>
        {Object.entries(cond).map(([key, val]) => (
          <div key={key} style={styles.factorRow}>
            {val ? <CheckIcon /> : <DashIcon />}
            <span style={styles.factorLabel}>{CONDICION_LABELS[key] || key}</span>
          </div>
        ))}
        <div style={styles.factorRow}>
          {fs.descalifica_subsidio_por_techo_ingresos ? <DashIcon /> : <CheckIcon />}
          <span style={styles.factorLabel}>
            {fs.descalifica_subsidio_por_techo_ingresos ? "Descalifica por techo de ingresos" : "No descalifica por techo de ingresos"}
          </span>
        </div>
      </div>
    </div>
  );
}

function RiskAssessmentPanel({ d }) {
  const motivos = d.financial_score.motivos_rechazo || [];
  const evalProyecto = d.evaluacion_proyecto_interes;
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Risk Assessment</div>
      <div style={styles.sectionLabel}>Motivos de rechazo</div>
      {motivos.length === 0 ? (
        <div style={styles.emptyState}>Sin motivos de rechazo registrados.</div>
      ) : (
        motivos.map((m, i) => (
          <div key={i} style={styles.factorRow}>
            <DashIcon />
            <span style={styles.factorLabel}>{m}</span>
          </div>
        ))
      )}
      <div style={{ marginTop: 16 }}>
        <div style={styles.sectionLabel}>Evaluación del proyecto de interés</div>
        {evalProyecto ? (
          <div style={styles.factorRow}>
            {evalProyecto.viable ? <CheckIcon /> : <DashIcon />}
            <span style={styles.factorLabel}>
              {evalProyecto.proyecto}: {evalProyecto.motivo}
            </span>
          </div>
        ) : (
          <div style={styles.emptyState}>No se consultó un proyecto de interés específico.</div>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={styles.sectionLabel}>Overrides aplicados</div>
        <div style={styles.factorRow}>
          {d.score_detalle.override_rn04_aplicado ? <CheckIcon /> : <DashIcon />}
          <span style={styles.factorLabel}>Override RN-04 (cierre financiero por cesantías/ahorro)</span>
        </div>
      </div>
    </div>
  );
}

function ActivityLogPanel({ record }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Activity Log</div>
      <div style={styles.factorRow}>
        <CheckIcon />
        <span style={styles.factorLabel}>
          Lead recibido por webhook el {new Date(record.receivedAt).toLocaleString("es-CO")}
        </span>
      </div>
      <div style={{ ...styles.emptyState, marginTop: 10 }}>
        Aún no hay más actividad registrada para este lead.
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Inter, 'Segoe UI', Helvetica, Arial, sans-serif",
    background: "#F3F4F6",
    minHeight: 600,
    color: "#111827",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    background: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",
    padding: "10px 20px",
  },
  brand: { fontWeight: 700, color: "#4F46E5", fontSize: 15, whiteSpace: "nowrap" },
  topNav: { display: "flex", gap: 18, flex: 1 },
  topNavItem: { fontSize: 13.5, color: "#6B7280", cursor: "pointer" },
  topNavItemActive: { color: "#4F46E5", fontWeight: 600, borderBottom: "2px solid #4F46E5", paddingBottom: 10 },
  searchBox: {
    background: "#F3F4F6",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12.5,
    color: "#9CA3AF",
    minWidth: 160,
  },
  demoNotice: {
    background: "#FEF3C7",
    color: "#92400E",
    fontSize: 12.5,
    padding: "6px 20px",
  },
  leadsStrip: {
    display: "flex",
    gap: 8,
    padding: "8px 20px",
    background: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",
    overflowX: "auto",
  },
  leadChip: {
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    borderRadius: 16,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  body: { display: "flex" },
  sidebar: {
    width: 220,
    background: "#FFFFFF",
    borderRight: "1px solid #E5E7EB",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  qualifyBtn: {
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 0",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  navList: { display: "flex", flexDirection: "column", gap: 2 },
  navItem: {
    fontSize: 13,
    color: "#374151",
    padding: "9px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
  navItemActive: { background: "#EEF2FF", color: "#4338CA", fontWeight: 600, borderLeft: "3px solid #4F46E5" },
  main: { flex: 1, padding: 20, minWidth: 0 },
  leadHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  leadHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#FDBA74",
    color: "#7C2D12",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  leadName: { fontWeight: 700, fontSize: 16 },
  leadSub: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },
  prioridadBadge: {
    background: "#FFEDD5",
    color: "#9A3412",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 10,
    marginLeft: 6,
  },
  leadHeaderRight: { display: "flex", gap: 8 },
  secondaryBtn: {
    background: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: 7,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  primaryBtn: {
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  banner: {
    border: "1px solid",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 14,
  },
  contentGrid: { display: "flex", gap: 16, alignItems: "flex-start" },
  leftCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 },
  rightCol: { width: 280, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: 16,
  },
  cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center" },
  scoreBadge: { background: "#DCFCE7", color: "#166534", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 10 },
  scoreBody: { display: "flex", gap: 20, alignItems: "center" },
  factorGrid: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  factorRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 },
  factorLabel: { color: "#374151", flex: 1 },
  factorValue: { color: "#6B7280", fontWeight: 600 },
  sectionLabel: { fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 },
  subsidiosRow: { display: "flex", gap: 12 },
  subsidioCard: { flex: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: 12 },
  subsidioTitle: { fontSize: 12.5, color: "#6B7280", marginBottom: 4 },
  subsidioAmount: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  tagApproved: { background: "#1E3A8A", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 5 },
  tagAvailable: { display: "inline-flex", alignItems: "center", gap: 4, color: "#166534", fontSize: 11.5, fontWeight: 600 },
  tagMuted: { color: "#9CA3AF", fontSize: 11.5 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", fontSize: 11.5, color: "#6B7280", fontWeight: 600, padding: "8px 6px", borderBottom: "1px solid #E5E7EB" },
  td: { padding: "10px 6px", borderBottom: "1px solid #F3F4F6", verticalAlign: "top" },
  tdSub: { fontSize: 11.5, color: "#9CA3AF" },
  tagViable: { background: "#DCFCE7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  tagDeficit: { background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  verBtn: { border: "1px solid #D1D5DB", background: "#fff", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
  expandedRow: { background: "#F9FAFB", padding: 12, fontSize: 12.5 },
  expandedGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  brochureLink: { color: "#4F46E5", fontWeight: 600, textDecoration: "none" },
  row: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 },
  rowLabel: { color: "#6B7280" },
  rowValue: { fontWeight: 600 },
  okText: { display: "inline-flex", alignItems: "center", gap: 4, color: "#166534" },
  segBadge: { background: "#F3F4F6", color: "#374151", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 },
  infoLabel: { fontSize: 11, color: "#9CA3AF" },
  infoValue: { fontSize: 13, fontWeight: 600, marginTop: 2 },
  resumenText: { fontSize: 12.5, color: "#374151", marginTop: 8, lineHeight: 1.5 },
  emptyState: { fontSize: 12.5, color: "#9CA3AF", fontStyle: "italic" },
};
