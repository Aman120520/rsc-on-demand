import CommonLoading from "@/src/components/CommonLoading";
import Header from "@/src/components/Header";
import CalendarView from "@/src/components/schedule/CalendarView";
import CancelPickup from "@/src/components/schedule/CancelPickup";
import SelectSchedule from "@/src/components/schedule/SelectSchedule";
import SuccessfulSchedule from "@/src/components/schedule/SuccessfulSchedule";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { showToast } from "@/src/utils/CommonFunctions";
import moment from "moment";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

const Reschedule = () => {
  const isFocused = useIsFocused();
  const { key } = useLocalSearchParams();
  const { setAppConfig, appConfig } = useAppConfig();
  const { rescheduleItem, notificationData, setNotificationCount } = useStore();
  const { clientId, branchId, customerCode } = useUser();

  const [isDropoff, setIsDropoff] = useState(false);
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [pickupDatesList, setPickupDatesList] = useState<any>([]);
  const [timeSlotsData, setTimeSlotsData] = useState<any>([]);
  const [serviceListData, setServiceListData] = useState<any>([]);
  const [selectedServices, setSelectedServices] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [navText, setNavText] = useState(t("terms.accept_proceed"));
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [pickupNumber, setPickupNumber] = useState<any>(null);
  const [isReschedule, setIsReshedule] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (key === "dropoffs") {
      setIsDropoff(true);
      setNavText(t("home.schedule_dropoff"));
      setStep(1);
    } else {
      setIsDropoff(false);
      setStep(0);
    }
  }, [key, isFocused]);

  useEffect(() => {
    if (isReschedule) {
      setIsDropoff(false);
    }
  }, [isReschedule]);

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient.serviceList(clientId, branchId).then((res: any) => {
        // console.log("Service List", JSON.stringify(res));
        setServiceListData(res);
      });

      defaultClient.pickupDates(clientId, branchId).then((res: any) => {
        // console.log("PICK UP DATES", JSON.stringify({ res }));
        setPickupDatesList(res);
      });
    }
  }, [clientId, branchId, isFocused]);

  useEffect(() => {
    setSelectedServices([]);
    setSelectedDate(null);
    setSelectedTime(null);

    if (rescheduleItem && serviceListData) {
      const selectedItems = getMatchingServices(
        serviceListData,
        rescheduleItem
      );
      if (selectedItems) {
        setSelectedServices(
          selectedItems?.map((item: any) => ({
            serviceName: item.ServiceName,
            serviceCode: item.ServiceCode,
            serviceUrl: item.ServiceURL,
          }))
        );
      }

      if (rescheduleItem && pickupDatesList) {
        let newArr: any = [];
        pickupDatesList?.map(async (item: any, index: any) => {
          const date = moment(`${item?.PickUpDate}`, "DD MMM YYYY");

          await newArr.push({
            id: index,
            date: moment(date).format("DD MMM YYYY"),
            slots: item?.PickUpTime,
          });

          newArr?.map((date: any) => {
            if (date?.date === rescheduleItem?.PickUpDate) {
              return setSelectedDate({
                id: date?.id,
                date: date?.date,
                slots: date?.slots,
              });
            }
          });
        });
      }
    }
  }, [isFocused, rescheduleItem, serviceListData, pickupDatesList]);

  // console.log({ selectedDate });

  const getMatchingServices = (servicelist: any, rescheduleItem: any) => {
    const serviceWords = rescheduleItem?.Services?.split(",").map(
      (service: any) => service?.trim()
    );

    const matchingServices = servicelist?.filter((service: any) =>
      serviceWords?.some((word: any) => word?.includes(service?.ServiceName))
    );

    return matchingServices;
  };

  const onSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 0 && selectedServices?.length > 0) {
      setStep(1);
    } else if (step === 1) {
      setNavText(t("home.schedule_dropoff"));
      isDropoff ? rescheduleDropoff() : reschedulePickup();
    } else if (step === 3) {
      cancelPickupFn();
    } else {
      showToast(t("home.pickup_one_service"));
    }
  };

  const rescheduleDropoff = () => {
    if (selectedDate && selectedTime && isDropoff) {
      setLoading(true);

      const payload = {
        PickUpDate: rescheduleItem?.PickUpDate,
        PickUpTime: rescheduleItem?.PickUpTime,
        BranchID: rescheduleItem?.BranchID,
        ClientID: rescheduleItem?.ClientID,
      };

      defaultClient
        .scheduleDropoff(payload)
        .then((res: any) => {
          // console.log(JSON.stringify(res));
          if (res?.Message) {
            showToast(res?.Message);
          }

          if (res) {
            setLoading(false);
            setStep(2);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const reschedulePickup = () => {
    if (selectedDate && selectedTime) {
      setLoading(true);
      const services: any = [];

      selectedServices?.map((service: any) => {
        services.push(service?.serviceCode);
      });

      const payload: Object = {
        ClientID: clientId,
        BranchID: branchId,
        CustomerCode: customerCode,
        PickupDate: selectedDate?.date,
        PickupTime: selectedTime?.time,
        ExpressDeliveryID: rescheduleItem?.ExpressDeliveryKey,
        PickUpNumber: rescheduleItem?.PickUpNumber,
        Flag: 2,
        PickUpSource: "CODApp",
        Services: services.join(","),
      };

      defaultClient.schdedulePickup(payload).then((res: any) => {
        // console.log("PICKUP RE-SCHEDULE COMPLETED", JSON.stringify(res));
        if (res?.Status === "False") {
          showToast(res?.Reason);
          setLoading(false);
        } else {
          setPickupNumber(res?.Status);
          setLoading(false);
          updateNotificationCount();
          setStep(2);
        }
      });
    } else {
      showToast(t("home.select_pickup_date_time"));
    }
  };

  const updateNotificationCount = () => {
    defaultClient
      .getPushNotification(clientId, branchId, customerCode)
      .then((res: any) => {
        console.log(res?.length);
        console.log(notificationData?.length);

        if (res?.Message) {
          return;
        }

        if (res?.length > 0) {
          setNotificationCount((prevState: any) => {
            return prevState + 1;
          });
        }
      });
  };

  const cancelPickupFn = () => {
    if (step === 3 && cancelReason && pickupNumber) {
      const payload = {
        ClientID: clientId,
        BranchID: branchId,
        CustomerCode: customerCode,
        PickupTime: selectedTime?.time,
        PickupDate: selectedDate?.date,
        ExpressDeliveryID: rescheduleItem?.id,
        Reason: cancelReason,
        PickupNumber: pickupNumber,
        Flag: 3,
      };

      defaultClient.schdedulePickup(payload).then((res: any) => {
        if (res?.Status === "Done") {
          // console.log("PICKUP CANCELLED", res);
          showToast(t("home.request_cancel"));
          setStep(0);
          setSelectedServices([]);
          setSelectedTime(null);
          // setSelectedHomeServices(null);
          updateNotificationCount();
          // setExpressDelivery(null);
          // setExpressDeliveryData(null);
          router.push("/home/");
        } else {
          showToast(res?.Status);
        }
      });
    } else {
      showToast(t("home.select_reason"));
    }
  };

  // const getSelectedServices = (rescheduleItem: any) => {
  //   const servicesString = rescheduleItem?.Services;

  //   const servicesList = servicesString
  //     ?.split(",")
  //     ?.map((service: any) => service?.trim());
  //   return serviceListData?.filter((serviceObj: any) =>
  //     servicesList?.includes(serviceObj?.ServiceName)
  //   );
  // };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      {step === 3 ? <></> : <Header />}
      <View className="flex-1 bg-white">
        {step === 0 ? (
          // selecting service
          <SelectSchedule
            data={serviceListData}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
          />
        ) : step === 1 ? (
          // choose date and time
          <View style={{ flex: 1 }}>
            <CalendarView
              data={pickupDatesList}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              timeSlotsData={timeSlotsData}
              setTimeSlotsData={setTimeSlotsData}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
          </View>
        ) : step === 2 ? (
          // successful pickup
          <SuccessfulSchedule
            date={selectedDate?.date}
            time={selectedTime?.time}
            setStep={setStep}
            setNavText={setNavText}
            setIsReshedule={setIsReshedule}
          />
        ) : step === 3 ? (
          <CancelPickup
            setCancelReason={setCancelReason}
            onClose={() => {
              setStep(2);
            }}
          />
        ) : (
          <></>
        )}

        {step !== 2 ? (
          <Pressable
            disabled={loading}
            onPress={onSubmit}
            style={[
              styles.btn,
              {
                backgroundColor:
                  appConfig?.theme?.buttonColor ?? colors.buttonColor,
              },
            ]}
          >
            {!loading ? (
              <Text className="text-md color-defaultWhite">{navText}</Text>
            ) : (
              <CommonLoading />
            )}
          </Pressable>
        ) : (
          <></>
        )}
      </View>
    </SafeAreaView>
  );
};
export default Reschedule;

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.buttonColor,
    paddingVertical: Platform.OS === "ios" ? 20 : 24,
  },
});
