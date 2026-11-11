
import { CalendarDays } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function CalendarPage() {
  return (
    <ModulePlaceholder
      title="Calendario editorial"
      description="Visualiza y organiza las publicaciones programadas."
      icon={<CalendarDays size={30} />}
    />
  );
}
