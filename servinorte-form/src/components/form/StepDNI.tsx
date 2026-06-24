'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Search, Loader2, AlertCircle, User, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Employee } from '@/types'

const schema = z.object({
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede tener más de 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
})

type FormValues = z.infer<typeof schema>

interface StepDNIProps {
  onSuccess: (employee: Employee) => void
}

export function StepDNI({ onSuccess }: StepDNIProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [found, setFound] = useState<Employee | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError('')
    setFound(null)

    try {
      const res = await fetch(`/api/employees/${data.dni}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Error al verificar el DNI')
        return
      }

      setFound(json.employee)
      setTimeout(() => onSuccess(json.employee), 1200)
    } catch {
      setError('Error de conexión. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#EEF1F4] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-[#1F4A8F]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Identificación</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Ingrese su número de DNI para comenzar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="dni" required>Número de DNI</Label>
          <Input
            id="dni"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Ej: 30123456"
            maxLength={8}
            {...register('dni')}
            error={errors.dni?.message}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) e.preventDefault()
            }}
            disabled={loading || !!found}
          />
          <p className="text-xs text-gray-400">Solo números, sin puntos ni espacios</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {found && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">{found.nombre_completo}</p>
                <p className="text-sm text-green-600">Legajo: {found.legajo} · DNI: {found.dni}</p>
              </div>
            </div>
          </motion.div>
        )}

        {!found && (
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Verificar DNI
              </>
            )}
          </Button>
        )}
      </form>
    </motion.div>
  )
}
