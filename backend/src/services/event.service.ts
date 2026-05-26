import { PrismaClient, Prisma } from '@prisma/client';
import {
  Event,
  EventWithSuppliers,
  CreateEventDTO,
  UpdateEventDTO,
  AddSupplierToEventDTO,
  UpdateEventSupplierDTO,
  AddItemToEventDTO,
  UpdateEventItemDTO,
  EventSupplier,
  EventItem,
} from '../types';

const prisma = new PrismaClient();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}

function mapSupplier(supplier: Prisma.SupplierGetPayload<{}>) {
  return {
    id: supplier.id,
    name: supplier.name,
    supplierType: supplier.supplierType,
    contactEmail: supplier.contactEmail ?? undefined,
    contactPhone: supplier.contactPhone ?? undefined,
    address: supplier.address ?? undefined,
    city: supplier.city ?? undefined,
    country: supplier.country ?? undefined,
    description: supplier.description ?? undefined,
    logoUrl: supplier.logoUrl ?? undefined,
    settings: isPlainObject(supplier.settings) ? supplier.settings : undefined,
    isActive: supplier.isActive,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

function mapEvent(event: Prisma.EventGetPayload<{}>): Event {
  return {
    id: event.id,
    userId: event.userId,
    status: event.status,
    eventName: event.eventName ?? undefined,
    eventFormat: event.eventFormat ?? undefined,
    startDate: event.startDate,
    endDate: event.endDate,
    numGuests: event.numGuests,
    totalPrice: decimalToNumber(event.totalPrice),
    notes: event.notes ?? undefined,
    pdfUrl: event.pdfUrl ?? undefined,
    submittedAt: event.submittedAt ?? undefined,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function mapEventSupplier(eventSupplier: Prisma.EventSupplierGetPayload<{}>): EventSupplier {
  return {
    id: eventSupplier.id,
    eventId: eventSupplier.eventId,
    supplierId: eventSupplier.supplierId,
    supplierType: eventSupplier.supplierType,
    status: eventSupplier.status,
    totalPrice: decimalToNumber(eventSupplier.totalPrice),
    notes: eventSupplier.notes ?? undefined,
    createdAt: eventSupplier.createdAt,
    updatedAt: eventSupplier.updatedAt,
  };
}

function mapEventItem(eventItem: Prisma.EventItemGetPayload<{}>): EventItem {
  return {
    id: eventItem.id,
    eventId: eventItem.eventId,
    eventSupplierId: eventItem.eventSupplierId,
    itemType: eventItem.itemType,
    itemId: eventItem.itemId,
    quantity: eventItem.quantity,
    serviceDate: eventItem.serviceDate ?? undefined,
    price: Number(eventItem.price),
    notes: eventItem.notes ?? undefined,
    createdAt: eventItem.createdAt,
  };
}

export class EventService {
  /**
   * Create a new event (draft status)
   */
  async createEvent(userId: string, data: CreateEventDTO): Promise<Event> {
    const event = await prisma.event.create({
      data: {
        userId,
        eventName: data.eventName,
        eventFormat: data.eventFormat,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        numGuests: data.numGuests,
        notes: data.notes,
        status: 'DRAFT',
      },
    });

    return mapEvent(event);
  }

  /**
   * Update event details
   */
  async updateEvent(eventId: string, data: UpdateEventDTO): Promise<Event> {
    const updateData: Record<string, unknown> = {};

    if (data.eventName !== undefined) updateData.eventName = data.eventName;
    if (data.eventFormat !== undefined) updateData.eventFormat = data.eventFormat;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.numGuests !== undefined) updateData.numGuests = data.numGuests;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return mapEvent(event);
  }

  /**
   * Get event with all suppliers and items
   */
  async getEvent(eventId: string): Promise<EventWithSuppliers> {
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

    return {
      ...mapEvent(event),
      eventSuppliers: event.eventSuppliers.map((es) => ({
        ...mapEventSupplier(es),
        supplier: mapSupplier(es.supplier),
        eventItems: es.eventItems.map(mapEventItem),
      })),
    };
  }

  /**
   * List all events for a user
   */
  async listUserEvents(userId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return events.map(mapEvent);
  }

  /**
   * Delete an event (only if DRAFT)
   */
  async deleteEvent(eventId: string): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'DRAFT') {
      throw new Error('Can only delete draft events');
    }

    await prisma.event.delete({
      where: { id: eventId },
    });
  }

  /**
   * Add a supplier to an event
   */
  async addSupplierToEvent(
    eventId: string,
    data: AddSupplierToEventDTO
  ): Promise<EventSupplier> {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Verify supplier type matches
    if (supplier.supplierType !== data.supplierType) {
      throw new Error('Supplier type mismatch');
    }

    // Create event-supplier relationship
    const eventSupplier = await prisma.eventSupplier.create({
      data: {
        eventId,
        supplierId: data.supplierId,
        supplierType: data.supplierType,
        notes: data.notes,
        status: 'SELECTED',
      },
    });

    return mapEventSupplier(eventSupplier);
  }

  /**
   * Remove a supplier from an event
   */
  async removeSupplierFromEvent(eventSupplierId: string): Promise<void> {
    // This will cascade delete all eventItems associated with this supplier
    await prisma.eventSupplier.delete({
      where: { id: eventSupplierId },
    });
  }

  /**
   * Update event-supplier relationship
   */
  async updateEventSupplier(
    eventSupplierId: string,
    data: UpdateEventSupplierDTO
  ): Promise<EventSupplier> {
    const updateData: Record<string, unknown> = {};

    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const eventSupplier = await prisma.eventSupplier.update({
      where: { id: eventSupplierId },
      data: updateData,
    });

    return mapEventSupplier(eventSupplier);
  }

  /**
   * Add an item (hall/catering/service) to an event
   */
  async addItemToEvent(eventId: string, data: AddItemToEventDTO): Promise<EventItem> {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Verify eventSupplier exists and belongs to this event
    const eventSupplier = await prisma.eventSupplier.findUnique({
      where: { id: data.eventSupplierId },
    });

    if (!eventSupplier || eventSupplier.eventId !== eventId) {
      throw new Error('Event supplier not found or does not belong to this event');
    }

    // Calculate price based on item type
    let price = 0;
    const numDays = Math.ceil(
      (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (data.itemType === 'HALL') {
      const hall = await prisma.hall.findUnique({
        where: { id: data.itemId },
      });
      if (!hall) throw new Error('Hall not found');
      price = Number(hall.basePricePerDay);
    } else if (data.itemType === 'CATERING') {
      const cateringItem = await prisma.cateringItem.findUnique({
        where: { id: data.itemId },
      });
      if (!cateringItem) throw new Error('Catering item not found');
      price = Number(cateringItem.pricePerPerson) * event.numGuests * data.quantity;
    } else if (data.itemType === 'SERVICE') {
      const service = await prisma.service.findUnique({
        where: { id: data.itemId },
      });
      if (!service) throw new Error('Service not found');

      // Calculate price based on pricing type
      switch (service.pricingType) {
        case 'FIXED':
          price = Number(service.basePrice) * data.quantity;
          break;
        case 'PER_PERSON':
          price = Number(service.basePrice) * event.numGuests * data.quantity;
          break;
        case 'PER_DAY':
          price = Number(service.basePrice) * numDays * data.quantity;
          break;
        case 'PER_HOUR':
          // Assume 8 hours per day for hourly services
          price = Number(service.basePrice) * numDays * 8 * data.quantity;
          break;
      }
    }

    // Create event item
    const eventItem = await prisma.eventItem.create({
      data: {
        eventId,
        eventSupplierId: data.eventSupplierId,
        itemType: data.itemType,
        itemId: data.itemId,
        quantity: data.quantity,
        serviceDate: data.serviceDate ? new Date(data.serviceDate) : null,
        price,
        notes: data.notes,
      },
    });

    // Update event supplier total
    await this.updateEventSupplierTotal(data.eventSupplierId);

    return mapEventItem(eventItem);
  }

  /**
   * Remove an item from an event
   */
  async removeItemFromEvent(eventItemId: string): Promise<void> {
    const eventItem = await prisma.eventItem.findUnique({
      where: { id: eventItemId },
    });

    if (!eventItem) {
      throw new Error('Event item not found');
    }

    await prisma.eventItem.delete({
      where: { id: eventItemId },
    });

    // Update event supplier total
    await this.updateEventSupplierTotal(eventItem.eventSupplierId);
  }

  /**
   * Update an event item
   */
  async updateEventItem(eventItemId: string, data: UpdateEventItemDTO): Promise<EventItem> {
    const updateData: Record<string, unknown> = {};

    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.serviceDate) updateData.serviceDate = new Date(data.serviceDate);
    if (data.price !== undefined) updateData.price = data.price;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const eventItem = await prisma.eventItem.update({
      where: { id: eventItemId },
      data: updateData,
    });

    // Update event supplier total
    await this.updateEventSupplierTotal(eventItem.eventSupplierId);

    return mapEventItem(eventItem);
  }

  /**
   * Submit event for approval
   */
  async submitEvent(eventId: string): Promise<Event> {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    return mapEvent(event);
  }

  /**
   * Confirm event (manager/admin only)
   */
  async confirmEvent(eventId: string): Promise<Event> {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CONFIRMED',
      },
    });

    return mapEvent(event);
  }

  /**
   * Cancel event
   */
  async cancelEvent(eventId: string): Promise<Event> {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CANCELLED',
      },
    });

    return mapEvent(event);
  }

  /**
   * Update event supplier total price (sum of all items)
   */
  private async updateEventSupplierTotal(eventSupplierId: string): Promise<void> {
    const items = await prisma.eventItem.findMany({
      where: { eventSupplierId },
    });

    const total = items.reduce((sum, item) => sum + Number(item.price), 0);

    await prisma.eventSupplier.update({
      where: { id: eventSupplierId },
      data: { totalPrice: total },
    });

    // Also update event total
    const eventSupplier = await prisma.eventSupplier.findUnique({
      where: { id: eventSupplierId },
    });

    if (eventSupplier) {
      await this.updateEventTotal(eventSupplier.eventId);
    }
  }

  /**
   * Update event total price (sum of all supplier totals)
   */
  private async updateEventTotal(eventId: string): Promise<void> {
    const eventSuppliers = await prisma.eventSupplier.findMany({
      where: { eventId },
    });

    const total = eventSuppliers.reduce(
      (sum, es) => sum + Number(es.totalPrice || 0),
      0
    );

    await prisma.event.update({
      where: { id: eventId },
      data: { totalPrice: total },
    });
  }
}
