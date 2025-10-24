import React, {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { useEffect } from "react";
import config from "@/config";
import SearchAddress from "./SearchAddress";
import { colors } from "@/src/styles/theme";
import MapView, { MarkerAnimated, PROVIDER_GOOGLE } from "react-native-maps";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface AddressSelectionProps {
  location: Location.LocationObject | null;
  setLocation: Function;
  locality: any;
  setLocality: Function;
  region: any;
  setRegion: Function;
  locationUpdate: boolean;
  setLocationUpdate: Function;
  searchLocation: boolean;
  setSearchLocation: Function;
  houseNo: string;
  setHouseNo: Function;
  landMark: any;
  setLandMark: Function;
  setStep: Function;
  onSubmit: () => void;
  dissbled: boolean;
  setDisabled: Function;
  btnLoading: boolean;
  setBtnLoading: Function;
}

const AddressSelection = ({
  location,
  setLocation,
  locality,
  setLocality,
  region,
  setRegion,
  locationUpdate,
  setLocationUpdate,
  searchLocation,
  setSearchLocation,
  houseNo,
  setHouseNo,
  landMark,
  setLandMark,
  onSubmit,
  setStep,
  dissbled,
  setDisabled,
  btnLoading,
  setBtnLoading,
}: AddressSelectionProps) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const screenHeight = Dimensions.get("window").height;

  const { setAppConfig, appConfig } = useAppConfig();

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("schedule.location_permission"),
          `${appConfig?.appName ?? config.appName?.toLowerCase()} ${t(
            "schedule.location_permission_msg"
          )}`,
          [
            {
              text: t("common.close"),
              onPress: () => {},
            },
            {
              text: t("common.open_settings"),
              onPress: () => Linking.openSettings(),
            },
          ],
          { cancelable: false }
        );
        return;
      }

      // let location = await Location.getCurrentPositionAsync({});
      const isAndroid = Platform.OS == "android";
      const location = await Location.getCurrentPositionAsync({
        accuracy: isAndroid
          ? Location.Accuracy.Low
          : Location.Accuracy.Balanced,
      });

      setLocation(location);
    };

    getLocation();
  }, []);

  const onBackPress = () => {
    locationUpdate
      ? router.push("/(app)/screens/profile/MyProfile")
      : setStep(1);
  };

  return (
    <View className="flex-1 bg-primary">
      {searchLocation ? (
        <View className="flex-1 bg-white">
          <SearchAddress
            locality={locality}
            setLocality={setLocality}
            searchLocation={searchLocation}
            setSearchLocation={setSearchLocation}
            setLocation={setLocation}
          />
        </View>
      ) : (
        <>
          <View className="flex-row bg-defaultWhite w-full justify-start p-4">
            <Pressable onPress={onBackPress}>
              <Text className="text-primary text-md text-center">
                {t("common.back")}
              </Text>
            </Pressable>
            <Text className="w-9/12 text-base text-center text-primary captalize">
              {t("auth.address.pickup_address")}
            </Text>
          </View>
          <KeyboardAwareScrollView>
            <View style={{ height: screenHeight / 1.7 }}>
              {location?.coords?.latitude && location?.coords?.longitude ? (
                <MapView
                  showsUserLocation={true}
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  mapType="standard"
                  style={styles.map}
                  region={{
                    latitude: location?.coords?.latitude,
                    longitude: location?.coords?.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                  }}
                >
                  <MarkerAnimated
                    draggable
                    onDragEnd={(e) => {
                      const region = {
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                      };
                      // console.log("After Drag", region);
                      setRegion(region);
                    }}
                    coordinate={{
                      latitude: location?.coords?.latitude,
                      longitude: location?.coords?.longitude,
                    }}
                  ></MarkerAnimated>
                </MapView>
              ) : (
                <View className="h-full items-center justify-center">
                  <ActivityIndicator
                    color={
                      appConfig?.theme?.primaryColor ?? colors.primaryColor
                    }
                    size="large"
                  />
                </View>
              )}
            </View>

            <View className="flex-1 flex-col justify-between bg-defaultWhite pt-1.5 z-10">
              <View className="">
                <View className="flex-row px-4 justify-between h-12 py-.15">
                  <Text
                    className="w-9/12 text-left bg-defaultWhite text-sm color-[#696969] capitalize mt-2"
                    numberOfLines={2}
                  >
                    {locality}
                  </Text>
                  <Pressable
                    className="bg-primary px-4 rounded justify-center"
                    onPress={() => setSearchLocation(!searchLocation)}
                  >
                    <Text className="text-sm text-defaultWhite">
                      {t("common.change")}
                    </Text>
                  </Pressable>
                </View>
                <View className="items-center justify-between px-4 bg-defaultWhit h-16 mt-4">
                  <TextInput
                    className="w-full py-3 px-2 text-md text-defaultBlack bg-defaultWhite rouneded border border-[#CCC]"
                    placeholder={t(
                      "auth.address.placeholders.house_flat_block"
                    )}
                    placeholderTextColor={colors.darkgray}
                    returnKeyType="done"
                    value={houseNo}
                    onChangeText={(value) => setHouseNo(value)}
                  />
                </View>
                <View className="items-center justify-between px-4 bg-defaultWhit h-16 mt-4">
                  <TextInput
                    className="w-full py-3 px-2 text-md text-defaultBlack bg-defaultWhite rouneded border border-[#CCC]"
                    placeholder={t("auth.address.placeholders.street_landmark")}
                    placeholderTextColor={colors.darkgray}
                    returnKeyType="done"
                    value={landMark}
                    onChangeText={(val) => setLandMark(val)}
                    inputMode="email"
                  />
                </View>
              </View>

              <Pressable
                onPress={onSubmit}
                className={`justify-center items-center bg-buttonColor mt-10`}
              >
                {!btnLoading ? (
                  <Text className="py-5 text-defaultWhite">
                    {locationUpdate
                      ? t("auth.address.update_location")
                      : t("common.confirm")}
                  </Text>
                ) : (
                  <View className="py-5">
                    <ActivityIndicator
                      color={
                        appConfig?.theme?.primaryColor ?? colors.primaryColor
                      }
                    />
                  </View>
                )}
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </>
      )}
    </View>
  );
};
export default AddressSelection;
const styles = StyleSheet.create({
  map: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
