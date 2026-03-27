import { PrismaClient } from '@prisma/client';
import { EventPriceCalculation, EventItem } from '../types';

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
}
