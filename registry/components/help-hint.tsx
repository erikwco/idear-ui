import * as React from "react";
import { HelpCircle } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Ícono de ayuda corporativo. Al presionarlo (clic o tap) abre un popover con
 * el texto de ayuda. Usa Popover (no Tooltip) para que funcione bien en mobile.
 *
 * Uso:
 *   <HelpHint>Texto de ayuda que aparece al tocar el ícono.</HelpHint>
 */
export default function HelpHint({
  children,
  label = "Más información",
  side = "top",
  align = "center",
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  /** Texto accesible del botón (aria-label). */
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40",
            className,
          )}
        >
          <HelpCircle className="size-4" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className={cn("w-64 text-sm leading-relaxed text-muted-foreground", contentClassName)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
