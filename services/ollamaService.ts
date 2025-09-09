
import { OllamaModel, OllamaPullProgress } from '../types';

export const checkStatus = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const listModels = async (url: string): Promise<OllamaModel[]> => {
    try {
        const response = await fetch(`${url}/api/tags`);
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error("Error listing Ollama models:", error);
        throw error;
    }
};

export const generateResponse = async (url: string, model: string, prompt: string): Promise<string> => {
    try {
        const response = await fetch(`${url}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false, // For simplicity, we'll use non-streaming responses
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error("Error generating Ollama response:", error);
        throw error;
    }
};

export async function* generateResponseStream(url: string, model: string, prompt: string): AsyncGenerator<string> {
    try {
        const response = await fetch(`${url}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama API error: ${response.statusText}. Body: ${errorBody}`);
        }
        
        if (!response.body) {
             throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                 if (buffer.length > 0) {
                     try {
                        const parsed = JSON.parse(buffer);
                        if (parsed.response) yield parsed.response;
                    } catch (e) {
                        console.error("Failed to parse final Ollama stream chunk:", buffer, e);
                    }
                }
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last partial line

            for (const line of lines) {
                if (line.trim() === '') continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.response) {
                        yield parsed.response;
                    }
                    if (parsed.done) {
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse Ollama stream line:", line, e);
                }
            }
        }
    } catch (error) {
        console.error("Error generating Ollama streaming response:", error);
        throw error;
    }
}

export async function* pullModelStream(url: string, model: string): AsyncGenerator<OllamaPullProgress> {
    try {
        const response = await fetch(`${url}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model, stream: true }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Ollama API error: ${errorBody.error}`);
        }

        if (!response.body) {
             throw new Error("Response body is null for pull operation");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '') continue;
                try {
                    const progress: OllamaPullProgress = JSON.parse(line);
                    yield progress;
                    if (progress.status === 'success') {
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse Ollama pull stream line:", line, e);
                }
            }
        }
    } catch (error) {
        console.error(`Error pulling Ollama model "${model}":`, error);
        throw error;
    }
}


export const deleteModel = async (url: string, model: string): Promise<void> => {
    try {
        const response = await fetch(`${url}/api/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Ollama API error: ${errorBody.error}`);
        }
    } catch (error) {
        console.error(`Error deleting Ollama model "${model}":`, error);
        throw error;
    }
};