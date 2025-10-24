import AboutListing from "@/src/components/about/AboutListing";
import Content from "@/src/components/about/Content";
import Header from "@/src/components/Header";
import Loading from "@/src/components/ui/Loading";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AboutUs = () => {
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId } = useUser();

  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [heading, setHeading] = useState("");
  const [currentHeading, setCurrentHeading] = useState("");

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient.storeAboutDetails(clientId, branchId).then((res: any) => {
        setData(res);
      });
    }
  }, []);

  if (currentHeading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
        }}
      >
        <Header />
        <View className="flex-1 bg-defaultWhite px-5 py-4">
          <Content
            data={data}
            currentHeading={currentHeading}
            setCurrentHeading={setCurrentHeading}
          />
        </View>
        <Pressable
          onPress={() => setCurrentHeading("")}
          className="bg-buttonColor items-center py-5"
        >
          <Text className="text-md color-defaultWhite">{t("common.back")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <Header />
      <View className="flex-1 bg-white">
        <AboutListing
          data={data}
          heading={heading}
          setHeading={setHeading}
          currentHeading={currentHeading}
          setCurrentHeading={setCurrentHeading}
        />
      </View>
    </SafeAreaView>
  );
};

export default AboutUs;
