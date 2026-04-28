import { appwriteData } from './appwriteData';

type ApiResponse<T> = { data: T };

type ApiConfig = {
  params?: Record<string, any>;
};

const createApiError = (message: string, status = 400) => {
  const error = new Error(message) as Error & {
    response: { status: number; data: { error: string } };
  };
  error.response = { status, data: { error: message } };
  return error;
};

const success = <T>(data: T): ApiResponse<T> => ({ data });

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapAdminBooking = (booking: any, hotelsById: Map<string, any>) => {
  const hotel = hotelsById.get(booking.hotelId);
  const firstName = booking.userId && booking.userId !== 'anonymous' ? booking.userId.slice(0, 8) : null;
  return {
    id: booking.id,
    eventName: booking.eventName || null,
    eventFormat: booking.eventFormat || null,
    status: booking.status || 'DRAFT',
    startDate: booking.startDate,
    endDate: booking.endDate,
    numGuests: booking.numGuests || 0,
    totalPrice: booking.totalPrice || null,
    notes: booking.notes || null,
    submittedAt: booking.submittedAt || null,
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: booking.updatedAt || new Date().toISOString(),
    user: {
      email: booking.userId && booking.userId !== 'anonymous' ? `${booking.userId}@user.local` : 'anonymous@user.local',
      companyName: null,
      firstName,
      lastName: null,
      phone: null,
    },
    hotel: {
      id: booking.hotelId,
      name: hotel?.name || 'Unknown hotel',
      address: hotel?.address || null,
      city: hotel?.city || null,
      contactEmail: hotel?.contactEmail || null,
      contactPhone: hotel?.contactPhone || null,
    },
    bookingHalls: [],
    bookingCatering: [],
    bookingServices: [],
  };
};

const listAdminBookings = async (params?: Record<string, any>) => {
  const [bookings, hotels] = await Promise.all([
    appwriteData.listUserBookings(),
    appwriteData.listHotels(),
  ]);

  const hotelsById = new Map(hotels.map((h) => [h.id, h]));
  let rows = bookings.map((booking: any) => ({
    ...booking,
    createdAt: booking.createdAt || new Date().toISOString(),
  }));

  if (params?.status) {
    rows = rows.filter((row) => row.status === params.status);
  }

  if (params?.search) {
    const searchValue = String(params.search).toLowerCase();
    rows = rows.filter((row) => {
      const hotelName = (hotelsById.get(row.hotelId)?.name || '').toLowerCase();
      return (
        (row.eventName || '').toLowerCase().includes(searchValue) ||
        hotelName.includes(searchValue) ||
        (row.userId || '').toLowerCase().includes(searchValue)
      );
    });
  }

  if (params?.dateFrom) {
    const from = new Date(params.dateFrom).getTime();
    rows = rows.filter((row) => new Date(row.startDate).getTime() >= from);
  }

  if (params?.dateTo) {
    const to = new Date(params.dateTo).getTime();
    rows = rows.filter((row) => new Date(row.endDate).getTime() <= to);
  }

  rows = rows.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const page = Math.max(toNumber(params?.page, 1), 1);
  const limit = Math.max(toNumber(params?.limit, 10), 1);
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedRows = rows.slice(start, end).map((row) => mapAdminBooking(row, hotelsById));

  return {
    bookings: pagedRows,
    pagination: {
      page,
      limit,
      total: rows.length,
      totalPages: Math.max(Math.ceil(rows.length / limit), 1),
    },
  };
};

const api = {
  async get(url: string, config?: ApiConfig): Promise<ApiResponse<any>> {
    if (url === '/hotels') {
      return success(await appwriteData.listHotels());
    }

    if (url === '/events') {
      return success(await appwriteData.listEvents());
    }

    const eventMatch = url.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      return success(await appwriteData.getEvent(eventMatch[1]));
    }

    if (url === '/admin/bookings') {
      return success(await listAdminBookings(config?.params));
    }

    const adminBookingMatch = url.match(/^\/admin\/bookings\/([^/]+)$/);
    if (adminBookingMatch) {
      const payload = await listAdminBookings({ page: 1, limit: 5000 });
      const booking = payload.bookings.find((row: any) => row.id === adminBookingMatch[1]);
      if (!booking) throw createApiError('Booking not found', 404);
      return success(booking);
    }

    if (url === '/admin/analytics/overview') {
      const bookings = await appwriteData.listUserBookings();
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
      const pendingRequests = bookings.filter((item: any) => item.status === 'PENDING').length;
      const statuses = ['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED'];
      return success({
        totalBookings,
        bookingsByStatus: statuses.map((status) => ({
          status,
          count: bookings.filter((item: any) => item.status === status).length,
        })),
        totalRevenue,
        pendingRequests,
        avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      });
    }

    if (url === '/admin/analytics/recent-bookings') {
      const payload = await listAdminBookings({ page: 1, limit: config?.params?.limit || 5 });
      return success(payload.bookings);
    }

    if (url === '/admin/analytics/popular-halls') return success([]);
    if (url === '/admin/analytics/popular-catering') return success([]);
    if (url === '/admin/analytics/popular-services') return success([]);

    if (url === '/admin/halls') {
      const [halls, hotels] = await Promise.all([
        appwriteData.listRawRows('halls'),
        appwriteData.listHotels(),
      ]);
      const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      return success(
        halls.map((hall: any) => ({
          id: hall.$id,
          name: hall.name,
          maxCapacity: hall.maxCapacity,
          areaSqm: hall.areaSqm || null,
          basePricePerDay: hall.basePricePerDay || 0,
          description: hall.description || null,
          floor: hall.floor || null,
          naturalLight: hall.naturalLight || false,
          isActive: hall.isActive !== false,
          hotel: {
            id: hall.hotelId,
            name: hotelsById.get(hall.hotelId)?.name || 'Unknown hotel',
          },
        }))
      );
    }

    if (url === '/admin/catering-categories') {
      const [categories, hotels] = await Promise.all([
        appwriteData.listRawRows('catering_categories'),
        appwriteData.listHotels(),
      ]);
      const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      return success(
        categories.map((category: any) => ({
          id: category.$id,
          name: category.name,
          hotel: {
            id: category.hotelId,
            name: hotelsById.get(category.hotelId)?.name || 'Unknown hotel',
          },
        }))
      );
    }

    if (url === '/admin/catering-items') {
      const [items, categories, hotels] = await Promise.all([
        appwriteData.listRawRows('catering_items'),
        appwriteData.listRawRows('catering_categories'),
        appwriteData.listHotels(),
      ]);
      const categoriesById = new Map(categories.map((category: any) => [category.$id, category]));
      const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      return success(
        items.map((item: any) => {
          const category = categoriesById.get(item.categoryId);
          return {
            id: item.$id,
            name: item.name,
            description: item.description || null,
            pricePerPerson: item.pricePerPerson || 0,
            minPersons: item.minPersons || 1,
            isActive: item.isActive !== false,
            category: {
              id: item.categoryId,
              name: category?.name || 'Unknown category',
              hotel: {
                id: category?.hotelId || '',
                name: hotelsById.get(category?.hotelId)?.name || 'Unknown hotel',
              },
            },
          };
        })
      );
    }

    if (url === '/admin/service-categories') {
      const [categories, hotels] = await Promise.all([
        appwriteData.listRawRows('service_categories'),
        appwriteData.listHotels(),
      ]);
      const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      return success(
        categories.map((category: any) => ({
          id: category.$id,
          name: category.name,
          hotel: {
            id: category.hotelId,
            name: hotelsById.get(category.hotelId)?.name || 'Unknown hotel',
          },
        }))
      );
    }

    if (url === '/admin/services') {
      const [services, categories, hotels] = await Promise.all([
        appwriteData.listRawRows('services'),
        appwriteData.listRawRows('service_categories'),
        appwriteData.listHotels(),
      ]);
      const categoriesById = new Map(categories.map((category: any) => [category.$id, category]));
      const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      return success(
        services.map((service: any) => {
          const category = categoriesById.get(service.categoryId);
          return {
            id: service.$id,
            name: service.name,
            description: service.description || null,
            pricingType: service.pricingType || 'FIXED',
            basePrice: service.basePrice || 0,
            unit: service.unit || null,
            isActive: service.isActive !== false,
            category: {
              id: service.categoryId,
              name: category?.name || 'Unknown category',
              hotel: {
                id: category?.hotelId || '',
                name: hotelsById.get(category?.hotelId)?.name || 'Unknown hotel',
              },
            },
          };
        })
      );
    }

    throw createApiError(`Unsupported GET ${url}`, 404);
  },

  async post(url: string, body?: Record<string, any>): Promise<ApiResponse<any>> {
    if (url === '/bookings') {
      const booking = await appwriteData.createBooking(body || {});
      return success({ id: booking.id, ...booking });
    }

    const submitBookingMatch = url.match(/^\/bookings\/([^/]+)\/submit$/);
    if (submitBookingMatch) {
      return success(await appwriteData.submitBooking(submitBookingMatch[1]));
    }

    const submitEventMatch = url.match(/^\/events\/([^/]+)\/submit$/);
    if (submitEventMatch) {
      return success(await appwriteData.updateEventStatus(submitEventMatch[1], 'PENDING'));
    }

    const cancelEventMatch = url.match(/^\/events\/([^/]+)\/cancel$/);
    if (cancelEventMatch) {
      return success(await appwriteData.updateEventStatus(cancelEventMatch[1], 'CANCELLED'));
    }

    if (url === '/admin/halls') {
      return success(await appwriteData.createRawRow('halls', body || {}));
    }

    if (url === '/admin/catering-items') {
      return success(await appwriteData.createRawRow('catering_items', body || {}));
    }

    if (url === '/admin/services') {
      return success(await appwriteData.createRawRow('services', body || {}));
    }

    throw createApiError(`Unsupported POST ${url}`, 404);
  },

  async put(url: string, body?: Record<string, any>): Promise<ApiResponse<any>> {
    const bookingStatusMatch = url.match(/^\/admin\/bookings\/([^/]+)\/status$/);
    if (bookingStatusMatch) {
      return success(await appwriteData.updateBooking(bookingStatusMatch[1], { status: body?.status }));
    }

    const hallsMatch = url.match(/^\/admin\/halls\/([^/]+)$/);
    if (hallsMatch) {
      return success(await appwriteData.updateRawRow('halls', hallsMatch[1], body || {}));
    }

    const cateringMatch = url.match(/^\/admin\/catering-items\/([^/]+)$/);
    if (cateringMatch) {
      return success(await appwriteData.updateRawRow('catering_items', cateringMatch[1], body || {}));
    }

    const servicesMatch = url.match(/^\/admin\/services\/([^/]+)$/);
    if (servicesMatch) {
      return success(await appwriteData.updateRawRow('services', servicesMatch[1], body || {}));
    }

    throw createApiError(`Unsupported PUT ${url}`, 404);
  },

  async delete(url: string): Promise<ApiResponse<any>> {
    const hallsMatch = url.match(/^\/admin\/halls\/([^/]+)$/);
    if (hallsMatch) {
      await appwriteData.deleteRawRow('halls', hallsMatch[1]);
      return success({ ok: true });
    }

    const cateringMatch = url.match(/^\/admin\/catering-items\/([^/]+)$/);
    if (cateringMatch) {
      await appwriteData.deleteRawRow('catering_items', cateringMatch[1]);
      return success({ ok: true });
    }

    const servicesMatch = url.match(/^\/admin\/services\/([^/]+)$/);
    if (servicesMatch) {
      await appwriteData.deleteRawRow('services', servicesMatch[1]);
      return success({ ok: true });
    }

    throw createApiError(`Unsupported DELETE ${url}`, 404);
  },
};

export default api;
