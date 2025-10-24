import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  I18nManager,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SvgXml } from "react-native-svg";
import moment, { Moment } from "moment";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Checkbox from "expo-checkbox";
import { useUser } from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import { DELIVERY, EDIT_SM, PICKUP } from "@/src/icons/svg";
import CommonLoading from "../CommonLoading";
import { COLORS } from "@/src/styles/colors";
import DatePickerModal from "./DatePickerModal";
import Icon from "@/src/icons/Icon";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface PickupAndDeliveryProps {
  calendarData: any;
  pickupDate: any;
  setPickupDate: Function;
  pickupTime: any;
  setPickupTime: Function;
  deliveryDate: any;
  setDeliveryDate: Function;
  deliveryTime: any;
  setDeliveryTime: Function;
  deliveryNotes: string | null;
  setDeliveryNotes: Function;
  expressDelivery: any;
  setExpressDelivery: Function;
  garmentsOnHanger: boolean;
  setGarmentsOnHanger: Function;
  expressDeliveryData: any;
  setExpressDeliveryData: Function;
  fetching?: boolean;
}

const PickupAndDelivery = ({
  calendarData,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  deliveryDate,
  setDeliveryDate,
  deliveryTime,
  setDeliveryTime,
  deliveryNotes,
  setDeliveryNotes,
  expressDelivery,
  setExpressDelivery,
  garmentsOnHanger,
  setGarmentsOnHanger,
  expressDeliveryData,
  setExpressDeliveryData,
  fetching,
}: PickupAndDeliveryProps) => {
  // contextAPI
  const { setAppConfig, appConfig } = useAppConfig();
  const { user } = useUser();
  const { t } = useTranslation();
  const isRTL = Platform.OS === "ios" && I18nManager.isRTL;
  const translateDate = (dateString: string) => {
    if (!dateString) return dateString;
    const parts = dateString.split(", ");
    if (parts.length === 2) {
      const [datePart, dayPart] = parts;
      const translatedDay = t(`calendar.full_days.${dayPart.toLowerCase()}`);
      let translatedDatePart = datePart;
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
      }; // Replace month abbreviations

      Object.keys(monthMap).forEach((month) => {
        translatedDatePart = translatedDatePart.replace(month, monthMap[month]);
      });

      return `${translatedDatePart}, ${translatedDay}`;
    }
    return dateString;
  }; // useState

  const [showPickup, setShowPickup] = useState<boolean>(false);
  const [showDelivery, setShowDelivery] = useState<boolean>(false);
  const [deliveryDatesArr, setDeliveryDatesArr] = useState([]);

  useEffect(() => {
    expressDeliveryData?.some((item: any) => {
      if (item?.isSelected) {
        setExpressDelivery(item);
      }
    });
  }, [expressDeliveryData]); // The functions below are commented out in the original code, so I'm leaving them commented out. // useEffect(() => { //   if (pickupDate) { //     const deliveryDates: any = generateDeliveryCalendar(pickupDate?.date); //     if (deliveryDates?.length > 0) { //       setDeliveryDatesArr(deliveryDates); //       const delivery = moment( //         `${deliveryDates?.[0]?.PickUpDate}`, //         "DD MMM YYYY" //       ); //       setDeliveryDate({ //         date: deliveryDates?.[0]?.PickUpDate, //         dateLabel: delivery, //       }); //       setDeliveryTime({ time: deliveryDates?.[0]?.PickUpTime?.[0]?.Slots }); //     } //   } // }, [pickupDate]); // // Functions // const generateDeliveryCalendar = (pickupDate: any) => { //   // Parse pickup date using Moment.js //   const pickupMoment = moment(pickupDate, "DD MMM YYYY"); //   // Calculate starting delivery date (4 days ahead of pickup date) //   const startingDeliveryDate = pickupMoment?.clone()?.add(1, "days"); //   // Initialize array to store delivery calendar data //   const deliveryCalendarData = []; //   // Generate delivery calendar data for the next 8 days //   for (let i = 0; i < 8; i++) { //     const currentDate = startingDeliveryDate?.clone()?.add(i, "days"); //     const formattedDate = currentDate?.format("DD MMM YYYY"); //     // Populate delivery calendar data with pickup time slots //     const deliverySlot = { //       PickUpDate: formattedDate, //       PickUpTime: [ //         { Slots: "8:00 AM" }, //         { Slots: "10:00 AM" }, //         { Slots: "12:00 PM" }, //         { Slots: "2:00 PM" }, //         { Slots: "4:00 PM" }, //         { Slots: "6:00 PM" }, //       ], //     }; //     // Push the current date to delivery calendar data //     deliveryCalendarData.push(deliverySlot); //   } //   // Remove the first object which represents the pickup date //   deliveryCalendarData.shift(); //   return deliveryCalendarData; // };

  const expressDeliveryUpdate = useCallback((item: any) => {
    setExpressDeliveryData((prevState: any) => {
      if (!Array.isArray(prevState)) return prevState;

      const updatedState = prevState.map((option: any) => ({
        ...option,
        isSelected: option.id === item.id ? !option.isSelected : false,
      }));

      const isAnySelected = updatedState.some(
        (option: any) => option.isSelected
      );
      setExpressDelivery(isAnySelected ? item : null);

      return updatedState;
    });
  }, []);

  const expressRenderItem = useCallback(
    ({ item, index }: any) => {
      return (
        <Pressable
          onPress={() => expressDeliveryUpdate(item)}
          className="flex flex-row items-center py-3 pr-4 my-2"

        >
          <Checkbox
            style={[
              styles.checkbox,
              isRTL
                ? {
                  marginRight: 12,
                  marginLeft: 0,
                }
                : {
                  marginLeft: 0,
                },
            ]}
            value={item?.isSelected}
            onValueChange={() => expressDeliveryUpdate(item)}
            color={
              item?.isSelected
                ? appConfig?.theme?.buttonColor ?? colors.buttonColor
                : undefined
            }
          />
          <Text
            className="text-[14px] font-semibold color-defaultBlack"
            style={{
              ...(isRTL
                ? {
                  marginRight: 12,
                  marginLeft: 0,
                }
                : {
                  marginLeft: 12,
                }),
            }}
          >
            {item?.label}
          </Text>
        </Pressable>
      );
    },
    [isRTL, appConfig?.theme?.buttonColor, expressDeliveryUpdate]
  );

  return (
    <>
      {!fetching ? (
        <KeyboardAwareScrollView>
          <View className="flex-1 px-5">
            <View
              className="mt-8"

            >
              <Icon
                name="pickup_icon"
                color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
                size={24}
              />
              <Text
                className="text-sm font-bold mt-3 color-primary"
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              >
                {t("common.pickup")}
              </Text>
              <View
                className="flex flex-row items-center justify-between mt-4"

              >
                <View

                >
                  <View
                    className="flex flex-row items-center justify-center"

                  >
                    <Text
                      className="text-sm font-semibold  text-defaultBlack"

                    >
                      {t("payment.date")}
                    </Text>
                    <Text
                      className="text-sm font-semibold  text-defaultBlack pl-4"

                    >
                      {pickupDate &&
                        translateDate(
                          `${moment(pickupDate?.dateLabel).format(
                            "Do MMM YYYY, dddd"
                          )}`
                        )}
                    </Text>
                  </View>
                  <View
                    className="flex flex-row"
                    style={[
                      { marginTop: 10 },

                    ]}
                  >
                    <Text
                      className="text-sm font-semibold  text-defaultBlack"

                    >
                      {t("common.time")}
                    </Text>
                    <Text
                      className="text-sm font-semibold  text-defaultBlack pl-4"

                    >
                      {pickupTime && `${pickupTime?.time}`}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setShowPickup(!showPickup)}
                  className="pr-5"
                >
                  <SvgXml xml={EDIT_SM} />
                </Pressable>
              </View>
            </View>
            <View
              className="mt-14"

            >
              <Icon
                name="delivery_icon"
                color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
                size={24}
              />
              <Text
                className="text-sm font-bold mt-3 color-primary"
                style={{

                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              >
                {t("common.delivery")}
              </Text>
              <View className="flex flex-row items-center justify-between mt-4">
                <View

                >
                  <View
                    className="flex flex-row items-center justify-center"

                  >
                    <Text
                      className="text-sm font-semibold  text-defaultBlack"

                    >
                      {t("payment.date")}
                    </Text>
                    <Text
                      className="text-sm font-semibold  text-defaultBlack pl-4"

                    >
                      {deliveryDate &&
                        translateDate(
                          `${moment(deliveryDate?.dateLabel).format(
                            "Do MMM YYYY, dddd"
                          )}`
                        )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {expressDeliveryData && (
              <View className="mt-14">
                <Text
                  className="text-sm font-bold color-primary"
                  style={{
                    ...(isRTL
                      ? {
                        textAlign: "left",
                      }
                      : {}),
                  }}
                >
                  {t("common.express_delivery")}
                </Text>
                <View
                  className="mt-4"

                >
                  <FlatList
                    scrollEnabled={false}
                    data={
                      Array.isArray(expressDeliveryData)
                        ? expressDeliveryData
                        : []
                    }
                    renderItem={expressRenderItem}
                    keyExtractor={(item, index) =>
                      item?.id?.toString() || index.toString()
                    }
                  />
                </View>
              </View>
            )}
            <View className="mt-14">
              <Text
                className="text-sm font-bold color-primary"
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              >
                {t("common.address")}
              </Text>

              <Text
                className="text-sm font-semibold color-defaultBlack mt-4"
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              >
                {user?.address}
              </Text>
            </View>
            <View className="mt-10">
              <Text
                className="text-sm font-bold color-primary"
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              >
                {t("common.contact")}
              </Text>

              <Text
                className="text-sm font-semibold color-defaultBlack mt-4"
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              ></Text>
            </View>
            <View className="mt-10 mb-4">
              <Text
                className="text-sm font-bold color-primary"
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "left",
                    }
                    : {}),
                }}
              >
                {t("checkout.add_special_instructions_for_services")}
              </Text>
              <TextInput
                value={deliveryNotes ?? ""}
                onChangeText={(text) => setDeliveryNotes(text)}
                enablesReturnKeyAutomatically={false}
                className="mt-2 p-4 border rounded-sm border-defaultBackgroundColor"
                autoCorrect={false}
                style={{
                  ...(isRTL
                    ? {
                      textAlign: "right",
                      writingDirection: "rtl",
                    }
                    : {}),
                }}
              />
            </View>
            {calendarData?.length > 0 && showPickup && (
              <DatePickerModal
                type={t("common.pickup")}
                open={showPickup}
                setOpen={setShowPickup}
                calendarData={calendarData}
                date={pickupDate}
                setDate={setPickupDate}
                time={pickupTime}
                setTime={setPickupTime}
                showTimeSlotsInCalendar={true}
              />
            )}
            {deliveryDatesArr?.length > 0 && showDelivery && (
              <DatePickerModal
                type={t("common.delivery")}
                open={showDelivery}
                setOpen={setShowDelivery}
                calendarData={deliveryDatesArr}
                date={deliveryDate}
                setDate={setDeliveryDate}
                time={deliveryTime}
                setTime={setDeliveryTime}
                showTimeSlotsInCalendar={true}
              />
            )}
          </View>
        </KeyboardAwareScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <CommonLoading />
        </View>
      )}
    </>
  );
};

export default PickupAndDelivery;

const styles = StyleSheet.create({
  // input: {
  //   marginTop: 8,
  //   padding: 14,
  //   borderWidth: 1,
  //   borderRadius: 4,
  //   borderColor: COLORS.GRAY.d8,
  // },
  checkbox: {
    borderColor: COLORS.GRAY.d8,
  },
});