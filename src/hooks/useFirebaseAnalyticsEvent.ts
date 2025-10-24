import { getAnalytics, logEvent } from "@react-native-firebase/analytics";
import { getApp } from "@react-native-firebase/app";
import { useCallback } from "react";

const app = getApp();

export const useFirebaseAnalyticsEvent = () => {
  const logAnalyticsEvent = useCallback(
    async (eventName: string, params?: Record<string, any>) => {
      try {
        const analytics = getAnalytics(app);
        await logEvent(analytics, eventName, params);
        if (__DEV__) {
          // console.log(`[Analytics] Event: ${eventName}`, params);
        }
      } catch (err) {
        console.warn("Failed to log event:", err);
      }
    },
    []
  );

  return { logEvent: logAnalyticsEvent };
};
