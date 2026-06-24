import { google } from 'googleapis';
import { Readable } from 'stream';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  
  const key = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

function getDrive() {
  const auth = getAuth();
  return google.drive({ version: 'v3', auth });
}

async function ensureFolder(drive: ReturnType<typeof getDrive>, name: string, parentId?: string): Promise<string> {
  const q = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({ q, fields: 'files(id, name)' });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id',
  });
  return folder.data.id!;
}

export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  subfolder: 'obra-social' | 'evidencia-domicilio'
): Promise<{ id: string; url: string }> {
  const drive = getDrive();
  
  const rootId = await ensureFolder(drive, 'SERVINORTE');
  const parentId = await ensureFolder(drive, 'Actualización Datos Empleados', rootId);
  
  const folderName = subfolder === 'obra-social' 
    ? 'Comprobantes Obra Social' 
    : 'Evidencias Domicilio';
  const folderId = await ensureFolder(drive, folderName, parentId);

  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  await drive.permissions.create({
    fileId: file.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    id: file.data.id!,
    url: `https://drive.google.com/file/d/${file.data.id}/view`,
  };
}
