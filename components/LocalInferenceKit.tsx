
import React, { useState } from 'react';
import { WifiIcon, CogIcon, TrashIcon, DownloadIcon } from './icons/Icons';
import { OllamaModel } from '../types';

interface LocalInferenceKitProps {
    ollamaStatus: 'connected' | 'disconnected' | 'pending';
    ollamaUrl: string;
    ollamaError: string | null;
    ollamaModels: OllamaModel[];
    selectedOllamaModel: string;
    connectToOllama: () => Promise<void>;
    setOllamaUrl: (url: string) => void;
    setSelectedOllamaModel: (model: string) => void;
    isPullingModel: boolean;
    pullingModelStatus: string | null;
    pullOllamaModel: (modelName: string) => Promise<void>;
    deleteOllamaModel: (modelName: string) => Promise<void>;
}

const LocalInferenceKit: React.FC<LocalInferenceKitProps> = (props) => {
    const [modelToPull, setModelToPull] = useState('');

    const getStatusColor = () => {
        switch (props.ollamaStatus) {
            case 'connected': return 'text-green-500';
            case 'disconnected': return 'text-red-500';
            case 'pending': return 'text-yellow-500 animate-pulse';
        }
    };

    const handlePullModel = () => {
        if (modelToPull.trim()) {
            props.pullOllamaModel(modelToPull.trim());
            setModelToPull('');
        }
    };

    return (
        <div className="p-3 bg-overlay/50 rounded-lg animate-fadeIn space-y-3">
            <h3 className="font-semibold text-highlight flex items-center gap-2">
                <WifiIcon />
                Local LLM (Ollama)
            </h3>
            
            {/* Status & URL */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-text-secondary">Status: <span className={`capitalize font-semibold ${getStatusColor()}`}>{props.ollamaStatus}</span></p>
                </div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Ollama Server URL</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={props.ollamaUrl}
                        onChange={e => props.setOllamaUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="flex-grow bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
                        disabled={props.isPullingModel}
                    />
                    <button onClick={props.connectToOllama} disabled={props.ollamaStatus === 'pending' || props.isPullingModel} className="p-2 text-sm bg-secondary rounded-lg text-white hover:bg-opacity-80 disabled:opacity-50">
                        {props.ollamaStatus === 'pending' ? <CogIcon className="w-4 h-4 animate-spin"/> : 'Refresh'}
                    </button>
                </div>
                {props.ollamaError && <p className="text-xs text-red-400 mt-1">{props.ollamaError}</p>}
            </div>

            {/* Model Selection */}
            {props.ollamaStatus === 'connected' && (
                <div>
                     <label className="text-xs font-medium text-text-secondary block mb-1">Active Model</label>
                     <select
                        value={props.selectedOllamaModel}
                        onChange={e => props.setSelectedOllamaModel(e.target.value)}
                        className="w-full bg-overlay border border-secondary rounded-lg py-1.5 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        disabled={props.isPullingModel}
                     >
                        {props.ollamaModels.length === 0 ? (
                            <option>No models found on server</option>
                        ) : props.ollamaModels.map(m => (
                            <option key={m.model} value={m.model}>{m.name}</option>
                        ))}
                     </select>
                </div>
            )}
            
            {/* Model Management */}
            {props.ollamaStatus === 'connected' && (
                <div className="pt-3 border-t border-overlay/50">
                    <h4 className="text-sm font-semibold text-highlight mb-2">Model Management</h4>
                     <div className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={modelToPull}
                            onChange={e => setModelToPull(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePullModel()}
                            placeholder="e.g., llama3:latest"
                            className="flex-grow bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
                            disabled={props.isPullingModel}
                        />
                        <button onClick={handlePullModel} disabled={props.isPullingModel || !modelToPull.trim()} className="p-2 text-sm bg-secondary rounded-lg text-white hover:bg-opacity-80 disabled:opacity-50">
                           <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {props.isPullingModel && (
                        <div className="p-2 bg-overlay rounded-lg text-xs text-highlight animate-pulse">
                            <p>{props.pullingModelStatus || 'Starting...'}</p>
                        </div>
                    )}

                    <div className="space-y-1 mt-2 max-h-32 overflow-y-auto pr-1">
                        {props.ollamaModels.map(m => (
                            <div key={m.model} className="group flex items-center justify-between p-1.5 bg-overlay/50 rounded text-xs">
                                <span className="text-text-secondary">{m.name}</span>
                                <button onClick={() => props.deleteOllamaModel(m.model)} className="p-1 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" disabled={props.isPullingModel} title={`Delete ${m.name}`}>
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocalInferenceKit;