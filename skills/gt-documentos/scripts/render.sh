#!/usr/bin/env bash
# Genera el .docx desde un script de plantilla GT, lo valida y produce PDF + vistas previas JPG.
#
# Uso: bash render.sh <plantilla.js> "<salida.docx>" [dpi]
#   - ejecuta `node <plantilla.js> "<salida.docx>"`
#   - elimina entradas de carpeta del ZIP (Word en la nube las rechaza)
#   - convierte a PDF con LibreOffice y rasteriza páginas a <salida>-NN.jpg para revisarlas
set -euo pipefail
TPL="${1:?uso: render.sh <plantilla.js> <salida.docx> [dpi]}"
OUT="${2:?uso: render.sh <plantilla.js> <salida.docx> [dpi]}"
DPI="${3:-70}"
node "$TPL" "$OUT"
zip -d "$OUT" '*/' >/dev/null 2>&1 || true
DIR="$(cd "$(dirname "$OUT")" && pwd)"; BASE="$(basename "$OUT" .docx)"
if command -v soffice >/dev/null 2>&1; then
  (cd "$DIR" && soffice --headless --convert-to pdf "$BASE.docx" >/dev/null 2>&1)
elif command -v python3 >/dev/null 2>&1 && [ -n "${SOFFICE_PY:-}" ]; then
  python3 "$SOFFICE_PY" --headless --convert-to pdf "$OUT" >/dev/null 2>&1
fi
if [ -f "$DIR/$BASE.pdf" ]; then
  echo "PDF: $DIR/$BASE.pdf ($(pdfinfo "$DIR/$BASE.pdf" 2>/dev/null | awk '/Pages/{print $2}') páginas)"
  rm -f "$DIR/$BASE"-[0-9]*.jpg
  pdftoppm -jpeg -r "$DPI" "$DIR/$BASE.pdf" "$DIR/$BASE" 2>/dev/null && ls "$DIR/$BASE"-*.jpg
else
  echo "aviso: no se pudo convertir a PDF (LibreOffice no disponible); revisa el .docx directamente."
fi
