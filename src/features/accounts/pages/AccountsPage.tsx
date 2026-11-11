
import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  Unplug,
} from "lucide-react";

import { SiFacebook, SiInstagram } from
  "@icons-pack/react-simple-icons";

import { ConnectMetaButton } from
  "../components/ConnectMetaButton";

import {
  fetchAccounts,
  disconnectMeta,
} from "../services/accountsApi";

import type { ConnectedAccount } from
  "../types/account.types";

export function AccountsPage() {
  const [accounts, setAccounts] =
    useState<ConnectedAccount[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAccounts();
      setAccounts(result.accounts);
    } catch {
      setError("No se pudo conectar con el backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function disconnect() {
    if (!window.confirm(
      "¿Desconectar las cuentas de esta sesión?"
    )) return;

    try {
      await disconnectMeta();
      await load();
    } catch {
      setError("No se pudo desconectar.");
    }
  }

  const status =
    new URLSearchParams(window.location.search)
      .get("meta");

  return (
    <div className="accounts-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ACCOUNT MANAGER
          </span>
          <h2>Cuentas conectadas</h2>
          <p>
            Administra tus páginas de Facebook e Instagram.
          </p>
        </div>

        <ConnectMetaButton />
      </div>

      {status === "connected" && (
        <p className="account-notice">
          Autorización completada correctamente.
        </p>
      )}

      {status === "denied" && (
        <p className="account-error">
          Autorización cancelada.
        </p>
      )}

      {status === "error" && (
        <p className="account-error">
          Meta no pudo completar la conexión.
        </p>
      )}

      {error && (
        <p className="account-error">{error}</p>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Conexiones activas</h3>
            <p>{accounts.length} cuentas detectadas</p>
          </div>

          <button
            className="account-icon-button"
            onClick={() => void load()}
            title="Actualizar"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <p>Cargando cuentas...</p>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <Users size={30} />
            <h4>No hay cuentas conectadas</h4>
            <p>
              Autoriza Meta para descubrir tus páginas.
            </p>
          </div>
        ) : (
          <div className="account-list">
            {accounts.map((account) => (
              <div
                className="account-row"
                key={`${account.platform}-${account.id}`}
              >
                <div className="account-platform">
                  {account.platform === "instagram" ? (
                    <SiInstagram size={20} />
                  ) : (
                    <SiFacebook size={20} />
                  )}
                </div>

                <div className="account-details">
                  <strong>{account.name}</strong>
                  <span>
                    {account.platform} · {account.id}
                  </span>
                </div>

                <span className="account-connected">
                  Conectada
                </span>
              </div>
            ))}
          </div>
        )}

        {accounts.length > 0 && (
          <button
            className="account-disconnect"
            onClick={() => void disconnect()}
          >
            <Unplug size={16} />
            Desconectar sesión
          </button>
        )}
      </section>
    </div>
  );
}
