import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Nurse, Role, EmploymentType } from '../types';

const roles: Role[] = ['RN','Charge RN','Tech','MD','APP','RT','Rad','Transport','Scribe','Other'];
const employmentTypes: EmploymentType[] = ['home', 'float', 'travel', 'other'];

const Settings: React.FC = () => {
  const nurses = useStore((s) => Object.values(s.nurses));
  const zones = useStore((s) => s.zones);
  const addZone = useStore((s) => s.addZone);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const add = useStore((s) => s.addNurse);
  const update = useStore((s) => s.updateNurse);
  const remove = useStore((s) => s.removeNurse);

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [role, setRole] = useState<Role>('RN');
  const [rf, setRf] = useState('');
  const [employment, setEmployment] = useState<EmploymentType>('home');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState('');

  const [weatherDraft, setWeatherDraft] = useState({
    enabled: settings.weatherEnabled,
    provider: settings.weatherProvider || 'open-meteo',
    label: settings.weatherLocationLabel || 'Jewish Hospital, Louisville',
    lat: settings.weatherLat ?? 38.2473,
    lon: settings.weatherLon ?? -85.7579,
    refresh: settings.weatherRefreshMinutes ?? 10,
    unit: settings.weatherUnit || 'F',
    endpoint: settings.weatherEndpoint || '',
  });
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const filtered = query
    ? nurses.filter((n) =>
        [n.firstName, n.lastName, n.rfNumber, n.role, n.employmentType].some((f) =>
          f?.toLowerCase().includes(query.toLowerCase())
        )
      )
    : nurses;

  const selected = selectedId ? nurses.find((n) => n.id === selectedId) : null;

  useEffect(() => {
    if (query && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [query, filtered]);

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const arr: Partial<Nurse>[] = JSON.parse(txt);
        arr.forEach((n) =>
          add({
            id: n.id,
            firstName: n.firstName || 'First',
            lastName: n.lastName || 'Last',
            role: (n.role as Role) || 'RN',
            rfNumber: n.rfNumber,
            notes: n.notes,
            status: 'active',
          })
        );
      } catch (err) {
        console.error('import failed', err);
      }
    });
  };

  const onExport = () => {
    const data = JSON.stringify(nurses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'staff.json';
    a.click();
  };

  const addNurse = () => {
    add({ firstName: first, lastName: last, role, rfNumber: rf, status: 'active', employmentType: employment });
    setFirst('');
    setLast('');
    setRf('');
    setEmployment('home');
  };

  return (
    <div className="settings-page">
      <section className="settings-section">
        <h2>Staff Manager</h2>
        <div className="staff-manager">
        <div className="staff-list">
          <div className="staff-actions">
            <input
              className="staff-search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onExport}>Export</button>
            <input type="file" accept="application/json" onChange={onImport} />
          </div>
          <table className="staff-table">
            <thead>
              <tr>
                <th>First</th>
                <th>Last</th>
                <th>Role</th>
                <th>RF #</th>
                <th>Employment Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr
                  key={n.id}
                  className={selectedId === n.id ? 'selected' : ''}
                  onClick={() => setSelectedId(n.id)}
                >
                  <td>
                    <input value={n.firstName} onChange={(e) => update(n.id, { firstName: e.target.value })} />
                  </td>
                  <td>
                    <input value={n.lastName} onChange={(e) => update(n.id, { lastName: e.target.value })} />
                  </td>
                  <td>
                    <select value={n.role} onChange={(e) => update(n.id, { role: e.target.value as Role })}>
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input value={n.rfNumber || ''} onChange={(e) => update(n.id, { rfNumber: e.target.value })} />
                  </td>
                  <td>
                    <select
                      value={n.employmentType || 'home'}
                      onChange={(e) => update(n.id, { employmentType: e.target.value as EmploymentType })}
                    >
                      {employmentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => remove(n.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!query && (
                <tr>
                  <td>
                    <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First" />
                  </td>
                  <td>
                    <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last" />
                  </td>
                  <td>
                    <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input value={rf} onChange={(e) => setRf(e.target.value)} placeholder="RF" />
                  </td>
                  <td>
                    <select value={employment} onChange={(e) => setEmployment(e.target.value as EmploymentType)}>
                      {employmentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={addNurse}>Add</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="staff-details">
            <h3>
              {selected.firstName} {selected.lastName}
            </h3>
            <p>
              <strong>Role:</strong> {selected.role}
            </p>
            <p>
              <strong>RF #:</strong> {selected.rfNumber || '—'}
            </p>
            <p>
              <strong>Employment:</strong> {selected.employmentType || 'home'}
            </p>
            {selected.notes && (
              <p>
                <strong>Notes:</strong> {selected.notes}
              </p>
            )}
          </div>
        )}
        </div>
      </section>

      <section className="settings-section">
        <h2>Zones</h2>
        <ul className="zones-list">
          {zones.map((z) => (
            <li key={z.id}>{z.name}</li>
          ))}
        </ul>
        <div className="zones-actions">
          <input
            value={zoneName}
            placeholder="Zone name"
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
        </div>
      </section>

      <section className="settings-section">
        <h2>Weather</h2>
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
        <div className="weather-grid">
          <div>
            Provider:
            <label>
              <input
                type="radio"
                value="open-meteo"
                checked={weatherDraft.provider === 'open-meteo'}
                onChange={(e) =>
                  setWeatherDraft({
                    ...weatherDraft,
                    provider: e.target.value as 'open-meteo' | 'custom',
                  })
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
                  setWeatherDraft({
                    ...weatherDraft,
                    provider: e.target.value as 'open-meteo' | 'custom',
                  })
                }
              />{' '}
              Custom JSON URL
            </label>
          </div>
          <div>
            Units:
            <label>
              <input
                type="radio"
                value="F"
                checked={weatherDraft.unit === 'F'}
                onChange={(e) =>
                  setWeatherDraft({ ...weatherDraft, unit: e.target.value as 'F' | 'C' })
                }
              />{' '}
              Fahrenheit
            </label>
            <label>
              <input
                type="radio"
                value="C"
                checked={weatherDraft.unit === 'C'}
                onChange={(e) =>
                  setWeatherDraft({ ...weatherDraft, unit: e.target.value as 'F' | 'C' })
                }
              />{' '}
              Celsius
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
        </div>
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
              weatherUnit: weatherDraft.unit as 'F' | 'C',
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
    </div>
  );
};

export default Settings;
