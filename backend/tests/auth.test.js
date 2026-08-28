const request = require('supertest');
const app = require('../server');

// Mock supabase client
jest.mock('../config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  insert: jest.fn(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}));

const supabase = require('../config/supabase');

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock Supabase signUp response
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      });
      // Mock Supabase DB insert response
      supabase.insert.mockResolvedValue({ error: null });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { name: 'Test User' } }
      });
    });

    it('should return 400 if email or password missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // missing password

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Email and password are required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'fake-token', refresh_token: 'fake-refresh' },
          user: { id: 'user-1', email: 'test@example.com' }
        },
        error: null,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBe('fake-token');
      expect(res.body.message).toBe('Login successful');
    });
  });
});
