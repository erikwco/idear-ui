import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "neutral"
  | "warning"
  | "brand"
  | "destructive";

const dotByTone: Record<StatusTone, string> = {
  success: "bg-success",
  neutral: "bg-muted-foreground/50",
  warning: "bg-warning",
  brand: "bg-brand-600",
  destructive: "bg-destructive",
};

interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

/**
 * Pill de estado con dot coloreado — el color semántico vive en el dot,
 * el texto se mantiene en foreground de alto contraste.
 */
export function StatusBadge({ tone = "neutral", children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotByTone[tone])} aria-hidden />
      {children}
    </span>
  );
}
