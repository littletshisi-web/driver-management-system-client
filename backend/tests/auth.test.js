// tests/auth.test.js
const request = require('supertest');
const app     = require('../src/config/server');

describe('Auth API', () => {
  it('POST /api/auth/login — rejects bad credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@fleethq.co.za', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login — validates input', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' });
    expect(res.statusCode).toBe(422);
  });

  it('GET /api/auth/me — rejects unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
