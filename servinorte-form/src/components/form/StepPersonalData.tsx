'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Phone, User, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Employee } from '@/types'

const schema = z.object({
  email: z.string().min(1, 'El correo electrónico es obligatorio').email('Ingrese un correo electrónico válido'),
  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^\+54[\s]?9?[\s]?\d{2,4}[\s-]?\d{6,8}$/, 'Formato inválido. Ejemplo: +54 9 387 5555555'),
})

type FormValues = z.infer<typeof schema>

interface StepPersonalDataProps {
  employee: Employee
  defaultValues?: Partial<FormValues>
  onNext: (data: FormValues) => void
  onBack: () => void
}

function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-gray-500 text-xs uppercase tracking-wide">{label}</Label>
      <div className="flex items-center gap-3 bg-[#F7F8FA] border border-gray-100 rounded-lg px-4 py-3">
        <Icon className="w-4 h-4 text-[#1F4A8F] shrink-0" />
        <span className="text-gray-700 font-medium">{value}</span>
      </div>
    </div>
  )
}

export function StepPersonalData({ employee, defaultValues, onNext, onBack }: StepPersonalDataProps) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (defaultValues?.email) setValue('email', defaultValues.email)
    if (defaultValues?.telefono) setValue('telefono', defaultValues.telefono)
  }, [defaultValues, setValue])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Datos del Empleado</h2>
        <p className="text-sm text-gray-500 mt-1">Los datos de identificación se completan automáticamente.</p>
      </div>

      <div className="bg-[#F7F8FA] rounded-xl p-5 mb-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#1F4A8F] uppercase tracking-wide">Datos de Identificación (Solo Lectura)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadOnlyField label="Nombre Completo" value={employee.nombre_completo} icon={User} />
          <ReadOnlyField label="Legajo" value={employee.legajo} icon={Hash} />
          <ReadOnlyField label="DNI" value={employee.dni} icon={Hash} />
          <ReadOnlyField label="CUIL" value={employee.cuil} icon={Hash} />
        </div>
      </div>

      <Separator className="my-6" />

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Datos de Contacto</h3>

        <div className="space-y-2">
          <Label htmlFor="email" required>Correo Electrónico Personal</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@gmail.com"
              className="pl-10"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono" required>Teléfono Celular</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="telefono"
              type="tel"
              placeholder="+54 9 387 5555555"
              className="pl-10"
              {...register('telefono')}
              error={errors.telefono?.message}
            />
          </div>
          <p className="text-xs text-gray-400">Formato: +54 9 [código de área] [número]</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Atrás
          </Button>
          <Button type="submit" className="flex-1">
            Continuar
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
