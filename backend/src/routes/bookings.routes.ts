import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Create new booking
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { hotelId, eventName, eventFormat, startDate, endDate, numGuests, notes } = req.body;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        hotelId,
        eventName,
        eventFormat,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numGuests: parseInt(numGuests),
        notes,
        status: 'DRAFT',
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
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

    // Check authorization
    if (booking.userId !== req.user!.id && req.user!.role !== 'MANAGER' && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;
    const { eventName, eventFormat, startDate, endDate, numGuests, notes, halls, catering, services } = req.body;

    // Check if booking exists and user owns it
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (existingBooking.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update booking basic info
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          eventName,
          eventFormat,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          numGuests: numGuests ? parseInt(numGuests) : undefined,
          notes,
        },
      });

      // Update halls if provided
      if (halls) {
        // Delete existing hall bookings
        await tx.bookingHall.deleteMany({
          where: { bookingId },
        });

        // Create new hall bookings
        for (const hall of halls) {
          // Get hall price
          const hallData = await tx.hall.findUnique({
            where: { id: hall.hallId },
          });

          if (!hallData) continue;

          let price = hallData.basePricePerDay;

          // Add layout price modifier if applicable
          if (hall.seatingLayoutId) {
            const layout = await tx.seatingLayout.findUnique({
              where: { id: hall.seatingLayoutId },
            });
            if (layout) {
              price = price.add(layout.priceModifier);
            }
          }

          await tx.bookingHall.create({
            data: {
              bookingId,
              hallId: hall.hallId,
              seatingLayoutId: hall.seatingLayoutId,
              bookingDate: new Date(hall.bookingDate),
              price,
            },
          });
        }
      }

      // Update catering if provided
      if (catering) {
        // Delete existing catering bookings
        await tx.bookingCatering.deleteMany({
          where: { bookingId },
        });

        // Create new catering bookings
        for (const item of catering) {
          const cateringItem = await tx.cateringItem.findUnique({
            where: { id: item.cateringItemId },
          });

          if (!cateringItem) continue;

          const price = cateringItem.pricePerPerson.mul(item.quantity);

          await tx.bookingCatering.create({
            data: {
              bookingId,
              cateringItemId: item.cateringItemId,
              quantity: item.quantity,
              serviceDate: item.serviceDate ? new Date(item.serviceDate) : null,
              price,
            },
          });
        }
      }

      // Update services if provided
      if (services) {
        // Delete existing service bookings
        await tx.bookingService.deleteMany({
          where: { bookingId },
        });

        // Create new service bookings
        for (const svc of services) {
          const serviceData = await tx.service.findUnique({
            where: { id: svc.serviceId },
          });

          if (!serviceData) continue;

          let price: Prisma.Decimal;
          switch (serviceData.pricingType) {
            case 'PER_PERSON':
              price = serviceData.basePrice.mul(updatedBooking.numGuests).mul(svc.quantity || 1);
              break;
            case 'PER_DAY':
              const days = Math.ceil((updatedBooking.endDate.getTime() - updatedBooking.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              price = serviceData.basePrice.mul(days).mul(svc.quantity || 1);
              break;
            default:
              price = serviceData.basePrice.mul(svc.quantity || 1);
          }

          await tx.bookingService.create({
            data: {
              bookingId,
              serviceId: svc.serviceId,
              quantity: svc.quantity || 1,
              price,
            },
          });
        }
      }

      return updatedBooking;
    });

    // Fetch complete booking with relations
    const completeBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingHalls: {
          include: {
            hall: true,
            seatingLayout: true,
          },
        },
        bookingCatering: {
          include: {
            cateringItem: true,
          },
        },
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
    });

    res.json(completeBooking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Calculate booking price
router.post('/:id/calculate', authenticate, async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingHalls: {
          include: {
            hall: true,
            seatingLayout: true,
          },
        },
        bookingCatering: {
          include: {
            cateringItem: true,
          },
        },
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.userId !== req.user!.id && req.user!.role !== 'MANAGER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Calculate totals
    const hallsTotal = booking.bookingHalls.reduce((sum, bh) => sum + Number(bh.price), 0);
    const cateringTotal = booking.bookingCatering.reduce((sum, bc) => sum + Number(bc.price), 0);
    const servicesTotal = booking.bookingServices.reduce((sum, bs) => sum + Number(bs.price), 0);
    const grandTotal = hallsTotal + cateringTotal + servicesTotal;

    // Update booking with total price
    await prisma.booking.update({
      where: { id: bookingId },
      data: { totalPrice: new Prisma.Decimal(grandTotal) },
    });

    res.json({
      hallsTotal,
      cateringTotal,
      servicesTotal,
      grandTotal,
      breakdown: {
        halls: booking.bookingHalls.map(bh => ({
          name: bh.hall.name,
          date: bh.bookingDate.toISOString().split('T')[0],
          layout: bh.seatingLayout?.layoutType,
          price: Number(bh.price),
        })),
        catering: booking.bookingCatering.map(bc => ({
          name: bc.cateringItem.name,
          quantity: bc.quantity,
          price: Number(bc.price),
        })),
        services: booking.bookingServices.map(bs => ({
          name: bs.service.name,
          quantity: bs.quantity,
          price: Number(bs.price),
        })),
      },
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

// Submit booking
router.post('/:id/submit', authenticate, async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingHalls: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (booking.bookingHalls.length === 0) {
      return res.status(400).json({ error: 'Cannot submit a booking without any selected halls' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Submit booking error:', error);
    res.status(500).json({ error: 'Failed to submit booking' });
  }
});

// List user's bookings
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error('List bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
