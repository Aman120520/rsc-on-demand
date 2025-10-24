import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SvgXml } from "react-native-svg";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import {
  ARROW_LEFT,
  ARROW_RIGHT,
  CHEVRON_DOWN,
  CHEVRON_UP,
} from "@/src/icons/svg";
import SelectedServices from "./SelectedService";
import { colors } from "@/src/styles/theme";
import { useCart } from "@/src/context/CartProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { useStore } from "@/src/context/StoreProvider";
import config from "@/config";
import Icon from "@/src/icons/Icon";
import { useUser } from "@/src/context/UserProvider";
import { useLoginAlert } from "@/src/context/LoginAlertProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

interface ServiceCheckoutProps {}

const ServiceCheckout = ({}: ServiceCheckoutProps) => {
  // context API
  const { appConfig } = useAppConfig();
  const { user } = useUser();
  const { t } = useTranslation();

  const isRtl = i18n.dir() === "rtl";
  const showLoginAlert = useLoginAlert();
  const {
    serviceItems,

    cartTotal,
    setCartTotal,

    cleaningCartTotal,
    setCleaningCartTotal,

    laundryCartTotal,
    setLaundryCartTotal,
  }: any = useCart();

  const { storeDetails, isNetAmountDecimal } = useStore();

  // useState
  const [showBottomSheet, setShowBottomShet] = useState(false);

  // useEffects
  useEffect(() => {
    let cleaningTotal = 0;
    let laundryTotal = 0;

    serviceItems?.forEach((service: any) => {
      const { isLaundryService, garmentDetails } = service;

      const totalForService = garmentDetails?.reduce(
        (acc: any, garment: any) => {
          const { price, quantity } = garment;
          const garmentPrice = price * quantity;

          return acc + garmentPrice;
        },
        0
      );

      if (isLaundryService) {
        laundryTotal += totalForService;
      } else {
        cleaningTotal += totalForService;
      }
    });

    setCleaningCartTotal(Number(cleaningTotal));
    setLaundryCartTotal(Number(laundryTotal));
  }, [serviceItems]);

  useEffect(() => {
    setCartTotal(Number(cleaningCartTotal + laundryCartTotal));
  }, [cleaningCartTotal, laundryCartTotal]);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "40%", "80%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    // console.log("handleSheetChanges", index);
  }, []);

  return (
    <>
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={styles.container}
      >
        <TouchableOpacity
          onPress={() => setShowBottomShet(!showBottomSheet)}
          className="flex-row items-center justify-end py-3"
        >
          {!showBottomSheet ? (
            <Icon
              name="chevronUp"
              color={appConfig?.theme?.buttonColor ?? colors.buttonColor}
              size={18}
            />
          ) : (
            <></>
          )}
        </TouchableOpacity>

        <View className="flex flex-row items-center justify-between">
          {/* Schedule Button */}
          <TouchableOpacity
            style={{ alignSelf: "flex-start" }}
            onPress={() => {
              if (!user) {
                return showLoginAlert(null, () => {});
              }

              router.push("/(app)/screens/checkout/CheckoutScreen");
            }}
          >
            <View className="flex flex-row items-center justify-between my-2 bg-buttonColor py-3 px-4 rounded-full">
              {isRtl ? (
                <>
                  <Text className="text-[14px] font-semibold mr-5 color-defaultWhite">
                    {t("home.schedule_pickup")}
                  </Text>
                  <SvgXml style={{ marginTop: 2 }} xml={ARROW_LEFT} />
                </>
              ) : (
                <>
                  <Text className="text-[14px] font-semibold mr-5 color-defaultWhite">
                    {t("home.schedule_pickup")}
                  </Text>
                  <SvgXml style={{ marginTop: 2 }} xml={ARROW_RIGHT} />
                </>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.priceContainer}>
            <Text className="text-[14px] font-semibold color-[#606060] ">
              {t("home.estimated_price")}
            </Text>
            <Text className="text-[14px] font-semibold color-defaultBlack ">
              {formatCurrency(
                cartTotal ?? 0,
                storeDetails?.Currency ?? config.currency,
                cartTotal % 1 !== 0 ? 2 : 0
              )}
            </Text>
          </View>
        </View>
      </Animated.View>

      {showBottomSheet ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          onClose={() => setShowBottomShet(!showBottomSheet)}
          containerStyle={{ backgroundColor: "rgba(255, 255, 255, 0.83)" }}
          backgroundStyle={[styles.background]}
        >
          <View style={styles.contentContainer}>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-[16px] font-semibold px-4 text-defaultBlack">
                {t("home.selected_service")}
              </Text>
              <TouchableOpacity
                style={{ padding: 20 }}
                onPress={() => setShowBottomShet(!showBottomSheet)}
              >
                {showBottomSheet ? (
                  <Icon
                    name="chevronDown"
                    color={appConfig?.theme?.buttonColor ?? colors.buttonColor}
                    size={18}
                  />
                ) : (
                  <></>
                )}
              </TouchableOpacity>
            </View>

            <SelectedServices data={serviceItems} />
          </View>
        </BottomSheet>
      ) : null}
    </>
  );
};

export default ServiceCheckout;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: colors.defaultWhite,
    borderTopWidth: 1,
    borderColor: "#E4F1F4",
    zIndex: 100,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  icon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 10,
  },
  // button: {
  //   backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
  //   paddingVertical: 10,
  //   paddingHorizontal: 18,
  //   borderRadius: 20,
  // },
  // btnText: {
  //   color: colors.defaultWhite,
  //   marginRight: 10,
  // },
  priceContainer: {
    alignItems: "flex-end",
  },
  contentContainer: {
    flex: 1,
  },
  background: {
    backgroundColor: colors.defaultWhite,
  },
});
