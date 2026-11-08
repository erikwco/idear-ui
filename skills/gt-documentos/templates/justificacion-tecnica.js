/**
 * PLANTILLA — Justificación técnica / memo (formato GT).
 * Documento tipo memo: título + ficha + secciones con viñetas + conclusión destacada.
 * Contenido de muestra genérico (sin datos de personas). Al usarla: copia a _work/, sustituye los
 * textos por los del original (íntegros) y anota en CORRECCIONES cada cambio ortográfico.
 */
const fs = require('fs');
const { Packer } = require('docx');
const gt = require('../scripts/gt-theme');

const CORRECCIONES = [];

const children = [
  gt.kicker('Generación Trabajo  ·  Proceso de selección'),
  gt.title('Justificación técnica de la batería psicométrica'),
  gt.subtitle('Beta III y DISC'),
  gt.metaCard([
    ['Puesto evaluado', 'Nombre del puesto'],
    ['Batería aplicada', 'Beta III (evaluación cognitiva) · DISC (evaluación conductual)'],
    ['Objetivo de la batería', 'Objetivo tal como lo enuncia el original (una o dos frases).', { span: 2 }],
  ]),
  gt.spacer(120),
  gt.p('Párrafo introductorio del original; puede incluir **negritas** para los nombres de las pruebas.'),

  gt.h1('1. Implementación del Test Beta III (evaluación intelectual no verbal)'),
  gt.p('Frase que introduce la lista de razones:', { keepNext: true }),
  ...gt.bullets([
    '**Razón 1:** explicación íntegra del original.',
    '**Razón 2:** explicación íntegra del original; los nombres de subpruebas van en *cursiva* si así vienen.',
    '**Razón 3:** explicación íntegra del original.',
  ]),

  gt.h1('2. Implementación del Test DISC (evaluación del perfil conductual)'),
  gt.p('Frase que introduce la lista de premisas:', { keepNext: true }),
  ...gt.bullets([
    '**Premisa 1 (factores C y D):** explicación íntegra del original.',
    '**Premisa 2:** explicación íntegra del original.',
    '**Premisa 3 (factor S):** explicación íntegra del original.',
  ]),

  gt.h1('Conclusión'),
  gt.callout('Conclusión íntegra del original, con sus **negritas** y *cursivas*.'),
];

const doc = gt.makeDocument({
  docType: 'Justificación técnica',
  docMeta: 'Batería psicométrica  ·  Nombre del puesto',
  title: 'Justificación técnica de la batería psicométrica — Nombre del puesto',
  children,
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || 'justificacion-tecnica-gt.docx';
  fs.writeFileSync(out, buf);
  console.log('OK', out, buf.length, 'bytes');
  if (process.argv[3] === '--correcciones') console.log(CORRECCIONES.map((c, i) => `${i + 1}. ${c}`).join('\n'));
});
