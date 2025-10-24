// import { useState, useEffect } from "react";
// import useSWR from "swr";
// import i18n, { STORAGE_KEY } from "./index";
// import * as Localization from "expo-localization";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // The base URL for your translation files
// const TRANSLATION_BASE_URL = "https://commonw.s3.ap-south-1.amazonaws.com/";

// const translationFetcher = async (key: string) => {
//   const url = `${TRANSLATION_BASE_URL}${key}.json`;
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error("Failed to fetch translations");
//   }
//   return response.json();
// };

// // Define the supported languages
// const supportedLanguages = ["en", "fr", "hi", "ar"];

// export const useLanguageManager = () => {
//   const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

//   useEffect(() => {
//     const loadInitialLanguage = async () => {
//       try {
//         const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
//         const deviceLocale = Localization.locale;
//         const deviceLang = deviceLocale ? deviceLocale.split("-")[0] : "en"; // Use 'en' as a safe default

//         if (savedLang) {
//           // Priority 1: Use the language saved by the user
//           setCurrentLanguage(savedLang);
//         } else if (supportedLanguages.includes(deviceLang)) {
//           // Priority 2: Use the device's language if it's supported
//           setCurrentLanguage(deviceLang);
//         } else {
//           // Priority 3: Default to English
//           setCurrentLanguage("en");
//         }
//       } catch (e) {
//         console.error("Failed to load initial language:", e);
//         setCurrentLanguage("en");
//       }
//     };
//     loadInitialLanguage();
//   }, []);

//   const { data, error, isLoading } = useSWR(
//     currentLanguage,
//     translationFetcher
//   );

//   useEffect(() => {
//     if (data && currentLanguage) {
//       i18n.addResourceBundle(currentLanguage, "translation", data, true, true);
//       i18n.changeLanguage(currentLanguage);
//     }
//   }, [data, currentLanguage]);

//   const changeLanguage = async (lng: string) => {
//     await AsyncStorage.setItem(STORAGE_KEY, lng);
//     setCurrentLanguage(lng);
//   };

//   return { isLoading, error, changeLanguage, currentLanguage };
// };

// i18n / useLanguageManager.tsx; ---------------------------------------------------------------------------------------------

// import { useState, useEffect } from "react";
// import useSWR from "swr";
// import i18n, { STORAGE_KEY } from "./index";
// import * as Localization from "expo-localization";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { I18nManager } from "react-native";

// const TRANSLATION_BASE_URL = "https://commonw.s3.ap-south-1.amazonaws.com/";

// const translationFetcher = async (key: string) => {
//   const url = `${TRANSLATION_BASE_URL}${key}.json`;
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error("Failed to fetch translations");
//   }
//   return response.json();
// };

// const supportedLanguages = ["en", "fr", "hi", "ar"];
// // Define which languages are RTL
// const rtlLanguages = ["ar"];

// export const useLanguageManager = () => {
//   const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

//   useEffect(() => {
//     const loadInitialLanguage = async () => {
//       try {
//         const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
//         const deviceLocale = Localization.locale;
//         const deviceLang = deviceLocale ? deviceLocale.split("-")[0] : "en";

//         let finalLanguage = "en";

//         if (savedLang) {
//           finalLanguage = savedLang;
//         } else if (supportedLanguages.includes(deviceLang)) {
//           finalLanguage = deviceLang;
//         }

//         // --- Core RTL Logic ---
//         const isRtl = rtlLanguages.includes(finalLanguage);
//         if (I18nManager.isRTL !== isRtl) {
//           I18nManager.allowRTL(isRtl);
//           I18nManager.forceRTL(isRtl);
//           // Restart the app to apply the new layout direction
//           // This is a requirement for I18nManager changes to take effect
//           // This might be a platform-specific restart or a complete app reload
//           // For Expo, a simple reload is often sufficient
//           // You may need to handle this more gracefully depending on your app's navigation
//           // This part is crucial and requires a full app reload
//         }

//         setCurrentLanguage(finalLanguage);
//       } catch (e) {
//         console.error("Failed to load initial language:", e);
//         setCurrentLanguage("en");
//       }
//     };
//     loadInitialLanguage();
//   }, []);

//   const { data, error, isLoading } = useSWR(
//     currentLanguage,
//     translationFetcher
//   );

//   useEffect(() => {
//     if (data && currentLanguage) {
//       i18n.addResourceBundle(currentLanguage, "translation", data, true, true);
//       i18n.changeLanguage(currentLanguage);
//     }
//   }, [data, currentLanguage]);

//   const changeLanguage = async (lng: string) => {
//     await AsyncStorage.setItem(STORAGE_KEY, lng);
//     // --- Core RTL Logic when changing language manually ---
//     const isRtl = rtlLanguages.includes(lng);
//     if (I18nManager.isRTL !== isRtl) {
//       I18nManager.allowRTL(isRtl);
//       I18nManager.forceRTL(isRtl);
//       // Restart the app
//       // This is necessary for a language change to apply RTL properly
//     }
//     setCurrentLanguage(lng);
//   };

//   return { isLoading, error, changeLanguage, currentLanguage };
// };

//-------------------------------------------------------------------------------------------

// i18n/useLanguageManager.tsx

import { useState, useEffect } from "react";
import useSWR from "swr";
import i18n, { STORAGE_KEY } from "./index";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager, Alert } from "react-native";
import * as Updates from "expo-updates";

const TRANSLATION_BASE_URL = "https://commonw.s3.ap-south-1.amazonaws.com/";

const translationFetcher = async (key: string) => {
  const url = `${TRANSLATION_BASE_URL}${key}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch translations");
  }
  return response.json();
};

const supportedLanguages = ["en", "fr", "hi", "ar"];
const rtlLanguages = ["ar"];

export const useLanguageManager = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
        const deviceLocale = Localization.locale;
        const deviceLang = deviceLocale ? deviceLocale.split("-")[0] : "en";
        let finalLanguage = "en";

        if (savedLang) {
          finalLanguage = savedLang;
        } else if (supportedLanguages.includes(deviceLang)) {
          finalLanguage = deviceLang;
        }

        const isRtl = rtlLanguages.includes(finalLanguage);
        if (I18nManager.isRTL !== isRtl) {
          I18nManager.allowRTL(isRtl);
          I18nManager.forceRTL(isRtl);
        }

        setCurrentLanguage(finalLanguage);
      } catch (e) {
        console.error("Failed to load initial language:", e);
        setCurrentLanguage("en");
      }
    };
    loadInitialLanguage();
  }, []);

  const { data, error, isLoading } = useSWR(
    currentLanguage,
    translationFetcher
  );

  useEffect(() => {
    if (data && currentLanguage) {
      i18n.addResourceBundle(currentLanguage, "translation", data, true, true);
      i18n.changeLanguage(currentLanguage);
    }
  }, [data, currentLanguage]);

  const changeLanguage = async (lng: string) => {
    const isRtl = rtlLanguages.includes(lng);
    const requiresReload = I18nManager.isRTL !== isRtl;

    await AsyncStorage.setItem(STORAGE_KEY, lng);

    if (requiresReload) {
      // Prompt the user to restart the app
      Alert.alert(
        // "Restart Required",
        // "We need to restart the app to apply your language choice.",
        i18n.t("restart_required_title"),
        i18n.t("restart_required_message"),
        [
          {
            // text: "Restart Now",
            text: i18n.t("restart_button"),
            onPress: async () => {
              // Set the new RTL state before reloading
              I18nManager.allowRTL(isRtl);
              I18nManager.forceRTL(isRtl);
              await Updates.reloadAsync();
            },
          },
          {
            // text: "Cancel",
            text: i18n.t("cancel_button"),
            onPress: async () => {
              const originalLanguage = I18nManager.isRTL ? "ar" : "en";
              await AsyncStorage.setItem(STORAGE_KEY, currentLanguage!);
              setCurrentLanguage(currentLanguage);
            },
            style: "cancel",
          },
        ]
      );
    } else {
      // If no RTL change is needed, update immediately without a reload
      setCurrentLanguage(lng);
    }
  };

  return { isLoading, error, changeLanguage, currentLanguage };
};
