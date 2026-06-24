import { z } from 'zod';

export const dniSchema = z.object({
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede tener más de 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo puede contener números'),
});

export const personalDataSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingrese un correo electrónico válido'),
  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(
      /^\+54\s?9?\s?\d{2,4}[\s-]?\d{6,8}$/,
      'Ingrese un teléfono válido. Ejemplo: +54 9 387 5555555'
    ),
});

export const obraSocialSchema = z.object({
  obra_social: z
    .string()
    .min(2, 'El nombre de la obra social es obligatorio')
    .max(200, 'El nombre no puede superar los 200 caracteres'),
});

export const domicilioSchema = z.object({
  provincia: z.string().min(2, 'La provincia es obligatoria'),
  localidad: z.string().min(2, 'La localidad es obligatoria'),
  barrio: z.string().min(1, 'El barrio es obligatorio'),
  calle: z.string().min(2, 'La calle es obligatoria'),
  numero: z.string().min(1, 'El número es obligatorio'),
  manzana: z.string().min(1, 'La manzana es obligatoria'),
  block: z.string().min(1, 'El block es obligatorio'),
  piso: z.string().min(1, 'El piso es obligatorio'),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
  descripcion_vivienda: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede superar los 1000 caracteres'),
});

export const ubicacionSchema = z.object({
  latitud: z.number({ error: 'Debe marcar su ubicación en el mapa' }),
  longitud: z.number({ error: 'Debe marcar su ubicación en el mapa' }),
  direccion_formateada: z.string().optional(),
  place_id: z.string().optional(),
});

export const declaracionSchema = z.object({
  declaracion_jurada: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debe aceptar la declaración jurada para continuar',
    }),
});
