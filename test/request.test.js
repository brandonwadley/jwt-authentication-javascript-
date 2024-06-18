const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../server.js');

const encryptPassword = password => {
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(password, salt);
    return encryptedPassword
};

let authToken;

describe('Testing API', () => {
  jest.setTimeout(10000);

  afterAll((done) => {
    app.close(done);
  });

    test('should create new account', async () => {
      const data = {
        username: 'testusername',
        password: encryptPassword("testpassword"),
      };
  
      const response = await request(app)
        .post('/api/register')
        .send(data);
  
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Account has been created');
    });
    test('should log into account', async () => {
      const data = {
        username: 'testusername',
        password: "testpassword",
      };
      const response = await request(app)
      .post('/api/login')
      .send(data);

      expect(response.statusCode).toBe(201);
      expect(response.headers['auth']).toBeDefined();

      authToken = response.headers['auth'];
    })
    test('should allow access to protected route', async () => {
      expect(authToken).toBeDefined();

      const response = await request(app)
      .get('/api/protected')
      .set('auth', authToken)

      expect(response.statusCode).toBe(201);
    })
  });
