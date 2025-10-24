import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useEvent } from "react-native-reanimated";
import { COLORS } from "@/src/styles/colors";
import { TEXT_STYLE } from "@/src/styles/typography";
import CommonLoading from "../CommonLoading";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface CalendarViewProps {
  data: any;
  selectedDate: any;
  setSelectedDate: Function;
  timeSlotsData?: any;
  setTimeSlotsData?: Function;
  selectedTime?: any;
  setSelectedTime?: Function;
  showTimeSlots?: boolean;
}

const CheckoutCalendar = ({
  data,
  selectedDate,
  setSelectedDate,
  timeSlotsData,
  setTimeSlotsData,
  selectedTime,
  setSelectedTime,
  showTimeSlots = true,
}: CalendarViewProps) => {
  // useState
  const [dataList, setDataList] = useState<any>([]);
  const [slots, setSlots] = useState<any>([]);
  const { appConfig } = useAppConfig();
  const { t } = useTranslation();

  // Translation functions
  const translateDay = (dayAbbr: string) => {
    const dayMap: { [key: string]: string } = {
      Mon: t("calendar.days.monday"),
      Tue: t("calendar.days.tuesday"),
      Wed: t("calendar.days.wednesday"),
      Thu: t("calendar.days.thursday"),
      Fri: t("calendar.days.friday"),
      Sat: t("calendar.days.saturday"),
      Sun: t("calendar.days.sunday"),
    };
    return dayMap[dayAbbr] || dayAbbr;
  };

  const translateMonth = (monthAbbr: string) => {
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
    return monthMap[monthAbbr] || monthAbbr;
  };

  const translateTime = (timeString: string) => {
    if (!timeString) return timeString;

    // Translate AM/PM
    const amTranslation = t("calendar.time.am");
    const pmTranslation = t("calendar.time.pm");

    return timeString
      .replace(/AM/g, amTranslation)
      .replace(/PM/g, pmTranslation);
  };

  // useEffects
  useEffect(() => {
    if (data) {
      let newArr: any = [];
      data?.map(async (item: any, index: any) => {
        const date = moment(`${item?.PickUpDate}`, "DD MMM YYYY");

        await newArr.push({
          id: index,
          date: date,
          slots: item?.PickUpTime,
        });

        return setDataList(newArr);
      });
    }
  }, [data]);

  useEffect(() => {
    const initialDate = moment(dataList[0]?.date).format("DD MMM YYYY");
    setSelectedDate({
      id: dataList[0]?.id,
      date: initialDate,
      slots: dataList[0]?.slots,
    });
  }, [dataList]);

  useEffect(() => {
    // setTimeSlotsData(selectedDate?.slots);
    setSlots(selectedDate?.slots);
  }, [data, selectedDate]);

  // renderItems
  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable
        key={index}
        onPress={() =>
          setSelectedDate({
            id: index,
            date: moment(item?.date).format("DD MMM YYYY"),
            dateLabel: item?.date,
            slots: item?.slots,
          })
        }
        className={selectedDate?.id === index ? "bg-buttonColor" : ""}
        style={[
          styles.dateContainer,
          selectedDate?.id === index
            ? {
              // backgroundColor: appConfig?.primaryColor ?? colors.primaryColor,
            }
            : {},
        ]}
      >
        <Text
          style={[
            TEXT_STYLE.TEXT_14_B,
            styles.label,
            selectedDate?.id === index
              ? { color: COLORS.WHITE.d0 }
              : { color: COLORS.BLACK.d0 },
          ]}
        >
          {translateDay(moment(item?.date)?.format("ddd"))}
        </Text>
        <Text
          style={[
            TEXT_STYLE.TEXT_16_B,
            styles.label,
            selectedDate?.id === index
              ? { color: COLORS.WHITE.d0 }
              : { color: COLORS.BLACK.d0 },
          ]}
        >
          {moment(item?.date)?.format("DD")}
        </Text>
        <Text
          style={[
            TEXT_STYLE.TEXT_14_B,
            styles.label,
            selectedDate?.id === index
              ? { color: COLORS.WHITE.d0 }
              : { color: COLORS.BLACK.d0 },
          ]}
        >
          {translateMonth(moment(item?.date)?.format("MMM"))}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {data?.length > 0 ? (
        <>
          <FlatList
            data={dataList}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingBottom: !showTimeSlots ? 50 : 0 }}
          />

          {selectedDate && showTimeSlots ? (
            <ScrollView className="min-h-80 max-h-96">
              <View style={[styles.slotsContainer]}>
                {slots?.map((item: any, index: any) => {
                  return (
                    <Pressable
                      key={item?.Slots}
                      onPress={() =>
                        setSelectedTime({
                          id: index,
                          time: item?.Slots,
                        })
                      }
                      className={selectedTime?.id === index ? "bg-buttonColor" : ""}
                      style={[
                        styles.slotsItem,
                        selectedTime?.id === index
                          ? {
                            // backgroundColor:
                            //   appConfig?.primaryColor ?? colors.primaryColor,
                          }
                          : {},
                      ]}
                    >
                      <Text
                        style={[
                          TEXT_STYLE.TEXT_13_SB,
                          styles.slotsLabel,

                          selectedTime?.id === index
                            ? { color: COLORS.WHITE.d0 }
                            : { color: COLORS.BLACK.d0 },
                        ]}
                      >
                        {item?.Slots}
                        {/* {translateTime(item?.Slots)} */}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <></>
          )}
        </>
      ) : (
        <CommonLoading />
      )}
    </View>
  );
};

export default CheckoutCalendar;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  dateContainer: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  renderDateSeparator: {},
  dateSeparator: {
    backgroundColor: COLORS.BLACK.d0,
  },
  label: {
    textAlign: "center",
    textTransform: "capitalize",
  },
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingBottom: 20,
  },
  slotsItem: {
    // flexBasis: Dimensions.get("window").width / 4,
    flexBasis: Dimensions.get("window").width * 0.3,
    minHeight: 70,
    paddingVertical: 20,
    // paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY.d6,
    alignItems: "center",
    justifyContent: "center",
  },
  slotsLabel: {
    textAlign: "center",
  },
});
