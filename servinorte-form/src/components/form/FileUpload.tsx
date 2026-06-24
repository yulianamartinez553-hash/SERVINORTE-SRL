'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, Loader2, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  type: 'obra-social' | 'evidencia-domicilio'
  dni: string
  accept: string
  maxSizeMB: number
  label: string
  helpText: string
  onUpload: (url: string, id: string) => void
  existingUrl?: string
  showPreview?: boolean
}

export function FileUpload({ type, dni, accept, maxSizeMB, label, helpText, onUpload, existingUrl, showPreview = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(!!existingUrl)
  const [url, setUrl] = useState(existingUrl || '')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setError('')

    const ext = file.name.split('.').pop()?.toLowerCase()
    const validExts = accept.split(',').map(e => e.replace('.', '').trim())

    if (!ext || !validExts.includes(ext)) {
      setError(`Formato no permitido. Use: ${accept}`)
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo supera el tamaño máximo de ${maxSizeMB}MB`)
      return
    }

    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('dni', dni)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Error al subir el archivo')
        return
      }

      setUrl(json.url)
      setUploaded(true)
      onUpload(json.url, json.id)
    } catch {
      setError('Error de conexión al subir el archivo')
    } finally {
      setUploading(false)
    }
  }, [type, dni, accept, maxSizeMB, showPreview, onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleRemove = () => {
    setUploaded(false)
    setUrl('')
    setFileName('')
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onUpload('', '')
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!uploaded ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`file-upload-zone border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragging ? 'border-[#1F4A8F] bg-[#EEF1F4] dragging' : 'border-gray-200 hover:border-[#1F4A8F] hover:bg-[#F7F8FA]'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#1F4A8F] animate-spin" />
                <p className="text-sm text-gray-500">Subiendo archivo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{helpText}</p>
                <p className="text-xs text-gray-400">Haga clic o arrastre el archivo aquí</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-green-200 bg-green-50 rounded-xl p-4"
          >
            {showPreview && preview && (
              <div className="mb-3">
                <img src={preview} alt="Vista previa" className="max-h-48 w-full object-contain rounded-lg border border-green-100" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{fileName || 'Archivo subido'}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                  Ver en Google Drive
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500 shrink-0"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
