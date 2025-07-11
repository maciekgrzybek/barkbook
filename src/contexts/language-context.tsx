'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (
    key: TranslationKey,
    options?: Record<string, string | number>
  ): string => {
    let translation = translations[language][key] || translations['en'][key];
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        translation = translation.replace(`{${key}}`, String(value));
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
