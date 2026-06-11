/**
 * Encuesta de Satisfacción TIC · LAAR Seguridad
 * Backend en Google Apps Script (vinculado a una hoja de Google Sheets).
 *
 * INSTALACIÓN:
 * 1. Crea una hoja de cálculo en Google Sheets (ej. "Encuesta Satisfacción TIC").
 * 2. Menú Extensiones → Apps Script. Borra el contenido y pega este archivo.
 * 3. Implementar → Nueva implementación → Tipo: "Aplicación web".
 *    - Ejecutar como: Tú (tu cuenta).
 *    - Quién tiene acceso: "Cualquier usuario".
 * 4. Copia la URL de la aplicación web (termina en /exec) y pégala en la
 *    constante ENDPOINT de index.html y dashboard.html.
 */

const HOJA = "Respuestas";
const COLUMNAS = [
  "fecha", "area",
  "satisfaccion_general", "tiempo_respuesta", "atencion_requerimientos",
  "soporte_equipos", "soporte_sistemas", "escucha_sugerencias",
  "comentario"
];

function obtenerHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(HOJA);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA);
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

// Recibe una respuesta de la encuesta (POST con JSON) y la agrega como fila.
function doPost(e) {
  const datos = JSON.parse(e.postData.contents);
  const fila = COLUMNAS.map(c => datos[c] !== undefined ? datos[c] : "");
  obtenerHoja().appendRow(fila);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Devuelve todas las respuestas en JSON (lo consume el dashboard).
function doGet() {
  const hoja = obtenerHoja();
  const valores = hoja.getDataRange().getValues();
  const cabecera = valores.shift();
  const filas = valores.map(v => {
    const obj = {};
    cabecera.forEach((c, i) => obj[c] = v[i]);
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify(filas))
    .setMimeType(ContentService.MimeType.JSON);
}
