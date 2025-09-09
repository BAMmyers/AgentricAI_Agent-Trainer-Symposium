
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  icon?: React.ReactNode;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, icon, enabled, onChange, disabled = false }) => (
  <label htmlFor={label} className={`flex items-center justify-between ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
    <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-text-primary">{label}</span>
    </div>
    <div className="relative">
      <input
        id={label}
        type="checkbox"
        className="sr-only"
        checked={enabled}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`block w-10 h-6 rounded-full ${enabled ? 'bg-primary' : 'bg-overlay'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'transform translate-x-4' : ''}`}></div>
    </div>
  </label>
);

export default ToggleSwitch;