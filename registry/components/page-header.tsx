import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Ícono con tinte de marca, junto al título. */
  icon?: LucideIcon;
  /** Acciones alineadas a la derecha (p. ej. un botón primario). */
  actions?: ReactNode;
}

/**
 * Encabezado de página consistente: tile de ícono de marca + título +
 * descripción, con slot opcional de acciones.
 */
export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="size-5" strokeWidth={2} aria-hidden />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
