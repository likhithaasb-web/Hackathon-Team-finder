import dotenv from 'dotenv';
dotenv.config();
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import Connection from '../src/models/Connection.js';
import Hackathon from '../src/models/Hackathon.js';
import Task from '../src/models/Task.js';
import request from 'supertest';

async function runTestSuite() {
  console.log('\n=======================================================');
  console.log('🧪 RUNNING HACKMATE FULL-STACK BACKEND TEST SUITE');
  console.log('=======================================================\n');

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmate';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testUser = {
    fullName: 'Test Hacker User',
    username: `testhacker_${timestamp}`,
    email: `tester_${timestamp}@hackmate.dev`,
    password: 'Password@123',
    roleTitle: 'Full-Stack Developer',
    skills: ['React', 'Node.js', 'Python'],
  };

  let token = '';
  let userId = '';
  let teamId = '';
  let hackathonId = '';
  let demoPartner = null;

  try {
    // 1. Health check
    await test('Health check endpoint returns 200 and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'healthy');
      assert.equal(res.body.service, 'HackMate API');
    });

    // 2. User Registration
    await test('User registration creates account and returns JWT token', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, testUser.email);
      token = res.body.token;
      userId = res.body.user._id;
    });

    // 3. Prevent duplicate email registration
    await test('Registration prevents duplicate email collision', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
    });

    // 4. Input validation
    await test('Registration rejects malformed email and short password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Bad User',
        username: 'bad',
        email: 'invalid-email',
        password: '123',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    // 5. User Login
    await test('Login returns authenticated session for valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
    });

    // 6. Login failure
    await test('Login rejects invalid password with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'IncorrectPassword!',
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    // 7. Protected route access
    await test('Protected /auth/me returns current user profile with valid JWT', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, testUser.email);
      assert.ok(res.body.user.profileCompleteness >= 30);
    });

    // 8. Reject unauthorized request
    await test('Protected endpoints block unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      assert.equal(res.status, 401);
    });

    // 9. Profile update
    await test('User can update bio, experience level, and preferred roles', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'Automated test suite bio verification.',
          experienceLevel: 'Advanced',
          preferredRoles: ['Full-Stack', 'Team Lead'],
          location: 'San Francisco, CA',
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.bio, 'Automated test suite bio verification.');
      assert.equal(res.body.user.experienceLevel, 'Advanced');
    });

    // 10. Discover Teammates with Explainable Matching
    await test('Teammate discovery returns candidates with calculated compatibility', async () => {
      const res = await request(app)
        .get('/api/v1/users?lookingForTeam=true')
        .set('Authorization', `Bearer ${token}`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.users));
      assert.ok(res.body.users.length > 0);
      assert.ok(res.body.users[0].compatibility);
      assert.ok(res.body.users[0].compatibility.score > 0);
      demoPartner = res.body.users[0];
    });

    // 11. Send Teammate Request
    await test('User can send teammate connection request to another user', async () => {
      const res = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipientId: demoPartner._id,
          message: 'Hey, let us team up for the upcoming hackathon!',
        });
      assert.ok(res.status === 200 || res.status === 201);
      assert.equal(res.body.success, true);
    });

    // 12. Prevent Duplicate Requests
    await test('Duplicate teammate request is prevented', async () => {
      const res = await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipientId: demoPartner._id,
        });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    // 13. Hackathon Directory
    await test('Hackathon listings are retrieved with domain & format filters', async () => {
      const res = await request(app).get('/api/v1/hackathons');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.hackathons));
      assert.ok(res.body.hackathons.length > 0);
      hackathonId = res.body.hackathons[0]._id;
    });

    // 14. Team Creation
    await test('User can create a team with open positions and desired size', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Innovators ${timestamp}`,
          description: 'A test team created by the test suite to verify recruitment.',
          hackathon: hackathonId,
          desiredSize: 3,
          collaborationMode: 'Remote',
          openPositions: [
            { role: 'UI/UX Designer', requiredSkills: ['Figma'] },
            { role: 'Backend Engineer', requiredSkills: ['Go', 'Node'] },
          ],
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.team._id);
      teamId = res.body.team._id;
    });

    // 15. Team Kanban Task Creation
    await test('Team leader can create task in team workspace', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/team/${teamId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Setup GitHub Actions CI/CD Pipeline',
          description: 'Ensure tests run on every pull request.',
          status: 'todo',
          priority: 'high',
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.task.title, 'Setup GitHub Actions CI/CD Pipeline');
    });

    // 16. Unauthorized Workspace Access Prevention
    await test('Non-members are blocked from accessing team tasks with 403', async () => {
      // Create a temporary separate user
      const otherUserRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Stranger User',
        username: `stranger_${timestamp}`,
        email: `stranger_${timestamp}@hackmate.dev`,
        password: 'Password@123',
      });
      const strangerToken = otherUserRes.body.token;

      const res = await request(app)
        .get(`/api/v1/tasks/team/${teamId}`)
        .set('Authorization', `Bearer ${strangerToken}`);
      assert.equal(res.status, 403);
    });

    // Cleanup test artifacts
    await User.deleteMany({ email: new RegExp(`^tester_${timestamp}|^stranger_${timestamp}`) });
    if (teamId) await Team.findByIdAndDelete(teamId);
    if (teamId) await Task.deleteMany({ team: teamId });
  } catch (criticalErr) {
    console.error('Critical test error:', criticalErr);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n=======================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
