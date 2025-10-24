import React, { useEffect } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";
// import i18n, { changeLanguage } from "@/src/i18n";
import { useAppConfig } from "@/src/context/ConfigProvider";
import Header from "@/src/components/Header";
import Icon from "@/src/icons/Icon";
import Divider from "@/src/components/Divider";
import { router } from "expo-router";
import { colors } from "@/src/styles/theme";
import { useLanguageManager } from "@/src/i18n/useLanguageManager";

const languageItems = [
  {
    code: "en",
    label: "English",
    flag: require("../../../../icons/flags/uk.png"),
  },
  {
    code: "fr",
    label: "Français",
    flag: require("../../../../icons/flags/fr.png"),
  },
  {
    code: "hi",
    label: "हिन्दी",
    flag: require("../../../../icons/flags/in.png"),
  },
  {
    code: "ar",
    label: "العربية",
    flag: require("../../../../icons/flags/ua.png"),
  },
];

const Languages = () => {
  const { appConfig } = useAppConfig();
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage } = useLanguageManager();

  // const handleLanguageChange = (code) => {
  //   changeLanguage(code);
  //   router.back();
  // };

  const handleLanguageChange = (code: string) => {
    const isRtl = ["ar"].includes(code);
    const requiresReload = i18n.dir() !== (isRtl ? "rtl" : "ltr");

    // Only go back if no restart is needed.
    if (!requiresReload) {
      changeLanguage(code);
      router.back();
    } else {
      changeLanguage(code);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleLanguageChange(item.code)}
      className="flex-row items-center justify-between px-5 py-5"
    >
      <View className="flex-row items-center">
        <Image source={item.flag} className="h-8 w-8" resizeMode="contain" />
        <Text className="ml-3 text-md  capitalize color-black">
          {t(item.label)}
        </Text>
      </View>
      {i18n.language === item.code && (
        <Icon
          name="check"
          size={24}
          color={appConfig?.theme?.buttonColor || colors.buttonColor}
        />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: appConfig?.theme?.primaryColor || colors.primaryColor,
      }}
    >
      <Header />
      <View className="flex-1 bg-white">
        <FlatList
          data={languageItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
    </SafeAreaView>
  );
};

export default Languages;
