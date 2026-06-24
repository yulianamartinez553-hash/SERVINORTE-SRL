import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`geocode:${ip}`, 30, 60000)) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return Response.json({ error: 'Faltan coordenadas' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&region=AR&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      return Response.json({
        success: true,
        address: result.formatted_address,
        placeId: result.place_id,
      })
    }

    return Response.json({ success: false, address: '', placeId: '' })
  } catch (error) {
    console.error('Geocode error:', error)
    return Response.json({ error: 'Error de geocodificación' }, { status: 500 })
  }
}
