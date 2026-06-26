# idear-ui

Design system compartido de la organización: **un contrato de tokens** + **temas por marca** + **componentes reutilizables** (modelo registro estilo shadcn).

Pensado para varias apps:
- **Generación Trabajo** (teal): `eventos.generaciontrabajo.com`, `plazas.generaciontrabajo.com`.
- **IDEAR** (naranja): `idearShorteningFront`, `idqrgen` (este último solo consume tokens).

## Estructura

```
tokens/
  contract.md                  Nombres canónicos de tokens y su significado
  theme-generaciontrabajo.css  Tema teal (Tailwind v4, oklch)
  theme-idear.css              Tema naranja (Tailwind v4, hex; valores DERIVADO por afinar)
registry/
  registry.json                Índice de componentes (formato shadcn registry)
  components/                   Fuente de los componentes (StatusBadge, PageHeader, StatCard, HelpHint)
```

## Cómo se usa

### 1. Tokens (el cimiento)
En el `app.css` de una app Tailwind v4:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./theme-generaciontrabajo.css"; /* o theme-idear.css */
```

(Hoy se copia el archivo dentro de la app; cuando se hostee el registro, vendrá por el CLI.)

Apps en Tailwind v3 (shorts) o sin React (qrUI, Go): copian los **nombres y valores** de las variables del tema correspondiente en su pipeline. El contrato es el mismo; el componente React no aplica a qrUI.

### 2. Componentes
Los componentes son **fuente editable** (no dependencia en runtime). Usan el alias `@/` (estándar shadcn); al instalarlos, el CLI los mapea al alias de cada app (p. ej. `~/`).

Prerrequisitos en la app consumidora: `cn()` en `@/lib/utils` (clsx + tailwind-merge), y los primitivos shadcn que cada componente declara en `registryDependencies` (`card` para StatCard, `popover` para HelpHint).

Componentes incluidos:
- **StatusBadge** — pill de estado con dot semántico.
- **PageHeader** — encabezado con ícono de marca + título + acciones.
- **StatCard** — tile de KPI (requiere `card`).
- **HelpHint** — ícono de ayuda con popover, mobile-friendly (requiere `popover`).

## Estado / roadmap
- **Fase 0 (hecha aquí):** contrato + dos temas.
- **Fase 1 (hecha aquí, parte de librería):** registro + componentes GT. *Pendiente: conectar eventos y plazas a este registro y deduplicar sus copias.*
- **Fase 2:** aplicar `theme-idear.css` a qrUI (tokens) y shorts.
- **Fase 3 (opcional):** migrar shorts a RR7/TW4 para consumir los componentes React.

Decisiones abiertas y detalle: ver `tokens/contract.md` y el spec del design system (`docs/design-system/` en el repo de eventos).

> Nota: este repo es **fuente de registro**, no una app compilable; no trae `node_modules`. Los componentes se validan (typecheck/build) en la app que los consume. Más adelante se puede añadir una app de preview (Storybook/Next) para verlos aislados.
