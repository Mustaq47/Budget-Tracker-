export type LanguageCode = "eng_Latn" | "hin_Deva" | "tel_Telu";

export interface TranslationProgressEvent {
  status: string;
  name?: string;
  file?: string;
  progress?: number;
}

export type ProgressCallback = (event: TranslationProgressEvent) => void;

class LiveTranslationService {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, { resolve: (val: string) => void, reject: (err: any) => void }> = new Map();
  private inFlightMap: Map<string, Promise<string>> = new Map();
  private progressCallback: ProgressCallback | null = null;
  private messageIdCounter = 0;

  private initWorker() {
    if (typeof window === 'undefined') return;
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/translation.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.addEventListener('message', (event) => {
        const data = event.data;

        if (data.status === 'progress' || data.status === 'init' || data.status === 'download' || data.status === 'done') {
          if (this.progressCallback) {
            this.progressCallback(data as TranslationProgressEvent);
          }
          return;
        }

        const pending = this.pendingRequests.get(data.id);
        if (!pending) return;

        if (data.status === 'complete') {
          pending.resolve(data.result);
        } else if (data.status === 'error') {
          pending.reject(new Error(data.error));
        }

        this.pendingRequests.delete(data.id);
      });
    }
  }

  public setProgressCallback(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  public async translate(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
    if (sourceLang === targetLang) return text;
    
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.inFlightMap.has(cacheKey)) {
      return this.inFlightMap.get(cacheKey)!;
    }

    this.initWorker();

    const promise = new Promise<string>((resolve, reject) => {
      const id = `req_${this.messageIdCounter++}`;
      this.pendingRequests.set(id, { resolve, reject });

      this.worker?.postMessage({
        id,
        text,
        sourceLang,
        targetLang
      });
    }).finally(() => {
      this.inFlightMap.delete(cacheKey);
    });

    this.inFlightMap.set(cacheKey, promise);
    return promise;
  }
}

export const liveTranslationService = new LiveTranslationService();
