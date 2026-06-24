import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Actualización de Datos - SERVINORTE',
  description: 'Formulario de actualización de datos personales para empleados de SERVINORTE SRL.',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F7F8FA]">
        {children}
      </body>
    </html>
  )
}
