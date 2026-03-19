// API Types
export interface User {
  id: string;
  email: string;
  role: 'client' | 'manager' | 'admin';
  companyName?: string;
  phone?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address?: string;
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
  amenities?: Record<string, any>;
  images?: string[];
  isActive: boolean;
}

export interface SeatingLayout {
  id: string;
  hallId: string;
  layoutType: 'theater' | 'classroom' | 'u_shape' | 'banquet' | 'cocktail';
  capacity: number;
  priceModifier?: number;
}

export interface CateringCategory {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface CateringItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  pricePerPerson: number;
  minPersons?: number;
  dietaryOptions?: Record<string, any>;
  isActive: boolean;
  category?: CateringCategory;
}

export interface ServiceCategory {
  id: string;
  hotelId: string;
  name: string;
  sortOrder?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  pricingType: 'fixed' | 'per_person' | 'per_day' | 'per_hour';
  basePrice: number;
  unit?: string;
  isActive: boolean;
  category?: ServiceCategory;
}

export type BookingStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  status: BookingStatus;
  eventName?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  eventFormat?: string;
  totalPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  hotel?: Hotel;
  bookingHalls?: BookingHall[];
  bookingCatering?: BookingCatering[];
  bookingServices?: BookingService[];
}

export interface BookingHall {
  id: string;
  bookingId: string;
  hallId: string;
  seatingLayoutId?: string;
  date: string;
  price: number;
  hall?: Hall;
  seatingLayout?: SeatingLayout;
}

export interface BookingCatering {
  id: string;
  bookingId: string;
  cateringItemId: string;
  quantity: number;
  date?: string;
  price: number;
  cateringItem?: CateringItem;
}

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  quantity: number;
  price: number;
  service?: Service;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  companyName?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Hotels: undefined;
  HotelDetail: { hotelId: string };
  Wizard: { hotelId: string; bookingId?: string };
  BookingDetail: { bookingId: string };
  MyBookings: undefined;
};
