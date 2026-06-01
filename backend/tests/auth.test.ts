import request from 'supertest';

import { mockPrisma } from './__mocks__/prismaMock';

// Mock Prisma and bcrypt-heavy password utils for deterministic, DB-free tests.
jest.mock('@prisma/client', () => require('./__mocks__/prismaMock'));
jest.mock('../src/utils/password', () => ({
  hashPassword: jest.fn(async (p: string) => `hashed:${p}`),
  comparePassword: jest.fn(async (p: string, h: string) => h === `hashed:${p}`),
}));

import app from '../src/app';

describe('Auth routes', () => {
  describe('POST /api/auth/register', () => {
    it('rejects invalid email with 400 and field errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'secret123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.fields).toHaveProperty('email');
    });

    it('rejects short password with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.fields).toHaveProperty('password');
    });

    it('creates a user and returns a token', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@example.com',
        role: 'CLIENT',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'secret123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('user@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns a token for valid credentials and records lastLoginAt', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: 'hashed:secret123',
        role: 'CLIENT',
        companyName: null,
        firstName: null,
        lastName: null,
        phone: null,
      });
      mockPrisma.user.update.mockResolvedValueOnce({ id: 'u1' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'secret123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ lastLoginAt: expect.any(Date) }) })
      );
    });

    it('rejects invalid credentials with 401', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: 'hashed:secret123',
        role: 'CLIENT',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
