import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'MANAGER' | 'ADMIN';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address?: string;
  city?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Hall {
  id: string;
  hotelId: string;
  name: string;
  maxCapacity: number;
  areaSqm?: number;
  basePricePerDay: number;
  description?: string;
  amenities: string[];
  images: string[];
  isActive: boolean;
  seatingLayouts?: SeatingLayout[];
}

export interface SeatingLayout {
  id: string;
  hallId: string;
  layoutType: 'THEATER' | 'CLASSROOM' | 'U_SHAPE' | 'BANQUET' | 'COCKTAIL' | 'BOARDROOM';
  capacity: number;
  priceModifier: number;
  description?: string;
}

export interface CateringCategory {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  items: CateringItem[];
}

export interface CateringItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  pricePerPerson: number;
  minPersons: number;
  dietaryOptions: string[];
  isActive: boolean;
}

export interface ServiceCategory {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  services: Service[];
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  pricingType: 'FIXED' | 'PER_PERSON' | 'PER_DAY' | 'PER_HOUR';
  basePrice: number;
  unit?: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  eventName?: string;
  eventFormat?: string;
  startDate: Date;
  endDate: Date;
  numGuests: number;
  totalPrice?: number;
  notes?: string;
  pdfUrl?: string;
}

export interface BookingHall {
  id: string;
  bookingId: string;
  hallId: string;
  seatingLayoutId?: string;
  bookingDate: Date;
  price: number;
}

export interface BookingCatering {
  id: string;
  bookingId: string;
  cateringItemId: string;
  quantity: number;
  serviceDate?: Date;
  price: number;
}

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  quantity: number;
  price: number;
}

export interface CreateBookingDTO {
  hotelId: string;
  eventName?: string;
  eventFormat?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  notes?: string;
}

export interface UpdateBookingDTO {
  eventName?: string;
  eventFormat?: string;
  startDate?: string;
  endDate?: string;
  numGuests?: number;
  notes?: string;
  halls?: Array<{
    hallId: string;
    seatingLayoutId?: string;
    bookingDate: string;
  }>;
  catering?: Array<{
    cateringItemId: string;
    quantity: number;
    serviceDate?: string;
  }>;
  services?: Array<{
    serviceId: string;
    quantity: number;
  }>;
}

export interface PriceCalculation {
  hallsTotal: number;
  cateringTotal: number;
  servicesTotal: number;
  grandTotal: number;
  breakdown: {
    halls: Array<{ name: string; date: string; price: number }>;
    catering: Array<{ name: string; quantity: number; price: number }>;
    services: Array<{ name: string; quantity: number; price: number }>;
  };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
