export function generateTempHospitalId(existing: Set<string>): string {
  // 6-digit numeric default; retry until unique
  let id = '';
  do {
    id = String(Math.floor(100000 + Math.random() * 900000));
  } while (existing.has(id));
  return id;
}
