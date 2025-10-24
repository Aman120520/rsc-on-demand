import { FlatList, StyleSheet, Text, View } from "react-native";
import Package from "./Package";
import CommonLoading from "../CommonLoading";
import { useTranslation } from "react-i18next";

interface ActivePackagesData {
  index: any;
  activePackagesData: any;
  loading?: boolean;
}

const ActivePackages = ({
  index,
  activePackagesData,
  loading,
}: ActivePackagesData) => {
  const { t } = useTranslation();
  const renderItem = ({ item }: any) => {
    // console.log({ item });

    return <Package item={item} index={index} />;
  };

  if (activePackagesData?.length === 0) {
    return (
      <View className="flex-1 bg-defaultBackgroundColor px-1 items-center justify-center ">
        <Text className="text-black text-center font-semibold text-base">
          {t("packages.no_active_packages")}
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-defaultBackgroundColor px-1">
      {!loading ? (
        <FlatList
          data={activePackagesData}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      ) : (
        <CommonLoading />
      )}
    </View>
  );
};
export default ActivePackages;
const styles = StyleSheet.create({});
