import { Pressable, StyleSheet, Text, View, I18nManager } from "react-native";
import React from "react";
import { SvgXml } from "react-native-svg";
import moment from "moment";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ARROW_LEFT,
  CALENDAR_SM,
  CANCEL_SM,
  RESCHEDULE,
  TRUCK_ICON,
} from "@/src/icons/svg";
import { STYLES } from "@/src/styles/common";
import { TEXT_STYLE } from "@/src/styles/typography";
import { COLORS } from "@/src/styles/colors";
import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface SuccessfulCheckoutProps {
  pickupDate: any;
  pickupTime: any;
  setStep: Function;
  failure: boolean;
}

const SuccessfulCheckout = ({
  pickupDate,
  pickupTime,
  setStep,
  failure,
}: SuccessfulCheckoutProps) => {
  const { t } = useTranslation();
  const { setAppConfig, appConfig } = useAppConfig();
  // Date translation function
  const translateDate = (dateString: string) => {
    if (!dateString) return "";

    // Try different date formats
    let momentDate = moment(dateString);

    // If invalid, try common formats
    if (!momentDate.isValid()) {
      momentDate = moment(dateString, "DD MMM YYYY");
    }
    if (!momentDate.isValid()) {
      momentDate = moment(dateString, "YYYY-MM-DD");
    }
    if (!momentDate.isValid()) {
      momentDate = moment(dateString, "DD-MM-YYYY");
    }
    if (!momentDate.isValid()) {
      momentDate = moment(dateString, "MM/DD/YYYY");
    }
    if (!momentDate.isValid()) {
      momentDate = moment(dateString, "DD/MM/YYYY");
    }

    if (!momentDate.isValid()) {
      return dateString;
    }

    const day = momentDate.format("DD");
    const month = momentDate.format("MMM");
    const year = momentDate.format("YYYY");

    // Translate month
    const translationKey = `date_formatting.months.${month}`;
    const translatedMonth = t(translationKey);

    // Use translated month if translation worked, otherwise use original month
    const finalMonth =
      translatedMonth !== translationKey ? translatedMonth : month;

    const result = `${day} ${finalMonth} ${year}`;

    return result;
  };

  return (
    <View className="flex-1 flex flex-col items-center justify-center px-6 bg-defaultWhite">
      <View>
        <Icon
          name="truck_icon"
          size={60}
          color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
        />
      </View>
      <Text className="text-md font-bold mt-5 color-defaultBlack">
        {t("checkout.keep_ready")}
      </Text>

      <Text className="text-sm font-semibold mt-2 color-defaultBlack text-center">
        {t("checkout.expert_coming")}
      </Text>

      {failure && (
        <Text className="text-sm font-semibold text-center mt-6 color-red-500">
          {t("checkout.payment_failed")}
        </Text>
      )}

      {/* <View style={[STYLES.flexRowCC, STYLES.my(SCALER.w(30))]}>
        <SvgXml xml={CALENDAR_SM} />
        <Text
          style={[
            TEXT_STYLE.TEXT_16_B,
            { textAlign: "center", marginLeft: 14, color: COLORS.BLUE.d13 },
          ]}
        >
          {pickupDate &&
            `${moment(pickupDate?.dateLabel).format("DD MMM YYYY")}`}
        </Text>
      </View> */}

      <View className="my-7">
        <View className="flex flex-row items-center justify-center my-4">
          <SvgXml xml={CALENDAR_SM} />
          <Text className="text-md font-semibold text-center ml-3 color-defaultBlack">
            {pickupDate?.dateLabel
              ? translateDate(pickupDate.dateLabel)
              : translateDate(pickupDate?.date)}
          </Text>
        </View>
      </View>

      {/* <View style={[STYLES.flexRowCC, STYLES.marginTop(SCALER.w(20))]}>
        <Pressable onPress={() => {}} style={styles.smallBtn}>
          <SvgXml xml={RESCHEDULE} />
          <Text
            style={[
              styles.btnText,
              {
                color: COLORS.GREEN.d8,
              },
            ]}
          >
            Reschedule
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setStep(4);
          }}
          style={styles.smallBtn}
        >
          <SvgXml xml={CANCEL_SM} />
          <Text style={[styles.btnText, { color: COLORS.GREEN.d8 }]}>
            Cancel
          </Text>
        </Pressable>
      </View> */}

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/(app)/(tabs)/home");
        }}
        className="bg-buttonColor w-60 p-4 rounded-full mt-16 flex-row items-center justify-center"
        style={{
          // RTL handling for button layout
          ...(I18nManager.isRTL
            ? {
                flexDirection: "row-reverse",
              }
            : {}),
        }}
      >
        <Icon
          name="arrow_left"
          size={24}
          color={colors.defaultWhite}
          style={{
            // RTL handling for arrow direction
            ...(I18nManager.isRTL
              ? {
                  transform: [{ scaleX: -1 }],
                }
              : {}),
          }}
        />
        <Text
          className="text-md font-semibold color-defaultWhite capitalize"
          style={{
            // RTL handling for text spacing
            ...(I18nManager.isRTL
              ? {
                  marginRight: 20,
                }
              : {
                  marginLeft: 20,
                }),
          }}
        >
          {t("checkout.go_back_to_home")}
        </Text>
      </Pressable>
    </View>
  );
};

export default SuccessfulCheckout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE.d0,
    paddingHorizontal: 25,
  },
  smallBtn: {
    flexShrink: 1,
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: COLORS.GRAY.d7,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 50,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnText: {
    ...TEXT_STYLE.TEXT_14_B,
    color: COLORS.WHITE.d0,
    marginLeft: 20,
  },
});
