import config from "@/config";
import Button from "@/src/components/ui/Button";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { showToast } from "@/src/utils/CommonFunctions";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import ReactNativePhoneInput from "react-native-phone-input";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const { t } = useTranslation();
  // useState
  const [phoneNumber, setPhoneNumber] = useState("");
  const phoneRef = useRef<ReactNativePhoneInput>(null);

  // context API
  const {
    clientId,
    branchId,
    setBranchId,
    setToken,
    setCustomerCode,
    setUser,
  } = useUser();
  const { storeDetails } = useStore();
  const { appConfig } = useAppConfig();

  // Functions
  const onContinue = () => {
    if (phoneNumber === "") {
      showToast(t("auth.enter_mobile"));
    } else {
      const { current } = phoneRef;
      const countryCode = current?.getCountryCode();
      const mobileNo = current?.getValue().replace(`+${countryCode}`, "");
      const validNumber = phoneRef?.current?.isValidNumber(); // Validates the number

      if (!validNumber) {
        showToast(t("auth.enter_mobile"));
        return;
      }

      if (mobileNo) {
        defaultClient
          .checkExistingUser(clientId, branchId, mobileNo)
          .then(async (data: any) => {
            console.log("LOGIN", JSON.stringify(data));

            if (data?.Message) {
              showToast(data?.Message, 3000);
              return;
            }

            if (data?.CustCode) await setCustomerCode(data?.CustCode);
            const { IsCustExist, CustCode, ClientID, BranchID } = data;
            if (IsCustExist === "True") {
              // Change the branch id in async storage to new one
              await setBranchId(BranchID);
              await setUser({
                name: data?.CustomerName,
                address: data?.CustomerAddress,
                email: data?.CustomerEmailId,
                phoneNumber: data?.CustomerMobile,
                isCustExist: data?.IsCustExist,
                areaLocation: data?.AreaLocation,
              });
              defaultClient
                .getAuthorizationToken(ClientID, BranchID, CustCode)
                .then(async (tokenRes) => {
                  console.log({ tokenRes });

                  await setToken(tokenRes?.response?.headers?.map?.token);
                  if (tokenRes?.json === "Authorized") {
                    defaultClient
                      .generateOTP(ClientID, BranchID, CustCode)
                      .then((res) => {
                        router.push("/OtpScreen");
                      });
                  }
                });
            } else if (IsCustExist === "False") {
              router.push({
                pathname: "/RegistrationScreen",
                params: { mobileNo: phoneNumber },
              });
            }
          });
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          appConfig?.theme?.primaryColor ?? config.theme.primaryColor,
      }}
    >
      <View className="flex-1 bg-white flex-col items-center justify-center">
        <Text className="text-center text-lg">{t("auth.enter_mobile")}</Text>
        <View className="flex-row items-center m-14 rounded bg-[#DDD]">
          <ReactNativePhoneInput
            ref={phoneRef}
            allowZeroAfterCountryCode={false}
            autoFormat
            style={styles.inputBox}
            textStyle={styles.inputText}
            initialCountry={appConfig?.defaultCountry?.toLowerCase()}
            textProps={{
              // autoFocus: true,
              placeholder: t("auth.enter_mobile"),
              returnKeyType: "done",
            }}
            onChangePhoneNumber={(number: any) => setPhoneNumber(number)}
          />
        </View>
        <Button
          onPress={onContinue}
          buttonStyles="bg-buttonColor"
          label={t("common.continue")}
        />
      </View>
    </SafeAreaView>
  );
};
export default Login;

const styles = StyleSheet.create({
  inputBox: {
    flex: 1,
    height: 56,
    padding: 20,
  },
  inputText: {
    fontSize: 18,
    color: "#000",
  },
});
