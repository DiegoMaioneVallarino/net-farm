
import { useLocation } from "react-router-dom";
import { Bell, Search, CircleUserRound } from "lucide-react";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Cuentas",
  "/content": "Biblioteca de contenido",
  "/publisher": "Publicador",
  "/calendar": "Calendario",
  "/analytics": "Analytics",
  "/inbox": "Inbox",
  "/settings": "Configuración",
};

export function Topbar() {
  const location = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <span>Workspace / Net Farm</span>
        <h1>{titles[location.pathname] ?? "Net Farm"}</h1>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={17} />
          <span>Buscar...</span>
          <kbd>Ctrl K</kbd>
        </div>

        <span className="topbar-icon" title="Notificaciones">
          <Bell size={19} />
        </span>

        <div className="user-avatar">
          <CircleUserRound size={23} />
        </div>
      </div>
    </header>
  );
}
