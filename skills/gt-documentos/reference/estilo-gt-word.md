# Estilo GT para documentos Word — referencia

Traducción del tema `idear-ui/tokens/theme-generaciontrabajo.css` (oklch, Tailwind) a un documento
Word. Es la especificación que implementa `scripts/gt-theme.js`; si cambias un valor aquí, cámbialo
también en el script.

## 1. Tokens → Word (hex, modo claro)

| Token idear-ui | Hex | Uso en el documento |
|---|---|---|
| `--brand-800` | `#1B3E48` | Título del documento, valores destacados |
| `--brand-700` / `--primary` | `#234F5C` | Encabezados H1, cabeceras de tabla, celda del dictamen, borde izquierdo del callout de totales |
| `--brand-600` | `#275E6D` | Encabezados H2, números de listas numeradas, línea "Generación Trabajo" bajo la firma |
| `--brand-500` | `#357686` | Kicker, etiquetas en mayúsculas pequeñas, viñetas ✓ y •, borde izquierdo de fichas/callouts, segunda línea del pie |
| `--brand-400` | `#5494A3` | Líneas de firma |
| `--brand-200` | `#B2DBE2` | Regla bajo H1 y bajo el encabezado de página; subtítulo en cabeceras de tabla |
| `--brand-50` | `#ECF8FA` | Fondo de ficha de datos, indicadores, callout, lado derecho del dictamen, fila destacada |
| `--accent-amber` | `#F6A92F` | Barra de acento bajo el título (solo decorativa; nunca como texto) |
| `--foreground` | `#211F1C` | Texto de cuerpo |
| `--muted-foreground` | `#76716E` | Notas, metadatos del encabezado, pie de página, subtítulos |
| `--secondary` / `--muted` | `#F4F3F0` | Zebra de tablas, primera columna de tablas de escalas |
| `--border` | `#E6E3E1` | Líneas internas de tablas, regla del pie |
| `--success` | `#268956` | Etiqueta "Fortalezas" (tinte de fondo derivado `#E9F4EE`) |
| `--warning` | `#C88021` | Etiqueta "Riesgos" (tinte de fondo derivado `#F9F2E9`) |
| `--destructive` | `#E7000B` | Reservado (no se usa en los documentos actuales) |

Los tintes `success/warning` al 10 % sobre blanco son derivados para Word; no existen en el tema CSS.

## 2. Tipografía

| Rol | Token | En Word | Tamaño |
|---|---|---|---|
| Display (título, H1, cifras grandes) | `--font-display: Fraunces` | **Georgia** (fallback declarado en el token) | Título 20 pt · H1 13.5 pt · cifra 28 pt |
| Cuerpo | `--font-sans: Inter` | **Calibri** | 11 pt, interlineado 1.15, espacio después 7 pt |
| H2 / H3 | sans | Calibri negrita | 11.5 pt (brand-600) / 11 pt (foreground) |
| Etiquetas (kicker, labels de ficha, cabecera de página) | sans | Calibri negrita, MAYÚSCULAS, tracking +1.5 pt | 7.5–8.5 pt |
| Tablas | sans | Calibri | 10 pt (9.5 pt en matrices compactas) |
| Notas y pie | sans | Calibri | 9 pt / 7.5 pt |
| Símbolos ✓ ☐ ☒ | — | Segoe UI Symbol (Word sustituye si falta) | — |

Se usan los fallbacks (Georgia/Calibri) para que el documento se vea igual en cualquier equipo sin
instalar fuentes. Si el equipo instala Fraunces e Inter, cambia `F.display`/`F.body` en `gt-theme.js`.

## 3. Página

- US Letter. Márgenes: izq/der 1", superior 1.62" (deja sitio al encabezado), inferior 1.04".
  En secciones horizontales: superior 1.49", inferior 0.9".
- **Encabezado** (todas las páginas): logo GT (0.57" × 0.73") a la izquierda; a la derecha, tipo de
  documento en mayúsculas pequeñas (brand-500) y una línea de metadatos (cliente/candidato · fecha o
  plaza) en gris; regla inferior brand-200.
- **Marca de agua**: estrella del logo en tinte brand-500 al 9 %, 3.85", anclada abajo a la derecha
  sangrando por el borde, detrás del texto. Se puede desactivar con `watermark: false`.
- **Pie**: regla superior; izquierda datos de contacto GT (`footerText` del documento, o `footer.local.txt`,
  o el contacto público por defecto), derecha "Página X de Y".
  Con `confidential: true` se añade una segunda línea "DOCUMENTO CONFIDENCIAL · USO EXCLUSIVO DEL
  PROCESO DE SELECCIÓN" (informes y cuadros sí; propuestas no).

## 4. Componentes (API de `gt-theme.js`)

| Componente | Cuándo | Firma |
|---|---|---|
| `kicker(t)` | Línea sobre el título: "Generación Trabajo · <área>" | string |
| `title(t)` / `subtitle(t)` | Título del documento (Tipo oración) / aclaración en gris | string |
| `accentBar()` | Barra ámbar corta bajo el título (propuestas e informes) | — |
| `metaCard(items, {columns})` | Ficha de datos al inicio (cliente, candidato, puesto…) | `[[label, value, {span?}], …]` |
| `h1/h2/h3(t)` | Secciones / subsecciones / bloques | string con `**negrita**` opcional |
| `p(t, {keepNext, align, run})` | Párrafo | string con `**negrita**` / `*cursiva*` |
| `def(label, value)` | "Etiqueta: valor" (Concepto, Honorario…) | strings |
| `bullets / numbered / checklist(items)` | Listas • / 1. / ✓ | string[] |
| `option(t, checked)` | Sub-opción ☐/☒ indentada | string, bool |
| `statTiles(items)` | Fila de indicadores (PD, CI, percentil…) | `[{value, label, sub?}]` |
| `dataTable({header, rows, widths, align, firstColStrong, zebra, emphasizeLast, splitRows, compact, fontSize})` | Cualquier tabla; cabecera puede ser `string[]` por columna (2 líneas); celdas `string`, `string[]` (viñetas) o `{paras:[…]}` | `widths` en DXA, suma = `cw()` |
| `totals(rows, {width})` | Bloque de totales alineado a la derecha | `[[label, value, {total?, strong?, muted?}]]` |
| `callout(texts, {label, tone})` | Conclusiones / párrafos clave | string \| string[]; tone brand/success/warning/neutral |
| `statCard({value, caption, text})` | Dictamen con % grande | strings / string[] |
| `prosCons({pros, cons, prosLabel, consLabel})` | Fortalezas vs riesgos | string \| string[] cada lado |
| `signatureFields(fields)` | Firma del cliente (líneas) | string[] |
| `signedBy(name, role, org?)` | Firma de la evaluadora | strings (devuelve Paragraph[]) |
| `note(t)` | Notas al pie del cuerpo ("**Nota 1:** …") | string |
| `spacer(dxa)` / `pageBreak()` | Espacio vertical / salto | — |
| `setLandscape(bool)` + `cw()` | Antes de construir una sección horizontal; ancho de contenido actual | — |
| `makeDocument({docType, docMeta, children \| sections:[{landscape, children}], confidential, watermark, footerText, title})` | Ensambla el documento | — |

Reglas de paginación ya incorporadas: filas de tabla, fichas, callouts, dictamen y firma no se
parten entre páginas (`cantSplit`); las cabeceras de tabla se repiten; `splitRows: true` solo para
matrices muy largas.

## 5. Mapeo contenido original → componente

| En el original (Word plano) | Componente GT |
|---|---|
| Título en negrita / mayúsculas al inicio | `kicker` + `title` (+ `subtitle`) + `accentBar` |
| Bloque inicial "Etiqueta: valor" (Nombre, Cargo, Fecha, Cliente, Contacto…) | `metaCard` (2 columnas; celda ancha con `{span: 2}`) |
| Encabezado en MAYÚSCULAS/negrita de sección | `h1` en Tipo oración |
| Sub-bloques numerados o en negrita dentro de una sección | `h2` → `h3` |
| Lista con ✓ | `checklist`; opciones "X usar / no usar" → `option(…, checked)` |
| Viñetas • o a) b) | `bullets`; 1. 2. 3. → `numbered` |
| "Concepto: … / Honorario: …" | `def` |
| Métricas sueltas (PD, CI, Percentil, Clasificación) | `statTiles` + `note` para la explicación |
| Escalas "**Nombre (Abrev = N):** interpretación" | `dataTable` Escala · Punt. · Interpretación, `firstColStrong` |
| Resultados por prueba "Test 1: Series (PD 8/12 – 66.7%): texto" | `dataTable` Prueba · PD · % · Interpretación |
| Tabla de costos | `dataTable` + `totals` (fila TOTAL con `{total:true}`) + `note` del CCF |
| Matriz de candidatos (4+ columnas con texto largo) | sección `landscape` + `dataTable` con cabeceras de 2 líneas, `splitRows`, `compact`, `fontSize: 19` |
| "Conclusión general…" | `callout(texto, {label})` |
| Dictamen con porcentaje de ajuste | `statCard({value:'84 %', caption:'de ajuste al perfil', text:[…]})` + párrafos restantes con `p` |
| Fortalezas / Riesgos por candidato | `h2` + `p` intro + `prosCons` |
| "Nota1:", "Nota2:" | `note('**Nota 1:** …')` |
| "Atentamente, Licda. X – Psicóloga" | `signedBy('Lcda. X', 'Psicóloga')` (siempre "Lcda.") |
| Líneas de firma del cliente (Nombre, Cargo, Firma, Fecha) | `h1('Aprobación del servicio')` + `signatureFields` |
| Datos de contacto al final | van al pie (`DEFAULT_FOOTER`); no se repiten en el cuerpo |

## 6. Decisiones fijas (no cambiar sin que lo pidan)

1. Títulos y encabezados en **Tipo oración** (no MAYÚSCULAS), aunque el original venga en mayúsculas.
2. El contenido se **respeta íntegro**: mismas frases, cifras, porcentajes, nombres, orden de secciones.
   Solo cambia la presentación (texto corrido → tabla/tarjeta) y la ortografía/puntuación.
3. Marca de agua activa; pie con contacto GT en todas las páginas; línea de confidencialidad en
   informes y cuadros comparativos.
4. Georgia + Calibri como fuentes (fallbacks de Fraunces + Inter).
5. Un documento = un script en `templates/` copiado y adaptado; nunca se edita el `.docx` original.
6. Abreviatura de "Licenciada": **Lcda.** (nunca "Licda."). La salida va junto al original con sufijo ` - GT`.
