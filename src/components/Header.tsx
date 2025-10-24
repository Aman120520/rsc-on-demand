import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "../icons/Icon";
import { router, useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { NOTIFICATION_COUNT, useStore } from "../context/StoreProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../styles/theme";
import config from "@/config";
import { useAppConfig } from "../context/ConfigProvider";
import { useLoginAlert } from "../context/LoginAlertProvider";
import { useUser } from "../context/UserProvider";

const Header = ({ headerTitle }: { headerTitle?: string }) => {
  const navigation = useNavigation();

  const { appConfig } = useAppConfig();
  const { notificationCount, setNotificationCount } = useStore();
  const showLoginAlert = useLoginAlert();
  const { user } = useUser();

  return (
    <>
      <View className="h-14 px-4 flex-row items-center justify-between bg-defaultWhite">
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer)}
        >
          <Icon
            name="menu2"
            color={appConfig?.theme?.buttonColor ?? colors.buttonColor}
            size={24}
          />
          {/* <SvgXml xml={MENU} /> */}
        </TouchableOpacity>
        {appConfig?.showToolbarLogo && !headerTitle ? (
          <View>
            <Image
              source={require("../assets/title-logo.png")}
              style={{ height: 120, width: 120 }}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {headerTitle ? (
          <View className="items-center justify-center bg-defaultWhite py-2">
            <Text className="text-lg font-md text-black text-center">
              {headerTitle}
            </Text>
            <View className="bg-buttonColor h-0.5 w-20 my-1"></View>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            if (!user) {
              return showLoginAlert(null, () => {});
            }

            router.push("/(app)/screens/Notifications");
            setNotificationCount(0);
            AsyncStorage.setItem(NOTIFICATION_COUNT, "0");
          }}
        >
          <View>
            {notificationCount === 0 ? (
              <Icon
                name="notificationWithoutAlert"
                color={appConfig?.theme?.buttonColor ?? colors.buttonColor}
              />
            ) : // <SvgXml xml={NOTIFICATION_WITHOUT_ALERT} />
            notificationCount > 0 ? (
              <>
                {/* <View className="relative z-10 -mt-5">
                  <View className="abosulte top-4 left-2 py-1 px-2.5 bg-red-500 rounded-full z-index-10 items-center justify-center">
                    <Text className="color-defaultWhite">
                      {notificationCount}
                    </Text>
                  </View>
                </View> */}
                <Icon
                  name="notificationWithAlert"
                  color={appConfig?.theme?.buttonColor ?? colors.buttonColor}
                />
                {/* <SvgXml xml={NOTIFICATION_WITH_ALERT} /> */}
              </>
            ) : (
              <Icon
                name="notificationWithoutAlert"
                color={appConfig?.theme?.buttonColor ?? colors.buttonColor}
              />
              // <SvgXml xml={NOTIFICATION_WITHOUT_ALERT} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};
export default Header;
const styles = StyleSheet.create({});
