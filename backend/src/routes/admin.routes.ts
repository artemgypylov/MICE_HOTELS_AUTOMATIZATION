import { Router } from 'express';
import { PrismaClient, BookingStatus } from '@prisma/client';
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
    const where: any = {};

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
        where.startDate.lte = new Date(dateTo as string);
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
        { user: { companyName: { contains: search as string, mode: 'insensitive' } } },
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

export default router;
