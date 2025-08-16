import { useEffect } from 'react';
import { useStore } from '../store';
import { WeatherState } from '../types';
import { codeToCondition } from '../lib/weather';

export function useWeather(): WeatherState {
  const settings = useStore((s) => s.settings);
  const weather = useStore((s) => s.weather);
  const setWeather = useStore((s) => s.setWeather);

  useEffect(() => {
    if (!settings.weatherEnabled) return;

    let cancelled = false;

    const fetchWeather = () => {
      if (settings.weatherProvider === 'open-meteo') {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${settings.weatherLat}&longitude=${settings.weatherLon}` +
          '&current=temperature_2m,weather_code' +
          '&daily=temperature_2m_max,temperature_2m_min' +
          '&timezone=America%2FKentucky%2FLouisville&units=us';
        fetch(url)
          .then((r) => r.json())
          .then((data) => {
            if (cancelled) return;
            const w: WeatherState = {
              location:
                settings.weatherLocationLabel || 'Jewish Hospital, Louisville',
              tempF: data.current?.temperature_2m,
              tempC:
                data.current?.temperature_2m !== undefined
                  ? ((data.current.temperature_2m - 32) * 5) / 9
                  : undefined,
              condition: codeToCondition(data.current?.weather_code),
              highF: data.daily?.temperature_2m_max?.[0],
              lowF: data.daily?.temperature_2m_min?.[0],
              updatedAt: new Date().toISOString(),
            };
            setWeather(w);
          })
          .catch((err) => console.warn('[Weather]', err));
      } else if (
        settings.weatherProvider === 'custom' &&
        settings.weatherEndpoint
      ) {
        fetch(settings.weatherEndpoint)
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled) setWeather(data);
          })
          .catch((err) => console.warn('[Weather]', err));
      }
    };

    fetchWeather();
    const id = setInterval(
      fetchWeather,
      (settings.weatherRefreshMinutes ?? 10) * 60 * 1000
    );
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [
    settings.weatherEnabled,
    settings.weatherProvider,
    settings.weatherLat,
    settings.weatherLon,
    settings.weatherLocationLabel,
    settings.weatherRefreshMinutes,
    settings.weatherEndpoint,
    setWeather,
  ]);

  return weather;
}

