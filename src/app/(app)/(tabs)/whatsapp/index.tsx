import { useEffect } from "react";
import Header from "@/src/components/Header";
import { colors } from "@/src/styles/theme";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Whatsapp = () => {
  const isFocused = useIsFocused();

  useEffect(() => {
    router.push("/(app)/(tabs)/home");
  }, [isFocused]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.defaultWhite }}>
      <Header />
    </SafeAreaView>
  );
};

export default Whatsapp;
