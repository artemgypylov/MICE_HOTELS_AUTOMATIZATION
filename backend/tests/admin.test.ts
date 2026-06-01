import request from 'supertest';

import { mockPrisma } from './__mocks__/prismaMock';

jest.mock('@prisma/client', () => require('./__mocks__/prismaMock'));
// Email service must not attempt real SMTP during tests.
jest.mock('../src/services/email.service', () => ({
  notifyClientConfirmed: jest.fn(),
  notifyClientCancelled: jest.fn(),
  notifyClientSubmitted: jest.fn(),
  notifyManagerNewBooking: jest.fn(),
}));

import app from '../src/app';
import { generateToken } from '../src/utils/jwt';

const clientToken = generateToken({ id: 'c1', email: 'c@x.com', role: 'CLIENT' });
const adminToken = generateToken({ id: 'a1', email: 'a@x.com', role: 'ADMIN' });

describe('Admin route protection', () => {
  it('returns 401 for /api/admin/bookings without a token', async () => {
    const res = await request(app).get('/api/admin/bookings');
    expect(res.status).toBe(401);
  });

  it('returns 403 when a CLIENT accesses /api/admin/bookings', async () => {
    const res = await request(app)
      .get('/api/admin/bookings')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 when a non-ADMIN accesses /api/admin/users', async () => {
    const managerToken = generateToken({ id: 'm1', email: 'm@x.com', role: 'MANAGER' });
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Admin booking status change', () => {
  it('records status history and returns the updated booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValueOnce({
      id: 'b1',
      status: 'PENDING',
      eventName: 'Test event',
      totalPrice: 1000,
      user: { email: 'client@example.com' },
    });
    mockPrisma.booking.update.mockResolvedValueOnce({
      id: 'b1',
      status: 'CONFIRMED',
      user: {},
      hotel: {},
    });
    mockPrisma.bookingStatusHistory.create.mockResolvedValueOnce({ id: 'h1' });

    const res = await request(app)
      .put('/api/admin/bookings/b1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CONFIRMED');
    expect(mockPrisma.bookingStatusHistory.create).toHaveBeenCalled();
  });

  it('rejects an invalid status transition with 400', async () => {
    mockPrisma.booking.findUnique.mockResolvedValueOnce({
      id: 'b1',
      status: 'CANCELLED',
      user: { email: 'client@example.com' },
    });

    const res = await request(app)
      .put('/api/admin/bookings/b1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Недопустимый переход');
  });

  it('rejects an invalid status value via validation', async () => {
    const res = await request(app)
      .put('/api/admin/bookings/b1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'NONSENSE' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
