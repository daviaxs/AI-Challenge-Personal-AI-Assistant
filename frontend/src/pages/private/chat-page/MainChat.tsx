import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useLanguage } from '@/shared/hooks/useLanguage';
import { apiService } from '@/shared/services/api';
import type { SummarizeResponse, TranslateResponse } from '@/shared/types/api';
import '@/styles/markdown.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { motion } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function MainChat() {
  const { language, currentLanguage } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('translator_target_language');
    if (saved) return saved;
    return currentLanguage === 'pt-BR' ? 'en' : 'pt';
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const isSummarizer = location.pathname.includes('/resumidor');
  const isTranslator = location.pathname.includes('/tradutor');

  const languages = [
    { code: 'en', flag: '🇺🇸' },
    { code: 'pt', flag: '🇧🇷' },
    { code: 'es', flag: '🇪🇸' },
    { code: 'fr', flag: '🇫🇷' },
    { code: 'de', flag: '🇩🇪' },
    { code: 'it', flag: '🇮🇹' },
    { code: 'ja', flag: '🇯🇵' },
    { code: 'zh', flag: '🇨🇳' },
    { code: 'ru', flag: '🇷🇺' },
    { code: 'ar', flag: '🇸🇦' },
  ];

  const getLanguageName = (code: string) => {
    return language.mainChat.languages[code as keyof typeof language.mainChat.languages] || code;
  };

  const selectedLanguage = languages.find(lang => lang.code === selectedTargetLanguage) || languages[0];

  useEffect(() => {
    if (selectedTargetLanguage) {
      localStorage.setItem('translator_target_language', selectedTargetLanguage);
    }
  }, [selectedTargetLanguage]);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  }, [location.pathname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable) {
        return;
      }

      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      if (['Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(event.key)) {
        return;
      }

      if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
        textareaRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(Math.max(e.target.scrollHeight, 24), 128) + 'px';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      setIsLoading(true);
      setError(null);

      let responseText: string;

      if (isSummarizer) {
        const response = await apiService.summarize(messageText) as SummarizeResponse;
        responseText = response.summary;
      } else if (isTranslator) {
        const response = await apiService.translate(messageText, selectedTargetLanguage) as TranslateResponse;
        responseText = response.translated_text;
      } else {
        throw new Error('Funcionalidade não identificada');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar requisição');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ChatMessageComponent = ({ message }: { message: Message }) => {
    const isUser = message.sender === 'user';

    return (
      <div className={`mb-6 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-[90%]'} min-w-0`}>
          {isUser ? (
            <div className="bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-600 rounded-2xl p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.text}</p>
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  const WelcomeMessage = useMemo(() => {
    let greetingText = language.mainChat.welcome.titleSummarizer;
    let subtitle = language.mainChat.welcome.subtitleSummarizer || language.mainChat.welcome.subtitle;

    if (isTranslator) {
      greetingText = language.mainChat.welcome.titleTranslator;
      subtitle = language.mainChat.welcome.subtitleTranslator || subtitle;
    }

    return (
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent mb-2">
          {greetingText}
        </h1>
        <p className="text-zinc-400 dark:text-zinc-300 text-base md:text-lg">
          {subtitle}
        </p>
      </div>
    );
  }, [language.mainChat.welcome, isTranslator]);

  const LoadingMessage = () => (
    <div className="mb-6 flex justify-start">
      <div className="max-w-[75%]">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    error ? (
      <div className="mb-6 flex justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            Erro: {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Fechar
          </button>
        </div>
      </div>
    ) : null
  );

  const canSendMessage = !isLoading && inputValue.trim();

  return (
    <div className={`flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 ${isMobile
      ? 'w-full'
      : 'border border-zinc-200 dark:border-zinc-600 rounded-[8px] flex-1 overflow-hidden'
      }`}>
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'px-4' : 'px-8'
        }`}>
        {messages.length === 0 ? (
          <div className="min-h-full flex items-center justify-center">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 px-4 max-w-2xl"
            >
              {WelcomeMessage}
            </motion.div>
          </div>
        ) : (
          <div className={`py-6 w-full ${isMobile ? 'px-0' : 'max-w-4xl mx-auto'}`}>
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            {isLoading && <LoadingMessage />}
            <ErrorMessage />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={`flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 ${isMobile ? 'px-4 pb-2 pt-4' : 'px-8 pb-4 pt-4'
        }`}>
        <div className={`w-full ${isMobile ? '' : 'max-w-5xl mx-auto'}`}>
          <div className="flex flex-col w-full bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-[#30343A] rounded-[16px] shadow-[0_2px_0_0_rgb(228_228_231)] dark:shadow-[0_2px_0_0_#30343A]">
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  isSummarizer
                    ? language.mainChat.input.placeholderSummarizer
                    : isTranslator
                      ? language.mainChat.input.placeholderTranslator
                      : language.mainChat.input.placeholder
                }
                className="w-full min-h-[24px] max-h-[128px] bg-transparent resize-none focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-300 leading-6 custom-scrollbar"
                rows={1}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between px-4 h-12 border-t border-zinc-200 dark:border-zinc-500 border-dashed">
              {isTranslator && (
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <Globe size={16} />
                    <span className="hidden sm:inline">{selectedLanguage.flag} {getLanguageName(selectedLanguage.code)}</span>
                    <span className="sm:hidden">{selectedLanguage.flag}</span>
                    <ChevronDown size={14} className={`transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsLanguageDropdownOpen(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto custom-scrollbar">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setSelectedTargetLanguage(lang.code);
                              setIsLanguageDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors ${
                              selectedTargetLanguage === lang.code
                                ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span>{getLanguageName(lang.code)}</span>
                            {selectedTargetLanguage === lang.code && (
                              <span className="ml-auto text-zinc-500 dark:text-zinc-400">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {!isTranslator && <div />}
              
              <button
                onClick={handleSendMessage}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${canSendMessage
                  ? 'bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-500 dark:hover:bg-zinc-400'
                  : 'bg-zinc-300 dark:bg-zinc-500 opacity-50 cursor-not-allowed'
                  }`}
                disabled={!canSendMessage}
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
  )
}
