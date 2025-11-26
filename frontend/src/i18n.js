import { useEffect, useState } from "react";

// A lightweight global sync using localStorage + custom event.
// Ensures all components toggle instantly without a Provider.

const LANG_KEY = "app_lang";
const EVENT_NAME = "langchange";

function getInitialLang() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === "en" || saved === "fr" ? saved : "fr";
}

const useI18n = () => {
  const [language, setLanguage] = useState(getInitialLang());
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const mod =
          language === "fr"
            ? await import("./locales/fr-quiz/fr.json")
            : await import("./locales/en-quiz/en.json");
        setTranslations(mod.default || mod);
      } catch (e) {
        console.error("Error loading translations:", e);
        setTranslations({});
      }
    };
    load();
  }, [language]);

  // Listen for global lang changes (same page)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail && (e.detail === "fr" || e.detail === "en")) {
        setLanguage(e.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const toggleLanguage = () => {
    const next = language === "fr" ? "en" : "fr";
    localStorage.setItem(LANG_KEY, next);
    // broadcast to all components in this page
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    setLanguage(next);
  };

  const t = (key) => {
    const parts = key.split(".");
    let cur = translations;
    for (const p of parts) cur = cur?.[p];
    return cur ?? key;
  };

  return { language, toggleLanguage, t };
};

export default useI18n;
