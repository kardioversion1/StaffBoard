import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Nurse } from '../types';
import { displayName } from '../utils/name';
import { offAtLabel, shouldShowOffAt } from '../utils/time';
import { useStore } from '../store';

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

  const saveRf = () => {
    updateNurse(nurse.id, { rfNumber: rfValue });
    setEditingRF(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nurse-card ${isDragging ? 'dragging' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        useStore.getState().setUi({ contextMenu: { nurseId: nurse.id, anchor: e.currentTarget.getBoundingClientRect() } });
      }}
      onClick={(e) => {
        if (e.altKey) return; // allow alt+click for other features
        useStore.getState().setUi({ contextMenu: { nurseId: nurse.id, anchor: e.currentTarget.getBoundingClientRect() } });
      }}
      {...attributes}
      {...listeners}
    >
      <div className="nurse-name">
        <span className="employment-icon" title={nurse.employmentType || 'home'}>
          {nurse.employmentType === 'float'
            ? '↔️'
            : nurse.employmentType === 'travel'
            ? '✈️'
            : nurse.employmentType === 'other'
            ? '•'
            : '🏠'}
        </span>
        {displayName(nurse, privacy)}
        <span className="badges">
          {(nurse.notes || '').includes('[BREAK') && (
            <span className="badge badge--break" title="On break">☕</span>
          )}
          {nurse.studentTag && (
            <span className="badge badge--student" title={`Student ${nurse.studentTag}`}>
              🎓
            </span>
          )}
          {nurse.status === 'off' && (
            <span className="badge badge--dto" title="DTO'd">⛔</span>
          )}
        </span>
      </div>
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
        <button
          className="menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            useStore.getState().setUi({
              contextMenu: {
                nurseId: nurse.id,
                anchor: e.currentTarget.getBoundingClientRect(),
              },
            });
          }}
        >
          ⋮
        </button>
      </div>
    </div>
  );
};

export default NurseCard;
