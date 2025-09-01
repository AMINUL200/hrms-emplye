import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en/translation.json';
import es from '../locales/es/translations.json';
import fr from '../locales/fr/translation.json';
import de from '../locales/de/translations.json';


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            es: { translation: es },
            de: { translation: de },
        },
    });

export default i18n;