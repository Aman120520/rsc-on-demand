import { TFunction } from "react-i18next";
import i18n from "@/src/i18n";

// Utility function for robust translations with fallbacks
export const getRobustTranslation = (
  t: TFunction,
  key: string,
  fallbackTranslations: { [key: string]: string }
) => {
  const currentLang = i18n.language;

  // Try JSON translation first
  const jsonTranslation = t(key);
  if (jsonTranslation !== key) {
    return jsonTranslation;
  }

  // Fallback to hardcoded translations
  return fallbackTranslations[currentLang] || fallbackTranslations.en || key;
};

// Specific translation functions for common keys
export const getFAQsTranslation = (t: TFunction) => {
  const fallbackTranslations = {
    en: "FAQs",
    fr: "FAQs",
    hi: "FAQs",
    ar: "الأسئلة الشائعة",
  };

  return getRobustTranslation(t, "refs.FAQs", fallbackTranslations);
};

export const getContactUsTranslation = (t: TFunction, key: string) => {
  const fallbackTranslations = {
    en: {
      "contact_us.enter_concern": "Please enter your concerns.",
      "contact_us.enter_concern_type": "Please enter your concerns type.",
    },
    fr: {
      "contact_us.enter_concern": "Veuillez entrer vos préoccupations.",
      "contact_us.enter_concern_type":
        "Veuillez entrer le type de vos préoccupations.",
    },
    hi: {
      "contact_us.enter_concern": "कृपया अपने परेशानियों को दर्ज करें।",
      "contact_us.enter_concern_type":
        "कृपया अपने परेशानियों का प्रकार दर्ज करें।",
    },
    ar: {
      "contact_us.enter_concern": "يرجى إدخال ملاحظاتك.",
      "contact_us.enter_concern_type": "يرجى إدخال نوع ملاحظاتك.",
    },
  };

  const currentLang = i18n.language;
  const langTranslations =
    fallbackTranslations[currentLang] || fallbackTranslations.en;
  return langTranslations[key] || t(key);
};

export const getCalendarTranslation = (
  t: TFunction,
  type: "day" | "month",
  value: string
) => {
  const dayTranslations = {
    en: {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    },
    fr: {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mer",
      thursday: "Jeu",
      friday: "Ven",
      saturday: "Sam",
      sunday: "Dim",
    },
    hi: {
      monday: "सोम",
      tuesday: "मंगल",
      wednesday: "बुध",
      thursday: "गुरु",
      friday: "शुक्र",
      saturday: "शनि",
      sunday: "रवि",
    },
    ar: {
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد",
    },
  };

  const monthTranslations = {
    en: {
      january: "Jan",
      february: "Feb",
      march: "Mar",
      april: "Apr",
      may: "May",
      june: "Jun",
      july: "Jul",
      august: "Aug",
      september: "Sep",
      october: "Oct",
      november: "Nov",
      december: "Dec",
    },
    fr: {
      january: "Jan",
      february: "Fév",
      march: "Mar",
      april: "Avr",
      may: "Mai",
      june: "Juin",
      july: "Juil",
      august: "Août",
      september: "Sep",
      october: "Oct",
      november: "Nov",
      december: "Déc",
    },
    hi: {
      january: "जन",
      february: "फर",
      march: "मार्च",
      april: "अप्रैल",
      may: "मई",
      june: "जून",
      july: "जुलाई",
      august: "अगस्त",
      september: "सितंबर",
      october: "अक्टूबर",
      november: "नवंबर",
      december: "दिसंबर",
    },
    ar: {
      january: "يناير",
      february: "فبراير",
      march: "مارس",
      april: "أبريل",
      may: "مايو",
      june: "يونيو",
      july: "يوليو",
      august: "أغسطس",
      september: "سبتمبر",
      october: "أكتوبر",
      november: "نوفمبر",
      december: "ديسمبر",
    },
  };

  const currentLang = i18n.language;
  const translations = type === "day" ? dayTranslations : monthTranslations;
  const langTranslations = translations[currentLang] || translations.en;

  return langTranslations[value] || value;
};
