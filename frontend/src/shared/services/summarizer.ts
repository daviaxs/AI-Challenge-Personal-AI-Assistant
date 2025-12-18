import { httpClient } from './http-client';
import type { SummarizeResponse } from '@/shared/types/api';

export class SummarizerService {
  async summarize(text: string, maxLength?: number): Promise<SummarizeResponse> {
    const trimmedText = text.trim();

    if (!trimmedText || trimmedText.length === 0) {
      throw new Error('O texto não pode estar vazio');
    }

    if (trimmedText.length < 10) {
      throw new Error('O texto precisa ter pelo menos 10 caracteres para ser resumido.');
    }

    return httpClient.post<SummarizeResponse>('/summarize', {
      text: trimmedText,
      ...(maxLength && { max_length: maxLength }),
    });
  }
}

export const summarizerService = new SummarizerService();


