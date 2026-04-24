import { PrismaClient } from '@prisma/client';
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
import { sendEmail } from './email.service';

const prisma = new PrismaClient();

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

    return event as any;
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

    return event as any;
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
            eventItems: {
              include: {
                // Note: We can't directly include polymorphic relations
                // Caller will need to fetch hall/cateringItem/service separately
                // based on itemType and itemId
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event as unknown as EventWithSuppliers;
  }

  /**
   * List all events for a user
   */
  async listUserEvents(userId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return events as any[];
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

    return eventSupplier as any;
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

    return eventSupplier as any;
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

    return eventItem as any;
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

    return eventItem as any;
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

    return event as any;
  }

  /**
   * Confirm event (manager/admin only)
   */
  async confirmEvent(eventId: string): Promise<Event> {
    const eventWithUser = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!eventWithUser) {
      throw new Error('Event not found');
    }

    // Send confirmation email
    if (eventWithUser.user && eventWithUser.user.email) {
      const userName = (eventWithUser.user.firstName || eventWithUser.user.lastName)
        ? `${eventWithUser.user.firstName || ''} ${eventWithUser.user.lastName || ''}`.trim()
        : 'user';
      await sendEmail({
        to: eventWithUser.user.email,
        subject: `Your event "${eventWithUser.eventName}" is confirmed!`,
        text: `Dear ${userName},\n\nYour event "${eventWithUser.eventName}" has been successfully confirmed.`,
      });
    }

    const { user, ...event } = eventWithUser;
    return event as any;
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

    return event as any;
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
