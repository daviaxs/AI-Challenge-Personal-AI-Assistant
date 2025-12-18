import { httpClient } from './http-client';
import type { QuizResponse, ValidateAnswerResponse } from '@/shared/types/api';

export class QuizService {
  async generateQuiz(prompt: string, numQuestions?: number): Promise<QuizResponse> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('O tema do quiz não pode estar vazio');
    }

    return httpClient.post<QuizResponse>('/quiz', {
      prompt: prompt.trim(),
      ...(numQuestions && { num_questions: numQuestions }),
    });
  }

  async validateAnswer(questionId: string, answer: string): Promise<ValidateAnswerResponse> {
    if (!questionId || questionId.trim().length === 0) {
      throw new Error('ID da pergunta é obrigatório');
    }

    if (!answer || answer.trim().length === 0) {
      throw new Error('A resposta é obrigatória');
    }

    return httpClient.post<ValidateAnswerResponse>('/quiz/validate', {
      question_id: questionId.trim(),
      answer: answer.trim().toUpperCase(),
    });
  }
}

export const quizService = new QuizService();


