

import React, { useState, useRef } from 'react';
import { Agent, AvatarBuildConfig, ChatMessage, FineGrainedSettingsConfig, FineGrainedSetting, OllamaModel } from '../types';
import VisualGenerator from './VisualGenerator';
import EnhancementsPanel from './EnhancementsPanel';
import FileUploader from './FileUploader';
import { CogIcon, UploadIcon } from './icons/Icons';
import CognitiveUplink from './CognitiveUplink';
import LocalInferenceKit from './LocalInferenceKit';
import FineGrainedSettings from './FineGrainedSettings';
import TodoList from './TodoList';

interface TrainingToolsProps {
    agent: Agent;
    isGenerating: boolean;
    generatedVideoUrl: string | null;
    generationError: string | null;
    generationProgress: string | null;
    handleGenerateVideo: (config: AvatarBuildConfig) => Promise<void>;
    handleApplyVideoAsAvatar: (videoUrl: string) => void;
    handleAgentUpdate: (updatedAgent: Agent) => void;
    isVoiceEnabled: boolean;
    isAvatarAnimated: boolean;
    setIsVoiceEnabled: (enabled: boolean) => void;
    setIsAvatarAnimated: (enabled: boolean) => void;
    handleAgentLoad: (agent: Agent) => void;
    importKnowledge: (text: string, fileName: string) => void;
    messages: ChatMessage[];
    neuralPathway: 'API' | 'Native';
    isAnalyzing: boolean;
    suggestedMemories: string[] | null;
    analyzeConversation: () => void;
    approveMemory: (memory: string) => void;
    rejectMemory: (memory: string) => void;
    clearSuggestions: () => void;
    settings: FineGrainedSettingsConfig;
    setFineGrainedSetting: (setting: FineGrainedSetting, value: number) => void;

    // Ollama props
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

const TrainingTools: React.FC<TrainingToolsProps> = (props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => fileInputRef.current?.click();

    const handleKnowledgeImportEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !props.agent) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;
            props.importKnowledge(text, file.name);
        };
        reader.readAsText(file);
        event.target.value = ''; // Allow re-uploading same file
    };

    return (
        <div className="bg-surface p-4 rounded-xl shadow-lg border border-overlay animate-fadeIn flex flex-col h-full">
            <div className="p-2">
                <h2 className="text-xl font-bold text-text-primary">Training Tools</h2>
                <p className="text-sm text-text-secondary">Enhance and manage the agent.</p>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 mt-2 space-y-4">
                <TodoList agentName={props.agent.name} />
                
                {props.neuralPathway === 'Native' && (
                    <LocalInferenceKit
                        ollamaStatus={props.ollamaStatus}
                        ollamaUrl={props.ollamaUrl}
                        ollamaError={props.ollamaError}
                        ollamaModels={props.ollamaModels}
                        selectedOllamaModel={props.selectedOllamaModel}
                        connectToOllama={props.connectToOllama}
                        setOllamaUrl={props.setOllamaUrl}
                        setSelectedOllamaModel={props.setSelectedOllamaModel}
                        isPullingModel={props.isPullingModel}
                        pullingModelStatus={props.pullingModelStatus}
                        pullOllamaModel={props.pullOllamaModel}
                        deleteOllamaModel={props.deleteOllamaModel}
                    />
                )}

                <FineGrainedSettings
                    settings={props.settings}
                    onSettingChange={props.setFineGrainedSetting}
                />

                <div className="p-2 bg-overlay/50 rounded-lg">
                    <h3 className="font-semibold text-highlight flex items-center gap-2 mb-2"><CogIcon />Enhancements</h3>
                    <EnhancementsPanel 
                        isVoiceEnabled={props.isVoiceEnabled} isAvatarAnimated={props.isAvatarAnimated}
                        onVoiceToggle={props.setIsVoiceEnabled} onAnimationToggle={props.setIsAvatarAnimated}
                    />
                </div>

                {props.neuralPathway === 'API' && (
                    <>
                        <CognitiveUplink 
                            agent={props.agent}
                            messages={props.messages}
                            neuralPathway={props.neuralPathway}
                            isAnalyzing={props.isAnalyzing}
                            suggestedMemories={props.suggestedMemories}
                            analyzeConversation={props.analyzeConversation}
                            approveMemory={props.approveMemory}
                            rejectMemory={props.rejectMemory}
                            clearSuggestions={props.clearSuggestions}
                        />
                        <VisualGenerator
                            agent={props.agent}
                            onGenerateVideo={props.handleGenerateVideo}
                            onApply={props.handleApplyVideoAsAvatar}
                            onConfigUpdate={(config) => props.handleAgentUpdate({...props.agent, metadata: {...props.agent.metadata, avatarConfig: config}})}
                            isGenerating={props.isGenerating}
                            videoUrl={props.generatedVideoUrl}
                            error={props.generationError}
                            progressMessage={props.generationProgress}
                        />
                    </>
                )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-overlay space-y-3">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleKnowledgeImportEvent}
                    accept=".txt"
                    className="hidden"
                />
                <button
                    onClick={handleFileSelect}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-all"
                    title="Import knowledge from a .txt file (one concept per line)"
                >
                    <UploadIcon />
                    <span>Import Knowledge</span>
                </button>
                <FileUploader agent={props.agent} onAgentLoad={props.handleAgentLoad} />
            </div>
        </div>
    );
};

export default TrainingTools;