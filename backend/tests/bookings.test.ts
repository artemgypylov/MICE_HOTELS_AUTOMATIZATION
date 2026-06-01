import request from 'supertest';

import { mockPrisma } from './__mocks__/prismaMock';

jest.mock('@prisma/client', () => require('./__mocks__/prismaMock'));
jest.mock('../src/services/email.service', () => ({
  notifyClientConfirmed: jest.fn(),
  notifyClientCancelled: jest.fn(),
  notifyClientSubmitted: jest.fn(),
  notifyManagerNewBooking: jest.fn(),
}));

import app from '../src/app';
import { generateToken } from '../src/utils/jwt';

const clientToken = generateToken({ id: 'c1', email: 'c@x.com', role: 'CLIENT' });

describe('Booking routes', () => {
  it('requires authentication to create a booking', async () => {
    const res = await request(app).post('/api/bookings').send({});
    expect(res.status).toBe(401);
  });

  it('validates the booking payload', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ eventName: 'No hotel id' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.fields).toHaveProperty('hotelId');
  });

  it('creates a booking with a valid payload', async () => {
    mockPrisma.booking.create.mockResolvedValueOnce({
      id: 'b1',
      status: 'DRAFT',
    });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        hotelId: 'h1',
        eventName: 'Conference',
        startDate: '2026-07-01',
        endDate: '2026-07-02',
        numGuests: 50,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('b1');
  });

  it('submits a booking, records status history and sets PENDING', async () => {
    mockPrisma.booking.findUnique.mockResolvedValueOnce({
      id: 'b1',
      userId: 'c1',
      status: 'DRAFT',
      eventName: 'Conference',
    });
    mockPrisma.booking.update.mockResolvedValueOnce({
      id: 'b1',
      status: 'PENDING',
    });
    mockPrisma.bookingStatusHistory.create.mockResolvedValueOnce({ id: 'h1' });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/bookings/b1/submit')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PENDING');
    expect(mockPrisma.bookingStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ toStatus: 'PENDING', fromStatus: 'DRAFT' }),
      })
    );
  });
});
