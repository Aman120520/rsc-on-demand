import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/src/styles/theme";
import Header from "@/src/components/Header";
import { Platform, useWindowDimensions } from "react-native";

import TabBarCustom from "@/src/custom/TabBarCustom";
import { SceneMap, TabView } from "react-native-tab-view";
import PendingOrdersScreen from "../../screens/orders/PendingOrdersScreen";
import CompletedOrdersScreen from "../../screens/orders/CompletedOrdersScreen";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useUser } from "@/src/context/UserProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const MyOrdersScreen = () => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const { user } = useUser();

  const { setAppConfig, appConfig } = useAppConfig();
  const [index, setIndex] = useState(0);
  const getPendingTitle = () => {
    switch (i18n.language) {
      case "en":
        return "Pending";
      case "fr":
        return "en attente";
      case "hi":
        return "लंबित";
      case "ar":
        return "قيد الانتظار";
      default:
        return "Pending";
    }
  };

  const getCompletedTitle = () => {
    switch (i18n.language) {
      case "en":
        return "Completed";
      case "fr":
        return "Terminé";
      case "hi":
        return "पूर्ण";
      case "ar":
        return "مكتمل";
      default:
        return "Completed";
    }
  };

  const routes = useMemo(
    () => [
      { key: "pending", title: getPendingTitle() },
      { key: "completed", title: getCompletedTitle() },
    ],
    [i18n.language]
  );

  const [key, setKey] = useState("pending");

  const PendingOrders = () => <PendingOrdersScreen />;

  const CompletedOrders = () => <CompletedOrdersScreen />;

  const renderTabBar = (props: object) => (
    <TabBarCustom index={index} setIndex={setIndex} {...props} />
  );

  const renderScene = SceneMap({
    pending: PendingOrders,
    completed: CompletedOrders,
  });

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center"></SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
        paddingBottom: -50,
      }}
    >
      <Header />

      <TabView
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: width }}
      />
    </SafeAreaView>
  );
};
export default MyOrdersScreen;
