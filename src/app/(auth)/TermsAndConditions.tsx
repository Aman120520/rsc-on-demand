import {
  Pressable,
  ScrollView,
  Text,
  View,
  Platform,
  I18nManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultClient from "../../lib/qdc-api";
import { router } from "expo-router";
import {
  FIRST_TIME_INSTALL,
  IS_VALID_USER,
  useUser,
} from "@/src/context/UserProvider";
import NativeWebView from "@/src/components/NativeWebView";
import Loading from "@/src/components/ui/Loading";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const TermsAndConditions = () => {
  const { t } = useTranslation();
  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, setTncAccepted, signIn } = useUser();

  // useState
  const [data, setData] = useState<any>(null);
  const [ready, setReady] = useState<boolean>(true);

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient.termsAndConditions(clientId, branchId).then((res: any) => {
        // console.log("T&C", JSON.stringify(res));
        if (res !== undefined) {
          setData(res);
        }
      });
    }
  }, [clientId, branchId]);

  const onPress = async () => {
    setReady(false);

    setTncAccepted("True");

    await AsyncStorage.setItem(FIRST_TIME_INSTALL, "True");

    let userStatus = "True";
    await AsyncStorage.setItem(IS_VALID_USER, userStatus);

    setTimeout(async () => {
      await signIn();
      router.replace("/(app)/(tabs)/home");
      setReady(true);
    }, 500);
  };

  if (!ready) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <View
        className="flex-1 bg-defaultWhite"
        style={{
          // iOS RTL handling
          ...(Platform.OS === "ios" && I18nManager.isRTL
            ? {
                direction: "rtl",
                writingDirection: "rtl",
              }
            : {}),
        }}
      >
        <View
          className="items-center my-5"
          style={{
            // iOS RTL handling
            ...(Platform.OS === "ios" && I18nManager.isRTL
              ? {
                  direction: "rtl",
                  writingDirection: "rtl",
                }
              : {}),
          }}
        >
          <Text
            className="text-lg text-bold text-primary"
            style={{
              // iOS RTL handling
              ...(Platform.OS === "ios" && I18nManager.isRTL
                ? {
                    direction: "rtl",
                    writingDirection: "rtl",
                    textAlign: "center",
                  }
                : {}),
            }}
          >
            {data?.TermHeading}
          </Text>
        </View>
        <ScrollView
          className="px-5"
          showsVerticalScrollIndicator={false}
          style={{
            // iOS RTL handling
            ...(Platform.OS === "ios" && I18nManager.isRTL
              ? {
                  direction: "rtl",
                  writingDirection: "rtl",
                }
              : {}),
          }}
        >
          {data ? <NativeWebView data={data?.TermContent} /> : <></>}
        </ScrollView>
        <Pressable onPress={onPress} className="py-3 items-center bg-primary">
          <Text className="text-lg text-white pt-2">
            {t("terms.accept_proceed")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default TermsAndConditions;
