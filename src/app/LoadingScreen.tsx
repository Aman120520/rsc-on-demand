import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Image,
  StyleSheet,
  ImageBackground,
  Text,
  Platform,
} from "react-native";
import { router, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FIRST_TIME_INSTALL,
  IS_VALID_USER,
  useUser,
} from "../context/UserProvider";
import config from "@/config";
import { useStore } from "../context/StoreProvider";
import defaultClient from "../lib/qdc-api";
import { useAppConfig } from "../context/ConfigProvider";
import { usePushNotifications } from "../hooks/usePushNotifcation";
import { colors } from "../styles/theme";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";

const LoadingScreen = () => {
  const rootSegments = useSegments()[0];
  const { t } = useTranslation();

  const { appConfig } = useAppConfig();
  const { setStoreDetails } = useStore();
  const { clientId, branchId } = useUser();

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient.storeDetails(clientId, branchId).then((res: any) => {
        if (res) {
          setStoreDetails(res);
        }
      });
    }
  }, [clientId, branchId]);

  useEffect(() => {
    if (!appConfig) {
      return;
    }

    const navigation = async () => {
      let userStatus = await AsyncStorage.getItem(IS_VALID_USER).then(
        (value: any) => {
          if (value !== null) return value;
        }
      );

      console.log({ rootSegments });

      console.log({ userStatus });

      if (!userStatus && rootSegments !== "(auth)") {
        router.replace("/(auth)/login");
      } else if (userStatus && rootSegments !== "(app)") {
        // router.replace("/(app)/home");
        router.replace("/(app)/(tabs)/home");
      }
    };

    setTimeout(async () => {
      await AsyncStorage.getItem(FIRST_TIME_INSTALL).then(
        (firstTimeInstall: any) => {
          // console.log({ firstTimeInstall });
          if (firstTimeInstall !== null) {
            navigation();
          } else {
            router.push("/(auth)/OnBoardingScreen");
          }
        }
      );
    }, appConfig?.splashScreenDelay ?? 1500);
  }, [appConfig]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* <ActivityIndicator size={"large"} color={config.theme.primaryColor} /> */}

      {appConfig?.showLogoOnSplashScreen ? (
        <ImageBackground
          source={require("../assets/splash-screen.png")}
          style={[styles.img]}
        >
          {appConfig?.showCopyright ? (
            <View className="mb-20">
              <Text className="text-sm color-defaultWhite text-center">
                {t("common.powered_by")}
              </Text>

              <Text className="text-sm font-semibold color-defaultWhite text-center">
                Quick Dry Cleaning Software
              </Text>
            </View>
          ) : null}
        </ImageBackground>
      ) : (
        <View
          className="h-full w-full items-center justify-end bg-white"
          style={{
            backgroundColor: appConfig?.theme?.primaryColor ?? "#FFFFFF",
          }}
        >
          {appConfig?.showCopyright ? (
            <View className="mb-20">
              <Text className="text-sm color-defaultWhite text-center">
                {t("common.powered_by")}
              </Text>

              <Text className="text-sm font-semibold color-defaultWhite text-center">
                Quick Dry Cleaning Software
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  img: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#FFFFFF",
  },
});
