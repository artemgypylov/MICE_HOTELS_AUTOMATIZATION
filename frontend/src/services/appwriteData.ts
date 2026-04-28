import { Booking, CateringCategory, Hall, Hotel, ServiceCategory } from '../types';

type AppwriteRow = {
  $id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  description?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
};

type BookingRow = {
  $id: string;
  userId?: string;
  hotelId: string;
  eventName?: string;
  eventFormat?: string;
  startDate: string;
  endDate: string;
  status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPrice?: number;
  notes?: string;
  numGuests?: number;
  pdfUrl?: string;
  submittedAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
};

type EventRow = {
  $id: string;
  userId: string;
  status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  eventName?: string;
  eventFormat?: string;
  city?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  totalPrice?: number;
  notes?: string;
  pdfUrl?: string;
  submittedAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
};

type ListDocumentsResponse<T> = {
  documents: T[];
  total: number;
};

type AppwriteHallRow = {
  $id: string;
  hotelId: string;
  name: string;
  description?: string | null;
  areaSqm?: number | null;
  maxCapacity: number;
  basePricePerDay?: number | null;
  amenities?: string[];
  seatingLayouts?: string[];
};

type ListRowsResponse<T> = {
  rows: T[];
  total: number;
};

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'mice-db';

const ensureProjectId = () => {
  if (!APPWRITE_PROJECT_ID) {
    throw new Error('VITE_APPWRITE_PROJECT_ID is not configured');
  }
};

const request = async <T>(path: string): Promise<T> => {
  ensureProjectId();

  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Ignore JSON parse errors and keep fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

const withQuery = (path: string, query?: Record<string, string | number | undefined>): string => {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}` !== '') {
      params.set(key, `${value}`);
    }
  });
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

const mapHotelRow = (row: AppwriteRow): Hotel => ({
  id: row.$id,
  name: row.name,
  address: row.address || undefined,
  city: row.city || undefined,
  country: row.country || undefined,
  contactEmail: row.contact_email || undefined,
  contactPhone: row.contact_phone || undefined,
  description: row.description || undefined,
  logoUrl: row.logo_url || undefined,
});

const mapHallRow = (row: AppwriteHallRow): Hall => ({
  id: row.$id,
  hotelId: row.hotelId,
  name: row.name,
  description: row.description || undefined,
  areaSqm: row.areaSqm ?? undefined,
  maxCapacity: row.maxCapacity,
  basePricePerDay: row.basePricePerDay ?? 0,
  amenities: row.amenities || [],
  images: [],
  naturalLight: false,
  isActive: true,
  seatingLayouts: [],
});


const mutateRequest = async <T>(path: string, method: string, data?: any): Promise<T> => {
  ensureProjectId();

  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    method,
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Ignore JSON parse errors and keep fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

const mapBookingRow = (row: BookingRow): Booking => ({
  id: row.$id,
  userId: row.userId || 'anonymous',
  hotelId: row.hotelId,
  status: row.status || 'DRAFT',
  eventName: row.eventName,
  eventFormat: row.eventFormat,
  startDate: row.startDate,
  endDate: row.endDate,
  numGuests: row.numGuests || 0,
  totalPrice: row.totalPrice || 0,
  notes: row.notes,
  pdfUrl: row.pdfUrl,
});

const mapEventRow = (row: EventRow) => ({
  id: row.$id,
  userId: row.userId,
  status: row.status || 'DRAFT',
  eventName: row.eventName,
  eventFormat: row.eventFormat,
  city: row.city,
  startDate: row.startDate,
  endDate: row.endDate,
  numGuests: row.numGuests,
  totalPrice: row.totalPrice || 0,
  notes: row.notes,
  pdfUrl: row.pdfUrl,
});

const queryTableRows = async <T>(tableId: string, query?: Record<string, string | number | undefined>): Promise<ListRowsResponse<T>> => {
  return request<ListRowsResponse<T>>(
    withQuery(`/tablesdb/${APPWRITE_DATABASE_ID}/tables/${tableId}/rows`, query)
  );
};

const createTableRow = async <T>(tableId: string, data: Record<string, unknown>): Promise<T> => {
  return mutateRequest<T>(`/tablesdb/${APPWRITE_DATABASE_ID}/tables/${tableId}/rows`, 'POST', {
    rowId: 'unique()',
    data,
  });
};

const updateTableRow = async <T>(tableId: string, rowId: string, data: Record<string, unknown>): Promise<T> => {
  return mutateRequest<T>(`/tablesdb/${APPWRITE_DATABASE_ID}/tables/${tableId}/rows/${rowId}`, 'PATCH', {
    data,
  });
};

const getTableRow = async <T>(tableId: string, rowId: string): Promise<T> => {
  return request<T>(`/tablesdb/${APPWRITE_DATABASE_ID}/tables/${tableId}/rows/${rowId}`);
};

export const appwriteData = {
  async createBooking(data: any): Promise<Booking> {
    const row = await createTableRow<BookingRow>('bookings', {
      userId: data.userId || 'anonymous',
      hotelId: data.hotelId,
      eventName: data.eventName,
      eventFormat: data.eventFormat,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'DRAFT',
      notes: data.notes || null,
      numGuests: data.numGuests || 1,
    });
    return mapBookingRow(row);
  },

  
  async listUserBookings(): Promise<Booking[]> {
    const response = await queryTableRows<BookingRow>('bookings');
    return response.rows.map(mapBookingRow);
  },

  async listCatering(hotelId: string): Promise<CateringCategory[]> {
    const [categoriesResponse, itemsResponse] = await Promise.all([
      queryTableRows<any>('catering_categories'),
      queryTableRows<any>('catering_items'),
    ]);

    return categoriesResponse.rows
      .filter((category) => !hotelId || !category.hotelId || category.hotelId === hotelId)
      .map((category) => ({
        id: category.$id,
        hotelId: category.hotelId,
        supplierId: category.supplierId,
        name: category.name,
        description: category.description || undefined,
        items: itemsResponse.rows
          .filter((item) => item.categoryId === category.$id && item.isActive !== false)
          .map((item) => ({
            id: item.$id,
            categoryId: item.categoryId,
            name: item.name,
            description: item.description || undefined,
            pricePerPerson: item.pricePerPerson || 0,
            minPersons: item.minPersons || 1,
            dietaryOptions: item.dietaryOptions || [],
            isActive: item.isActive !== false,
          })),
      }));
  },

  async listServices(hotelId: string): Promise<ServiceCategory[]> {
    const [categoriesResponse, servicesResponse] = await Promise.all([
      queryTableRows<any>('service_categories'),
      queryTableRows<any>('services'),
    ]);

    return categoriesResponse.rows
      .filter((category) => !hotelId || !category.hotelId || category.hotelId === hotelId)
      .map((category) => ({
        id: category.$id,
        hotelId: category.hotelId,
        supplierId: category.supplierId,
        name: category.name,
        description: category.description || undefined,
        services: servicesResponse.rows
          .filter((service) => service.categoryId === category.$id && service.isActive !== false)
          .map((service) => ({
            id: service.$id,
            categoryId: service.categoryId,
            name: service.name,
            description: service.description || undefined,
            pricingType: service.pricingType || 'FIXED',
            basePrice: service.basePrice || 0,
            unit: service.unit || undefined,
            isActive: service.isActive !== false,
          })),
      }));
  },

  async getBooking(bookingId: string): Promise<Booking> {
    const row = await getTableRow<BookingRow>('bookings', bookingId);
    return mapBookingRow(row);
  },

  
  async calculateEstimation(_bookingId: string, wizardData: any): Promise<any> {
    return {
      hallsTotal: 1500,
      cateringTotal: 500,
      servicesTotal: 250,
      grandTotal: 2250,
      breakdown: {
        halls: (wizardData.selectedHalls || []).map((h: any) => ({ name: `Hall ${h.hallId}`, date: h.bookingDate || 'N/A', price: 1500 })),
        catering: (wizardData.selectedCatering || []).map((c: any) => ({ name: `Catering x${c.quantity}`, quantity: c.quantity, price: 500 })),
        services: (wizardData.selectedServices || []).map((s: any) => ({ name: `Service x${s.quantity}`, quantity: s.quantity, price: 250 })),
      }
    };
  },

  async updateBooking(id: string | null, data: any): Promise<Booking> {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    const patch: Record<string, unknown> = {};
    if (data.eventName !== undefined) patch.eventName = data.eventName;
    if (data.eventFormat !== undefined) patch.eventFormat = data.eventFormat;
    if (data.startDate !== undefined) patch.startDate = data.startDate;
    if (data.endDate !== undefined) patch.endDate = data.endDate;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.numGuests !== undefined) patch.numGuests = data.numGuests;
    if (data.totalPrice !== undefined) patch.totalPrice = data.totalPrice;
    if (data.status !== undefined) patch.status = data.status;
    if (data.pdfUrl !== undefined) patch.pdfUrl = data.pdfUrl;
    if (data.submittedAt !== undefined) patch.submittedAt = data.submittedAt;
    // Store JSON arrays for phases
    if (data.halls !== undefined) patch.halls = JSON.stringify(data.halls);
    if (data.catering !== undefined) patch.catering = JSON.stringify(data.catering);
    if (data.services !== undefined) patch.services = JSON.stringify(data.services);

    const row = await updateTableRow<BookingRow>('bookings', id, patch);
    return mapBookingRow(row);
  },

  async listHotels(): Promise<Hotel[]> {
    const response = await request<ListRowsResponse<AppwriteRow>>(
      `/tablesdb/${APPWRITE_DATABASE_ID}/tables/hotels/rows`
    );

    return response.rows
      .filter((row) => row.is_active !== false)
      .map(mapHotelRow);
  },

  async listHalls(hotelId: string): Promise<Hall[]> {
    const response = await request<ListRowsResponse<AppwriteHallRow>>(
      `/tablesdb/${APPWRITE_DATABASE_ID}/tables/halls/rows`
    );

    return response.rows
      .filter((row) => row.hotelId === hotelId)
      .map(mapHallRow);
  },

  async listEvents(): Promise<any[]> {
    const response = await queryTableRows<EventRow>('events');
    return response.rows.map(mapEventRow);
  },

  async getEvent(id: string): Promise<any> {
    const event = await getTableRow<EventRow>('events', id);
    return {
      ...mapEventRow(event),
      eventSuppliers: [],
    };
  },

  async updateEventStatus(id: string, status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<any> {
    const payload: Record<string, unknown> = { status };
    if (status === 'PENDING') {
      payload.submittedAt = new Date().toISOString();
    }
    const event = await updateTableRow<EventRow>('events', id, payload);
    return mapEventRow(event);
  },

  async submitBooking(id: string | null): Promise<Booking> {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    const booking = await updateTableRow<BookingRow>('bookings', id, {
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    });
    return mapBookingRow(booking);
  },

  async listRawRows(tableId: string): Promise<any[]> {
    const response = await queryTableRows<any>(tableId);
    return response.rows;
  },

  async createRawRow(tableId: string, data: Record<string, unknown>): Promise<any> {
    return createTableRow<any>(tableId, data);
  },

  async updateRawRow(tableId: string, rowId: string, data: Record<string, unknown>): Promise<any> {
    return updateTableRow<any>(tableId, rowId, data);
  },

  async deleteRawRow(tableId: string, rowId: string): Promise<void> {
    await mutateRequest<any>(`/tablesdb/${APPWRITE_DATABASE_ID}/tables/${tableId}/rows/${rowId}`, 'DELETE');
  },
};
