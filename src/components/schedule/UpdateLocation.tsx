import { Pressable, StyleSheet, Text, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import { Circle, G, Path, Svg } from "react-native-svg";
import { colors } from "@/src/styles/theme";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const UpdateLocation = ({
  showUpdateLocationSheet,
  setShowUpdateLocationSheet,
}: any) => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["50%", "60%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    // console.log("handleSheetChanges", index);
  }, []);

  const { t } = useTranslation();
  return (
    <>
      {showUpdateLocationSheet ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          onClose={() => setShowUpdateLocationSheet(!showUpdateLocationSheet)}
          containerStyle={{ backgroundColor: "rgba(0,0,0, 0.7)" }}
          backgroundStyle={{ backgroundColor: "#FFFFFF" }}
          enablePanDownToClose={false}
          enableHandlePanningGesture={false}
        >
          <View className="flex-1 py-2 px-6">
            <View className="items-center mb-10">
              {locationSvg}
              <View className="w-[15%] h-1 bg-buttonColor mt-1"></View>
              <Text className="mt-6 font-semibold text-xl">
                {t("location.regular_location_msg")}
              </Text>
              <Text className="text-base mt-8 text-center color-defaultBlack leading-7">
                {t("location.update_location_msg")}
              </Text>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(auth)/RegistrationScreen",
                    params: { stepKey: "2" },
                  });
                }}
                className="mt-8 bg-buttonColor py-5 px-12 rounded-md"
              >
                <Text className="color-defaultWhite text-base">
                  {t("location.yes_update")}
                </Text>
              </Pressable>
              <Text
                onPress={() =>
                  setShowUpdateLocationSheet(!showUpdateLocationSheet)
                }
                className="mt-2 py-6 text-md color-buttonColor"
              >
                {t("location.no_pickup_from_saved")}
              </Text>
            </View>
          </View>
        </BottomSheet>
      ) : null}
    </>
  );
};
export default UpdateLocation;

const locationSvg = (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    height="50"
    viewBox="0 0 24 24"
    width="50"
  >
    <Path
      fill={colors.primaryColor}
      d="M12 5.213A1.69 1.69 0 0 0 10.312 6.9c0 .93.758 1.688 1.688 1.688A1.69 1.69 0 0 0 13.688 6.9 1.69 1.69 0 0 0 12 5.212zm0 0"
    />
    <Path
      fill={colors.primaryColor}
      d="M12 2.4a4.505 4.505 0 0 0-4.5 4.5c0 .85.239 1.68.691 2.397L12 15.375l3.809-6.078A4.489 4.489 0 0 0 16.5 6.9c0-2.481-2.019-4.5-4.5-4.5zm0 7.313A2.816 2.816 0 0 1 9.187 6.9 2.816 2.816 0 0 1 12 4.087 2.816 2.816 0 0 1 14.813 6.9 2.816 2.816 0 0 1 12 9.713zm0 0M9.262 21.6h5.474l-.433-3.413H9.684zm0 0M9.825 17.063h1.909l-1.593-2.528zm0 0M15.294 17.063h4.431l-1.406-3.375H14.86zm0 0M4.275 17.063H8.69l.422-3.375H5.68zm0 0M12.266 17.063h1.893l-.32-2.495zm0 0M8.55 18.188H3.806L2.4 21.6h5.729zm0 0M20.194 18.188h-4.756l.432 3.412h5.73zm0 0"
    />
  </Svg>
);
