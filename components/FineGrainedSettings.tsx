import React from 'react';
import { CogIcon } from './icons/Icons';
import Slider from './Slider';
import { FineGrainedSettingsConfig, FineGrainedSetting } from '../types';

interface FineGrainedSettingsProps {
    settings: FineGrainedSettingsConfig;
    onSettingChange: (setting: FineGrainedSetting, value: number) => void;
}

const FineGrainedSettings: React.FC<FineGrainedSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="p-2 bg-overlay/50 rounded-lg">
      <h3 className="font-semibold text-highlight flex items-center gap-2 mb-3">
        <CogIcon />
        Fine-Grained Controls
      </h3>
      <div className="space-y-4 p-2">
        <Slider
          label="Model Temperature"
          value={settings.temperature}
          min={0} max={1} step={0.1}
          onChange={(v) => onSettingChange('temperature', v)}
          tooltip="Controls creativity. Higher values (e.g., 0.8) make output more random, while lower values (e.g., 0.2) make it more deterministic."
        />
        <Slider
          label="Top-P"
          value={settings.topP}
          min={0} max={1} step={0.05}
          onChange={(v) => onSettingChange('topP', v)}
          tooltip="Controls response diversity via nucleus sampling. A smaller value (e.g., 0.8) considers a smaller set of top probability tokens."
        />
        <Slider
          label="Top-K"
          value={settings.topK}
          min={1} max={100} step={1}
          onChange={(v) => onSettingChange('topK', v)}
          tooltip="Limits the sampling pool for the next token to the K most likely tokens. A value of 1 is always the most likely token."
        />
        <Slider
          label="Native Memory Threshold"
          value={settings.nativeMemoryThreshold}
          min={0} max={1} step={0.05}
          onChange={(v) => onSettingChange('nativeMemoryThreshold', v)}
          tooltip="Controls how closely a prompt must match a memory to trigger a native (offline) response. Higher is stricter."
        />
      </div>
    </div>
  );
};

export default FineGrainedSettings;
