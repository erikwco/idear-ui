/**
 * PLANTILLA — Informe ejecutivo de proceso de selección (formato GT).
 * Contenido de muestra (candidato ficticio; interpretaciones genéricas). Muestra todos los
 * componentes del informe: ficha, indicadores, tabla por prueba, tablas de escalas BIP, callouts,
 * dictamen con %, notas y firma. Al usarla: copia a _work/, sustituye los textos por los del
 * original (íntegros) y anota en CORRECCIONES cada cambio ortográfico.
 */
const fs = require('fs');
const { Packer } = require('docx');
const gt = require('../scripts/gt-theme');

const CORRECCIONES = [
  // '"en base a" → "con base en".',
  // '"Licda." → "Lcda." (convención GT).',
];

// Tabla de escalas BIP (Escala · Punt. · Interpretación) — helper local para no repetir anchos.
const escalas = (rows) => gt.dataTable({
  header: ['Escala', 'Punt.', 'Interpretación'], widths: [2400, 900, 6060],
  align: ['left', 'center', 'left'], firstColStrong: true, rows,
});

const children = [
  gt.kicker('Generación Trabajo  ·  Proceso de selección'),
  gt.title('Informe Ejecutivo de Proceso de Selección'),
  gt.accentBar(),
  gt.spacer(160),
  gt.metaCard([
    ['Nombre del candidato(a)', 'Nombre Apellido Apellido'],
    ['Cargo al que aplica', 'Nombre del cargo'],
    ['Fecha de evaluación', '1/1/2026'],
    ['Lugar', 'San Salvador'],
    ['Evaluador(a)', 'Lcda. Nombre Apellido  ·  Lcda. Nombre Apellido', { span: 2 }],
  ]),

  gt.h1('Descripción del proceso'),
  gt.p('El proceso de selección se desarrolló con el objetivo de identificar el grado de ajuste del perfil psicológico y las competencias del candidato(a) a las demandas del cargo. El proceso incluyó entrevista individual, aplicación de pruebas psicométricas y análisis conductual con base en los resultados obtenidos y referencias telefónicas.'),

  gt.h1('Resultados psicométricos e interpretación'),

  gt.h2('1. Diagnóstico cuantitativo general'),
  gt.statTiles([
    { value: '30 / 46', label: 'Puntuación directa total (PD)', sub: 'puntos' },
    { value: '105', label: 'Coeficiente intelectual (CI)' },
    { value: '60', label: 'Percentil', sub: 'Supera al 60% de la población adulta de control' },
    { value: 'Normal Promedio', label: 'Clasificación de inteligencia' },
  ]),
  gt.spacer(120),

  gt.h2('2. Perfil psicológico de rendimiento'),
  gt.p('Su perfil muestra un estilo cognitivo equilibrado entre lo procedimental y lo abstracto:', { keepNext: true }),
  gt.dataTable({
    header: ['Prueba', 'PD', '%', 'Interpretación'],
    widths: [1900, 1000, 900, 5560],
    align: ['left', 'center', 'center', 'left'],
    firstColStrong: true,
    rows: [
      ['Test 1: Series', '9 / 12', '75.0%', '**Su mejor rendimiento.** Interpretación de la subprueba tal como aparece en el original.'],
      ['Test 2: Clasificación', '8 / 14', '57.1%', 'Interpretación de la subprueba tal como aparece en el original.'],
      ['Test 3: Matrices', '7 / 12', '58.3%', 'Interpretación de la subprueba tal como aparece en el original.'],
      ['Test 4: Condiciones', '6 / 8', '75.0%', 'Interpretación de la subprueba tal como aparece en el original.'],
    ],
  }),
  gt.spacer(160),
  gt.callout('Conclusión general de la prueba cognitiva, copiada íntegra del original; puede incluir **negritas** del texto fuente.', { label: 'Conclusión general' }),

  gt.h2('3. Test de personalidad y competencias laborales BIP'),

  gt.h3('Motivación laboral'),
  gt.p('Frase introductoria del bloque, si el original la trae:', { keepNext: true }),
  escalas([
    ['Orientación a los resultados (OrRes)', '55', 'Interpretación de la escala tal como aparece en el original.'],
    ['Liderazgo (Lider)', '45', 'Interpretación de la escala tal como aparece en el original.'],
    ['Iniciativa para el cambio (IniCa)', '40', 'Interpretación de la escala tal como aparece en el original.'],
  ]),

  gt.h3('Comportamiento laboral'),
  escalas([
    ['Orientación a la acción (OrAcc)', '50', 'Interpretación de la escala tal como aparece en el original.'],
    ['Esmero (Esmer)', '55', 'Interpretación de la escala tal como aparece en el original.'],
    ['Flexibilidad (Flexi)', '45', 'Interpretación de la escala tal como aparece en el original.'],
  ]),

  gt.h3('Habilidades sociales'),
  escalas([
    ['Trabajo en equipo (TraEq)', '60', 'Interpretación de la escala tal como aparece en el original.'],
    ['Sociabilidad (Socia)', '50', 'Interpretación de la escala tal como aparece en el original.'],
    ['Inteligencia social (InSoc)', '50', 'Interpretación de la escala tal como aparece en el original.'],
    ['Desarrollo de relaciones (DesRe)', '45', 'Interpretación de la escala tal como aparece en el original.'],
  ]),

  gt.h3('Estructura psíquica'),
  escalas([
    ['Estabilidad emocional (EstEm)', '55', 'Interpretación de la escala tal como aparece en el original.'],
    ['Seguridad en sí mismo (Segur)', '50', 'Interpretación de la escala tal como aparece en el original.'],
    ['Capacidad de trabajo (CapTr)', '50', 'Interpretación de la escala tal como aparece en el original.'],
  ]),

  gt.h3('Escalas adicionales y control'),
  escalas([
    ['Sensación de control (SenCo) y Movilidad (Movil)', '55 / 55', 'Interpretación conjunta de las dos escalas.'],
    ['Competitividad (Compe) y Orientación al ocio (OrOci)', '50 / 50', 'Interpretación conjunta de las dos escalas.'],
    ['Distorsión de la imagen (DisIm)', '40', 'Interpretación de la escala de control; ratifica la autenticidad del perfil.'],
  ]),
  gt.spacer(160),
  gt.callout('Conclusión general del perfil BIP, copiada íntegra del original.', { label: 'Conclusión general del perfil' }),

  // Si el informe usa DISC en vez de BIP: una tabla con filas D / I / S / C
  // (Factor · Puntaje · Nivel · Interpretación) con gt.dataTable y widths que sumen 9360.

  gt.h1('Dictamen de acuerdo con los resultados'),
  gt.statCard({
    value: '85 %', caption: 'de ajuste al perfil',
    text: [
      'Con base en la integración de los resultados obtenidos en las pruebas psicométricas y en la observación conductual realizada durante la entrevista, el candidato(a) evidencia un **85 %** de ajuste al perfil del puesto.',
      'En términos generales el candidato posee compatibilidad en buen grado con el cargo al cual está aplicando.',
    ],
  }),
  gt.spacer(160),
  gt.p('Párrafo(s) adicionales del dictamen, íntegros del original.'),
  gt.note('**Nota 1:** Las referencias laborales fueron positivas.'),
  gt.note('**Nota 2:** Este dictamen constituye un insumo técnico para la toma de decisiones y debe complementarse con la evaluación de la experiencia, competencias técnicas y demás etapas del proceso de selección.'),

  ...gt.signedBy('Lcda. Nombre Apellido', 'Psicóloga'),
];

const doc = gt.makeDocument({
  docType: 'Informe ejecutivo de selección',
  docMeta: 'Nombre del cargo  ·  Nombre Apellido Apellido',
  title: 'Informe Ejecutivo de Proceso de Selección — Nombre Apellido Apellido',
  confidential: true,
  children,
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || 'informe-ejecutivo-gt.docx';
  fs.writeFileSync(out, buf);
  console.log('OK', out, buf.length, 'bytes');
  if (process.argv[3] === '--correcciones') console.log(CORRECCIONES.map((c, i) => `${i + 1}. ${c}`).join('\n'));
});
