import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../icons/Icon";
import config from "@/config";
import { colors } from "../styles/theme";
import { useStore } from "../context/StoreProvider";
import { router } from "expo-router";

const HomeActionButtons = () => {
  const { dialNumber } = useStore();
  const getCallButtonName = () => {
    return config.callBtnName;
  };

  const getWhatsappLink = () => {
    return `https://wa.me/${config.whatsappNumber}`;
  };

  const handleWhatsApp = () => {
    Linking.openURL(getWhatsappLink()).catch((/* e */) => {});
  };

  const onCall = () => {
    if (dialNumber !== "") {
      Linking.openURL(`tel:${dialNumber}`).catch(() => {});
    }
  };

  return (
    <View className="flex-row items-center justify-center bg-defaultBackgroundColor px-5">
      <Pressable
        onPress={onCall}
        className="flex-1 mx-2 px-6 py-4 bg-primary flex-row items-center justify-center rounded-full my-4"
      >
        <Icon name="phone" color={colors.buttonTextColor} />
        <Text className="mx-5 text-defaultWhite">{getCallButtonName()}</Text>
      </Pressable>
      {config.whatsappNumber !== "" ? (
        <Pressable
          onPress={handleWhatsApp}
          className="flex-1 mx-2 px-6 py-4 bg-primary flex-row items-center justify-center rounded-full my-4"
        >
          <Icon name="whatsapp" color={colors.buttonTextColor} />
          <Text className="mx-5 text-defaultWhite">WhatsApp</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push("/(app)/screens/pricelist/PriceList")}
          className="flex-1 mx-2 px-6 py-4 bg-primary flex-row items-center justify-center rounded-full my-4"
        >
          <Icon name="price" color={colors.buttonTextColor} />
          <Text className="mx-5 text-defaultWhite">Pricelist</Text>
        </Pressable>
      )}
    </View>
  );
};

export default HomeActionButtons;
