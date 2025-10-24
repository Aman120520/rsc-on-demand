import Header from "@/src/components/Header";
import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReactNativePhoneInput from "react-native-phone-input";
import { useUser } from "@/src/context/UserProvider";
import { router } from "expo-router";
import { useStore } from "@/src/context/StoreProvider";
import { showToast } from "@/src/utils/CommonFunctions";
import defaultClient from "@/src/lib/qdc-api";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

const MyProfile = () => {
  const phoneRef = useRef<ReactNativePhoneInput>(null);
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, token, customerCode, user, setUser, signOut } =
    useUser();
  const { dialNumber, storeDetails } = useStore();
  const { t } = useTranslation();

  const [isEditUsername, setIsEditUsername] = useState<boolean>(false);
  const [userName, setUserName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [mobileNo, setMobileNo] = useState(user?.phoneNumber);

  const updateUser = () => {
    // UPDATE USER PROFILE FLOW

    if (user && user?.isCustExist === "True") {
      const requestPayload = {
        ClientID: clientId,
        BranchID: branchId,
        CustomerCode: customerCode,
        Name: userName,
        Address: user?.address,
        AreaLocation: user?.AreaLocation,
      };

      defaultClient.updateCustomerDetails(requestPayload).then(async (res) => {
        if (res?.Status === "True") {
          await setUser((prevState: any) => ({
            ...prevState,
            name: userName,
          }));
          showToast(res?.Message);
          router.push("/(app)/screens/setting/Settings");
        } else {
          showToast(res?.Message);
        }
      });
    }
  };

  const onUpdateEmail = () => {
    Alert.alert(
      t("profile.update_email"),
      `${t("profile.update_email_msg")} ${dialNumber}.`,
      [
        {
          text: Platform.select({
            android: "Ok, thanks",
            ios: "Ok, thanks",
          }),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  console.log({ storeDetails });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <View className="flex-1 bg-defaultBackgroundColor">
        <Header />

        <View className="flex-1 justify-between">
          <View className="px-5">
            <View className="flex-row bg-defaultWhite mt-8 p-4 rounded">
              <Icon name="person"
                color={appConfig?.theme?.primaryColor ?? colors.primaryColor} />
              <TextInput
                className="ml-4 w-10/12"
                value={userName}
                onChangeText={(value) => setUserName(value)}
              />
            </View>
            <View className="flex-row bg-defaultWhite mt-4 p-4 rounded">
              <ReactNativePhoneInput
                ref={phoneRef}
                allowZeroAfterCountryCode={false}
                style={{ width: "100%" }}
                autoFormat
                disabled
                initialCountry={
                  storeDetails?.Country?.toLowerCase() ??
                  appConfig?.defaultCountrydefaultCountry
                }
                initialValue={`+${Number(storeDetails?.DialNumber) ?? 65
                  }${mobileNo}`}
                textProps={{
                  placeholder: "Mobile",
                }}
              />
            </View>
            <Pressable
              onPress={onUpdateEmail}
              className="flex-row bg-defaultWhite mt-4 p-4 rounded"
            >
              <Icon name="email"
                color={appConfig?.theme?.primaryColor ?? colors.primaryColor} />
              <TextInput
                className="ml-4"
                value={email}
                onChangeText={(value) => setEmail(value)}
              />
            </Pressable>
            <View className="flex-row justify-between bg-defaultWhite mt-4  rounded items-center">
              <View className="flex-row items-center px-4 w-9/12">
                <Icon name="location"
                  color={appConfig?.theme?.primaryColor ?? colors.primaryColor} />
                <Text className="ml-4 mx-8" numberOfLines={1}>
                  {user?.address}
                </Text>
              </View>

              <View>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(auth)/RegistrationScreen",
                      params: { stepKey: "2" },
                    })
                  }
                  className="bg-buttonColor p-6 rounded"
                >
                  <Icon name="edit" color={colors.defaultWhite} />
                </Pressable>
              </View>
            </View>
          </View>

          <View className="bg-buttonColor flex-row items-center justify-around">
            <Pressable
              className="flex-1 py-6 text-md font-semibold items-center justify-center"
              onPress={() => router.push("/(app)/screens/setting/Settings")}
            >
              <Text className="color-defaultWhite">{t("common.back")}</Text>
            </Pressable>

            <Pressable
              className="flex-1 py-6 text-md font-semibold items-center justify-center"
              onPress={updateUser}
            >
              <Text className="color-defaultWhite">{t("common.update")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default MyProfile;