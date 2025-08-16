import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Nurse } from '../types';

const MS = 60 * 1000;

export interface Buckets {
  incoming: Nurse[];
  offgoing: Nurse[];
}

export function useScheduleBuckets(): Buckets {
  const nurses = useStore((s) => Object.values(s.nurses));

  const compute = () => {
    const now = Date.now();
    const incoming = nurses.filter(
      (n) =>
        n.status === 'off' &&
        n.shiftStart &&
        new Date(n.shiftStart).getTime() > now &&
        new Date(n.shiftStart).getTime() - now <= 120 * MS
    );
    const offgoing = nurses.filter(
      (n) =>
        n.status === 'active' &&
        (n.shiftEnd || n.offAt) &&
        (() => {
          const end = new Date(n.shiftEnd || n.offAt!).getTime();
          return end > now && end - now <= 60 * MS;
        })()
    );
    return { incoming, offgoing };
  };

  const [buckets, setBuckets] = useState<Buckets>(compute);

  useEffect(() => {
    const id = setInterval(() => setBuckets(compute()), 30000);
    return () => clearInterval(id);
  }, [nurses]);

  return buckets;
}
