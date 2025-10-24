import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useService } from "../context/ServiceProvider";
import Loading from "./ui/Loading";
import { colors } from "../styles/theme";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { showToast } from "../utils/CommonFunctions";
import { useTranslation } from "react-i18next";

interface ServiceProps {
  serviceListData: any;
  serviceMsg: string;
}

const Service = ({ serviceListData, serviceMsg }: ServiceProps) => {
  const isFocused = useIsFocused();
  const { selectedHomeServices, setSelectedHomeServices } = useService();

  const { t } = useTranslation();
  const [btnActive, setBtnActive] = useState(false);

  useEffect(() => {
    // setSelectedHomeServices([]);
  }, [isFocused]);

  useEffect(() => {
    if (selectedHomeServices?.length > 0) {
      setBtnActive(true);
    } else {
      setBtnActive(false);
    }
  }, [selectedHomeServices]);

  const onTilePress = (newItem: any) => {
    setSelectedHomeServices((prevItems: any) => {
      // Check if the new item's ServiceCode already exists in the state
      const itemIndex = prevItems.findIndex(
        (item: any) => item?.ServiceCode === newItem?.ServiceCode
      );

      if (itemIndex !== -1) {
        // If it exists, remove the item from the array
        return prevItems?.filter(
          (item: any) => item?.ServiceCode !== newItem?.ServiceCode
        );
      } else {
        // If it doesn't exist, add the new item to the array
        return [...prevItems, newItem];
      }
    });
  };

  const onPerss = () => {
    if (selectedHomeServices?.length > 0) {
      router.push({
        pathname: "/(app)/screens/service/RequestPickup",
        params: { stepId: 1 },
      });
    } else {
      showToast(t("home.select_service"));
    }
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable
        onPress={() => onTilePress(item)}
        className="border border-primary px-4 py-4 mx-1 mt-8 items-center justify-center"
        style={[
          index === 0 ? styles.serviceButtonLeft : {},
          index === serviceListData.length - 1 ? styles.serviceButtonRight : {},
          { width: Dimensions.get("window").width / 3 },
          selectedHomeServices?.includes(item)
            ? { backgroundColor: colors.defaultBackgroundColor }
            : {},
        ]}
      >
        <Image source={item?.ServiceURL} style={{ height: 45, width: 45 }} />
        <Text className="text-center mt-2">{item?.ServiceName}</Text>
      </Pressable>
    );
  };

  return (
    <View className="bg-white">
      <View className="items-center">
        <Text className="text-defaultBlack  text-base  mt-8">
          {t("home.select_service")}
        </Text>
        <View className="h-0.5 rounded w-20 bg-buttonColor mt-3" />
      </View>
      {serviceListData?.length > 0 ? (
        <>
          <FlatList
            className="px-5"
            contentContainerStyle={
              serviceListData?.length > 1
                ? { paddingRight: 25 }
                : { paddingRight: 20 }
            }
            data={serviceListData}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          <View className="items-center">
            <Pressable
              disabled={!btnActive}
              onPress={onPerss}
              className={`mt-5 px-20 py-5 rounded-full  ${
                btnActive ? "bg-buttonColor" : "bg-defaultBackgroundColor"
              }`}
            >
              <Text className="text-defaultWhite font-semibold text-base">
                {t("home.schedule_pickup")}
              </Text>
            </Pressable>
          </View>
          <View className="w-full h-6 mt-5 bg-defaultBackgroundColor"></View>
        </>
      ) : (
        <View className="items-center my-20 px-2">
          {serviceMsg ? <Text className="">{serviceMsg}</Text> : null}
        </View>
      )}
    </View>
  );
};
export default Service;
const styles = StyleSheet.create({
  serviceButtonRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  serviceButtonLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
});
