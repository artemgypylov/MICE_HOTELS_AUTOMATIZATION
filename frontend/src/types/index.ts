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
  description?: string;
  logoUrl?: string;
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
  floor?: number;
  naturalLight: boolean;
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
  startDate: string;
  endDate: string;
  numGuests: number;
  totalPrice?: number;
  notes?: string;
  pdfUrl?: string;
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
  bookingDate: string;
  price: number;
  hall?: Hall;
  seatingLayout?: SeatingLayout;
}

export interface BookingCatering {
  id: string;
  bookingId: string;
  cateringItemId: string;
  quantity: number;
  serviceDate?: string;
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

export interface WizardData {
  hotelId: string;
  eventName: string;
  eventFormat: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  notes?: string;
  selectedHalls: Array<{
    hallId: string;
    seatingLayoutId?: string;
    bookingDate: string;
  }>;
  selectedCatering: Array<{
    cateringItemId: string;
    quantity: number;
    serviceDate?: string;
  }>;
  selectedServices: Array<{
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
    halls: Array<{ name: string; date: string; layout?: string; price: number }>;
    catering: Array<{ name: string; quantity: number; price: number }>;
    services: Array<{ name: string; quantity: number; price: number }>;
  };
}
