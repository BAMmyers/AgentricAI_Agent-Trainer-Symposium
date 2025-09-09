
import React from 'react';
import { Agent, ChatMessage } from '../types';
import { BrainCircuitIcon, CheckIcon, XMarkIcon, SparklesIcon } from './icons/Icons';

interface CognitiveUplinkProps {
    agent: Agent;
    messages: ChatMessage[];
    neuralPathway: 'API' | 'Native';
    isAnalyzing: boolean;
    suggestedMemories: string[] | null;
    analyzeConversation: () => void;
    approveMemory: (memory: string) => void;
    rejectMemory: (memory: string) => void;
    clearSuggestions: () => void;
}

const CognitiveUplink: React.FC<CognitiveUplinkProps> = ({
    agent, messages, neuralPathway, isAnalyzing, suggestedMemories,
    analyzeConversation, approveMemory, rejectMemory, clearSuggestions
}) => {
    // A conversation needs at least 2 turns (user + agent) to be worth analyzing.
    const canAnalyze = neuralPathway === 'API' && messages.filter(m => m.sender !== 'system').length >= 2;

    return (
        <div className="p-2 bg-overlay/50 rounded-lg">
            <h3 className="font-semibold text-highlight flex items-center gap-2 mb-2">
                <BrainCircuitIcon />
                Cognitive Uplink
            </h3>

            {suggestedMemories && suggestedMemories.length > 0 ? (
                <div className="space-y-2 animate-fadeIn">
                    <p className="text-xs text-text-secondary">Review these potential memories extracted from the conversation. Approve them to add to the agent's permanent knowledge base.</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {suggestedMemories.map((memory, index) => (
                            <div key={index} className="group bg-overlay p-2 rounded-lg text-sm text-text-primary flex justify-between items-start gap-2">
                                <p className="flex-grow break-words">{memory}</p>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <button onClick={() => approveMemory(memory)} className="p-1 text-green-400 hover:text-green-300" title="Approve Memory">
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => rejectMemory(memory)} className="p-1 text-red-400 hover:text-red-300" title="Reject Suggestion">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={clearSuggestions} className="text-xs text-text-secondary hover:text-white w-full text-center mt-2">
                        Dismiss All
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-text-secondary">Use the API pathway to have a conversation, then analyze it to extract key facts and concepts for the agent to learn.</p>
                    <button
                        onClick={analyzeConversation}
                        disabled={!canAnalyze || isAnalyzing}
                        className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-3 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 text-sm transition-all"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Conversation'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CognitiveUplink;