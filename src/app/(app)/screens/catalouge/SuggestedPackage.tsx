import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { colors } from "@/src/styles/theme";
import { CONSTANTS } from "@/src/utils/constants";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface SuggestedPackageProps {
  data: any;
}

const SuggestedPackage = ({ data }: SuggestedPackageProps) => {
  const { appConfig } = useAppConfig();
  const { t } = useTranslation();
  // renderItems
  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        className="my-3 mr-4"
        onPress={() =>
          router.push({
            pathname: "/screens/package/PackageDetailsScreen",
            params: {
              id: item?.PackageID,
              isActivePackage: item?.AssignID ? "true" : "false",
              navigation: "pricelist",
            },
          })
        }
      >
        <Image
          style={[styles.image]}
          className="shadow-lg"
          source={item?.ImageURL}
          placeholder={CONSTANTS.imagePlaceholder}
          contentFit="cover"
          transition={1000}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="bg-primary/50 my-5 py-4"
      style={{
        backgroundColor: `${appConfig?.theme?.primaryColor || "#000"}55`,
      }}
    >
      <Text className="text-[15px] font-semibold color-buttonColor px-5">
        {t("home.save_prepaid_packs")}
      </Text>
      {data?.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            data?.length > 1 ? { paddingLeft: 20 } : { paddingLeft: 25 }
          }
        />
      ) : (
        <View style={{ height: 90 }}></View>
      )}
    </View>
  );
};

export default SuggestedPackage;

const styles = StyleSheet.create({
  image: {
    width: 140,
    height: 90,
    borderRadius: 14,
    resizeMode: "contain",
    backgroundColor: colors.defaultWhite,
  },
});
