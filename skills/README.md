# Skills de idear-ui

Tres skills instalables que automatizan las operaciones del design system. Cada una es
**autocontenida** (funciona tras copiarse al `.claude/skills/` de la app destino) pero referencia su
**doc canónico** en `idear-ui/docs/` para el detalle y la última versión.

| Skill | Hace | Doc canónico |
|---|---|---|
| `apply-idear-tokens` | Aplica una marca (tokens + fuentes + componentes) a una app | [`docs/apply-tokens.md`](../docs/apply-tokens.md) |
| `extract-idear-tokens` | Destila un preset de marca nuevo desde una app existente | [`docs/extract-tokens.md`](../docs/extract-tokens.md) |
| `migrate-to-tw4-rr7` | Migra una app TW3+Remix v1 → TW4+RR7, por fases con checkpoints | [`docs/migration-tw4-rr7.md`](../docs/migration-tw4-rr7.md) |

## Instalar en una app destino

```bash
# desde cualquier sitio, apuntando al destino:
bash /ruta/a/idear-ui/skills/install.sh apply-idear-tokens /ruta/a/app-destino

# o parado dentro de la app destino:
bash /ruta/a/idear-ui/skills/install.sh migrate-to-tw4-rr7 .

# ver qué haría, sin copiar:
bash /ruta/a/idear-ui/skills/install.sh apply-idear-tokens . --dry-run
```

Copia `skills/<x>/` → `<destino>/.claude/skills/<x>/`. Recarga el agente para que la detecte.

## Usar sin instalar

No hace falta instalarlas: desde la app destino basta decirle al agente
*"lee `skills/apply-idear-tokens/SKILL.md` de idear-ui y síguelo"*, o directamente
*"lee `AGENTS.md` de idear-ui y aplica la marca IDEAR-naranja"*.

## Mantenerlas al día

La verdad vive en `docs/`. Si cambia un procedimiento, edita el doc **y** la skill correspondiente
(la skill resume el doc para poder ejecutarse aislada). No dejes que diverjan.
