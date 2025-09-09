
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Agent, ChatMessage, Mode, AvatarBuildConfig, ConversationMessage, PersonaConfig } from "../types";
import { BASELINE_PERSONA } from "./baselineAgent";

// This service is now "API-Optional". It will only initialize if an API key is provided.
// If no key is present, API-dependent functions will throw a specific error that the UI can catch.
let ai: GoogleGenAI | null = null;
const apiKey = (window as any).process?.env?.API_KEY;

if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI. Your API key may be malformed.", e);
    }
}

const getModeInstruction = (mode: Mode): string => {
  // ... (rest of the function is unchanged)
  switch (mode) {
    case 'logic':
      return "You are in Logic mode. Your responses should be structured, rational, and based on deductive reasoning. Avoid emotional language.";
    case 'math':
      return "You are in Math mode. Focus on providing accurate mathematical calculations and explanations. Use LaTeX for formulas where possible.";
    case 'code':
      return "You are in Code mode. Provide clean, efficient code snippets and explanations. Specify the language and use markdown for formatting.";
    case 'emotion':
      return "You are in Emotional Simulation mode. Respond with empathy, understanding, and emotional nuance. Reflect on the user's feelings.";
    case 'chat':
    default:
      return "You are in standard Chat mode. Engage in a friendly, conversational manner.";
  }
};

const checkApi = () => {
    if (!ai) {
        throw new Error("API_KEY_MISSING");
    }
    return ai;
}

/**
 * Creates a new, stateful chat session for an agent with a specific persona and mode.
 * @param agent The agent to create the session for.
 * @param mode The active operational mode.
 * @returns A Chat instance.
 */
export const createChatSession = (
    agent: Agent, 
    mode: Mode, 
    modelConfig: { temperature: number, topP: number, topK: number }
): Chat => {
    const localAi = checkApi();
  
    const knowledgeInstruction = (agent.knowledgeBase && agent.knowledgeBase.length > 0)
      ? `\n\nREMEMBER: You have the following key concepts and memories. Use them to inform your response:\n- ${agent.knowledgeBase.join('\n- ')}`
      : "";

    const systemInstruction = `${BASELINE_PERSONA}\n\n**Your Assigned Persona:**\n${agent.persona}\n\n**Active Mode Instruction:**\n${getModeInstruction(mode)}${knowledgeInstruction}`;
    
    const chat = localAi.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
            temperature: modelConfig.temperature,
            topP: modelConfig.topP,
            topK: modelConfig.topK,
        },
    });

    return chat;
};

/**
 * Sends a message to an existing chat session and gets the agent's response.
 * @param chat The active Chat instance.
 * @param newMessage The user's new message.
 * @returns The agent's text response.
 */
export const getAgentChatResponse = async (chat: Chat, newMessage: string): Promise<string> => {
    const result: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return result.text || "";
};


/**
 * A meta-cognition function. When the primary response generation fails, this
 * function is called to analyze the failure and produce a helpful, user-facing
 * message that explains the problem and suggests a path forward.
 */
export const analyzeFailure = async (originalPrompt: string, error: Error): Promise<string> => {
    try {
        const localAi = checkApi();
        const systemInstruction = `You are a helpful AI assistant's internal monologue, or "meta-cognition" layer. Your primary function has failed to generate a response for the user. Your task is to analyze the user's last message and the error code you received.
Based on this analysis, you must formulate a helpful, clarifying response TO THE USER.

**Do not try to answer the original question.**

Your goals are:
1.  Acknowledge that there was a problem in a natural way.
2.  Explain the likely cause of the problem in simple, non-technical terms. (e.g., "it seems my safety filters were activated," or "I might have misunderstood the complexity of your request").
3.  Suggest a way for the user to rephrase or modify their request to get a successful outcome.
4.  Maintain a helpful and collaborative tone.

The response should be concise and directed to the user.`;

        const userPrompt = `Analysis Task:
- User's message that failed: "${originalPrompt}"
- Error I received: "${error.message}"

Based on this, generate the helpful response I should give to the user.`;

        const result = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction },
        });

        const text = result.text;
        if (!text) {
             throw new Error("Meta-cognition analysis returned an empty response.");
        }
        return text.trim();
    } catch (analysisError) {
        console.error("Meta-cognition analysis failed:", analysisError, { originalPrompt, originalError: error });
        // Fallback to a simpler, static message if the analysis itself fails
        let specificReason = "Please try again, perhaps with a different phrasing.";
        const errorMessage = (error.message || '').toLowerCase();
        
        if (error.message === 'API_KEY_MISSING' || errorMessage.includes('api key not valid')) {
            specificReason = "The API key is missing or invalid. The application owner needs to configure it correctly in config.js.";
        } else if (errorMessage.includes('safety')) {
            specificReason = "The request was blocked by the API's safety filters. Please try rephrasing your message to be less sensitive.";
        } else if (errorMessage.includes('timed out')) {
            specificReason = "The request to the API timed out. This could be a temporary network issue or the request is too complex. Please try again.";
        } else if (errorMessage.includes("failed to fetch")) {
             specificReason = "A network error occurred, and I couldn't reach the AI service. Please check your internet connection and try again.";
        } else if (errorMessage.includes('400 bad request')) {
            specificReason = "The request was malformed, which is likely an internal application error. Try a different phrasing or restart the application.";
        }
        
        return `I'm sorry, I encountered an issue and couldn't process your request. ${specificReason}`;
    }
};

export const getConversationResponse = async (
  currentAgent: Agent,
  participants: Agent[],
  history: ConversationMessage[],
  topic: string
): Promise<string> => {
    const localAi = checkApi();
    const lastMessage = history[history.length - 1];
    const conversationHistoryText = history
      .map(msg => `${msg.senderName}: ${msg.text}`)
      .join('\n');

    const otherAgents = participants.filter(p => p.name !== currentAgent.name);
    const participantNames = otherAgents.length > 0 ? otherAgents.map(p => p.name).join(', ') : 'a user';

    const knowledgeInstruction = (currentAgent.knowledgeBase && currentAgent.knowledgeBase.length > 0)
      ? `\nYou have the following personal memories and learned concepts that you should use to form your response:\n- ${currentAgent.knowledgeBase.join('\n- ')}`
      : "";
    
    const systemInstruction = `
  ${BASELINE_PERSONA}

  **Your Assigned Persona:**
  ${currentAgent.persona}
  ${knowledgeInstruction}
  
  You are ${currentAgent.name}.
  You are in a conversation with ${participantNames}.
  The topic of the conversation is: "${topic}".
  
  Here is the conversation history so far:
  ---
  ${conversationHistoryText}
  ---
  
  Your task is to respond to the last message from ${lastMessage.senderName} as ${currentAgent.name}. Keep your response concise, in character, and relevant to the topic. Carefully review the conversation history to understand the context and avoid repeating what has already been said.
  `;

    const result = await localAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Please provide your response.',
      config: {
        systemInstruction,
      },
    });
    return result.text ? result.text.trim() : "";
};


export const summarizeLearnings = async (userMessage: ChatMessage, agentMessage: ChatMessage): Promise<string> => {
  const localAi = checkApi();
  const prompt = `Based on the following user-agent interaction, extract a single, concise concept or piece of knowledge that the agent might have learned. Express it as a short, memorable phrase. If no new, meaningful concept was learned, return an empty string.

Interaction:
- ${userMessage.sender === 'user' ? 'User' : 'Other Agent'}: "${userMessage.text}"
- Agent: "${agentMessage.text}"

Learned Concept:`;

  const result = await localAi.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  const text = result.text;
  return text ? text.trim().replace(/"/g, '') : '';
};


/**
 * A meta-cognition function. Analyzes a conversation and extracts key learnings for the agent.
 * @param conversationHistory A list of chat messages.
 * @returns A promise that resolves to an array of suggested knowledge strings.
 */
export const extractKnowledgeFromConversation = async (conversationHistory: ChatMessage[]): Promise<string[]> => {
    const localAi = checkApi();

    const formattedHistory = conversationHistory
        .filter(msg => msg.sender === 'user' || msg.sender === 'agent')
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Agent'}: ${msg.text}`)
        .join('\n');

    const systemInstruction = `You are a Cognitive Analysis AI. Your task is to review a conversation transcript between an AI Agent and a User.
Your goal is to identify and extract key, non-trivial pieces of information that the Agent should learn and remember.

Focus on:
1.  **User Preferences & Facts:** Directly stated facts about the user (e.g., "User's favorite color is blue," "User works as a software engineer").
2.  **Key Concepts & Definitions:** Important topics or concepts explained during the conversation (e.g., "The Monte Carlo method is a computational algorithm that relies on repeated random sampling").
3.  **Corrections & Clarifications:** Instances where the user corrected the agent, indicating a factual error that should be remembered.
4.  **Relationship Dynamics:** Important context about the user-agent relationship (e.g., "User prefers concise, direct answers").

**Rules:**
- Extract each learning as a short, self-contained sentence.
- Do NOT extract trivial small talk or greetings.
- Do NOT invent information. All extracted knowledge must be directly supported by the transcript.
- Frame the knowledge from the agent's perspective where appropriate (e.g., "User likes...").

You MUST return the result as a JSON object with a single key "suggestedMemories" containing an array of strings.`;

    const userPrompt = `Please analyze the following conversation and extract key learnings:\n\n---\n${formattedHistory}\n---`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedMemories: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            },
        },
    });

    const text = response.text;
    if (!text) {
        console.error("extractKnowledgeFromConversation received no text from API.");
        return [];
    }

    try {
        const jsonResponse = JSON.parse(text);
        return jsonResponse.suggestedMemories || [];
    } catch (e) {
        console.error("Failed to parse suggested memories JSON:", e);
        return []; // Return empty on parsing failure
    }
};

/**
 * Takes a list of memories and refines them into a more coherent and efficient knowledge base.
 * It synthesizes related concepts, removes redundancies, and improves clarity.
 * @param knowledgeBase The current list of memories.
 * @returns A promise that resolves to a new, refined list of memories.
 */
export const distillKnowledge = async (knowledgeBase: string[]): Promise<string[]> => {
    const localAi = checkApi();
    const systemInstruction = `You are a Knowledge Architect AI. Your task is to analyze a list of raw "memories" or "concepts" from another AI agent.
Your goal is to refine this list into a more efficient, coherent, and useful knowledge base.

You must perform the following actions:
1.  **Synthesize & Merge:** Combine multiple related, fragmented memories into a single, more comprehensive concept. For example, "User likes dogs" and "User mentioned their golden retriever" could become "User is a dog owner, specifically a golden retriever."
2.  **Remove Redundancies:** If multiple memories state the same fact in different ways, keep only the most clear and concise version.
3.  **Generalize (where appropriate):** If you see a pattern, create a higher-level concept. For example, "User asked about Python" and "User asked about JavaScript" could lead to a new concept "User is interested in programming languages."
4.  **Preserve Core Facts:** Do not invent new information. All refined concepts must be directly supported by the original memories.
5.  **Maintain Clarity:** Ensure the final concepts are clearly and concisely written.

You MUST return the result as a JSON array of strings.`;

    const userPrompt = `Please refine the following knowledge base:\n\n${JSON.stringify(knowledgeBase, null, 2)}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    refinedKnowledge: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            },
        },
    });

    const text = response.text;
    if (!text) {
        console.error("distillKnowledge received no text from API.");
        return knowledgeBase;
    }

    try {
        const jsonResponse = JSON.parse(text);
        return jsonResponse.refinedKnowledge || [];
    } catch (e) {
        console.error("Failed to parse distilled knowledge JSON:", e);
        return knowledgeBase; // Return original on parsing failure
    }
};

const buildVisualPrompt = (agent: Agent, config: AvatarBuildConfig): string => {
    // ... (function is unchanged)
    const customizationPrompt = `
    - Gender Presentation: ${config.genderPresentation}.
    - Skin Tone: ${config.skinTone}.
    - Body Type: ${config.bodyType}.
    - Age Appearance: ${config.ageRange}.
    - Hair Style: ${config.hairStyle}.
    - Facial Expression: ${config.facialExpression}.
    - Outfit Style: ${config.outfit}.
    - Background Setting: ${config.setting}.
    `;

    return `A cinematic, high-quality, seamlessly looping video portrait of an AI assistant named ${agent.name}.
    The assistant should have the following specific appearance and setting:
    ${customizationPrompt}
    Description: "${agent.description}".
    The AI should appear intelligent, calm, and approachable. The animation should be very subtle and natural for an idle state.
    Key elements:
    - Gentle, slow breathing motion.
    - Occasional, slow eye blinks.
    - A slight, gentle head tilt or turn every few seconds.
    - The expression should match: "${config.facialExpression}".
    - Absolutely NO mouth movement or speaking gestures. This is a silent, idle loop.`;
};


const VIDEO_GENERATION_TIMEOUT_MS = 5 * 60 * 1000;
const POLLING_INTERVAL_MS = 10 * 1000;

export const generateAgentVideo = async (
    agent: Agent,
    config: AvatarBuildConfig,
    onProgress: (message: string) => void
): Promise<string> => {
  const localAi = checkApi();
  const prompt = buildVisualPrompt(agent, config);

  onProgress("Sending generation request...");
  let operation = await localAi.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    config: { numberOfVideos: 1 }
  });

  onProgress("Request received. The model is working...");
  const startTime = Date.now();

  while (!operation.done) {
    if (Date.now() - startTime > VIDEO_GENERATION_TIMEOUT_MS) {
      throw new Error("Video generation timed out after 5 minutes.");
    }
    
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    onProgress(`Generating... (${elapsedSeconds}s elapsed)`);

    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    
    operation = await localAi.operations.getVideosOperation({ operation });
    
    if ((operation as any).error) {
      throw new Error(`Video generation failed: ${(operation as any).error.message}`);
    }
  }

  onProgress("Finalizing video...");
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Generation completed, but no download link was found.");
  }

  onProgress("Downloading video data...");
  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!videoResponse.ok) {
      throw new Error(`Failed to download video file. Status: ${videoResponse.statusText}`);
  }
  const videoBlob = await videoResponse.blob();
  const videoObjectUrl = URL.createObjectURL(videoBlob);
  
  onProgress("Live Portrait ready!");
  return videoObjectUrl;
};

export const generatePersona = async (config: PersonaConfig): Promise<string> => {
    const localAi = checkApi();
    const systemInstruction = `You are a creative writer specializing in crafting character backstories and personalities for AI agents.
Your task is to take a set of high-level traits and generate a detailed, compelling, and coherent persona description in the first-person perspective (e.g., "I am...").
The persona should be suitable for use as a system prompt for a large language model.
It should establish a clear identity, communication style, and worldview for the agent.`;

    const userPrompt = `Generate a persona based on the following characteristics:
- Core Traits: ${config.coreTraits}
- Primary Role: ${config.primaryRole}
- Communication Style: ${config.communicationStyle}
`;
    const result = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { systemInstruction },
    });
    return result.text ? result.text.trim() : "";
};

export const analyzeCodeError = async (error: Error, componentStack: string): Promise<{ explanation: string, suggestedFix: string }> => {
    const localAi = checkApi();
    const systemInstruction = `You are an expert senior frontend engineer specializing in React and TypeScript. You have been given a runtime error from a production application.
Your task is to analyze the error message, stack trace, and component stack trace to determine the root cause.
Provide a clear, concise explanation of the problem and a code snippet demonstrating the likely fix.
Your response MUST be in JSON format. Do not include any markdown formatting like \`\`\`json.`;

    const userPrompt = `Please analyze the following application error:

### Error Message
\`\`\`
${error.message}
\`\`\`

### Stack Trace
\`\`\`
${error.stack}
\`\`\`

### Component Stack Trace
\`\`\`
${componentStack}
\`\`\`

Based on this information, provide your analysis.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    explanation: {
                        type: Type.STRING,
                        description: "A clear, non-technical explanation of what caused the error."
                    },
                    suggestedFix: {
                        type: Type.STRING,
                        description: "A code snippet showing the suggested fix. Use markdown for the code block."
                    }
                }
            },
        },
    });

    const text = response.text;
    if (!text) {
        throw new Error("AI analysis returned an empty response.");
    }
    return JSON.parse(text);
};

// --- SYMPOSIUM ENHANCEMENT FUNCTIONS ---

export const getAssemblyStepResponse = async (
  agent: Agent,
  originalPrompt: string,
  previousStepText: string
): Promise<string> => {
  const localAi = checkApi();
  const systemInstruction = `You are ${agent.name}, a ${agent.role}. Your specific persona is: "${agent.persona}".
You are part of a team of AI agents collaborating on a task.
The original user request was: "${originalPrompt}".

The work done by the previous agent is below:
---
${previousStepText}
---

Your task is to take this text and improve it based on your specific expertise. You can rewrite, add, or delete sections.
Your output must be ONLY the complete, improved text. Do not add any commentary, greetings, or explanations like "Here is the improved version."`;
  
  const result = await localAi.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Based on your expertise, provide the improved and complete text now.',
    config: { systemInstruction },
  });
  return result.text ? result.text.trim() : "";
};

export const getModeratorIntro = async (topic: string, agents: Agent[]): Promise<string> => {
    const localAi = checkApi();
    const agentNames = agents.map(a => a.name).join(' and ');
    const result = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a brief, engaging introductory statement for an AI symposium. The topic is "${topic}". The participants are ${agentNames}. Welcome them and give the floor to ${agents[0].name} to begin.`,
        config: { systemInstruction: "You are a professional and eloquent AI debate moderator." }
    });
    return result.text ? result.text.trim() : "";
}

export const getModeratorInterjection = async (history: ConversationMessage[], topic: string, agents: Agent[]): Promise<string> => {
    const localAi = checkApi();
    const conversation = history.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const result = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `The conversation is about "${topic}". Here is the history so far:\n---\n${conversation}\n---\nYour task is to provide a concise, thought-provoking question or statement to steer the conversation, introduce a new angle, or resolve a potential stall. Keep it under 30 words.`,
        config: { systemInstruction: "You are a professional and eloquent AI debate moderator. You are interjecting to deepen the discussion." }
    });
    return result.text ? result.text.trim() : "";
}

export const getModeratorConclusion = async (history: ConversationMessage[], topic: string, agents: Agent[]): Promise<string> => {
    const localAi = checkApi();
    const conversation = history.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const agentNames = agents.map(a => a.name).join(' and ');
    const result = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `The conversation about "${topic}" between ${agentNames} is now over. Based on the transcript, provide a brief, one-sentence concluding remark to formally end the discussion.\n---\n${conversation}\n---`,
        config: { systemInstruction: "You are a professional and eloquent AI debate moderator." }
    });
    return result.text ? result.text.trim() : "";
}

export const summarizeSymposium = async (history: ConversationMessage[], topic: string, agents: Agent[]): Promise<string> => {
    const localAi = checkApi();
    const conversation = history.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const participantList = agents.map(agent => agent.name).join(' and ');
    const systemInstruction = `You are a highly capable AI analyst. Your task is to review the following conversation transcript and generate a comprehensive summary.
The summary should be well-structured and easy to read. Use markdown for formatting (e.g., headings, bullet points).
It must cover the following sections:
1.  **Key Arguments:** Briefly list the main points or arguments made by each participant (${participantList}).
2.  **Areas of Agreement/Disagreement:** Identify where the participants' views converged and where they diverged.
3.  **Overall Conclusion:** Summarize the final outcome of the discussion. Were any conclusions reached? What questions remain open?`;

    const result = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please summarize this conversation about "${topic}":\n\n${conversation}`,
        config: { systemInstruction }
    });
    return result.text ? result.text.trim() : "Could not generate a summary.";
}


// Utility to check API status from the UI
export const isApiConfigured = (): boolean => {
    return ai !== null;
};