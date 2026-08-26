import { pipeline, env, TranslationPipeline } from '@xenova/transformers';

// Skip local model checks, use HuggingFace Hub
env.allowLocalModels = false;

class TranslationPipelineSingleton {
  static task: 'translation' = 'translation';
  static model = 'Xenova/nllb-200-distilled-600M'; // Multilingual translation model
  static instance: Promise<TranslationPipeline> | null = null;

  static async getInstance(progress_callback?: (x: any) => void): Promise<TranslationPipeline> {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback }) as Promise<TranslationPipeline>;
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event: MessageEvent) => {
  const { text, sourceLang, targetLang, id } = event.data;
  
  if (!text) {
    self.postMessage({ id, status: 'error', error: 'No text provided' });
    return;
  }

  try {
    const translator = await TranslationPipelineSingleton.getInstance((x) => {
      self.postMessage({ status: 'progress', data: x });
    });

    const output = await translator(text, {
      src_lang: sourceLang, 
      tgt_lang: targetLang
    } as any);

    self.postMessage({
      id,
      status: 'complete',
      result: (output as any)[0].translation_text
    });
  } catch (error: any) {
    self.postMessage({ id, status: 'error', error: error.message });
  }
});
