// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
// import * as Localization from "expo-localization";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import en from "../locales/en.json";
// import fr from "../locales/fr.json";
// import hi from "../locales/hi.json";
// import ar from "../locales/ar.json";

// const resources = {
//   en: { translation: en },
//   fr: { translation: fr },
//   hi: { translation: hi },
//   ar: { translation: ar },
// } as const;

// // Determine device locale, fallback to English
// const deviceLocales = Array.isArray(Localization.locales)
//   ? Localization.locales
//   : [Localization.locale];

// const fallbackLng = "en";
// const initialLng = (() => {
//   try {
//     const primary = deviceLocales?.[0];
//     if (!primary) return fallbackLng;
//     // primary.languageCode preferred; else parse from string like "fr-FR"
//     const langCode =
//       (primary as any).languageCode || String(primary).split("-")[0];
//     return resources[langCode as keyof typeof resources]
//       ? langCode
//       : fallbackLng;
//   } catch {
//     return fallbackLng;
//   }
// })();

// i18n.use(initReactI18next).init({
//   compatibilityJSON: "v4",
//   resources,
//   lng: initialLng,
//   fallbackLng,
//   interpolation: {
//     escapeValue: false,
//   },
// });

// const STORAGE_KEY = "app_language";

// export const changeLanguage = async (lng: keyof typeof resources) => {
//   await i18n.changeLanguage(lng);
//   try {
//     await AsyncStorage.setItem(STORAGE_KEY, String(lng));
//   } catch {}
// };

// // Load stored language preference, if any
// (async () => {
//   try {
//     const saved = await AsyncStorage.getItem(STORAGE_KEY);
//     if (saved && (resources as any)[saved]) {
//       await i18n.changeLanguage(saved);
//     }
//   } catch {}
// })();

// export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a key for AsyncStorage
export const STORAGE_KEY = "app_language";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  // No local resources here. They are added dynamically.
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
