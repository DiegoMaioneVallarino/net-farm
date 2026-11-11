
import { Plus } from "lucide-react";

export function ConnectMetaButton() {
  return (
    <button
      type="button"
      className="connect-meta-button"
      onClick={() => {
        window.location.assign(
          "http://localhost:3001/api/meta/connect"
        );
      }}
    >
      <Plus size={16} />
      Conectar con Meta
    </button>
  );
}
