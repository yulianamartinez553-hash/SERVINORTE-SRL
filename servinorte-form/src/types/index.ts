export interface Employee {
  id: number;
  dni: string;
  legajo: string;
  nombre_completo: string;
  cuil: string;
  is_active: boolean;
  created_at: string;
}

export interface FormData {
  // Employee (read-only)
  legajo: string;
  nombre_completo: string;
  dni: string;
  cuil: string;
  // Section 1
  email: string;
  telefono: string;
  // Section 2
  obra_social: string;
  obra_social_file?: File | null;
  url_obra_social?: string;
  id_archivo_obra_social?: string;
  // Section 3
  provincia: string;
  localidad: string;
  barrio: string;
  calle: string;
  numero: string;
  manzana: string;
  block: string;
  piso: string;
  departamento: string;
  descripcion_vivienda: string;
  // Section 4
  latitud?: number;
  longitud?: number;
  direccion_formateada?: string;
  place_id?: string;
  // Section 5
  evidencia_domicilio_file?: File | null;
  url_imagen_domicilio?: string;
  id_archivo_domicilio?: string;
  // Section 6
  declaracion_jurada: boolean;
}

export interface Submission {
  id: string;
  employee_id: number;
  legajo: string;
  nombre_completo: string;
  dni: string;
  cuil: string;
  email: string;
  telefono: string;
  obra_social: string;
  url_obra_social?: string;
  id_archivo_obra_social?: string;
  provincia: string;
  localidad: string;
  barrio: string;
  calle: string;
  numero: string;
  manzana?: string;
  block?: string;
  piso?: string;
  departamento?: string;
  descripcion_vivienda: string;
  latitud?: number;
  longitud?: number;
  direccion_formateada?: string;
  place_id?: string;
  url_imagen_domicilio?: string;
  id_archivo_domicilio?: string;
  declaracion_jurada: boolean;
  estado: 'pendiente' | 'completado' | 'anulado';
  sheets_row?: number;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MapLocation {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface AdminFilters {
  search?: string;
  estado?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
