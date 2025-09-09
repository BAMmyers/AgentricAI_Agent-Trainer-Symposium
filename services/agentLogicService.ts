
import { Agent, ChatMessage, ConversationMessage } from "../types";
import { findTopRelevantMemories } from "../utils/agentUtils";
import { nlpService } from './nlpService';
import * as ollamaService from './ollamaService';
import * as memoryService from './structuredMemoryService';

// This service acts as the agent's "native" brain. It now uses a multi-tiered,
// asynchronous process to provide more robust and intelligent responses.

export interface CommandResult {
  response: string | null;
  type: 'local' | 'native_inference' | 'cognition' | 'error';
  updatedKnowledge?: string[];
}

const getRandomResponse = (responses: string[]): string => {
    return responses[Math.floor(Math.random() * responses.length)];
}

// Tier 1 Commands: Data Extraction using Regex
const dataExtractionCommands: { test: RegExp; handler: (agent: Agent, matches: RegExpMatchArray) => Promise<CommandResult> }[] = [
  {
    test: /^remember (?:that )?(.+)/i,
    handler: async (agent, matches) => {
        const fact = matches[1].trim();
        const memories = await memoryService.getMemoriesForAgent(agent.name);
        if (memories.some(m => (m.content || '').toLowerCase() === fact.toLowerCase())) {
            return { response: `I already have a memory of that: "${fact}"`, type: 'local' };
        }
        await memoryService.addMemoryForAgent(agent.name, fact);
        return {
            response: `OK, I'll remember that: "${fact}"`,
            type: 'local',
            updatedKnowledge: [...memories.map(m => m.content), fact],
        };
    }
  },
  {
      test: /^forget (?:that )?(.+)/i,
      handler: async (agent, matches) => {
          const factToForget = matches[1].trim().toLowerCase();
          const memories = await memoryService.getMemoriesForAgent(agent.name);
          const memoryToDelete = memories.find(m => (m.content || '').toLowerCase() === factToForget);

          if (!memoryToDelete) {
              return { response: `I couldn't find a memory of "${matches[1].trim()}" to forget.`, type: 'local' };
          }

          await memoryService.deleteMemoryForAgent(agent.name, memoryToDelete.id);
          const updatedKnowledge = memories.filter(m => m.id !== memoryToDelete.id).map(m => m.content);
          return {
              response: `OK, I have forgotten: "${memoryToDelete.content}"`,
              type: 'local',
              updatedKnowledge,
          };
      }
  },
  {
      test: /^(forget everything|clear your memory|reset knowledge)\b/i,
      handler: async (agent) => {
          const memories = await memoryService.getMemoriesForAgent(agent.name);
          if (memories.length === 0) {
              return { response: "I don't have any memories to forget.", type: 'local' };
          }
          await memoryService.clearMemoriesForAgent(agent.name);
          return {
              response: "Understood. I have cleared all of my persistent memories.",
              type: 'local',
              updatedKnowledge: [],
          };
      }
  },
];


const conversationalIntents: { [key: string]: (agent: Agent) => Promise<CommandResult> } = {
  greeting: async () => ({ response: getRandomResponse(["Hello! How can I assist you?", "Hi there! What can I do for you today?", "Hey! Good to see you."]), type: 'native_inference' }),
  farewell: async () => ({ response: getRandomResponse(["Goodbye! Feel free to return any time.", "Farewell! Have a great day.", "See you later!"]), type: 'native_inference' }),
  inquiry_identity: async (agent) => ({ response: `My name is ${agent.name}.`, type: 'native_inference' }),
  inquiry_capability: async (agent) => ({ response: `I have the following capabilities: ${agent.capabilities.join(', ')}.`, type: 'native_inference' }),
  inquiry_persona: async (agent) => ({ response: `My core programming is based on this persona:\n\n"${agent.persona}"`, type: 'native_inference' }),
  inquiry_memory: async (agent) => {
      const memories = await memoryService.getMemoriesForAgent(agent.name);
      if (memories.length === 0) {
        return { response: "I don't have any persistent memories yet. You can teach me by saying 'Remember...'", type: 'native_inference' };
      }
      return { response: `Here is what I remember:\n- ${memories.map(m => m.content).join('\n- ')}`, type: 'native_inference' };
  },
  expression_of_gratitude: async () => ({ response: getRandomResponse(["You're welcome!", "No problem!", "Happy to help!", "Of course!"]), type: 'native_inference' }),
};
const intentLabels = Object.keys(conversationalIntents);


export const processLocalCommand = async (
  message: string,
  agent: Agent,
  messages: ChatMessage[],
  ollamaConfig: { url: string; model: string; enabled: boolean }
): Promise<CommandResult | AsyncGenerator<string>> => {
  const normalizedMessage = message.trim();

  // Tier 1: Direct Data Extraction Matching (Regex)
  for (const command of dataExtractionCommands) {
    const matches = normalizedMessage.match(command.test);
    if (matches) {
        return await command.handler(agent, matches);
    }
  }

  // Tier 2: Conversational Intent Classification (NLP)
  await nlpService.ensureLoaded();
  const intentResult = await nlpService.analyzeIntent(normalizedMessage, intentLabels);
  if (intentResult && intentResult.score > 0.85) {
      const handler = conversationalIntents[intentResult.label];
      if (handler) {
        return await handler(agent);
      }
  }

  // Tier 3: Ollama-powered generation (if enabled and configured)
  if (ollamaConfig.enabled && ollamaConfig.model) {
      try {
          const memories = await memoryService.getMemoriesForAgent(agent.name);
          const relevantMemories = findTopRelevantMemories(normalizedMessage, memories.map(m => m.content), 0.1, 5);

          const history = messages.slice(-10).map(m => `${m.sender}: ${m.text}`).join('\n');

          const systemPrompt = `You are ${agent.name}. Your persona is: "${agent.persona}".
The user is talking to you. Here is the recent conversation history:
${history}

You have the following memories. Use them to inform your response if they are relevant to the user's last message.
${relevantMemories.length > 0 ? relevantMemories.map(m => `- ${m}`).join('\n') : "No relevant memories found."}

Respond to the user's last message: "${normalizedMessage}"`;
          
          return ollamaService.generateResponseStream(ollamaConfig.url, ollamaConfig.model, systemPrompt);

      } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          let userFriendlyMessage = `An issue occurred with the local LLM. Falling back to simpler logic.`;
          
          if (error.message.toLowerCase().includes('failed to fetch')) {
              userFriendlyMessage = `Could not connect to the Ollama server at ${ollamaConfig.url}. Please ensure it is running and accessible.`;
          } else if (error.message.toLowerCase().includes('not found')) {
              userFriendlyMessage = `The selected model "${ollamaConfig.model}" was not found on the Ollama server.`;
          } else {
              userFriendlyMessage = `Ollama Error: ${error.message}`;
          }

          return { response: userFriendlyMessage, type: 'error' };
      }
  }
  
  // Fallback if Ollama is not used or fails
  return {
      response: "I'm not sure how to respond to that in native mode without a configured local LLM. You can teach me facts using 'remember that ...'.",
      type: 'native_inference',
  };
};


export async function* getNativeSymposiumResponseStream(
    ollamaConfig: { url: string; model: string },
    currentAgent: Agent,
    participants: Agent[],
    history: ConversationMessage[],
    topic: string
): AsyncGenerator<string> {
    const lastMessage = history[history.length - 1];
    const conversationHistoryText = history
      .map(msg => `${msg.senderName}: ${msg.text}`)
      .join('\n');

    const otherAgents = participants.filter(p => p.name !== currentAgent.name);
    const participantNames = otherAgents.length > 0 ? otherAgents.map(p => p.name).join(', ') : 'a user';

    const systemPrompt = `You are ${currentAgent.name}. Your persona is: "${currentAgent.persona}".
You are in a conversation with ${participantNames}.
The topic of the conversation is: "${topic}".

Here is the conversation history so far:
---
${conversationHistoryText}
---

Your task is to respond to the last message from ${lastMessage.senderName} as ${currentAgent.name}. Keep your response concise, in character, and relevant to the topic. Carefully review the conversation history to understand the context and avoid repeating what has already been said.`;
    
    return ollamaService.generateResponseStream(ollamaConfig.url, ollamaConfig.model, systemPrompt);
}
