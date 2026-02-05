/**
 * Test setup file
 * Configures the testing environment
 */

import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock Prisma client
beforeAll(() => {
  // Setup mock database connections
});

afterEach(() => {
  // Clear mocks after each test
});

afterAll(() => {
  // Cleanup after all tests
});
