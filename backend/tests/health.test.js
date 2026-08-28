const request = require('supertest');
const app = require('../server');

describe('Health Check Route', () => {
  it('should return 200 OK and Server is working message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Server is working');
  });
});
