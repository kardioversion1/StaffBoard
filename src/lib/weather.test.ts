import { describe, it, expect } from 'vitest';
import { formatTemp } from './weather';

describe('formatTemp', () => {
  it('formats Fahrenheit by default', () => {
    expect(formatTemp(72, 'F')).toBe('72°F');
  });
  it('converts to Celsius when requested', () => {
    expect(formatTemp(41, 'C')).toBe('5°C');
  });
});
