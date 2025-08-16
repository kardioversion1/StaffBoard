import React, { useState } from 'react';
import { useStore } from '../../store';
import { Role } from '../../types';

const CardAncillary: React.FC = () => {
  const ancillary = useStore((s) => s.ancillary);
  const addAncillary = useStore((s) => s.addAncillary);
  const [role, setRole] = useState<Role>('RT');
  const [names, setNames] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!names.trim()) return;
    addAncillary(
      role,
      names.split(',').map((n) => n.trim()).filter(Boolean),
      note || undefined
    );
    setNames('');
    setNote('');
  };

  return (
    <div className="rail-card ancillary">
      <h3>Ancillary Staff</h3>
      {ancillary.length === 0 ? (
        <div className="empty">None</div>
      ) : (
        <ul>
          {ancillary.map((a) => (
            <li key={a.id}>
              <strong>{a.role}:</strong> {a.names.join(', ')}{' '}
              {a.note && `– ${a.note}`}
            </li>
          ))}
        </ul>
      )}
      <div className="add-row">
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="RT">RT</option>
          <option value="Rad">Rad</option>
          <option value="Transport">Transport</option>
          <option value="Scribe">Scribe</option>
          <option value="Other">Other</option>
        </select>
        <input
          placeholder="Names"
          value={names}
          onChange={(e) => setNames(e.target.value)}
        />
        <input
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={handleAdd}>+ Add</button>
      </div>
    </div>
  );
};

export default CardAncillary;
