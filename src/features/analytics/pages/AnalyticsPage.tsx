
import { ChartNoAxesCombined } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Consulta estadísticas y compara el rendimiento de tus páginas."
      icon={<ChartNoAxesCombined size={30} />}
    />
  );
}
