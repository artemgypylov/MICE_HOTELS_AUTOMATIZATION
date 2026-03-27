import express, { Response } from 'express';
import { AuthRequest } from '../types';
import { SupplierService } from '../services/supplier.service';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();
const supplierService = new SupplierService();

/**
 * GET /api/suppliers - List all suppliers with optional filters
 * Public access (no auth required for browsing)
 */
router.get('/', async (req, res: Response) => {
  try {
    const filters = {
      supplierType: req.query.type as string | undefined,
      city: req.query.city as string,
      country: req.query.country as string,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };

    const suppliers = await supplierService.listSuppliers(filters);
    res.json(suppliers);
    return;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/suppliers/search - Search suppliers with advanced filters
 */
router.get('/search', async (req, res: Response) => {
  try {
    const searchParams = {
      query: req.query.q as string,
      supplierType: req.query.type as string | undefined,
      city: req.query.city as string,
      country: req.query.country as string,
      minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
    };

    const suppliers = await supplierService.searchSuppliers(searchParams);
    res.json(suppliers);
    return;
  } catch (error) {
    console.error('Error searching suppliers:', error);
    res.status(500).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/suppliers/:id - Get supplier details with all offers
 */
router.get('/:id', async (req, res: Response) => {
  try {
    const supplier = await supplierService.getSupplier(req.params.id);
    res.json(supplier);
    return;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(404).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/suppliers/:id/halls - Get halls for a VENUE supplier
 */
router.get('/:id/halls', async (req, res: Response) => {
  try {
    const supplier = await supplierService.getSupplier(req.params.id);

    if (supplier.supplierType !== 'VENUE') {
      res.status(400).json({ error: 'Supplier is not a venue' });
      return;
    }

    res.json(supplier.halls || []);
    return;
  } catch (error) {
    console.error('Error fetching supplier halls:', error);
    res.status(404).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/suppliers/:id/catering - Get catering for a CATERING supplier
 */
router.get('/:id/catering', async (req, res: Response) => {
  try {
    const supplier = await supplierService.getSupplier(req.params.id);

    if (supplier.supplierType !== 'CATERING') {
      res.status(400).json({ error: 'Supplier is not a catering provider' });
      return;
    }

    res.json(supplier.cateringCategories || []);
    return;
  } catch (error) {
    console.error('Error fetching supplier catering:', error);
    res.status(404).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/suppliers/:id/services - Get services for a supplier
 */
router.get('/:id/services', async (req, res: Response) => {
  try {
    const supplier = await supplierService.getSupplier(req.params.id);
    res.json(supplier.serviceCategories || []);
    return;
  } catch (error) {
    console.error('Error fetching supplier services:', error);
    res.status(404).json({ error: (error as Error).message });
    return;
  }
});

/**
 * GET /api/suppliers/:id/availability - Check supplier availability
 */
router.get('/:id/availability', async (req, res: Response) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const available = await supplierService.checkSupplierAvailability(
      req.params.id,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ available });
    return;
  } catch (error) {
    console.error('Error checking supplier availability:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

// ============================================================================
// ADMIN-ONLY ROUTES FOR SUPPLIER MANAGEMENT
// ============================================================================

/**
 * POST /api/suppliers - Create new supplier (admin only)
 */
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json(supplier);
    return;
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * PUT /api/suppliers/:id - Update supplier (admin only)
 */
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    res.json(supplier);
    return;
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

/**
 * DELETE /api/suppliers/:id - Delete supplier (admin only)
 */
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await supplierService.deleteSupplier(req.params.id);
    res.status(204).send();
    return;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(400).json({ error: (error as Error).message });
    return;
  }
});

export default router;
