import { Router } from 'express';
import { PrismaClient, BookingStatus, Prisma } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and authorization to all admin routes
router.use(authenticate);
router.use(authorize('MANAGER', 'ADMIN'));

// GET /api/admin/bookings - List all bookings with pagination and filters
router.get('/bookings', async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.BookingWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status as BookingStatus;
    }

    if (dateFrom) {
      where.startDate = {
        gte: new Date(dateFrom as string),
      };
    }

    if (dateTo) {
      if (where.startDate) {
        (where.startDate as Prisma.DateTimeFilter).lte = new Date(dateTo as string);
      } else {
        where.startDate = {
          lte: new Date(dateTo as string),
        };
      }
    }

    if (search) {
      where.OR = [
        { eventName: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        {
          user: { companyName: { contains: search as string, mode: 'insensitive' } },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.booking.count({ where });

    // Get bookings with relations
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
            firstName: true,
            lastName: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        bookingHalls: {
          include: {
            hall: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
    return;
  } catch (error) {
    console.error('Admin list bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
    return;
  }
});

// GET /api/admin/bookings/:id - Get booking details
router.get('/bookings/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        bookingHalls: {
          include: {
            hall: true,
            seatingLayout: true,
          },
        },
        bookingCatering: {
          include: {
            cateringItem: {
              include: {
                category: true,
              },
            },
          },
        },
        bookingServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(booking);
    return;
  } catch (error) {
    console.error('Admin get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
    return;
  }
});

// PUT /api/admin/bookings/:id/status - Update booking status
router.put('/bookings/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses: BookingStatus[] = ['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
      return;
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: status as BookingStatus,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
            firstName: true,
            lastName: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updatedBooking);
    return;
  } catch (error) {
    console.error('Admin update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
    return;
  }
});

// ============================================
// ANALYTICS & DASHBOARD
// ============================================

// GET /api/admin/analytics/overview - Get dashboard overview statistics
router.get('/analytics/overview', async (req: AuthRequest, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Build date filter
    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo as string);
    }

    const where: Prisma.BookingWhereInput = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get total bookings count
    const totalBookings = await prisma.booking.count({ where });

    // Get bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    // Calculate total revenue (only from CONFIRMED bookings)
    const revenueData = await prisma.booking.aggregate({
      where: {
        ...where,
        status: 'CONFIRMED',
        totalPrice: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Get pending requests count
    const pendingRequests = await prisma.booking.count({
      where: {
        ...where,
        status: 'PENDING',
      },
    });

    // Calculate average booking value
    const avgBookingValue = await prisma.booking.aggregate({
      where: {
        ...where,
        status: 'CONFIRMED',
        totalPrice: { not: null },
      },
      _avg: {
        totalPrice: true,
      },
    });

    res.json({
      totalBookings,
      bookingsByStatus: bookingsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      totalRevenue: revenueData._sum.totalPrice || 0,
      pendingRequests,
      avgBookingValue: avgBookingValue._avg.totalPrice || 0,
    });
    return;
  } catch (error) {
    console.error('Admin analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
    return;
  }
});

// GET /api/admin/analytics/revenue-trends - Get revenue trends over time
router.get('/analytics/revenue-trends', async (req: AuthRequest, res) => {
  try {
    const { dateFrom, dateTo, groupBy = 'month' } = req.query;

    // Build date filter
    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo as string);
    }

    const where: Prisma.BookingWhereInput = {
      status: 'CONFIRMED',
      totalPrice: { not: null },
    };

    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get all confirmed bookings with dates
    const bookings = await prisma.booking.findMany({
      where,
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const trendsMap = new Map<string, number>();
    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const currentValue = trendsMap.get(key) || 0;
      trendsMap.set(key, currentValue + parseFloat(booking.totalPrice?.toString() || '0'));
    });

    const trends = Array.from(trendsMap.entries()).map(([period, revenue]) => ({
      period,
      revenue,
    }));

    res.json(trends);
    return;
  } catch (error) {
    console.error('Admin revenue trends error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue trends' });
    return;
  }
});

// GET /api/admin/analytics/popular-halls - Get most booked halls
router.get('/analytics/popular-halls', async (req: AuthRequest, res) => {
  try {
    const { limit = '10', dateFrom, dateTo } = req.query;

    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo as string);
    }

    const where: Prisma.BookingHallWhereInput = {};
    if (Object.keys(dateFilter).length > 0) {
      where.bookingDate = dateFilter;
    }

    // Get hall booking counts
    const hallBookings = await prisma.bookingHall.groupBy({
      by: ['hallId'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        price: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: parseInt(limit as string),
    });

    // Get hall details
    const hallIds = hallBookings.map((hb) => hb.hallId);
    const halls = await prisma.hall.findMany({
      where: {
        id: { in: hallIds },
      },
      select: {
        id: true,
        name: true,
        maxCapacity: true,
      },
    });

    const hallsMap = new Map(halls.map((h) => [h.id, h]));

    const popularHalls = hallBookings.map((hb) => ({
      hall: hallsMap.get(hb.hallId),
      bookingCount: hb._count.id,
      totalRevenue: hb._sum.price || 0,
    }));

    res.json(popularHalls);
    return;
  } catch (error) {
    console.error('Admin popular halls error:', error);
    res.status(500).json({ error: 'Failed to fetch popular halls' });
    return;
  }
});

// GET /api/admin/analytics/popular-catering - Get most ordered catering items
router.get('/analytics/popular-catering', async (req: AuthRequest, res) => {
  try {
    const { limit = '10', dateFrom, dateTo } = req.query;

    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo as string);
    }

    const where: Prisma.BookingCateringWhereInput = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get catering item counts
    const cateringBookings = await prisma.bookingCatering.groupBy({
      by: ['cateringItemId'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: parseInt(limit as string),
    });

    // Get catering item details
    const itemIds = cateringBookings.map((cb) => cb.cateringItemId);
    const items = await prisma.cateringItem.findMany({
      where: {
        id: { in: itemIds },
      },
      select: {
        id: true,
        name: true,
        pricePerPerson: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const itemsMap = new Map(items.map((i) => [i.id, i]));

    const popularCatering = cateringBookings.map((cb) => ({
      item: itemsMap.get(cb.cateringItemId),
      orderCount: cb._count.id,
      totalQuantity: cb._sum.quantity || 0,
      totalRevenue: cb._sum.price || 0,
    }));

    res.json(popularCatering);
    return;
  } catch (error) {
    console.error('Admin popular catering error:', error);
    res.status(500).json({ error: 'Failed to fetch popular catering' });
    return;
  }
});

// GET /api/admin/analytics/popular-services - Get most requested services
router.get('/analytics/popular-services', async (req: AuthRequest, res) => {
  try {
    const { limit = '10', dateFrom, dateTo } = req.query;

    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo as string);
    }

    const where: Prisma.BookingServiceWhereInput = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get service counts
    const serviceBookings = await prisma.bookingService.groupBy({
      by: ['serviceId'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: parseInt(limit as string),
    });

    // Get service details
    const serviceIds = serviceBookings.map((sb) => sb.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
      select: {
        id: true,
        name: true,
        basePrice: true,
        pricingType: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const servicesMap = new Map(services.map((s) => [s.id, s]));

    const popularServices = serviceBookings.map((sb) => ({
      service: servicesMap.get(sb.serviceId),
      orderCount: sb._count.id,
      totalQuantity: sb._sum.quantity || 0,
      totalRevenue: sb._sum.price || 0,
    }));

    res.json(popularServices);
    return;
  } catch (error) {
    console.error('Admin popular services error:', error);
    res.status(500).json({ error: 'Failed to fetch popular services' });
    return;
  }
});

// GET /api/admin/analytics/recent-bookings - Get recent bookings
router.get('/analytics/recent-bookings', async (req: AuthRequest, res) => {
  try {
    const { limit = '10' } = req.query;

    const recentBookings = await prisma.booking.findMany({
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            companyName: true,
            firstName: true,
            lastName: true,
          },
        },
        hotel: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(recentBookings);
    return;
  } catch (error) {
    console.error('Admin recent bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
    return;
  }
});

// ============================================
// HALLS MANAGEMENT
// ============================================

// GET /api/admin/halls - List all halls
router.get('/halls', async (req: AuthRequest, res) => {
  try {
    const { hotelId } = req.query;

    const where: Prisma.HallWhereInput = {};
    if (hotelId) {
      where.hotelId = hotelId as string;
    }

    const halls = await prisma.hall.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        seatingLayouts: {
          orderBy: {
            layoutType: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(halls);
    return;
  } catch (error) {
    console.error('Admin list halls error:', error);
    res.status(500).json({ error: 'Failed to fetch halls' });
    return;
  }
});

// GET /api/admin/halls/:id - Get hall details
router.get('/halls/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const hall = await prisma.hall.findUnique({
      where: { id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        seatingLayouts: {
          orderBy: {
            layoutType: 'asc',
          },
        },
      },
    });

    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    res.json(hall);
    return;
  } catch (error) {
    console.error('Admin get hall error:', error);
    res.status(500).json({ error: 'Failed to fetch hall' });
    return;
  }
});

// POST /api/admin/halls - Create new hall
router.post('/halls', async (req: AuthRequest, res) => {
  try {
    const {
      hotelId,
      name,
      maxCapacity,
      areaSqm,
      basePricePerDay,
      description,
      amenities,
      images,
      floor,
      naturalLight,
      isActive,
    } = req.body;

    // Validate required fields
    if (!hotelId || !name || !maxCapacity || !basePricePerDay) {
      res.status(400).json({
        error: 'Missing required fields: hotelId, name, maxCapacity, basePricePerDay',
      });
      return;
    }

    // Validate hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    const hall = await prisma.hall.create({
      data: {
        hotelId,
        name,
        maxCapacity: parseInt(maxCapacity),
        areaSqm: areaSqm ? parseFloat(areaSqm) : null,
        basePricePerDay: parseFloat(basePricePerDay),
        description: description || null,
        amenities: amenities || [],
        images: images || [],
        floor: floor ? parseInt(floor) : null,
        naturalLight: naturalLight === true,
        isActive: isActive !== false,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        seatingLayouts: true,
      },
    });

    res.status(201).json(hall);
    return;
  } catch (error) {
    console.error('Admin create hall error:', error);
    res.status(500).json({ error: 'Failed to create hall' });
    return;
  }
});

// PUT /api/admin/halls/:id - Update hall
router.put('/halls/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      maxCapacity,
      areaSqm,
      basePricePerDay,
      description,
      amenities,
      images,
      floor,
      naturalLight,
      isActive,
    } = req.body;

    // Check if hall exists
    const existingHall = await prisma.hall.findUnique({
      where: { id },
    });

    if (!existingHall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    const updateData: Prisma.HallUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (maxCapacity !== undefined)
      updateData.maxCapacity = parseInt(maxCapacity);
    if (areaSqm !== undefined)
      updateData.areaSqm = areaSqm ? parseFloat(areaSqm) : null;
    if (basePricePerDay !== undefined)
      updateData.basePricePerDay = parseFloat(basePricePerDay);
    if (description !== undefined) updateData.description = description || null;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (images !== undefined) updateData.images = images;
    if (floor !== undefined) updateData.floor = floor ? parseInt(floor) : null;
    if (naturalLight !== undefined)
      updateData.naturalLight = naturalLight === true;
    if (isActive !== undefined) updateData.isActive = isActive === true;

    const hall = await prisma.hall.update({
      where: { id },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        seatingLayouts: true,
      },
    });

    res.json(hall);
    return;
  } catch (error) {
    console.error('Admin update hall error:', error);
    res.status(500).json({ error: 'Failed to update hall' });
    return;
  }
});

// DELETE /api/admin/halls/:id - Delete hall
router.delete('/halls/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if hall exists
    const hall = await prisma.hall.findUnique({
      where: { id },
    });

    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    // Check if hall is used in any bookings
    const bookingCount = await prisma.bookingHall.count({
      where: { hallId: id },
    });

    if (bookingCount > 0) {
      res.status(400).json({
        error: 'Cannot delete hall with existing bookings. Consider deactivating it instead.',
        bookingCount,
      });
      return;
    }

    await prisma.hall.delete({
      where: { id },
    });

    res.json({ message: 'Hall deleted successfully' });
    return;
  } catch (error) {
    console.error('Admin delete hall error:', error);
    res.status(500).json({ error: 'Failed to delete hall' });
    return;
  }
});

// POST /api/admin/halls/:hallId/seating-layouts - Create seating layout for hall
router.post('/halls/:hallId/seating-layouts', async (req: AuthRequest, res) => {
  try {
    const { hallId } = req.params;
    const { layoutType, capacity, priceModifier, description, imageUrl } = req.body;

    // Validate required fields
    if (!layoutType || !capacity) {
      res.status(400).json({
        error: 'Missing required fields: layoutType, capacity',
      });
      return;
    }

    // Validate hall exists
    const hall = await prisma.hall.findUnique({
      where: { id: hallId },
    });

    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    const seatingLayout = await prisma.seatingLayout.create({
      data: {
        hallId,
        layoutType,
        capacity: parseInt(capacity),
        priceModifier: priceModifier ? parseFloat(priceModifier) : 0,
        description: description || null,
        imageUrl: imageUrl || null,
      },
    });

    res.status(201).json(seatingLayout);
    return;
  } catch (error) {
    console.error('Admin create seating layout error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(400).json({ error: 'Seating layout with this type already exists for this hall' });
      return;
    }
    res.status(500).json({ error: 'Failed to create seating layout' });
    return;
  }
});

// PUT /api/admin/seating-layouts/:id - Update seating layout
router.put('/seating-layouts/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { capacity, priceModifier, description, imageUrl } = req.body;

    const existingLayout = await prisma.seatingLayout.findUnique({
      where: { id },
    });

    if (!existingLayout) {
      res.status(404).json({ error: 'Seating layout not found' });
      return;
    }

    const updateData: Prisma.SeatingLayoutUpdateInput = {};
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (priceModifier !== undefined)
      updateData.priceModifier = parseFloat(priceModifier);
    if (description !== undefined) updateData.description = description || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;

    const seatingLayout = await prisma.seatingLayout.update({
      where: { id },
      data: updateData,
    });

    res.json(seatingLayout);
    return;
  } catch (error) {
    console.error('Admin update seating layout error:', error);
    res.status(500).json({ error: 'Failed to update seating layout' });
    return;
  }
});

// DELETE /api/admin/seating-layouts/:id - Delete seating layout
router.delete('/seating-layouts/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const layout = await prisma.seatingLayout.findUnique({
      where: { id },
    });

    if (!layout) {
      res.status(404).json({ error: 'Seating layout not found' });
      return;
    }

    // Check if layout is used in any bookings
    const bookingCount = await prisma.bookingHall.count({
      where: { seatingLayoutId: id },
    });

    if (bookingCount > 0) {
      res.status(400).json({
        error: 'Cannot delete seating layout used in bookings',
        bookingCount,
      });
      return;
    }

    await prisma.seatingLayout.delete({
      where: { id },
    });

    res.json({ message: 'Seating layout deleted successfully' });
    return;
  } catch (error) {
    console.error('Admin delete seating layout error:', error);
    res.status(500).json({ error: 'Failed to delete seating layout' });
    return;
  }
});

// ============================================
// CATERING MANAGEMENT
// ============================================

// GET /api/admin/catering-categories - List all catering categories
router.get('/catering-categories', async (req: AuthRequest, res) => {
  try {
    const { hotelId } = req.query;

    const where: Prisma.CateringCategoryWhereInput = {};
    if (hotelId) {
      where.hotelId = hotelId as string;
    }

    const categories = await prisma.cateringCategory.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    res.json(categories);
    return;
  } catch (error) {
    console.error('Admin list catering categories error:', error);
    res.status(500).json({ error: 'Failed to fetch catering categories' });
    return;
  }
});

// POST /api/admin/catering-categories - Create catering category
router.post('/catering-categories', async (req: AuthRequest, res) => {
  try {
    const { hotelId, name, description, sortOrder, isActive } = req.body;

    if (!hotelId || !name) {
      res.status(400).json({
        error: 'Missing required fields: hotelId, name',
      });
      return;
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    const category = await prisma.cateringCategory.create({
      data: {
        hotelId,
        name,
        description: description || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isActive: isActive !== false,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    res.status(201).json(category);
    return;
  } catch (error) {
    console.error('Admin create catering category error:', error);
    res.status(500).json({ error: 'Failed to create catering category' });
    return;
  }
});

// PUT /api/admin/catering-categories/:id - Update catering category
router.put('/catering-categories/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const existing = await prisma.cateringCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Catering category not found' });
      return;
    }

    const updateData: Prisma.CateringCategoryUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (isActive !== undefined) updateData.isActive = isActive === true;

    const category = await prisma.cateringCategory.update({
      where: { id },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    res.json(category);
    return;
  } catch (error) {
    console.error('Admin update catering category error:', error);
    res.status(500).json({ error: 'Failed to update catering category' });
    return;
  }
});

// DELETE /api/admin/catering-categories/:id - Delete catering category
router.delete('/catering-categories/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.cateringCategory.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Catering category not found' });
      return;
    }

    if (category.items.length > 0) {
      res.status(400).json({
        error: 'Cannot delete category with items. Delete items first.',
        itemCount: category.items.length,
      });
      return;
    }

    await prisma.cateringCategory.delete({
      where: { id },
    });

    res.json({ message: 'Catering category deleted successfully' });
    return;
  } catch (error) {
    console.error('Admin delete catering category error:', error);
    res.status(500).json({ error: 'Failed to delete catering category' });
    return;
  }
});

// GET /api/admin/catering-items - List all catering items
router.get('/catering-items', async (req: AuthRequest, res) => {
  try {
    const { categoryId } = req.query;

    const where: Prisma.CateringItemWhereInput = {};
    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    const items = await prisma.cateringItem.findMany({
      where,
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(items);
    return;
  } catch (error) {
    console.error('Admin list catering items error:', error);
    res.status(500).json({ error: 'Failed to fetch catering items' });
    return;
  }
});

// GET /api/admin/catering-items/:id - Get catering item details
router.get('/catering-items/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.cateringItem.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Catering item not found' });
      return;
    }

    res.json(item);
    return;
  } catch (error) {
    console.error('Admin get catering item error:', error);
    res.status(500).json({ error: 'Failed to fetch catering item' });
    return;
  }
});

// POST /api/admin/catering-items - Create catering item
router.post('/catering-items', async (req: AuthRequest, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      pricePerPerson,
      minPersons,
      dietaryOptions,
      imageUrl,
      isActive,
    } = req.body;

    if (!categoryId || !name || !pricePerPerson) {
      res.status(400).json({
        error: 'Missing required fields: categoryId, name, pricePerPerson',
      });
      return;
    }

    const category = await prisma.cateringCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({ error: 'Catering category not found' });
      return;
    }

    const item = await prisma.cateringItem.create({
      data: {
        categoryId,
        name,
        description: description || null,
        pricePerPerson: parseFloat(pricePerPerson),
        minPersons: minPersons ? parseInt(minPersons) : 1,
        dietaryOptions: dietaryOptions || [],
        imageUrl: imageUrl || null,
        isActive: isActive !== false,
      },
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(item);
    return;
  } catch (error) {
    console.error('Admin create catering item error:', error);
    res.status(500).json({ error: 'Failed to create catering item' });
    return;
  }
});

// PUT /api/admin/catering-items/:id - Update catering item
router.put('/catering-items/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      pricePerPerson,
      minPersons,
      dietaryOptions,
      imageUrl,
      isActive,
    } = req.body;

    const existing = await prisma.cateringItem.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Catering item not found' });
      return;
    }

    const updateData: Prisma.CateringItemUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (pricePerPerson !== undefined)
      updateData.pricePerPerson = parseFloat(pricePerPerson);
    if (minPersons !== undefined) updateData.minPersons = parseInt(minPersons);
    if (dietaryOptions !== undefined)
      updateData.dietaryOptions = dietaryOptions;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (isActive !== undefined) updateData.isActive = isActive === true;

    const item = await prisma.cateringItem.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(item);
    return;
  } catch (error) {
    console.error('Admin update catering item error:', error);
    res.status(500).json({ error: 'Failed to update catering item' });
    return;
  }
});

// DELETE /api/admin/catering-items/:id - Delete catering item
router.delete('/catering-items/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.cateringItem.findUnique({
      where: { id },
    });

    if (!item) {
      res.status(404).json({ error: 'Catering item not found' });
      return;
    }

    // Check if item is used in any bookings
    const bookingCount = await prisma.bookingCatering.count({
      where: { cateringItemId: id },
    });

    if (bookingCount > 0) {
      res.status(400).json({
        error: 'Cannot delete catering item used in bookings. Consider deactivating it instead.',
        bookingCount,
      });
      return;
    }

    await prisma.cateringItem.delete({
      where: { id },
    });

    res.json({ message: 'Catering item deleted successfully' });
    return;
  } catch (error) {
    console.error('Admin delete catering item error:', error);
    res.status(500).json({ error: 'Failed to delete catering item' });
    return;
  }
});

// ============================================
// SERVICES MANAGEMENT
// ============================================

// GET /api/admin/service-categories - List all service categories
router.get('/service-categories', async (req: AuthRequest, res) => {
  try {
    const { hotelId } = req.query;

    const where: Prisma.ServiceCategoryWhereInput = {};
    if (hotelId) {
      where.hotelId = hotelId as string;
    }

    const categories = await prisma.serviceCategory.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        services: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    res.json(categories);
    return;
  } catch (error) {
    console.error('Admin list service categories error:', error);
    res.status(500).json({ error: 'Failed to fetch service categories' });
    return;
  }
});

// POST /api/admin/service-categories - Create service category
router.post('/service-categories', async (req: AuthRequest, res) => {
  try {
    const { hotelId, name, description, sortOrder, isActive } = req.body;

    if (!hotelId || !name) {
      res.status(400).json({
        error: 'Missing required fields: hotelId, name',
      });
      return;
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    const category = await prisma.serviceCategory.create({
      data: {
        hotelId,
        name,
        description: description || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isActive: isActive !== false,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        services: true,
      },
    });

    res.status(201).json(category);
    return;
  } catch (error) {
    console.error('Admin create service category error:', error);
    res.status(500).json({ error: 'Failed to create service category' });
    return;
  }
});

// PUT /api/admin/service-categories/:id - Update service category
router.put('/service-categories/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Service category not found' });
      return;
    }

    const updateData: Prisma.ServiceCategoryUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (isActive !== undefined) updateData.isActive = isActive === true;

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        services: true,
      },
    });

    res.json(category);
    return;
  } catch (error) {
    console.error('Admin update service category error:', error);
    res.status(500).json({ error: 'Failed to update service category' });
    return;
  }
});

// DELETE /api/admin/service-categories/:id - Delete service category
router.delete('/service-categories/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Service category not found' });
      return;
    }

    if (category.services.length > 0) {
      res.status(400).json({
        error: 'Cannot delete category with services. Delete services first.',
        serviceCount: category.services.length,
      });
      return;
    }

    await prisma.serviceCategory.delete({
      where: { id },
    });

    res.json({ message: 'Service category deleted successfully' });
    return;
  } catch (error) {
    console.error('Admin delete service category error:', error);
    res.status(500).json({ error: 'Failed to delete service category' });
    return;
  }
});

// GET /api/admin/services - List all services
router.get('/services', async (req: AuthRequest, res) => {
  try {
    const { categoryId } = req.query;

    const where: Prisma.ServiceWhereInput = {};
    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(services);
    return;
  } catch (error) {
    console.error('Admin list services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
    return;
  }
});

// GET /api/admin/services/:id - Get service details
router.get('/services/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(service);
    return;
  } catch (error) {
    console.error('Admin get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
    return;
  }
});

// POST /api/admin/services - Create service
router.post('/services', async (req: AuthRequest, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      pricingType,
      basePrice,
      unit,
      imageUrl,
      isActive,
    } = req.body;

    if (!categoryId || !name || !pricingType || !basePrice) {
      res.status(400).json({
        error: 'Missing required fields: categoryId, name, pricingType, basePrice',
      });
      return;
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({ error: 'Service category not found' });
      return;
    }

    const service = await prisma.service.create({
      data: {
        categoryId,
        name,
        description: description || null,
        pricingType,
        basePrice: parseFloat(basePrice),
        unit: unit || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== false,
      },
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(service);
    return;
  } catch (error) {
    console.error('Admin create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
    return;
  }
});

// PUT /api/admin/services/:id - Update service
router.put('/services/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      pricingType,
      basePrice,
      unit,
      imageUrl,
      isActive,
    } = req.body;

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const updateData: Prisma.ServiceUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (pricingType !== undefined) updateData.pricingType = pricingType;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (unit !== undefined) updateData.unit = unit || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (isActive !== undefined) updateData.isActive = isActive === true;

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(service);
    return;
  } catch (error) {
    console.error('Admin update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
    return;
  }
});

// DELETE /api/admin/services/:id - Delete service
router.delete('/services/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Check if service is used in any bookings
    const bookingCount = await prisma.bookingService.count({
      where: { serviceId: id },
    });

    if (bookingCount > 0) {
      res.status(400).json({
        error: 'Cannot delete service used in bookings. Consider deactivating it instead.',
        bookingCount,
      });
      return;
    }

    await prisma.service.delete({
      where: { id },
    });

    res.json({ message: 'Service deleted successfully' });
    return;
  } catch (error) {
    console.error('Admin delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
    return;
  }
});

export default router;
