import config from "@/config";
import getSymbolFromCurrency from "currency-symbol-map";
import { Alert, Platform } from "react-native";
import Share from "react-native-share";
import defaultClient from "../lib/qdc-api";
import { useUser } from "../context/UserProvider";
import { useStore } from "../context/StoreProvider";
import { router } from "expo-router";
import i18n from "../i18n";

// Global translation function that can be used outside React components
let globalTranslate: ((key: string) => string) | null = null;

// Function to set the global translate function
export const setGlobalTranslate = (translateFn: (key: string) => string) => {
  globalTranslate = translateFn;
};

// Test function to verify translation is working (for development only)
export const testToastTranslation = () => {
  const testMessage =
    "You may have cancelled the payment or there was a delay in response from the UPI app";
  showToast(testMessage);
};

// Test function for express service message
export const testExpressServiceTranslation = () => {
  const testMessage =
    "Express service request cannot be accepted due to unavailability of drop off slot";
  showToast(testMessage);
};

// Static translations for backend messages (when JSON files can't be updated)
const staticTranslations: { [key: string]: { [language: string]: string } } = {
  "static_messages.upi_payment_cancelled_or_delay": {
    en: "You may have cancelled the payment or there was a delay in response from the UPI app",
    fr: "Vous avez peut-être annulé le paiement ou il y a eu un retard de réponse de l'application UPI",
    hi: "संभव है कि आपने भुगतान रद्द कर दिया हो या UPI ऐप से प्रतिक्रिया में देरी हुई हो।",
    ar: "ربما ألغيت عملية الدفع أو حدث تأخير في الاستجابة من تطبيق UPI",
  },
  "static_messages.express_service_unavailable": {
    en: "Express service request cannot be accepted due to unavailability of drop off slot",
    fr: "La demande de service express ne peut pas être acceptée en raison de l'indisponibilité d'un créneau de dépôt.",
    hi: "ड्रॉप-ऑफ स्लॉट उपलब्ध न होने के कारण एक्सप्रेस सेवा का अनुरोध स्वीकार नहीं किया जा सकता।",
    ar: "لا يمكن قبول طلب الخدمة السريعة بسبب عدم توفر موعد تسليم.",
  },
  "static_messages.payment_processing_cancelled_by_user": {
    en: "Payment processing cancelled by user",
    fr: "Traitement du paiement annulé par l'utilisateur",
    hi: "उपयोगकर्ता द्वारा भुगतान प्रक्रिया रद्द कर दी गई",
    ar: "تم إلغاء معالجة الدفع من قبل المستخدم",
  },
  // Stripe error messages
  "static_messages.stripe_payment_cancelled": {
    en: "Payment was cancelled",
    fr: "Le paiement a été annulé",
    hi: "भुगतान रद्द कर दिया गया",
    ar: "تم إلغاء الدفع",
  },
  "static_messages.stripe_payment_failed": {
    en: "Payment failed. Please try again",
    fr: "Le paiement a échoué. Veuillez réessayer",
    hi: "भुगतान विफल। कृपया पुनः प्रयास करें",
    ar: "فشل الدفع. يرجى المحاولة مرة أخرى",
  },
  "static_messages.stripe_card_declined": {
    en: "Your card was declined",
    fr: "Votre carte a été refusée",
    hi: "आपका कार्ड अस्वीकृत कर दिया गया",
    ar: "تم رفض بطاقتك",
  },
  "static_messages.stripe_insufficient_funds": {
    en: "Insufficient funds",
    fr: "Fonds insuffisants",
    hi: "अपर्याप्त धन",
    ar: "أموال غير كافية",
  },
  "static_messages.stripe_expired_card": {
    en: "Your card has expired",
    fr: "Votre carte a expiré",
    hi: "आपका कार्ड समाप्त हो गया है",
    ar: "انتهت صلاحية بطاقتك",
  },
  "static_messages.stripe_incorrect_cvc": {
    en: "Your card's security code is incorrect",
    fr: "Le code de sécurité de votre carte est incorrect",
    hi: "आपके कार्ड का सुरक्षा कोड गलत है",
    ar: "رمز الأمان لبطاقتك غير صحيح",
  },
  "static_messages.stripe_processing_error": {
    en: "An error occurred while processing your card",
    fr: "Une erreur s'est produite lors du traitement de votre carte",
    hi: "आपके कार्ड को प्रोसेस करते समय त्रुटि हुई",
    ar: "حدث خطأ أثناء معالجة بطاقتك",
  },
};

// Function to translate backend messages
const translateBackendMessage = (message: string): string => {
  // Log all incoming messages to capture new error messages
  console.log("🔍 BACKEND MESSAGE RECEIVED:");
  console.log("Original message:", message);
  console.log("Message length:", message.length);
  console.log("Message type:", typeof message);
  console.log("Current language:", i18n.language);
  console.log("=====================================");

  // Handle undefined message case
  if (
    message === "undefined" ||
    message === undefined ||
    !message ||
    message.trim() === ""
  ) {
    console.log("⚠️ Undefined message detected, using default error message");
    const currentLanguage = i18n.language || "en";

    const defaultErrorMessages: { [key: string]: string } = {
      en: "Payment failed. Please try again.",
      ar: "فشل الدفع. يرجى المحاولة مرة أخرى.",
      fr: "Le paiement a échoué. Veuillez réessayer.",
      hi: "भुगतान विफल। कृपया पुनः प्रयास करें।",
    };

    const defaultMessage =
      defaultErrorMessages[currentLanguage] || defaultErrorMessages.en;
    console.log("📤 Using default error message:", defaultMessage);
    return defaultMessage;
  }

  // Map of known backend messages to translation keys
  const messageMap: { [key: string]: string } = {
    "You may have cancelled the payment or there was a delay in response from the UPI app":
      "static_messages.upi_payment_cancelled_or_delay",
    "Express service request cannot be accepted due to unavailability of drop off slot":
      "static_messages.express_service_unavailable",
    "Payment processing cancelled by user":
      "static_messages.payment_processing_cancelled_by_user",
    // Add more backend messages here as needed
  };

  // Check if the message matches any known backend message
  let translationKey = messageMap[message];

  // Log translation key found
  console.log("🔑 Translation key found:", translationKey);

  // If exact match not found, try partial matching for express service message
  if (
    !translationKey &&
    message.includes("Express service request cannot be accepted")
  ) {
    translationKey = "static_messages.express_service_unavailable";
    console.log("🔍 Partial match found for express service:", translationKey);
  }

  if (translationKey) {
    try {
      // First try static translations
      if (staticTranslations[translationKey]) {
        const currentLanguage = i18n.language || "en";
        const staticTranslation =
          staticTranslations[translationKey][currentLanguage];
        console.log("📝 Static translation found:", staticTranslation);
        if (staticTranslation) {
          console.log("✅ Using static translation:", staticTranslation);
          return staticTranslation;
        }
      }

      // Try global translate function, then fallback to i18n
      let translatedMessage: string;

      if (globalTranslate) {
        translatedMessage = globalTranslate(translationKey);
      } else {
        translatedMessage = i18n.t(translationKey);
      }

      console.log("🌐 Global/i18n translation:", translatedMessage);

      // Check if translation was successful (not the same as key)
      if (
        translatedMessage !== translationKey &&
        translatedMessage !== undefined
      ) {
        console.log("✅ Translation successful:", translatedMessage);
        return translatedMessage;
      } else {
        console.log("❌ Translation failed, returning original:", message);
        return message;
      }
    } catch (error) {
      console.log("💥 Translation error:", error);
      return message;
    }
  }

  // Log when no translation found
  console.log("❌ No translation found for message:", message);
  console.log("📤 Returning original message");

  // Return original message if no translation found
  return message;
};

// Toast messages
export const showToast = (message: any, duration?: number) => {
  // Translate the message if it's a known backend message
  const translatedMessage = translateBackendMessage(message);

  return toast.show(translatedMessage, {
    duration: duration ? duration : 1500,
  });
};

export function formatCurrency(
  amount: string | number,
  currency: string = "INR",
  precision: number = 2
) {
  const currencySymbol =
    currency.toLowerCase() === "aed"
      ? "AED"
      : getSymbolFromCurrency(currency.toUpperCase()) || currency.toUpperCase();

  return `${currencySymbol}${
    // eslint-disable-next-line no-restricted-globals
    isNaN(amount)
      ? parseFloat(0).toFixed(precision)
      : parseFloat(amount).toFixed(precision)
  }`;
}

export function formatOrderNumber(orderNumber: string) {
  return `#${orderNumber}`;
}

export function getShareConfig(store: any) {
  const appURL = `http://share.quickdrycleaning.com/${config.slug}`;

  const message = store?.ShareMessage;

  const options = Platform.select({
    // ios: {
    //   activityItemSources: [
    //     {
    //       // For sharing url with custom title.
    //       placeholderItem: { type: "url", content: appURL },
    //       item: {
    //         default: { type: "text", content: message },
    //       },
    //       subject: {
    //         default: message,
    //       },
    //     },
    //     {
    //       // For sharing text.
    //       placeholderItem: { type: "text", content: message },
    //       item: {
    //         default: { type: "text", content: message },
    //         message: null, // Specify no text to share via Messages app.
    //       },
    //       linkMetadata: {
    //         // For showing app icon on share preview.
    //         title: "Share Via",
    //       },
    //     },
    //   ],
    // },

    default: {
      subject: "Share Via",
      message: `${message}\n\n${appURL}`,
    },
  });

  // @ts-ignore
  Share.open(options);
}

// Get lightest color for home screen linear gradient
export function getLightestColor(primaryColor: any, secondaryColor: any) {
  // Helper function to calculate brightness
  function calculateBrightness(color: any) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Perceived brightness formula
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const primaryBrightness = calculateBrightness(primaryColor);
  const secondaryBrightness = calculateBrightness(secondaryColor);

  return primaryBrightness > secondaryBrightness
    ? primaryColor
    : secondaryColor;
}
