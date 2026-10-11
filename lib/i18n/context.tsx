"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, TRANSLATIONS, Translations } from "./translations";
import {
  getReadingSession,
  saveLocale as persistSessionLocale,
} from "@/lib/storage/reading-session";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
}

const LOCAL_STORAGE_LOCALE_KEY = "tarot_preferred_locale";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value: LanguageContextType = {
    locale: "en",
    setLocale: () => {},
    toggleLocale: () => {},
    t: TRANSLATIONS.en,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: TRANSLATIONS.en,
    };
  }
  return context;
}
