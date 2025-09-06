import { describe, it, expect } from 'vitest';
import { CURRENT_SCHEMA_VERSION } from '../../constants/schema';

describe('Schema Constants', () => {
  it('should have a valid CURRENT_SCHEMA_VERSION', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe('1.2.0');
  });
});
