import React from 'react';
import { useScheduleBuckets } from '../../hooks/useScheduleBuckets';
import { displayName } from '../../utils/name';

const CardOffgoing: React.FC = () => {
  const { offgoing } = useScheduleBuckets();
  return (
    <div className="rail-card offgoing">
      <h3>Off-going Staff</h3>
      {offgoing.length === 0 ? (
        <div className="empty">None</div>
      ) : (
        <ul>
          {offgoing.map((n) => (
            <li key={n.id}>
              {displayName(n)} – {n.role}{' '}
              {n.rfNumber && `RF ${n.rfNumber}`} (off at{' '}
              {new Date((n.shiftEnd || n.offAt)!).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              )
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CardOffgoing;
