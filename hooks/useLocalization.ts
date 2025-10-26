
import { useContext } from 'react';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { translations } from '../data/localization';
import { LocalizedString } from '../types';

export const useLocalization = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useLocalization must be used within an AppProvider');
  }

  // Fix: Destructure `setLanguage` from context.
  const { language, setLanguage } = context;

  // Fix: Update 't' function to handle placeholder replacements.
  const t = (key: keyof typeof translations['en'], replacements?: Record<string, string | number>) => {
    let translation = translations[language][key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }
    return translation;
  };
  
  const getLocalized = (field: LocalizedString | null | undefined) => {
    if (!field) {
      return ''; // Return empty string if the whole field is missing to prevent crashes.
    }
    // Return the translation for the current language, or fall back to English,
    // or finally return an empty string if even English is missing.
    return field[language] || field.en || '';
  }

  // Fix: Return `setLanguage` so components using this hook can change the language.
  return { t, language, getLocalized, setLanguage };
};
