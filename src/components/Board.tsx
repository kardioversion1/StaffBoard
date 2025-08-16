import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ZoneColumn from './ZoneColumn';
import { useStore } from '../store';

const Board: React.FC = () => {
  const zones = useStore((s) => [...s.zones].sort((a, b) => a.order - b.order));
  const moveNurse = useStore((s) => s.moveNurse);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over) return;
        const toZone = over.data.current?.zoneId;
        const index = over.data.current?.index;
        if (toZone) moveNurse(active.id as string, toZone, index);
      }}
    >
      <div className="board">
        {zones.map((z) => (
          <ZoneColumn key={z.id} zone={z} />
        ))}
      </div>
    </DndContext>
  );
};

export default Board;
