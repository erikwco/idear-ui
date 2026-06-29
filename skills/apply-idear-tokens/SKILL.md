---
name: apply-idear-tokens
description: Use when applying an IDEAR/Generación Trabajo brand (teal, cream, or orange) to an app — wiring the design-system tokens, fonts, and components from the idear-ui contract. Triggers on "aplica la marca/los tokens", "apply IDEAR-naranja/teal/cream", "pinta esta app con la marca".
---

# Aplicar una marca del design system idear-ui

Pinta una app con una de las tres marcas: carga su preset de tokens, cablea las fuentes y (si usa
React) instala los componentes del registro. **Fuente de verdad:** `idear-ui/docs/apply-tokens.md`
— si tienes `idear-ui` checkout a mano, léelo para el detalle/última versión. Esta skill resume el
flujo para poder ejecutarse aislada.

## Paso 1 — Identifica el stack destino (DECIDE EL CAMINO)

```bash
grep -E '"(tailwindcss|react-router|@remix-run)"' package.json
```
- **TW4 + RR7** (`tailwindcss@^4` + `react-router@^7`) → Camino A.
- **TW3 + Remix v1** (`@remix-run/*`) → la app está en stack viejo. **Para. Migra primero** con la
  skill `migrate-to-tw4-rr7` (doc `idear-ui/docs/migration-tw4-rr7.md`), luego vuelve al Camino A.
- **Go / templates** (qrUI, sin React) → Camino C.

## Paso 2 — Elige el preset

| Marca | Archivo en `idear-ui/tokens/` | sans / display |
|---|---|---|
| GT — teal | `theme-generaciontrabajo.css` | Inter / Fraunces |
| IDEAR-crema (corporativo) | `theme-idear-cream.css` | Outfit / Fraunces |
| IDEAR-naranja (sub-brand) | `theme-idear.css` | Inter / Space Grotesk |

Confirma con el usuario cuál antes de tocar archivos.

## Camino A — TW4 + RR7

1. Copia el `theme-<marca>.css` junto al `app.css`/`tailwind.css` e impórtalo **después** de
   Tailwind: `@import "tailwindcss"; … @import "./theme-<marca>.css";`. No dupliques `@theme`/`@layer base`.
2. Cablea fuentes en `root.tsx` (`links()`): `preconnect` a Google Fonts + el `<link>` de las fuentes
   de la marca. Aplica `h1,h2,h3 { font-family: var(--font-display); }` en el `app.css`.
3. (Opcional) Instala componentes del registro (`StatusBadge`/`PageHeader`/`StatCard`/`HelpHint`) vía
   CLI shadcn apuntando a `public/r/*.json`, o cópialos y ajusta el alias `@/`→`~/`. Requieren `cn()`
   (clsx+tailwind-merge) y primitivos (`card`, `popover`).
4. Verifica: `npm run typecheck && npm run build` **y** screenshot headless en claro+oscuro.

## Camino B — TW3 (solo si no se puede migrar)
Usa el patrón `L C H` pelado + `oklch(var(--token) / <alpha-value>)` en `tailwind.config.js`; toma
los valores quitando `oklch(` del preset. Renombra `danger`→`destructive` si la app lo usaba. Detalle
en `docs/apply-tokens.md` (Camino B).

## Camino C — Go/templates
Copia nombres+valores al pipeline CSS del proyecto Go (patrón TW3). Sin componentes React.

## Gotchas (verifica SIEMPRE en screenshot)
- Dark invierte `text-primary-foreground` → en paneles de marca usa **`text-white`**.
- `bg-brand-700` requiere `--color-brand-*` expuesto (los 3 presets lo exponen; en TW3 sin mapear usa `bg-primary-700`).
- `cn` sin tailwind-merge no resuelve conflictos (necesitarías `!pt-6`).
- Build verde ≠ correcto: revisa claro **y** oscuro.

## Cierre
Reporta qué preset aplicaste, qué fuentes cableaste y adjunta/menciona los screenshots de verificación.
