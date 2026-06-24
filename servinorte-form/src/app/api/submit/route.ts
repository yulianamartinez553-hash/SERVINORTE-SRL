import { NextRequest } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { appendRow, initSheet } from '@/lib/google-sheets'
import { rateLimit } from '@/lib/rate-limit'
import { format } from 'date-fns'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    if (!rateLimit(`submit:${ip}`, 3, 300000)) {
      return Response.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
    }

    const body = await request.json()
    const {
      dni, legajo, nombre_completo, cuil,
      email, telefono,
      obra_social, url_obra_social, id_archivo_obra_social,
      provincia, localidad, barrio, calle, numero, manzana, block, piso, departamento, descripcion_vivienda,
      latitud, longitud, direccion_formateada, place_id,
      url_imagen_domicilio, id_archivo_domicilio,
      declaracion_jurada,
    } = body

    // Validate required fields
    if (!dni || !email || !telefono || !obra_social || !provincia || !localidad || !barrio || !calle || !numero || !descripcion_vivienda || !declaracion_jurada) {
      return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (!/^\d{7,8}$/.test(dni)) {
      return Response.json({ error: 'DNI inválido' }, { status: 400 })
    }

    const sql = getDb()

    // Verify employee
    const empRows = await sql`
      SELECT id, legajo, nombre_completo, cuil, is_active
      FROM employees WHERE dni = ${dni} AND is_active = true LIMIT 1
    `
    if (empRows.length === 0) {
      return Response.json({ error: 'Empleado no encontrado o inactivo' }, { status: 403 })
    }

    // Check duplicate
    const existing = await sql`
      SELECT id FROM form_submissions WHERE dni = ${dni} AND estado != 'anulado' LIMIT 1
    `
    if (existing.length > 0) {
      return Response.json({ error: 'Ya existe una actualización registrada para este empleado.' }, { status: 409 })
    }

    // Insert submission
    const result = await sql`
      INSERT INTO form_submissions (
        employee_id, legajo, nombre_completo, dni, cuil,
        email, telefono,
        obra_social, url_obra_social, id_archivo_obra_social,
        provincia, localidad, barrio, calle, numero, manzana, block, piso, departamento, descripcion_vivienda,
        latitud, longitud, direccion_formateada, place_id,
        url_imagen_domicilio, id_archivo_domicilio,
        declaracion_jurada, estado, ip_address, user_agent
      ) VALUES (
        ${empRows[0].id}, ${empRows[0].legajo}, ${empRows[0].nombre_completo}, ${dni}, ${empRows[0].cuil},
        ${email}, ${telefono},
        ${obra_social}, ${url_obra_social || null}, ${id_archivo_obra_social || null},
        ${provincia}, ${localidad}, ${barrio}, ${calle}, ${numero},
        ${manzana || 'No corresponde'}, ${block || 'No corresponde'}, ${piso || 'No corresponde'}, ${departamento || 'No corresponde'},
        ${descripcion_vivienda},
        ${latitud || null}, ${longitud || null}, ${direccion_formateada || null}, ${place_id || null},
        ${url_imagen_domicilio || null}, ${id_archivo_domicilio || null},
        ${declaracion_jurada}, 'completado', ${ip}, ${userAgent}
      )
      RETURNING id
    `

    const submissionId = result[0].id

    // Log audit event
    await sql`
      INSERT INTO audit_log (event_type, employee_dni, submission_id, details, ip_address)
      VALUES ('form_submitted', ${dni}, ${submissionId}, ${JSON.stringify({ legajo, nombre_completo })}, ${ip})
    `.catch(console.error)

    // Sync to Google Sheets
    let sheetsRow = 0
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
    if (spreadsheetId) {
      try {
        await initSheet(spreadsheetId)
        const now = new Date()
        sheetsRow = await appendRow(spreadsheetId, {
          fecha: format(now, 'dd/MM/yyyy'),
          hora: format(now, 'HH:mm:ss'),
          legajo: empRows[0].legajo,
          nombre_completo: empRows[0].nombre_completo,
          dni,
          cuil: empRows[0].cuil,
          email,
          telefono,
          obra_social,
          url_obra_social: url_obra_social || '',
          provincia, localidad, barrio, calle, numero,
          manzana: manzana || 'No corresponde',
          block: block || 'No corresponde',
          piso: piso || 'No corresponde',
          departamento: departamento || 'No corresponde',
          descripcion: descripcion_vivienda,
          latitud: latitud?.toString() || '',
          longitud: longitud?.toString() || '',
          direccion_formateada: direccion_formateada || '',
          place_id: place_id || '',
          url_imagen_domicilio: url_imagen_domicilio || '',
          id_archivo_obra_social: id_archivo_obra_social || '',
          id_archivo_domicilio: id_archivo_domicilio || '',
          estado: 'completado',
        })

        if (sheetsRow > 0) {
          await sql`UPDATE form_submissions SET sheets_row = ${sheetsRow} WHERE id = ${submissionId}`
        }
      } catch (sheetsError) {
        console.error('Sheets sync error:', sheetsError)
      }
    }

    return Response.json({
      success: true,
      message: 'Sus datos han sido registrados correctamente.',
      submissionId,
    })
  } catch (error) {
    console.error('Submit error:', error)
    return Response.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
