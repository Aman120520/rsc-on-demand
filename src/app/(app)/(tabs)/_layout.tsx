import { Alert, Linking, Platform, View } from "react-native";
import { router, Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "@/src/styles/theme";
import Icon from "@/src/icons/Icon";
import config from "@/config";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useUser } from "@/src/context/UserProvider";
import { useLoginAlert } from "@/src/context/LoginAlertProvider";
import { useTranslation } from "react-i18next";

const tabData = [
  {
    name: "home",
    iconName: "home_bottom",
  },
  {
    name: "orders",
    iconName: "orders_bottom",
  },
  {
    name: "whatsapp",
    iconName: "whatsapp_bottom",
  },
  {
    name: "packages",
    iconName: "packages_bottom",
  },
  {
    name: "refer&earn",
    iconName: "refer_bottom",
  },
];

const TabsLayout = () => {
  const { t } = useTranslation();
  const { appConfig } = useAppConfig();

  const { user } = useUser();

  const showLoginAlert = useLoginAlert();

  const getWhatsappLink = () => {
    return `https://wa.me/${
      appConfig?.whatsappNumber ?? config.whatsappNumber
    }`;
  };

  const handleWhatsApp = () => {
    Linking.openURL(getWhatsappLink()).catch((/* e */) => {});
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="home"
      backBehavior="history"
    >
      {tabData?.map((item, index) => {
        const shouldDisable =
          (item.name === "refer&earn" && !appConfig?.enableReferral) ||
          (item.name === "packages" && !appConfig?.enablePackages);

        return (
          <Tabs.Screen
            key={index.toString()}
            name={item?.name}
            listeners={() => ({
              tabPress: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                if (item.name === "whatsapp") {
                  handleWhatsApp();
                }

                if (
                  (item.name === "orders" && user === null) ||
                  (item.name === "packages" && user === null) ||
                  (item.name === "refer&earn" && user === null)
                ) {
                  return showLoginAlert(null, () => {
                    router.push("/(app)/(tabs)/home");
                  });
                }
              },
            })}
            options={{
              tabBarIcon: ({ focused }) => {
                return (
                  <>
                    {focused ? (
                      <View
                        style={{
                          width: 42,
                          height: 3,
                          backgroundColor:
                            appConfig?.theme?.buttonColor ?? colors.buttonColor,
                          marginBottom: 5,
                          borderRadius: 20,
                        }}
                      ></View>
                    ) : (
                      <View
                        style={{
                          width: 42,
                          height: 3,
                          backgroundColor: colors.transparent,
                          marginBottom: 5,
                          borderRadius: 20,
                        }}
                      ></View>
                    )}

                    <View className="mb-[0.6rem]">
                      <Icon
                        name={item.iconName}
                        color={
                          focused
                            ? appConfig?.theme?.buttonColor ??
                              colors.buttonColor
                            : "#7C7C7C"
                        }
                        size={22}
                      />
                    </View>
                  </>
                );
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
                textTransform: "capitalize",
                fontFamily: "NunitoSans_600SemiBold",
                // height: 15,
              },
              tabBarLabel: t(`tabs.${item?.name.replace("&", "_")}`),
              tabBarActiveTintColor:
                appConfig?.theme?.buttonColor ?? colors.buttonColor,
              tabBarInactiveTintColor: "#7C7C7C",
              tabBarStyle: {
                display: "flex",
                borderTopColor: colors.defaultWhite,
                backgroundColor: colors.defaultWhite,
                // height: Platform.OS === "android" ? 60 : 80,
              },

              href: shouldDisable ? null : undefined,
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default TabsLayout;
