import React from 'react';
import CardTimeWeather from './card/CardTimeWeather';
import CardIncoming from './card/CardIncoming';
import CardOffgoing from './card/CardOffgoing';
import CardAncillary from './card/CardAncillary';

const RightRail: React.FC = () => {
  return (
    <aside className="right-rail">
      <CardTimeWeather />
      <CardIncoming />
      <CardOffgoing />
      <CardAncillary />
    </aside>
  );
};

export default RightRail;
