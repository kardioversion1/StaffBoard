import { describe, it, expect } from 'vitest';
import { formatTemp } from './weather';

describe('formatTemp', () => {
  it('formats Fahrenheit from Celsius input', () => {
    expect(formatTemp(22, 'F')).toBe('72°F');
  });
  it('returns Celsius when requested', () => {
    expect(formatTemp(5, 'C')).toBe('5°C');
  });
});
