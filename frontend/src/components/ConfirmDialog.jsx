import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export default function ConfirmDialog({ title, children, pending, error, onClose, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return <dialog className="modal" ref={ref} aria-labelledby="confirm-title" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}>
    <div className="modal-header"><h2 id="confirm-title">{title}</h2><button className="button button-icon" disabled={pending} aria-label="Close confirmation" onClick={onClose}><Icon name="close" /></button></div>
    <div className="modal-body">{children}{error && <p className="error-banner" role="alert">{error.message}</p>}</div>
    <div className="modal-footer"><button className="button button-secondary" autoFocus disabled={pending} onClick={onClose}>Keep record</button><button className="button button-danger" disabled={pending} onClick={onConfirm}>{pending ? 'Deleting…' : 'Delete record'}</button></div>
  </dialog>;
}
