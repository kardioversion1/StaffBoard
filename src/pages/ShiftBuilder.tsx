import React, { useState } from 'react';
import { useStore } from '../store';

const ShiftBuilder: React.FC = () => {
  const nurses = useStore((s) => Object.values(s.nurses));
  const history = useStore((s) => s.history);
  const zones = useStore((s) => s.zones);
  const [selected, setSelected] = useState<string>('');

  const entries = selected ? history[selected] || [] : [];
  const zoneName = (id?: string) => zones.find((z) => z.id === id)?.name || 'Unassigned';

  return (
    <div style={{ padding: 20 }}>
      <h2>Shift Builder</h2>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Select nurse</option>
        {nurses.map((n) => (
          <option key={n.id} value={n.id}>
            {n.firstName} {n.lastName}
          </option>
        ))}
      </select>
      {selected && (
        <ul>
          {entries.slice(0, 5).map((h, i) => (
            <li key={i}>
              {new Date(h.start).toLocaleDateString()} · {zoneName(h.zoneId)}{h.dto ? ' (DTO)' : ''}
            </li>
          ))}
          {entries.length === 0 && <li>No prior shifts recorded.</li>}
        </ul>
      )}
    </div>
  );
};

export default ShiftBuilder;
