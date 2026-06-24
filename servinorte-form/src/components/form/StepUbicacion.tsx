'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface MapLocation {
  lat: number
  lng: number
  address: string
  placeId?: string
}

interface StepUbicacionProps {
  defaultLocation?: MapLocation
  domicilio?: { calle: string; numero: string; localidad: string; provincia: string }
  onNext: (location: MapLocation) => void
  onBack: () => void
}

const DEFAULT_CENTER = { lat: -24.7821, lng: -65.4232 } // Salta, Argentina

export function StepUbicacion({ defaultLocation, domicilio, onNext, onBack }: StepUbicacionProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerInstanceRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [location, setLocation] = useState<MapLocation | null>(defaultLocation || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      setGeocoding(true)
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
      const data = await res.json()
      if (data.success) {
        setLocation({ lat, lng, address: data.address, placeId: data.placeId })
      } else {
        setLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
      }
    } catch {
      setLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
    } finally {
      setGeocoding(false)
    }
  }, [])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key no configurada. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.')
      setLoading(false)
      return
    }

    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'es',
      region: 'AR',
      libraries: ['marker', 'places', 'geocoding'],
    })

    Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('geocoding'),
    ]).then(([mapsLib, markerLib, geocodingLib]) => {
      if (!mapRef.current) return

      const { Map } = mapsLib as google.maps.MapsLibrary
      const { AdvancedMarkerElement } = markerLib as google.maps.MarkerLibrary
      const { Geocoder } = geocodingLib as google.maps.GeocodingLibrary

      const initialCenter = defaultLocation
        ? { lat: defaultLocation.lat, lng: defaultLocation.lng }
        : DEFAULT_CENTER

      const mapInstance = new Map(mapRef.current, {
        center: initialCenter,
        zoom: 15,
        mapTypeId: 'hybrid',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['roadmap', 'satellite', 'hybrid'],
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapId: 'servinorte-map',
      })

      const markerEl = document.createElement('div')
      markerEl.style.cssText = 'width:32px;height:32px;background:#1F4A8F;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:grab'

      const markerInstance = new AdvancedMarkerElement({
        map: mapInstance,
        position: defaultLocation ? initialCenter : null,
        title: 'Arrastre para ajustar la ubicación',
        content: markerEl,
        gmpDraggable: true,
      })

      markerInstance.addListener('dragend', () => {
        const pos = markerInstance.position
        if (pos) {
          // pos can be LatLng (method) or LatLngLiteral (number)
          const latLng = pos as google.maps.LatLng
          const lat = typeof latLng.lat === 'function' ? latLng.lat() : (pos as google.maps.LatLngLiteral).lat
          const lng = typeof latLng.lng === 'function' ? latLng.lng() : (pos as google.maps.LatLngLiteral).lng
          reverseGeocode(lat, lng)
        }
      })

      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          markerInstance.position = e.latLng
          reverseGeocode(e.latLng.lat(), e.latLng.lng())
        }
      })

      mapInstanceRef.current = mapInstance
      markerInstanceRef.current = markerInstance
      setLoading(false)

      // Auto-geocode from address if no default location
      if (!defaultLocation && domicilio) {
        const address = `${domicilio.calle} ${domicilio.numero}, ${domicilio.localidad}, ${domicilio.provincia}, Argentina`
        const geocoder = new Geocoder()
        geocoder.geocode({ address, region: 'AR' }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location
            mapInstance.setCenter(loc)
            markerInstance.position = loc
            setLocation({
              lat: loc.lat(),
              lng: loc.lng(),
              address: results[0].formatted_address,
              placeId: results[0].place_id,
            })
          }
        })
      }
    }).catch(() => {
      setError('Error al cargar Google Maps. Verifique su conexión e intente nuevamente.')
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Su navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const map = mapInstanceRef.current
        const marker = markerInstanceRef.current
        if (map && marker) {
          const latLng = new google.maps.LatLng(latitude, longitude)
          map.setCenter(latLng)
          map.setZoom(17)
          marker.position = latLng
          reverseGeocode(latitude, longitude)
        }
      },
      () => setError('No se pudo obtener su ubicación. Por favor marque manualmente en el mapa.')
    )
  }

  const handleNext = () => {
    if (!location) {
      setError('Debe marcar exactamente la ubicación de su domicilio en el mapa.')
      return
    }
    onNext(location)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#EEF1F4] rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#1F4A8F]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ubicación Exacta</h2>
        </div>
        <p className="text-sm text-gray-500">
          Haga clic en el mapa o arrastre el marcador para indicar exactamente dónde vive.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleUseMyLocation}>
            <Navigation className="w-4 h-4" />
            Usar mi ubicación
          </Button>
        </div>

        {loading && (
          <div className="map-container h-[400px] flex items-center justify-center bg-[#F7F8FA] rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#1F4A8F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando mapa...</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="map-container"
          style={{ height: '400px', display: loading ? 'none' : 'block' }}
        />

        {location && !geocoding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-green-800 text-sm">Ubicación seleccionada</p>
                <p className="text-sm text-green-700 mt-0.5 break-words">{location.address}</p>
                <p className="text-xs text-green-600 mt-1">
                  Lat: {location.lat.toFixed(6)} · Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {geocoding && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border border-[#1F4A8F] border-t-transparent rounded-full animate-spin" />
            Obteniendo dirección...
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Atrás
          </Button>
          <Button type="button" onClick={handleNext} className="flex-1" disabled={!location}>
            Continuar
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
