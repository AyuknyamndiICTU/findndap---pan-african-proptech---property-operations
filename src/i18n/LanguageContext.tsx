import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setApiLanguage } from '../services/api';
import { en, type Dictionary } from './en';
import { fr } from './fr';

export type Lang = 'en' | 'fr';

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Dot-path of every string in the dictionary, e.g. "navbar.signIn". */
export type TranslationKey = Leaves<Dictionary>;
export type TranslateVars = Record<string, string | number>;
export type TFunction = (key: TranslationKey, vars?: TranslateVars) => string;

const STORAGE_KEY = 'findndap.lang';
const dictionaries: Record<Lang, Dictionary> = { en, fr };
const LOCALES: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR' };

function detectInitialLanguage(): Lang {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {
    // Storage may be unavailable (private mode); fall back to the browser language.
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fr')) return 'fr';
  return 'en';
}

function lookup(dict: Dictionary, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, part)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

/** Translates outside React. Falls back to English, then to the key itself. */
export function translate(lang: Lang, key: TranslationKey | string, vars?: TranslateVars): string {
  const value = lookup(dictionaries[lang], key) ?? lookup(en, key) ?? key;
  return interpolate(value, vars);
}

function applyLanguage(lang: Lang) {
  setApiLanguage(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.title = translate(lang, 'app.documentTitle');
  }
}

// Applied synchronously at module load so the app's very first API requests already carry the language.
const initialLanguage = detectInitialLanguage();
applyLanguage(initialLanguage);

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
  /** Display label for a data value (enum, amenity…) under a dictionary group; falls back to the value itself. */
  label: (group: LabelGroup, value: string) => string;
  locale: string;
}

type GroupKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? never : `${P}${K}` | GroupKeys<T[K], `${P}${K}.`>;
}[keyof T & string];
export type LabelGroup = GroupKeys<Dictionary>;

function labelFor(lang: Lang, group: string, value: string): string {
  return lookup(dictionaries[lang], `${group}.${value}`) ?? lookup(en, `${group}.${value}`) ?? value;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    applyLanguage(initialLanguage);
    return initialLanguage;
  });

  const setLang = useCallback((next: Lang) => {
    // Switch the API language immediately so requests triggered by the same interaction use it.
    applyLanguage(next);
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice lasts for this page only.
    }
  }, []);

  useEffect(() => {
    applyLanguage(lang);
  }, [lang]);

  const t = useCallback<TFunction>((key, vars) => translate(lang, key, vars), [lang]);
  const label = useCallback((group: LabelGroup, value: string) => labelFor(lang, group, value), [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t, label, locale: LOCALES[lang] }),
    [lang, setLang, t, label]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  // Rendered outside a provider: show English rather than crash.
  return {
    lang: 'en',
    setLang: setApiLanguage,
    t: (key, vars) => translate('en', key, vars),
    label: (group, value) => labelFor('en', group, value),
    locale: LOCALES.en
  };
}
