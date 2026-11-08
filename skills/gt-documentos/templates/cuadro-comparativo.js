/**
 * PLANTILLA — Cuadro comparativo de candidatos (formato GT).
 * Sección 1 (horizontal): matriz comparativa. Sección 2 (vertical): análisis por candidato.
 * Contenido de muestra (candidatos ficticios, textos genéricos). Al usarla: copia a _work/,
 * sustituye los textos por los del original (íntegros) y anota en CORRECCIONES cada cambio.
 */
const fs = require('fs');
const { Packer } = require('docx');
const gt = require('../scripts/gt-theme');

const CORRECCIONES = [
  // 'Cabecera "opción 2 (88%)" → "Opción 2 · 88%".',
];

// ---------------- Sección 1: matriz (horizontal) ----------------
gt.setLandscape(true);
const W = gt.cw(); // 12960
const colVar = 2160, colCand = Math.floor((W - colVar) / 3);
const widths = [colVar, colCand, colCand, W - colVar - 2 * colCand];

const matriz = [
  gt.kicker('Generación Trabajo  ·  Proceso de selección'),
  gt.title('Matriz comparativa definitiva — Los 3 aspirantes'),
  gt.dataTable({
    header: [
      'Variable de evaluación',
      ['Candidata 1  ·  Mujer, 30 años', 'Opción 1  ·  90%'],
      ['Candidato 2  ·  Hombre, 35 años', 'Opción 2  ·  88%'],
      ['Candidato 3  ·  Hombre, 40 años', 'Opción 3  ·  85%'],
    ],
    widths, firstColStrong: true, zebra: false, splitRows: true, compact: true, fontSize: 19,
    rows: [
      ['Puntaje total (PD)', '32 / 46 puntos', '28 / 46 puntos', '24 / 46 puntos'],
      ['Coeficiente intelectual (CI)', '**115** (Normal Alto)', '**104** (Normal Promedio)', '**96** (Normal Promedio)'],
      ['Estilo cognitivo', 'Analítico, rápido.', 'Equilibrado, estable.', 'Procedimental, rutinario.'],
      ['Curva de aprendizaje', 'Muy rápida.', 'Estándar.', 'Lenta (requiere supervisión).'],
      ['Idoneidad para el puesto', '**Sobresaliente** (texto del original).', '**Óptima** (texto del original).', '**Aceptable** (texto del original).'],
      ['Test de competencias y personalidad BIP',
        ['Primer rasgo del candidato, frase íntegra del original.', 'Segundo rasgo.', 'Tercer rasgo.', 'Cuarto rasgo.'],
        ['Primer rasgo del candidato, frase íntegra del original.', 'Segundo rasgo.', 'Tercer rasgo.'],
        ['Primer rasgo del candidato, frase íntegra del original.', 'Segundo rasgo.', 'Tercer rasgo.', 'Cuarto rasgo.', 'Quinto rasgo.'],
      ],
    ],
  }),
];

// ---------------- Sección 2: análisis (vertical) ----------------
gt.setLandscape(false);
const candidato = (titulo, intro, pros, cons) => [
  gt.h2(titulo),
  gt.p(intro, { keepNext: true }),
  gt.prosCons({ prosLabel: 'Fortalezas contables', consLabel: 'Riesgos en el puesto', pros, cons }),
];

const analisis = [
  gt.h1('Análisis del perfil cognitivo por candidato'),
  ...candidato('1. Candidata 1 (30 años) — Perfil analítico y de alto potencial',
    'Frase introductoria del perfil, íntegra del original.',
    'Fortalezas del candidato para el puesto, con las **negritas** del original.',
    'Riesgos o puntos de atención del candidato en el puesto.'),
  ...candidato('2. Candidato 2 (35 años) — Perfil equilibrado y estándar óptimo',
    'Frase introductoria del perfil, íntegra del original.',
    'Fortalezas del candidato para el puesto.',
    'Riesgos o puntos de atención del candidato en el puesto.'),
  ...candidato('3. Candidato 3 (40 años) — Perfil procedimental y de ejecución lineal',
    'Frase introductoria del perfil, íntegra del original.',
    'Fortalezas del candidato para el puesto.',
    'Riesgos o puntos de atención del candidato en el puesto.'),
];

const doc = gt.makeDocument({
  docType: 'Cuadro comparativo',
  docMeta: 'Nombre de la plaza  ·  3 aspirantes',
  title: 'Cuadro comparativo — Nombre de la plaza',
  confidential: true,
  sections: [{ landscape: true, children: matriz }, { children: analisis }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || 'cuadro-comparativo-gt.docx';
  fs.writeFileSync(out, buf);
  console.log('OK', out, buf.length, 'bytes');
  if (process.argv[3] === '--correcciones') console.log(CORRECCIONES.map((c, i) => `${i + 1}. ${c}`).join('\n'));
});
