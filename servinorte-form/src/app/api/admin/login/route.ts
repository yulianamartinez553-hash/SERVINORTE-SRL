import { NextRequest } from 'next/server'
import { sign } from 'jsonwebtoken'
import { createHash } from 'crypto'
import { neon } from '@neondatabase/serverless'
import { rateLimit } from '@/lib/rate-limit'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (!rateLimit(`admin-login:${ip}`, 5, 300000)) {
      return Response.json({ error: 'Demasiados intentos. Espere 5 minutos.' }, { status: 429 })
    }

    const { password } = await request.json()

    if (!password) {
      return Response.json({ error: 'Contraseña requerida' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    if (!adminPassword || !jwtSecret) {
      return Response.json({ error: 'Configuración del servidor incompleta' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const token = sign({ role: 'admin', ts: Date.now() }, jwtSecret, { expiresIn: '8h' })
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const sql = getDb()
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000)
    await sql`
      INSERT INTO admin_sessions (token_hash, ip_address, expires_at)
      VALUES (${tokenHash}, ${ip}, ${expiresAt.toISOString()})
    `.catch(console.error)

    return Response.json({ success: true, token })
  } catch (error) {
    console.error('Admin login error:', error)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
