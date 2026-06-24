'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PROVINCIAS_AR = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
  'Tucumán', 'Ciudad Autónoma de Buenos Aires',
]

const schema = z.object({
  provincia: z.string().min(2, 'La provincia es obligatoria'),
  localidad: z.string().min(2, 'La localidad es obligatoria'),
  barrio: z.string().min(1, 'El barrio es obligatorio'),
  calle: z.string().min(2, 'La calle es obligatoria'),
  numero: z.string().min(1, 'El número es obligatorio'),
  manzana: z.string().min(1, 'Complete este campo o escriba "No corresponde"'),
  block: z.string().min(1, 'Complete este campo o escriba "No corresponde"'),
  piso: z.string().min(1, 'Complete este campo o escriba "No corresponde"'),
  departamento: z.string().min(1, 'Complete este campo o escriba "No corresponde"'),
  descripcion_vivienda: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000),
})

type FormValues = z.infer<typeof schema>

interface StepDomicilioProps {
  defaultValues?: Partial<FormValues>
  onNext: (data: FormValues) => void
  onBack: () => void
}

export function StepDomicilio({ defaultValues, onNext, onBack }: StepDomicilioProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      manzana: 'No corresponde',
      block: 'No corresponde',
      piso: 'No corresponde',
      departamento: 'No corresponde',
      ...defaultValues,
    },
  })

  const provincia = watch('provincia')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#EEF1F4] rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-[#1F4A8F]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Domicilio Actual</h2>
        </div>
        <p className="text-sm text-gray-500">Complete todos los campos. Si alguno no aplica, escriba "No corresponde".</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label required>Provincia</Label>
            <Select
              value={provincia}
              onValueChange={(val) => setValue('provincia', val, { shouldValidate: true })}
            >
              <SelectTrigger error={errors.provincia?.message}>
                <SelectValue placeholder="Seleccionar provincia" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCIAS_AR.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provincia && <p className="text-xs text-red-500">{errors.provincia.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="localidad" required>Localidad / Ciudad</Label>
            <Input
              id="localidad"
              placeholder="Ej: Salta Capital"
              {...register('localidad')}
              error={errors.localidad?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="barrio" required>Barrio / Zona</Label>
          <Input
            id="barrio"
            placeholder="Ej: Barrio Centro, Villa San Lorenzo"
            {...register('barrio')}
            error={errors.barrio?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="calle" required>Calle</Label>
            <Input
              id="calle"
              placeholder="Ej: Av. Bolivia"
              {...register('calle')}
              error={errors.calle?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero" required>Número</Label>
            <Input
              id="numero"
              placeholder="Ej: 5120"
              {...register('numero')}
              error={errors.numero?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="manzana" required>Manzana</Label>
            <Input id="manzana" {...register('manzana')} error={errors.manzana?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block" required>Block / Torre</Label>
            <Input id="block" {...register('block')} error={errors.block?.message} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="piso" required>Piso</Label>
            <Input id="piso" {...register('piso')} error={errors.piso?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departamento" required>Departamento</Label>
            <Input id="departamento" {...register('departamento')} error={errors.departamento?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion_vivienda" required>Descripción Detallada de la Vivienda</Label>
          <Textarea
            id="descripcion_vivienda"
            placeholder="Describa su vivienda: tipo (casa/depto/PH), referencias de la ubicación, color, características especiales..."
            rows={4}
            {...register('descripcion_vivienda')}
            error={errors.descripcion_vivienda?.message}
          />
          <p className="text-xs text-gray-400">Mínimo 10 caracteres. Incluya referencias útiles para ubicar el domicilio.</p>
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
