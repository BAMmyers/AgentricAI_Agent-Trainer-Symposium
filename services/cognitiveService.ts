import { Agent } from "../types";
import { distillKnowledge } from "./geminiService";

/**
 * Orchestrates the background process of memory consolidation.
 * It takes the agent's current knowledge, uses an AI to refine it,
 * and returns the new, evolved knowledge base.
 * @param agent The agent whose knowledge needs to be consolidated.
 * @returns A promise that resolves to the new, distilled knowledge base.
 */
export const consolidateKnowledge = async (agent: Agent): Promise<string[]> => {
    if (!agent.knowledgeBase || agent.knowledgeBase.length < 3) {
        // Don't run consolidation on a very small knowledge base to avoid trivial runs.
        return agent.knowledgeBase || [];
    }

    try {
        const distilled = await distillKnowledge(agent.knowledgeBase);
        // Basic validation to ensure the AI didn't return garbage
        if (Array.isArray(distilled) && distilled.every(item => typeof item === 'string') && distilled.length > 0) {
            return distilled;
        }
        console.warn("Knowledge distillation returned a malformed result. Reverting to original knowledge base.");
        return agent.knowledgeBase;
    } catch (error) {
        console.error("Error during knowledge consolidation:", error);
        // In case of error, return the original knowledge base to prevent data loss.
        return agent.knowledgeBase;
    }
};
