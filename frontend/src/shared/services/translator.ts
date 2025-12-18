import { httpClient } from './http-client';
import type { TranslateResponse } from '@/shared/types/api';

export class TranslatorService {
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslateResponse> {
    if (!text || text.trim().length === 0) {
      throw new Error('O texto não pode estar vazio');
    }

    if (!targetLanguage || targetLanguage.trim().length === 0) {
      throw new Error('O idioma de destino é obrigatório');
    }

    return httpClient.post<TranslateResponse>('/translate', {
      text: text.trim(),
      target_language: targetLanguage.trim(),
      ...(sourceLanguage && { source_language: sourceLanguage.trim() }),
    });
  }
}

export const translatorService = new TranslatorService();


