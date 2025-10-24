import config from "@/config";
import CommonLoading from "@/src/components/CommonLoading";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import icons from "@/src/icons/icons";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { formatCurrency, formatOrderNumber } from "@/src/utils/CommonFunctions";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
const CompletedOrdersScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, customerCode } = useUser();
  const { storeDetails } = useStore();

  // useState
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);

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
    if (clientId && customerCode) {
      defaultClient
        .getCompletedOrders(clientId, customerCode)
        .then((res: any) => {
          // console.log("COMPLETED ORDERS", JSON.stringify(res));
          setData(res);
          setLoading(false);
        });
    }
  }, [isFocused, clientId, customerCode]);

  // renderItems
  const renderItem = ({ item }: any) => {
    // Translate the date
    const translatedDate = translateDate(item?.OrderDate);

    // console.log("Completed Orders Date Translation:", {
    //   original: item?.OrderDate,
    //   translated: translatedDate,
    //   language: t.language,
    // });

    return (
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
            {formatOrderNumber(item?.BookingNumber)}
          </Text>

          <Text className="font-semibold capitalize">{translatedDate}</Text>
        </View>

        <View className="flex-col">
          <View className="flex-row items-center">
            <View
              className={`h-3 w-3 bg-pendingStatusColor mb-1 rounded-full ${
                item?.Status === "READY"
                  ? "bg-readyStatusColor"
                  : "bg-pendingStatusColor"
              }`}
            ></View>
            <Text className="text-md font-semibold uppercase pl-2">
              {t("orders.delivered")}
            </Text>
          </View>

          <Text className="text-md font-semibold capitalize">
            {item?.BranchName}
          </Text>
        </View>

        <View className="flex-col items-end justify-between">
          <Text className="text-md font-semibold capitalize">
            {formatCurrency(
              item?.NetAmount ?? 0,
              storeDetails?.Currency ?? config.currency,
              item?.NetAmount % 1 !== 0 ? 2 : 0
            )}
          </Text>

          <View className="flex-row items-center justify-between w-16 ">
            {icons.garment(
              appConfig?.theme?.primaryColor ?? colors.primaryColor
            )}
            <Text className="text-md font-semibold capitalize pl-1">
              {item?.Quantity}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (data?.length === 0) {
    return (
      <View className="flex-1 bg-defaultWhite px-1 items-center justify-center ">
        <Text className="text-black text-center font-semibold text-base">
          {t("orders.no_orders")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-defaultWhite px-2">
      {!loading ? (
        <FlatList data={data} renderItem={renderItem} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <CommonLoading />
        </View>
      )}
    </View>
  );
};
export default CompletedOrdersScreen;
const styles = StyleSheet.create({});
