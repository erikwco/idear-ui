---
name: extract-idear-tokens
description: Use when adding an existing app as a NEW brand to the idear-ui design system — distilling its colors and fonts into a theme-<brand>.css preset that satisfies the token contract. Triggers on "extrae los tokens", "crea un preset de marca nuevo", "suma esta app al design system".
---

# Destilar un preset de marca nuevo (extract)

Convierte la identidad de una app (colores, fuentes) en un `theme-<marca>.css` que cumple el
contrato de `idear-ui`: mismos nombres de variable que los demás presets, distintos valores.
**Fuente de verdad:** `idear-ui/docs/extract-tokens.md` y `idear-ui/tokens/contract.md`. Plantilla:
`idear-ui/tokens/theme-idear.css` (cópiala y reemplaza valores).

## Antes de empezar
Confirma que de verdad es una marca **nueva** (identidad distinta que la org quiere mantener). Si es
una variante de una marca existente, NO crees preset: reusa el de esa marca.

## Pasos

1. **Inventariar** la identidad actual de la app:
   ```bash
   grep -rEn "#[0-9a-fA-F]{3,8}|oklch\(|hsl\(|rgb\(" app | head -50
   grep -rEn "font-family|--font" app
   ```
   Recoge: color de marca (+ escala si existe), fondo/tarjeta/texto/bordes/muted, estados
   (éxito/advertencia/destructivo), fuentes (sans/display/mono), radio y sombras.

2. **Mapear a tokens semánticos del contrato** (NO inventes nombres): marca→`--primary`/`--ring`,
   escala→`--brand-50..900`, fondo→`--background`, tarjeta→`--card`/`--popover`, texto→`--foreground`,
   gris→`--muted(-foreground)`, borde→`--border`/`--input`, error→`--destructive` (**no** `--danger`),
   verde/ámbar→`--success`/`--warning`.

3. **Rellenar los `DERIVADO`** que la app no tenga (secondary, accent, popover, sidebar-\*, chart-1..5)
   derivándolos, y márcalos con `/* DERIVADO */`.

4. **Convertir a oklch** completo (`oklch(L C H)`, no pelado). Parte de la paleta TW4 del hue más
   cercano para la rampa de marca.

5. **Dark "dim"**: carbón cálido, texto off-white. Marca cromática → conserva el hue como `--primary`;
   marca acromática → invierte a claro.

6. **Tipografía**: `--font-sans`/`--font-display`(/`--font-mono`) en `@theme`. Documenta las fuentes.

7. **Registrar**: guarda `tokens/theme-<marca>.css`; añade la marca a `AGENTS.md`, `README.md` y
   `contract.md`; aplícala con la skill `apply-idear-tokens` y **valida visualmente** claro+oscuro.

## Checklist de cumplimiento
- [ ] Toda variable del contrato en `:root` **y** `.dark`. [ ] Sin nombres inventados.
- [ ] `--destructive` (no `--danger`). [ ] oklch completo. [ ] `@theme inline` mapea cada `--x`→`--color-x`.
- [ ] Dark dim con hue conservado/invertido. [ ] `DERIVADO` marcado. [ ] Fuentes documentadas.

## Cierre
Entrega el `theme-<marca>.css`, lista qué tokens quedaron `DERIVADO` (a afinar con diseño) y los
screenshots de validación.
