const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { AuditLog } = require('../../src/models');
const { admin, userOne, insertUsers } = require('../fixtures/user.fixture');
const { adminAccessToken, userOneAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('AuditLog routes', () => {
  describe('GET /v1/audit-logs', () => {
    test('should return 401 Unauthorized if authorization token is missing', async () => {
      await request(app)
        .get('/v1/audit-logs')
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 Forbidden if non-admin user queries logs', async () => {
      await insertUsers([userOne]);

      await request(app)
        .get('/v1/audit-logs')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 OK and paginated logs list for admin', async () => {
      await insertUsers([admin]);

      // Seed a few dummy audit log entries directly in DB
      await AuditLog.create([
        {
          action: 'LOGIN_SUCCESS',
          user: admin._id,
          ipAddress: '127.0.0.1',
          status: 'SUCCESS',
        },
        {
          action: 'LOGIN_FAILED',
          ipAddress: '127.0.0.1',
          status: 'FAILED',
          details: { email: 'fake@example.com' },
        }
      ]);

      const res = await request(app)
        .get('/v1/audit-logs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toMatchObject({
        action: 'LOGIN_FAILED',
        status: 'FAILED',
      });
      expect(res.body).toMatchObject({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
    });

    test('should log failed login attempt automatically and be queryable', async () => {
      await insertUsers([admin]);

      // Attempt login with incorrect password to trigger failed login log hook
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: admin.email,
          password: 'incorrectPassword1',
        })
        .expect(httpStatus.UNAUTHORIZED);

      // Check if audit log was created
      const res = await request(app)
        .get('/v1/audit-logs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.totalResults).toBe(1);
      expect(res.body.results[0]).toMatchObject({
        action: 'LOGIN_FAILED',
        status: 'FAILED',
        details: { email: admin.email },
      });
    });
  });
});
