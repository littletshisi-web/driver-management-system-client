// tests/tasks.test.js
const request = require('supertest');
const app     = require('../src/config/server');

describe('Tasks API', () => {
  it('GET /api/tasks — requires auth', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });
});
