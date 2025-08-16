import React from 'react';
import { useStore } from '../store';

const NurseMenu: React.FC = () => {
  const ctx = useStore((s) => s.ui.contextMenu);
  const setUi = useStore((s) => s.setUi);
  const nurse = useStore((s) => (ctx?.nurseId ? s.nurses[ctx.nurseId] : undefined));

  const markOff = useStore((s) => s.markOffAction);
  const setRf = useStore((s) => s.setRfAction);
  const setStudentTag = useStore((s) => s.setStudentTagAction);
  const setShiftEnd = useStore((s) => s.setShiftEndAction);
  const setBreak = useStore((s) => s.setBreakAction);
  const updateNurse = useStore((s) => s.updateNurse);
  const allNurses = useStore((s) => s.nurses);

  if (!ctx || !nurse) return null;

  const style: React.CSSProperties = ctx.anchor
    ? {
        position: 'fixed',
        top: ctx.anchor.bottom,
        left: ctx.anchor.left,
        zIndex: 200,
        background: 'var(--panel)',
        padding: 8,
        borderRadius: 8,
      }
    : {};

  const close = () => setUi({ contextMenu: null });

  const changeHospitalId = () => {
    const current = nurse.hospitalId || '';
    const val = window.prompt('Enter Hospital ID (digits only, 4–10). Leave blank to clear.', current);
    if (val === null) return; // canceled
    const trimmed = val.trim();

    // Allow clearing
    if (trimmed === '') {
      updateNurse(nurse.id, { hospitalId: undefined });
      close();
      return;
    }

    // Validate digits and length
    const ok = /^\d{4,10}$/.test(trimmed);
    if (!ok) {
      alert('Hospital ID must be 4–10 digits.');
      return;
    }

    // Uniqueness check
    const duplicate = Object.values(allNurses).find(
      (n) => n.id !== nurse.id && n.hospitalId === trimmed
    );
    if (duplicate) {
      alert('Hospital ID already in use by another nurse.');
      return;
    }

    updateNurse(nurse.id, { hospitalId: trimmed });
    close();
  };

  const toggleBreak = () => {
    const on = !(nurse.notes || '').includes('[BREAK]');
    let coverId: string | undefined;

    if (on) {
      // Optional: choose covering nurse by Hospital ID or RF
      const entry = window.prompt(
        'Enter covering nurse Hospital ID or RF (optional). Leave blank for none.',
        ''
      );
      if (entry && entry.trim()) {
        const key = entry.trim();
        const found = Object.values(allNurses).find(
          (n) => n.hospitalId === key || n.rfNumber === key
        );
        coverId = found?.id;
        if (key && !coverId) {
          alert('No nurse found with that Hospital ID or RF. Continuing without a cover.');
        }
      }
    }

    setBreak(nurse.id, on, coverId);
    close();
  };

  return (
    <div style={style} className="nurse-menu">
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {nurse.firstName} {nurse.lastName}
      </div>
      <div className="menu-header" style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
        <div>Hospital ID: {nurse.hospitalId || '—'}</div>
        <div>RF: {nurse.rfNumber || '—'}</div>
      </div>

      <button
        onClick={() => {
          const tag = window.prompt('Student tag', nurse.studentTag || '') || null;
          setStudentTag(nurse.id, tag);
          close();
        }}
      >
        Assign Student Tag…
      </button>

      <button
        onClick={() => {
          const iso = window.prompt('Shift end (ISO)', nurse.shiftEnd || '') || null;
          setShiftEnd(nurse.id, iso);
          close();
        }}
      >
        Modify Shift End…
      </button>

      <button
        onClick={() => {
          markOff(nurse.id);
          close();
        }}
      >
        DTO (Mark Off)
      </button>

      <button
        onClick={() => {
          const note = window.prompt('Comment', nurse.notes || '') || '';
          updateNurse(nurse.id, { notes: note });
          close();
        }}
      >
        Add/Edit Comment…
      </button>

      <button onClick={toggleBreak}>
        {(nurse.notes || '').includes('[BREAK]') ? 'Break Off' : 'Break On (set cover…)'}
      </button>

      <button
        onClick={() => {
          const rf = window.prompt('RF Number', nurse.rfNumber || '') || '';
          setRf(nurse.id, rf);
          close();
        }}
      >
        Change RF…
      </button>

      <button onClick={changeHospitalId}>Change Hospital ID…</button>

      <button onClick={close}>Close</button>
    </div>
  );
};

export default NurseMenu;

