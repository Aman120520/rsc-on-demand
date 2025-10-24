import Header from "@/src/components/Header";
import ActivePackages from "@/src/components/packages/ActivePackages";
import AvailablePackages from "@/src/components/packages/AvailablePackages";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useService } from "@/src/context/ServiceProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import TabBarCustom from "@/src/custom/TabBarCustom";
import i18n from "@/src/i18n";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap } from "react-native-tab-view";

const Packages = () => {
  const { width } = useWindowDimensions();

  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { availablePackagesData, activePackagesData } = useStore();

  const [index, setIndex] = useState(0);
  // const [routes] = useState([
  //   { key: "available", title: "Available" },
  //   { key: "active", title: "Active" },
  // ]);
  const getAvailableTitle = () => {
    switch (i18n.language) {
      case "en":
        return "Available";
      case "fr":
        return "Disponible";
      case "hi":
        return "उपलब्ध";
      case "ar":
        return "متاح";
      default:
        return "Available";
    }
  };

  const getActiveTitle = () => {
    switch (i18n.language) {
      case "en":
        return "Active";
      case "fr":
        return "Actif";
      case "hi":
        return "सक्रिय";
      case "ar":
        return "نشط";
      default:
        return "Active";
    }
  };

  const routes = useMemo(
    () => [
      { key: "available", title: getAvailableTitle() },
      { key: "active", title: getActiveTitle() },
    ],
    [i18n.language]
  );
  const [loading, setLoading] = useState(false);

  const AvailableRoute = () => (
    <AvailablePackages
      index={index}
      availablePackagesData={availablePackagesData}
      loading={loading}
    />
  );

  const ActiveRoute = () => (
    <ActivePackages
      activePackagesData={activePackagesData}
      index={index}
      loading={loading}
    />
  );

  const renderTabBar = (props: object) => (
    <TabBarCustom index={index} setIndex={setIndex} {...props} />
  );

  const renderScene = SceneMap({
    available: AvailableRoute,
    active: ActiveRoute,
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <View className="flex-1">
        <Header />

        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: width }}
        />
      </View>
    </SafeAreaView>
  );
};
export default Packages;
