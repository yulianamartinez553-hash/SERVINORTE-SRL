import { Header } from '@/components/layout/Header'
import { EmployeeForm } from '@/components/form/EmployeeForm'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 py-8 px-4">
        <EmployeeForm />
      </div>
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        <p>© {new Date().getFullYear()} SERVINORTE SRL · Actualización de Datos de Empleados</p>
        <p className="mt-1">Este formulario es de uso exclusivo del personal de la empresa.</p>
      </footer>
    </main>
  )
}
