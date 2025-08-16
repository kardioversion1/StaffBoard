import React from 'react';
import ReactDOM from 'react-dom';

interface Props {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ onClose, title, children }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        {title && <h2>{title}</h2>}
        <div className="modal-body">{children}</div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
