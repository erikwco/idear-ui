import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Línea de apoyo opcional debajo del valor. */
  hint?: string;
  className?: string;
}

/**
 * Tile de KPI: label muted, valor protagonista (tabular), ícono con tinte
 * de marca. Sombra suave con hover institucional.
 */
export function StatCard({ label, value, icon: Icon, hint, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 py-0 shadow-card transition-shadow duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
