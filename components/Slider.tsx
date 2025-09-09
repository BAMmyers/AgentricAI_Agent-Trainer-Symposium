import React from 'react';
import { InformationCircleIcon } from './icons/Icons';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  tooltip: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, tooltip }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
          {label}
          <div className="relative group">
            <InformationCircleIcon className="w-4 h-4 text-text-secondary" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-overlay border border-secondary rounded-lg text-xs text-text-secondary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {tooltip}
            </div>
          </div>
        </label>
        <span className="text-sm font-semibold text-highlight w-12 text-right">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-overlay rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      {/* Some basic styling for the slider thumb */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #e94560; /* primary color */
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #e94560; /* primary color */
          cursor: pointer;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default Slider;
