import { describe, test, expect } from '@jest/globals';

test('shared todo type - basic shape', () => {
  const sample = {
    id: '1',
    title: 'Test',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // basic shape assertions
  expect(typeof sample.id).toBe('string');
  expect(typeof sample.title).toBe('string');
  expect(typeof sample.completed).toBe('boolean');
  expect(typeof sample.createdAt).toBe('string');
  expect(typeof sample.updatedAt).toBe('string');
});
