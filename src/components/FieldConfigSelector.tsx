import { FIELD_CONFIGS } from '../types/field';
import type { FieldConfigSelectorProps } from './types';
import './FieldConfigSelector.css';

const FieldConfigSelector = ({ currentConfig, onConfigChange }: FieldConfigSelectorProps) => {
  return (
    <select
      value={currentConfig.id}
      onChange={(e) => onConfigChange(FIELD_CONFIGS[e.target.value])}
      className="field-config-select"
    >
      {Object.values(FIELD_CONFIGS).map((config) => (
        <option key={config.id} value={config.id}>
          {config.name}
        </option>
      ))}
    </select>
  );
};

export default FieldConfigSelector; 