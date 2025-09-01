import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // detects browser language
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // default language
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          search: "Search...",
          logout: "Logout",
          profile: "My Profile",
          // Add other keys as needed
        },
      },
      fr: {
        translation: {
          welcome: "Bienvenue",
          search: "Recherche...",
          logout: "Déconnexion",
          profile: "Mon Profil",
        },
      },
      es: {
        translation: {
          welcome: "Bienvenido",
          search: "Buscar...",
          logout: "Cerrar sesión",
          profile: "Mi Perfil",
        },
      },
      de: {
        translation: {
          welcome: "Willkommen",
          search: "Suchen...",
          logout: "Abmelden",
          profile: "Mein Profil",
        },
      },
    },
  });

export default i18n;
