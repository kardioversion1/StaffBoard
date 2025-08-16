import { describe, it, expect } from 'vitest';
import { searchNurses } from './search';
import { Nurse } from '../types';

const nurses: Nurse[] = [
  { id: '1', firstName: 'Alice', lastName: 'Smith', role: 'RN', status: 'active', hospitalId: '1234' },
  { id: '2', firstName: 'Bob', lastName: 'Jones', role: 'RN', status: 'active', hospitalId: '5678' },
];

describe('searchNurses', () => {
  it('matches by hospital id', () => {
    const res = searchNurses(nurses, '5678');
    expect(res[0].id).toBe('2');
  });
});
