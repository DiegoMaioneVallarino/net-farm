
import type {
  AccountsResponse,
} from "../types/account.types";

const API = "http://localhost:3001/api/meta";

export async function fetchAccounts() {
  const response = await fetch(`${API}/accounts`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las cuentas");
  }

  return (await response.json()) as AccountsResponse;
}

export async function disconnectMeta() {
  const response = await fetch(`${API}/disconnect`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo desconectar Meta");
  }
}
