# idear-ui

Design system compartido de la organización: **un contrato de tokens** + **temas por marca** +
**componentes reutilizables** (modelo registro estilo shadcn).

> **¿Vienes a aplicar/migrar/extraer una marca?** Empieza por **[`AGENTS.md`](AGENTS.md)** — es la
> puerta de entrada que enruta a la guía correcta. Este README es el panorama del repo.

Tres marcas, un contrato:
- **Generación Trabajo** (teal): `eventos.generaciontrabajo.com`, `plazas.generaciontrabajo.com`.
- **IDEAR corporativo** (crema): `admin.idear.pro` (su fuente de verdad).
- **IDEAR naranja** (sub-brand público/QR): `idearShorteningFront` (shorts), `idqrgen` (qrUI).

## Estructura

```
AGENTS.md                        Puerta de entrada (índice-router para agentes/personas)
tokens/
  contract.md                    Nombres canónicos de tokens y su significado
  theme-generaciontrabajo.css    Tema teal (Tailwind v4, oklch)
  theme-idear-cream.css          Tema crema corporativo (Tailwind v4, oklch)
  theme-idear.css                Tema naranja (Tailwind v4, oklch)
docs/
  apply-tokens.md                Aplicar una marca a una app (3 caminos: TW4/RR7, TW3, Go)
  migration-tw4-rr7.md           Playbook TW3+Remix v1 → TW4+RR7 (probado en shorts)
  extract-tokens.md              Destilar un preset de marca nuevo
skills/
  apply-idear-tokens/            Skills instalables (apply / extract / migrate) + install.sh
  …
registry/
  registry.json                  Índice de componentes (formato shadcn registry)
  components/                    Fuente de los componentes (StatusBadge, PageHeader, StatCard, HelpHint)
public/r/                        Salida del registry:build
```

## Cómo se usa (resumen)

### Tokens (el cimiento)
En el `app.css` de una app Tailwind v4: `@import "tailwindcss"; … @import "./theme-<marca>.css";`.
Apps en TW3 (qrUI) o sin React copian nombres+valores al pipeline (patrón `L C H` + `<alpha-value>`).
Detalle completo en [`docs/apply-tokens.md`](docs/apply-tokens.md).

### Componentes
Fuente editable (no dependencia runtime). Usan el alias `@/`; al instalarlos, el CLI los mapea al
alias de cada app. Prerrequisitos: `cn()` (clsx+tailwind-merge) y los primitivos shadcn que declare
cada componente (`card` para StatCard, `popover` para HelpHint). Incluidos: **StatusBadge**,
**PageHeader**, **StatCard**, **HelpHint**.

### Skills
[`skills/`](skills/) trae `apply-idear-tokens`, `extract-idear-tokens` y `migrate-to-tw4-rr7`,
instalables en cualquier app con `skills/install.sh`. Ver [`skills/README.md`](skills/README.md).

## Estado / roadmap

- **Fase 0 — Contrato + temas. ✅** Los tres `theme-*.css` en oklch, dark "dim".
- **Fase 1 — Registro GT + componentes. ✅** `StatusBadge/PageHeader/StatCard/HelpHint`; Fraunces
  cableado en eventos/plazas. *Pendiente:* conectar eventos/plazas a consumir el registro y deduplicar copias.
- **Fase 2 — Marca IDEAR en tokens. ✅** qrUI y shorts adoptaron el contrato (oklch, `danger→destructive`).
- **Fase 3 — shorts a stack moderno. ✅** shorts **migrado** a TW4 + RR7 + React 19 (receta en
  [`docs/migration-tw4-rr7.md`](docs/migration-tw4-rr7.md)). Aplicable a las demás apps en TW3/Remix v1.
- **Pendiente:** hosting del registro (privado, Docker-safe vía vendoring); decidir si admin adopta
  los nombres canónicos.

Decisiones y detalle: [`tokens/contract.md`](tokens/contract.md) y el spec del design system
(`docs/design-system/` en el repo de eventos; histórico).

> Nota: este repo es **fuente de registro**, no una app compilable. Los componentes se validan
> (typecheck/build) en la app que los consume.
