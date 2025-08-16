import React from 'react';
import { useScheduleBuckets } from '../../hooks/useScheduleBuckets';
import { displayName } from '../../utils/name';

const CardIncoming: React.FC = () => {
  const { incoming } = useScheduleBuckets();

  return (
    <div className="rail-card incoming">
      <h3>Incoming Staff</h3>
      {incoming.length === 0 ? (
        <div className="empty">None</div>
      ) : (
        <ul>
          {incoming.map((n) => (
            <li key={n.id}>
              {displayName(n)} – {n.role}{' '}
              {n.rfNumber && `RF ${n.rfNumber}`} (starts{' '}
              {n.shiftStart &&
                new Date(n.shiftStart).toLocaleTimeString([], {
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

export default CardIncoming;
