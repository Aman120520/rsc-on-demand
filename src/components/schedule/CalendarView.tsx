import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import moment from "moment";
import CommonLoading from "../CommonLoading";
import { colors } from "@/src/styles/theme";
import Checkbox from "expo-checkbox";
import { CopilotStep, useCopilot, walkthroughable } from "react-native-copilot";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SCHEDULE_COPILOT } from "@/src/context/UserProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useFirebaseAnalyticsEvent } from "@/src/hooks/useFirebaseAnalyticsEvent";
import { useTranslation } from "react-i18next";
import { getCalendarTranslation } from "@/src/utils/TranslationUtils";
import i18n from "@/src/i18n";

const CopilotView = walkthroughable(View);

interface CalendarViewProps {
  data: any;
  selectedDate: any;
  setSelectedDate: Function;
  timeSlotsData?: any;
  setTimeSlotsData?: Function;
  selectedTime?: any;
  setSelectedTime?: any;
  showTimeSlots?: boolean;
  expressDeliveryData?: any;
  setExpressDeliveryData?: any;
  expressDelivery?: any;
  setExpressDelivery?: any;
}

const CalendarView = ({
  data,
  selectedDate,
  setSelectedDate,
  timeSlotsData,
  setTimeSlotsData,
  selectedTime,
  setSelectedTime,
  showTimeSlots = true,
  expressDeliveryData,
  setExpressDeliveryData,
  expressDelivery,
  setExpressDelivery,
}: CalendarViewProps) => {
  const { start, copilotEvents } = useCopilot();
  const { t } = useTranslation();

  // Test copilot functionality
  const testCopilot = () => {
    console.log("Starting copilot tutorial...");
    start();
  };

  const { rescheduleItem } = useStore();

  const { logEvent } = useFirebaseAnalyticsEvent();

  const { appConfig } = useAppConfig();

  // Helper functions for translations
  const getTranslatedDay = (date: any) => {
    const dayOfWeek = moment(date).format("dddd").toLowerCase();
    const dayKey = `calendar.days.${dayOfWeek}`;
    const translatedDay = t(dayKey);
    // Fallback to original if translation not found
    return translatedDay !== dayKey
      ? translatedDay
      : moment(date).format("ddd");
  };

  const getTranslatedMonth = (date: any) => {
    const month = moment(date).format("MMMM").toLowerCase();
    const monthKey = `calendar.months.${month}`;
    const translatedMonth = t(monthKey);
    // Fallback to original if translation not found
    return translatedMonth !== monthKey
      ? translatedMonth
      : moment(date).format("MMM");
  };

  const getTranslatedTime = (timeString: string) => {
    if (timeString.includes("AM")) {
      const amTranslation = t("calendar.time.am");
      return timeString.replace(
        "AM",
        amTranslation !== "calendar.time.am" ? amTranslation : "AM"
      );
    } else if (timeString.includes("PM")) {
      const pmTranslation = t("calendar.time.pm");
      return timeString.replace(
        "PM",
        pmTranslation !== "calendar.time.pm" ? pmTranslation : "PM"
      );
    }
    return timeString;
  };

  // Simplified translation functions using utility
  const getDayTranslation = (date: any) => {
    const dayOfWeek = moment(date).format("dddd").toLowerCase();
    return getCalendarTranslation(t, "day", dayOfWeek);
  };

  const getMonthTranslation = (date: any) => {
    const month = moment(date).format("MMMM").toLowerCase();
    return getCalendarTranslation(t, "month", month);
  };

  // useState
  const [dataList, setDataList] = useState<any>([]);
  const [slots, setSlots] = useState<any>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [startPilot, setStartPilot] = useState(false);


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
    if (rescheduleItem) {
      return;
    }

    const initialDate = moment(dataList[0]?.date).format("DD MMM YYYY");
    setSelectedDate({
      id: dataList[0]?.id,
      date: initialDate,
      slots: dataList[0]?.slots,
    });
  }, [dataList, rescheduleItem]);

  useEffect(() => {
    if (rescheduleItem) {
      selectedDate?.slots?.map((slot: any, index: any) => {
        if (slot?.Slots === rescheduleItem?.PickUpTime) {
          setSelectedTime({
            id: index,
            time: slot?.Slots,
          });
        }
      });
    }
  }, [rescheduleItem]);

  useEffect(() => {
    setSlots(selectedDate?.slots);
  }, [data, selectedDate]);

  const expressDeliveryUpdate = (item: any) => {
    setExpressDeliveryData((prevState: any) => {
      let updatedState = prevState.map((option: any) => ({
        ...option,
        isSelected: option.id === item.id ? !option.isSelected : false,
      }));

      return updatedState;
    });

    expressDeliveryData?.some((item: any) => {
      if (!item?.isSelected) {
        setExpressDelivery(null);
      }
    });
  };

  useEffect(() => {
    copilotEvents.on("stepChange", (step: any) => {
      setLastEvent(`stepChange: ${step.name}`);
    });
    copilotEvents.on("start", () => {
      setLastEvent(`start`);
    });
    copilotEvents.on("stop", () => {
      setLastEvent(`stop`);
      AsyncStorage.setItem(SCHEDULE_COPILOT, "True");
    });

    setTimeout(() => {
      setStartPilot(true);
    }, 300);
  }, [copilotEvents]);

  useEffect(() => {
    AsyncStorage.getItem(SCHEDULE_COPILOT).then((res: any) => {
      if (res === null) {
        start();
      }
    });
  }, [startPilot]);

  // renderItems
  const renderItem = ({ item, index }: any) => {
    let d = moment(item?.date).format("DD MMM YYYY");

    return (
      <Pressable
        key={index}
        onPress={() => {
          setSelectedDate({
            id: index,
            date: moment(item?.date).format("DD MMM YYYY"),
            dateLabel: item?.date,
            slots: item?.slots,
          });
        }}
        className="py-3 px-8"
        style={[
          { borderWidth: StyleSheet.hairlineWidth },
          selectedDate?.id === index
            ? {
              backgroundColor:
                appConfig?.theme?.buttonColor ?? colors.buttonColor,
            }
            : {},
        ]}
      >
        <Text
          className={`font-semibold text-md capitalize text-center ${selectedDate?.id === index
            ? "color-defaultWhite"
            : "color-defaultBlack"
            }`}
        >
          {getDayTranslation(item?.date)}
        </Text>
        <Text
          className={`font-semibold text-md capitalize text-center ${selectedDate?.id === index
            ? "color-defaultWhite"
            : "color-defaultBlack"
            }`}
        >
          {moment(item?.date)?.format("DD")}
        </Text>
        <Text
          className={`font-semibold text-md capitalize text-center ${selectedDate?.id === index
            ? "color-defaultWhite"
            : "color-defaultBlack"
            }`}
        >
          {getMonthTranslation(item?.date)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 justify-between bg-[##F2F2F2]">
      {data && data?.length > 0 ? (
        <>
          <View className="flex-1">
            <CopilotStep
              name="calendar"
              order={1}
              text={t("calendar.choose_date")}
            >
              <CopilotView>
                <FlatList
                  data={dataList}
                  renderItem={renderItem}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingBottom: !showTimeSlots ? 50 : 0 }}
                />
              </CopilotView>
            </CopilotStep>

            <CopilotStep
              name="timeslot"
              order={2}
              text={t("calendar.select_tiimeslot")}
            >
              <CopilotView>
                {showTimeSlots ? (
                  <ScrollView>
                    <View className="flex-row flex-wrap items-center pb-40">
                      {slots?.map((item: any, index: any) => {
                        return (
                          <Pressable
                            key={item?.Slots}
                            onPress={() => {
                              setSelectedTime({
                                id: index,
                                time: item?.Slots,
                              });

                              logEvent("select_date_time", {
                                selected_date: item?.date,
                                selected_time: item?.slots?.[0]?.Slots,
                              });
                            }}
                            style={[
                              styles.slotsItem,
                              selectedTime?.id === index
                                ? {
                                  backgroundColor:
                                    appConfig?.theme?.buttonColor ??
                                    colors.buttonColor,
                                }
                                : {},
                            ]}
                          >
                            <Text
                              className="px-2 text-center"
                              style={[
                                selectedTime?.id === index
                                  ? { color: colors.defaultWhite }
                                  : { color: colors.defaultBlack },
                              ]}
                            >
                              {/* {getTranslatedTime(item?.Slots)} */}
                              {item?.Slots}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                ) : (
                  <></>
                )}
              </CopilotView>
            </CopilotStep>
          </View>
          {expressDeliveryData ? (
            <CopilotStep
              name="options"
              order={3}
              text={t("calendar.express_delivery_options")}
            >
              <CopilotView>
                <View>
                  {expressDeliveryData && (
                    <View className="flex-row items-center justify-center bg-defaultWhite">
                      {expressDeliveryData?.map((item: any) => {
                        return (
                          <Pressable
                            className="flex-1 flex-row items-center py-6 mx-1"
                            onPress={() => expressDeliveryUpdate(item)}
                          >
                            <Checkbox
                              style={styles.checkbox}
                              value={item?.isSelected}
                              onValueChange={() => expressDeliveryUpdate(item)}
                              color={
                                appConfig?.theme?.buttonColor ??
                                colors.buttonColor
                              }
                            />
                            <Text className="color-primaryColor w-[80%]">
                              {item?.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              </CopilotView>
            </CopilotStep>
          ) : null}
        </>
      ) : (
        <CommonLoading />
      )}
    </View>
  );
};

export default CalendarView;

const styles = StyleSheet.create({
  slotsItem: {
    // flexBasis: Dimensions.get("window").width / 4,
    flexBasis: Dimensions.get("window").width * 0.25,
    minHeight: 80,
    paddingVertical: 20,
    // paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.darkgray,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    marginHorizontal: 10,
    borderRadius: 50,
  },
});
