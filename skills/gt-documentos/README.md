# gt-documentos

Skill para llevar documentos Word de **Generación Trabajo** (propuestas, informes ejecutivos de
selección, cuadros comparativos, justificaciones técnicas) al formato estándar de marca GT, derivado
de `tokens/theme-generaciontrabajo.css`.

```
SKILL.md                     Procedimiento (lo que ejecuta el agente)
reference/estilo-gt-word.md  Tokens → Word, tipografía, API de componentes, mapeo contenido → componente
scripts/gt-theme.js          Tema docx-js: colores, fuentes, página, encabezado/pie, componentes
scripts/extract.sh           Extrae un .docx de origen a markdown + imágenes y resume su formato
scripts/render.sh            Genera el .docx desde una plantilla, lo limpia, convierte a PDF y rasteriza
assets/logo-gt.png           Logo GT (recortado) para el encabezado
assets/gt-watermark.png      Estrella del logo en tinte teal al 9 % (marca de agua)
templates/*.js               Una plantilla por tipo con contenido de muestra (sin datos reales); se copian y adaptan
.gitignore                   Excluye _work/, _test/ y _extract/ (documentos reales nunca van al repo)
```

Salida: junto al documento original, mismo nombre + sufijo ` - GT.docx`.
Pie de contacto: el skill lo toma del original, de `footer.local.txt` (privado, ignorado por git) o lo
pregunta; el repo solo trae el contacto público de la web.

Instalar en una app/carpeta: `bash skills/install.sh gt-documentos <destino>`.
Usar sin instalar: *"lee `skills/gt-documentos/SKILL.md` de idear-ui y aplica el formato GT a este .docx"*.

Requisitos: Node + paquete `docx` (v9), `pandoc`, LibreOffice y `pdftoppm` (verificación visual).

**Privacidad:** los informes contienen datos personales. Este repo es público: aquí solo viven el tema,
los assets y plantillas de muestra. Los documentos originales y los generados se quedan en la carpeta
del usuario.
