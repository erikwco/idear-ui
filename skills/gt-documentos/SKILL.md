---
name: gt-documentos
description: Convierte un documento Word (.docx) de Generación Trabajo — propuesta de servicios, informe ejecutivo de selección, cuadro comparativo de candidatos, justificación técnica — al formato estándar de marca GT (tokens de idear-ui, logo, encabezado/pie, tablas y tarjetas). Respeta el contenido íntegro, corrige ortografía y puntuación y reporta cada cambio. Usar cuando pidan "formato GT", "aplica la plantilla GT", "dale formato a este informe/propuesta/cuadro", "conviértelo al estándar de Generación Trabajo", o cuando llegue un .docx de GT para presentar.
---

# gt-documentos — formato estándar GT para documentos Word

Toma un `.docx` escrito en Word plano y produce un `.docx` nuevo con la marca **Generación Trabajo**
(teal petróleo, Georgia/Calibri, logo, encabezado, pie, marca de agua) usando `scripts/gt-theme.js`
(docx-js). El original nunca se modifica.

**Contrato:** el contenido se respeta íntegro (frases, cifras, nombres, orden); solo cambian la
presentación y la ortografía/puntuación, y cada corrección se reporta al final.

## Paso 0 — Localiza los recursos del skill

Necesitas `scripts/gt-theme.js`, `assets/logo-gt.png`, `assets/gt-watermark.png`, `templates/*.js`
y `reference/estilo-gt-word.md`. Búscalos en este orden y usa el primero que exista:

1. La carpeta de este skill, si se instaló con todos sus archivos (plugin o `install.sh`): es el
   "Base directory" que se muestra al cargar el skill; comprueba `<esa carpeta>/scripts/gt-theme.js`.
2. Una carpeta `gt-documentos/` dentro de las carpetas conectadas o del proyecto
   (p. ej. `.../skill/gt-documentos/`): `find <carpetas> -path '*gt-documentos/scripts/gt-theme.js'`.
3. El repo del design system: `git clone --depth 1 https://github.com/erikwco/idear-ui` →
   `idear-ui/skills/gt-documentos/`.

Si ninguno existe, detente y pide la carpeta del skill; no reconstruyas el tema de memoria.
Llama `GT=<ruta a gt-documentos>` al directorio encontrado. Requisitos: `node` con el paquete
`docx` (`node -e "require('docx')"`; si falla, `npm install docx` en `$GT`), `pandoc`, LibreOffice
(`soffice`) y `pdftoppm` para verificar.

Lee `$GT/reference/estilo-gt-word.md` (tokens, tipografía, API y tabla de mapeo) antes de mapear.

### Pie de contacto (datos privados: se piden, no se guardan en el repo)

El pie de cada página lleva el contacto de GT: persona responsable, teléfono, correo y web. El repo
**no** lo trae (es público); resuélvelo en este orden antes de generar:

1. Si el documento original trae un bloque de "Datos de contacto", úsalo tal cual (`footerText`).
2. Si no, usa un `footer.local.txt` (una línea, p. ej.
   `Generación Trabajo  ·  Lcda. Nombre Apellido  ·  Tel. 0000-0000  ·  www.generacion.work  ·  correo@dominio`)
   que esté junto al skill (`$GT/footer.local.txt`) o en la carpeta de los documentos (el tema lo lee del
   directorio de trabajo; también acepta la variable de entorno `GT_FOOTER`).
3. Si tampoco existe, **pregunta al usuario** (con AskUserQuestion si está disponible; si no, en texto):
   nombre y título de la persona de contacto, teléfono y correo (la web `www.generacion.work` es fija).
   Luego ofrece guardarlo en `footer.local.txt` para no volver a preguntar: junto al skill si esa
   carpeta es escribible, o en la carpeta de los documentos si el skill está instalado como plugin.
   Si no responde, genera con el pie público por defecto y dilo en el reporte.

Ejecuta `render.sh` desde la carpeta de los documentos (o exporta `GT_FOOTER`) para que el tema
encuentre ese archivo. `footer.local.txt` está en `.gitignore`: nunca lo subas al repo ni lo incluyas
en un plugin.

## Paso 1 — Extrae y entiende el original

```bash
bash $GT/scripts/extract.sh "<origen.docx>" ./_extract
```
Lee el `.md` resultante completo. Si el original tiene imágenes (logo, firmas) revísalas en
`_extract/media_*`. Si hay dudas de lectura (tablas complejas), renderiza el original a imagen:
`soffice --headless --convert-to pdf` + `pdftoppm -jpeg -r 70`.

## Paso 2 — Clasifica el documento y elige la plantilla

| Señales en el original | Tipo | Plantilla base | `docType` | `confidential` |
|---|---|---|---|---|
| Objetivo/Alcance/Inversión/Condiciones/Aprobación, cliente y contacto | Propuesta de servicios | `templates/propuesta.js` | `Propuesta de servicios` | no |
| "Informe ejecutivo", candidato, cargo, pruebas (Beta III, DISC, BIP), dictamen con % | Informe ejecutivo de selección | `templates/informe-ejecutivo.js` | `Informe ejecutivo de selección` | sí |
| Matriz de 2+ candidatos en columnas, análisis por candidato | Cuadro comparativo | `templates/cuadro-comparativo.js` | `Cuadro comparativo` | sí |
| Justificación de pruebas/metodología, puesto evaluado, conclusión | Justificación técnica | `templates/justificacion-tecnica.js` | `Justificación técnica` | no |
| Otro | Memo genérico | la plantilla más parecida (normalmente `justificacion-tecnica.js`) | describe el tipo en 2–3 palabras | según contenga datos de personas |

Copia la plantilla a un directorio de trabajo **junto a** `$GT` (p. ej. `$GT/_work/<nombre>.js`) para
que `require('../scripts/gt-theme')` resuelva, y sustituye el contenido. Las plantillas traen
contenido de muestra con la estructura completa de cada tipo: conserva su orden de componentes y
reemplaza los textos por los del original.

## Paso 3 — Mapea el contenido a componentes

Usa la tabla "Mapeo contenido original → componente" de `reference/estilo-gt-word.md`. Reglas clave:

- **Kicker** siempre `Generación Trabajo · <área>` (propuesta: "Reclutamiento y preselección de
  personal"; informes/cuadros/justificaciones: "Proceso de selección").
- **Título** y **H1/H2** en Tipo oración aunque el original venga en MAYÚSCULAS.
- El bloque inicial de datos (Cliente/Contacto/Fecha o Nombre/Cargo/Fecha/Lugar/Evaluador) va a
  `metaCard`; la celda que no cabe en pareja usa `{ span: 2 }`.
- `docMeta` del encabezado: propuesta → `CLIENTE · Mes Año`; informe → `Cargo · Nombre candidato`;
  cuadro → `Plaza · N aspirantes`; justificación → `Batería · Puesto`.
- Texto corrido con escalas o puntajes → tabla (`dataTable`); métricas sueltas → `statTiles`;
  conclusiones → `callout`; dictamen con % → `statCard`; fortalezas/riesgos → `prosCons`.
- Datos de contacto GT (persona, teléfono, correo, web) → van al pie, no al cuerpo (ver "Pie de
  contacto" en el Paso 0).
- Matrices anchas → sección `landscape` (`gt.setLandscape(true)` antes de construirla, `false` después),
  `splitRows: true`, `compact: true`, `fontSize: 19`; el análisis sigue en sección vertical.
- Anchos de tabla en DXA deben sumar `gt.cw()` (9360 vertical, 12960 horizontal).
- Negrita/cursiva del original se conservan con `**…**` / `*…*` dentro de los strings.
- No agregues texto que no esté en el original (ni frases de cortesía, ni validez, ni notas).
  Excepciones de "chrome" del formato: kicker, etiquetas de componentes (p. ej. "Conclusión general",
  "Fortalezas", "de ajuste al perfil"), pie y línea de confidencialidad.

## Paso 4 — Correcciones de contenido (qué sí y qué no)

**Sí corrige, y anota cada caso en `CORRECCIONES`** (array al inicio del script, como en las plantillas):
ortografía y tildes; mayúsculas/minúsculas; puntuación (comas que unen oraciones, puntos finales
faltantes, espacios antes de `:` o `,`, guiones sueltos, dobles espacios); palabras incompletas
evidentes ("colaborado" → "colaborador"); locuciones incorrectas ("en base a" → "con base en");
numeración de listas que reinicia por error; formato de "Nota1" → "Nota 1"; consistencia de
mayúsculas en cabeceras de tabla; símbolo de moneda faltante cuando el resto de la tabla lo lleva;
y las **convenciones GT** de la sección siguiente (p. ej. "Licda." → "Lcda.").

**No cambies, pero repórtalo como duda:** nombres propios (tildes incluidas), cifras, fechas,
porcentajes, términos técnicos y abreviaturas de pruebas (BIP, DISC, Beta III, escalas),
redacción o sentido, datos que parezcan equivocados (p. ej. un cargo distinto al de la ficha,
sumas que no cuadran). Nunca "mejores" el estilo.

### Convenciones GT de texto (se aplican siempre y se reportan)

| En el original | Se escribe | Motivo |
|---|---|---|
| Licda., Lic., Licenciada | **Lcda.** | Abreviatura oficial de la organización para "Licenciada" |
| Nota1:, Nota2: | Nota 1:, Nota 2: | Espacio entre palabra y número |
| en base a | con base en | Locución correcta |
| Generacion Trabajo, GT (en cuerpo de texto) | Generación Trabajo | Nombre de la marca completo y con tilde |

Cuando el equipo fije una convención nueva, agrégala a esta tabla (y al repo) en vez de corregirla a mano cada vez.

## Paso 5 — Genera y verifica

```bash
export SOFFICE_PY=<ruta a soffice.py del skill docx, si existe>   # opcional
bash $GT/scripts/render.sh "$GT/_work/<nombre>.js" "<salida>/<Nombre> - GT.docx" 70
```
Abre **todas** las páginas JPG y revisa: (1) nada del contenido falta ni cambió de orden; (2) ninguna
tabla/ficha/callout/firma partida entre páginas ni página casi vacía; (3) negritas y ✓/☐/☒ visibles;
(4) encabezado con logo y pie en todas las páginas; (5) sin desbordes (celdas de totales, firma).
Si algo falla, ajusta el script (anchos, `spacer`, `compact`, `splitRows`) y vuelve a renderizar.
Valida el XML si el skill `docx` está disponible: `python scripts/office/validate.py "<salida>.docx"`.

## Paso 6 — Entrega y reporta

- Salida: **en la misma carpeta del original**, con el mismo nombre base y el sufijo ` - GT`
  (`contador/INFORME EJECUTIVO X.docx` → `contador/INFORME EJECUTIVO X - GT.docx`). Si hay carpeta
  conectada escríbelo ahí. El `.pdf` sirve para verificar y se envía al chat; se guarda en disco solo
  si lo piden. El original queda intacto; si ya existe un ` - GT.docx` anterior, se sobrescribe.
- Conserva el script generado (`_work/<nombre>.js`) por si piden ajustes.
- Reporta en el chat, breve: tipo detectado y plantilla usada; páginas; **correcciones aplicadas**
  (lista numerada, "antes → después"); **dudas no corregidas** (nombres, cifras, inconsistencias);
  componentes nuevos que hubo que improvisar (candidatos a entrar al tema).

## Privacidad (obligatorio)

Los documentos contienen datos personales (candidatos, evaluaciones psicológicas, contactos de
clientes y del personal de GT). El repo `idear-ui` es **público**: nunca copies ahí documentos
originales, scripts de `_work/`, salidas generadas, ni nombres/teléfonos/correos reales (ni del
personal de GT: van en `footer.local.txt` o en el script privado). Las plantillas del repo llevan
solo contenido de muestra. `_work/`, `_test/`, `_extract/` y `footer.local.txt` están en el
`.gitignore` del skill. Los resultados se entregan únicamente en
la carpeta del usuario (junto al original) y en el chat.

## Decisiones fijas del formato (no cambiar sin que lo pidan)

Tipo oración en títulos; Georgia + Calibri (fallbacks de Fraunces + Inter); marca de agua activa;
pie con contacto GT; confidencialidad en informes y cuadros; componentes y colores solo de
`gt-theme.js` (no inventes colores: todos derivan de `theme-generaciontrabajo.css`). Si el usuario
pide un cambio de formato permanente (o una convención de texto nueva), aplícalo en `gt-theme.js`,
`estilo-gt-word.md` o la tabla de convenciones de este SKILL.md, no solo en el documento del día. Si
el clon de `idear-ui` está entre las carpetas conectadas, escribe el cambio ahí (`skills/gt-documentos/`)
sin hacer commit; si no, dile al usuario que lo lleve al repo.

## Gotchas

- `rich()` interpreta `**` y `*`: escapa asteriscos literales del contenido o evítalos.
- Cada lista tiene su propia numeración; no reutilices `reference` manualmente.
- `zip -d <docx> '*/'` tras generar (lo hace `render.sh`): Word en la nube rechaza entradas de carpeta.
- Letras ✓/☐/☒ usan "Segoe UI Symbol"; en Mac Word sustituye solo. No las pongas como texto literal
  en viñetas: usa `checklist`/`option`.
- Si LibreOffice no está, entrega el `.docx` igualmente y dilo; no inventes que se verificó.
