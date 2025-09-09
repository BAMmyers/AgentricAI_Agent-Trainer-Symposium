

import React from 'react';
import { BrainIcon, CubeTransparentIcon, ExclamationTriangleIcon } from './icons/Icons';
import { useWorkspaceStore } from '../store/workspaceStore';

type NeuralPathway = 'API' | 'Native';

interface NeuralPathwayToggleProps {}

const PathwayButton: React.FC<{
    label: NeuralPathway;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    tooltip: string;
    disabled?: boolean;
}> = ({ label, icon, isActive, onClick, tooltip, disabled }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive 
                ? 'bg-primary text-white' 
                : 'text-text-secondary bg-surface hover:bg-overlay hover:text-text-primary'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </button>
        <div className="absolute top-full right-0 mt-2 w-64 p-2 bg-overlay border border-secondary rounded-lg text-xs text-text-secondary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
            {tooltip}
        </div>
    </div>
);

const NeuralPathwayToggle: React.FC<NeuralPathwayToggleProps> = () => {
    // FIX: Correctly destructure property names from the store. The store uses 'neuralPathway' and 'setNeuralPathway'.
    const { neuralPathway, setNeuralPathway, apiAvailable, apiUnavailableReason } = useWorkspaceStore();

    const apiTooltip = apiAvailable
        ? "Train and enhance the agent. It will use the Gemini API for complex reasoning and learning new concepts, which are then saved to its knowledge base."
        : `API Unavailable: ${apiUnavailableReason}`;

    const fallbackActive = !apiAvailable && neuralPathway === 'Native';

    return (
        <div className="flex items-center gap-2 p-1 bg-surface rounded-lg border border-overlay">
            {fallbackActive && (
                <div className="relative group ml-1">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                    <div className="absolute top-full right-0 mt-2 w-64 p-2 bg-overlay border border-yellow-400 rounded-lg text-xs text-yellow-300 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                       Fell back to Native mode. {apiUnavailableReason}
                    </div>
                </div>
            )}
            <PathwayButton
                label="Native"
                icon={<BrainIcon className="w-4 h-4" />}
                isActive={neuralPathway === 'Native'}
                onClick={() => setNeuralPathway('Native')}
                tooltip="Test the agent's standalone intelligence. It will only use its internal logic and local LLM. No API calls will be made."
            />
            <PathwayButton
                label="API"
                icon={<CubeTransparentIcon className="w-4 h-4" />}
                isActive={neuralPathway === 'API'}
                onClick={() => setNeuralPathway('API')}
                tooltip={apiTooltip}
                disabled={!apiAvailable}
            />
        </div>
    );
};

export default NeuralPathwayToggle;
