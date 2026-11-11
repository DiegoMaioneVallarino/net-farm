
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Images,
  Send,
  CalendarDays,
  ChartNoAxesCombined,
  MessageSquare,
  Settings,
  Network,
} from "lucide-react";

const navigation = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/accounts", label: "Cuentas", icon: Users },
  { path: "/content", label: "Biblioteca", icon: Images },
  { path: "/publisher", label: "Publicador", icon: Send },
  { path: "/calendar", label: "Calendario", icon: CalendarDays },
  { path: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { path: "/inbox", label: "Inbox", icon: MessageSquare },
  { path: "/settings", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Network size={21} />
        </div>

        <div>
          <strong>NET FARM</strong>
          <span>Control Center</span>
        </div>
      </div>

      <div className="sidebar-section-label">
        WORKSPACE
      </div>

      <nav className="sidebar-nav">
        {navigation.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />
          <span>Interfaz local</span>
        </div>
        <small>Net Farm v0.1.0</small>
      </div>
    </aside>
  );
}
