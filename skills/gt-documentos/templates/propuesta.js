/**
 * PLANTILLA — Propuesta de servicios de reclutamiento y preselección (formato GT).
 * Contenido de muestra (cliente y contacto ficticios). Al usarla: copia este archivo a _work/,
 * sustituye los textos por los del documento original y anota en CORRECCIONES cada cambio ortográfico.
 */
const fs = require('fs');
const { Packer } = require('docx');
const gt = require('../scripts/gt-theme');

const CORRECCIONES = [
  // '"Actualziación" → "Actualización".',
];

const children = [
  // --- Cabecera del documento ---
  gt.kicker('Generación Trabajo  ·  Reclutamiento y preselección de personal'),
  gt.title('Propuesta de servicios de reclutamiento y preselección de personal'),
  gt.accentBar(),
  gt.spacer(160),
  gt.metaCard([
    ['Cliente', 'EMPRESA EJEMPLO, S.A. de C.V.'],
    ['Contacto', 'Nombre Apellido'],
    ['Teléfono', '0000-0000'],
    ['Correo', 'contacto@empresa-ejemplo.com'],
    ['Fecha', '1 de enero de 2026 · Actualización 15 de enero de 2026'],
    ['Por Generación Trabajo', 'Lcda. Gabriela Rivas / Lcda. Haydée Canales'],
  ]),

  // --- Objetivo ---
  gt.h1('Objetivo del servicio'),
  gt.p('Apoyar a su organización en la búsqueda, evaluación y selección de talento humano, identificando candidatos que cumplan con los requisitos técnicos, experiencia y competencias requeridas para la posición solicitada.'),

  // --- Alcance ---
  gt.h1('Alcance del servicio'),
  gt.p('El servicio incluye:', { keepNext: true }),
  ...gt.checklist(['Publicación y promoción de la vacante.']),
  gt.option('Usar nombre de marca', false),
  gt.option('No usar nombre de marca', true),
  gt.spacer(60),
  ...gt.checklist([
    'Captación y búsqueda activa de candidatos (hunting).',
    'Revisión y filtrado curricular.',
    'Entrevista inicial de preselección.',
    'Evaluación psicométrica y de competencias.',
    'Llamadas para validación de referencias laborales.',
    'Presentación de una terna final de tres (3) candidatos preseleccionados.',
    'Coordinación de entrevistas con la empresa contratante.',
  ]),

  // --- Tiempo ---
  gt.h1('Tiempo estimado de entrega'),
  gt.p('La terna se entregaría dentro de **15 días hábiles** a partir del día hábil siguiente a:', { keepNext: true }),
  ...gt.bullets([
    'Aprobación de la presente propuesta.',
    'Recepción del perfil de la vacante.',
    'Confirmación del pago inicial del 50%.',
  ]),

  // --- Inversión ---
  gt.h1('Inversión'),
  gt.def('Concepto', 'Servicio de reclutamiento y preselección de personal.'),
  gt.def('Honorario', 'Equivalente a un salario mensual de la posición contratada.'),
  gt.def('Descuentos', ''),
  ...gt.bullets([
    'Ver desglose en resumen de inversión.',
    '20% de descuento para contratación de 2 o más plazas.',
  ]),
  gt.h2('Forma de pago'),
  ...gt.bullets([
    '50% al aprobar la propuesta e iniciar el proceso.',
    '50% al momento de contratación del candidato seleccionado.',
  ]),

  // --- Resumen de inversión ---
  gt.h1('Resumen de inversión'),
  gt.dataTable({
    header: ['Plaza', 'Cantidad', 'Salario por plaza', 'Honorario'],
    widths: [4560, 1300, 1800, 1700],
    align: ['left', 'center', 'right', 'right'],
    rows: [
      ['Nombre de la plaza', '1', '$500.00', '$500.00'],
    ],
  }),
  gt.spacer(160),
  gt.totals([
    ['Total honorarios', '$500.00'],
    ['Descuento #1', '− $50.00'],
    ['Descuento #2 · Bono de bienvenida', '− $40.00'],
    ['Subtotal', '$410.00', { strong: true }],
    ['IVA 13%', '$53.30'],
    ['TOTAL DEL PROYECTO', '$463.30', { total: true }],
    ['Primer pago (50%)', '$231.65', { muted: true }],
    ['Segundo pago (50%)', '$231.65', { muted: true }],
  ]),
  gt.spacer(80),
  gt.note('Se emitirá CCF correspondiente a cada pago realizado.'),

  // --- Condiciones ---
  gt.h1('Condiciones generales'),
  ...gt.numbered([
    '**Confidencialidad:** La información de ambas partes y de los candidatos se tratará de forma confidencial y se utilizará únicamente para este proceso.',
    '**Perfil de la vacante:** Evaluaremos a los candidatos según el perfil aprobado por la empresa, quien facilitará la información necesaria. Los cambios importantes en el perfil podrán modificar los tiempos de entrega.',
    '**Plazos:** Se consideran días hábiles de lunes a viernes, excluidos los feriados aplicables. Ante situaciones extraordinarias, comprobables y ajenas a nuestro control que impidan avanzar, podremos ajustar el plazo, comunicando por escrito el motivo y la nueva fecha propuesta.',
    '**Entrega y pago:** Presentaremos tres (3) candidatos preseleccionados por plaza, en un solo envío. Al realizar esta entrega, corresponderá el pago del 50 % restante. Si alguno desiste, la empresa podrá contactar a los demás integrantes de la terna.',
    '**Entrevistas:** Coordinaremos las agendas con la empresa y los candidatos. La empresa realizará las entrevistas en una misma jornada o dentro de un máximo de 24 horas entre la primera y la última.',
    '**Selección final:** La decisión de contratación corresponde a la empresa, quien comunicará su elección a Generación Trabajo.',
    '**Adaptación:** Para efectos de esta propuesta, se contempla un (1) mes calendario desde el ingreso efectivo de la persona contratada. Los períodos internos de la empresa no amplían este plazo ni el alcance del servicio.',
    '**Servicios adicionales:** La oferta incluye únicamente los servicios expresamente descritos. Cualquier apoyo adicional requerirá cotización y aprobación escrita antes de su ejecución.',
  ]),

  // --- Aprobación ---
  gt.h1('Aprobación del servicio'),
  gt.spacer(120),
  gt.signatureFields([
    'Nombre del representante autorizado:',
    'Cargo:',
    'Firma:',
    'Fecha:',
  ]),
];

const doc = gt.makeDocument({
  docType: 'Propuesta de servicios',
  docMeta: 'EMPRESA EJEMPLO  ·  Enero 2026',
  title: 'Propuesta de servicios de reclutamiento y preselección — EMPRESA EJEMPLO',
  children,
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || 'propuesta-gt.docx';
  fs.writeFileSync(out, buf);
  console.log('OK', out, buf.length, 'bytes');
  if (process.argv[3] === '--correcciones') console.log(CORRECCIONES.map((c, i) => `${i + 1}. ${c}`).join('\n'));
});
