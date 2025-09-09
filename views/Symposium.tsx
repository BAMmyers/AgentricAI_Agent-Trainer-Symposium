
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Agent, ConversationMessage, SymposiumMode } from '../types';
import { 
    getConversationResponse, 
    isApiConfigured,
    getModeratorIntro,
    getModeratorInterjection,
    getModeratorConclusion,
    summarizeSymposium,
    getAssemblyStepResponse
} from '../services/geminiService';
import { getNativeSymposiumResponseStream } from '../services/agentLogicService';
import { normalizeAgent } from '../utils/agentUtils';
import { addAgentToHistory } from '../services/historyService';
import AgentSlot from '../components/AgentSlot';
import ConversationLog from '../components/ConversationLog';
import { PlayIcon, StopIcon, SparklesIcon } from '../components/icons/Icons';
import ToggleSwitch from '../components/ToggleSwitch';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SymposiumProps {
    isOffline: boolean;
}

const Symposium: React.FC<SymposiumProps> = ({ isOffline }) => {
  const [symposiumMode, setSymposiumMode] = useState<SymposiumMode>('debate');
  const [agents, setAgents] = useState<(Agent | null)[]>(Array(2).fill(null));
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [topic, setTopic] = useState<string>('The future of artificial intelligence');
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null);
  const isSimulatingRef = useRef(isSimulating);
  
  const [useModerator, setUseModerator] = useState<boolean>(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  
  const { ollamaStatus, ollamaUrl, selectedOllamaModel } = useWorkspaceStore();
  const apiReady = isApiConfigured();
  const nativeReady = ollamaStatus === 'connected' && !!selectedOllamaModel;

  const canRunApi = !isOffline && apiReady;
  const canRunNative = nativeReady;
  const canRunAnything = canRunApi || canRunNative;
  const preferredPathway = canRunApi ? 'API' : 'Native';
  const agentsLoaded = !agents.some(a => a === null);

  const numAgents = useMemo(() => {
    switch (symposiumMode) {
      case 'debate': return 2;
      case 'roundtable': return 3;
      case 'assembly': return 5;
      default: return 2;
    }
  }, [symposiumMode]);

  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);
  
  useEffect(() => {
    setAgents(currentAgents => {
      const newAgents = Array(numAgents).fill(null);
      for (let i = 0; i < Math.min(currentAgents.length, numAgents); i++) {
        newAgents[i] = currentAgents[i];
      }
      return newAgents;
    });
    handleStopSimulation();
    setConversation([]);
    setSummary(null);
  }, [numAgents, symposiumMode]);


  const handleAgentLoad = (agentData: object, slotIndex: number) => {
    const normalizedAgent = normalizeAgent(agentData);
    addAgentToHistory(normalizedAgent);
    const newAgents = [...agents];
    newAgents[slotIndex] = normalizedAgent;
    setAgents(newAgents);
  };

  const addMessage = (msg: Omit<ConversationMessage, 'timestamp'>) => {
    const newMessage = { ...msg, timestamp: new Date().toISOString() + Math.random() };
    setConversation(prev => [...prev, newMessage]);
    return newMessage;
  };
  
  const handleStopSimulation = () => {
    setIsSimulating(false);
    setActiveAgentIndex(null);
  };
  
  const runAssemblySimulation = async () => {
    setIsSimulating(true);
    setConversation([]);
    setSummary(null);

    let currentText = topic;
    const agentsForSimulation: Agent[] = JSON.parse(JSON.stringify(agents.filter(a => a) as Agent[]));

    addMessage({
      senderType: 'system', senderName: 'System', avatar: '',
      text: `Assembly started. Prompt: "${topic}"`,
    });
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < agentsForSimulation.length; i++) {
        if (!isSimulatingRef.current) {
             addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: 'Assembly stopped by user.' });
             break;
        }
        
        const currentAgent = agentsForSimulation[i];
        setActiveAgentIndex(i);
        addMessage({
            senderType: 'system', senderName: 'System', avatar: '',
            text: `${currentAgent.name} is now processing...`,
        });

        try {
            const responseText = await getAssemblyStepResponse(currentAgent, topic, currentText);
            currentText = responseText;

            addMessage({
                senderType: 'agent', senderName: currentAgent.name, avatar: currentAgent.metadata.avatar.static,
                text: currentText,
            });
            await new Promise(r => setTimeout(r, 1500));
        } catch (error) {
            console.error("Assembly step error:", error);
            addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: `An error occurred with ${currentAgent.name}. Assembly halted.` });
            break;
        }
    }
    setActiveAgentIndex(null);
    if (isSimulatingRef.current) {
        addMessage({
            senderType: 'system', senderName: 'System', avatar: '',
            text: `Assembly complete. Final output generated.`,
        });
    }
    handleStopSimulation();
  };

  const runNativeConversation = async () => {
    setIsSimulating(true);
    setConversation([]);
    setSummary(null);

    const initialMessage = addMessage({
        senderType: 'system', senderName: 'System', avatar: '',
        text: `Local conversation started on: "${topic}". Using model: ${selectedOllamaModel}.`,
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    let currentHistory: ConversationMessage[] = [initialMessage];
    const agentsForSimulation = agents.filter(a => a) as Agent[];

    for (let turn = 0; turn < maxTurns * agentsForSimulation.length; turn++) {
        if (!isSimulatingRef.current) {
            addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: 'Conversation stopped by user.' });
            break;
        }

        const agentIndex = turn % agentsForSimulation.length;
        const currentAgent = agentsForSimulation[agentIndex];
        setActiveAgentIndex(agentIndex);
        
        try {
            const stream = getNativeSymposiumResponseStream(
                { url: ollamaUrl, model: selectedOllamaModel! },
                currentAgent,
                agentsForSimulation,
                currentHistory,
                topic
            );

            const agentMessage = addMessage({
                senderType: 'agent', senderName: currentAgent.name,
                avatar: currentAgent.metadata.avatar.static, text: '',
            });

            let fullText = '';
            for await (const chunk of stream) {
                if (!isSimulatingRef.current) break;
                fullText += chunk;
                setConversation(prev => prev.map(m => m.timestamp === agentMessage.timestamp ? {...m, text: fullText} : m));
            }

            currentHistory.push({ ...agentMessage, text: fullText });

        } catch (error) {
            console.error(`Error with ${currentAgent.name} (Native):`, error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occured.";
            addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: `Error with ${currentAgent.name}: ${errorMessage}. Conversation halted.` });
            break;
        }
    }
    handleStopSimulation();
  };
  
  const runDebateSimulation = async () => {
    setIsSimulating(true);
    setConversation([]);
    setSummary(null);

    const agentsForSimulation = JSON.parse(JSON.stringify(agents.filter(a => a) as Agent[]));
    let currentHistory: ConversationMessage[];

    try {
        if (useModerator) {
            const intro = await getModeratorIntro(topic, agentsForSimulation);
            currentHistory = [addMessage({ senderType: 'moderator', senderName: 'Moderator', avatar: '', text: intro })];
            await new Promise(r => setTimeout(r, 1000));
        } else {
            currentHistory = [addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: `Conversation started on: "${topic}"` })];
        }

        for (let turn = 0; turn < maxTurns * agentsForSimulation.length; turn++) {
            if (!isSimulatingRef.current) {
                addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: 'Conversation stopped by user.' });
                break;
            }

            if (useModerator && turn > 0 && turn % agentsForSimulation.length === 0) {
                 setActiveAgentIndex(null);
                 const interjection = await getModeratorInterjection(currentHistory, topic, agentsForSimulation);
                 currentHistory.push(addMessage({ senderType: 'moderator', senderName: 'Moderator', avatar: '', text: interjection }));
                 await new Promise(r => setTimeout(r, 1500));
            }

            const agentIndex = turn % agentsForSimulation.length;
            const currentAgent = agentsForSimulation[agentIndex];
            setActiveAgentIndex(agentIndex);

            const responseText = await getConversationResponse(currentAgent, agentsForSimulation, currentHistory, topic);
            const newMessage = addMessage({
                senderType: 'agent', senderName: currentAgent.name,
                avatar: currentAgent.metadata.avatar.static, text: responseText
            });
            currentHistory.push(newMessage);
            
            await new Promise(r => setTimeout(r, 1500));
        }
        
        if (isSimulatingRef.current && useModerator) {
            const conclusion = await getModeratorConclusion(currentHistory, topic, agentsForSimulation);
            addMessage({ senderType: 'moderator', senderName: 'Moderator', avatar: '', text: conclusion });
        }

    } catch (error) {
        console.error("Simulation Error:", error);
        addMessage({ senderType: 'system', senderName: 'System', avatar: '', text: `A critical error occurred. Simulation halted.` });
    } finally {
        handleStopSimulation();
        if (canRunApi) {
            setIsSummarizing(true);
            try {
                const summaryText = await summarizeSymposium(conversation, topic, agentsForSimulation);
                setSummary(summaryText);
            } catch (e) {
                setSummary("Could not generate a summary due to an error.");
            } finally {
                setIsSummarizing(false);
            }
        }
    }
  };

  const handleStartSimulation = () => {
    if (!agentsLoaded) {
      alert(`Please load all ${numAgents} agents to begin.`);
      return;
    }
    
    if (symposiumMode === 'assembly') {
        if (canRunApi) {
            runAssemblySimulation();
        } else {
            addMessage({
              senderType: 'system', senderName: 'System', avatar: '',
              text: 'Assembly mode requires an API connection and is not available offline or in Native mode.',
            });
        }
        return;
    }

    if (canRunApi) {
        runDebateSimulation();
    } else if (canRunNative) {
        runNativeConversation();
    }
  };

  const handleUserMessage = (text: string) => {
    if (isSimulating) return;
    addMessage({
        senderType: 'user', senderName: 'User',
        avatar: 'https://i.pravatar.cc/150?u=user', text
    });
  };

  return (
    <div className="h-full w-full p-4 lg:p-6 grid grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column: Agents */}
        <div className="col-span-12 lg:col-span-4 h-full">
             <div className="bg-surface p-4 rounded-xl shadow-lg border border-overlay h-full flex flex-col">
                <h2 className="text-xl font-bold text-highlight mb-4">Participants</h2>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {agents.map((agent, index) => (
                        <AgentSlot 
                            key={index} 
                            agent={agent} 
                            onAgentLoad={(data) => handleAgentLoad(data, index)} 
                            slot={index + 1}
                            isActive={activeAgentIndex === index}
                        />
                    ))}
                </div>
             </div>
        </div>

        {/* Center Column: Conversation */}
        <main className="col-span-12 lg:col-span-5 h-full flex flex-col bg-surface rounded-xl shadow-lg border border-overlay">
            <ConversationLog 
                messages={conversation}
                onSendMessage={handleUserMessage}
                isLoading={isSimulating}
                isOffline={isOffline}
                mode={symposiumMode}
            />
        </main>
        
        {/* Right Column: Controls & Summary */}
        <div className="col-span-12 lg:col-span-3 h-full">
             <div className="bg-surface p-4 rounded-xl shadow-lg border border-overlay h-full flex flex-col">
                <h2 className="text-xl font-bold text-highlight mb-4">Controls</h2>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {/* Mode Selection */}
                    <div className="p-3 bg-overlay/50 rounded-lg">
                        <label className="text-sm font-semibold text-text-primary block mb-2">Symposium Mode</label>
                        <select 
                            value={symposiumMode}
                            onChange={(e) => setSymposiumMode(e.target.value as SymposiumMode)}
                            disabled={isSimulating}
                            className="w-full bg-overlay border border-secondary rounded-lg py-1.5 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                            <option value="debate">Debate (2 Agents)</option>
                            <option value="roundtable">Roundtable (3 Agents)</option>
                            <option value="assembly">Assembly (5 Agents)</option>
                        </select>
                    </div>

                    {/* Simulation Parameters */}
                    <div className="p-3 bg-overlay/50 rounded-lg">
                        <label className="text-sm font-semibold text-text-primary block mb-2">Topic of Discussion</label>
                        <textarea 
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isSimulating}
                            rows={3}
                            className="w-full bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
                        />
                        <label className="text-sm font-semibold text-text-primary block mt-2 mb-1">Max Turns (per agent)</label>
                        <input 
                            type="number"
                            value={maxTurns}
                            onChange={e => setMaxTurns(parseInt(e.target.value, 10) || 1)}
                            disabled={isSimulating}
                            min="1" max="20"
                            className="w-full bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
                        />
                         <div className="mt-4 pt-3 border-t border-overlay/50">
                            <ToggleSwitch
                                label="AI Moderator"
                                enabled={useModerator}
                                onChange={setUseModerator}
                                disabled={!canRunApi || isSimulating || symposiumMode === 'assembly'}
                            />
                        </div>
                    </div>
                    
                    {!canRunAnything && !isSimulating && (
                      <div className="bg-yellow-900/50 border border-yellow-600/50 text-yellow-300 text-sm p-3 rounded-lg text-center animate-fadeIn">
                        <h4 className="font-bold">Pathways Unavailable</h4>
                        <p className="mt-1 text-xs">To run a simulation, you need an internet connection with a valid API key OR a connected Ollama server.</p>
                      </div>
                    )}
                    
                    {/* Summary */}
                    {(summary || isSummarizing) && (
                        <div className="p-3 bg-overlay/50 rounded-lg animate-fadeIn">
                             <h3 className="font-semibold text-highlight flex items-center gap-2 mb-2"><SparklesIcon /> Summary</h3>
                             {isSummarizing ? (
                                <p className="text-sm text-text-secondary animate-pulse">Generating summary...</p>
                             ) : (
                                <div className="prose prose-sm prose-invert max-w-none text-text-secondary whitespace-pre-wrap">
                                   {summary}
                                </div>
                             )}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-overlay flex items-center gap-2">
                    <button
                        onClick={handleStartSimulation}
                        disabled={isSimulating || !canRunAnything || !agentsLoaded}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <PlayIcon />
                        {isSimulating ? 'Simulating...' : (symposiumMode === 'assembly' ? 'Start Assembly' : (preferredPathway === 'API' ? 'Start Simulation' : 'Start Native Conversation'))}
                    </button>
                    <button onClick={handleStopSimulation} disabled={!isSimulating} className="flex-shrink-0 p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all">
                        <StopIcon />
                    </button>
                </div>
             </div>
        </div>
    </div>
  );
};

export default Symposium;
