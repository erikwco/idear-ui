# idear-ui — instrucciones para agentes y personas

Este repo es el **design system compartido** de la organización: un contrato de tokens único,
tres temas de marca y un registro de componentes (modelo shadcn). Si llegaste aquí porque otra
app te dijo *"lee las instrucciones de idear-ui y aplica la marca X"*, estás en el lugar correcto.

## Mapa del repo

```
tokens/
  contract.md                  Nombres canónicos de tokens + significado (el "idioma" común)
  theme-generaciontrabajo.css  Preset GT (teal petróleo, oklch, TW4)
  theme-idear-cream.css        Preset IDEAR corporativo (crema/tinta, oklch, TW4)
  theme-idear.css              Preset IDEAR-naranja (sub-brand público/QR, oklch, TW4)
registry/                      registry.json + componentes (StatusBadge, PageHeader, StatCard, HelpHint)
public/r/                      Salida de `registry:build` (JSON consumible por el CLI shadcn)
docs/                          Guías paso a paso (ver abajo)
skills/                        Skills instalables (apply / extract / migrate)
```

## Las tres marcas

| Marca / preset | Apps | Preset | Display | Stack |
|---|---|---|---|---|
| **GT — teal petróleo** | eventos, plazas | `theme-generaciontrabajo.css` | Fraunces | TW4 + RR7 |
| **IDEAR-crema** (corporativo) | admin.idear.pro | `theme-idear-cream.css` | Fraunces | TW4 + RR7 |
| **IDEAR-naranja** (sub-brand público) | qrUI, shorts | `theme-idear.css` | Space Grotesk | TW4 + RR7 |

> La marca IDEAR **corporativa NO es naranja** — es la crema (`admin.idear.pro` es su fuente de
> verdad). El naranja es el sub-brand deliberado de productos públicos (QR, acortador).
> Todos los presets comparten los **mismos nombres** de variable; cambia el valor, no el contrato.

## ¿Qué quieres hacer?

| Quiero… | Lee | Skill |
|---|---|---|
| **Aplicar una marca** a una app (pintar sus tokens/fuentes) | [`docs/apply-tokens.md`](docs/apply-tokens.md) | `apply-idear-tokens` |
| **Migrar una app vieja** (TW3 + Remix v1 → TW4 + RR7) | [`docs/migration-tw4-rr7.md`](docs/migration-tw4-rr7.md) | `migrate-to-tw4-rr7` |
| **Crear un preset de marca nuevo** desde una app existente | [`docs/extract-tokens.md`](docs/extract-tokens.md) | `extract-idear-tokens` |
| Entender los nombres de token y su significado | [`tokens/contract.md`](tokens/contract.md) | — |

### Camino rápido (lo más común)

> *"Aplica la familia de tokens IDEAR-naranja a esta app."*

1. Confirma el stack de la app destino (`grep tailwindcss package.json`, busca `react-router` vs `@remix-run`).
2. Si está en **TW4 + RR7**: sigue [`docs/apply-tokens.md`](docs/apply-tokens.md) → camino A.
3. Si está en **TW3 + Remix v1** (como estaba shorts): primero
   [`docs/migration-tw4-rr7.md`](docs/migration-tw4-rr7.md), luego apply-tokens.
4. Si es **Go/templates** (qrUI): apply-tokens → camino C.

## Cómo se instalan las skills

Las skills viven en [`skills/`](skills/). Para usarlas en otra app, cópialas a su
`.claude/skills/` (o pídeselo a Claude):

```bash
bash /ruta/a/idear-ui/skills/install.sh apply-idear-tokens /ruta/a/app-destino
```

También puedes invocarlas sin instalar: di *"lee `skills/apply-idear-tokens/SKILL.md` de idear-ui y síguelo"*.

## Reglas de oro

- **Tokens primero.** El idioma corporativo son los nombres de variable, no los componentes.
- **Mismo nombre, distinto valor.** Nunca inventes nombres de token nuevos por marca; usa el contrato.
- **`--destructive`, nunca `--danger`.** (Normalización ya hecha en todos los presets.)
- **Verifica visualmente.** Build verde ≠ correcto: hay bugs de dark mode que solo se ven en screenshot.
