import { NextRequest } from 'next/server'
import { uploadFileToDrive } from '@/lib/google-drive'
import { rateLimit } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (!rateLimit(`upload:${ip}`, 10, 60000)) {
      return Response.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null
    const dni = formData.get('dni') as string | null

    if (!file || !type || !dni) {
      return Response.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    if (!/^\d{7,8}$/.test(dni)) {
      return Response.json({ error: 'DNI inválido' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'El archivo supera el tamaño máximo de 10MB' }, { status: 400 })
    }

    const subfolder = type === 'obra-social' ? 'obra-social' : 'evidencia-domicilio'
    const allowedTypes = type === 'evidencia-domicilio' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES

    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeExt = ['jpg', 'jpeg', 'png', 'pdf'].includes(ext) ? ext : 'bin'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${subfolder}-${dni}-${timestamp}-${uuidv4().slice(0, 8)}.${safeExt}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFileToDrive(buffer, fileName, file.type, subfolder)

    return Response.json({
      success: true,
      id: result.id,
      url: result.url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}

export const maxDuration = 60
