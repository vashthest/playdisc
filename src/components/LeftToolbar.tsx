import type { LeftToolbarProps } from './types';
import './LeftToolbar.css';

const LeftToolbar = ({ onAddObject }: LeftToolbarProps) => {
  const tools = [
    { type: 'O' as const, label: 'Offense', color: '#3182CE' },
    { type: 'X' as const, label: 'Defense', color: '#E53E3E' },
    { type: 'D' as const, label: 'Disc', color: '#FFFFFF' },
    { type: 'C' as const, label: 'Cone', color: '#ED8936' },
  ];

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.type}
          className="toolbar-button"
          onClick={() => onAddObject(tool.type)}
          title={tool.label}
        >
          <div
            className="toolbar-token"
            style={{ backgroundColor: tool.color }}
          >
            {tool.type !== 'D' && tool.type !== 'C' && (
              <span 
                className="toolbar-token-label" 
                style={{ color: tool.color === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
              >
                {tool.type}
              </span>
            )}
          </div>
          <div className="toolbar-tooltip">
            {tool.label}
          </div>
        </button>
      ))}
    </div>
  );
};

export default LeftToolbar; 