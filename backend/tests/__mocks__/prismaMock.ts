/**
 * Shared Prisma mock. Every `new PrismaClient()` across route modules returns
 * the SAME mock instance, so tests can configure `mockPrisma.user.findUnique`
 * etc. and have it apply everywhere.
 */
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  booking: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
  bookingStatusHistory: { create: jest.fn(), findMany: jest.fn() },
  bookingComment: { create: jest.fn(), findMany: jest.fn() },
  hall: { findUnique: jest.fn() },
  hotel: { findUnique: jest.fn(), findMany: jest.fn() },
  $transaction: jest.fn(),
};

// Default $transaction implementation: invoke the callback with the mock as tx.
mockPrisma.$transaction.mockImplementation(async (arg: unknown) => {
  if (typeof arg === 'function') {
    return (arg as (tx: typeof mockPrisma) => unknown)(mockPrisma);
  }
  return Promise.all(arg as Promise<unknown>[]);
});

// Enum values used by route handlers.
export const BookingStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

export const Prisma = {
  Decimal: class Decimal {
    private value: number;
    constructor(v: number | string) {
      this.value = Number(v);
    }
    toString() {
      return String(this.value);
    }
    valueOf() {
      return this.value;
    }
  },
};

export class PrismaClient {
  constructor() {
    return mockPrisma as unknown as PrismaClient;
  }
}
