import React, { useRef, useState, useEffect } from 'react';
import { Agent } from '../types';
import { UploadIcon, DocumentTextIcon } from './icons/Icons';
import { getAgentHistory, addAgentToHistory } from '../services/historyService';
import { normalizeAgent } from '../utils/agentUtils';

interface WelcomeScreenProps {
  onAgentLoad: (agent: Agent) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAgentLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);

  useEffect(() => {
    setRecentAgents(getAgentHistory());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const loadedAgent = normalizeAgent(JSON.parse(content));
            addAgentToHistory(loadedAgent);
            onAgentLoad(loadedAgent);
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleLoadSample = async () => {
    const sampleAgent: Agent = normalizeAgent({
      name: "Agentric-7",
      description: "An advanced AI assistant designed for complex problem-solving and multi-modal interaction.",
      persona: "You are Agentric-7, a helpful and highly intelligent AI. You are curious, precise, and always aim to provide the most accurate and insightful information possible. You adapt your communication style based on the active interaction mode.",
      metadata: {
        version: "1.0.0",
        author: "Acme Corp",
        avatar: {
          static: "https://picsum.photos/seed/agentric7/150/150",
          animated_idle: "https://videos.pexels.com/video-files/853878/853878-hd_1280_720_25fps.mp4",
          animated_talking: "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
        },
        avatarConfig: {
          genderPresentation: 'Feminine', skinTone: 'Porcelain', bodyType: 'Slender', ageRange: 'Young Adult (20s)',
          hairStyle: 'Long & Flowing', facialExpression: 'Gentle Smile', outfit: 'Sleek Jumpsuit', setting: 'Minimalist White Room',
        }
      },
      capabilities: ["chat", "logic", "code", "emotion"],
      knowledgeBase: []
    });
    addAgentToHistory(sampleAgent);
    onAgentLoad(sampleAgent);
  };

  return (
    <div className="text-center bg-surface p-10 rounded-2xl shadow-2xl border border-overlay max-w-2xl w-full animate-fadeIn">
      <h1 className="text-4xl font-bold text-primary mb-2">AgentricAI</h1>
      <p className="text-lg text-highlight mb-8">Autonomous Agent Interface</p>
      
      {recentAgents.length > 0 && (
        <div className="mb-8 border-t border-b border-overlay py-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recently Used Agents</h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {recentAgents.map((agent, index) => (
                    <button key={`${agent.name}-${index}`} onClick={() => onAgentLoad(agent)} className="px-4 py-2 bg-overlay rounded-lg text-highlight hover:bg-secondary hover:text-white transition-colors">
                        {agent.name}
                    </button>
                ))}
            </div>
        </div>
      )}

      <p className="text-text-secondary mb-8">
        To begin, load an agent from your history, a local JSON file, or use the sample agent to explore.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-all text-lg"
        >
          <UploadIcon />
          Load from JSON
        </button>
        <button
          onClick={handleLoadSample}
          className="w-full flex items-center justify-center gap-3 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-all text-lg"
        >
          <DocumentTextIcon />
          Load Sample Agent
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;