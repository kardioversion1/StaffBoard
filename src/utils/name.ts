import { Nurse } from '../types';

export function fullName(n: Nurse): string {
  return `${n.firstName} ${n.lastName}`;
}

export function displayName(n: Nurse, format: 'first-lastInitial' | 'full' = 'first-lastInitial') {
  return format === 'full' ? fullName(n) : `${n.firstName} ${n.lastName.charAt(0)}.`;
}
