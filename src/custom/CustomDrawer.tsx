import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../styles/theme";
import Icon from "../icons/Icon";
import { useUser } from "../context/UserProvider";
import Divider from "../components/Divider";
import { router } from "expo-router";
import { useAppConfig } from "../context/ConfigProvider";
import * as Application from "expo-application";
import { useLoginAlert } from "../context/LoginAlertProvider";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import defaultClient from "@/src/lib/qdc-api";

const CustomDrawer = () => {
  const { t } = useTranslation();
  const {
    user,
    setUser,
    signOut,
    setFcmToken,
    clientId,
    branchId,
    customerCode,
  } = useUser();
  const { appConfig } = useAppConfig();
  const showLoginAlert = useLoginAlert();

  const Header = () => {
    return (
      <View className="flex-row items-center bg-primary p-5">
        <View>
          {user ? (
            <View className="bg-defaultWhite p-5 rounded-full">
              <Icon
                name="person"
                color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="py-3 pl-1 flex-row items-center justify-center"
            >
              <FontAwesome5 name="user-lock" size={22} color="white" />
              <Text className="text-white text-lg font-semibold ml-6">
                {t("drawer.login_required")}
              </Text>
            </Pressable>
          )}
        </View>

        {user && (
          <View className="ml-4 flex-1">
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className="text-defaultWhite font-bold text-md"
            >
              {user?.name}
            </Text>
            <Text
              numberOfLines={4}
              ellipsizeMode="tail"
              className="text-defaultWhite text-sm leading-5 mt-1"
            >
              {user?.address}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const DrawerItems = () => {
    const logOut = async () => {
      setUser(null);
      setFcmToken(null);
      await Notifications.dismissAllNotificationsAsync();

      router.push("/LoadingScreen");
      setTimeout(() => {
        signOut();
      }, 1500);
    };

    const data = [
      {
        title: t("drawer.home") || "Home",
        icon: "home",
        path: "(app)/(tabs)/home",
        auth: false,
      },
      appConfig?.enablePackages && {
        title: t("tabs.packages") || "Packages",
        icon: "promotion",
        path: "(app)/(tabs)/packages",
        auth: false,
      },
      {
        title: t("drawer.request_pickup") || "Request Pickup",
        icon: "pickup",
        path: "(app)/screens/service/RequestPickup",
        auth: false,
      },
      // {
      //   title: "Services",
      //   icon: "garment",
      //   path: "(app)/screens/catalouge/CatalougeScreen",
      //   auth: false,
      // },
      user && {
        title: t("drawer.my_requests") || "My Requests",
        icon: "request",
        path: "(app)/screens/service/MyRequest",
        auth: true,
      },
      user && {
        title: t("drawer.my_orders") || "My Orders",
        icon: "order",
        path: "(app)/(tabs)/orders",
        auth: true,
      },
      user && {
        title: t("drawer.amount_due") || "Amount Due",
        icon: "amount",
        path: "(app)/screens/payment/AmountDueScreen",
        auth: true,
      },
      {
        title: t("drawer.price_list") || "Price List",
        icon: "price",
        path: "(app)/screens/pricelist/PriceList",
        auth: false,
      },
      appConfig?.enableReferral && {
        title: t("drawer.refer_and_earn") || "Refer & Earn",
        icon: "refer",
        path: "(app)/(tabs)/refer&earn",
        auth: true,
      },
      {
        title: t("drawer.contact_us") || "Contact Us",
        icon: "feedback",
        path: "(app)/screens/ContactUs",
        auth: false,
      },
      {
        title: t("drawer.settings") || "Settings",
        icon: "settings",
        path: "(app)/screens/setting/Settings",
        auth: false,
      },
      user && {
        title: t("drawer.log_out") || "Log Out",
        icon: "logout",
        path: "settings",
        onPress: () => logOut(),
      },
      !user && {
        title: t("drawer.log_in") || "Log In",
        icon: "logout",
        path: "settings",
        onPress: () => router.push("/(auth)/login"),
      },
    ]
      .filter(Boolean)
      .map((c, key) => ({ ...c, key }));

    return (
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <>
            <Pressable
              onPress={
                item.onPress
                  ? item.onPress
                  : () => {
                    if (item.auth && !user) {
                      return showLoginAlert(null, () => { });
                    }

                    router.push(`/${item.path}`);
                  }
              }
              className="flex flex-col px-6 py-5"
            >
              <View className="flex-row items-center">
                <Icon
                  name={item.icon}
                  color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
                  size={24}
                />
                <Text className="ml-8 text-md">{item.title}</Text>
              </View>
            </Pressable>
            <Divider />
          </>
        )}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <View className="flex-1 bg-defaultWhite">
        <Header />
        <DrawerItems />

        <Text className="text-center text-black text-heading font-semibold my-3">
          {t("drawer.version")}: {Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion})
        </Text>
      </View>
    </SafeAreaView>
  );
};
export default CustomDrawer;
