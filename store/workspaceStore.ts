

import { create } from 'zustand';
import { Agent, ChatMessage, Mode, AvatarBuildConfig, FineGrainedSettingsConfig, FineGrainedSetting, OllamaModel } from '../types';
import { getAgentChatResponse, createChatSession, summarizeLearnings, generateAgentVideo, isApiConfigured, analyzeFailure, extractKnowledgeFromConversation } from '../services/geminiService';
import { speak, cancelSpeech } from '../services/speechService';
import { processLocalCommand } from '../services/agentLogicService';
import type { CommandResult } from '../services/agentLogicService';
import { consolidateKnowledge } from '../services/cognitiveService';
import * as memoryService from '../services/structuredMemoryService';
import * as ollamaService from '../services/ollamaService';
import { normalizeAgent } from '../utils/agentUtils';
import { addAgentToHistory, updateAgentInHistory } from '../services/historyService';
import { Chat } from '@google/genai';

type NeuralPathway = 'API' | 'Native';
type OllamaStatus = 'connected' | 'disconnected' | 'pending';

// Define the state structure
interface WorkspaceState {
  agent: Agent | null;
  messages: ChatMessage[];
  activeMode: Mode;
  isLoading: boolean;
  chatSession: Chat | null;
  isVoiceEnabled: boolean;
  isAvatarAnimated: boolean;
  isSpeaking: boolean;
  isGenerating: boolean;
  generatedVideoUrl: string | null;
  generationError: string | null;
  generationProgress: string | null;
  isOffline: boolean;
  neuralPathway: NeuralPathway;
  suggestedMemories: string[] | null;
  isAnalyzing: boolean;
  settings: FineGrainedSettingsConfig;
  // Ollama integration state
  ollamaStatus: OllamaStatus;
  ollamaUrl: string;
  ollamaError: string | null;
  ollamaModels: OllamaModel[];
  selectedOllamaModel: string;
  isPullingModel: boolean;
  pullingModelStatus: string | null;
  // API availability state
  apiAvailable: boolean;
  apiUnavailableReason: string | null;
}

// Define the actions (functions to modify state)
interface WorkspaceActions {
  init: (isOffline: boolean) => void;
  handleAgentLoad: (loadedAgentData: object) => void;
  handleAgentUpdate: (updatedAgent: Agent) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'timestamp' | 'id'>) => ChatMessage;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  append_to_last_message: (chunk: string) => void;
  triggerCognitiveConsolidation: (agentAtTriggerTime: Agent) => void;
  handleSendMessage: (text: string) => Promise<void>;
  handleModeChange: (mode: Mode) => void;
  setIsVoiceEnabled: (enabled: boolean) => void;
  setIsAvatarAnimated: (enabled: boolean) => void;
  initializeChatSession: () => void;
  handleGenerateVideo: (config: AvatarBuildConfig) => Promise<void>;
  handleApplyVideoAsAvatar: (videoUrl: string) => void;
  importKnowledge: (text: string, fileName: string) => void;
  setNeuralPathway: (pathway: NeuralPathway) => void;
  analyzeConversation: () => Promise<void>;
  approveMemory: (memory: string) => void;
  rejectMemory: (memory: string) => void;
  clearSuggestions: () => void;
  setFineGrainedSetting: (setting: FineGrainedSetting, value: number) => void;
  // Ollama actions
  connectToOllama: () => Promise<void>;
  setOllamaUrl: (url: string) => void;
  setSelectedOllamaModel: (model: string) => void;
  pullOllamaModel: (modelName: string) => Promise<void>;
  deleteOllamaModel: (modelName: string) => Promise<void>;
}

const defaultSettings: FineGrainedSettingsConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    nativeMemoryThreshold: 0.25
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set, get) => ({
    agent: null,
    messages: [],
    activeMode: 'chat',
    isLoading: false,
    chatSession: null,
    isVoiceEnabled: false,
    isAvatarAnimated: false,
    isSpeaking: false,
    isGenerating: false,
    generatedVideoUrl: null,
    generationError: null,
    generationProgress: null,
    isOffline: !navigator.onLine,
    neuralPathway: 'API',
    suggestedMemories: null,
    isAnalyzing: false,
    settings: defaultSettings,
    ollamaStatus: 'disconnected',
    ollamaUrl: 'http://localhost:11434',
    ollamaError: null,
    ollamaModels: [],
    selectedOllamaModel: '',
    isPullingModel: false,
    pullingModelStatus: null,
    apiAvailable: false,
    apiUnavailableReason: 'Checking...',

    init: (isOffline: boolean) => {
        const apiIsReady = isApiConfigured();
        const apiAvailable = apiIsReady && !isOffline;
        let reason: string | null = null;
        let pathway: NeuralPathway = get().neuralPathway;

        if (!apiIsReady) {
            reason = "API key not configured.";
        } else if (isOffline) {
            reason = "Application is offline.";
        }

        if (!apiAvailable) {
            pathway = 'Native';
        }
        
        set({
            isOffline,
            apiAvailable,
            apiUnavailableReason: reason,
            neuralPathway: pathway
        });

        // Attempt to connect to Ollama on init
        get().connectToOllama();
    },

    handleAgentLoad: async (loadedAgentData) => {
        const normalized = normalizeAgent(loadedAgentData);
        
        // Migrate old knowledgeBase to structured memory
        if (normalized.knowledgeBase && normalized.knowledgeBase.length > 0) {
            await memoryService.syncMemoriesForAgent(normalized.name, normalized.knowledgeBase);
        }
        // Load structured memory into knowledgeBase for display
        const memories = await memoryService.getMemoriesForAgent(normalized.name);
        normalized.knowledgeBase = memories.map(m => m.content);

        set({
            agent: normalized,
            messages: [{
                id: Date.now().toString(),
                sender: 'system',
                text: `${normalized.name} has been loaded.`,
                timestamp: new Date().toISOString(),
                type: 'system',
            }],
            activeMode: normalized.capabilities[0] || 'chat',
            suggestedMemories: null,
        });
        addAgentToHistory(normalized);
        get().initializeChatSession();
    },

    handleAgentUpdate: async (updatedAgent) => {
        const oldAgent = get().agent;
        if (!oldAgent) return;
        
        // Handle name change for structured memory
        if (oldAgent.name !== updatedAgent.name) {
            await memoryService.migrateMemories(oldAgent.name, updatedAgent.name);
        }
        
        // Sync knowledge base with structured memory
        if (updatedAgent.knowledgeBase) {
             await memoryService.syncMemoriesForAgent(updatedAgent.name, updatedAgent.knowledgeBase);
        }
       
        set({ agent: updatedAgent });
        updateAgentInHistory(oldAgent.name, updatedAgent);
        get().initializeChatSession();
    },

    addMessage: (message) => {
        const newMessage: ChatMessage = {
            ...message,
            id: Date.now().toString() + Math.random(),
            timestamp: new Date().toISOString(),
        };
        set(state => ({ messages: [...state.messages, newMessage] }));
        return newMessage;
    },

    updateMessage: (messageId, updates) => {
        set(state => ({
            messages: state.messages.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg),
        }));
    },

    append_to_last_message: (chunk) => {
        set(state => {
            if (state.messages.length === 0) return state;
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage.sender !== 'agent') return state; // Only append to agent messages
            const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
            return { messages: [...state.messages.slice(0, -1), updatedMessage] };
        });
    },

    triggerCognitiveConsolidation: async (agentAtTriggerTime) => {
        if (!isApiConfigured() || get().neuralPathway !== 'API') return;

        const { addMessage } = get();
        addMessage({ sender: 'system', text: 'Cognitive consolidation process initiated in the background...', type: 'cognition' });
        try {
            const distilledKnowledge = await consolidateKnowledge(agentAtTriggerTime);
            
            // Check if agent is still the same one
            const currentAgent = get().agent;
            if (currentAgent && currentAgent.name === agentAtTriggerTime.name) {
                // Only update if the knowledge has actually changed
                if (JSON.stringify(distilledKnowledge) !== JSON.stringify(currentAgent.knowledgeBase)) {
                    get().handleAgentUpdate({ ...currentAgent, knowledgeBase: distilledKnowledge });
                     addMessage({ sender: 'system', text: 'Memory successfully consolidated and refined.', type: 'cognition' });
                }
            }
        } catch (error) {
            console.error("Consolidation failed:", error);
            addMessage({ sender: 'system', text: 'Cognitive consolidation failed.', type: 'error' });
        }
    },

    handleSendMessage: async (text) => {
        const { agent, addMessage, append_to_last_message, neuralPathway, ollamaUrl, selectedOllamaModel } = get();
        if (!agent || get().isLoading) return;

        addMessage({ sender: 'user', text });
        set({ isLoading: true, suggestedMemories: null });

        if (neuralPathway === 'Native') {
            const agentMessage = addMessage({ sender: 'agent', text: '', isProcessing: true });
            try {
                const result = await processLocalCommand(text, agent, get().messages, { url: ollamaUrl, model: selectedOllamaModel, enabled: get().ollamaStatus === 'connected' });
                
                // FIX: Use a type guard to correctly differentiate between a CommandResult object and an AsyncGenerator.
                // The previous check (`result.response`) was unsafe and caused a TypeScript error, as AsyncGenerator does not have that property.
                if ('response' in result) { // This is a CommandResult
                    const commandResult = result as CommandResult;
                    get().updateMessage(agentMessage.id, { text: commandResult.response || '', type: commandResult.type, isProcessing: false });
                    if (commandResult.updatedKnowledge) {
                        get().handleAgentUpdate({ ...agent, knowledgeBase: commandResult.updatedKnowledge });
                    }
                } else { // This is an AsyncGenerator
                    get().updateMessage(agentMessage.id, { type: 'local' });
                    for await (const chunk of result) {
                        append_to_last_message(chunk);
                    }
                    get().updateMessage(agentMessage.id, { isProcessing: false });
                }
            } catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                get().updateMessage(agentMessage.id, { text: `Native processing error: ${error.message}`, type: 'error', isProcessing: false });
            } finally {
                set({ isLoading: false });
            }
            return;
        }

        // --- API Pathway ---
        try {
            if (!get().chatSession) throw new Error("Chat session not initialized.");
            const responseText = await getAgentChatResponse(get().chatSession!, text);
            const agentMessage = addMessage({ sender: 'agent', text: responseText });

            if (get().isVoiceEnabled) {
                speak(responseText, () => set({ isSpeaking: true }), () => set({ isSpeaking: false }));
            }

            // Summarize learning in the background
            const userMessage = get().messages[get().messages.length - 2];
            const learning = await summarizeLearnings(userMessage, agentMessage);
            if (learning && !agent.knowledgeBase?.includes(learning)) {
                await memoryService.addMemoryForAgent(agent.name, learning);
                const updatedMemories = await memoryService.getMemoriesForAgent(agent.name);
                set(state => ({ agent: { ...state.agent!, knowledgeBase: updatedMemories.map(m => m.content) } }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const friendlyError = await analyzeFailure(text, error as Error);
            addMessage({ sender: 'agent', text: friendlyError, type: 'error' });
        } finally {
            set({ isLoading: false });
            if (get().messages.length > 5 && get().messages.length % 10 === 0) {
                get().triggerCognitiveConsolidation(get().agent!);
            }
        }
    },

    handleModeChange: (mode) => {
        set({ activeMode: mode });
        get().initializeChatSession();
    },

    setIsVoiceEnabled: (enabled) => {
        set({ isVoiceEnabled: enabled });
        if (!enabled) cancelSpeech();
    },

    setIsAvatarAnimated: (enabled) => set({ isAvatarAnimated: enabled }),

    initializeChatSession: () => {
        const { agent, activeMode, settings, apiAvailable } = get();
        if (agent && apiAvailable) {
            try {
                const session = createChatSession(agent, activeMode, settings);
                set({ chatSession: session });
            } catch(e) {
                console.error("Failed to create chat session", e);
                set({ chatSession: null });
            }
        } else {
            set({ chatSession: null });
        }
    },
    
    handleGenerateVideo: async (config) => {
        const { agent } = get();
        if (!agent || !isApiConfigured()) {
            set({ generationError: "API key is not configured. Video generation is unavailable." });
            return;
        }
        set({ isGenerating: true, generatedVideoUrl: null, generationError: null, generationProgress: null });
        try {
            const videoUrl = await generateAgentVideo(agent, config, (progress) => {
                set({ generationProgress: progress });
            });
            set({ generatedVideoUrl: videoUrl });
        } catch (e) {
            set({ generationError: e instanceof Error ? e.message : String(e) });
        } finally {
            set({ isGenerating: false, generationProgress: null });
        }
    },

    handleApplyVideoAsAvatar: (videoUrl) => {
        const { agent } = get();
        if (agent) {
            const updatedAgent = {
                ...agent,
                metadata: {
                    ...agent.metadata,
                    avatar: { ...agent.metadata.avatar, animated_idle: videoUrl }
                }
            };
            get().handleAgentUpdate(updatedAgent);
        }
    },
    
    importKnowledge: async (text, fileName) => {
        const { agent, addMessage } = get();
        if (!agent) return;
        const concepts = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (concepts.length === 0) return;

        const currentKnowledge = await memoryService.getMemoriesForAgent(agent.name);
        const currentContent = new Set(currentKnowledge.map(m => m.content));
        
        let addedCount = 0;
        for(const concept of concepts) {
            if (!currentContent.has(concept)) {
                await memoryService.addMemoryForAgent(agent.name, concept);
                addedCount++;
            }
        }
        
        const updatedMemories = await memoryService.getMemoriesForAgent(agent.name);

        set(state => ({
            agent: { ...state.agent!, knowledgeBase: updatedMemories.map(m => m.content) }
        }));
        addMessage({ sender: 'system', text: `Imported ${addedCount} new concepts from ${fileName}.`, type: 'system' });
    },
    
    setNeuralPathway: (pathway) => {
        const { apiAvailable, apiUnavailableReason } = get();
        if (pathway === 'API' && !apiAvailable) {
            console.warn(`Cannot switch to API pathway: ${apiUnavailableReason}`);
            return;
        }
        set({ neuralPathway: pathway });
    },

    analyzeConversation: async () => {
        if (!isApiConfigured()) return;
        set({ isAnalyzing: true, suggestedMemories: null });
        try {
            const suggestions = await extractKnowledgeFromConversation(get().messages);
            set({ suggestedMemories: suggestions });
        } catch(e) {
            console.error("Analysis failed:", e);
            get().addMessage({ sender: 'system', text: 'Failed to analyze conversation.', type: 'error' });
        } finally {
            set({ isAnalyzing: false });
        }
    },

    approveMemory: async (memory) => {
        const { agent } = get();
        if (!agent) return;
        
        await memoryService.addMemoryForAgent(agent.name, memory);
        const updatedMemories = await memoryService.getMemoriesForAgent(agent.name);
        
        set(state => ({
            agent: { ...state.agent!, knowledgeBase: updatedMemories.map(m => m.content) },
            suggestedMemories: state.suggestedMemories?.filter(m => m !== memory) || null
        }));
    },

    rejectMemory: (memory) => {
        set(state => ({
            suggestedMemories: state.suggestedMemories?.filter(m => m !== memory) || null
        }));
    },

    clearSuggestions: () => set({ suggestedMemories: null }),

    setFineGrainedSetting: (setting, value) => {
        set(state => ({ settings: { ...state.settings, [setting]: value } }));
        get().initializeChatSession();
    },

    // Ollama Actions
    connectToOllama: async () => {
        const { ollamaUrl } = get();
        set({ ollamaStatus: 'pending', ollamaError: null });
        try {
            const isUp = await ollamaService.checkStatus(ollamaUrl);
            if (isUp) {
                const models = await ollamaService.listModels(ollamaUrl);
                set({
                    ollamaStatus: 'connected',
                    ollamaModels: models,
                    selectedOllamaModel: get().selectedOllamaModel || models[0]?.model || ''
                });
            } else {
                throw new Error("Server not responding.");
            }
        } catch (e) {
            set({
                ollamaStatus: 'disconnected',
                ollamaError: e instanceof Error ? e.message : String(e),
                ollamaModels: [],
                selectedOllamaModel: ''
            });
        }
    },
    
    setOllamaUrl: (url) => set({ ollamaUrl: url }),

    setSelectedOllamaModel: (model) => set({ selectedOllamaModel: model }),

    pullOllamaModel: async (modelName) => {
        set({ isPullingModel: true, pullingModelStatus: `Requesting ${modelName}...`, ollamaError: null });
        try {
            const stream = ollamaService.pullModelStream(get().ollamaUrl, modelName);
            for await (const progress of stream) {
                 let statusText = progress.status;
                if (progress.total && progress.completed) {
                    const percent = Math.round((progress.completed / progress.total) * 100);
                    statusText += ` (${percent}%)`;
                }
                set({ pullingModelStatus: statusText });
            }
        } catch (e) {
            set({ ollamaError: e instanceof Error ? e.message : String(e) });
        } finally {
            set({ isPullingModel: false, pullingModelStatus: null });
            await get().connectToOllama(); // Refresh model list
        }
    },

    deleteOllamaModel: async (modelName) => {
         if (!window.confirm(`Are you sure you want to delete the model "${modelName}" from the Ollama server?`)) {
            return;
        }
        set({ ollamaError: null });
        try {
            await ollamaService.deleteModel(get().ollamaUrl, modelName);
        } catch (e) {
            set({ ollamaError: e instanceof Error ? e.message : String(e) });
        } finally {
            await get().connectToOllama(); // Refresh model list
        }
    },
}));
