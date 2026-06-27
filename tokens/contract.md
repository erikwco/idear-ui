# Contrato de tokens IDEAR

Todas las apps de la organización usan **los mismos nombres de variable CSS**; lo que cambia entre marcas es el **valor**, no el nombre. Esto es lo que permite que un mismo componente se vea "de la marca" según el tema que cargue la app.

Hay **tres** presets (la org mantiene tres marcas):
- **Generación Trabajo** → `theme-generaciontrabajo.css` (teal petróleo, oklch).
- **IDEAR corporativo** → `theme-idear-cream.css` (crema/tinta/pastel, oklch). **Fuente de verdad: `admin.idear.pro`** (su design system gobernado). Es la marca IDEAR canónica.
- **IDEAR naranja (sub-brand público/QR)** → `theme-idear.css` (naranja). Usado por qrUI/shorts; legacy/deliberado, NO la marca corporativa.

Cualquier tema nuevo DEBE definir todas estas variables (en `:root` y `.dark`).

## Tokens semánticos
| Token | Uso |
|---|---|
| `--background` / `--foreground` | Lienzo y texto base |
| `--card` / `--card-foreground` | Superficie de tarjeta |
| `--popover` / `--popover-foreground` | Popovers/menus flotantes |
| `--primary` / `--primary-foreground` | Acción principal |
| `--secondary` / `--secondary-foreground` | Acción secundaria |
| `--muted` / `--muted-foreground` | Fondos y texto atenuado |
| `--accent` / `--accent-foreground` | Acento sutil (hover, chips) |
| `--destructive` | Acciones/estados destructivos (¡NO usar `--danger`!) |
| `--success` | Estado de éxito |
| `--warning` | Estado de advertencia |
| `--border` / `--input` / `--ring` | Bordes, inputs, foco |
| `--chart-1..5` | Series de gráficas |

> Normalización: la familia IDEAR usaba `--danger`; el contrato canónico es **`--destructive`**.

## Marca
| Token | Uso |
|---|---|
| `--brand-50 … --brand-900` | Escala de color de marca |
| `--accent-amber` | Acento ámbar de apoyo |

## Sidebar
`--sidebar`, `--sidebar-foreground`, `--sidebar-primary(+-foreground)`, `--sidebar-accent(+-foreground)`, `--sidebar-border`, `--sidebar-ring`.

## Forma, sombra y motion
| Token | Uso |
|---|---|
| `--radius` | Radio base (GT `0.625rem`, IDEAR `0.75rem`) + derivados `--radius-sm/md/lg/xl` |
| `--shadow-card` / `--shadow-card-hover` | Elevación de tarjetas |
| `--ease-out-expo` | Curva de animación |

## Tipografía
| Token | GT | IDEAR-crema | IDEAR-naranja |
|---|---|---|---|
| `--font-sans` (cuerpo) | Inter | **Outfit** | Inter |
| `--font-display` (títulos) | **Fraunces** | **Fraunces** | Space Grotesk |
| `--font-mono` (cifras/IDs) | — | **JetBrains Mono** | — |

> **Convergencia:** GT y IDEAR-crema **comparten Fraunces** como display (decisión: GT quería "serif con autoridad"). Se diferencian por hue (teal vs crema) y por sans (Inter vs Outfit). `--font-mono` lo introduce el tema crema; opcional en los demás.

## Modo oscuro
Dark **"dim"**: carbón cálido (no negro puro), texto off-white, bordes con baja opacidad. Activación por clase `.dark`. Los temas con marca **cromática** (teal, naranja) **conservan el hue de marca como `--primary`/`--sidebar-primary`** (a diferencia del default shadcn, que lo vuelve casi blanco). El tema **crema** es excepción: su primary es **acromático** (tinta), así que en dark se invierte a crema-claro (como hace admin) — no se puede "conservar el hue". Valores afinables con diseño.

## Decisiones
1. **Tailwind v3 → v4 (en evaluación).** shorts y qrUI están en v3; el plan es migrarlos a v4 para unificar y que consuman los mismos `theme-*.css` sin variantes. qrUI es migración acotada (solo pipeline CSS, no React); shorts es mayor (TW v3→v4 + framework viejo). Mientras tanto, los tokens son válidos como variables CSS en v3 también.
2. **(Resuelta como baseline)** `theme-idear.css`: los valores `DERIVADO` se completaron para cumplir el contrato; quedan como baseline a afinar con diseño. Conversión a oklch (uniformar formato con teal) sigue siendo opcional.
3. **(Resuelta)** Dark mode implementado en ambos temas, dim y preservando la marca (ver sección "Modo oscuro").
4. **(Resuelta)** `--font-display`: GT adopta **Fraunces** (serif), compartido con IDEAR-crema. IDEAR-naranja se queda en Space Grotesk. Falta cablear Fraunces en eventos/plazas.
5. **(Resuelta)** Tres marcas, no dos: se añadió `theme-idear-cream.css` derivado de `admin.idear.pro` (HSL→oklch), marca IDEAR corporativa. Su rampa `--brand-*` (crema→tinta) es DERIVADO afinable; admin no la expone como escala 50..900.
