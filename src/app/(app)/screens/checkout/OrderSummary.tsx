import {
  Alert,
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import moment from "moment";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUser } from "@/src/context/UserProvider";
import { useCart } from "@/src/context/CartProvider";
import CollapsibleView from "@/src/components/CollapsibleView";
import SelectedServices from "../catalouge/SelectedService";
import CommonBorder from "@/src/components/CommonBorder";
import { COLORS } from "@/src/styles/colors";
import { STYLES } from "@/src/styles/common";
import { TEXT_STYLE } from "@/src/styles/typography";
import { CLOSE_W_ROUNDED_BORDER, DELIVERY, PICKUP } from "@/src/icons/svg";
import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import GiftCardModal from "./GiftCardModal";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import config from "@/config";
import { useStore } from "@/src/context/StoreProvider";
import { router } from "expo-router";
import i18n from "@/src/i18n";
import { useTranslation } from "react-i18next";

interface OrderSummaryProps {
  deliveryNotes: string | null;
  pickupDate: any;
  pickupTime: any;
  deliveryDate: any;
  deliveryTime: any;
  expressDelivery: any;
  reviewNotes: string;
  setReviewNotes: Function;
  selectedPackage: any;
  setSelectedPackage: Function;
  activePackagesData: any;
  showPackagePopup: boolean;
  setShowPackagePopup: Function;
  setStep: Function;
  couponCode: string | null;
  setCouponCode: Function;
  couponRes: any;
  couponError: any;
  setCouponError: Function;
  setCouponRes: Function;
  showCouponModal: boolean;
  setShowCouponModal: Function;
  couponModalOnPress: (value: string) => void;
  couponLoading: boolean;
  showPaylater: boolean;
  setShowPaylater: Function;
}

const OrderSummary = ({
  deliveryNotes,
  pickupDate,
  pickupTime,
  deliveryDate,
  deliveryTime,
  expressDelivery,
  reviewNotes,
  setReviewNotes,
  selectedPackage,
  setSelectedPackage,
  showPackagePopup,
  setShowPackagePopup,
  activePackagesData,
  setStep,
  couponCode,
  setCouponCode,
  couponRes,
  couponError,
  setCouponError,
  setCouponRes,
  showCouponModal,
  setShowCouponModal,
  couponModalOnPress,
  couponLoading,
  showPaylater,
  setShowPaylater,
}: OrderSummaryProps) => {
  // contextAPI
  const { setAppConfig, appConfig } = useAppConfig();
  const { user, branchId, customerCode } = useUser();
  const { t } = useTranslation();
  const isRTL = Platform.OS === "ios" && I18nManager.isRTL;
  const { storeDetails, isNetAmountDecimal } = useStore();
  const { serviceItems, cartTotal, taxAmount, expressAmount, netAmount }: any =
    useCart();

  // Date translation functions
  const translateDate = (dateString: string) => {
    if (!dateString) return "";

    const momentDate = moment(dateString);
    const day = momentDate.format("Do");
    const month = momentDate.format("MMM");
    const year = momentDate.format("YYYY");

    // Translate month
    const translationKey = `date_formatting.months.${month}`;
    const translatedMonth = t(translationKey);

    // Use translated month if translation worked, otherwise use original month
    const finalMonth =
      translatedMonth !== translationKey ? translatedMonth : month;

    return `${day} ${finalMonth} ${year}`;
  };

  // useState
  // const [showCouponModal, setShowCouponModal] = useState(false);

  // Functions

  const removeCoupon = () => {
    Alert.alert(
      t("common.coupon"),
      t("common.are_you_sure_you_want_to_remove_the_coupon"),
      [
        {
          text: t("common.no"),
          onPress: () => {
            console.log("Cancel");
          },
        },
        {
          text: t("common.yes"),
          onPress: () => {
            setCouponCode(null);
            setCouponRes(null);
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    if (cartTotal) {
      getCouponsList({ orderAmount: cartTotal });
    }
  }, [cartTotal]);

  const getCouponsList = async ({
    orderAmount,
  }: {
    orderAmount: number | string;
  }) => {
    if (orderAmount && customerCode !== null) {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_COUPONS_API_URL}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Org-Id":
                appConfig?.organizationId?.toString() ??
                config.OrganizationId.toString(),
              "accept-language": i18n.language.toString(),
            },
            body: JSON.stringify({
              operationName: "AvailableCouponsForUser",
              variables: {
                orderAmount: Number(orderAmount),
                userId: customerCode,
                locationId: branchId,
              },
              query:
                "query AvailableCouponsForUser(\n  $locationId: BigInt\n  $orderAmount: Float!\n  $userId: String!\n) {\n  availableCouponsForUser(\n    locationId: $locationId\n    orderAmount: $orderAmount\n    userId: $userId\n  ) {\n    id\n    code\n    title\n    validFrom\n    type\n    value\n  enableAutoApply\n    maxRedemptions\n    maxRedemptionsPerUser\n    description\n    discount\n    minOrderAmount\n    onlyForNewUsers\n  }\n}",
            }),
          }
        );
        const json = await response.json();

        const res = json;
        // console.log("Available Coupons For User", JSON.stringify(res));

        if (res && res?.data !== null) {
          // setCouponList(res?.data);

          const coupons = res?.data?.availableCouponsForUser;
          const filteredCoupon = coupons.find(
            (coupon: any) => coupon?.enableAutoApply === true
          );

          if (filteredCoupon && filteredCoupon?.enableAutoApply) {
            console.log("fakdfjdaklfj");
            setCouponCode(filteredCoupon?.code);
            couponModalOnPress(filteredCoupon?.code);
          }
        } else {
          // showToast(res?.errors[0]?.message);
          // console.log("ERROR MSG", res?.errors[0]?.message);
        }
      } catch (error) {
        console.error(JSON.stringify(error));
      }
    }
  };

  return (
    <KeyboardAwareScrollView>
      <ScrollView
        pointerEvents={showPaylater ? "none" : "auto"}
        className="flex-1 bg-white mt-3"
      >
        <CollapsibleView title={t("checkout.services")} collapsable={true}>
          <ScrollView scrollEnabled={false} className="flex-1">
            <View className="px-5">
              <View>
                <SelectedServices
                  data={serviceItems}
                  paddingHorizontal={0}
                  scrollEnabled={false}
                />
              </View>
              <CommonBorder mt={10} color={colors.defaultBackgroundColor} />

              {/* <View>
                {selectedPackage ? (
                  <View style={[STYLES.flexRowAcSb, { marginTop: 14 }]}>
                    <View>
                      <Text
                        style={[
                          TEXT_STYLE.TEXT_12_SB,
                          { color: COLORS.GRAY.d10 },
                        ]}
                      >
                        Package Applied
                      </Text>
                      <Text
                        style={[
                          TEXT_STYLE.TEXT_13_B,
                          {
                            color: COLORS.PRIMARY.d1,
                            width: 220,
                            marginTop: 7,
                          },
                        ]}
                      >
                        {selectedPackage?.PackageName}
                      </Text>
                      <Pressable
                        onPress={() => setSelectedPackage(null)}
                        style={[
                          STYLES.flexRow,
                          { paddingVertical: 10, alignItems: "center" },
                        ]}
                      >
                        <Icon name="closeIconwithCircle" />
                        <Text
                          style={[
                            TEXT_STYLE.TEXT_12_SB,
                            { color: COLORS.BLUE.d16, marginLeft: 6 },
                          ]}
                        >
                          Cancel
                        </Text>
                      </Pressable>
                    </View>
                    <View style={[STYLES.flexRowCC]}>
                      <Pressable
                        onPress={() => setShowPackagePopup(!showPackagePopup)}
                        style={{ paddingVertical: 10, paddingHorizontal: 23 }}
                      >
                        <Icon name="edit" color={COLORS.BLUE.d10} />
                      </Pressable>
                      <Text
                        style={[
                          TEXT_STYLE.TEXT_16_B,
                          { color: COLORS.GREEN.d2 },
                        ]}
                      >
                        ₹ {selectedPackage?.PackageCost}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    {activePackagesData?.length > 0 ? (
                      <Pressable
                        onPress={() => setShowPackagePopup(!showPackagePopup)}
                        style={[STYLES.flexRowAcSb, { paddingVertical: 12 }]}
                      >
                        <Text
                          style={[
                            TEXT_STYLE.TEXT_12_SB,
                            { color: COLORS.BLUE.d0 },
                          ]}
                        >
                          select package
                        </Text>
                        <Icon name="edit" />
                      </Pressable>
                    ) : (
                      <></>
                    )}
                  </View>
                )}
              </View> */}

              <View className="felx flex-row items-center justify-between mt-4">
                <Text className="text-md font-semibold color-defaultBlack">
                  {t("orders.sub_total")}
                </Text>
                <Text className="text-md font-semibold color-defaultBlack">
                  {formatCurrency(
                    cartTotal ?? 0,
                    storeDetails?.Currency ?? config.currency,
                    cartTotal % 1 !== 0 ? 2 : 0
                  )}
                </Text>
              </View>

              {expressDelivery && (
                <View className="felx flex-row items-center justify-between mt-4">
                  <Text className="text-md font-semibold color-defaultBlack">
                    {t("common.express_delivery")}
                  </Text>
                  <Text className="text-md font-semibold color-defaultBlack">
                    {formatCurrency(
                      expressAmount ?? 0,
                      storeDetails?.Currency ?? config.currency,
                      expressAmount % 1 !== 0 ? 2 : 0
                    )}
                  </Text>
                </View>
              )}

              {appConfig?.enableCoupon ? (
                <>
                  {couponCode && couponRes ? (
                    <View className="mt-3 bg-gray-100 px-1 py-2 rounded-md">
                      <View className="flex flex-row items-center justify-between">
                        <View>
                          <Text
                            numberOfLines={2}
                            className="text-md font-bold color-defaultBlack max-w-72 break-all my-1"
                          >
                            {couponRes?.validateCoupon?.coupon?.title}
                          </Text>
                          <Pressable
                            className="flex flex-row items-center mt-1"
                            onPress={removeCoupon}
                          >
                            <Icon
                              name="close_rounded_border"
                              color={
                                appConfig?.theme?.primaryColor ??
                                colors.primaryColor
                              }
                              size={24}
                            />
                            <Text className="text-sm font-semibold color-primary ml-3">
                              {t("coupon.remove_coupon")}
                            </Text>
                          </Pressable>
                        </View>
                        <Text className="text-md font-semibold color-defaultBlack">
                          -{" "}
                          {formatCurrency(
                            couponRes?.validateCoupon?.discount.toFixed(2) ?? 0,
                            storeDetails?.Currency ?? config.currency,
                            couponRes?.validateCoupon?.discount.toFixed(2) %
                              1 !==
                              0
                              ? 2
                              : 0
                          )}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Pressable
                        onPress={() => {
                          setCouponError(null);
                          setStep(4);
                        }}
                        className="mt-4 bg-primary p-2 rounded-md inline-flex self-start"
                      >
                        <Text className="text-md font-semibold text-white">
                          {t("orders.apply_coupon")}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </>
              ) : null}

              <View className="felx flex-row items-center justify-between mt-4">
                <Text className="text-md font-semibold color-defaultBlack">
                  {t("orders.tax")}
                </Text>
                <Text className="text-md font-semibold color-defaultBlack">
                  {formatCurrency(
                    taxAmount ?? 0,
                    storeDetails?.Currency ?? config.currency,
                    taxAmount % 1 !== 0 ? 2 : 0
                  )}
                </Text>
              </View>

              <View className="felx flex-row items-center justify-between mt-4">
                <Text className="text-md font-semibold color-defaultBlack">
                  {t("orders.total_amount")}
                </Text>
                <Text className="text-md font-semibold color-defaultBlack">
                  {formatCurrency(
                    netAmount ?? 0,
                    storeDetails?.Currency ?? config.currency,
                    isNetAmountDecimal && netAmount % 1 !== 0 ? 2 : 0
                  )}
                </Text>
              </View>
            </View>

            {/* <View style={{ marginTop: 34, paddingHorizontal: 20 }}>
              <Text style={[TEXT_STYLE.TEXT_12_B, styles.heading]}>
                Add Special Instructions for services
              </Text>
              <TextInput
                value={reviewNotes}
                onChangeText={(text) => setReviewNotes(text)}
                enablesReturnKeyAutomatically={false}
                style={[styles.input]}
                autoCorrect={false}
              />
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              {reviewNotes ? (
                <View style={{ marginTop: 24 }}>
                  <Text style={[TEXT_STYLE.TEXT_12_B, styles.heading]}>
                    Special Instructions for services
                  </Text>
                  <Text
                    style={[
                      TEXT_STYLE.TEXT_14_B,
                      { color: COLORS.PRIMARY.d1, marginTop: 7 },
                    ]}
                  >
                    {reviewNotes}
                  </Text>
                </View>
              ) : null}
            </View> */}
          </ScrollView>
        </CollapsibleView>

        <CollapsibleView
          title={t("common.pickup_and_delivery_details")}
          collapsable={false}
        >
          <ScrollView className="px-5" style={{
            ...(isRTL
              ? {

                left: 20,
              }
              : {}),
          }} >
            <View className="flex flex-row justify-end">
              <Pressable onPress={() => setStep(0)} className="py-4 px-3">
                <Icon name="edit" color={colors.primaryColor} size={24} />
              </Pressable>
            </View>
            <View className="flex flex-row items-center justify-between">
              <View>
                <Icon
                  name="pickup_icon"
                  size={24}
                  color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
                />
                <Text className="text-md font-semibold color-primary mt-3" style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}>
                  {t("common.pickup")}
                </Text>
                <View>
                  <View className="flex flex-row mt-2">
                    <Text className="text-sm font-md">{t("payment.date")}</Text>
                    <Text className="text-sm font-semibold ml-3">
                      {pickupDate && translateDate(pickupDate)}
                    </Text>
                  </View>
                  {/* <View style={[STYLES.flexRow, { marginTop: 10 }]}>
                  <Text style={[TEXT_STYLE.TEXT_12_SB, styles.dateText]}>
                    Time
                  </Text>
                  <Text style={[TEXT_STYLE.TEXT_14_B, styles.date]}>
                    {pickupTime && `${pickupTime?.time}`}
                  </Text>
                </View> */}
                </View>
              </View>

              <View>
                <Icon
                  name="delivery_icon"
                  size={24}
                  color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
                />
                <Text className="text-md font-semibold color-primary mt-3" style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }} >
                  {t("common.delivery")}
                </Text>
                <View>
                  <View className="flex flex-row mt-2">
                    <Text className="text-sm font-md" >{t("payment.date")}</Text>
                    <Text className="text-sm font-semibold ml-3">
                      {deliveryDate && translateDate(deliveryDate)}
                    </Text>
                  </View>
                  {/* <View style={[STYLES.flexRow, { marginTop: 10 }]}>
                  <Text style={[TEXT_STYLE.TEXT_12_SB, styles.dateText]}>
                    Time
                  </Text>
                  <Text style={[TEXT_STYLE.TEXT_14_B, styles.date]}>
                    {deliveryTime && `${deliveryTime?.time}`}
                  </Text>
                </View> */}
                </View>
              </View>
            </View>


            <View className="mt-5" >
              <Text className="text-sm font-semibold color-primary" style={{
                ...(isRTL
                  ? {
                    textAlign: "left",
                  }
                  : {}),
              }}>
                {t("common.address")}
              </Text>
              <Text className="text-sm font-semibold color-defaultBlack mt-3">
                {user?.address}
              </Text>
            </View>

            <View style={{ marginTop: 20 }}>
              <Text className="text-sm font-semibold color-primary" style={{
                ...(isRTL
                  ? {
                    textAlign: "left",
                  }
                  : {}),
              }}>
                {t("common.contact")}
              </Text>
              <Text className="text-sm font-semibold color-defaultBlack mt-3">
                {user?.phoneNumber}
              </Text>
            </View>

            {deliveryNotes ? (
              <View className="mt-5  pb-10">
                <Text className="text-sm font-semibold color-primary">
                  {t("common.special_instructions")}
                </Text>
                <Text className="text-sm font-semibold color-defaultBlack mt-2">
                  {deliveryNotes}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </CollapsibleView>
      </ScrollView>

      {/* {showCouponModal ? (
        <GiftCardModal
          open={showCouponModal}
          setOpen={setShowCouponModal}
          giftCardCode={couponCode}
          setGiftCardCode={setCouponCode}
          couponError={couponError}
          setCouponError={setCouponError}
          couponRes={couponRes}
          setCouponRes={setCouponRes}
          couponModalOnPress={couponModalOnPress}
          couponLoading={couponLoading}
          cartTotal={cartTotal}
        />
      ) : null} */}
    </KeyboardAwareScrollView>
  );
};
export default OrderSummary;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: COLORS.WHITE.d0,
  //   marginTop: 10,
  // },
  service: {
    color: COLORS.BLUE.d0,
    marginTop: 18,
    marginBottom: -10,
  },
  heading: {
    color: COLORS.BLUE.d0,
  },
  label: {
    marginLeft: 12,
    color: COLORS.PRIMARY.d1,
  },
  total: {
    marginTop: 14,
    backgroundColor: COLORS.BLUE.d7,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dateText: {
    color: COLORS.PRIMARY.d1,
  },
  date: {
    paddingLeft: 8,
  },
  content: {
    color: COLORS.PRIMARY.d1,
    marginTop: 8,
  },
  input: {
    marginTop: 8,
    padding: 14,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: COLORS.GRAY.d8,
  },
});
