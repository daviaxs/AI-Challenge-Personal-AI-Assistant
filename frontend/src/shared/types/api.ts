export interface SummarizeRequest {
  text: string;
  max_length?: number;
}

export interface SummarizeResponse {
  summary: string;
  original_length: number;
  summary_length: number;
}

export interface TranslateRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

export interface TranslateResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

export interface QuizOption {
  letter: string;
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  question_id: string;
  explanation?: string;
}

export interface ValidateAnswerRequest {
  question_id: string;
  answer: string;
}

export interface ValidateAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  explanation?: string;
}

export interface QuizRequest {
  prompt: string;
  num_questions?: number;
}

export interface QuizResponse {
  topic: string;
  questions: QuizQuestion[];
}
