import React, { useState } from 'react';
import Modal from './Modal';
import { useStore } from '../store';
import { displayName } from '../utils/name';

interface Props {
  onClose: () => void;
}

const Settings: React.FC<Props> = ({ onClose }) => {
  const nurses = useStore((s) => s.nurses);
  const zones = useStore((s) => s.zones);
  const addNurse = useStore((s) => s.addNurse);
  const updateNurse = useStore((s) => s.updateNurse);
  const addZone = useStore((s) => s.addZone);

  const [staffName, setStaffName] = useState('');
  const [staffHospitalId, setStaffHospitalId] = useState('');
  const [addError, setAddError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zoneName, setZoneName] = useState('');

  return (
    <Modal onClose={onClose} title="Settings">
      <section>
        <h4>Staff</h4>
        <ul>
          {Object.values(nurses).map((n) => (
            <li key={n.id}>
              {displayName(n, 'full')}
              <input
                defaultValue={n.hospitalId || ''}
                placeholder="Hospital ID"
                onBlur={(e) => {
                  try {
                    const val = e.target.value.trim();
                    updateNurse(n.id, { hospitalId: val || undefined });
                    setErrors((p) => ({ ...p, [n.id]: '' }));
                  } catch (err) {
                    setErrors((p) => ({ ...p, [n.id]: (err as Error).message }));
                  }
                }}
              />
              {errors[n.id] && <span className="error">{errors[n.id]}</span>}
            </li>
          ))}
        </ul>
        <input
          placeholder="Full name"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
        />
        <input
          placeholder="Hospital ID (optional)"
          value={staffHospitalId}
          onChange={(e) => setStaffHospitalId(e.target.value)}
        />
        <button
          onClick={() => {
            const [first, ...last] = staffName.split(' ');
            try {
              if (first)
                addNurse({
                  firstName: first,
                  lastName: last.join(' '),
                  role: 'RN',
                  status: 'active',
                  hospitalId: staffHospitalId || undefined,
                });
              setStaffName('');
              setStaffHospitalId('');
              setAddError('');
            } catch (err) {
              setAddError((err as Error).message);
            }
          }}
        >
          Add Staff
        </button>
        {addError && <div className="error">{addError}</div>}
      </section>
      <section>
        <h4>Zones</h4>
        <ul>
          {zones.map((z) => (
            <li key={z.id}>{z.name}</li>
          ))}
        </ul>
        <input
          placeholder="Zone name"
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
        />
        <button
          onClick={() => {
            if (zoneName) addZone(zoneName);
            setZoneName('');
          }}
        >
          Add Zone
        </button>
      </section>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default Settings;
