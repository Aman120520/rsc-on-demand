import CommonLoading from "@/src/components/CommonLoading";
import Header from "@/src/components/Header";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { showToast } from "@/src/utils/CommonFunctions";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import React, {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Notifications = () => {
  const isFocused = useIsFocused();

  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, customerCode } = useUser();
  const {
    notificationCount,
    setNotificationCount,
    notificationData,
    setNotificationData,
  } = useStore();
  const { t } = useTranslation();

  const SCREEN_WIDTH = Dimensions.get("screen").width;

  // useState
  const [loading, setLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any>([]);

  // useEffect
  useEffect(() => {
    setLoading(true);
    if (clientId && branchId && customerCode) {
      defaultClient
        .getPushNotification(clientId, branchId, customerCode)
        .then((res: any) => {
          if (res?.Message) {
            setLoading(false);
          }

          if (res?.length > 0) {
            // console.log("NOTIFICATION", JSON.stringify(res));
            // setNotifications(res);
            setNotificationData(res);
            setLoading(false);
          } else {
            // setNotifications([]);
            setNotificationData([]);
            setLoading(false);
          }
        });
    }
    // setNewNotification(false);
  }, [isFocused, clientId, branchId, customerCode]);

  // renderItem
  const renderItem = ({ item }: any) => {
    return (
      <View className="" style={[styles.tile, { width: SCREEN_WIDTH * 0.9 }]}>
        <Text className="text-md font-bold mb-4">{item?.Header}</Text>
        <Text className="mt-4 text-sm font-md">{item?.Body}</Text>
        <Text className="mt-4 text-sm font-md">{item?.NotificationTime}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <Header />

      <View className="flex-1 items-center justiy-center bg-defaultBackgroundColor">
        {notificationData?.length === 0 ? (
          <View className="bg-defaultWhite w-11/12 items-center my-10 py-5 rounded">
            <Text className="font-semibold">
              {t("pending.pending_notification")}
            </Text>
          </View>
        ) : null}

        {!loading ? (
          <FlatList
            data={notificationData}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <CommonLoading />
        )}
      </View>
    </SafeAreaView>
  );
};
export default Notifications;
const styles = StyleSheet.create({
  tile: {
    height: "auto",
    width: 350,
    backgroundColor: colors.defaultWhite,
    marginVertical: 10,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
