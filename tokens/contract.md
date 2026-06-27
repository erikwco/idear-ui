# Contrato de tokens IDEAR

Todas las apps de la organización usan **los mismos nombres de variable CSS**; lo que cambia entre marcas es el **valor**, no el nombre. Esto es lo que permite que un mismo componente se vea "de la marca" según el tema que cargue la app.

- Marca **Generación Trabajo** → `theme-generaciontrabajo.css` (teal petróleo, oklch).
- Marca **IDEAR** → `theme-idear.css` (naranja, hex).

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
| Token | Uso |
|---|---|
| `--font-sans` | Cuerpo (Inter en ambas marcas) |
| `--font-display` | Títulos — solo IDEAR (Space Grotesk) por ahora. Decisión abierta: ¿GT lo adopta? |

## Modo oscuro
Ambos temas implementan un dark **"dim"**: carbón cálido (no negro puro), texto off-white, bordes con baja opacidad, y **conserva el color de marca como `--primary`/`--sidebar-primary`** (a diferencia del default shadcn, que en dark vuelve `--primary` casi blanco). Activación por clase `.dark`. Valores afinables con diseño.

## Decisiones
1. **Tailwind v3 → v4 (en evaluación).** shorts y qrUI están en v3; el plan es migrarlos a v4 para unificar y que consuman los mismos `theme-*.css` sin variantes. qrUI es migración acotada (solo pipeline CSS, no React); shorts es mayor (TW v3→v4 + framework viejo). Mientras tanto, los tokens son válidos como variables CSS en v3 también.
2. **(Resuelta como baseline)** `theme-idear.css`: los valores `DERIVADO` se completaron para cumplir el contrato; quedan como baseline a afinar con diseño. Conversión a oklch (uniformar formato con teal) sigue siendo opcional.
3. **(Resuelta)** Dark mode implementado en ambos temas, dim y preservando la marca (ver sección "Modo oscuro").
4. **`--font-display` en GT (pendiente):** IDEAR usa Space Grotesk para títulos; GT solo usa Inter. Decidir si GT adopta una fuente display para títulos o se mantiene en Inter.
