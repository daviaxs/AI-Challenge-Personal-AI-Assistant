import type { QuizResponse, SummarizeResponse, TranslateResponse, ValidateAnswerResponse } from '@/shared/types/api';
import { quizService } from './quiz';
import { summarizerService } from './summarizer';
import { translatorService } from './translator';

class ApiService {
  async summarize(text: string, maxLength?: number): Promise<SummarizeResponse> {
    return summarizerService.summarize(text, maxLength);
  }

  async translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslateResponse> {
    return translatorService.translate(text, targetLanguage, sourceLanguage);
  }

  async generateQuiz(prompt: string, numQuestions?: number): Promise<QuizResponse> {
    return quizService.generateQuiz(prompt, numQuestions);
  }

  async validateAnswer(questionId: string, answer: string): Promise<ValidateAnswerResponse> {
    return quizService.validateAnswer(questionId, answer);
  }
}

export const apiService = new ApiService();
