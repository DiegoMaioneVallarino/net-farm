
import { MessageSquare } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function InboxPage() {
  return (
    <ModulePlaceholder
      title="Bandeja de entrada"
      description="Centraliza los comentarios y mensajes de las cuentas autorizadas."
      icon={<MessageSquare size={30} />}
    />
  );
}
