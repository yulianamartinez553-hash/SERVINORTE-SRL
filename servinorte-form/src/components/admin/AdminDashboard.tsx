'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LogIn, LogOut, Search, Download, RefreshCw, MapPin, ExternalLink,
  FileText, Users, CheckCircle, AlertCircle, Clock, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import type { Submission } from '@/types'

const ITEMS_PER_PAGE = 20

export function AdminDashboard() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token')
    if (saved) {
      setToken(saved)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setLoginError(json.error || 'Contraseña incorrecta')
        return
      }
      setToken(json.token)
      sessionStorage.setItem('admin_token', json.token)
      setIsAuthenticated(true)
    } catch {
      setLoginError('Error de conexión')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    sessionStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setSubmissions([])
  }

  const fetchSubmissions = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(search && { search }),
        ...(estadoFilter && estadoFilter !== 'all' && { estado: estadoFilter }),
      })
      const res = await fetch(`/api/admin/submissions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      const json = await res.json()
      if (json.success) {
        setSubmissions(json.data)
        setTotal(json.total)
      }
    } catch {
      setError('Error al cargar registros')
    } finally {
      setLoading(false)
    }
  }, [token, page, search, estadoFilter])

  useEffect(() => {
    if (isAuthenticated) fetchSubmissions()
  }, [isAuthenticated, fetchSubmissions])

  const handleExport = (format: 'xlsx' | 'csv') => {
    const url = `/api/admin/export?format=${format}`
    const a = document.createElement('a')
    a.href = url
    a.download = `servinorte-actualizaciones.${format}`
    const headers = new Headers({ Authorization: `Bearer ${token}` })
    fetch(url, { headers }).then(r => r.blob()).then(blob => {
      a.href = URL.createObjectURL(blob)
      a.click()
    })
  }

  const updateEstado = async (id: string, estado: string) => {
    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, estado }),
    })
    fetchSubmissions()
  }

  const estadoBadge = (estado: string) => {
    if (estado === 'completado') return <Badge variant="success">Completado</Badge>
    if (estado === 'pendiente') return <Badge variant="warning">Pendiente</Badge>
    return <Badge variant="destructive">Anulado</Badge>
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const completados = submissions.filter(s => s.estado === 'completado').length

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 bg-[#1F4A8F] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl">Panel Administrativo</CardTitle>
              <p className="text-sm text-gray-500 mt-1">SERVINORTE · Recursos Humanos</p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" required>Contraseña de Acceso</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ingrese la contraseña"
                    autoComplete="current-password"
                  />
                </div>
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? 'Verificando...' : 'Ingresar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1F4A8F] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Panel Administrativo</h1>
            <p className="text-blue-200 text-sm">SERVINORTE · Actualización de Datos</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-white border-white/30 hover:bg-white/10">
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Registros', value: total, icon: Users, color: 'text-[#1F4A8F]' },
            { label: 'Completados', value: submissions.filter(s=>s.estado==='completado').length, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Pendientes', value: submissions.filter(s=>s.estado==='pendiente').length, icon: Clock, color: 'text-yellow-600' },
            { label: 'Anulados', value: submissions.filter(s=>s.estado==='anulado').length, icon: AlertCircle, color: 'text-red-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters + Export */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Buscar por nombre, DNI o legajo</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-full sm:w-44 space-y-1">
                <Label className="text-xs">Estado</Label>
                <Select value={estadoFilter} onValueChange={v => { setEstadoFilter(v); setPage(1) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="anulado">Anulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fetchSubmissions()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
                  <Download className="w-4 h-4" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                  <FileText className="w-4 h-4" /> CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#1F4A8F] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron registros</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Legajo</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Obra Social</TableHead>
                      <TableHead>Domicilio</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Archivos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.legajo}</TableCell>
                        <TableCell className="whitespace-nowrap">{s.nombre_completo}</TableCell>
                        <TableCell>{s.dni}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{s.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{s.telefono}</TableCell>
                        <TableCell>{s.obra_social}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {s.calle} {s.numero}, {s.localidad}, {s.provincia}
                        </TableCell>
                        <TableCell>
                          {s.latitud && s.longitud ? (
                            <a
                              href={`https://www.google.com/maps?q=${s.latitud},${s.longitud}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#1F4A8F] hover:underline text-xs"
                            >
                              <MapPin className="w-3 h-3" /> Ver mapa
                            </a>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {s.url_obra_social && (
                              <a href={s.url_obra_social} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[#1F4A8F] hover:underline">
                                <ExternalLink className="w-3 h-3" /> OS
                              </a>
                            )}
                            {s.url_imagen_domicilio && (
                              <a href={s.url_imagen_domicilio} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[#1F4A8F] hover:underline">
                                <ExternalLink className="w-3 h-3" /> Dom.
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{estadoBadge(s.estado)}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-gray-500">
                          {formatDate(s.created_at)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={s.estado}
                            onValueChange={(v) => updateEstado(s.id, v)}
                          >
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completado">Completado</SelectItem>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="anulado">Anulado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
