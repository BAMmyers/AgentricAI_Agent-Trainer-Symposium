

import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '../types';
import { UploadIcon, LightBulbIcon, ChevronDownIcon, ClockIcon } from './icons/Icons';
import { getAgentHistory } from '../services/historyService';

interface AgentSlotProps {
  agent: Agent | null;
  onAgentLoad: (agent: object) => void;
  slot: number;
  isActive?: boolean;
}

const AgentSlot: React.FC<AgentSlotProps> = ({ agent, onAgentLoad, slot, isActive = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [knowledgeVisible, setKnowledgeVisible] = useState(false);
  const [history, setHistory] = useState<Agent[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (typeof e.target?.result === 'string') {
            onAgentLoad(JSON.parse(e.target.result));
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadClick = () => fileInputRef.current?.click();
  
  const handleHistoryClick = () => {
    setHistory(getAgentHistory());
    setIsHistoryOpen(!isHistoryOpen);
  };
  
  const handleLoadFromHistory = (agentToLoad: Agent) => {
    onAgentLoad(agentToLoad);
    setIsHistoryOpen(false);
  }

  if (!agent) {
    return (
      <div className="bg-surface p-6 rounded-xl shadow-lg border border-dashed border-overlay h-full flex flex-col items-center justify-center text-center animate-fadeIn">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        <h3 className="text-lg font-bold text-highlight mb-2">Agent Slot {slot}</h3>
        <p className="text-sm text-text-secondary mb-4">Load an agent to participate.</p>
         <div className="relative w-full" ref={historyRef}>
            <div className="flex rounded-lg overflow-hidden">
                <button onClick={handleLoadClick} className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-4 hover:bg-opacity-80 transition-all">
                    <UploadIcon /> Load Agent
                </button>
                 <button onClick={handleHistoryClick} className="p-3 bg-highlight/80 text-base hover:bg-highlight transition-colors" aria-label="Load from history">
                    <ClockIcon />
                </button>
            </div>
            {isHistoryOpen && (
              <div className="absolute top-full mt-2 w-full bg-surface border border-overlay rounded-lg shadow-lg z-10 animate-fadeIn">
                <ul className="max-h-48 overflow-y-auto">
                  {history.length > 0 ? history.map((histAgent, index) => (
                    <li key={`${histAgent.name}-${index}`}>
                      <button onClick={() => handleLoadFromHistory(histAgent)} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-overlay hover:text-white">
                        {histAgent.name}
                      </button>
                    </li>
                  )) : ( <li className="px-4 py-2 text-sm text-text-secondary italic">No history found.</li> )}
                </ul>
              </div>
            )}
        </div>
      </div>
    );
  }

  const hasKnowledge = agent.knowledgeBase && agent.knowledgeBase.length > 0;
  const personaSnippet = agent.persona ? (agent.persona.split('.')[0] + '.') : 'No persona defined.';

  return (
    <div className={`bg-surface p-4 rounded-xl shadow-lg animate-fadeIn flex flex-col transition-all duration-300 border ${isActive ? 'border-primary shadow-primary/20' : 'border-overlay'}`}>
       <div className="flex items-start gap-3 mb-3">
         <img src={agent.metadata?.avatar?.static || `https://i.pravatar.cc/150?u=${agent.name}`} alt={agent.name} className="w-12 h-12 rounded-full border-2 border-primary" />
        <div className="flex-grow">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-text-primary">{agent.name}</h2>
            <p className="px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">{agent.role}</p>
          </div>
          <p className="text-xs text-text-secondary">By {agent.metadata.author}</p>
        </div>
      </div>
       <div className="space-y-3 text-sm text-text-secondary border-t border-overlay pt-3">
            <p className="line-clamp-2">{agent.description}</p>
            <div>
              <p className="text-xs font-semibold text-highlight">Persona Snippet</p>
              <p className="italic text-xs mt-1">"{personaSnippet}"</p>
            </div>
            {hasKnowledge && (
                <div className="pt-2">
                    <button onClick={() => setKnowledgeVisible(!knowledgeVisible)} className="flex items-center justify-between w-full text-left">
                        <h4 className="font-semibold text-highlight flex items-center gap-2">
                            <LightBulbIcon className="w-4 h-4" /> Learned Concepts ({agent.knowledgeBase?.length})
                        </h4>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${knowledgeVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {knowledgeVisible && (
                        <div className="mt-2 space-y-1 pl-2 border-l-2 border-secondary">
                            {agent.knowledgeBase?.map((concept, i) => (
                                <p key={i} className="text-xs bg-overlay/50 p-1.5 rounded animate-fadeIn">{concept}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {isActive && (
                <div className="mt-2 p-2 bg-overlay/50 rounded-lg border-l-2 border-primary animate-pulse">
                    <p className="text-xs text-highlight font-semibold">Thinking...</p>
                </div>
            )}
       </div>
    </div>
  );
};

export default AgentSlot;
