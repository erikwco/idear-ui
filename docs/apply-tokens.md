# Aplicar una marca a una app

Pintar una app con una de las tres marcas del design system = cargar su `theme-<marca>.css`,
cablear las fuentes y (si la app usa React) instalar los componentes del registro. El contrato
de tokens es el mismo en las tres marcas; solo cambias el archivo de preset.

> **Antes de empezar — identifica el stack destino.** El camino depende de él:
> ```bash
> grep -E '"(tailwindcss|react-router|@remix-run)"' package.json   # JS apps
> ```
> - `tailwindcss@^4` + `react-router@^7` → **Camino A** (limpio).
> - `tailwindcss@^3` + `@remix-run/*` → la app está en stack viejo: **migra primero**
>   (ver [`migration-tw4-rr7.md`](migration-tw4-rr7.md)) y vuelve aquí al Camino A.
> - Go + templates (qrUI) → **Camino C**.

## Elegir el preset

| Marca | Archivo | Display | Notas |
|---|---|---|---|
| GT — teal | `tokens/theme-generaciontrabajo.css` | Fraunces | eventos, plazas |
| IDEAR-crema (corporativo) | `tokens/theme-idear-cream.css` | Fraunces | admin |
| **IDEAR-naranja** (sub-brand) | `tokens/theme-idear.css` | Space Grotesk | qrUI, shorts, productos públicos |

---

## Camino A — Tailwind v4 + React Router v7 (limpio)

Es el camino de eventos/plazas y de shorts (ya migrado). Tres pasos.

### A1. Copiar el preset y cargarlo

Copia el `theme-<marca>.css` elegido junto al `app.css`/`tailwind.css` de la app e impórtalo
**después** de Tailwind:

```css
/* app/app.css (o app/tailwind.css) */
@import "tailwindcss";
@import "tw-animate-css";          /* si la app lo usa */
@import "./theme-idear.css";       /* ← el preset de la marca */
```

> El preset trae `@theme` / `@theme inline` con todos los `--color-*`, la escala `--color-brand-*`,
> radios, sombras y el `@layer base` (bordes, `body`, `text-wrap` en h1–h3). No dupliques esos
> bloques en el `app.css`; vienen del preset.

### A2. Cablear las fuentes

El preset define `--font-sans` y `--font-display` pero **no carga las webfonts**: eso lo hace la
app en `root.tsx`. Añade los `preconnect` + el `<link>` de Google Fonts en `links()` y aplica el
display a los títulos.

```ts
// app/root.tsx
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // IDEAR-naranja: Inter (sans) + Space Grotesk (display)
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
];
```

Fuentes por marca (ver `tokens/contract.md`):

| Marca | sans | display | mono |
|---|---|---|---|
| GT | Inter | Fraunces | — |
| IDEAR-crema | Outfit | Fraunces | JetBrains Mono |
| IDEAR-naranja | Inter | Space Grotesk | — |

Aplica el display a los títulos (en el `app.css`, regla global):

```css
@layer base {
  h1, h2, h3 { font-family: var(--font-display); }
}
```

> Ojo: si en la app `CardTitle` u otro componente renderiza un `<div>` en vez de `<h_>`, esta
> regla no lo alcanza — aplícale `font-display` por clase donde haga falta.

### A3. Componentes del registro (opcional)

Los componentes (`StatusBadge`, `PageHeader`, `StatCard`, `HelpHint`) son **fuente editable**, no
dependencia runtime. Prerrequisitos en la app: `cn()` en `@/lib/utils` (clsx + tailwind-merge) y
los primitivos shadcn que cada componente declara (`card` para StatCard, `popover` para HelpHint).
Instálalos con el CLI shadcn apuntando al `public/r/*.json` del registro, o cópialos a mano y ajusta
el alias (`@/` → el alias de la app, p. ej. `~/`).

### A4. Verificar

```bash
npm run typecheck && npm run build
```

Y **siempre** una verificación visual headless en claro y oscuro (el build no caza bugs de tema):

```bash
npm run dev &
sleep 5
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --window-size=1600,900 --screenshot=/tmp/marca-light.png http://localhost:3000/
```

Checklist visual: color de marca en botones/acentos, títulos en la fuente display, dark "dim"
(carbón cálido, no negro) conservando el hue de marca como `--primary`.

---

## Camino B — Tailwind v3 (sin migrar)

Solo si la app **no** puede migrar aún. TW3 no acepta `oklch(...) / <alpha-value>` directo, así que
los tokens se guardan como **componentes pelados `L C H`** y el `tailwind.config.js` los envuelve:

```js
// tailwind.config.js
const c = (v) => `oklch(var(${v}) / <alpha-value>)`;
module.exports = {
  theme: { extend: { colors: {
    background: c("--background"),
    primary: { DEFAULT: c("--primary"), foreground: c("--primary-foreground") },
    destructive: c("--destructive"),   // NO --danger
    // …resto del contrato…
  } } },
};
```

```css
/* input.css */
:root { --primary: 0.646 0.222 41; /* L C H pelado, sin oklch() */ }
.dark { --primary: 0.705 0.213 47; }
```

Esto conserva los modificadores de opacidad (`bg-primary/90`). Toma los valores `L C H` del
`theme-<marca>.css` correspondiente (quítales el `oklch(` … `)`). Si la app usaba clases `danger`,
renómbralas: `sed -i '' 's/-danger/-destructive/g'` en los archivos afectados.

> Esto es exactamente lo que hicieron qrUI y el shorts pre-migración. La adaptación es
> *forward-compatible*: al migrar a v4 (Camino A) se simplifica copiando el preset tal cual.

---

## Camino C — Go / templates (qrUI)

No hay React; solo el pipeline CSS. Copia los nombres y valores del `theme-idear.css` al
`input.css`/`tailwind.config.js` del proyecto Go (mismo patrón TW3 del Camino B) y corre el build
de CSS del proyecto (`npm run build:css` o equivalente). Los componentes React no aplican.

---

## Gotchas confirmados (cazados en producción)

- **Dark invierte `text-primary-foreground`.** En paneles que siempre son de marca (p. ej. el panel
  del login split-screen), `text-primary-foreground` se vuelve oscuro en dark → texto invisible.
  Usa **`text-white`** fijo en esos paneles.
- **`bg-brand-700` solo existe si el preset expone `--color-brand-*`.** Los tres presets lo exponen
  vía `@theme inline`. Si una app TW3 no mapeó la escala de marca, usa `bg-primary-700`.
- **`cn` sin tailwind-merge no resuelve conflictos.** Si la app trae un `cn` casero
  (`filter(Boolean).join`), para anular padding necesitarás `!pt-6`; con tailwind-merge real basta `pt-6`.
- **`shadow-card` / `shadow-card-hover`** vienen del preset (`@theme`). No los redefinas por app.
- **Build verde ≠ correcto.** Verifica claro **y** oscuro con screenshot.

## Referencia

- Nombres de token y significado: [`tokens/contract.md`](../tokens/contract.md).
- Skill que automatiza este flujo: `skills/apply-idear-tokens/SKILL.md`.
