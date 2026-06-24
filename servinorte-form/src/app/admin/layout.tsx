import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel Administrativo - SERVINORTE',
  description: 'Panel de administración de actualizaciones de datos.',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {children}
    </div>
  )
}
