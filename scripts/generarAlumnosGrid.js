// Ejecutar antes: npm install mammoth

const fs = require('fs/promises');
const path = require('path');
const mammoth = require('mammoth');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'posteo2.html');
const POSTEO_DIR = path.join(ROOT_DIR, 'img', 'posteos', 'posteo2');

const GRID_START = '<!-- GRID DE ALUMNOS -->';
const GRID_END = '<!-- FIN GRID DE ALUMNOS -->';
const MODALS_START = '<!-- MODALES ALUMNOS -->';
const MODALS_END = '<!-- FIN MODALES ALUMNOS -->';

const ALUMNO_FOLDER_REGEX = /^\d{2} .+/;

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceSection(content, startMarker, endMarker, newSection) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`No se pudo encontrar el bloque delimitado por ${startMarker} y ${endMarker}.`);
  }

  const before = content.slice(0, startIndex + startMarker.length);
  const after = content.slice(endIndex);
  return `${before}\n${newSection}\n${after}`;
}

async function leerFraseDocx(docxPath) {
  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    return result.value.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.warn(`No se pudo leer el archivo DOCX en ${docxPath}:`, error.message);
    return 'Frase no disponible.';
  }
}

async function obtenerAlumnos() {
  const entries = await fs.readdir(POSTEO_DIR, { withFileTypes: true });
  const alumnoDirs = entries
    .filter((entry) => entry.isDirectory() && ALUMNO_FOLDER_REGEX.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'es'));

  const alumnos = [];

  for (const folderName of alumnoDirs) {
    const folderPath = path.join(POSTEO_DIR, folderName);
    const files = await fs.readdir(folderPath);

    const imagenes = files
      .filter((file) => file.toLowerCase().endsWith('.jpg'))
      .sort((a, b) => a.localeCompare(b, 'es'));

    if (imagenes.length === 0) {
      console.warn(`La carpeta ${folderName} no contiene imágenes .jpg, se omitirá.`);
      continue;
    }

    const docxName = files.find((file) => file.toLowerCase().endsWith('.docx'));
    const frase = docxName
      ? await leerFraseDocx(path.join(folderPath, docxName))
      : 'Frase no disponible.';

    const displayName = folderName.slice(3);
    const slug = slugify(displayName);

    alumnos.push({
      folderName,
      displayName,
      slug,
      imagenes,
      frase,
    });
  }

  return alumnos;
}

function generarGrid(alumnos) {
  const indent = '    ';
  const lines = [
    `${indent}<h3 class="alumnos-titulo">Casas tomadas por estudiantes</h3>`,
    `${indent}<p class="text-center" style="font-size: 0.95rem;">`,
    `${indent}  Hacé clic en cada tarjeta para ver el dibujo.`,
    `${indent}</p>`,
    '',
    `${indent}<div class="alumnos-grid">`,
  ];

  alumnos.forEach(({ folderName, displayName, slug, imagenes }) => {
    const thumb = imagenes[0];
    const imgPath = path.posix.join('img', 'posteos', 'posteo2', folderName, thumb);

    lines.push(
      `${indent}  <button`,
      `${indent}    class="alumno-card"`,
      `${indent}    data-toggle="modal"`,
      `${indent}    data-target="#modal-${slug}"`,
      `${indent}  >`,
      `${indent}    <img src="${imgPath}" alt="Dibujo de ${escapeHtml(displayName)}" />`,
      `${indent}    <div class="alumno-nombre">${escapeHtml(displayName)}</div>`,
      `${indent}  </button>`,
    );
  });

  lines.push(`${indent}</div>`);
  return lines.join('\n');
}

function generarModales(alumnos) {
  const indent = '    ';
  const lines = [`${indent}<div class="alumnos-modales">`];

  alumnos.forEach(({ folderName, displayName, slug, imagenes, frase }) => {
    const modalId = `modal-${slug}`;
    const labelId = `${modalId}-label`;
    const safeName = escapeHtml(displayName);
    const safeFrase = escapeHtml(frase);

    lines.push(
      `${indent}  <div`,
      `${indent}    class="modal fade"`,
      `${indent}    id="${modalId}"`,
      `${indent}    tabindex="-1"`,
      `${indent}    role="dialog"`,
      `${indent}    aria-labelledby="${labelId}"`,
      `${indent}    aria-hidden="true"`,
      `${indent}  >`,
      `${indent}    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">`,
      `${indent}      <div class="modal-content">`,
      `${indent}        <div class="modal-header">`,
      `${indent}          <h5 class="modal-title" id="${labelId}">${safeName}</h5>`,
      `${indent}          <button type="button" class="close" data-dismiss="modal" aria-label="Close">`,
      `${indent}            <span aria-hidden="true">&times;</span>`,
      `${indent}          </button>`,
      `${indent}        </div>`,
      `${indent}        <div class="modal-body">`,
      `${indent}          <p class="alumno-frase">${safeFrase}</p>`,
      `${indent}          <div class="row">`,
    );

    imagenes.forEach((imagen) => {
      const imgPath = path.posix.join('img', 'posteos', 'posteo2', folderName, imagen);
      lines.push(
        `${indent}            <div class="col-12 mb-3">`,
        `${indent}              <img class="img-fluid w-100" src="${imgPath}" alt="Dibujo de ${safeName}" />`,
        `${indent}            </div>`,
      );
    });

    lines.push(
      `${indent}          </div>`,
      `${indent}        </div>`,
      `${indent}      </div>`,
      `${indent}    </div>`,
      `${indent}  </div>`,
    );
  });

  lines.push(`${indent}</div>`);
  return lines.join('\n');
}

async function main() {
  const [html, alumnos] = await Promise.all([
    fs.readFile(HTML_PATH, 'utf8'),
    obtenerAlumnos(),
  ]);

  const gridHtml = generarGrid(alumnos);
  const modalesHtml = generarModales(alumnos);

  const withGrid = replaceSection(html, GRID_START, GRID_END, gridHtml);
  const finalHtml = replaceSection(withGrid, MODALS_START, MODALES_END, modalesHtml);

  await fs.writeFile(HTML_PATH, finalHtml, 'utf8');
  console.log('posteo2.html actualizado con grid y modales generados automáticamente.');
}

main().catch((error) => {
  console.error('Error al generar el grid de alumnos:', error);
  process.exit(1);
});
