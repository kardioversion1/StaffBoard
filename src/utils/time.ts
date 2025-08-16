export function minutesUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.round(diff / 60000);
}

export function offAtLabel(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function shouldShowOffAt(iso?: string | null): boolean {
  const mins = minutesUntil(iso);
  return mins !== null && mins <= 60 && mins >= 0;
}
