import React from 'react';
import { Nurse } from '../types';

interface Props {
  nurse: Nurse;
  onClose: () => void;
  onChangeHospitalId: (val: string) => void;
}

const NurseMenu: React.FC<Props> = ({ nurse, onClose, onChangeHospitalId }) => {
  return (
    <div className="nurse-menu">
      <div className="menu-header">
        <div>Hospital ID: {nurse.hospitalId || '—'}</div>
        <div>RF: {nurse.rfNumber || '—'}</div>
      </div>
      <button
        onClick={() => {
          const val = window.prompt('Enter Hospital ID', nurse.hospitalId || '');
          if (val !== null) onChangeHospitalId(val.trim());
        }}
      >
        Change Hospital ID…
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NurseMenu;
