import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("agritrace_profile_lang") as Language) || "vi";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("agritrace_profile_lang", newLang);
    window.dispatchEvent(new Event("storage_lang_change"));
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = (localStorage.getItem("agritrace_profile_lang") as Language) || "vi";
      setLangState(stored);
    };
    window.addEventListener("storage_lang_change", handleStorage);
    return () => window.removeEventListener("storage_lang_change", handleStorage);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
