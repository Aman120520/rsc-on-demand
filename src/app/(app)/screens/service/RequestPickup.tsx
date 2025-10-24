import defaultClient from "@/src/lib/qdc-api";
import { showToast } from "@/src/utils/CommonFunctions";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Alert,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useUser } from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import Header from "@/src/components/Header";
import CommonLoading from "@/src/components/CommonLoading";
import SelectSchedule from "@/src/components/schedule/SelectSchedule";
import CalendarView from "@/src/components/schedule/CalendarView";
import SuccessfulSchedule from "@/src/components/schedule/SuccessfulSchedule";
import CancelPickup from "@/src/components/schedule/CancelPickup";
import { useService } from "@/src/context/ServiceProvider";
import { useStore } from "@/src/context/StoreProvider";
import * as Location from "expo-location";
import config from "@/config";
import UpdateLocation from "@/src/components/schedule/UpdateLocation";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useLoginAlert } from "@/src/context/LoginAlertProvider";
import ValidationModal from "@/src/components/schedule/ValidationModal";
import { useFirebaseAnalyticsEvent } from "@/src/hooks/useFirebaseAnalyticsEvent";
import { useTranslation } from "react-i18next";

const RequestPickup = () => {
  const isFocused = useIsFocused();
  const { appConfig } = useAppConfig();

  const showLoginAlert = useLoginAlert();

  const { logEvent } = useFirebaseAnalyticsEvent();

  // params

  const { stepId } = useLocalSearchParams();
  const { selectedHomeServices, setSelectedHomeServices } = useService();

  // context API
  const { clientId, branchId, customerCode, user } = useUser();
  const { notificationData, setNotificationCount, setRescheduleItem } =
    useStore();

  // useState
  const [step, setStep] = useState(0);
  const { t } = useTranslation();
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
  const [expressDeliveryData, setExpressDeliveryData] = useState<any>(null);
  const [expressDelivery, setExpressDelivery] = useState<any>(null);

  const [showUpdateLocationSheet, setShowUpdateLocationSheet] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  // useEffects
  useEffect(() => {
    if (isFocused && !isReschedule) {
      setRescheduleItem(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setExpressDelivery(null);
      setExpressDeliveryData(null);
      setNavText(t("terms.accept_proceed"));

      if (Number(stepId) === 1) {
        setStep(1);
        return;
      }

      setSelectedServices([]);
      setStep(0);
    }
  }, [isFocused, isReschedule, stepId]);

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
              onPress: () => { },
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

      const payload = {
        Latitude: location?.coords?.latitude,
        Longitude: location?.coords?.longitude,
      };

      defaultClient.checkLocality(payload).then(async (res: any) => {
        // console.log("LOCALITY", JSON.stringify(res?.json));

        if (res?.json?.Message) {
          setShowUpdateLocationSheet(false);
          return;
        }

        if (res?.json[0]?.BranchID !== branchId) {
          setShowUpdateLocationSheet(true);
        } else {
          setShowUpdateLocationSheet(false);
        }
      });
    };

    getLocation();
  }, [isFocused]);

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient.serviceList(clientId, branchId).then((res: any) => {
        // console.log("Service List", JSON.stringify(res));
        if (res?.length > 0) {
          setServiceListData(res);
        }
      });

      defaultClient.pickupDates(clientId, branchId).then((res: any) => {
        // console.log("PICK UP DATES", JSON.stringify({ res }));
        if (res?.length > 0) {
          setPickupDatesList(res);
        }
      });

      setExpressDeliveryData(null);
      defaultClient.scheduleDetails(clientId, branchId).then((res: any) => {
        // console.log("EXPRESS", JSON.stringify(res));

        if (res?.ShowExpressService === "True") {
          getUrgentOptions(res);
        }
      });
    }
  }, [clientId, branchId, isFocused]);

  useEffect(() => {
    if (stepId) {
      setNavText(t("home.schedule_pickup"));
      setStep(1);
    }
  }, [stepId]);

  useEffect(() => {
    console.log({ selectedHomeServices });
    console.log({ stepId });

    if (selectedHomeServices) {
      let newArry: any = [];

      selectedHomeServices?.map((service: any, index: any) => {
        if (service) {
          console.log({ service });

          newArry.push({
            id: index,
            label: service?.ServiceName,
            serviceUrl: service?.ServiceURL,
            serviceCode: service?.ServiceCode,
          });

          return setSelectedServices(newArry);
        }
      });
    }
  }, [selectedHomeServices, stepId]);

  useEffect(() => {
    expressDeliveryData?.some((item: any) => {
      if (item?.isSelected) {
        setExpressDelivery(item);
      }
    });
  }, [expressDeliveryData]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        switch (step) {
          case 0:
            router.back();
            break;

          case 1:
            setStep(0);
            break;

          case 2:
            setSelectedHomeServices(null);
            router.push("/(app)/(tabs)/home");
            break;

          case 3:
            setStep(2);
            break;

          default:
            break;
        }

        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // return () =>  BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [step])
  );

  // Functions
  const onSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 0 && selectedServices?.length > 0) {
      setNavText(t("home.schedule_pickup"));
      setStep(1);
    } else if (step === 1) {
      if (!user) {
        return showLoginAlert(null, () => { });
      }

      isReschedule ? reschedulePickupFn() : requestPickupFn();
    } else if (step === 3) {
      if (!user) {
        return showLoginAlert(null, () => { });
      }
      cancelPickupFn();
    } else {
      showToast(t("home.pickup_one_service"));
    }
  };

  const requestPickupFn = async () => {
    if (selectedDate && selectedTime && !isReschedule) {
      const isValid = await isMinOrderAmountValid();
      if (!isValid) {
        setLoading(false);
        return;
      }

      scheculePickupFn();
    } else {
      showToast(t("home.select_pickup_date_time"));
    }
  };

  const reschedulePickupFn = async () => {
    if (selectedDate && selectedTime && isReschedule) {
      const isValid = await isMinOrderAmountValid();
      if (!isValid) {
        setLoading(false);
        return;
      }
      requestRescheduleFn();
    } else {
      showToast(t("home.select_pickup_date_time"));
    }
  };

  const scheculePickupFn = async () => {
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
      ExpressDeliveryID: expressDelivery?.id,
      PickUpNumber: " ",
      Flag: 1,
      PickUpSource: "CODApp",
      Services: services.join(","),
    };

    await defaultClient.schdedulePickup(payload).then((res: any) => {
      // console.log("PICKUP SCHEDULE COMPLETED", JSON.stringify(res));
      if (res?.Status === "False") {
        showToast(res?.Reason);
        setLoading(false);
      } else {
        setExpressDelivery(null);
        setExpressDeliveryData(null);
        setSelectedHomeServices(null);
        setPickupNumber(res?.Status);
        setLoading(false);
        updateNotificationCount();
        setStep(2);

        // logEvent("schedule_pick_up", {
        //   service: "Pick-Up",
        //   scheduled_time: selectedTime?.time,
        //   location: location,
        // });
      }
    });
  };

  const requestRescheduleFn = async () => {
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
      ExpressDeliveryID: expressDelivery?.id,
      PickUpNumber: pickupNumber,
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
        setExpressDelivery(null);
        setExpressDeliveryData(null);
        setPickupNumber(res?.Status);
        setLoading(false);
        updateNotificationCount();
        setStep(2);
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
        ExpressDeliveryID: expressDelivery?.id,
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
          setSelectedHomeServices(null);
          updateNotificationCount();
          setExpressDelivery(null);
          setExpressDeliveryData(null);
          router.push("/(app)/(tabs)/home");
        } else {
          showToast(res?.Status);
        }
      });
    } else {
      showToast(t("home.select_reason"));
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

  const getUrgentOptions = (scheduleDetails: any) => {
    const { ExpressDelivery1, ExpressDelivery2 } = scheduleDetails;

    let result = [ExpressDelivery1, ExpressDelivery2]
      .reduce(
        (a, c) => [
          ...a,
          ...c?.map((o: any) => ({
            id: o.Key,
            label: o.Value,
            value: o.Key,
            rate: o.Rate,
            isSelected: false,
          })),
        ],
        []
      )
      .filter((o: any) => o.label !== "" && o.value !== "");

    if (result) {
      return setExpressDeliveryData(result);
    }
  };

  const isMinOrderAmountValid = async (): Promise<boolean> => {
    try {
      const res = await defaultClient.minOrderAmount(clientId);
      // For testing:
      // const res = {
      //   IsMinimumOrderAmountActive: "False",
      //   MinimumOrderAmountValue: "500",
      //   MinimumOrderAmountMessage: "This is test message",
      // };

      if (!res) {
        return true;
      }

      if (res?.IsMinimumOrderAmountActive === "False") {
        return true;
      }

      setShowValidation(true);
      setValidationData(res);
      return false;
    } catch (error) {
      console.error("Error validating minimum order amount:", error);
      return false;
    }
  };

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
              expressDeliveryData={expressDeliveryData}
              setExpressDeliveryData={setExpressDeliveryData}
              expressDelivery={expressDelivery}
              setExpressDelivery={setExpressDelivery}
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
        {showUpdateLocationSheet ? (
          <UpdateLocation
            showUpdateLocationSheet={showUpdateLocationSheet}
            setShowUpdateLocationSheet={setShowUpdateLocationSheet}
          />
        ) : null}

        {showValidation ? (
          <ValidationModal
            open={showValidation}
            setOpen={setShowValidation}
            onContinue={() => {
              setShowValidation(false);
              scheculePickupFn();
              setLoading(false);
            }}
            message={validationData?.MinimumOrderAmountMessage ?? ""}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};
export default RequestPickup;
const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.buttonColor,
    paddingVertical: Platform.OS === "ios" ? 20 : 24,
    // marginBottom: Platform.OS === "ios" ? -34 : 0,
  },
});
