
import { todayISO } from './utils.js';

export const STATE = {
  date: todayISO(),
  zones: ['Beds 1–3','Beds 4–7','Beds 8–10','Fast Track'],
  staff: [],
  theme: 'dark',
  accent: 'blue'
};

export const getById = id => STATE.staff.find(s=>s.id===id);
