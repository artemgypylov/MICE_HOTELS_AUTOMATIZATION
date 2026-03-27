import { PrismaClient } from '@prisma/client';
import { EventPriceCalculation, EventItem, EventQuoteRequest, EventQuote } from '../types';

const prisma = new PrismaClient();

export class EventPricingService {
  /**
   * Calculate total price for an event across all suppliers
   */
  async calculateEventTotal(eventId: string): Promise<EventPriceCalculation> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventSuppliers: {
          include: {
            supplier: true,
            eventItems: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const bySupplier = [];
    let grandTotal = 0;

    for (const eventSupplier of event.eventSuppliers) {
      const items = [];
      let supplierTotal = 0;

      for (const item of eventSupplier.eventItems) {
        let itemName = '';

        // Fetch item details based on type
        if (item.itemType === 'HALL') {
          const hall = await prisma.hall.findUnique({
            where: { id: item.itemId },
          });
          itemName = hall?.name || 'Unknown Hall';
        } else if (item.itemType === 'CATERING') {
          const cateringItem = await prisma.cateringItem.findUnique({
            where: { id: item.itemId },
          });
          itemName = cateringItem?.name || 'Unknown Catering Item';
        } else if (item.itemType === 'SERVICE') {
          const service = await prisma.service.findUnique({
            where: { id: item.itemId },
          });
          itemName = service?.name || 'Unknown Service';
        }

        const itemPrice = Number(item.price);
        supplierTotal += itemPrice;

        items.push({
          name: itemName,
          itemType: item.itemType,
          quantity: item.quantity,
          price: itemPrice,
          serviceDate: item.serviceDate ? item.serviceDate.toISOString() : undefined,
        });
      }

      bySupplier.push({
        supplierId: eventSupplier.supplierId,
        supplierName: eventSupplier.supplier.name,
        supplierType: eventSupplier.supplierType,
        total: supplierTotal,
        items,
      });

      grandTotal += supplierTotal;
    }

    return {
      bySupplier,
      grandTotal,
    };
  }

  /**
   * Calculate total for a specific supplier in an event
   */
  async calculateSupplierTotal(eventSupplierId: string): Promise<number> {
    const items = await prisma.eventItem.findMany({
      where: { eventSupplierId },
    });

    const total = items.reduce((sum, item) => sum + Number(item.price), 0);

    return total;
  }

  /**
   * Calculate price for a single item
   */
  async calculateItemPrice(
    item: EventItem,
    numGuests: number,
    numDays: number
  ): Promise<number> {
    if (item.itemType === 'HALL') {
      const hall = await prisma.hall.findUnique({
        where: { id: item.itemId },
      });
      if (!hall) throw new Error('Hall not found');
      return Number(hall.basePricePerDay) * numDays;
    }

    if (item.itemType === 'CATERING') {
      const cateringItem = await prisma.cateringItem.findUnique({
        where: { id: item.itemId },
      });
      if (!cateringItem) throw new Error('Catering item not found');
      return Number(cateringItem.pricePerPerson) * numGuests * item.quantity;
    }

    if (item.itemType === 'SERVICE') {
      const service = await prisma.service.findUnique({
        where: { id: item.itemId },
      });
      if (!service) throw new Error('Service not found');

      switch (service.pricingType) {
        case 'FIXED':
          return Number(service.basePrice) * item.quantity;
        case 'PER_PERSON':
          return Number(service.basePrice) * numGuests * item.quantity;
        case 'PER_DAY':
          return Number(service.basePrice) * numDays * item.quantity;
        case 'PER_HOUR':
          // Assume 8 hours per day
          return Number(service.basePrice) * numDays * 8 * item.quantity;
        default:
          return Number(service.basePrice) * item.quantity;
      }
    }

    return 0;
  }

  /**
   * Apply discounts to event (placeholder for future implementation)
   */
  async applyDiscounts(eventId: string): Promise<void> {
    // Placeholder for complex discount logic
    // Could include:
    // - Early bird discounts
    // - Package deals
    // - Loyalty discounts
    // - Seasonal promotions
    // - Multi-supplier discounts
    console.log(`Applying discounts to event ${eventId} - not yet implemented`);
  }

  /**
   * Apply supplier packages (placeholder for future implementation)
   */
  async applySupplierPackages(eventId: string): Promise<void> {
    // Placeholder for package logic
    // Could include:
    // - Pre-configured supplier packages
    // - Bundle deals (e.g., venue + catering package)
    // - All-inclusive packages
    console.log(`Applying packages to event ${eventId} - not yet implemented`);
  }

  /**
   * Generate a quote without saving to database
   * Used for preliminary cost estimation in the event constructor
   */
  async generateQuote(quoteRequest: EventQuoteRequest): Promise<EventQuote> {
    const { eventName, eventFormat, city, startDate, endDate, numGuests, budget, selectedOffers } = quoteRequest;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const numDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const supplierBreakdown = [];
    let subtotal = 0;

    // Group offers by supplier
    const offersBySupplier = new Map<string, typeof selectedOffers>();
    for (const offer of selectedOffers) {
      if (!offersBySupplier.has(offer.supplierId)) {
        offersBySupplier.set(offer.supplierId, []);
      }
      offersBySupplier.get(offer.supplierId)!.push(offer);
    }

    // Calculate pricing for each supplier
    for (const [supplierId, offers] of offersBySupplier.entries()) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        throw new Error(`Supplier ${supplierId} not found`);
      }

      const items = [];
      let supplierTotal = 0;

      for (const offer of offers) {
        let itemPrice = 0;
        let itemName = '';
        let itemDescription = '';

        if (offer.itemType === 'HALL') {
          const hall = await prisma.hall.findUnique({
            where: { id: offer.itemId },
          });
          if (!hall) throw new Error(`Hall ${offer.itemId} not found`);

          itemName = hall.name;
          itemDescription = `${hall.maxCapacity} capacity, ${hall.areaSqm || 'N/A'} sqm`;
          itemPrice = Number(hall.basePricePerDay) * numDays;
        } else if (offer.itemType === 'CATERING') {
          const cateringItem = await prisma.cateringItem.findUnique({
            where: { id: offer.itemId },
          });
          if (!cateringItem) throw new Error(`Catering item ${offer.itemId} not found`);

          itemName = cateringItem.name;
          itemDescription = cateringItem.description || '';
          itemPrice = Number(cateringItem.pricePerPerson) * numGuests * (offer.quantity || 1);
        } else if (offer.itemType === 'SERVICE') {
          const service = await prisma.service.findUnique({
            where: { id: offer.itemId },
          });
          if (!service) throw new Error(`Service ${offer.itemId} not found`);

          itemName = service.name;
          itemDescription = service.description || '';

          switch (service.pricingType) {
            case 'FIXED':
              itemPrice = Number(service.basePrice) * (offer.quantity || 1);
              break;
            case 'PER_PERSON':
              itemPrice = Number(service.basePrice) * numGuests * (offer.quantity || 1);
              break;
            case 'PER_DAY':
              itemPrice = Number(service.basePrice) * numDays * (offer.quantity || 1);
              break;
            case 'PER_HOUR':
              itemPrice = Number(service.basePrice) * numDays * 8 * (offer.quantity || 1);
              break;
          }
        }

        supplierTotal += itemPrice;
        items.push({
          itemId: offer.itemId,
          itemType: offer.itemType,
          name: itemName,
          description: itemDescription,
          quantity: offer.quantity || 1,
          unitPrice: itemPrice / (offer.quantity || 1),
          totalPrice: itemPrice,
          serviceDate: offer.serviceDate,
        });
      }

      supplierBreakdown.push({
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierType: supplier.supplierType,
        items,
        total: supplierTotal,
      });

      subtotal += supplierTotal;
    }

    // Calculate platform commission (5% of subtotal)
    const platformCommission = subtotal * 0.05;
    const grandTotal = subtotal + platformCommission;

    // Check if within budget
    const withinBudget = budget ? grandTotal <= budget : true;

    return {
      eventName,
      eventFormat,
      city,
      startDate,
      endDate,
      numGuests,
      numDays,
      budget,
      supplierBreakdown,
      subtotal,
      platformCommission,
      grandTotal,
      withinBudget,
      currency: 'EUR',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate platform commission based on event total
   */
  calculatePlatformCommission(subtotal: number, commissionRate: number = 0.05): number {
    return subtotal * commissionRate;
  }
}
