import "../../global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import { LogBox, View } from "react-native";
import AppStack from "./AppStack";
import Toast from "react-native-toast-notifications";
import ContextWrapper from "../context/ContextWrapper";
import { CopilotProvider } from "react-native-copilot";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import config from "@/config";
import { colors } from "../styles/theme";
import "react-native-get-random-values";
import { usePathname } from "expo-router";
import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";
import { getApp } from "@react-native-firebase/app";

const app = getApp();
const analytics = getAnalytics(app);
// import analytics from "@react-native-firebase/analytics";
import "../i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { useLanguageManager } from "../i18n/useLanguageManager";
import { useTranslation } from "react-i18next";
import { setGlobalTranslate } from "../utils/CommonFunctions";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const pathname = usePathname();
  const { isLoading, error } = useLanguageManager();
  const { t } = useTranslation();

  // Set global translate function for use in CommonFunctions
  React.useEffect(() => {
    setGlobalTranslate(t);
  }, [t]);

  const copilotLabels = {
    skip: t("onboarding.skip"),
    previous: t("onboarding.previous"),
    next: t("onboarding.next"),
    finish: t("onboarding.finish"),
  };

  // const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Convert pathname to readable screen name
    const screenName = pathname === "/" ? "Home" : pathname.replace(/\//g, "_");

    logScreenView(analytics, {
      screen_name: screenName,
      screen_class: screenName,
    });
    if (__DEV__) {
      console.log("[Analytics] Screen view:", screenName);
    }
  }, [pathname]);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  const [appConfig, setAppConfig] = useState<any>(null);

  const fetchAppConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_CONFIG_API_URL}/config/${config.slug}.json`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch app config:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadAppConfig = async () => {
      const result = await fetchAppConfig();
      setAppConfig(result);
    };

    loadAppConfig();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  LogBox.ignoreAllLogs(true);

  if (!loaded) {
    return null;
  }

  const theme = vars({
    "--primary": appConfig?.theme?.primaryColor ?? colors.primaryColor,
    "--primaryTextColor":
      appConfig?.theme?.primaryTextColor ?? colors.primaryTextColor,
    "--buttonColor": appConfig?.theme?.buttonColor ?? colors.buttonColor,
    "--buttonTextColor":
      appConfig?.theme?.buttonTextColor ?? colors.buttonTextColor,
    "--iconColor": appConfig?.theme?.iconColor ?? colors.iconColor,
    "--notificationBadgeColor":
      appConfig?.theme?.notificationBadgeColor ?? colors.notificationBadgeColor,
    "--readyStatusColor":
      appConfig?.theme?.readyStatusColor ?? colors.readyStatusColor,
    "--pendingStatusColor":
      appConfig?.theme?.pendingStatusColor ?? colors.pendingStatusColor,
  });

  return (
    <I18nextProvider i18n={i18n}>
      <CopilotProvider labels={copilotLabels}>
        <View className="flex-1" style={theme}>
          <ContextWrapper>
            <AppStack />
            <Toast duration={1500} ref={(ref) => (global["toast"] = ref)} />
            <StatusBar style="dark" />
          </ContextWrapper>
        </View>
      </CopilotProvider>
    </I18nextProvider>
  );
};

export default RootLayout;
// export default Sentry.wrap(RootLayout);
