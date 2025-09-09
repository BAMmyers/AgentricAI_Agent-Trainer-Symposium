

import { Agent } from '../types';

/**
 * Validates and normalizes an agent object from any source.
 * It provides sensible defaults for missing fields to prevent runtime errors.
 * @param agentData The raw object loaded from JSON.
 * @returns A fully formed, safe-to-use Agent object.
 */
export const normalizeAgent = (agentData: any): Agent => {
  const defaults: Agent = {
    name: 'Unnamed Agent',
    role: 'General Assistant',
    description: 'No description provided.',
    persona: 'A helpful AI assistant.',
    metadata: {
      version: '1.0.0',
      author: 'Unknown Author',
      avatar: {
        static: `https://i.pravatar.cc/150?u=${agentData?.name || 'Unnamed Agent'}`,
        animated_idle: '',
        animated_talking: '',
      },
      avatarConfig: {
        genderPresentation: 'Androgynous',
        skinTone: 'Porcelain',
        bodyType: 'Slender',
        ageRange: 'Young Adult (20s)',
        hairStyle: 'Holographic Projection',
        facialExpression: 'Neutral & Calm',
        outfit: 'Sleek Jumpsuit',
        setting: 'Minimalist White Room',
      }
    },
    capabilities: ['chat'],
    knowledgeBase: [],
  };

  if (!agentData || typeof agentData !== 'object') {
    return defaults;
  }

  const normalized: Agent = {
    ...defaults,
    name: typeof agentData.name === 'string' ? agentData.name : defaults.name,
    role: typeof agentData.role === 'string' ? agentData.role : defaults.role,
    description: typeof agentData.description === 'string' ? agentData.description : defaults.description,
    persona: typeof agentData.persona === 'string' ? agentData.persona : defaults.persona,
    capabilities: Array.isArray(agentData.capabilities) && agentData.capabilities.length > 0 ? agentData.capabilities : defaults.capabilities,
    knowledgeBase: Array.isArray(agentData.knowledgeBase) ? agentData.knowledgeBase : defaults.knowledgeBase,
    metadata: {
      ...defaults.metadata,
      ...agentData.metadata,
      avatar: {
        ...defaults.metadata.avatar,
        ...(agentData.metadata?.avatar || {}),
      },
      avatarConfig: {
        ...defaults.metadata.avatarConfig,
        ...(agentData.metadata?.avatarConfig || {}),
      }
    },
  };

  // Ensure default static avatar uses the correct final name
  if (!normalized.metadata.avatar.static) {
      normalized.metadata.avatar.static = `https://i.pravatar.cc/150?u=${normalized.name}`;
  }

  return normalized;
};


const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
const tokenize = (text: string): string[] => {
    if (typeof text !== 'string') return [];
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word && !stopWords.has(word));
};

const calculateIdf = (corpusTokens: string[][]): Map<string, number> => {
    const idf = new Map<string, number>();
    const docCount = corpusTokens.length;
    const termDocFreq = new Map<string, number>();

    corpusTokens.forEach(docTokens => {
        const uniqueTokens = new Set(docTokens);
        uniqueTokens.forEach(token => {
            termDocFreq.set(token, (termDocFreq.get(token) || 0) + 1);
        });
    });

    termDocFreq.forEach((freq, term) => {
        idf.set(term, Math.log(docCount / (1 + freq)));
    });

    return idf;
};

const createVector = (tokens: string[], idf: Map<string, number>, vocab: string[]): number[] => {
    const vector = new Array(vocab.length).fill(0);
    const tf = new Map<string, number>();
    tokens.forEach(token => tf.set(token, (tf.get(token) || 0) + 1));
    
    tf.forEach((count, term) => {
        const termIndex = vocab.indexOf(term);
        if (termIndex > -1) {
            const termIdf = idf.get(term) || 0;
            vector[termIndex] = (count / tokens.length) * termIdf;
        }
    });
    return vector;
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return (magA === 0 || magB === 0) ? 0 : dotProduct / (magA * magB);
};


/**
 * Finds the most relevant piece of knowledge using TF-IDF and Cosine Similarity.
 * @param query The user's input string.
 * @param knowledgeBase The agent's list of memories.
 * @param threshold The minimum relevance score required to consider a match.
 * @returns An object with the best matching string (or null) and its score.
 */
export const findRelevantMemory = (
  query: string,
  knowledgeBase: string[],
  threshold: number = 0.15
): { bestMatch: string | null; bestScore: number } => {
    if (knowledgeBase.length === 0) return { bestMatch: null, bestScore: 0 };

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return { bestMatch: null, bestScore: 0 };

    const corpusTokens = knowledgeBase.map(doc => tokenize(doc));
    
    const idf = calculateIdf([...corpusTokens, queryTokens]);
    const vocab = Array.from(idf.keys());
    
    const queryVector = createVector(queryTokens, idf, vocab);
    const docVectors = corpusTokens.map(docTokens => createVector(docTokens, idf, vocab));
    
    let bestMatch: string | null = null;
    let bestScore = -1;

    docVectors.forEach((docVector, index) => {
        const score = cosineSimilarity(queryVector, docVector);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = knowledgeBase[index];
        }
    });

    if (bestScore >= threshold) {
        return { bestMatch, bestScore };
    }

    return { bestMatch: null, bestScore: bestScore };
};

/**
 * Finds the top N most relevant memories from the knowledge base.
 * @param query The user's input string.
 * @param knowledgeBase The agent's list of memories.
 * @param threshold The minimum relevance score to be included.
 * @param count The maximum number of memories to return.
 * @returns An array of the most relevant memory strings.
 */
export const findTopRelevantMemories = (
  query: string,
  knowledgeBase: string[],
  threshold: number = 0.1,
  count: number = 3
): string[] => {
    if (knowledgeBase.length === 0) return [];
    
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const corpusTokens = knowledgeBase.map(doc => tokenize(doc));
    const idf = calculateIdf([...corpusTokens, queryTokens]);
    const vocab = Array.from(idf.keys());
    
    const queryVector = createVector(queryTokens, idf, vocab);
    
    const scoredDocs = knowledgeBase.map((doc, index) => {
        const docTokens = corpusTokens[index];
        const docVector = createVector(docTokens, idf, vocab);
        return {
            doc,
            score: cosineSimilarity(queryVector, docVector)
        };
    });

    return scoredDocs
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map(item => item.doc);
};
