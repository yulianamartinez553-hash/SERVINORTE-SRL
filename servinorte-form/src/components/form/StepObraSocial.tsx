'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from './FileUpload'

const schema = z.object({
  obra_social: z.string().min(2, 'El nombre de la obra social es obligatorio'),
})

type FormValues = z.infer<typeof schema>

interface StepObraSocialProps {
  defaultValues?: Partial<FormValues & { url_obra_social?: string; id_archivo_obra_social?: string }>
  dni: string
  onNext: (data: FormValues & { url_obra_social: string; id_archivo_obra_social: string }) => void
  onBack: () => void
}

export function StepObraSocial({ defaultValues, dni, onNext, onBack }: StepObraSocialProps) {
  const [fileUrl, setFileUrl] = useState(defaultValues?.url_obra_social || '')
  const [fileId, setFileId] = useState(defaultValues?.id_archivo_obra_social || '')
  const [fileError, setFileError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleFormSubmit = (data: FormValues) => {
    if (!fileUrl) {
      setFileError('Debe adjuntar la constancia o credencial de obra social')
      return
    }
    setFileError('')
    onNext({ ...data, url_obra_social: fileUrl, id_archivo_obra_social: fileId })
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
            <Heart className="w-5 h-5 text-[#1F4A8F]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Obra Social</h2>
        </div>
        <p className="text-sm text-gray-500">Informe su obra social actual y adjunte la constancia.</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="obra_social" required>Nombre de la Obra Social</Label>
          <Input
            id="obra_social"
            type="text"
            placeholder="Ej: OSDE, Swiss Medical, PAMI..."
            {...register('obra_social')}
            error={errors.obra_social?.message}
          />
        </div>

        <div className="space-y-2">
          <Label required>Constancia o Credencial de Obra Social</Label>
          <FileUpload
            type="obra-social"
            dni={dni}
            accept=".jpg,.jpeg,.png,.pdf"
            maxSizeMB={10}
            label="Subir constancia o credencial"
            helpText="JPG, JPEG, PNG o PDF · Máximo 10MB"
            onUpload={(url, id) => {
              setFileUrl(url)
              setFileId(id)
              setFileError('')
            }}
            existingUrl={fileUrl}
          />
          {fileError && <p className="text-xs text-red-500">{fileError}</p>}
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
