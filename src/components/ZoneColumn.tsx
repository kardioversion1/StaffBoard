import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Zone } from '../types';
import { useStore } from '../store';
import NurseCard from './NurseCard';

interface Props { zone: Zone }

const ZoneColumn: React.FC<Props> = ({ zone }) => {
  const { setNodeRef } = useDroppable({ id: zone.id, data: { zoneId: zone.id } });
  const nurses = useStore((s) => zone.nurseIds.map((id) => s.nurses[id]).filter(Boolean));
  const dragTarget = useStore((s) => s.ui.dragTargetZoneId);

  return (
    <div className={`zone ${dragTarget === zone.id ? 'zone--dropTarget' : ''}`} ref={setNodeRef}>
      <h3 className="zone-title">{zone.name}</h3>
      <SortableContext items={zone.nurseIds} strategy={verticalListSortingStrategy}>
        {nurses.map((nurse, index) => (
          <NurseCard key={nurse.id} nurse={nurse} index={index} zoneId={zone.id} />
        ))}
      </SortableContext>
    </div>
  );
};

export default ZoneColumn;
