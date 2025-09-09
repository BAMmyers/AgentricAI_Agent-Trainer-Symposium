import React from 'react';
import { Mode } from '../types';
import { ChatAltIcon, CalculatorIcon, BeakerIcon, CodeIcon, SparklesIcon } from './icons/Icons';

interface ModeTabsProps {
  modes: Mode[];
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modeIcons: Record<Mode, React.ReactNode> = {
    chat: <ChatAltIcon />,
    logic: <BeakerIcon />,
    math: <CalculatorIcon />,
    code: <CodeIcon />,
    emotion: <SparklesIcon />,
};

const ModeTabs: React.FC<ModeTabsProps> = ({ modes, activeMode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2 border-b border-overlay p-2">
      {(modes || []).map(mode => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeMode === mode 
              ? 'bg-primary text-white' 
              : 'text-text-secondary hover:bg-overlay hover:text-text-primary'
          }`}
        >
          {modeIcons[mode]}
          <span className="capitalize">{mode}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeTabs;