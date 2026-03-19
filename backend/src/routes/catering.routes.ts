import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get catering item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.cateringItem.findUnique({
      where: { id: req.params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            hotelId: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Catering item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get catering item error:', error);
    res.status(500).json({ error: 'Failed to fetch catering item' });
  }
});

export default router;
