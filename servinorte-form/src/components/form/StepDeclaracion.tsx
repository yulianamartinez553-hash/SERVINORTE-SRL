'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StepDeclaracionProps {
  formData: Record<string, unknown>
  onSubmit: () => void
  onBack: () => void
}

export function StepDeclaracion({ formData, onSubmit, onBack }: StepDeclaracionProps) {
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async () => {
    if (!accepted) {
      setError('Debe aceptar la declaración jurada para continuar')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, declaracion_jurada: true }),
      })

      const json = await res.json()

      if (!res.ok) {
        setSubmitError(json.error || 'Error al enviar el formulario')
        return
      }

      setSubmitted(true)
      onSubmit()
    } catch {
      setSubmitError('Error de conexión. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Datos Enviados!</h2>
        <p className="text-gray-500">
          Sus datos han sido registrados correctamente. Recursos Humanos procesará la actualización.
        </p>
      </motion.div>
    )
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
            <ShieldCheck className="w-5 h-5 text-[#1F4A8F]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Declaración Jurada</h2>
        </div>
      </div>

      <div className="bg-[#F7F8FA] border border-gray-200 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-700 leading-relaxed italic">
          "Declaro que los datos consignados en el presente formulario son correctos y reflejan mi situación actual."
        </p>
      </div>

      <div className="flex items-start gap-3 mb-6 p-4 bg-white border border-gray-200 rounded-xl">
        <Checkbox
          id="declaracion"
          checked={accepted}
          onCheckedChange={(checked) => {
            setAccepted(checked === true)
            if (checked) setError('')
          }}
          className="mt-0.5"
        />
        <Label htmlFor="declaracion" className="cursor-pointer text-sm leading-relaxed text-gray-700">
          He leído y acepto la declaración jurada. Confirmo que los datos proporcionados son verídicos y actuales.
        </Label>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={loading}>
          Atrás
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1"
          disabled={loading || !accepted}
          variant="success"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Enviar Actualización
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
