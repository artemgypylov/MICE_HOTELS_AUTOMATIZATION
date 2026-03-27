import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { EventService } from '../services/event.service';
import { EventPricingService } from '../services/event-pricing.service';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const eventService = new EventService();
const pricingService = new EventPricingService();

// All event routes require authentication
router.use(authenticate);

/**
 * POST /api/events/quote - Generate a preliminary quote without saving
 * This is used in the event constructor for real-time price calculation
 */
router.post('/quote', async (req: AuthRequest, res: Response) => {
  try {
    const quote = await pricingService.generateQuote(req.body);
    res.json(quote);
    return;
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * POST /api/events - Create a new event
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const event = await eventService.createEvent(userId, req.body);
    res.status(201).json(event);
    return;
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/events - Get all events for current user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const events = await eventService.listUserEvents(userId);
    res.json(events);
    return;
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/events/:id - Get event details with all suppliers
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventService.getEvent(req.params.id);

    // Verify user owns this event or is admin/manager
    if (event.userId !== req.user!.id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(event);
    return;
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(404).json({ error: (error as Error).message });
    return;
  }
});

/**
 * PUT /api/events/:id - Update event details
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json(event);
    return;
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * DELETE /api/events/:id - Delete event (draft only)
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await eventService.deleteEvent(req.params.id);
    res.status(204).send();
    return;
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * POST /api/events/:id/submit - Submit event for approval
 */
router.post('/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const event = await eventService.submitEvent(req.params.id);
    res.json(event);
    return;
  } catch (error) {
    console.error('Error submitting event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * POST /api/events/:id/confirm - Confirm event (manager/admin only)
 */
router.post('/:id/confirm', async (req: AuthRequest, res: Response) => {
  try {
    if (!['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const event = await eventService.confirmEvent(req.params.id);
    res.json(event);
    return;
  } catch (error) {
    console.error('Error confirming event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * POST /api/events/:id/cancel - Cancel event
 */
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership or admin/manager
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const event = await eventService.cancelEvent(req.params.id);
    res.json(event);
    return;
  } catch (error) {
    console.error('Error cancelling event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * POST /api/events/:id/calculate - Calculate event pricing
 */
router.post('/:id/calculate', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const calculation = await pricingService.calculateEventTotal(req.params.id);
    res.json(calculation);
    return;
  } catch (error) {
    console.error('Error calculating event price:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

// ============================================================================
// SUPPLIER MANAGEMENT FOR EVENTS
// ============================================================================

/**
 * POST /api/events/:id/suppliers - Add supplier to event
 */
router.post('/:id/suppliers', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const eventSupplier = await eventService.addSupplierToEvent(req.params.id, req.body);
    res.status(201).json(eventSupplier);
    return;
  } catch (error) {
    console.error('Error adding supplier to event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * DELETE /api/events/:id/suppliers/:supplierId - Remove supplier from event
 */
router.delete('/:id/suppliers/:supplierId', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await eventService.removeSupplierFromEvent(req.params.supplierId);
    res.status(204).send();
    return;
  } catch (error) {
    console.error('Error removing supplier from event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * PUT /api/events/:id/suppliers/:supplierId - Update event supplier
 */
router.put('/:id/suppliers/:supplierId', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership or admin/manager
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const eventSupplier = await eventService.updateEventSupplier(req.params.supplierId, req.body);
    res.json(eventSupplier);
    return;
  } catch (error) {
    console.error('Error updating event supplier:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

// ============================================================================
// ITEM MANAGEMENT FOR EVENTS
// ============================================================================

/**
 * POST /api/events/:id/items - Add item to event
 */
router.post('/:id/items', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const eventItem = await eventService.addItemToEvent(req.params.id, req.body);
    res.status(201).json(eventItem);
    return;
  } catch (error) {
    console.error('Error adding item to event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * PUT /api/events/:id/items/:itemId - Update event item
 */
router.put('/:id/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const eventItem = await eventService.updateEventItem(req.params.itemId, req.body);
    res.json(eventItem);
    return;
  } catch (error) {
    console.error('Error updating event item:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * DELETE /api/events/:id/items/:itemId - Remove item from event
 */
router.delete('/:id/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const existingEvent = await eventService.getEvent(req.params.id);
    if (existingEvent.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await eventService.removeItemFromEvent(req.params.itemId);
    res.status(204).send();
    return;
  } catch (error) {
    console.error('Error removing item from event:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

export default router;
