
import { Users } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function AccountsPage() {
  return (
    <ModulePlaceholder
      title="Gestión de cuentas"
      description="Conecta y administra tus páginas de Facebook y cuentas profesionales de Instagram."
      icon={<Users size={30} />}
    />
  );
}
