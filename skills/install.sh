#!/usr/bin/env bash
# Instala una skill de idear-ui en el .claude/skills/ de una app destino.
#
# Uso:
#   bash install.sh <nombre-skill> [ruta-app-destino]
#   bash install.sh <nombre-skill> [ruta-app-destino] --dry-run
#
# Ejemplos:
#   bash install.sh apply-idear-tokens                 # instala en el cwd
#   bash install.sh migrate-to-tw4-rr7 ../shorts       # instala en ../shorts
#   bash install.sh apply-idear-tokens . --dry-run     # muestra qué haría
#
# Skills disponibles: apply-idear-tokens, extract-idear-tokens, migrate-to-tw4-rr7

set -euo pipefail

SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SKILL="${1:-}"
DEST="${2:-$PWD}"
DRY_RUN="false"
[[ "${2:-}" == "--dry-run" ]] && { DEST="$PWD"; DRY_RUN="true"; }
[[ "${3:-}" == "--dry-run" ]] && DRY_RUN="true"

if [[ -z "$SKILL" ]]; then
  echo "uso: bash install.sh <nombre-skill> [ruta-app-destino] [--dry-run]" >&2
  echo "skills: $(cd "$SKILLS_DIR" && find . -maxdepth 1 -type d -name '*-*' | sed 's#./##' | tr '\n' ' ')" >&2
  exit 1
fi

SRC="$SKILLS_DIR/$SKILL"
if [[ ! -d "$SRC" || ! -f "$SRC/SKILL.md" ]]; then
  echo "error: no existe la skill '$SKILL' en $SKILLS_DIR" >&2
  exit 1
fi

TARGET="$DEST/.claude/skills/$SKILL"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[dry-run] copiaría:"
  echo "  desde: $SRC"
  echo "  hacia: $TARGET"
  exit 0
fi

mkdir -p "$DEST/.claude/skills"
rm -rf "$TARGET"
cp -R "$SRC" "$TARGET"
echo "✓ instalada '$SKILL' en $TARGET"
echo "  reiníciala/recárgala en tu agente para que la detecte."
