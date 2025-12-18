import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';

import en from '@/locales/en.json';
import ptBR from '@/locales/pt-br.json';

export type Language = 'pt-BR' | 'en';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  language: any;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const createLanguageProxy = (translations: any) => {
  return new Proxy(translations, {
    get(target, prop) {
      if (typeof prop === 'string') {
        return getNestedValue(target, prop) || prop;
      }
      return target[prop];
    }
  });
};

const translations = {
  'pt-BR': ptBR,
  'en': en,
};

const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt-BR';
  
  const browserLanguage = navigator.language || navigator.languages?.[0] || 'pt-BR';
  
  if (browserLanguage.startsWith('pt')) {
    return 'pt-BR';
  }
  
  return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || detectBrowserLanguage();
    }
    return 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const currentTranslations = translations[currentLanguage];
  const language = createLanguageProxy(currentTranslations);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    language,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

 