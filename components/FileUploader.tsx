import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '../types';
import { UploadIcon, DownloadIcon, ClockIcon } from './icons/Icons';
import { getAgentHistory } from '../services/historyService';
import { normalizeAgent } from '../utils/agentUtils';

interface FileUploaderProps {
  agent: Agent | null;
  onAgentLoad: (agent: Agent) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ agent, onAgentLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          const content = e.target?.result;
          if (typeof content === 'string') {
            const json = JSON.parse(content);
            // Centralized normalization
            onAgentLoad(normalizeAgent(json));
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadClick = () => fileInputRef.current?.click();
  
  const handleSaveClick = () => {
    if (!agent) return;
    const jsonString = JSON.stringify(agent, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}-brain.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHistoryClick = () => {
    setHistory(getAgentHistory());
    setIsHistoryOpen(!isHistoryOpen);
  };
  
  const handleLoadFromHistory = (agentToLoad: Agent) => {
    onAgentLoad(agentToLoad); // History provides already-normalized agents
    setIsHistoryOpen(false);
  }

  return (
    <div className="space-y-3">
       <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      <button 
        onClick={handleSaveClick} 
        disabled={!agent}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
      >
        <DownloadIcon />
        Export {agent ? agent.name : 'Agent'}
      </button>
      <div className="relative" ref={historyRef}>
        <div className="flex rounded-lg overflow-hidden">
          <button 
            onClick={handleLoadClick} 
            className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 hover:bg-opacity-80 transition-all"
          >
            <UploadIcon />
            Load Agent
          </button>
          <button onClick={handleHistoryClick} className="p-3 bg-highlight/80 text-base hover:bg-highlight transition-colors" aria-label="Load from history">
            <ClockIcon />
          </button>
        </div>
        {isHistoryOpen && (
          <div className="absolute bottom-full mb-2 w-full bg-surface border border-overlay rounded-lg shadow-lg z-10 animate-fadeIn">
            <ul className="max-h-48 overflow-y-auto">
              {history.length > 0 ? history.map((histAgent, index) => (
                <li key={`${histAgent.name}-${index}`}>
                  <button onClick={() => handleLoadFromHistory(histAgent)} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-overlay hover:text-white transition-colors">
                    {histAgent.name} <span className="text-xs text-text-secondary/50">by {histAgent.metadata.author}</span>
                  </button>
                </li>
              )) : (
                <li className="px-4 py-2 text-sm text-text-secondary italic">No history found.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;