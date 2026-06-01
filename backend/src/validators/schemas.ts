import { z } from 'zod';

/**
 * Centralised Zod schemas for request validation.
 * Used together with the `validate` middleware.
 */

// ---- Auth ----------------------------------------------------------------

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

// ---- Bookings ------------------------------------------------------------

export const createBookingSchema = z.object({
  hotelId: z.string().min(1, 'hotelId обязателен'),
  eventName: z.string().optional(),
  eventFormat: z.string().optional(),
  startDate: z.string().min(1, 'startDate обязателен'),
  endDate: z.string().min(1, 'endDate обязателен'),
  numGuests: z.union([z.number(), z.string()]),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Комментарий не может быть пустым'),
});

const bookingStatusValues = ['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const;

export const statusChangeSchema = z.object({
  status: z.enum(bookingStatusValues, {
    errorMap: () => ({ message: 'Недопустимый статус' }),
  }),
  note: z.string().optional(),
});

// ---- Hotels --------------------------------------------------------------

export const createHotelSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Некорректный email').optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

// ---- Hall availability ---------------------------------------------------

export const hallAvailabilitySchema = z.object({
  dateFrom: z.string().min(1, 'dateFrom обязателен'),
  dateTo: z.string().min(1, 'dateTo обязателен'),
  reason: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type StatusChangeInput = z.infer<typeof statusChangeSchema>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type HallAvailabilityInput = z.infer<typeof hallAvailabilitySchema>;
