
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function ModulePlaceholder({
  title,
  description,
  icon,
}: Props) {
  return (
    <div className="module-placeholder">
      <div className="module-placeholder-icon">
        {icon}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="module-status">
        Módulo en desarrollo
      </span>
    </div>
  );
}
