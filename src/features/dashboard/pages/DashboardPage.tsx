import {
  Users,
  CalendarClock,
  Send,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import {
  SiInstagram,
  SiFacebook,
} from "@icons-pack/react-simple-icons";

const metrics = [
  {
    label: "Cuentas conectadas",
    value: "0",
    detail: "Esperando conexión con Meta",
    icon: Users,
  },
  {
    label: "Publicaciones programadas",
    value: "0",
    detail: "Sin publicaciones pendientes",
    icon: CalendarClock,
  },
  {
    label: "Publicaciones realizadas",
    value: "0",
    detail: "Sin actividad registrada",
    icon: Send,
  },
  {
    label: "Estado del sistema",
    value: "Local",
    detail: "Backend pendiente",
    icon: Activity,
  },
];

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h2>Centro de operaciones</h2>
          <p>
            Administra tu red de páginas desde un solo lugar.
          </p>
        </div>

        <span className="page-heading-action">
          <ArrowUpRight size={17} />
          Net Farm v0.1
        </span>
      </div>

      <div className="metrics-grid">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <div className="metric-card" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <Icon size={19} />
            </div>

            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Actividad reciente</h3>
              <p>Operaciones de publicación</p>
            </div>
            <Activity size={19} />
          </div>

          <div className="empty-state">
            <Send size={27} />
            <h4>No hay publicaciones todavía</h4>
            <p>
              Las publicaciones aparecerán aquí cuando
              conectemos las cuentas y el backend.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Plataformas</h3>
              <p>Integraciones disponibles</p>
            </div>
          </div>

          <div className="platform-row">
            <div className="platform-icon instagram">
<SiInstagram size={20} />
            </div>
            <div className="platform-info">
              <strong>Instagram</strong>
              <span>Sin conectar</span>
            </div>
            <span className="platform-count">0</span>
          </div>

          <div className="platform-row">
            <div className="platform-icon facebook">
<SiFacebook size={20} />
            </div>
            <div className="platform-info">
              <strong>Facebook</strong>
              <span>Sin conectar</span>
            </div>
            <span className="platform-count">0</span>
          </div>
        </section>
      </div>
    </div>
  );
}
