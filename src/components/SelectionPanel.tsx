import type { ObjectToken } from '../types';
import './SelectionPanel.css';

interface SelectionPanelProps {
  selectedObjects: ObjectToken[];
  onNameChange: (objectId: string, newName: string) => void;
  onDelete: (objectIds: string[]) => void;
}

const SelectionPanel = ({ selectedObjects, onNameChange, onDelete }: SelectionPanelProps) => {
  if (selectedObjects.length === 0) return null;

  return (
    <div className="selection-panel">
      <div className="selection-panel-header">
        <h2 className="selection-panel-title">
          {selectedObjects.length === 1 ? 'Selected Object' : `${selectedObjects.length} Objects Selected`}
        </h2>
      </div>
      
      <div className="selection-panel-content">
        {selectedObjects.length === 1 ? (
          // Single object selected - show name editor
          <div className="selection-panel-item">
            <label className="selection-panel-label">Name:</label>
            <input
              type="text"
              value={selectedObjects[0].label}
              onChange={(e) => {
                const newValue = e.target.value.toUpperCase();
                if (newValue.length <= 2) { // Restrict to 2 characters
                  onNameChange(selectedObjects[0].id, newValue);
                }
              }}
              className="selection-panel-input"
              maxLength={2}
            />
          </div>
        ) : (
          // Multiple objects selected - show count
          <div className="selection-panel-item">
            <p className="selection-panel-text">
              {selectedObjects.length} objects selected
            </p>
          </div>
        )}

        <button
          className="selection-panel-delete"
          onClick={() => onDelete(selectedObjects.map(obj => obj.id))}
        >
          Delete {selectedObjects.length === 1 ? 'Object' : 'Objects'}
        </button>
      </div>
    </div>
  );
};

export default SelectionPanel; 