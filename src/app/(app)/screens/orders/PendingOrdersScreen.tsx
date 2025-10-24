import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import defaultClient from "@/src/lib/qdc-api";
import Pill from "@/src/components/orders/Pill";
import icons from "@/src/icons/icons";
import { formatCurrency, formatOrderNumber } from "@/src/utils/CommonFunctions";
import { router } from "expo-router";
import CommonLoading from "@/src/components/CommonLoading";
import Divider from "@/src/components/Divider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import config from "@/config";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const PendingOrdersScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, customerCode } = useUser();
  const { storeDetails, isNetAmountDecimal } = useStore();
  // const { setPendingOrdersData } = useStore();

  // useState
  const [ordersData, setOrdersData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Date translation functions
  const translateDate = (dateString: string) => {
    if (!dateString) return dateString;

    // Parse date format like "03 Oct 2025" or "06 Aug 2024"
    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const translatedMonth = t(`date_formatting.months.${month}`);
      return `${day} ${translatedMonth} ${year}`;
    }
    return dateString;
  };

  // useEffects
  useEffect(() => {
    setLoading(true);
    if (clientId && branchId && customerCode) {
      defaultClient
        .getMyOrders(clientId, branchId, customerCode)
        .then((res: any) => {
          console.log("MY ORDERS API RESPONSE:", JSON.stringify(res, null, 2));
          console.log("Order Details:", res[0]?.OrderDetails);

          if (res[0]?.OrderDetails) {
            console.log(
              "Status values found:",
              res[0].OrderDetails.map((item: any) => ({
                OrderNo: item?.OrderNo,
                Status: item?.Status,
                StoreName: item?.StoreName,
              }))
            );
          }

          setOrdersData(res[0]?.OrderSummary?.[0]);
          setOrderDetails(res[0]?.OrderDetails);
          setLoading(false);
        });
    }
  }, [isFocused, clientId, branchId, customerCode]);

  const renderItem = ({ item }: any) => {
    const translatedStatus = t(`order_status.${item?.Status}`);

    const translatedDate = translateDate(item?.OrderDate);

    // console.log("Pending Orders Date Translation:", {
    //   original: item?.OrderDate,
    //   translated: translatedDate,
    //   language: i18n.language,
    // });

    return (
      <>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(app)/screens/orders/OrderDetailsScreen",
              params: item,
              // // params: { item: item, orderStatus: "pending" },
            });
          }}
          className="flex-row items-center justify-between px-4 py-4 my-4"
        >
          <View className="flex-col items-start justify-between">
            <Text className="text-md mb-4 font-bold capitalize">
              {formatOrderNumber(item?.OrderNo)}
            </Text>

            <Text className="font-semibold capitalize">{translatedDate}</Text>
          </View>

          <View className="flex-col items-start justify-between">
            <View className="flex-row items-center justify-center">
              <View
                className={`h-3 w-3 bg-pendingStatusColor mb-1 rounded-full ${
                  item?.Status === "READY"
                    ? "bg-readyStatusColor"
                    : "bg-pendingStatusColor"
                }`}
              ></View>
              <Text className="text-md font-semibold uppercase pl-2">
                {translatedStatus}
              </Text>
            </View>

            <Text className="text-md font-semibold capitalize">
              {item?.StoreName}
            </Text>
          </View>

          <View className="flex-col items-end justify-between">
            <Text className="text-md font-semibold capitalize">
              {formatCurrency(
                item?.PendingAmount ?? 0,
                storeDetails?.Currency ?? config.currency,
                item?.PendingAmount % 1 !== 0 ? 2 : 0
              )}
            </Text>

            <View className="flex-row items-center justify-between w-16 ">
              {icons.garment(
                appConfig?.theme?.primaryColor ?? colors.primaryColor
              )}
              <Text className="text-md font-semibold capitalize pl-1">
                {item?.PendingGarment}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <Divider />
      </>
    );
  };

  return (
    <View className="flex-1 bg-defaultWhite">
      <View className="bg-primary">
        <View className="flex-row items-center jusitfy-between my-3">
          <Pill
            label={t("orders.orders")}
            icon={icons.order(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={ordersData?.TotalOrder}
          />
          <Pill
            label={t("orders.processing")}
            icon={icons.garment(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={ordersData?.ProcessCloth}
          />
        </View>
        <View className="flex-row items-center jusitfy-between my-3">
          <Pill
            label={t("orders.due")}
            icon={icons.amount(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={formatCurrency(
              ordersData?.TotalAmount ?? 0,
              storeDetails?.Currency ?? config.currency,
              ordersData?.TotalAmount % 1 !== 0 ? 2 : 0
            )}
          />
          <Pill
            label={t("orders.ready")}
            icon={icons.garment(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            value={ordersData?.ReadyCloth}
          />
        </View>
      </View>

      {!orderDetails && (
        <View className="flex-1 bg-defaultWhite px-1 items-center justify-center ">
          <Text className="text-black text-center font-semibold text-base">
            {t("orders.no_orders")}
          </Text>
        </View>
      )}

      {orderDetails && (
        <View className="flex-1 bg-defaultWhite px-2">
          {!loading ? (
            <FlatList
              data={orderDetails}
              renderItem={renderItem}
              ListFooterComponent={() => <View style={{ height: 20 }}></View>}
            />
          ) : (
            <View className="flex-1 items-center justify-center"></View>
          )}
        </View>
      )}

      {ordersData?.TotalAmount > 0 ? (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(app)/screens/payment/AmountDueScreen",
              params: { type: "", orderNumber: "" },
            })
          }
          className="items-center justify-center py-6 bg-buttonColor"
        >
          <Text className="text-md font-bold color-defaultWhite capitalize">
            {t("orders.pay_now")}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
export default PendingOrdersScreen;
