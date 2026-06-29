# Destilar un preset de marca nuevo

Cuando llega una app con su propia identidad (colores, fuentes) y quieres **sumarla al design
system** como una marca más, el resultado es un archivo `theme-<marca>.css` que cumple el contrato:
mismos nombres de variable que los demás presets, distintos valores. Este documento es el proceso
inverso a [`apply-tokens.md`](apply-tokens.md): de una app existente → un preset.

> **Plantilla de referencia:** `tokens/theme-idear.css` (naranja). Cópialo y reemplaza valores;
> conserva su estructura (`@theme`, `@theme inline`, `:root`, `.dark`, `@layer base`). El contrato de
> nombres está en [`tokens/contract.md`](../tokens/contract.md) — **toda** variable de ahí debe existir
> en `:root` y `.dark`.

## Cuándo NO crear un preset nuevo

Si la app es una variante de marca ya existente (mismo hue, otra app), **no** hagas preset nuevo:
reusa el preset de esa marca. Solo se crea un cuarto preset cuando hay una identidad genuinamente
distinta que la org decide mantener.

## Proceso

### 1. Inventariar la identidad actual
Recoge de la app destino:
- **Color de marca** y su escala si existe (50…900). Si solo hay un hex, derivarás la rampa.
- **Superficies**: fondo, tarjeta, texto base, bordes, muted.
- **Estados**: éxito, advertencia, destructivo (¡ojo si lo llama `danger`!).
- **Fuentes**: sans (cuerpo), display (títulos), mono (si usa cifras tabulares).
- **Radio** base y sombras de tarjeta.

```bash
grep -rEn "#[0-9a-fA-F]{3,8}|oklch\(|hsl\(|rgb\(" app | head -50   # hardcodes y tokens actuales
grep -rEn "font-family|--font" app                                  # fuentes
```

### 2. Mapear a tokens semánticos
Cada color de la app se asigna a un **nombre del contrato**, no a uno nuevo:

| De la app | Token del contrato |
|---|---|
| color de marca principal | `--primary` (+ `--ring`, `--sidebar-primary`) |
| escala de marca | `--brand-50 … --brand-900` |
| fondo de página | `--background` |
| superficie de tarjeta | `--card` (+ `--popover`) |
| texto base | `--foreground` |
| gris atenuado | `--muted`, `--muted-foreground` |
| borde / input | `--border`, `--input` |
| rojo de error | `--destructive` (**nunca** `--danger`) |
| verde / ámbar | `--success` / `--warning` |

### 3. Rellenar los `DERIVADO`
La app casi nunca tiene **todos** los tokens del contrato (secondary, accent, popover, sidebar-\*,
chart-1..5). Complétalos derivándolos de los que sí tiene y márcalos con el comentario `/* DERIVADO */`
(como en `theme-idear.css`) para que se sepa que son baseline a afinar con diseño. Criterios:
- `secondary`/`accent`: tintes suaves del fondo o de la marca.
- `chart-1..5`: marca + estados, separados en hue.
- `sidebar-*`: misma estructura que el tema teal, recoloreada.

### 4. Convertir a oklch
El contrato usa **oklch** en los tres presets. Convierte cada hex/hsl a `oklch(L C H)`. Para una
rampa de marca consistente, parte de la paleta canónica de Tailwind v4 del hue más cercano y ajusta.
Mantén el formato completo `oklch(L C H)` (no el pelado `L C H`, que es solo para apps TW3).

### 5. Dark "dim"
Define el bloque `.dark` con la convención de la casa: **carbón cálido** (no negro puro), texto
off-white, bordes de baja opacidad. Para marcas **cromáticas** (con hue de color), **conserva el hue
de marca** como `--primary`/`--sidebar-primary` en dark (a diferencia del default shadcn, que lo
aclara casi a blanco). Excepción: si la marca es **acromática** (tinta/gris, como la crema), su
primary se invierte a claro.

### 6. Tipografía
Añade `--font-sans` y `--font-display` (y `--font-mono` si aplica) en el `@theme`. Documenta las
fuentes en la tabla de [`tokens/contract.md`](../tokens/contract.md). Recuerda: las webfonts las carga
cada app en su `root.tsx`, no el preset.

### 7. Registrar y validar
- Guarda el archivo como `tokens/theme-<marca>.css`.
- Añádelo a la tabla de marcas en `AGENTS.md`, `README.md` y `tokens/contract.md`.
- Aplícalo a la app con [`apply-tokens.md`](apply-tokens.md) y **valida visualmente** claro y oscuro
  (screenshot headless). Los `DERIVADO` se afinan aquí, con diseño.

## Checklist de cumplimiento

- [ ] Toda variable del contrato existe en `:root` **y** en `.dark`.
- [ ] Ningún nombre de token inventado fuera del contrato.
- [ ] `--destructive` (no `--danger`).
- [ ] Valores en `oklch(L C H)` completo.
- [ ] `@theme inline` mapea cada `--x` a su `--color-x` (incl. `--color-brand-*`).
- [ ] Dark "dim" con hue de marca conservado (o invertido si es acromático).
- [ ] `DERIVADO` marcado en los tokens estimados.
- [ ] Fuentes documentadas en `contract.md`.

## Referencia

- Skill que automatiza este flujo: `skills/extract-idear-tokens/SKILL.md`.
