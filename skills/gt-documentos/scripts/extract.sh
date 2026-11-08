#!/usr/bin/env bash
# Extrae el contenido de un .docx de origen para mapearlo a la plantilla GT.
#
# Uso: bash extract.sh "<origen.docx>" [dir-salida]
# Genera: <dir-salida>/<nombre>.md (markdown, sin reflow) y <dir-salida>/media_<nombre>/ (imágenes)
# y muestra un resumen: fuentes, colores, tamaño de página, encabezados/pies e imágenes del original.
set -euo pipefail
SRC="${1:?uso: extract.sh <origen.docx> [dir-salida]}"
OUT="${2:-./_extract}"
mkdir -p "$OUT"
NAME="$(basename "$SRC" .docx)"
pandoc "$SRC" -t markdown --wrap=none -o "$OUT/$NAME.md" --extract-media="$OUT/media_$NAME" 2>/dev/null
echo "== $NAME: $(wc -w < "$OUT/$NAME.md") palabras → $OUT/$NAME.md"
TMP="$(mktemp -d)"; unzip -o -q "$SRC" -d "$TMP"
echo "-- fuentes:";  grep -ohE 'w:ascii="[^"]+"' "$TMP"/word/document.xml | sort | uniq -c | sort -rn | head -5 || true
echo "-- página:";   grep -ohE '<w:pgSz[^>]+>' "$TMP"/word/document.xml | head -1 || true
echo "-- partes:";   (ls "$TMP"/word | grep -iE 'header|footer' || echo "   sin encabezado/pie"); (ls "$TMP"/word/media 2>/dev/null || echo "   sin imágenes")
echo "-- tablas:   $(grep -o "<w:tbl>" "$TMP"/word/document.xml | wc -l)"
rm -rf "$TMP"
