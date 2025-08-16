import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { useWeather } from '../../hooks/useWeather';

const pad = (n: number) => n.toString().padStart(2, '0');

const CardTimeWeather: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const weather = useWeather();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(
      () => setNow(new Date()),
      settings.showSeconds ? 1000 : 60000
    );
    return () => clearInterval(id);
  }, [settings.showSeconds]);

  const hours = settings.clock24h
    ? now.getHours()
    : (now.getHours() % 12) || 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timeStr = `${pad(hours)}:${pad(minutes)}${settings.showSeconds ? ':' + pad(seconds) : ''}`;
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rail-card time-weather">
      <div className="clock">{timeStr}</div>
      <div className="date">{dateStr}</div>
      {settings.weatherEnabled ? (
        weather && weather.tempF !== undefined ? (
          <div className="weather">
            <div className="loc">
              {settings.weatherLocationLabel || weather.location}
            </div>
            <div className="temp">{weather.tempF}&deg;F</div>
          </div>
        ) : (
          <div className="weather-placeholder">No weather source configured</div>
        )
      ) : (
        <div className="weather-placeholder">Weather disabled</div>
      )}
    </div>
  );
};

export default CardTimeWeather;
