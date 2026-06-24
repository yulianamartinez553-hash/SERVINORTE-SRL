'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from './ProgressBar'
import { StepDNI } from './StepDNI'
import { StepPersonalData } from './StepPersonalData'
import { StepObraSocial } from './StepObraSocial'
import { StepDomicilio } from './StepDomicilio'
import { StepUbicacion } from './StepUbicacion'
import { StepEvidencia } from './StepEvidencia'
import { StepDeclaracion } from './StepDeclaracion'
import type { Employee } from '@/types'

type FormState = {
  // Step 0 - Employee
  employee?: Employee
  // Step 1 - Personal Data
  email?: string
  telefono?: string
  // Step 2 - Obra Social
  obra_social?: string
  url_obra_social?: string
  id_archivo_obra_social?: string
  // Step 3 - Domicilio
  provincia?: string
  localidad?: string
  barrio?: string
  calle?: string
  numero?: string
  manzana?: string
  block?: string
  piso?: string
  departamento?: string
  descripcion_vivienda?: string
  // Step 4 - Ubicacion
  latitud?: number
  longitud?: number
  direccion_formateada?: string
  place_id?: string
  // Step 5 - Evidencia
  url_imagen_domicilio?: string
  id_archivo_domicilio?: string
}

export function EmployeeForm() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormState>({})
  const [submitted, setSubmitted] = useState(false)

  const updateForm = (data: Partial<FormState>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => Math.max(0, s - 1))

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Actualización Enviada!</h2>
        <p className="text-gray-500 text-lg mb-2">Sus datos han sido registrados correctamente.</p>
        <p className="text-gray-400 text-sm">
          El equipo de Recursos Humanos procesará la actualización de su legajo.
          Si tiene alguna consulta, comuníquese con RRHH.
        </p>
        <div className="mt-8 bg-[#F7F8FA] rounded-xl p-4 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">Resumen de envío:</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p><span className="font-medium">Empleado:</span> {formData.employee?.nombre_completo}</p>
            <p><span className="font-medium">Legajo:</span> {formData.employee?.legajo}</p>
            <p><span className="font-medium">Fecha:</span> {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step > 0 && (
        <div className="mb-6">
          <ProgressBar currentStep={step} />
        </div>
      )}

      <Card className="shadow-lg border-0">
        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0">
                <StepDNI
                  onSuccess={(employee) => {
                    updateForm({ employee })
                    nextStep()
                  }}
                />
              </motion.div>
            )}

            {step === 1 && formData.employee && (
              <motion.div key="step-1">
                <StepPersonalData
                  employee={formData.employee}
                  defaultValues={{ email: formData.email, telefono: formData.telefono }}
                  onNext={(data) => {
                    updateForm(data)
                    nextStep()
                  }}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {step === 2 && formData.employee && (
              <motion.div key="step-2">
                <StepObraSocial
                  dni={formData.employee.dni}
                  defaultValues={{
                    obra_social: formData.obra_social,
                    url_obra_social: formData.url_obra_social,
                    id_archivo_obra_social: formData.id_archivo_obra_social,
                  }}
                  onNext={(data) => {
                    updateForm(data)
                    nextStep()
                  }}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3">
                <StepDomicilio
                  defaultValues={{
                    provincia: formData.provincia,
                    localidad: formData.localidad,
                    barrio: formData.barrio,
                    calle: formData.calle,
                    numero: formData.numero,
                    manzana: formData.manzana,
                    block: formData.block,
                    piso: formData.piso,
                    departamento: formData.departamento,
                    descripcion_vivienda: formData.descripcion_vivienda,
                  }}
                  onNext={(data) => {
                    updateForm(data)
                    nextStep()
                  }}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4">
                <StepUbicacion
                  defaultLocation={formData.latitud ? {
                    lat: formData.latitud,
                    lng: formData.longitud!,
                    address: formData.direccion_formateada || '',
                    placeId: formData.place_id,
                  } : undefined}
                  domicilio={formData.calle ? {
                    calle: formData.calle,
                    numero: formData.numero || '',
                    localidad: formData.localidad || '',
                    provincia: formData.provincia || '',
                  } : undefined}
                  onNext={(loc) => {
                    updateForm({
                      latitud: loc.lat,
                      longitud: loc.lng,
                      direccion_formateada: loc.address,
                      place_id: loc.placeId,
                    })
                    nextStep()
                  }}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {step === 5 && formData.employee && (
              <motion.div key="step-5">
                <StepEvidencia
                  dni={formData.employee.dni}
                  defaultValues={{
                    url_imagen_domicilio: formData.url_imagen_domicilio,
                    id_archivo_domicilio: formData.id_archivo_domicilio,
                  }}
                  onNext={(data) => {
                    updateForm(data)
                    nextStep()
                  }}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {step === 6 && formData.employee && (
              <motion.div key="step-6">
                <StepDeclaracion
                  formData={{
                    dni: formData.employee.dni,
                    legajo: formData.employee.legajo,
                    nombre_completo: formData.employee.nombre_completo,
                    cuil: formData.employee.cuil,
                    email: formData.email,
                    telefono: formData.telefono,
                    obra_social: formData.obra_social,
                    url_obra_social: formData.url_obra_social,
                    id_archivo_obra_social: formData.id_archivo_obra_social,
                    provincia: formData.provincia,
                    localidad: formData.localidad,
                    barrio: formData.barrio,
                    calle: formData.calle,
                    numero: formData.numero,
                    manzana: formData.manzana,
                    block: formData.block,
                    piso: formData.piso,
                    departamento: formData.departamento,
                    descripcion_vivienda: formData.descripcion_vivienda,
                    latitud: formData.latitud,
                    longitud: formData.longitud,
                    direccion_formateada: formData.direccion_formateada,
                    place_id: formData.place_id,
                    url_imagen_domicilio: formData.url_imagen_domicilio,
                    id_archivo_domicilio: formData.id_archivo_domicilio,
                  }}
                  onSubmit={() => setSubmitted(true)}
                  onBack={prevStep}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
