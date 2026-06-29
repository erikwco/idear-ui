# Spec: documentación + skills de `idear-ui`

Fecha: 2026-06-27 · Estado: aprobado, en ejecución

## Objetivo

Convertir `idear-ui` en una **fuente de verdad autoservible**: que desde cualquier app de
la organización se pueda decir *"lee las instrucciones de `idear-ui` y aplica la familia de
tokens IDEAR-naranja"* y un agente (o una persona) lo ejecute sin contexto previo. Además,
empaquetar como **skills instalables** las tres operaciones recurrentes:

1. **Aplicar** una marca a una app.
2. **Extraer** un preset de marca nuevo desde una app existente.
3. **Migrar** una app vieja (Tailwind v3 + Remix v1) al stack moderno (TW4 + React Router v7),
   generalizando la migración ya probada en `idearShorteningFront` (shorts).

## Principio rector

**Docs = fuente de verdad** (legibles por humano y por agente). **Skills = capa ejecutable**
que orquesta esos docs y se puede *instalar* (copiar) en la app destino. Cada `SKILL.md` es
autocontenido (funciona tras copiarse a `.claude/skills/` del destino) pero referencia su doc
canónico en `idear-ui` para el detalle y la última versión. Así las skills no duplican la
verdad: la enrutan.

## Estructura de entrega (en `idear-ui`)

```
AGENTS.md                          # PUERTA DE ENTRADA: índice-router; lo primero que se lee
docs/
  apply-tokens.md                  # aplicar una marca (3 caminos: TW4/RR7, TW3, Go)
  migration-tw4-rr7.md             # playbook generalizado desde shorts (9 fases)
  extract-tokens.md                # destilar un preset de marca nuevo
  superpowers/specs/2026-06-27-…   # este spec
skills/
  README.md                        # cómo instalar una skill en la app destino
  install.sh                       # copia skills/<x> → <destino>/.claude/skills/<x>
  apply-idear-tokens/SKILL.md
  extract-idear-tokens/SKILL.md
  migrate-to-tw4-rr7/SKILL.md
README.md                          # (actualizado) estado actual + punteros a docs
tokens/contract.md                 # (actualizado) decisión de migración resuelta
```

## Contenido por pieza

### `AGENTS.md` (puerta de entrada)
Índice corto: mapa del repo, tabla de las 3 marcas → preset, y un bloque "¿qué quieres hacer?"
que enruta a cada doc. Convención `AGENTS.md` para que los agentes lo lean primero.

### `docs/apply-tokens.md`
Tres caminos según stack destino:
- **TW4 + React/RR7** (limpio): `@import` del `theme-<marca>.css`, cableado de fuentes en
  `root.tsx`, componentes del registro, verificación.
- **TW3** (legacy): patrón `L C H` pelado + `oklch(var(--token) / <alpha-value>)`,
  `--danger`→`--destructive`.
- **Go templates** (qrUI): tokens en el pipeline CSS.
Incluye la lista de tokens del contrato, el cableado exacto de `--font-display` en h1–h3, y los
*gotchas* cazados (dark invierte `text-primary-foreground`; `bg-brand-700` requiere
`--color-brand-*` expuesto).

### `docs/migration-tw4-rr7.md`
Las 9 fases de la migración de shorts, generalizadas a "tu app", con shorts como ejemplo
trabajado. Contratos que NO se rompen (URLs, auth/session, deploy/Docker). Notas de riesgo
(headlessui v2 + React 19; `json()`→`data()`; `react-router-serve` no lee `.env`).

### `docs/extract-tokens.md`
Proceso inverso: inventariar colores/fuentes de una app → mapear a tokens semánticos → rellenar
`DERIVADO` → convertir a oklch → dark "dim" conservando hue → validar. Plantilla basada en
`theme-idear.css`.

### `skills/`
Tres `SKILL.md` autocontenidos que orquestan los docs, más `install.sh` (copia una skill al
`.claude/skills/` del destino) y `README.md`. La de migración corre **por fases con checkpoints**.

### Actualizaciones menores
`README.md` y `tokens/contract.md`: reflejar que **shorts ya está migrado** (TW4+RR7) y apuntar
a los docs nuevos. No se toca el repo de shorts ni el plan en eventos (referencia histórica).

## Fuera de alcance
- Hosting del registro shadcn (sigue siendo decisión abierta del plan original).
- Migrar otras apps ahora (los docs habilitan hacerlo, no lo ejecutan).
- Tocar `admin.idear.pro` o el repo de shorts.

## Verificación
- Los docs referencian rutas y tokens que existen (`tokens/theme-idear.css`, contrato).
- `install.sh` copia correctamente a un `.claude/skills/` destino (smoke test con `--dry-run`).
- Una lectura de `AGENTS.md` lleva, en ≤2 saltos, a las instrucciones accionables de cada tarea.
