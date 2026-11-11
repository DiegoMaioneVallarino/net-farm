
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Configuración"
      description="Administra las preferencias generales de Net Farm."
      icon={<Settings size={30} />}
    />
  );
}
