import { colors } from "@/src/styles/theme";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ServiceNotAvailable = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-defaultWhite items-center justify-center">
      <Image
        source={require("../../assets/title-logo.png")}
        style={{ height: 150, width: Dimensions.get("window").width / 2 }}
        resizeMode="contain"
      />

      <Text className="w-11/12 text-center text-md">
        We don't cover the requested area as of now. We are expanding fast and
        will keep you posted.
      </Text>
      <Pressable
        className="mt-20 bg-buttonColor py-4 px-10 rounded-sm"
        onPress={() => router.back()}
      >
        <Text className="color-defaultWhite">{t("common.go_back")}</Text>
      </Pressable>
    </View>
  );
};
export default ServiceNotAvailable;

const styles = StyleSheet.create({});
