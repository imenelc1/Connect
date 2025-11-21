import { useState, useEffect } from 'react';

const useI18n = () => {
  const [language, setLanguage] = useState('fr');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadTranslations = async (lang) => {
    try {
      let translations;
      if (lang === 'fr') {
        // CHEMIN : depuis la racine src
        translations = await import('./locales/fr-login/fr.json');
      } else {
        // CHEMIN : depuis la racine src
        translations = await import('./locales/en-login/en.json');
      }
      setTranslations(translations.default || translations);
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { language, toggleLanguage, t };
};

export default useI18n;