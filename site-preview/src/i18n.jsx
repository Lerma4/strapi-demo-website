import { createContext, useContext, useMemo } from 'react';
import {
  UI_DEFAULT_LOCALE,
  getFallbackExperience,
  getLocaleFlag,
  normaliseLocaleCode,
  resolveUiLocale,
} from './demoContent';

export const LOCALE_STORAGE_KEY = 'site-preview-locale';

const PreviewI18nContext = createContext(null);
const popularLocaleOrder = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ar', 'ru'];

export function readRequestedLocale() {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  return params.get('lang') || params.get('locale') || window.localStorage.getItem(LOCALE_STORAGE_KEY);
}

export function resolveInstalledLocale(requestedLocale, locales = []) {
  if (!Array.isArray(locales) || locales.length === 0) {
    return requestedLocale || UI_DEFAULT_LOCALE;
  }

  const requested = normaliseLocaleCode(requestedLocale);
  const exactMatch = locales.find((locale) => normaliseLocaleCode(locale.code) === requested);

  if (exactMatch) {
    return exactMatch.code;
  }

  const requestedLanguage = requested.split('-')[0];

  if (requestedLanguage) {
    const languageMatch = locales.find(
      (locale) => normaliseLocaleCode(locale.code).split('-')[0] === requestedLanguage
    );

    if (languageMatch) {
      return languageMatch.code;
    }
  }

  return locales.find((locale) => locale.isDefault)?.code || locales[0].code;
}

export function PreviewI18nProvider({ children, locale, locales, setLocale }) {
  const copy = useMemo(() => getFallbackExperience(locale), [locale]);

  const hydratedLocales = useMemo(
    () =>
      [...locales]
        .map((item) => ({
          ...item,
          flag: getLocaleFlag(item.code),
          uiLocale: resolveUiLocale(item.code),
        }))
        .sort((left, right) => {
          const leftLanguage = normaliseLocaleCode(left.code).split('-')[0];
          const rightLanguage = normaliseLocaleCode(right.code).split('-')[0];
          const leftPriority = popularLocaleOrder.indexOf(leftLanguage);
          const rightPriority = popularLocaleOrder.indexOf(rightLanguage);

          if (left.isDefault !== right.isDefault) {
            return left.isDefault ? -1 : 1;
          }

          if (leftPriority !== rightPriority) {
            if (leftPriority === -1) return 1;
            if (rightPriority === -1) return -1;
            return leftPriority - rightPriority;
          }

          return left.name.localeCompare(right.name);
        }),
    [locales]
  );

  const value = useMemo(
    () => ({
      copy,
      locale,
      locales: hydratedLocales,
      setLocale,
      uiLocale: resolveUiLocale(locale),
    }),
    [copy, hydratedLocales, locale, setLocale]
  );

  return <PreviewI18nContext.Provider value={value}>{children}</PreviewI18nContext.Provider>;
}

export function usePreviewI18n() {
  const context = useContext(PreviewI18nContext);

  if (!context) {
    throw new Error('usePreviewI18n must be used within PreviewI18nProvider');
  }

  return context;
}
