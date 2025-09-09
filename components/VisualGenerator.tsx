import React, { useState, useEffect } from 'react';
import { Agent, AvatarBuildConfig } from '../types';
import { VideoCameraIcon, SparklesIcon } from './icons/Icons';
import { isApiConfigured } from '../services/geminiService';

const buildSteps = [
    { title: "Gender Presentation", key: 'genderPresentation' as keyof AvatarBuildConfig, options: ['Masculine', 'Feminine', 'Androgynous', 'Non-binary', 'No specific gender'] },
    { title: "Skin Tone", key: 'skinTone' as keyof AvatarBuildConfig, options: ['Pale Ivory', 'Warm Beige', 'Golden Tan', 'Olive', 'Rich Mahogany', 'Deep Ebony', 'Metallic Silver', 'Bioluminescent Blue'] },
    { title: "Body Type", key: 'bodyType' as keyof AvatarBuildConfig, options: ['Slender', 'Average', 'Athletic', 'Stocky', 'Curvy', 'Ethereal/Wispy', 'Cyborg-Enhanced'] },
    { title: "Age Appearance", key: 'ageRange' as keyof AvatarBuildConfig, options: ['Teenage (18-20)', 'Young Adult (20s)', 'Adult (30s-40s)', 'Middle-Aged (50s)', 'Ageless Android'] },
    { title: "Hair Style", key: 'hairStyle' as keyof AvatarBuildConfig, options: ['Short & Professional', 'Long & Flowing', 'Cybernetic Braids', 'Crystal-Infused', 'Holographic Projection', 'Bald & Polished'] },
    { title: "Facial Expression", key: 'facialExpression' as keyof AvatarBuildConfig, options: ['Neutral & Calm', 'Gentle Smile', 'Focused & Serious', 'Curious & Inquisitive', 'Friendly & Welcoming'] },
    { title: "Outfit Style", key: 'outfit' as keyof AvatarBuildConfig, options: ['Sleek Jumpsuit', 'Business Formal', 'Techwear Casual', 'Utilitarian Fatigues', 'Elegant Robes', 'Vintage Academia'] },
    { title: "Background Setting", key: 'setting' as keyof AvatarBuildConfig, options: ['Minimalist White Room', 'Sci-fi Command Bridge', 'Cozy Digital Library', 'Steampunk Workshop', 'Abstract Data Stream', 'Neon-lit Cityscape'] }
];

const initialConfig: AvatarBuildConfig = {
    genderPresentation: 'Androgynous', skinTone: 'Porcelain', bodyType: 'Slender', ageRange: 'Young Adult (20s)',
    hairStyle: 'Holographic Projection', facialExpression: 'Neutral & Calm', outfit: 'Sleek Jumpsuit', setting: 'Minimalist White Room',
};

interface VisualGeneratorProps {
    agent: Agent;
    onGenerateVideo: (config: AvatarBuildConfig) => void;
    onApply: (videoUrl: string) => void;
    onConfigUpdate: (config: AvatarBuildConfig) => void;
    isGenerating: boolean;
    videoUrl: string | null;
    error: string | null;
    progressMessage: string | null;
}

const VisualGenerator: React.FC<VisualGeneratorProps> = ({ 
    agent, onGenerateVideo, onApply, onConfigUpdate, 
    isGenerating, videoUrl, error, progressMessage 
}) => {
    const [config, setConfig] = useState<AvatarBuildConfig>(agent.metadata.avatarConfig || initialConfig);
    const apiReady = isApiConfigured();

    useEffect(() => {
        setConfig(agent.metadata.avatarConfig || initialConfig);
    }, [agent.metadata.avatarConfig]);

    const handleConfigChange = (key: keyof AvatarBuildConfig, value: string) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onConfigUpdate(newConfig);
    };

    const isBlueprintComplete = Object.values(config).every(val => val && val.length > 0);

    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-overlay animate-fadeIn flex flex-col h-full relative">
            {!apiReady && (
                <div className="absolute inset-0 bg-base/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4 rounded-xl">
                     <h4 className="font-semibold text-highlight mb-2">Feature Unavailable</h4>
                     <p className="text-sm text-text-secondary">Agent visualization requires a valid API key to be configured.</p>
                </div>
            )}
            <h3 className="font-semibold text-highlight flex items-center gap-2 mb-4">
                <SparklesIcon />
                Live Portrait Generator
            </h3>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {/* Avatar Blueprint Editor */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-primary">Avatar Blueprint</h4>
                    {buildSteps.map(step => (
                        <div key={step.key}>
                            <label htmlFor={step.key} className="block text-xs font-medium text-text-secondary mb-1">{step.title}</label>
                            <select
                                id={step.key}
                                value={config[step.key]}
                                onChange={(e) => handleConfigChange(step.key, e.target.value)}
                                disabled={isGenerating || !apiReady}
                                className="w-full bg-overlay border border-secondary rounded-lg py-1.5 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                            >
                                {step.options.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                    ))}
                </div>

                {/* Preview and Generation Area */}
                <div className="mt-4 pt-4 border-t border-overlay">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Generation & Preview</h4>
                    <div className="w-full aspect-square bg-overlay/50 rounded-lg flex items-center justify-center mb-4 border border-secondary">
                        {videoUrl ? (
                             <video key={videoUrl} controls autoPlay loop muted playsInline className="w-full h-full object-cover rounded-lg" src={videoUrl}/>
                        ) : isGenerating ? (
                            <div className="text-center p-4 animate-pulse">
                                <p className="text-sm font-medium text-highlight">{progressMessage || 'Initializing...'}</p>
                                {progressMessage?.includes('elapsed') && <p className="text-xs text-text-secondary mt-1">This can take several minutes.</p>}
                            </div>
                        ) : (
                            <VideoCameraIcon className="w-16 h-16 text-text-secondary/50" />
                        )}
                    </div>
                     <button
                        onClick={() => onGenerateVideo(config)}
                        disabled={isGenerating || !isBlueprintComplete || !apiReady}
                        className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-3 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 text-sm"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Generate Live Portrait
                    </button>
                </div>
                
                {error && <p className="text-sm text-red-400 mt-2 text-center">{error}</p>}

                 {videoUrl && !isGenerating && (
                    <div className="mt-4 pt-4 border-t border-overlay">
                        <button
                            onClick={() => onApply(videoUrl)}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-3 rounded-lg hover:bg-opacity-80"
                        >
                            Apply Live Portrait
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualGenerator;