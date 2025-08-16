import { WeatherState } from '../types';

export type TempUnit = 'F' | 'C';

/** Map Open-Meteo weather codes to coarse conditions */
export function codeToCondition(code: number): WeatherState['condition'] {
  if ([0].includes(code)) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Clouds';
  if ([45, 48].includes(code)) return 'Fog';
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  )
    return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Wind';
  return 'Unknown';
}

export function conditionIcon(c: WeatherState['condition']): string {
  switch (c) {
    case 'Clear':
      return '☀️';
    case 'Clouds':
      return '☁️';
    case 'Rain':
      return '🌧️';
    case 'Snow':
      return '❄️';
    case 'Fog':
      return '🌫️';
    case 'Wind':
      return '💨';
    default:
      return '❔';
  }
}

export function convertTemp(tempF: number | undefined, unit: TempUnit): number | undefined {
  if (tempF === undefined) return undefined;
  return unit === 'F' ? tempF : ((tempF - 32) * 5) / 9;
}

export function formatTemp(tempF: number | undefined, unit: TempUnit): string {
  const t = convertTemp(tempF, unit);
  if (t === undefined) return '';
  return `${Math.round(t)}°${unit}`;
}

