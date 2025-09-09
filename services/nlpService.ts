
import { pipeline } from '@xenova/transformers';

class NlpService {
  private sentimentPipeline: any = null;
  private intentPipeline: any = null;
  private loadingPromise: Promise<any> | null = null;

  constructor() {
    this.loadingPromise = this.loadModels();
  }

  private async loadModels() {
    try {
      // Load models in parallel for efficiency
      const [sentimentResult, intentResult] = await Promise.allSettled([
        pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', { quantized: true }),
        pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-small', { quantized: true })
      ]);

      if (sentimentResult.status === 'fulfilled') {
        this.sentimentPipeline = sentimentResult.value;
      } else {
        console.error("Failed to load local sentiment model.", sentimentResult.reason);
      }

      if (intentResult.status === 'fulfilled') {
        this.intentPipeline = intentResult.value;
      } else {
        console.error("Failed to load local intent model.", intentResult.reason);
      }

    } catch (e) {
      console.error("An error occurred during model loading.", e);
    }
    this.loadingPromise = null;
  }

  public async ensureLoaded() {
      if (this.loadingPromise) {
          await this.loadingPromise;
      }
  }

  public async analyzeSentiment(text: string): Promise<{ label: string, score: number } | null> {
    if (!this.sentimentPipeline) {
      await this.ensureLoaded();
      if(!this.sentimentPipeline) return null;
    }
    
    try {
        const result = await this.sentimentPipeline(text);
        if (Array.isArray(result) && result.length > 0) return result[0];
        return result as { label: string, score: number };
    } catch (e) {
        console.error("Sentiment analysis failed", e);
        return null;
    }
  }

  public async analyzeIntent(text: string, candidateLabels: string[]): Promise<{ label: string, score: number } | null> {
    if (!this.intentPipeline) {
      await this.ensureLoaded();
      if(!this.intentPipeline) return null;
    }
    
    try {
        const result = await this.intentPipeline(text, candidateLabels, { multi_label: false });
        return { label: result.labels[0], score: result.scores[0] };
    } catch (e) {
        console.error("Intent analysis failed", e);
        return null;
    }
  }
}

export const nlpService = new NlpService();
