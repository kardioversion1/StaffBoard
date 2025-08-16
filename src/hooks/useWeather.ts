import { useEffect } from 'react';
import { useStore } from '../store';
import { WeatherState } from '../types';

export function useWeather(): WeatherState {
  const settings = useStore((s) => s.settings);
  const weather = useStore((s) => s.weather);
  const setWeather = useStore((s) => s.setWeather);

  useEffect(() => {
    if (!settings.weatherEnabled || !settings.weatherEndpoint) return;
    let cancelled = false;
    const fetchWeather = () => {
      fetch(settings.weatherEndpoint!)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setWeather(data);
        })
        .catch(() => {});
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [settings.weatherEnabled, settings.weatherEndpoint, setWeather]);

  return weather;
}
