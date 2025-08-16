import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ZoneColumn from './ZoneColumn';
import { useStore } from '../store';

const Board: React.FC = () => {
  const zones = useStore((s) => [...s.zones].sort((a, b) => a.order - b.order));
  const moveNurse = useStore((s) => s.moveNurse);
  const setUi = useStore((s) => s.setUi);

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
      onDragStart={({ active }) => setUi({ draggingNurseId: active.id as string })}
      onDragOver={({ over }) =>
        setUi({ dragTargetZoneId: over?.data.current?.zoneId ?? null })
      }
      onDragEnd={({ active, over }) => {
        try {
          setUi({ draggingNurseId: null, dragTargetZoneId: null });
          if (!over) return;
          const toZone = over.data.current?.zoneId;
          const index = over.data.current?.index;
          if (!toZone) {
            console.warn('Invalid drop', { over });
            return;
          }
          moveNurse(active.id as string, toZone, index);
        } catch (e) {
          console.error('[StaffBoard]', { phase: 'dragDrop', error: e });
        }
      }}
      onDragCancel={() => setUi({ draggingNurseId: null, dragTargetZoneId: null })}
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
