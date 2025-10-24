import { colors } from "@/src/styles/theme";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { Image } from "expo-image";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Package from "./Package";
import CommonLoading from "../CommonLoading";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface AvailablePackagesProps {
  availablePackagesData: any;
  index: any;
  loading?: boolean;
}

const AvailablePackages = ({
  availablePackagesData,
  index,
  loading,
}: AvailablePackagesProps) => {
  const { t } = useTranslation();
  // console.log({ availablePackagesData });

  const renderItem = ({ item }: any) => {
    // console.log({ item });

    return <Package item={item} index={index} />;
  };

  if (availablePackagesData?.length === 0) {
    return (
      <View className="flex-1 bg-defaultBackgroundColor px-1 items-center justify-center ">
        <Text className="text-black text-center font-semibold text-base">
          {t("packages.no_available_packages")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-defaultBackgroundColor px-1">
      {!loading ? (
        <FlatList
          data={availablePackagesData}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <CommonLoading />
        </View>
      )}
    </View>
  );
};
export default AvailablePackages;

const styles = StyleSheet.create({});
