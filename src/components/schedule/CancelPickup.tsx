import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  I18nManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SvgXml } from "react-native-svg";
import RadioGroup from "react-native-radio-buttons-group";
import defaultClient from "../../lib/qdc-api";
import { useUser } from "@/src/context/UserProvider";
import { useTranslation } from "react-i18next";
import { useAppConfig } from "@/src/context/ConfigProvider";
import i18n from "@/src/i18n";
import config from "@/config";

export const CLOSE_SMALL_WH = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L16.5563 16.5563" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
<path d="M1 17L16.5563 1.44365" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

interface CancelPickupProps {
  setCancelReason: Function;
  onClose: () => void;
}

const CancelPickup = ({ setCancelReason, onClose }: CancelPickupProps) => {
  // context API
  const { clientId } = useUser();
  const { t } = useTranslation();
  const { appConfig } = useAppConfig();

  // RTL detection - only for iOS
  const isRTL = Platform.OS === "ios" && I18nManager.isRTL;

  // useState
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    const fetchCancelReasons = async () => {
      if (clientId) {
        try {
          console.log("Fetching cancel pickup reasons from GraphQL API...");
          const res = await defaultClient.cancelPickupReasons(clientId);

          // console.log("=== GRAPHQL API RESPONSE ===");
          // console.log("Cancel Pickup Reasons Array:", res);
          // console.log("Cancel Pickup Reasons Length:", res?.length);
          // console.log("=== END GRAPHQL RESPONSE ===");

          if (res && Array.isArray(res)) {
            console.log("Processing cancel pickup reasons from GraphQL...");
            let newArr: any = [];

            res.forEach((item: any, index: any) => {
              console.log(`Processing item ${index}:`, {
                rawItem: item,
                reason: item?.reason,
                index: index,
              });

              newArr.push({
                id: index?.toString(),
                label: item?.reason, // Use backend data directly
                value: item?.reason, // Keep original value for API submission
                originalLabel: item?.reason, // Store original for reference
              });
            });

            // console.log("=== FINAL PROCESSED ARRAY ===");
            // console.log("Final cancel pickup reasons array:", newArr);
            // console.log("Array length:", newArr.length);
            // console.log("=== END FINAL ARRAY ===");

            setOptions(newArr);
          } else {
            // console.log(
            //   "No cancel pickup reasons found in GraphQL response or invalid format"
            // );
            // console.log("Data structure:", res);
          }
        } catch (error) {
          console.error(
            "Error fetching cancel pickup reasons from GraphQL:",
            error
          );
          console.log("GraphQL request failed, no fallback available");
        }
      }
    };

    fetchCancelReasons();
  }, [clientId, t]);

  // Functions
  const handlePress = (id: number | string) => {
    if (id) {
      options?.map((item: any) => {
        if (item?.id === id) {
          setSelectedId(item?.id);
          setCancelReason(item?.value);
        }
      });
    }
  };

  return (
    <View className="flex-1 bg-defaultWhite">
      <View className="h-16 bg-primary flex-row items-center justify-between px-4">
        <Text className="text-base font-bold color-defaultWhite">
          {t("common.cancel_request")}
        </Text>
        <Pressable onPress={onClose}>
          <SvgXml xml={CLOSE_SMALL_WH} height={18} width={18} />
        </Pressable>
      </View>

      <View
        className="my-5 px-4"
        style={{
          // This ensures the whole section aligns correctly with the right padding/margin on iOS
          ...(isRTL
            ? {
              alignItems: "flex-start",
            }
            : {}),
        }}
      >
        <Text
          className="text-md font-medium"
          style={{
            // FIX: Apply necessary text direction styles ONLY to the question text on iOS
            ...(isRTL
              ? {
                textAlign: "right",
                writingDirection: "rtl",
                direction: "rtl",
              }
              : {}),
          }}
        >
          {t("schedule.cancel_reason")}
        </Text>

        <RadioGroup
          radioButtons={options}
          onPress={(id) => handlePress(id)}
          selectedId={selectedId}
          containerStyle={[
            styles.btnsContainer,
            // FIX: This alignment is necessary for the RadioGroup wrapper to align correctly on iOS
            isRTL
              ? {
                alignSelf: "flex-end",
                width: "100%",
              }
              : {},
          ]}
        />
      </View>
    </View>
  );
};

export default CancelPickup;

const styles = StyleSheet.create({
  btnsContainer: {
    alignItems: "flex-start",
    marginVertical: 20,
  },
});