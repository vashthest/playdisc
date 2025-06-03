import type { ConfirmDialogProps } from './types';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2 className="dialog-title">{title}</h2>
        <p className="dialog-message">{message}</p>
        <div className="dialog-buttons">
          <button
            onClick={onCancel}
            className="dialog-button dialog-button-cancel"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`dialog-button ${isDangerous ? 'dialog-button-danger' : 'dialog-button-confirm'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 