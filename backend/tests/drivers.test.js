// tests/drivers.test.js
const request = require('supertest');
const app     = require('../src/config/server');

describe('Drivers API', () => {
  it('GET /api/drivers — requires auth', async () => {
    const res = await request(app).get('/api/drivers');
    expect(res.statusCode).toBe(401);
  });
});
