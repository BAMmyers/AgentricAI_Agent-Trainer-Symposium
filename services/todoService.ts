import { TodoItem } from "../types";

const TODO_PREFIX = 'agent_todos_';

const getTodoKey = (agentName: string): string => {
    return `${TODO_PREFIX}${agentName.replace(/\s+/g, '_').toLowerCase()}`;
};

export const getTodosForAgent = (agentName: string): TodoItem[] => {
    try {
        const todosJson = localStorage.getItem(getTodoKey(agentName));
        return todosJson ? JSON.parse(todosJson) : [];
    } catch (error) {
        console.error(`Failed to parse todos for ${agentName}:`, error);
        localStorage.removeItem(getTodoKey(agentName));
        return [];
    }
};

export const saveTodosForAgent = (agentName: string, todos: TodoItem[]): void => {
    try {
        localStorage.setItem(getTodoKey(agentName), JSON.stringify(todos));
    } catch (error) {
        console.error(`Failed to save todos for ${agentName}:`, error);
    }
};
