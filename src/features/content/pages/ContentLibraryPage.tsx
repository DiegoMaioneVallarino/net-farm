
import { Images } from "lucide-react";
import { ModulePlaceholder } from "../../../components/common/ModulePlaceholder";

export function ContentLibraryPage() {
  return (
    <ModulePlaceholder
      title="Biblioteca de contenido"
      description="Organiza imágenes, videos y recursos para tus publicaciones."
      icon={<Images size={30} />}
    />
  );
}
