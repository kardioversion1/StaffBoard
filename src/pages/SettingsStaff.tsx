import React, { useState } from 'react';
import { useStore } from '../store';
import { Nurse, Role } from '../types';

const roles: Role[] = ['RN','Charge RN','Tech','MD','APP','RT','Rad','Transport','Scribe','Other'];

const SettingsStaff: React.FC = () => {
  const nurses = useStore((s) => Object.values(s.nurses));
  const add = useStore((s) => s.addNurse);
  const update = useStore((s) => s.updateNurse);
  const remove = useStore((s) => s.removeNurse);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [role, setRole] = useState<Role>('RN');
  const [rf, setRf] = useState('');
  const [query, setQuery] = useState('');

  const filtered = query
    ? nurses.filter((n) =>
        [n.firstName, n.lastName, n.rfNumber, n.role].some((f) =>
          f?.toLowerCase().includes(query.toLowerCase())
        )
      )
    : nurses;

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const arr: Partial<Nurse>[] = JSON.parse(txt);
        arr.forEach((n) =>
          add({
            id: n.id,
            firstName: n.firstName || 'First',
            lastName: n.lastName || 'Last',
            role: (n.role as Role) || 'RN',
            rfNumber: n.rfNumber,
            notes: n.notes,
            status: 'active',
          })
        );
      } catch (err) {
        console.error('import failed', err);
      }
    });
  };

  const onExport = () => {
    const data = JSON.stringify(nurses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'staff.json';
    a.click();
  };

  const addNurse = () => {
    add({ firstName: first, lastName: last, role, rfNumber: rf, status: 'active' });
    setFirst('');
    setLast('');
    setRf('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Staff Manager</h2>
      <div>
        <input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={onExport}>Export</button>
        <input type="file" accept="application/json" onChange={onImport} />
      </div>
      <table>
        <thead>
          <tr>
            <th>First</th>
            <th>Last</th>
            <th>Role</th>
            <th>RF #</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((n) => (
            <tr key={n.id}>
              <td>
                <input value={n.firstName} onChange={(e) => update(n.id, { firstName: e.target.value })} />
              </td>
              <td>
                <input value={n.lastName} onChange={(e) => update(n.id, { lastName: e.target.value })} />
              </td>
              <td>
                <select value={n.role} onChange={(e) => update(n.id, { role: e.target.value as Role })}>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input value={n.rfNumber || ''} onChange={(e) => update(n.id, { rfNumber: e.target.value })} />
              </td>
              <td>
                <button onClick={() => remove(n.id)}>Delete</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First" />
            </td>
            <td>
              <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last" />
            </td>
            <td>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input value={rf} onChange={(e) => setRf(e.target.value)} placeholder="RF" />
            </td>
            <td>
              <button onClick={addNurse}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SettingsStaff;
