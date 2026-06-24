import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    verify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    const sql = getDb()

    const rows = await sql`
      SELECT
        id, legajo, nombre_completo, dni, cuil, email, telefono,
        obra_social, url_obra_social, id_archivo_obra_social,
        provincia, localidad, barrio, calle, numero, manzana, block, piso, departamento,
        descripcion_vivienda, latitud, longitud, direccion_formateada, place_id,
        url_imagen_domicilio, id_archivo_domicilio,
        declaracion_jurada, estado, created_at, updated_at
      FROM form_submissions
      WHERE
        (${search} = '' OR
         nombre_completo ILIKE ${'%' + search + '%'} OR
         dni ILIKE ${'%' + search + '%'} OR
         legajo ILIKE ${'%' + search + '%'})
        AND (${estado} = '' OR estado = ${estado})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM form_submissions
      WHERE
        (${search} = '' OR
         nombre_completo ILIKE ${'%' + search + '%'} OR
         dni ILIKE ${'%' + search + '%'} OR
         legajo ILIKE ${'%' + search + '%'})
        AND (${estado} = '' OR estado = ${estado})
    `

    return Response.json({
      success: true,
      data: rows,
      total: parseInt(countResult[0].total),
      page,
      limit,
    })
  } catch (error) {
    console.error('Admin submissions error:', error)
    return Response.json({ error: 'Error al obtener registros' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyToken(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, estado } = await request.json()
    if (!id || !['pendiente', 'completado', 'anulado'].includes(estado)) {
      return Response.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    const sql = getDb()
    await sql`UPDATE form_submissions SET estado = ${estado} WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin update error:', error)
    return Response.json({ error: 'Error al actualizar registro' }, { status: 500 })
  }
}
