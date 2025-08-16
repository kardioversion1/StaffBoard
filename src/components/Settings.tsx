import React, { useState } from 'react';
import Modal from './Modal';
import { useStore } from '../store';
import { displayName } from '../utils/name';

interface Props {
  onClose: () => void;
}

const Settings: React.FC<Props> = ({ onClose }) => {
  const nurses = useStore((s) => s.nurses);
  const zones = useStore((s) => s.zones);
  const addNurse = useStore((s) => s.addNurse);
  const addZone = useStore((s) => s.addZone);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const [staffName, setStaffName] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [weatherDraft, setWeatherDraft] = useState({
    enabled: settings.weatherEnabled,
    provider: settings.weatherProvider || 'open-meteo',
    label: settings.weatherLocationLabel || 'Jewish Hospital, Louisville',
    lat: settings.weatherLat ?? 38.2473,
    lon: settings.weatherLon ?? -85.7579,
    refresh: settings.weatherRefreshMinutes ?? 10,
    endpoint: settings.weatherEndpoint || '',
  });
  const [weatherError, setWeatherError] = useState<string | null>(null);

  return (
    <Modal onClose={onClose} title="Settings">
      <section>
        <h4>Staff</h4>
        <ul>
          {Object.values(nurses).map((n) => (
            <li key={n.id}>{displayName(n, 'full')}</li>
          ))}
        </ul>
        <input
          placeholder="Full name"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
        />
        <button
          onClick={() => {
            const [first, ...last] = staffName.split(' ');
            if (first)
              addNurse({ firstName: first, lastName: last.join(' '), role: 'RN', status: 'active' });
            setStaffName('');
          }}
        >
          Add Staff
        </button>
      </section>
      <section>
        <h4>Zones</h4>
        <ul>
          {zones.map((z) => (
            <li key={z.id}>{z.name}</li>
          ))}
        </ul>
        <input
          placeholder="Zone name"
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
        />
        <button
          onClick={() => {
            if (zoneName) addZone(zoneName);
            setZoneName('');
          }}
        >
          Add Zone
        </button>
      </section>
      <section>
        <h4>Weather</h4>
        <label>
          <input
            type="checkbox"
            checked={weatherDraft.enabled}
            onChange={(e) =>
              setWeatherDraft({ ...weatherDraft, enabled: e.target.checked })
            }
          />{' '}
          Enable Weather
        </label>
        <div>
          Provider:
          <label>
            <input
              type="radio"
              value="open-meteo"
              checked={weatherDraft.provider === 'open-meteo'}
              onChange={(e) =>
                setWeatherDraft({ ...weatherDraft, provider: e.target.value })
              }
            />{' '}
            Open-Meteo
          </label>
          <label>
            <input
              type="radio"
              value="custom"
              checked={weatherDraft.provider === 'custom'}
              onChange={(e) =>
                setWeatherDraft({ ...weatherDraft, provider: e.target.value })
              }
            />{' '}
            Custom JSON URL
          </label>
        </div>
        {weatherDraft.provider === 'custom' && (
          <input
            placeholder="Endpoint URL"
            value={weatherDraft.endpoint}
            onChange={(e) =>
              setWeatherDraft({ ...weatherDraft, endpoint: e.target.value })
            }
          />
        )}
        <input
          placeholder="Location Label"
          value={weatherDraft.label}
          onChange={(e) =>
            setWeatherDraft({ ...weatherDraft, label: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Latitude"
          value={weatherDraft.lat}
          onChange={(e) =>
            setWeatherDraft({ ...weatherDraft, lat: parseFloat(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Longitude"
          value={weatherDraft.lon}
          onChange={(e) =>
            setWeatherDraft({ ...weatherDraft, lon: parseFloat(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Refresh (min)"
          value={weatherDraft.refresh}
          onChange={(e) =>
            setWeatherDraft({
              ...weatherDraft,
              refresh: parseInt(e.target.value, 10),
            })
          }
        />
        {weatherError && <div className="error">{weatherError}</div>}
        <button
          onClick={() => {
            if (
              weatherDraft.lat < -90 ||
              weatherDraft.lat > 90 ||
              weatherDraft.lon < -180 ||
              weatherDraft.lon > 180 ||
              weatherDraft.refresh < 5 ||
              weatherDraft.refresh > 60
            ) {
              setWeatherError('Check latitude, longitude and refresh values');
              return;
            }
            setWeatherError(null);
            updateSettings({
              weatherEnabled: weatherDraft.enabled,
              weatherProvider: weatherDraft.provider as any,
              weatherLocationLabel: weatherDraft.label,
              weatherLat: weatherDraft.lat,
              weatherLon: weatherDraft.lon,
              weatherRefreshMinutes: weatherDraft.refresh,
              weatherEndpoint:
                weatherDraft.provider === 'custom'
                  ? weatherDraft.endpoint
                  : undefined,
            });
          }}
        >
          Save Weather
        </button>
      </section>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default Settings;
