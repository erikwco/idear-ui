/**
 * gt-theme.js — Tema "Generación Trabajo" para documentos Word (docx-js).
 *
 * Traduce los tokens de idear-ui/tokens/theme-generaciontrabajo.css (oklch) a
 * hex y los expone como estilos y componentes reutilizables para cualquier
 * documento GT (propuesta, informe ejecutivo, cuadro comparativo, …).
 *
 * Uso:
 *   const gt = require('./gt-theme');
 *   const doc = gt.makeDocument({
 *     docType: 'Propuesta de servicios', docMeta: 'CLIENTE · Mes Año',
 *     children: [ gt.kicker('…'), gt.title('…'), … ],          // una sección vertical
 *     // o bien: sections: [{ landscape: true, children: […] }, { children: […] }]
 *   });
 *   fs.writeFileSync('out.docx', await Packer.toBuffer(doc));
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, Footer,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat, TabStopType,
  PageNumber, VerticalAlign, HeadingLevel, HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom, TextWrappingType, PageBreak, PageOrientation,
} = require('docx');

// ---------------------------------------------------------------------------
// 1. TOKENS (hex derivados de theme-generaciontrabajo.css, :root / light)
// ---------------------------------------------------------------------------
const C = {
  brand50: 'ECF8FA', brand100: 'D5EEF2', brand200: 'B2DBE2', brand300: '82BAC5',
  brand400: '5494A3', brand500: '357686', brand600: '275E6D', brand700: '234F5C',
  brand800: '1B3E48', brand900: '16323B',
  amber: 'F6A92F',
  background: 'FBFAF9', foreground: '211F1C', card: 'FFFFFF',
  primary: '234F5C', primaryFg: 'F6FBFB',
  secondary: 'F4F3F0', secondaryFg: '353230',
  muted: 'F4F3F0', mutedFg: '76716E',
  accent: 'E8F5F7', accentFg: '234F5C',
  destructive: 'E7000B', success: '268956', warning: 'C88021',
  // tintes derivados (10 % sobre blanco) para paneles de estado
  successTint: 'E9F4EE', warningTint: 'F9F2E9', destructiveTint: 'FDE6E7',
  border: 'E6E3E1', input: 'E9E7E4',
  white: 'FFFFFF',
};

// Tipografía: el contrato GT es Fraunces (display) + Inter (cuerpo). En Word
// usamos sus fallbacks declarados en el token para que el documento se vea
// igual en cualquier máquina: Georgia (serif con autoridad) + Calibri.
// Si el equipo instala Fraunces/Inter, basta cambiar estas dos líneas.
const F = {
  display: 'Georgia',
  body: 'Calibri',
  symbol: 'Segoe UI Symbol', // ✓ ☐ ☒ — Word sustituye si no existe
};

// Página US Letter, medidas en DXA (1440 = 1")
const LETTER = { width: 12240, height: 15840 };
const MARGIN = { top: 2330, right: 1440, bottom: 1500, left: 1440, header: 560, footer: 600 };

// Ancho de contenido actual (cambia con la orientación de la sección que se está construyendo)
const ctx = { landscape: false };
const pageDims = (landscape) => landscape ? { width: LETTER.height, height: LETTER.width } : LETTER;
const cw = () => pageDims(ctx.landscape).width - MARGIN.left - MARGIN.right; // 9360 vertical / 12960 horizontal
const setLandscape = (v) => { ctx.landscape = !!v; };
const CONTENT_WIDTH = cw();

const ASSETS = {
  logo: path.join(__dirname, '..', 'assets', 'logo-gt.png'),
  watermark: path.join(__dirname, '..', 'assets', 'gt-watermark.png'),
};

// ---------------------------------------------------------------------------
// 2. Helpers de texto enriquecido: "texto **negrita** y *cursiva*" → TextRun[]
// ---------------------------------------------------------------------------
function rich(text, base = {}) {
  if (Array.isArray(text)) return text; // ya son TextRun
  const runs = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith('**')) runs.push(new TextRun({ ...base, text: tok.slice(2, -2), bold: true }));
    else runs.push(new TextRun({ ...base, text: tok.slice(1, -1), italics: true }));
    last = m.index + tok.length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), ...base }));
  return runs;
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
  insideHorizontal: noBorder, insideVertical: noBorder };
const line = (color = C.border, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const fill = (hex) => ({ type: ShadingType.CLEAR, fill: hex, color: 'auto' });
const BODY = { font: F.body, size: 22, color: C.foreground };

// ---------------------------------------------------------------------------
// 3. Numeraciones (viñetas, checks, numeradas). Cada lista usa su propia
//    referencia para que las numeradas reinicien en 1.
// ---------------------------------------------------------------------------
const numberingConfigs = [];
let listSeq = 0;
function registerNumbering(kind, indentLeft = 540) {
  const ref = `${kind}-${++listSeq}`;
  const base = { level: 0, alignment: AlignmentType.LEFT };
  if (kind === 'bullet') {
    numberingConfigs.push({ reference: ref, levels: [{ ...base, format: LevelFormat.BULLET, text: '•',
      style: { run: { color: C.brand500, font: F.body }, paragraph: { indent: { left: indentLeft, hanging: 300 } } } }] });
  } else if (kind === 'check') {
    numberingConfigs.push({ reference: ref, levels: [{ ...base, format: LevelFormat.BULLET, text: '✓',
      style: { run: { color: C.brand500, font: F.symbol, bold: true }, paragraph: { indent: { left: indentLeft, hanging: 340 } } } }] });
  } else {
    numberingConfigs.push({ reference: ref, levels: [{ ...base, format: LevelFormat.DECIMAL, text: '%1.',
      style: { run: { color: C.brand600, bold: true, font: F.body }, paragraph: { indent: { left: indentLeft, hanging: 360 } } } }] });
  }
  return ref;
}

// ---------------------------------------------------------------------------
// 4. COMPONENTES DE TEXTO
// ---------------------------------------------------------------------------

/** Etiqueta pequeña en mayúsculas sobre el título ("GENERACIÓN TRABAJO · …") */
function kicker(text) {
  return new Paragraph({ spacing: { before: 0, after: 100 },
    children: [new TextRun({ text: text.toUpperCase(), font: F.body, size: 17, bold: true, color: C.brand500, characterSpacing: 30 })] });
}

/** Barra de acento ámbar corta (decorativa) */
function accentBar() {
  return new Table({ width: { size: 720, type: WidthType.DXA }, columnWidths: [720], borders: NO_BORDERS,
    rows: [new TableRow({ height: { value: 60, rule: 'exact' }, children: [new TableCell({
      width: { size: 720, type: WidthType.DXA }, shading: fill(C.amber), margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({ spacing: { before: 0, after: 0, line: 60, lineRule: 'exact' }, children: [new TextRun({ text: '', size: 4 })] })] })] })] });
}

/** Título principal del documento */
function title(text) {
  return new Paragraph({ heading: HeadingLevel.TITLE, spacing: { before: 120, after: 200 },
    children: rich(text, { font: F.display, size: 40, color: C.brand800 }) });
}

/** Subtítulo bajo el título (opcional) */
function subtitle(text) {
  return new Paragraph({ spacing: { before: 0, after: 240 }, children: rich(text, { font: F.body, size: 23, color: C.mutedFg }) });
}

/** Encabezado de sección (H1) con regla inferior teal claro */
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 140 }, keepNext: true,
    border: { bottom: line(C.brand200, 6) }, children: rich(text, { font: F.display, size: 27, color: C.brand700 }) });
}

/** Subencabezado (H2) */
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 80 }, keepNext: true,
    children: rich(text, { font: F.body, size: 23, bold: true, color: C.brand600 }) });
}

/** Sub-subencabezado (H3) */
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 60 }, keepNext: true,
    children: rich(text, { font: F.body, size: 22, bold: true, color: C.foreground }) });
}

/** Párrafo de cuerpo. Acepta "**negrita**" inline. */
function p(text, opts = {}) {
  return new Paragraph({ spacing: { before: 0, after: 140, line: 276 }, alignment: opts.align || AlignmentType.LEFT,
    keepNext: opts.keepNext, children: rich(text, { ...BODY, ...(opts.run || {}) }) });
}

/** Párrafo "Etiqueta: valor" (definición) */
function def(label, value) {
  return new Paragraph({ spacing: { before: 0, after: 100, line: 276 }, children: [
    new TextRun({ text: `${label}: `, font: F.body, size: 22, bold: true, color: C.brand700 }), ...rich(value, BODY) ] });
}

/** Texto pequeño atenuado (notas, aclaraciones). Acepta "**Nota 1:** texto". */
function note(text) {
  return new Paragraph({ spacing: { before: 60, after: 100, line: 260 }, children: rich(text, { font: F.body, size: 18, color: C.mutedFg }) });
}

function makeList(items, kind, opts = {}) {
  const ref = registerNumbering(kind, opts.indent);
  const size = opts.size || 22;
  return items.map((it, i) => new Paragraph({ numbering: { reference: ref, level: 0 },
    spacing: { before: 0, after: i === items.length - 1 ? (opts.afterLast ?? 160) : (opts.after ?? 70), line: opts.line ?? 276 },
    children: rich(it, { ...BODY, size }) }));
}
const bullets = (items, opts) => makeList(items, 'bullet', opts);
const checklist = (items, opts) => makeList(items, 'check', opts);
const numbered = (items, opts) => makeList(items, 'number', opts);

/** Opción tipo casilla: ☐ / ☒ (indentada; para sub-opciones de un ítem) */
function option(text, checked, indent = 1080) {
  return new Paragraph({ indent: { left: indent }, spacing: { before: 0, after: 60 }, children: [
    new TextRun({ text: checked ? '☒' : '☐', font: F.symbol, size: 22, color: checked ? C.brand700 : C.mutedFg }),
    new TextRun({ text: '  ' + text, font: F.body, size: 22, color: checked ? C.foreground : C.mutedFg, bold: checked }) ] });
}

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const spacer = (after = 200) => new Paragraph({ spacing: { before: 0, after }, children: [new TextRun('')] });

// Contenido de celda: string → párrafo; string[] → viñetas; {paras:[…]} → párrafos
function cellContent(content, run = { ...BODY, size: 20 }, { bulletIndent = 260, alignment, line = 260 } = {}) {
  if (Array.isArray(content)) {
    const ref = registerNumbering('bullet', bulletIndent);
    return content.map((t, i) => new Paragraph({ numbering: { reference: ref, level: 0 },
      spacing: { before: 0, after: i === content.length - 1 ? 0 : 50, line }, children: rich(t, run) }));
  }
  if (content && typeof content === 'object' && content.paras) {
    return content.paras.map((t, i) => new Paragraph({ alignment, spacing: { before: 0, after: i === content.paras.length - 1 ? 0 : 80, line }, children: rich(t, run) }));
  }
  return [new Paragraph({ alignment, spacing: { before: 0, after: 0, line }, children: rich(String(content ?? ''), run) })];
}

// ---------------------------------------------------------------------------
// 5. COMPONENTES DE BLOQUE
// ---------------------------------------------------------------------------

/**
 * Tarjeta de metadatos (cliente / candidato).
 * items: [label, value] | [label, value, { span: 2 }]  — se acomodan en `columns` columnas.
 */
function metaCard(items, { columns = 2 } = {}) {
  const W = cw();
  const colW = Math.floor(W / columns);
  const widths = Array(columns).fill(colW); widths[columns - 1] = W - colW * (columns - 1);
  const mkCell = (label, value, span) => new TableCell({
    width: { size: colW * span, type: WidthType.DXA }, columnSpan: span > 1 ? span : undefined,
    shading: fill(C.brand50), margins: { top: 120, bottom: 120, left: 200, right: 160 },
    children: [
      new Paragraph({ spacing: { before: 0, after: 30 }, children: [new TextRun({ text: label.toUpperCase(), font: F.body, size: 15, bold: true, color: C.brand500, characterSpacing: 20 })] }),
      new Paragraph({ spacing: { before: 0, after: 0 }, children: rich(value, { font: F.body, size: 21, color: C.foreground, bold: true }) }),
    ] });
  const rows = []; let cur = [], used = 0;
  for (const [label, value, o = {}] of items) {
    const span = Math.min(o.span || 1, columns);
    if (used + span > columns) { rows.push(cur); cur = []; used = 0; }
    cur.push(mkCell(label, value, span)); used += span;
  }
  if (cur.length) rows.push(cur);
  const tableRows = rows.map((cells) => {
    const spanUsed = cells.reduce((a, c) => a + (c.options.columnSpan || 1), 0);
    const padded = [...cells];
    for (let k = spanUsed; k < columns; k++) padded.push(new TableCell({ width: { size: colW, type: WidthType.DXA }, shading: fill(C.brand50), children: [new Paragraph('')] }));
    return new TableRow({ cantSplit: true, children: padded });
  });
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths,
    borders: { ...NO_BORDERS, left: { style: BorderStyle.SINGLE, size: 24, color: C.brand500 } }, rows: tableRows });
}

/**
 * Fila de indicadores (KPI). items: [{ value, label, sub? }]
 * value corto → grande en serif; value largo (texto) → tamaño medio.
 */
function statTiles(items) {
  const W = cw(); const n = items.length; const colW = Math.floor(W / n);
  const widths = Array(n).fill(colW); widths[n - 1] = W - colW * (n - 1);
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths,
    borders: { ...NO_BORDERS, insideVertical: { style: BorderStyle.SINGLE, size: 12, color: C.white } },
    rows: [new TableRow({ cantSplit: true, children: items.map(({ value, label, sub }, i) => {
      const long = String(value).length > 10;
      return new TableCell({ width: { size: widths[i], type: WidthType.DXA }, shading: fill(C.brand50), verticalAlign: VerticalAlign.CENTER,
        margins: { top: 160, bottom: 160, left: 180, right: 160 },
        children: [
          new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: label.toUpperCase(), font: F.body, size: 15, bold: true, color: C.brand500, characterSpacing: 20 })] }),
          new Paragraph({ spacing: { before: 0, after: sub ? 30 : 0 }, children: [new TextRun({ text: String(value), font: long ? F.body : F.display, size: long ? 22 : 40, bold: true, color: C.brand800 })] }),
          ...(sub ? [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: sub, font: F.body, size: 17, color: C.mutedFg })] })] : []),
        ] });
    }) })] });
}

/** Panel destacado (conclusiones). texts: string | string[]; label opcional en mayúsculas. */
function callout(texts, { label, tone = 'brand' } = {}) {
  const W = cw();
  const tones = { brand: [C.brand50, C.brand500, C.brand700], success: [C.successTint, C.success, C.success],
    warning: [C.warningTint, C.warning, C.warning], neutral: [C.secondary, C.mutedFg, C.mutedFg] };
  const [bg, bar, labelColor] = tones[tone] || tones.brand;
  const paras = (Array.isArray(texts) ? texts : [texts]);
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    borders: { ...NO_BORDERS, left: { style: BorderStyle.SINGLE, size: 24, color: bar } },
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: W, type: WidthType.DXA }, shading: fill(bg),
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        ...(label ? [new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: label.toUpperCase(), font: F.body, size: 15, bold: true, color: labelColor, characterSpacing: 20 })] })] : []),
        ...paras.map((t, i) => new Paragraph({ spacing: { before: 0, after: i === paras.length - 1 ? 0 : 100, line: 276 }, children: rich(t, { ...BODY, size: 21 }) })),
      ] })] })] });
}

/**
 * Tabla de datos.
 *  header: (string | string[])[]   — string[] = varias líneas en la cabecera (1ª en negrita)
 *  rows:   (string | string[] | {paras})[][]
 *  widths: DXA[] (suma = ancho de contenido);  align: ('left'|'right'|'center')[]
 *  firstColStrong: resalta la primera columna (etiquetas de fila)
 *  splitRows: permite que una fila larga continúe en la página siguiente (matrices)
 */
function dataTable({ header, rows, widths, align = [], emphasizeLast = false, firstColStrong = false, zebra = true, fontSize = 20, splitRows = false, compact = false }) {
  const padY = compact ? 60 : 90, lineH = compact ? 240 : 260;
  const total = widths.reduce((a, b) => a + b, 0);
  const al = (i) => align[i] === 'right' ? AlignmentType.RIGHT : align[i] === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT;
  const headRow = new TableRow({ tableHeader: true, children: header.map((h, i) => {
    const lines = Array.isArray(h) ? h : [h];
    return new TableCell({ width: { size: widths[i], type: WidthType.DXA }, shading: fill(C.brand700),
      margins: { top: 100, bottom: 100, left: 140, right: 140 }, verticalAlign: VerticalAlign.CENTER,
      children: lines.map((ln, li) => new Paragraph({ alignment: al(i), spacing: { before: 0, after: li === lines.length - 1 ? 0 : 20 },
        children: [new TextRun({ text: ln, font: F.body, size: li === 0 ? 19 : 17, bold: li === 0, color: li === 0 ? C.white : C.brand200 })] })) });
  }) });
  const bodyRows = rows.map((r, ri) => {
    const isLast = emphasizeLast && ri === rows.length - 1;
    return new TableRow({ cantSplit: !splitRows, children: r.map((cell, i) => {
      const strong = (firstColStrong && i === 0) || isLast;
      const shade = isLast ? fill(C.brand50) : (firstColStrong && i === 0) ? fill(C.secondary) : (zebra && ri % 2 === 1 ? fill(C.secondary) : undefined);
      return new TableCell({ width: { size: widths[i], type: WidthType.DXA }, shading: shade,
        margins: { top: padY, bottom: padY, left: 140, right: 140 }, verticalAlign: VerticalAlign.TOP,
        children: cellContent(cell, { font: F.body, size: fontSize, color: strong ? C.brand800 : C.foreground, bold: strong }, { alignment: al(i), line: lineH }) });
    }) });
  });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    borders: { top: line(C.border), bottom: line(C.brand700, 8), left: noBorder, right: noBorder, insideHorizontal: line(C.border), insideVertical: noBorder },
    rows: [headRow, ...bodyRows] });
}

/** Bloque de totales alineado a la derecha. rows: [[label, value, {total?, muted?, strong?}], …] */
function totals(rows, { width = 5400 } = {}) {
  const labelW = Math.round(width * 0.62), valueW = width - labelW;
  const indentLeft = cw() - width;
  const trs = rows.map(([label, value, o = {}]) => {
    const color = o.total ? C.white : (o.muted ? C.mutedFg : C.foreground);
    const mk = (text, right, size, bold) => new TableCell({ width: { size: right ? valueW : labelW, type: WidthType.DXA },
      shading: o.total ? fill(C.brand700) : undefined, margins: { top: o.total ? 110 : 70, bottom: o.total ? 110 : 70, left: right ? 120 : 160, right: right ? 160 : 120 },
      children: [new Paragraph({ alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT, spacing: { before: 0, after: 0 },
        children: [new TextRun({ text, font: F.body, size, bold, color })] })] });
    return new TableRow({ children: [mk(label, false, o.total ? 21 : 20, !!o.total), mk(value, true, o.total ? 23 : 20, !!o.total || !!o.strong)] });
  });
  return new Table({ width: { size: width, type: WidthType.DXA }, columnWidths: [labelW, valueW], indent: { size: indentLeft, type: WidthType.DXA },
    borders: { ...NO_BORDERS, insideHorizontal: line(C.border) }, rows: trs });
}

/** Bloque de firma del cliente: campos con línea. fields: string[] */
function signatureFields(fields, { labelWidth = 4100 } = {}) {
  const W = cw(); const lineW = W - labelWidth;
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [labelWidth, lineW], borders: NO_BORDERS,
    rows: fields.map((f) => new TableRow({ height: { value: 560, rule: 'atLeast' }, children: [
      new TableCell({ width: { size: labelWidth, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM, margins: { top: 60, bottom: 60, left: 0, right: 120 },
        children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: f, font: F.body, size: 21, color: C.foreground })] })] }),
      new TableCell({ width: { size: lineW, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM, borders: { bottom: line(C.brand400, 6) }, margins: { top: 60, bottom: 60, left: 0, right: 0 },
        children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: ' ', size: 21 })] })] }) ] })) });
}

/** Firma de la persona responsable (informes). */
function signedBy(name, role, org = 'Generación Trabajo') {
  return [
    new Paragraph({ spacing: { before: 320, after: 0 }, keepNext: true, keepLines: true, children: [new TextRun({ text: 'Atentamente,', ...BODY })] }),
    new Paragraph({ spacing: { before: 480, after: 0 }, keepNext: true, keepLines: true, border: { top: line(C.brand400, 6) }, indent: { right: cw() - 3800 },
      children: [new TextRun({ text: name, font: F.body, size: 22, bold: true, color: C.brand800 })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, keepNext: true, keepLines: true, children: [new TextRun({ text: role, font: F.body, size: 20, color: C.mutedFg })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: org, font: F.body, size: 20, color: C.brand600 })] }),
  ];
}

/** Tarjeta destacada (dictamen): valor grande a la izquierda, texto a la derecha */
function statCard({ value, caption, text }) {
  const W = cw(); const leftW = 2600, rightW = W - leftW;
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [leftW, rightW], borders: NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: leftW, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, shading: fill(C.brand700), margins: { top: 200, bottom: 200, left: 200, right: 200 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: value, font: F.display, size: 56, bold: true, color: C.white })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: caption.toUpperCase(), font: F.body, size: 15, bold: true, color: C.brand200, characterSpacing: 20 })] }) ] }),
      new TableCell({ width: { size: rightW, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, shading: fill(C.brand50), margins: { top: 200, bottom: 200, left: 240, right: 240 },
        children: (Array.isArray(text) ? text : [text]).map((t, i, arr) => new Paragraph({ spacing: { before: 0, after: i === arr.length - 1 ? 0 : 100, line: 276 }, children: rich(t, { ...BODY, size: 21 }) })) }) ] })] });
}

/** Fortalezas / Riesgos lado a lado. pros, cons: string[] */
function prosCons({ pros, cons, prosLabel = 'Fortalezas', consLabel = 'Riesgos en el puesto' }) {
  const W = cw(); const half = Math.floor(W / 2);
  const mk = (label, items, bg, color, width) => new TableCell({ width: { size: width, type: WidthType.DXA }, shading: fill(bg), verticalAlign: VerticalAlign.TOP,
    margins: { top: 140, bottom: 160, left: 200, right: 200 },
    children: [
      new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: label.toUpperCase(), font: F.body, size: 15, bold: true, color, characterSpacing: 20 })] }),
      ...cellContent(items, { ...BODY, size: 20 }, { bulletIndent: 240 }) ] });
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [half, W - half],
    borders: { ...NO_BORDERS, insideVertical: { style: BorderStyle.SINGLE, size: 12, color: C.white } },
    rows: [new TableRow({ cantSplit: true, children: [mk(prosLabel, pros, C.successTint, C.success, half), mk(consLabel, cons, C.warningTint, C.warning, W - half)] })] });
}

// ---------------------------------------------------------------------------
// 6. ENCABEZADO / PIE / MARCA DE AGUA
// ---------------------------------------------------------------------------
function buildHeader({ docType, docMeta, watermark = true, landscape = false }) {
  const W = pageDims(landscape).width - MARGIN.left - MARGIN.right;
  const pg = pageDims(landscape);
  const logo = fs.readFileSync(ASSETS.logo);
  const children = [];
  if (watermark) {
    const wm = fs.readFileSync(ASSETS.watermark);
    const inch = 914400; const wIn = 3.85;
    children.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ type: 'png', data: wm,
      transformation: { width: Math.round(wIn * 96), height: Math.round(wIn * 96 * 699 / 713) },
      floating: {
        horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: Math.round(inch * (pg.width / 1440 - 2.6)) },
        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(inch * (pg.height / 1440 - 3.6)) },
        wrap: { type: TextWrappingType.NONE }, behindDocument: true, allowOverlap: true, zIndex: 0 } })] }));
  }
  const logoW = 1300, textW = W - logoW;
  children.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [logoW, textW], borders: { ...NO_BORDERS, bottom: line(C.brand200, 6) },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: logoW, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 100, left: 0, right: 0 },
        children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 55, height: 70 } })] })] }),
      new TableCell({ width: { size: textW, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 120, left: 0, right: 0 },
        children: [
          new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 30 }, children: [new TextRun({ text: docType.toUpperCase(), font: F.body, size: 16, bold: true, color: C.brand500, characterSpacing: 30 })] }),
          ...(docMeta ? [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: docMeta, font: F.body, size: 16, color: C.mutedFg })] })] : []) ] }) ] })] }));
  return new Header({ children });
}

function buildFooter({ footerText, confidentialText, landscape = false }) {
  const W = pageDims(landscape).width - MARGIN.left - MARGIN.right;
  const r = (text) => new TextRun({ text, font: F.body, size: 15, color: C.mutedFg });
  const children = [new Paragraph({ border: { top: line(C.border, 4) }, spacing: { before: 0, after: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: W }],
    children: [r(footerText), r('\tPágina '), new TextRun({ children: [PageNumber.CURRENT], font: F.body, size: 15, color: C.mutedFg }), r(' de '),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: F.body, size: 15, color: C.mutedFg })] })];
  if (confidentialText) children.push(new Paragraph({ spacing: { before: 40, after: 0 },
    children: [new TextRun({ text: confidentialText.toUpperCase(), font: F.body, size: 14, bold: true, color: C.brand500, characterSpacing: 20 })] }));
  return new Footer({ children });
}

const CONFIDENTIAL_TEXT = 'Documento confidencial · Uso exclusivo del proceso de selección';

// Pie por defecto: contacto público de la marca. El contacto real que GT imprime en sus documentos
// (persona, teléfono, correo) NO va en el repo: se lee de `footer.local.txt` junto a este skill
// (ignorado por git) o se pasa como `footerText` a makeDocument (tomado del documento original).
const PUBLIC_FOOTER = 'Generación Trabajo  ·  www.generacion.work  ·  gerencia@generacion.work';
// Orden: variable GT_FOOTER → footer.local.txt junto al skill → footer.local.txt en el cwd (carpeta
// de los documentos, útil cuando el skill está instalado como plugin de solo lectura) → público.
function loadLocalFooter() {
  if (process.env.GT_FOOTER && process.env.GT_FOOTER.trim()) return process.env.GT_FOOTER.trim();
  for (const f of [path.join(__dirname, '..', 'footer.local.txt'), path.join(process.cwd(), 'footer.local.txt')]) {
    try { if (fs.existsSync(f)) { const t = fs.readFileSync(f, 'utf8').trim(); if (t) return t; } } catch (_) { /* siguiente */ }
  }
  return PUBLIC_FOOTER;
}
const DEFAULT_FOOTER = loadLocalFooter();

// ---------------------------------------------------------------------------
// 7. DOCUMENTO
// ---------------------------------------------------------------------------
function makeDocument({ docType, docMeta, children, sections, footerText = DEFAULT_FOOTER, confidential = false, watermark = true, title: metaTitle }) {
  const confidentialText = confidential === true ? CONFIDENTIAL_TEXT : (confidential || null);
  const secs = sections || [{ children }];
  return new Document({
    creator: 'Generación Trabajo', title: metaTitle || docType,
    numbering: { config: numberingConfigs },
    styles: { default: {
      document: { run: { font: F.body, size: 22, color: C.foreground } },
      title: { run: { font: F.display, size: 40, color: C.brand800 }, paragraph: { spacing: { before: 120, after: 200 } } },
      heading1: { run: { font: F.display, size: 27, color: C.brand700 }, paragraph: { spacing: { before: 400, after: 140 }, keepNext: true, outlineLevel: 0 } },
      heading2: { run: { font: F.body, size: 23, bold: true, color: C.brand600 }, paragraph: { spacing: { before: 280, after: 80 }, keepNext: true, outlineLevel: 1 } },
      heading3: { run: { font: F.body, size: 22, bold: true, color: C.foreground }, paragraph: { spacing: { before: 220, after: 60 }, keepNext: true, outlineLevel: 2 } },
    } },
    sections: secs.map((s) => ({
      properties: { page: { size: { width: LETTER.width, height: LETTER.height, orientation: s.landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT },
        margin: s.landscape ? { ...MARGIN, top: 2150, bottom: 1300 } : MARGIN } },
      headers: { default: buildHeader({ docType, docMeta, watermark, landscape: !!s.landscape }) },
      footers: { default: buildFooter({ footerText, confidentialText, landscape: !!s.landscape }) },
      children: s.children,
    })),
  });
}

module.exports = {
  C, F, LETTER, MARGIN, CONTENT_WIDTH, cw, setLandscape, ASSETS, rich,
  kicker, accentBar, title, subtitle, h1, h2, h3, p, def, note, bullets, checklist, numbered, option, pageBreak, spacer,
  metaCard, statTiles, callout, dataTable, totals, signatureFields, signedBy, statCard, prosCons,
  makeDocument, DEFAULT_FOOTER, PUBLIC_FOOTER, CONFIDENTIAL_TEXT,
};
