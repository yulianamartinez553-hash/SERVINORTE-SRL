import { NextRequest } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { rateLimit } from '@/lib/rate-limit'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dni: string }> }
) {
  try {
    const { dni } = await params
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (!rateLimit(`employee-lookup:${ip}`, 20, 60000)) {
      return Response.json({ error: 'Demasiadas solicitudes. Intente nuevamente en un minuto.' }, { status: 429 })
    }

    if (!/^\d{7,8}$/.test(dni)) {
      return Response.json({ error: 'DNI inválido' }, { status: 400 })
    }

    const sql = getDb()
    const rows = await sql`
      SELECT id, dni, legajo, nombre_completo, cuil, activo
      FROM employees
      WHERE dni = ${dni}
      LIMIT 1
    `

    if (rows.length === 0) {
      return Response.json(
        { error: 'No se encontró un empleado activo asociado al DNI ingresado. Por favor comuníquese con Recursos Humanos.' },
        { status: 404 }
      )
    }

    const employee = rows[0]

    if (!employee.activo) {
      return Response.json(
        { error: 'No se encontró un empleado activo asociado al DNI ingresado. Por favor comuníquese con Recursos Humanos.' },
        { status: 403 }
      )
    }

    // Check for existing submission (via employee_id FK)
    const existing = await sql`
      SELECT id, estado FROM submissions
      WHERE employee_id = ${employee.id} AND estado != 'anulado'
      LIMIT 1
    `

    if (existing.length > 0) {
      return Response.json(
        { error: 'Ya existe una actualización registrada para este empleado.' },
        { status: 409 }
      )
    }

    return Response.json({
      success: true,
      employee: {
        id: employee.id,
        dni: employee.dni,
        legajo: employee.legajo,
        nombre_completo: employee.nombre_completo,
        cuil: employee.cuil,
      }
    })
  } catch (error) {
    console.error('Employee lookup error:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
