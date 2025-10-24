import { Image } from "expo-image";
import { router } from "expo-router";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
const NotServicable = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-defaultWhite items-center justify-center">
        <View>
          <Image
            source={require("../../assets/title-logo.png")}
            style={{ height: 150, width: Dimensions.get("window").width / 2 }}
            contentFit="contain"
          />
        </View>
        <Text className="w-11/12 text-center text-md">
          {t("not_servicable.message")}
        </Text>
        <Pressable
          className="mt-20 bg-buttonColor py-4 px-10 rounded-sm"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="color-defaultWhite">
            {t("not_servicable.login")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
export default NotServicable;
