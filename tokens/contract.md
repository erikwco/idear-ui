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

## Decisiones abiertas (ver spec del design system)
1. Tailwind v3 (shorts/qrUI) vs v4 (eventos/plazas): los tokens se comparten igual como variables CSS; falta variante/mapeo v3 documentado.
2. `theme-idear.css`: los valores marcados `DERIVADO` se completaron para cumplir el contrato y deben afinarse con diseño; convertir a oklch para uniformar con teal (opcional).
3. Dark mode teal: `--primary` y `--sidebar-primary` en `.dark` hoy no usan el brand (vienen del default de shadcn) — confirmar intención.
4. `--font-display` en GT.
