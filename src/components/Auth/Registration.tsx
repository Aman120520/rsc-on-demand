import Icon from "@/src/icons/Icon";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ReactNativePhoneInput from "react-native-phone-input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface RegistrationProps {
  mobile: string;
  setMobile: Function;
  userName: string;
  setUserName: Function;
  email: string;
  setEmail: Function;
  onRegister: () => void;
  phoneRef: any;
  referralCode: string;
  manualReferralCode: string;
  setManualReferralCode: Function;
  setReferrerCode: Function;
}

const Registration = ({
  mobile,
  setMobile,
  userName,
  setUserName,
  email,
  setEmail,
  onRegister,
  phoneRef,
  referralCode,
  setReferrerCode,
  manualReferralCode,
  setManualReferralCode,
}: RegistrationProps) => {
  const { t } = useTranslation();
  const { appConfig } = useAppConfig();

  return (
    <View className="flex-1 items-center justify-between">
      <View></View>
      <View className="px-10 mb-32">
        <Text className="text-defaultWhite text-lg text-center mb-10">
          Please enter your information
        </Text>
        <View className="flex-row items-center my-2 bg-defaultWhite px-4 rounded">
          <ReactNativePhoneInput
            ref={phoneRef}
            allowZeroAfterCountryCode={false}
            initialValue={mobile}
            autoFormat
            disabled={true}
            style={styles.inputBox}
            textStyle={styles.inputText}
            initialCountry={"in"}
            textProps={{
              autoFocus: true,
              placeholder: "Mobile",
              returnKeyType: "done",
            }}
            onChangePhoneNumber={(number: any) => setMobile(number)}
          />
        </View>
        <View className="flex-row items-center my-2 bg-defaultWhite px-5 rounded">
          <Icon name="person" />
          <TextInput
            style={[styles.inputBox, { ...styles.inputText, marginLeft: 10 }]}
            value={userName}
            onChangeText={(name) => setUserName(name)}
            autoCorrect={false}
            placeholder={t("auth.registration.placeholder_name")}
            placeholderTextColor="#000000"
          />
        </View>
        <View className="flex-row items-center my-2 bg-defaultWhite px-5 rounded">
          <Icon name="email" />
          <TextInput
            style={[
              styles.inputBox,
              {
                ...styles.inputText,
                marginLeft: 10,
                textTransform: "lowercase",
              },
            ]}
            value={email}
            onChangeText={(value) => setEmail(value)}
            autoCorrect={false}
            keyboardType="email-address"
            placeholder={t("auth.registration.placeholder_email")}
            autoCapitalize="none"
            placeholderTextColor="#000000"
          />
        </View>

        {appConfig?.enableReferral && (
          <>
            <Text className="text-white font-semibold mt-4">Referral Code</Text>
            <View className="flex-row items-center my-2 bg-defaultWhite px-5 rounded">
              <TextInput
                style={[
                  styles.inputBox,
                  { ...styles.inputText, marginLeft: 10 },
                ]}
                value={referralCode ? referralCode : manualReferralCode}
                onChangeText={(value: string) => {
                  setManualReferralCode(value);
                  setReferrerCode(value);
                }}
                // editable={referralCode ? false : true}
                selectTextOnFocus={false}
                autoCorrect={false}
                autoCapitalize="words"
                placeholderTextColor="#000000"
              />
            </View>
          </>
        )}
      </View>

      <Pressable
        onPress={onRegister}
        className="bg-buttonColor w-full items-center"
      >
        <Text className="py-5 text-defaultWhite text-base">
          {t("auth.submit")}
        </Text>
      </Pressable>
    </View>
  );
};
export default Registration;
const styles = StyleSheet.create({
  inputBox: {
    width: "100%",
    height: 56,
  },
  inputText: {
    fontSize: 18,
    color: "#000",
  },
});
