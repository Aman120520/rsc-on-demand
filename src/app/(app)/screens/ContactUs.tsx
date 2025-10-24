import Header from "@/src/components/Header";
import { colors } from "@/src/styles/theme";
import {
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";
import icons from "@/src/icons/icons";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { showToast } from "@/src/utils/CommonFunctions";
import * as FileSystem from "expo-file-system";
import config from "@/config";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";
import { getContactUsTranslation } from "@/src/utils/TranslationUtils";

const ContactUs = () => {
  const { t } = useTranslation();
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId, customerCode, user, isValidUser, fcmToken } =
    useUser();

  const [list, setList] = useState([]);
  const [currentItem, setCurrentItem] = useState<any>([]);
  const [feedback, setFeedback] = useState("");
  const [maxChar, setMaxChar] = useState(1000);
  const [image, setImage] = useState<any>(null);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<any>(null);
  const [base64Format, setBase64Format] = useState<any>(null);

  useEffect(() => {
    if (clientId) {
      let newArr: any = [];
      defaultClient.getAppFeedbackReasons(clientId).then((res: any) => {
        if (res) {
          res?.map((item: any) => {
            console.log("Individual feedback item:", {
              FeedbackText: item?.FeedbackText,
              FeedbackKey: item?.FeedbackKey,
            });

            // Use translation for the label while keeping original value for API
            const translatedLabel = t(
              `contact_us.feedback_reasons.${item?.FeedbackKey}`
            );

            newArr.push({
              label: translatedLabel,
              value: item?.FeedbackText, // Keep original value for API submission
              key: item?.FeedbackKey,
              originalLabel: item?.FeedbackText, // Store original for reference
            });
          });

          setList(newArr);
          setCurrentItem(newArr[0].value);
        }
      });
    }
  }, [t]);

  const handleService = (value: any) => {
    if (value) {
      setSelectedFeedbackType(value);
      setCurrentItem(value);
    }
  };

  const onCameraPress = async () => {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

    const base64 = await FileSystem.readAsStringAsync(result.uri, {
      encoding: "base64",
    });

    setBase64Format(base64);
  };

  const onSend = () => {
    if (feedback === "") {
      const concernTranslation = getContactUsTranslation(
        t,
        "contact_us.enter_concern"
      );
      console.log("Concern translation:", concernTranslation);
      showToast(concernTranslation);
      return;
    }

    if (selectedFeedbackType == null) {
      const concernTypeTranslation = getContactUsTranslation(
        t,
        "contact_us.enter_concern_type"
      );
      console.log("Concern type translation:", concernTypeTranslation);
      showToast(concernTypeTranslation);
      return;
    }

    const payload: any = {
      ClientID: clientId,
      BranchID: branchId,
      CustomerCode: customerCode,
      Message: feedback,
      FeedbackKey: selectedFeedbackType,
    };

    if (image != "" && base64Format) {
      payload.Image = base64Format;
    }

    if (payload) {
      defaultClient.sendFeedback(payload).then((res: any) => {
        if (res) {
          showToast(t("contact_us.feedback_submitted"));
          setImage(null);
          setFeedback("");
          setCurrentItem(null);
        }
      });
    }
  };

  const onCall = async () => {
    await defaultClient.storeDetails(clientId, branchId).then((res: any) => {
      if (res?.Message) {
        showToast(res?.Message);
        return;
      }

      const mobileNo = res?.CallcenterMobileNo;

      if (!mobileNo) {
        showToast(t("contact_us.mobile_number_not_found"));
        return;
      }

      Linking.openURL(`tel:${mobileNo}`).catch(() => {});
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-[#EFEFEF]"
      >
        <View className="px-5 mt-10">
          <RNPickerSelect
            onValueChange={(value) => handleService(value)}
            items={list}
            style={{
              inputAndroidContainer: {
                ...styles.pickerInputContainer,
              },
              inputAndroid: {
                color: colors.primaryTextColor,
              },
              inputIOSContainer: {
                ...styles.pickerInputContainer,
              },
              inputIOS: {
                color: colors.primaryTextColor,
              },
              iconContainer: {
                paddingHorizontal: 16,
              },
              placeholder: {
                color: colors.primaryTextColor,
              },
            }}
            value={currentItem}
            placeholder={{
              label: t("common.select_an_item"),
              value: null,
            }}
            useNativeAndroidPickerStyle={false}
            Icon={() => icons.chevron(colors.primaryTextColor)}
          />

          <TextInput
            className="bg-defaultBackgroundColor mt-10 mb-6 p-4 rounded"
            value={feedback}
            onChangeText={(value: any) => setFeedback(value)}
            maxLength={maxChar}
            multiline
            placeholderTextColor={"#808080"}
            placeholder={t("contact.placeholder_message")}
            style={{
              height: Dimensions.get("window").height / 2.5,
              textAlignVertical: "top",
            }}
            autoCorrect={false}
          />

          <View className="flex items-end">
            <Text>
              {feedback?.length}/{maxChar}
            </Text>
          </View>

          {image ? (
            <Image
              source={{ uri: image }}
              style={{
                height: Dimensions.get("window").height / 2.5,
                width: "100%",
                marginVertical: 10,
              }}
            />
          ) : null}

          <View className="items-center">
            <TouchableOpacity
              className="my-2 bg-buttonColor px-6 py-5 rounded-md"
              onPress={onCameraPress}
            >
              <>{icons.camera(colors.defaultWhite)}</>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View className="bg-buttonColor flex-row items-center justify-around">
        <Pressable
          className="flex-1 py-6 text-md font-semibold items-center justify-center"
          onPress={onCall}
        >
          <Text className="text-defaultWhite font-semibold">
            {t("common.call")}
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 py-6 text-md font-semibold items-center justify-center"
          onPress={onSend}
        >
          <Text className="text-defaultWhite font-semibold">
            {t("common.send")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ContactUs;
const styles = StyleSheet.create({
  inputBox: {
    flex: 1,
    height: 56,
  },
  pickerInputContainer: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.defaultWhite,
    borderRadius: 4,
  },
});
