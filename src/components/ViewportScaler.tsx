import React, { useEffect, useState } from 'react';

interface Props {
  width: number;
  height: number;
  children: React.ReactNode;
}

const ViewportScaler: React.FC<Props> = ({ width, height, children }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth / width;
      const h = window.innerHeight / height;
      setScale(Math.min(w, h));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [width, height]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ViewportScaler;
