import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useLanguage } from '@/shared/hooks/useLanguage';
import { apiService } from '@/shared/services/api';
import type { QuizQuestion as ApiQuizQuestion } from '@/shared/types/api';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface QuizQuestion {
  id: number;
  question: string;
  question_id: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: string;
  explanation?: string;
  isAnswered?: boolean;
}

interface QuizProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

interface MainQuizProps {
  onQuizStateChange?: (state: 'input' | 'quiz' | 'completion', questionTitle?: string) => void;
}

function QuizQuestion({ question, selectedAnswer, onSelectAnswer }: QuizProps) {
  const { language } = useLanguage();
  const hasAnswered = question.isAnswered || false;

  const getOptionStyle = (option: string) => {
    if (!hasAnswered) {
      return "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700";
    }

    if (option === question.correctAnswer) {
      return "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700";
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700";
    }

    return "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 opacity-60";
  };

  const getOptionIcon = (option: string) => {
    if (!hasAnswered) return null;

    if (option === question.correctAnswer) {
      return <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return <XCircle size={20} className="text-red-600 dark:text-red-400" />;
    }

    return null;
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6 max-md:hidden">
        <h3 className="text-2xl font-medium text-zinc-900 dark:text-white leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {Object.entries(question.options).map(([key, value]) => (
          <motion.button
            key={key}
            onClick={() => !hasAnswered && onSelectAnswer(key)}
            disabled={hasAnswered}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${getOptionStyle(key)} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${hasAnswered && key === question.correctAnswer
                ? 'bg-green-500 border-green-500 text-white'
                : hasAnswered && key === selectedAnswer && key !== question.correctAnswer
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                }`}>
                {key}
              </div>
              <span className="text-sm text-zinc-700 dark:text-zinc-200 text-start">
                {value}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function MainQuiz({ onQuizStateChange }: MainQuizProps) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [validatingAnswer, setValidatingAnswer] = useState<Record<number, boolean>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const totalQuestions = quizQuestions.length;

  useEffect(() => {
    const currentState: 'input' | 'quiz' | 'completion' = showCompletion 
      ? 'completion' 
      : showQuiz 
        ? 'quiz' 
        : 'input';
    const questionTitle = currentState === 'quiz' && currentQuestion ? currentQuestion.question : undefined;
    onQuizStateChange?.(currentState, questionTitle);
  }, [showQuiz, showCompletion, currentQuestion, onQuizStateChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (validationError) {
      setValidationError(null);
    }
    
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(Math.max(e.target.scrollHeight, 24), 128) + 'px';
  };

  const convertApiQuizToLocal = (apiQuestions: ApiQuizQuestion[]): QuizQuestion[] => {
    return apiQuestions.map((q, index) => {
      const options: { A: string; B: string; C: string; D: string } = {
        A: '',
        B: '',
        C: '',
        D: '',
      };

      q.options.forEach((opt) => {
        if (opt.letter === 'A') options.A = opt.text;
        if (opt.letter === 'B') options.B = opt.text;
        if (opt.letter === 'C') options.C = opt.text;
        if (opt.letter === 'D') options.D = opt.text;
      });

      return {
        id: index + 1,
        question: q.question,
        question_id: q.question_id,
        options,
        correctAnswer: undefined,
        explanation: undefined,
        isAnswered: false,
      };
    });
  };

  const isValidQuizTopic = (topic: string): { valid: boolean; error?: string } => {
    const trimmed = topic.trim().toLowerCase();
    const charsOnly = trimmed.replace(/\s/g, '');
    
    if (trimmed.length < 10) {
      return { valid: false, error: 'O tema precisa ter pelo menos 10 caracteres para gerar o quiz.' };
    }
    
    const uniqueChars = new Set(charsOnly);
    if (uniqueChars.size <= 2 && charsOnly.length > 5) {
      return { 
        valid: false, 
        error: 'O tema não pode ser apenas caracteres repetidos. Por favor, forneça um tema educativo válido.' 
      };
    }
    
    if (charsOnly.length > 0) {
      const charCounts: Record<string, number> = {};
      for (const char of charsOnly) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      const maxCount = Math.max(...Object.values(charCounts));
      if (maxCount / charsOnly.length > 0.7) {
        return { 
          valid: false, 
          error: 'O tema não pode ser muito repetitivo. Por favor, forneça um tema educativo válido.' 
        };
      }
    }
    
    const alphanumericCount = (trimmed.match(/[a-z0-9]/g) || []).length;
    if (alphanumericCount < trimmed.length * 0.5) {
      return { 
        valid: false, 
        error: 'O tema precisa conter palavras significativas. Por favor, forneça um tema educativo válido.' 
      };
    }
    
    return { valid: true };
  };

  const handleSendMessage = async () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue || isLoading) return;

    const validation = isValidQuizTopic(trimmedValue);
    if (!validation.valid) {
      setValidationError(validation.error || 'Tema inválido');
      return;
    }

    setValidationError(null);
    setIsLoading(true);

    try {
      const response = await apiService.generateQuiz(trimmedValue, 5);
      const convertedQuestions = convertApiQuizToLocal(response.questions);
      
      setQuizQuestions(convertedQuestions);
      setShowQuiz(true);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowCompletion(false);
      setValidationError(null);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Erro ao gerar quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const trimmedValue = inputValue.trim();
      if (trimmedValue.length < 10) {
        setValidationError('O tema precisa ter pelo menos 10 caracteres para gerar o quiz.');
        return;
      }
      
      handleSendMessage();
    }
  };

  const handleSelectAnswer = async (answer: string) => {
    if (!currentQuestion || validatingAnswer[currentQuestion.id]) return;

    setValidatingAnswer(prev => ({ ...prev, [currentQuestion.id]: true }));

    try {
      const validation = await apiService.validateAnswer(currentQuestion.question_id, answer);
      
      setQuizQuestions(prev => prev.map(q => 
        q.id === currentQuestion.id 
          ? { ...q, correctAnswer: validation.correct_answer, explanation: validation.explanation, isAnswered: true }
          : q
      ));

      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answer
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao validar resposta');
    } finally {
      setValidatingAnswer(prev => ({ ...prev, [currentQuestion.id]: false }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowCompletion(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleStartNew = () => {
    setShowQuiz(false);
    setQuizQuestions([]);
    setInputValue('');
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowCompletion(false);
  };

  const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
          {language.mainQuiz.loading.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {language.mainQuiz.loading.subtext}
        </p>
      </div>
    </div>
  );

  if (showQuiz && quizQuestions.length > 0 && !showCompletion) {
    return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-900 ${isMobile
        ? ''
        : 'border border-zinc-200 dark:border-zinc-600 rounded-[8px] flex-1 overflow-hidden'
        }`}
    >
      {/* Quiz content */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className={`min-h-full flex items-center justify-center py-6`}>
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                <QuizQuestion
                  question={currentQuestion}
                  selectedAnswer={selectedAnswers[currentQuestion.id] || null}
                  onSelectAnswer={handleSelectAnswer}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={`flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 ${isMobile ? 'px-4 pb-4 pt-3' : 'px-8 pb-4 pt-4'
        }`}>
        <div className={`flex items-center justify-center gap-3`}>
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className={`flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 h-10 px-4`}
          >
            <ArrowLeft size={14} />
            {language.mainQuiz.navigation.previous}
          </button>

          <div className={`flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg whitespace-nowrap h-10 px-3`}>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {currentIndex + 1}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              de {totalQuestions}
            </span>
          </div>

                <button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestion?.id] || !currentQuestion?.isAnswered}
                  className={`flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 h-10 px-4`}
                >
                  {isLastQuestion ? language.mainQuiz.navigation.finish : language.mainQuiz.navigation.next}
                  <ArrowRight size={14} />
                </button>
        </div>
      </div>
    </motion.div>
    );
  }

  if (!showQuiz && !isLoading) {
    return (
      <div className={`flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-900 ${isMobile
        ? ''
        : 'border border-zinc-200 dark:border-zinc-600 rounded-[8px] flex-1 overflow-hidden'
        }`}>

        <div className={`flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar ${isMobile ? 'px-4' : 'px-8'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col items-center gap-8 w-full ${isMobile ? '' : 'max-w-4xl'}`}
          >
            <div className="text-center w-full">
              <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
                {language.mainQuiz.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3 justify-center text-center w-full">
              {language.mainQuiz.suggestions.map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className={`flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 ${isMobile ? 'px-4 pb-4 pt-2' : 'px-8 pb-4 pt-4'
          }`}>
          <div className={`w-full ${isMobile ? '' : 'max-w-5xl mx-auto'}`}>
            <div className="flex flex-col w-full bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-[#30343A] rounded-[16px] shadow-[0_2px_0_0_rgb(228_228_231)] dark:shadow-[0_2px_0_0_#30343A]">
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={language.mainQuiz.placeholder}
                  className={`w-full min-h-[24px] max-h-[128px] bg-transparent resize-none focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-300 leading-6 custom-scrollbar ${
                    validationError ? 'border border-red-300 dark:border-red-700 rounded-lg' : ''
                  }`}
                  rows={1}
                  disabled={isLoading}
                />
                {validationError && (
                  <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {validationError}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end px-4 h-12 border-t border-zinc-200 dark:border-zinc-500 border-dashed">
                <button
                  onClick={handleSendMessage}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    inputValue.trim().length >= 10 && !isLoading
                      ? 'bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-500 dark:hover:bg-zinc-400'
                      : 'bg-zinc-300 dark:bg-zinc-500 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={inputValue.trim().length < 10 || isLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-900 ${isMobile
        ? ''
        : 'border border-zinc-200 dark:border-zinc-600 rounded-[8px] flex-1 overflow-hidden'
        }`}>
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'px-4' : 'px-8'
          }`}>
          <LoadingScreen />
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className={`flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-900 ${isMobile
        ? ''
        : 'border border-zinc-200 dark:border-zinc-600 rounded-[8px] flex-1 overflow-hidden'
        }`}>
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'px-4' : ''}`}>
          <div className={`min-h-full flex items-center justify-center`}>
            <AnimatePresence mode="wait">
              <motion.div
                key="completion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`w-full ${isMobile ? '' : 'max-w-2xl'}`}
              >
                {/* Completion Card - igual ao flashcard */}
                <div className={`relative w-full mx-auto ${isMobile ? 'h-64' : 'h-80 max-w-lg'}`}>
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-700 shadow-lg p-6 flex flex-col justify-center items-center text-center">
                    <div className={`mx-auto rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center mb-4 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}>
                      <span className={isMobile ? 'text-2xl' : 'text-3xl'}>🎉</span>
                    </div>
                    <h3 className={`font-semibold text-cyan-900 dark:text-cyan-100 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      {language.mainQuiz.completion.title}
                    </h3>
                    <p className={`text-cyan-800 dark:text-cyan-200 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {language.mainQuiz.completion.subtitle}
                    </p>
                    <p className={`text-cyan-600 dark:text-cyan-300 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      {language.mainQuiz.completion.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className={`flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 ${isMobile ? 'px-4 pb-4 pt-3' : 'px-8 pb-4 pt-4'
          }`}>
          <div className={`flex items-center justify-center gap-3`}>
            <button
              onClick={handleStartNew}
              className={`flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors duration-200 h-10 px-4`}
            >
              <RotateCcw size={14} />
              {language.mainQuiz.navigation.newQuiz}
            </button>
          </div>
        </div>
      </div>
    );
  }

}