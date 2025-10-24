import { FlatList, StyleSheet, Text, View } from "react-native";
import StatusText from "./StatusText";
import { useTranslation } from "react-i18next";

interface MyOpenOrdersProps {
  openOrdersData: any;
}

const MyOpenOrders = ({ openOrdersData }: MyOpenOrdersProps) => {
  const { t } = useTranslation();
  const renderItem = ({ item }: any) => {
    return (
      <View className="flex-row  items-center justify-between  my-5">
        <View className="flex-1 items-center">
          <Text className="font-semibold">#{item?.OrderNo}</Text>
        </View>
        <View className="flex-1 items-center">
          <StatusText status={item?.Status} />
        </View>
      </View>
    );
  };

  return (
    <View className="mt-6">
      <View className="items-center">
        <Text className="text-base">My Open Orders</Text>
        <View className="h-0.5 rounded w-20 bg-buttonColor mt-3" />
      </View>
      <View className="flex-row w-full items-center justify-between px-5 mt-4">
        <View className="flex-1 border border-primary items-center mx-1 py-3">
          <Text className="font-bold">Order Number</Text>
        </View>
        <View className="flex-1 border border-primary items-center mx-1 py-3">
          <Text className="font-bold">Order Status</Text>
        </View>
      </View>

      {openOrdersData?.length > 0 ? (
        <FlatList
          className="px-5"
          data={openOrdersData}
          renderItem={renderItem}
        />
      ) : (
        <View className="items-center justify-center my-8">
          <Text>{t("pending.pending_order")}</Text>
        </View>
      )}
    </View>
  );
};
export default MyOpenOrders;

const styles = StyleSheet.create({});
