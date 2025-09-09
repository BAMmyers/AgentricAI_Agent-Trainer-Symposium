
export interface Agent {
  name: string;
  role: string;
  description: string;
  persona: string;
  metadata: {
    version: string;
    author: string;
    avatar: {
      static: string;
      animated_idle: string;
      animated_talking: string;
    };
    avatarConfig?: AvatarBuildConfig; // For saving the blueprint
  };
  capabilities: Mode[];
  knowledgeBase?: string[];
}

export type Mode = 'chat' | 'logic' | 'math' | 'code' | 'emotion';

// For the single-agent Workspace view
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  type?: 'standard' | 'local' | 'native_inference' | 'system' | 'cognition' | 'error'; // Replaces isLocal for more granular control
  style?: React.CSSProperties; // Optional styling for future use
  isProcessing?: boolean;
}

// For the multi-agent Symposium view
export interface ConversationMessage {
  senderType: 'user' | 'agent' | 'system' | 'moderator';
  senderName: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export type SymposiumMode = 'debate' | 'roundtable' | 'assembly';

// For the Avatar Blueprint and generation
export interface AvatarBuildConfig {
  genderPresentation: string;
  skinTone: string;
  bodyType: string;
  ageRange: string;
  hairStyle: string;
  facialExpression: string;
  outfit: string;
  setting: string;
}

// For the AI-assisted Persona Generator
export interface PersonaConfig {
    coreTraits: string;
    primaryRole: string;
    communicationStyle: string;
}

// For the Fine-Grained Settings panel
export interface FineGrainedSettingsConfig {
  temperature: number;
  topP: number;
  topK: number;
  nativeMemoryThreshold: number;
}

export type FineGrainedSetting = keyof FineGrainedSettingsConfig;

// For the agent-specific To-Do list
export type Priority = 'High' | 'Medium' | 'Low';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
}

// For the Ollama local LLM service
export interface OllamaModel {
    name: string;
    model: string;
    modified_at: string;
    size: number;
}

export interface OllamaPullProgress {
    status: string;
    digest?: string;
    total?: number;
    completed?: number;
}