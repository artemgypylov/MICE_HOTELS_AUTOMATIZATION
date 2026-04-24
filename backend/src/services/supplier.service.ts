import { PrismaClient } from '@prisma/client';
import {
  Supplier,
  SupplierWithOffers,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierFilters,
  SearchSuppliersDTO,
  SupplierType,
} from '../types';

const prisma = new PrismaClient();

export class SupplierService {
  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierDTO): Promise<Supplier> {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        supplierType: data.supplierType,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        city: data.city,
        country: data.country,
        description: data.description,
        logoUrl: data.logoUrl,
        settings: data.settings || ({} as any),
        isActive: true,
      },
    });

    return supplier as Supplier;
  }

  /**
   * Update supplier details
   */
  async updateSupplier(supplierId: string, data: UpdateSupplierDTO): Promise<Supplier> {
    const { settings, ...rest } = data;
    const updateData: any = { ...rest };

    if (settings) {
      updateData.settings = settings;
    }

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData,
    });

    return supplier as Supplier;
  }

  /**
   * Get supplier with all offers (halls, catering, services)
   */
  async getSupplier(supplierId: string): Promise<SupplierWithOffers> {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        halls: {
          where: { isActive: true },
          include: {
            seatingLayouts: true,
          },
        },
        cateringCategories: {
          where: { isActive: true },
          include: {
            items: {
              where: { isActive: true },
            },
          },
        },
        serviceCategories: {
          where: { isActive: true },
          include: {
            services: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return supplier as unknown as SupplierWithOffers;
  }

  /**
   * List suppliers with optional filters
   */
  async listSuppliers(filters: SupplierFilters = {}): Promise<Supplier[]> {
    const where: Record<string, unknown> = {};

    if (filters.supplierType) {
      where.supplierType = filters.supplierType;
    }

    if (filters.city) {
      where.city = filters.city;
    }

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return suppliers as Supplier[];
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(supplierId: string): Promise<void> {
    // Check if supplier is used in any events
    const eventSuppliers = await prisma.eventSupplier.findMany({
      where: { supplierId },
      take: 1,
    });

    if (eventSuppliers.length > 0) {
      throw new Error('Cannot delete supplier that is used in events');
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });
  }

  /**
   * Get suppliers by type
   */
  async getSuppliersByType(
    type: SupplierType,
    city?: string
  ): Promise<Supplier[]> {
    const where: Record<string, unknown> = {
      supplierType: type,
      isActive: true,
    };

    if (city) {
      where.city = city;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return suppliers as Supplier[];
  }

  /**
   * Search suppliers with advanced filters
   */
  async searchSuppliers(query: SearchSuppliersDTO): Promise<SupplierWithOffers[]> {
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (query.supplierType) {
      where.supplierType = query.supplierType;
    }

    if (query.city) {
      where.city = query.city;
    }

    if (query.country) {
      where.country = query.country;
    }

    if (query.query) {
      where.OR = [
        { name: { contains: query.query, mode: 'insensitive' } },
        { description: { contains: query.query, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        halls: {
          where: {
            isActive: true,
            ...(query.minCapacity ? { maxCapacity: { gte: query.minCapacity } } : {}),
          },
          include: {
            seatingLayouts: true,
          },
        },
        cateringCategories: {
          where: { isActive: true },
          include: {
            items: {
              where: { isActive: true },
            },
          },
        },
        serviceCategories: {
          where: { isActive: true },
          include: {
            services: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Filter out suppliers with no matching halls if minCapacity is specified
    if (query.minCapacity) {
      return suppliers.filter(s => s.halls.length > 0) as unknown as SupplierWithOffers[];
    }

    return suppliers as unknown as SupplierWithOffers[];
  }

  /**
   * Check supplier availability for a date range
   */
  async checkSupplierAvailability(
    supplierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // For VENUE suppliers, check hall availability
    if (supplier.supplierType === 'VENUE') {
      const halls = await prisma.hall.findMany({
        where: {
          supplierId,
          isActive: true,
        },
      });

      // Check if any hall has conflicting bookings
      for (const hall of halls) {
        const conflictingBookings = await prisma.bookingHall.findMany({
          where: {
            hallId: hall.id,
            bookingDate: {
              gte: startDate,
              lte: endDate,
            },
            booking: {
              status: {
                in: ['PENDING', 'CONFIRMED'],
              },
            },
          },
        });

        if (conflictingBookings.length === 0) {
          // At least one hall is available
          return true;
        }
      }

      return false;
    }

    // For other supplier types, we assume availability
    // (more complex logic could be added here)
    return true;
  }

  /**
   * Get supplier offers by type (polymorphic)
   */
  async getSupplierOffers(supplierId: string): Promise<SupplierWithOffers> {
    return this.getSupplier(supplierId);
  }
}
