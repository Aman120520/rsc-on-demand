import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import {
  formatCurrency,
  formatOrderNumber,
  showToast,
} from "@/src/utils/CommonFunctions";
import Pill from "@/src/components/orders/Pill";
import icons from "@/src/icons/icons";
import { colors } from "@/src/styles/theme";
import CommonLoading from "@/src/components/CommonLoading";
import Divider from "@/src/components/Divider";
import { useIsFocused } from "@react-navigation/native";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import config from "@/config";
import { useTranslation } from "react-i18next";
import { useLanguageManager } from "@/src/i18n/useLanguageManager";
import moment from "moment";

const OrderDetailsScreen = () => {
  const { t } = useTranslation();
  const { isLoading: isTranslationsLoading } = useLanguageManager();
  const isFocused = useIsFocused();

  // Date translation function
  const translateDate = (dateString: string) => {
    if (!dateString) return "";

    // Try different date formats
    let momentDate = moment(dateString);

    // If invalid, try common formats
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
      return dateString; // Return original if can't parse
    }

    const day = momentDate.format("Do");
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

  const { setAppConfig, appConfig } = useAppConfig();
  // params
  const item: any = useLocalSearchParams();

  // context API
  const { clientId, branchId } = useUser();
  const { storeDetails } = useStore();

  // useState
  const [loading, setLoading] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isPendingOrder, setIsPendingOrder] = useState<boolean>(false);

  // useEffects
  useEffect(() => {
    if (item && item?.OrderNo) {
      setIsPendingOrder(true);
    } else {
      setIsPendingOrder(false);
    }
  }, [item]);

  useEffect(() => {
    if (item && clientId && branchId) {
      setLoading(true);
      defaultClient
        .getOrderDetails(
          clientId,
          branchId,
          item?.OrderNo ? item?.OrderNo : item?.BookingNumber
        )
        .then((res: any) => {
          console.log(
            "ORDER DETAILS API RESPONSE:",
            JSON.stringify(res, null, 2)
          );

          if (res && res.length > 0) {
            console.log(
              "Order items with status:",
              res.map((item: any) => ({
                GarmentName: item?.item?.GarmentName,
                Status: item?.item?.Status,
                Services: item?.item?.Services,
              }))
            );
          }

          setOrderDetails(res);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          showToast(err);
        });
    }
  }, [clientId, branchId, isFocused]);

  // render Items
  const renderItem = useMemo(
    () => (product: any) => {
      const statusKey = product?.item?.Status?.toUpperCase();
      const translatedStatus = isTranslationsLoading
        ? product?.item?.Status
        : t(`order_status.${statusKey}`);

      // console.log("Order Details Status Translation:", {
      //   original: product?.item?.Status,
      //   translated: translatedStatus,
      //   garmentName: product?.item?.GarmentName,
      //   isTranslationsLoading,
      // });

      return (
        <>
          <View className="flex-row items-center p-5">
            <Image
              //   key={index}
              style={styles.itemIcon}
              source={{ uri: product?.item?.IconUrl }}
              contentFit="contain"
              transition={1000}
            />
            <View className="flex-col ml-5">
              <Text className="my-3 text-md font-bold color-defaultTextColor">
                {product?.item?.GarmentName}
              </Text>
              <Text className="my-3 text-sm">{product?.item?.Services}</Text>
              <Text className="my-3 text-left text-md font-bold color-primary">
                {translatedStatus}
              </Text>
            </View>
          </View>
          <Divider />
        </>
      );
    },
    [orderDetails, t, isTranslationsLoading]
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      {/* Navigation */}
      <View className="flex-row items-center justify-between px-5 mt-5">
        <Text className="text-base font-bold color-defaultWhite">
          {t("orders.order_details")}
        </Text>
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          {icons.close(colors.defaultWhite)}
        </Pressable>
      </View>

      {/* Header */}
      <View className="bg-primary">
        <View className="flex-row items-center justify-between my-5">
          <Pill
            label={t("common.id")}
            icon={icons.order(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={formatOrderNumber(
              isPendingOrder ? item?.OrderNo : item?.BookingNumber
            )}
          />
          <Pill
            label={isPendingOrder ? t("payment.date") : t("orders.delivered")}
            icon={icons.pickup(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={
              isPendingOrder
                ? item?.DueDate
                  ? (() => {
                      console.log("🔍 DueDate raw value:", item.DueDate);
                      return translateDate(item.DueDate);
                    })()
                  : ""
                : item?.DeliveredOn
                ? (() => {
                    console.log("🔍 DeliveredOn raw value:", item.DeliveredOn);
                    return translateDate(item.DeliveredOn);
                  })()
                : ""
            }
          />
        </View>

        <View className="flex-row items-center justify-between my-5 -mt-4">
          <Pill
            label={t("common.amount")}
            icon={icons.amount(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            // value={formatCurrency(
            //   isPendingOrder ? item?.TotalAmount : item?.NetAmount,
            //   storeDetails?.Currency ?? config.currency,
            //   2
            // )}
            value={
              isPendingOrder
                ? formatCurrency(
                    isPendingOrder && item?.TotalAmount,
                    storeDetails?.Currency ?? config.currency,
                    item?.TotalAmount % 1 !== 0 ? 2 : 0
                  )
                : formatCurrency(
                    !isPendingOrder && item?.NetAmount,
                    storeDetails?.Currency ?? config.currency,
                    item?.NetAmount % 1 !== 0 ? 2 : 0
                  )
            }
          />
          <Pill
            label={t("common.total")}
            icon={icons.garment(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={isPendingOrder ? item?.TotalGarments : item?.Quantity}
          />
        </View>

        {isPendingOrder ? (
          <View className="flex-row items-center justify-between my-5 -mt-4">
            <Pill
              label={t("common.due")}
              icon={icons.amount(
                appConfig?.theme?.primaryColor ?? colors.primaryColor
              )}
              value={formatCurrency(
                item?.PendingAmount ?? 0,
                storeDetails?.Currency ?? config.currency,
                item?.PendingAmount % 1 !== 0 ? 2 : 0
              )}
            />
            <Pill
              label={t("common.pending")}
              icon={icons.garment(
                appConfig?.theme?.primaryColor ?? colors.primaryColor
              )}
              value={item?.PendingGarment}
            />
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View className="flex-1 bg-defaultWhite">
        {!loading ? (
          <FlatList
            data={orderDetails}
            renderItem={renderItem}
            ListFooterComponent={() => <View style={{ height: 20 }}></View>}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <CommonLoading />
          </View>
        )}

        {isPendingOrder && item?.PendingAmount > 0 ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/screens/payment/AmountDueScreen",
                params: {
                  type: "orderwisePayment",
                  orderNumber: item?.OrderNo,
                },
                // params: { amount: item?.PendingAmount },
              })
            }
            className="items-center justify-center bg-buttonColor py-6"
          >
            <Text className="text-md font-bold color-defaultWhite capitalize">
              {t("orders.pay_now")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  itemIcon: {
    width: 60,
    height: 60,
  },
});
