import Image from "next/image"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("bg-[#1F4A8F] text-white shadow-lg", className)}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                <rect width="40" height="40" rx="8" fill="#1F4A8F"/>
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                  fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial">S</text>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold tracking-wide">SERVINORTE</div>
              <div className="text-blue-200 text-xs font-medium tracking-widest uppercase">Recursos Humanos</div>
            </div>
          </div>
          <div className="border-t border-blue-400/40 pt-4 w-full max-w-lg">
            <h1 className="text-xl font-semibold text-white">
              Actualización de Datos Personales
            </h1>
            <p className="text-blue-200 text-sm mt-1 leading-relaxed">
              Por favor complete la siguiente información para actualizar sus datos de legajo.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
