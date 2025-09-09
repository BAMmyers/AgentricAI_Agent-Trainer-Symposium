import { Agent } from "../types";

const HISTORY_KEY = 'agent_history';
const MAX_HISTORY_SIZE = 5;

/**
 * Retrieves the list of recently used agents from localStorage.
 * @returns An array of Agent objects.
 */
export const getAgentHistory = (): Agent[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        if (historyJson) {
            return JSON.parse(historyJson);
        }
    } catch (error) {
        console.error("Failed to parse agent history:", error);
        localStorage.removeItem(HISTORY_KEY); // Clear corrupted data
    }
    return [];
};

/**
 * Adds a new agent to the history, ensuring no duplicates and respecting the size limit.
 * @param newAgent The Agent object to add to the history.
 */
export const addAgentToHistory = (newAgent: Agent): void => {
    if (!newAgent || !newAgent.name) return;

    let history = getAgentHistory();

    // Remove any existing entry with the same name to prevent duplicates
    // and ensure the new one is at the top.
    history = history.filter(agent => agent.name !== newAgent.name);

    // Add the new agent to the beginning of the array
    history.unshift(newAgent);

    // Trim the history to the maximum allowed size
    if (history.length > MAX_HISTORY_SIZE) {
        history = history.slice(0, MAX_HISTORY_SIZE);
    }

    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save agent history:", error);
    }
};

/**
 * Finds an agent in history by its old name and updates it with new data.
 * Handles name changes correctly.
 * @param oldName The original name of the agent to find.
 * @param updatedAgent The new agent object to replace the old one.
 */
export const updateAgentInHistory = (oldName: string, updatedAgent: Agent): void => {
    if (!updatedAgent || !updatedAgent.name) return;
    
    let history = getAgentHistory();
    const agentIndex = history.findIndex(agent => agent.name === oldName);

    if (agentIndex !== -1) {
        // Update the agent in place
        history[agentIndex] = updatedAgent;
    } else {
        // If not found (e.g., loaded but not in history), add it to the front.
        history.unshift(updatedAgent);
    }

    // In case a name change conflicts with another existing agent, de-duplicate, keeping the most recent.
     history = history.filter((agent, index, self) =>
        index === self.findIndex((a) => a.name === agent.name)
    );

    // Ensure history doesn't exceed the max size
    if (history.length > MAX_HISTORY_SIZE) {
        history = history.slice(0, MAX_HISTORY_SIZE);
    }

    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to update agent history:", error);
    }
};
