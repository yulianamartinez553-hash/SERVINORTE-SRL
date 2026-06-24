'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 0, label: 'Identificación' },
  { id: 1, label: 'Datos Personales' },
  { id: 2, label: 'Obra Social' },
  { id: 3, label: 'Domicilio' },
  { id: 4, label: 'Ubicación' },
  { id: 5, label: 'Evidencia' },
  { id: 6, label: 'Declaración' },
]

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progress = Math.round((currentStep / (STEPS.length - 1)) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>Paso {currentStep + 1} de {STEPS.length}</span>
        <span>{progress}% completado</span>
      </div>

      <Progress value={progress} className="h-1.5" />

      <div className="hidden sm:flex items-center justify-between px-1">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5">
              <motion.div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  isCompleted && 'bg-[#1F4A8F] text-white',
                  isCurrent && 'bg-[#1F4A8F] text-white ring-2 ring-[#1F4A8F] ring-offset-2',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400'
                )}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id + 1}
              </motion.div>
              <span className={cn(
                'text-[10px] font-medium text-center leading-tight max-w-[60px]',
                isCurrent ? 'text-[#1F4A8F]' : isCompleted ? 'text-gray-600' : 'text-gray-400'
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
