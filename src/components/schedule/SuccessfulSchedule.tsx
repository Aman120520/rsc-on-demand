import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Svg, SvgXml } from "react-native-svg";
import moment from "moment";
import { useTranslation } from "react-i18next";

interface SuccessfulScheduleProps {
  date: string;
  time: string;
  setStep: Function;
  setNavText: Function;
  setIsReshedule: Function;
}

const SuccessfulSchedule = ({
  date,
  time,
  setStep,
  setNavText,
  setIsReshedule,
}: SuccessfulScheduleProps) => {
  const { t } = useTranslation();
  const formatedDate = moment(`${date}`, "DD MMM YYYY");

  // Translation function for dates
  const translateDate = (dateString: string) => {
    if (!dateString) return dateString;

    // Parse date format like "15 Oct 2024"
    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const [day, month, year] = parts;

      // Translate month names
      const monthMap: { [key: string]: string } = {
        Jan: t("date_formatting.months.Jan"),
        Feb: t("date_formatting.months.Feb"),
        Mar: t("date_formatting.months.Mar"),
        Apr: t("date_formatting.months.Apr"),
        May: t("date_formatting.months.May"),
        Jun: t("date_formatting.months.Jun"),
        Jul: t("date_formatting.months.Jul"),
        Aug: t("date_formatting.months.Aug"),
        Sep: t("date_formatting.months.Sep"),
        Oct: t("date_formatting.months.Oct"),
        Nov: t("date_formatting.months.Nov"),
        Dec: t("date_formatting.months.Dec"),
      };

      const translatedMonth = monthMap[month] || month;
      return `${day} ${translatedMonth} ${year}`;
    }
    return dateString;
  };

  return (
    <View className="flex-1 bg-defaultWhite items-center justify-center px-5">
      <Text className="text-lg font-bold my-4 uppercase">
        {t("schedule.keep_ready")}
      </Text>

      <Text className="text-md mt-10 px-2 text-center ">
        {t("schedule.expert_coming")}
      </Text>

      <View className="my-8">
        <View className="flex-col items-center justify-center my-5">
          <Text className="text-md text-center font-bold ml-4 ">
            {translateDate(moment(formatedDate).format("DD MMM YYYY"))},
          </Text>
          <Text className="text-md text-center font-bold ml-4 mt-5">
            {time}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-center mt-5">
        <Pressable
          onPress={() => {
            setIsReshedule(true);
            setStep(0);
          }}
          className="shrink bg-buttonColor border-1 border-darkGray py-6 rounded-sm m-4 flex-row items-center justify-center"
        >
          <Text className="flex-1 text-center font-semibold text-defaultWhite">
            {t("common.reschedule")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setNavText(t("auth.submit"));
            setStep(3);
          }}
          className="shrink bg-buttonColor border-1 border-darkGray py-6 rounded-sm m-4 flex-row items-center justify-center"
        >
          <Text className="flex-1 text-center font-semibold text-defaultWhite">
            {t("account.cancel")}
          </Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => {
          setStep(0);
          router.push("/(app)/home");
        }}
        className="py-6 mx-4 bg-buttonColor rounded-sm mt-4 flex-row items-center justify-center"
      >
        <Text className="flex-1 text-center font-semibold text-defaultWhite">
          {t("checkout.go_back_to_home")}
        </Text>
      </Pressable>
    </View>
  );
};

export default SuccessfulSchedule;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.WHITE.d0,
//     paddingHorizontal: 20,
//   },
//   smallBtn: {
//     flexShrink: 1,
//     backgroundColor: COLORS.TRANSPARENT,
//     borderWidth: 1,
//     borderColor: COLORS.GRAY.d7,
//     padding: 18,
//     borderRadius: 50,
//     margin: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   largeBtn: {
//     width: 244,
//     backgroundColor: COLORS.PRIMARY.d0,
//     padding: 18,
//     borderRadius: 50,
//     marginTop: 70,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   btnText: {
//     ...TEXT_STYLE.TEXT_14_B,
//     color: COLORS.WHITE.d0,
//     marginLeft: 20,
//   },
// });
