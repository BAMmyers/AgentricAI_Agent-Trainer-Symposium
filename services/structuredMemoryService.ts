
interface MemoryRecord {
    id: string;
    content: string;
    createdAt: string;
}

const MEMORY_PREFIX = 'agent_memory_';

const getMemoryKey = (agentName: string): string => {
    return `${MEMORY_PREFIX}${agentName.replace(/\s+/g, '_').toLowerCase()}`;
};

const readMemory = (agentName: string): MemoryRecord[] => {
    try {
        const memoryJson = localStorage.getItem(getMemoryKey(agentName));
        return memoryJson ? JSON.parse(memoryJson) : [];
    } catch (e) {
        console.error(`Failed to parse memory for ${agentName}:`, e);
        return [];
    }
};

const writeMemory = (agentName: string, memories: MemoryRecord[]): void => {
    localStorage.setItem(getMemoryKey(agentName), JSON.stringify(memories));
};

// All functions are async to simulate a real database and prevent UI blocking if
// this is ever swapped with a more complex solution like IndexedDB or sql.js.

export const getMemoriesForAgent = async (agentName: string): Promise<MemoryRecord[]> => {
    return Promise.resolve(readMemory(agentName));
};

export const addMemoryForAgent = async (agentName: string, content: string): Promise<MemoryRecord> => {
    const memories = readMemory(agentName);
    const newMemory: MemoryRecord = {
        id: Date.now().toString(),
        content,
        createdAt: new Date().toISOString(),
    };
    const updatedMemories = [newMemory, ...memories];
    writeMemory(agentName, updatedMemories);
    return Promise.resolve(newMemory);
};

export const deleteMemoryForAgent = async (agentName: string, memoryId: string): Promise<void> => {
    let memories = readMemory(agentName);
    memories = memories.filter(m => m.id !== memoryId);
    writeMemory(agentName, memories);
    return Promise.resolve();
};

export const clearMemoriesForAgent = async (agentName: string): Promise<void> => {
    writeMemory(agentName, []);
    return Promise.resolve();
};

export const syncMemoriesForAgent = async (agentName: string, contents: string[]): Promise<void> => {
    const existingMemories = readMemory(agentName);
    const contentSet = new Set(contents);

    // Filter out deleted memories
    let syncedMemories = existingMemories.filter(m => contentSet.has(m.content));

    // Add new memories
    const existingContentSet = new Set(syncedMemories.map(m => m.content));
    for (const content of contents) {
        if (!existingContentSet.has(content)) {
            syncedMemories.unshift({
                id: Date.now().toString() + Math.random(), // Add randomness to avoid collision
                content,
                createdAt: new Date().toISOString(),
            });
        }
    }
    
    writeMemory(agentName, syncedMemories);
    return Promise.resolve();
};

export const migrateMemories = async (oldAgentName: string, newAgentName: string): Promise<void> => {
    const oldMemories = readMemory(oldAgentName);
    const newMemories = readMemory(newAgentName);
    
    // Combine, assuming new name might have some memories already
    const combined = [...oldMemories, ...newMemories];
    const uniqueMemories = Array.from(new Map(combined.map(m => [m.content, m])).values());
    
    writeMemory(newAgentName, uniqueMemories);
    localStorage.removeItem(getMemoryKey(oldAgentName)); // Clean up old key
    return Promise.resolve();
};
