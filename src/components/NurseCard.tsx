import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Nurse } from '../types';
import { displayName } from '../utils/name';
import { offAtLabel, shouldShowOffAt } from '../utils/time';
import { useStore } from '../store';
import NurseMenu from './NurseMenu';

interface Props {
  nurse: Nurse;
  zoneId: string;
  index: number;
}

const NurseCard: React.FC<Props> = ({ nurse, zoneId, index }) => {
  const updateNurse = useStore((s) => s.updateNurse);
  const privacy = useStore((s) => s.privacy.mainBoardNameFormat);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nurse.id,
    data: { zoneId, index },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editingRF, setEditingRF] = useState(false);
  const [rfValue, setRfValue] = useState(nurse.rfNumber || '');
  const [menuOpen, setMenuOpen] = useState(false);

  const saveRf = () => {
    updateNurse(nurse.id, { rfNumber: rfValue });
    setEditingRF(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nurse-card ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="nurse-name">{displayName(nurse, privacy)}</div>
      {shouldShowOffAt(nurse.offAt) && (
        <span className="off-tag">Off at {offAtLabel(nurse.offAt)}</span>
      )}
      <div className="rf-number">
        {editingRF ? (
          <input
            autoFocus
            value={rfValue}
            onChange={(e) => setRfValue(e.target.value)}
            onBlur={saveRf}
            onKeyDown={(e) => e.key === 'Enter' && saveRf()}
          />
        ) : (
          <span onClick={() => setEditingRF(true)}>{nurse.rfNumber || 'RF #'}</span>
        )}
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>
          ⋮
        </button>
      </div>
      {menuOpen && (
        <NurseMenu
          nurse={nurse}
          onClose={() => setMenuOpen(false)}
          onChangeHospitalId={(val) => {
            try {
              updateNurse(nurse.id, { hospitalId: val || undefined });
            } catch (err) {
              alert((err as Error).message);
            }
          }}
        />
      )}
    </div>
  );
};

export default NurseCard;
