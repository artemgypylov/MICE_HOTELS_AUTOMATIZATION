import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get hall by ID
router.get('/:id', async (req, res) => {
  try {
    const hall = await prisma.hall.findUnique({
      where: { id: req.params.id },
      include: {
        seatingLayouts: true,
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }

    res.json(hall);
  } catch (error) {
    console.error('Get hall error:', error);
    res.status(500).json({ error: 'Failed to fetch hall' });
  }
});

// Check hall availability
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const hallId = req.params.id;

    // Get all booked dates for this hall in the date range
    const bookedDates = await prisma.bookingHall.findMany({
      where: {
        hallId,
        bookingDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        bookingDate: true,
      },
    });

    const unavailableDates = bookedDates.map(b => b.bookingDate.toISOString().split('T')[0]);

    res.json({
      available: bookedDates.length === 0,
      unavailableDates,
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

export default router;
