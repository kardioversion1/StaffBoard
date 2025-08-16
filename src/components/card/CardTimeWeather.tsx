import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { useWeather } from '../../hooks/useWeather';
import { conditionIcon, formatTemp } from '../../lib/weather';

const pad = (n: number) => n.toString().padStart(2, '0');

const CardTimeWeather: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
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

  const updated = weather.updatedAt ? new Date(weather.updatedAt) : null;
  const stale = updated ? Date.now() - updated.getTime() > 60 * 60 * 1000 : false;
  const updatedStr = updated
    ? updated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="rail-card time-weather">
      <div className="clock">{timeStr}</div>
      <div className="date">{dateStr}</div>
      {settings.weatherEnabled ? (
        weather && weather.tempF !== undefined ? (
          <div className="weather">
            <div className="loc">{weather.location}</div>
            <div className="current">
              <span className="icon">{conditionIcon(weather.condition)}</span>
              <span className="temp">{formatTemp(weather.tempF, settings.weatherUnit || 'F')}</span>
              <span className="cond">{weather.condition}</span>
            </div>
            {weather.highF !== undefined && weather.lowF !== undefined && (
              <div className="range">
                H {formatTemp(weather.highF, settings.weatherUnit || 'F')} / L {formatTemp(weather.lowF, settings.weatherUnit || 'F')}
              </div>
            )}
            {updatedStr && (
              <div className="updated">
                Updated {updatedStr} {stale && <span className="stale">(stale)</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="weather-placeholder">No weather data yet</div>
        )
      ) : (
        <div className="weather-placeholder">
          Weather disabled –{' '}
          <button onClick={() => updateSettings({ weatherEnabled: true })}>
            Enable Weather
          </button>
        </div>
      )}
    </div>
  );
};

export default CardTimeWeather;
