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
  const addZone = useStore((s) => s.addZone);

  const [staffName, setStaffName] = useState('');
  const [zoneName, setZoneName] = useState('');

  return (
    <Modal onClose={onClose} title="Settings">
      <section>
        <h4>Staff</h4>
        <ul>
          {Object.values(nurses).map((n) => (
            <li key={n.id}>{displayName(n, 'full')}</li>
          ))}
        </ul>
        <input
          placeholder="Full name"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
        />
        <button
          onClick={() => {
            const [first, ...last] = staffName.split(' ');
            if (first)
              addNurse({ firstName: first, lastName: last.join(' '), role: 'RN', status: 'active' });
            setStaffName('');
          }}
        >
          Add Staff
        </button>
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
