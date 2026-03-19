import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all hotels
router.get('/', async (_req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        country: true,
        contactEmail: true,
        contactPhone: true,
        description: true,
        logoUrl: true,
      },
    });
    res.json(hotels);
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      include: {
        halls: {
          where: { isActive: true },
          include: {
            seatingLayouts: true,
          },
        },
      },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    res.json(hotel);
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

// Get hotel halls
router.get('/:hotelId/halls', async (req, res) => {
  try {
    const halls = await prisma.hall.findMany({
      where: {
        hotelId: req.params.hotelId,
        isActive: true,
      },
      include: {
        seatingLayouts: true,
      },
    });
    res.json(halls);
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
});

// Get hotel catering options
router.get('/:hotelId/catering', async (req, res) => {
  try {
    const categories = await prisma.cateringCategory.findMany({
      where: {
        hotelId: req.params.hotelId,
        isActive: true,
      },
      include: {
        items: {
          where: { isActive: true },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Get catering error:', error);
    res.status(500).json({ error: 'Failed to fetch catering options' });
  }
});

// Get hotel services
router.get('/:hotelId/services', async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: {
        hotelId: req.params.hotelId,
        isActive: true,
      },
      include: {
        services: {
          where: { isActive: true },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

export default router;
