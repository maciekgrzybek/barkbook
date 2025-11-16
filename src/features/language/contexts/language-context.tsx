'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import i18n from '@/lib/i18n';
import { I18nextProvider, useTranslation } from 'react-i18next';

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('pl');
  const { t, i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'pl'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      i18nInstance.changeLanguage(savedLanguage);
    }
  }, [i18nInstance]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18nInstance.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
