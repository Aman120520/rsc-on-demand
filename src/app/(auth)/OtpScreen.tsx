import config from "@/config";
import {
  Keyboard,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OTPTextView from "react-native-otp-textinput";
import { useEffect, useState } from "react";
import { colors } from "@/src/styles/theme";
import Button from "@/src/components/ui/Button";
import defaultClient from "@/src/lib/qdc-api";
import { showToast } from "@/src/utils/CommonFunctions";
import { router } from "expo-router";
import { useUser } from "@/src/context/UserProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useFirebaseAnalyticsEvent } from "@/src/hooks/useFirebaseAnalyticsEvent";
import { useTranslation } from "react-i18next";
import { I18nManager, Platform } from "react-native";

const OtpScreen = () => {
  const { t } = useTranslation();
  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, token, customerCode, setOtpMatch, tncAccepted } =
    useUser();
  const { storeDetails, setStoreDetails } = useStore();
  const { logEvent } = useFirebaseAnalyticsEvent();

  // const { signIn } = useAuth();
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState("");
  const [ready, setReady] = useState(true);
  const otpContainerStyle = {
    direction: "ltr" as const,
    // Force LTR direction for OTP input
    writingDirection: "ltr" as const,
    // RTL handling for both platforms
    ...(I18nManager.isRTL
      ? {
        transform: [{ scaleX: -1 }],
      }
      : {}),
  };

  const requestOtp = timer === 0;

  // useEffect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prevState): any => {
        return prevState ? prevState - 1 : 0;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [timer]);

  useEffect(() => {
    if (otp?.length === 4) {
      Keyboard.dismiss();
    }
  }, [otp]);

  const onSubmit = () => {
    if (otp === "") {
      showToast(t("static_messages.enter_otp"));
    } else {
      console.log({ otp }, { clientId }, { branchId }, { customerCode });

      defaultClient
        .verifyOTP(otp, clientId, branchId, customerCode)
        .then(async (res) => {
          // console.log("OTP RESPONSE", JSON.stringify(res));
          if (res === "False") {
            showToast(t("static_messages.otp_not_match"));
            return;
          }

          await setOtpMatch(res?.OTPMatch);

          // console.log({ token });

          if (res?.OTPMatch === "True" && token) {
            console.log({ token });

            // logEvent("login_success", {});

            router.push("/(auth)/TermsAndConditions");
          } else {
            showToast(t("static_messages.otp_not_match"));
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const resendOTP = () => {
    defaultClient.generateOTP(clientId, branchId, customerCode).then((res) => {
      showToast(t("static_messages.otp_sent_successfully"));
    });
  };

  const otpOnCall = async () => {
    await defaultClient.storeDetails(clientId, branchId).then((res: any) => {
      if (res?.Message) {
        showToast(res?.Message);
        return;
      }
      setStoreDetails(res);

      const mobileNo = res?.CallcenterMobileNo;

      if (!mobileNo) {
        showToast(t("static_messages.mobile_number_not_found"));
        return;
      }

      Linking.openURL(`tel:${mobileNo}`).catch(() => { });
    });
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          appConfig?.theme?.primaryColor ?? config.theme.primaryColor,
      }}
    >
      <View className="flex-1 items-center justify-center bg-defaultWhite">
        <Text className="text-base">{t("otp.enter_otp")}</Text>
        <Text className="text-md text-center px-6 my-10">
          {t("otp.otp_sent")}
        </Text>
        <View
          className="px-4"
          style={{
            ...otpContainerStyle,
            // Additional iOS RTL handling
            ...(Platform.OS === "ios" && I18nManager.isRTL
              ? {
                alignItems: "center",
                justifyContent: "center",
              }
              : {}),
          }}
        >
          <View
            style={{
              // iOS specific RTL container
              ...(Platform.OS === "ios" && I18nManager.isRTL
                ? {
                  transform: [{ scaleX: -1 }],
                }
                : {}),
            }}
          >
            <OTPTextView
              defaultValue={otp}
              inputCount={4}
              keyboardType="numeric"
              tintColor={appConfig?.theme?.primaryColor ?? colors.primaryColor}
              offTintColor={colors.defaultBackgroundColor}
              handleTextChange={(otp) => setOtp(otp)}
              textInputProps={{
                style: {
                  textAlign: "center",
                  writingDirection: "ltr",
                  direction: "ltr",
                  // Ensure text is not flipped on iOS
                  ...(Platform.OS === "ios" && I18nManager.isRTL
                    ? {
                      transform: [{ scaleX: -1 }],
                    }
                    : {}),
                },
              }}
            />
          </View>
        </View>

        <TouchableOpacity
          className="mt-10 w-full items-center"
          onPress={resendOTP}
          disabled={!requestOtp}
        >
          <Text
            className={`${!requestOtp ? "text-darkGray" : "text-black"
              } w-full text-center`}
            numberOfLines={1}
          >
            {t("otp.resend_otp")}
            {timer ? ` (${t("otp.resend_timer", { count: timer })})` : null}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mt-20 px-10">
          <Button
            label={t("otp.submit")}
            onPress={onSubmit}
            buttonStyles="w-[50%] mx-2"
            labelStyles="text-sm text-white"
          />
          <Button
            label={t("otp.get_otp_call")}
            onPress={otpOnCall}
            buttonStyles={`w-[50%] mx-2 ${!requestOtp ? "bg-darkGray" : ""}`}
            labelStyles="text-sm text-white"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export default OtpScreen;
