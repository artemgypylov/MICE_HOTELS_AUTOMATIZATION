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
  hotelId?: string;
  supplierId?: string;
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
  hotelId?: string;
  supplierId?: string;
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
  hotelId?: string;
  supplierId?: string;
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

// ============================================================================
// NEW MULTI-SUPPLIER EVENT TYPES
// ============================================================================

export type SupplierType = 'VENUE' | 'CATERING' | 'DECORATION' | 'AV_IT' | 'TRANSFER' | 'ACCOMMODATION';
export type EventStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type EventSupplierStatus = 'SELECTED' | 'CONFIRMED' | 'DECLINED';
export type ItemType = 'HALL' | 'CATERING' | 'SERVICE';

export interface Supplier {
  id: string;
  name: string;
  supplierType: SupplierType;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Event {
  id: string;
  userId: string;
  status: EventStatus;
  eventName?: string;
  eventFormat?: string;
  startDate: Date;
  endDate: Date;
  numGuests: number;
  totalPrice?: number;
  notes?: string;
  pdfUrl?: string;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventSupplier {
  id: string;
  eventId: string;
  supplierId: string;
  supplierType: SupplierType;
  status: EventSupplierStatus;
  totalPrice?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventItem {
  id: string;
  eventId: string;
  eventSupplierId: string;
  itemType: ItemType;
  itemId: string;
  quantity: number;
  serviceDate?: Date;
  price: number;
  notes?: string;
  createdAt?: Date;
}

// DTOs for Event Management

export interface CreateEventDTO {
  eventName?: string;
  eventFormat?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  notes?: string;
}

export interface UpdateEventDTO {
  eventName?: string;
  eventFormat?: string;
  startDate?: string;
  endDate?: string;
  numGuests?: number;
  notes?: string;
}

export interface AddSupplierToEventDTO {
  supplierId: string;
  supplierType: SupplierType;
  notes?: string;
}

export interface UpdateEventSupplierDTO {
  status?: EventSupplierStatus;
  notes?: string;
}

export interface AddItemToEventDTO {
  eventSupplierId: string;
  itemType: ItemType;
  itemId: string;
  quantity: number;
  serviceDate?: string;
  notes?: string;
}

export interface UpdateEventItemDTO {
  quantity?: number;
  serviceDate?: string;
  price?: number;
  notes?: string;
}

// DTOs for Supplier Management

export interface CreateSupplierDTO {
  name: string;
  supplierType: SupplierType;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateSupplierDTO {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}

export interface SupplierFilters {
  supplierType?: SupplierType;
  city?: string;
  country?: string;
  isActive?: boolean;
}

export interface SearchSuppliersDTO {
  query?: string;
  supplierType?: SupplierType;
  city?: string;
  country?: string;
  minCapacity?: number;
}

// Response types with populated relations

export interface EventWithSuppliers extends Event {
  eventSuppliers: Array<EventSupplier & {
    supplier: Supplier;
    eventItems: Array<EventItem & {
      hall?: Hall;
      cateringItem?: CateringItem;
      service?: Service;
    }>;
  }>;
}

export interface SupplierWithOffers extends Supplier {
  halls?: Hall[];
  cateringCategories?: CateringCategory[];
  serviceCategories?: ServiceCategory[];
}

export interface EventPriceCalculation {
  bySupplier: Array<{
    supplierId: string;
    supplierName: string;
    supplierType: SupplierType;
    total: number;
    items: Array<{
      name: string;
      itemType: ItemType;
      quantity: number;
      price: number;
      serviceDate?: string;
    }>;
  }>;
  grandTotal: number;
}

// ============================================================================
// EVENT QUOTE TYPES (Sprint 2)
// ============================================================================

export interface EventQuoteRequest {
  eventName?: string;
  eventFormat?: string;
  city?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  budget?: number;
  selectedOffers: Array<{
    supplierId: string;
    itemType: ItemType;
    itemId: string;
    quantity?: number;
    serviceDate?: string;
  }>;
}

export interface EventQuoteItem {
  itemId: string;
  itemType: ItemType;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceDate?: string;
}

export interface EventQuoteSupplier {
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  items: EventQuoteItem[];
  total: number;
}

export interface EventQuote {
  eventName?: string;
  eventFormat?: string;
  city?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  numDays: number;
  budget?: number;
  supplierBreakdown: EventQuoteSupplier[];
  subtotal: number;
  platformCommission: number;
  grandTotal: number;
  withinBudget: boolean;
  currency: string;
  generatedAt: string;
}
