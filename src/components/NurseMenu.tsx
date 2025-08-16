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

  if (!ctx || !nurse) return null;
  const style: React.CSSProperties = ctx.anchor
    ? { position: 'fixed', top: ctx.anchor.bottom, left: ctx.anchor.left, zIndex: 200, background: 'var(--panel)', padding: 8, borderRadius: 8 }
    : {};

  const close = () => setUi({ contextMenu: null });

  return (
    <div style={style} className="nurse-menu">
      <div>{nurse.firstName} {nurse.lastName}</div>
      <button onClick={() => { const tag = prompt('Student tag', nurse.studentTag || '') || null; setStudentTag(nurse.id, tag); close(); }}>Student Tag</button>
      <button onClick={() => { const iso = prompt('Shift end ISO', nurse.shiftEnd || '') || null; setShiftEnd(nurse.id, iso); close(); }}>Set Shift End</button>
      <button onClick={() => { markOff(nurse.id); close(); }}>DTO</button>
      <button onClick={() => { const note = prompt('Comment', nurse.notes || '') || ''; useStore.getState().updateNurse(nurse.id, { notes: note }); close(); }}>Comment</button>
      <button onClick={() => { const on = !(nurse.notes||'').includes('[BREAK]'); setBreak(nurse.id, on); close(); }}>{(nurse.notes||'').includes('[BREAK]') ? 'Break Off' : 'Break On'}</button>
      <button onClick={() => { const rf = prompt('RF Number', nurse.rfNumber || '') || ''; setRf(nurse.id, rf); close(); }}>Change RF</button>
      <button onClick={close}>Close</button>
    </div>
  );
};

export default NurseMenu;
