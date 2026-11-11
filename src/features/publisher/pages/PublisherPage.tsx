
import { Send } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function PublisherPage() {
  return (
    <ModulePlaceholder
      title="Publicador"
      description="Prepara publicaciones y distribúyelas entre tus cuentas."
      icon={<Send size={30} />}
    />
  );
}
