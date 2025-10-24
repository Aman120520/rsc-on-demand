import { Alert, FlatList, Linking, Pressable, Text, View } from "react-native";
import config from "@/config";
import CommonLoading from "@/src/components/CommonLoading";
import Divider from "@/src/components/Divider";
import Header from "@/src/components/Header";
import { useUser } from "@/src/context/UserProvider";
import Icon from "@/src/icons/Icon";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getShareConfig, showToast } from "@/src/utils/CommonFunctions";
import { useStore } from "@/src/context/StoreProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useLoginAlert } from "@/src/context/LoginAlertProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const Settings = () => {
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, customerCode, signOut, user } = useUser();
  const { dialNumber, storeDetails } = useStore();
  const showLoginAlert = useLoginAlert();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const onCall = async () => {
    await defaultClient.storeDetails(clientId, branchId).then((res: any) => {
      if (res?.Message) {
        showToast(res?.Message);
        return;
      }

      const mobileNo = res?.CallcenterMobileNo;

      if (!mobileNo) {
        showToast("mobile number not found");
        return;
      }

      Linking.openURL(`tel:${mobileNo}`).catch(() => { });
    });
  };

  const onDeleteAccount = () => {
    Alert.alert(
      appConfig?.appName ?? config.appName?.toLowerCase(),
      t("account.delete_confirm"),
      [
        {
          text: t("account.delete"),
          onPress: () => deleteUserAccount(),
        },
        {
          text: t("account.cancel"),
          onPress: () => {
            console.log("Cancel");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onShare = () => {
    getShareConfig(storeDetails);
  };

  const deleteUserAccount = async () => {
    setLoading(true);
    const payload = {
      BranchID: branchId,
      ClientID: clientId,
      CustomerCode: customerCode,
    };

    await defaultClient.accountDeletion(payload).then((res: any) => {
      if (res?.Status === "True") {
        router.push("/LoadingScreen");
        setTimeout(() => {
          signOut();
          setLoading(false);
        }, 1500);
      } else {
        setLoading(false);
        alert(t("account.delete_error"));
      }
    });
  };

  const data = [
    user && {
      label: t("profile.my_profile"),
      icon: "person",
      path: "/(app)/screens/profile/MyProfile",
      auth: true,
    },
    {
      label: t("contact.contact_us"),
      icon: "feedback",
      path: "/(app)/screens/ContactUs",
    },
    {
      label: t("about.about_us"),
      icon: "about",
      path: "/(app)/screens/about/AboutUs",
    },
    {
      label: t("call.call_us"),
      icon: "phone",
      onPress: onCall,
    },
    {
      label: t("share.share"),
      icon: "share",
      onPress: onShare,
    },
    {
      label: t("settings.language") || "Language",
      icon: "language",
      path: "/(app)/screens/language/Languages",
      isLanguageSelector: true,
    },
    user && {
      label: t("account.delete_account"),
      icon: "person",
      onPress: onDeleteAccount,
    },
  ]
    .filter(Boolean)
    .map((c, key) => ({ ...c, key }));

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        onPress={
          item.onPress
            ? item.onPress
            : () => {
              if (item.auth && !user) {
                return showLoginAlert(null, () => { });
              }
              // router.push(`/${item.path}`);
              router.push(`${item.path}`);
            }
        }
        className="flex-row items-center px-5 py-6"
      >
        <Icon name={item?.icon}
          color={appConfig?.theme?.primaryColor ?? colors.primaryColor} />
        <Text className="ml-5 text-md  capitalize" style={{ color: appConfig?.theme?.primaryColor ?? colors.primaryColor }}>{item?.label}</Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <CommonLoading />
      </View>
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

      <View className="flex-1 bg-defaultWhite">
        <FlatList
          data={data}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Divider />}
        // ListHeaderComponent={renderLanguageSelector}
        />
      </View>
    </SafeAreaView>
  );
};
export default Settings;