import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmate_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  await User.deleteMany({ email: /@test\.dev$/ });
  await mongoose.disconnect();
});

describe('Authentication & Profile API Tests', () => {
  const testUser = {
    fullName: 'Test Hacker',
    username: 'testhacker',
    email: 'hacker@test.dev',
    password: 'Password123!',
    roleTitle: 'Full-Stack Developer',
    skills: ['React', 'Node.js'],
  };

  let authToken = '';

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    authToken = res.body.token;
  });

  it('should prevent duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Bad User',
        username: 'baduser',
        email: 'not-an-email',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should get current user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe(testUser.username);
  });

  it('should reject unauthorized profile requests without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should update user profile details', async () => {
    const res = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bio: 'Updated bio testing live endpoint',
        experienceLevel: 'Advanced',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.bio).toBe('Updated bio testing live endpoint');
    expect(res.body.user.experienceLevel).toBe('Advanced');
  });
});
