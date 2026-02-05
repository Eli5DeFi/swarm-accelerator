# Testing Guide

## Overview

This directory contains the testing infrastructure for VentureClaw. We use **Vitest** as our testing framework with React Testing Library for component tests.

## Setup

### Install Dependencies

```bash
# Note: May need --legacy-peer-deps due to wagmi/rainbowkit version conflicts
npm install --save-dev --legacy-peer-deps \
  vitest \
  @vitejs/plugin-react \
  happy-dom \
  @testing-library/react \
  @testing-library/jest-dom \
  msw \
  @vitest/ui
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup
│   ├── README.md            # This file
│   └── mocks/               # Shared mocks
├── app/
│   └── api/
│       └── */route.test.ts  # API route tests
└── components/
    └── *.test.tsx           # Component tests
```

## Writing Tests

### API Route Tests

API routes should test:
- ✅ Valid requests return correct responses
- ✅ Invalid data is rejected with proper errors
- ✅ Authentication/authorization works
- ✅ Edge cases and error handling
- ✅ Input validation (Zod schemas)

Example:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma');

describe('POST /api/example', () => {
  it('should create resource with valid data', async () => {
    // Setup mocks
    (prisma.example.create as any).mockResolvedValue({ id: '123' });

    // Create request
    const request = new Request('http://localhost:3000/api/example', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    // Execute
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.id).toBe('123');
  });
});
```

### Component Tests

Component tests should verify:
- ✅ Rendering with props
- ✅ User interactions
- ✅ State changes
- ✅ Accessibility

Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders button and handles click', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Test Coverage Goals

- **Critical paths**: 100% coverage
  - Authentication
  - Pitch submission
  - Funding acceptance
  - Payment flows
- **API routes**: 90%+ coverage
- **Components**: 80%+ coverage
- **Utilities**: 90%+ coverage

## Mocking Strategy

### Prisma Database

Always mock Prisma in unit tests:

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
```

### External APIs

Use MSW (Mock Service Worker) for API mocking:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('https://api.example.com/data', (req, res, ctx) => {
    return res(ctx.json({ data: 'mocked' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Keep tests isolated** - Each test should run independently
3. **Use descriptive names** - Test names should explain what they verify
4. **Arrange-Act-Assert** - Structure tests clearly
5. **Mock external dependencies** - Database, APIs, file system
6. **Test edge cases** - Empty data, errors, boundary conditions
7. **Avoid test duplication** - Use shared setup and utilities

## Common Issues

### npm Install Fails

If you encounter permission errors:

```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

### Tests Fail to Run

Check:
- All mocks are properly set up in `setup.ts`
- Environment variables are configured
- Database connections are mocked

### Type Errors in Tests

Explicitly cast mocked functions:

```typescript
(prisma.user.findUnique as any).mockResolvedValue({ ... });
```

## CI/CD Integration

Tests run automatically on:
- Every PR
- Before deployment
- On push to `main`

Required: All tests must pass before merge.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
