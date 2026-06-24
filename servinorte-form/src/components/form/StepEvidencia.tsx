'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FileUpload } from './FileUpload'

interface StepEvidenciaProps {
  defaultValues?: { url_imagen_domicilio?: string; id_archivo_domicilio?: string }
  dni: string
  onNext: (data: { url_imagen_domicilio: string; id_archivo_domicilio: string }) => void
  onBack: () => void
}

export function StepEvidencia({ defaultValues, dni, onNext, onBack }: StepEvidenciaProps) {
  const [fileUrl, setFileUrl] = useState(defaultValues?.url_imagen_domicilio || '')
  const [fileId, setFileId] = useState(defaultValues?.id_archivo_domicilio || '')
  const [fileError, setFileError] = useState('')

  const handleNext = () => {
    if (!fileUrl) {
      setFileError('Debe adjuntar una imagen de evidencia del domicilio')
      return
    }
    setFileError('')
    onNext({ url_imagen_domicilio: fileUrl, id_archivo_domicilio: fileId })
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
            <Camera className="w-5 h-5 text-[#1F4A8F]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Evidencia del Domicilio</h2>
        </div>
        <p className="text-sm text-gray-500">
          Adjunte una foto de la fachada de su vivienda, captura de Google Maps, o Google Street View.
        </p>
      </div>

      <div className="bg-[#F7F8FA] rounded-xl p-4 mb-6 space-y-2">
        <p className="text-sm font-medium text-gray-700">Se acepta:</p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Captura de pantalla de Google Maps mostrando su domicilio</li>
          <li>• Captura de Google Street View de la fachada</li>
          <li>• Fotografía frontal de su vivienda</li>
        </ul>
      </div>

      <div className="space-y-2 mb-6">
        <Label required>Imagen de Evidencia del Domicilio</Label>
        <FileUpload
          type="evidencia-domicilio"
          dni={dni}
          accept=".jpg,.jpeg,.png"
          maxSizeMB={10}
          label="Subir imagen del domicilio"
          helpText="JPG, JPEG o PNG · Máximo 10MB"
          onUpload={(url, id) => {
            setFileUrl(url)
            setFileId(id)
            setFileError('')
          }}
          existingUrl={fileUrl}
          showPreview
        />
        {fileError && <p className="text-xs text-red-500">{fileError}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button type="button" onClick={handleNext} className="flex-1">
          Continuar
        </Button>
      </div>
    </motion.div>
  )
}
