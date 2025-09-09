import React from 'react';
import { SpeakerWaveIcon, EyeIcon } from './icons/Icons';

interface ToggleSwitchProps {
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, icon, enabled, onChange }) => (
  <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
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
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`block w-10 h-6 rounded-full ${enabled ? 'bg-primary' : 'bg-overlay'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'transform translate-x-4' : ''}`}></div>
    </div>
  </label>
);


interface EnhancementsPanelProps {
    isVoiceEnabled: boolean;
    isAvatarAnimated: boolean;
    onVoiceToggle: (enabled: boolean) => void;
    onAnimationToggle: (enabled: boolean) => void;
}

const EnhancementsPanel: React.FC<EnhancementsPanelProps> = ({
    isVoiceEnabled,
    isAvatarAnimated,
    onVoiceToggle,
    onAnimationToggle,
}) => {
  return (
    <div className="mt-4 p-4 bg-overlay rounded-lg space-y-4 animate-fadeIn">
        <ToggleSwitch
            label="Voice Synthesis"
            icon={<SpeakerWaveIcon />}
            enabled={isVoiceEnabled}
            onChange={onVoiceToggle}
        />
        <ToggleSwitch
            label="Animated Avatar"
            icon={<EyeIcon />}
            enabled={isAvatarAnimated}
            onChange={onAnimationToggle}
        />
    </div>
  );
};

export default EnhancementsPanel;
