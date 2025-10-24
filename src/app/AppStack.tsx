import config from "@/config";
import { router, Slot } from "expo-router";
import { useEffect } from "react";
import defaultClient from "../lib/qdc-api";
import { useUser } from "../context/UserProvider";
import { useAppConfig } from "../context/ConfigProvider";
import { showToast } from "../utils/CommonFunctions";
import * as Linking from "expo-linking";
import * as Application from "expo-application";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";

const AppStack = () => {
  // context API
  const { setAppConfig } = useAppConfig();
  const { setClientId, setReferrerCode } = useUser();
  const { t } = useTranslation();

  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      console.log(`URL: ${url}`);
      let parts = url.split("/");
      let code = parts[parts.length - 1];

      if (code) {
        console.log("Get The Referral Code!", { code });
      }

      setReferrerCode(code);
    }
  }, [url]);

  const fetchAppConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_CONFIG_API_URL}/config/${config.slug}.json`
      );
      const result = await response.json();
      console.log("App config result", result);

      if (result) {
        setAppConfig(result);
      } else {
        showToast(t("static_messages.app_config_error"));
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReferral = async () => {
    if (Platform.OS === "android") {
      await Application.getInstallReferrerAsync().then((res) => {
        console.log({ res });
        if (res !== "utm_source=google-play&utm_medium=organic") {
          setReferrerCode(res);
        }
      });
    }
  };

  useEffect(() => {
    fetchAppConfig();

    router.replace("/LoadingScreen");

    if (config) {
      console.log("SLUG:", config.slug);
      defaultClient.getStoreDetails(config.slug).then(async (res: any) => {
        console.log(JSON.stringify(res));
        if (res?.clientId) {
          await setClientId(res?.clientId);
        }
      });
    }

    fetchReferral();
  }, []);

  return <Slot />;
};
export default AppStack;
