import { google } from 'googleapis';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const key = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

const HEADERS = [
  'Fecha', 'Hora', 'Legajo', 'Nombre Completo', 'DNI', 'CUIL',
  'Correo Electrónico', 'Teléfono', 'Obra Social', 'URL Archivo Obra Social',
  'Provincia', 'Localidad', 'Barrio', 'Calle', 'Número', 'Manzana',
  'Block', 'Piso', 'Departamento', 'Descripción',
  'Latitud', 'Longitud', 'Dirección Formateada', 'Place ID',
  'URL Imagen Domicilio', 'ID Archivo Obra Social', 'ID Archivo Domicilio',
  'Estado Registro',
];

export async function initSheet(spreadsheetId: string): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A1:AB1',
  });
  
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

export interface SheetRow {
  fecha: string;
  hora: string;
  legajo: string;
  nombre_completo: string;
  dni: string;
  cuil: string;
  email: string;
  telefono: string;
  obra_social: string;
  url_obra_social: string;
  provincia: string;
  localidad: string;
  barrio: string;
  calle: string;
  numero: string;
  manzana: string;
  block: string;
  piso: string;
  departamento: string;
  descripcion: string;
  latitud: string;
  longitud: string;
  direccion_formateada: string;
  place_id: string;
  url_imagen_domicilio: string;
  id_archivo_obra_social: string;
  id_archivo_domicilio: string;
  estado: string;
}

export async function appendRow(spreadsheetId: string, row: SheetRow): Promise<number> {
  const sheets = getSheets();
  
  const values = [
    row.fecha, row.hora, row.legajo, row.nombre_completo, row.dni, row.cuil,
    row.email, row.telefono, row.obra_social, row.url_obra_social,
    row.provincia, row.localidad, row.barrio, row.calle, row.numero,
    row.manzana, row.block, row.piso, row.departamento, row.descripcion,
    row.latitud, row.longitud, row.direccion_formateada, row.place_id,
    row.url_imagen_domicilio, row.id_archivo_obra_social, row.id_archivo_domicilio,
    row.estado,
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:AB',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });

  const updatedRange = res.data.updates?.updatedRange || '';
  const match = updatedRange.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 0;
}
