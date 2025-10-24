import Header from "@/src/components/Header";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import TabBarCustom from "@/src/custom/TabBarCustom";
import Divider from "@/src/components/Divider";
import CommonLoading from "@/src/components/CommonLoading";
import Icon from "@/src/icons/Icon";
import CancelPickup from "@/src/components/schedule/CancelPickup";
import { showToast } from "@/src/utils/CommonFunctions";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useStore } from "@/src/context/StoreProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const MyRequest = () => {
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const { setAppConfig, appConfig } = useAppConfig();
  const { rescheduleItem, setRescheduleItem, setNotificationCount } =
    useStore();

  const { clientId, branchId, customerCode } = useUser();
  const [loading, setLoading] = useState(false);
  const [pickupData, setPickupData] = useState([]);
  const [dropoffData, setDropoffData] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();

  // Date translation functions
  const translateDate = (dateString: string) => {
    if (!dateString) return dateString;

    // Parse date format like "03 Oct 2025" or "06 Aug 2024"
    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const translatedMonth = t(`date_formatting.months.${month}`);
      return `${day} ${translatedMonth} ${year}`;
    }
    return dateString;
  };

  const translateTime = (timeString: string) => {
    if (!timeString) return timeString;

    // Translate AM/PM based on current language
    const amTranslation = t("calendar.time.am");
    const pmTranslation = t("calendar.time.pm");

    return timeString
      .replace(/AM/g, amTranslation)
      .replace(/PM/g, pmTranslation);
  };

  const getPickupsTitle = () => {
    switch (i18n.language) {
      case "en":
        return "Pickups";
      case "fr":
        return "Ramassages";
      case "hi":
        return "पिकअप";
      case "ar":
        return "الاستلامات";
      default:
        return "Pickups";
    }
  };

  const getDropoffsTitle = () => {
    switch (i18n.language) {
      case "en":
        return "Dropoffs";
      case "fr":
        return "Livraisons";
      case "hi":
        return "ड्रॉप-ऑफ";
      case "ar":
        return "التسليمات";
      default:
        return "Dropoffs";
    }
  };

  const routes = useMemo(
    () => [
      { key: "pickups", title: getPickupsTitle() },
      { key: "dropoffs", title: getDropoffsTitle() },
    ],
    [i18n.language]
  );

  useEffect(() => {
    if (clientId && branchId && customerCode) {
      setLoading(true);

      let pickupsPromise = defaultClient.getPickups(
        clientId,
        branchId,
        customerCode
      );
      let dropoffsPromise = defaultClient.getDropoffs(
        clientId,
        branchId,
        customerCode
      );

      Promise.all([pickupsPromise, dropoffsPromise])
        .then(([pickupsRes, dropoffsRes]) => {
          if (pickupsRes) {
            setPickupData(pickupsRes);
          }

          if (dropoffsRes) {
            // console.log("DROP OFF RES", JSON.stringify(dropoffsRes));
            setDropoffData(dropoffsRes);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching pickups and dropoffs:", error);
          setLoading(false);
        });
    }
  }, [isFocused]);

  const PickupRoute = () => {
    return <CategoryList data={pickupData} />;
  };

  const DropOffRoute = () => {
    return <CategoryList data={dropoffData} />;
  };

  const renderScene = SceneMap({
    pickups: PickupRoute,
    dropoffs: DropOffRoute,
  });

  const onCancelRequest = () => {
    if (cancelReason === "") {
      showToast(t("static_messages.select_reason"));
    } else {
      const { PickUpNumber, PickUpDate, PickUpTime, BranchID, ClientID } =
        currentItem;

      const payload = {
        ClientID: ClientID || clientId,
        BranchID: BranchID || branchId,
        CustomerCode: customerCode,
        PickupTime: PickUpTime,
        PickupDate: PickUpDate,
        PickupNumber: PickUpNumber,
        Reason: cancelReason,
        Flag: 3,
      };

      defaultClient.schdedulePickup(payload).then((res: any) => {
        console.log("PICKUP CANCELLED", res);
        if (res?.Status === "Done") {
          setCancelReason("");
          showToast(t("static_messages.request_cancelled_successfully"));
          updateNotificationCount();
          router.push("/(app)/home");
          setShowCancelModal(!showCancelModal);
        } else {
          showToast(res?.Status);
          setShowCancelModal(!showCancelModal);
        }
      });
    }
  };

  const updateNotificationCount = () => {
    defaultClient
      .getPushNotification(clientId, branchId, customerCode)
      .then((res: any) => {
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

  const CategoryList = ({ data }: any) => {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={
          <View>
            <Text className="text-center text-lg font-medium text-primaryText mt-80">
              {t("common.no_records")}
            </Text>
          </View>
        }
      />
    );
  };

  const renderItem = ({ item }: any) => {
    const key = index === 0 ? "pickups" : "dropoffs";

    // Log original and translated dates for debugging
    const originalDate = key === "pickups" ? item?.PickUpDate : item?.DropDate;
    const originalTime =
      key === "pickups" ? item?.PickUpTime : item?.DropOffTime;
    const translatedDate = translateDate(originalDate);
    const translatedTime = translateTime(originalTime);

    // console.log("Date Translation:", {
    //   original: originalDate,
    //   translated: translatedDate,
    //   language: i18n.language,
    // });
    // console.log("Time Translation:", {
    //   original: originalTime,
    //   translated: translatedTime,
    //   language: i18n.language,
    // });

    const editItem = (item: any) => {
      setRescheduleItem(item);

      router.push({
        pathname: "/(app)/screens/service/Reschedule",
        params: { key: key },
      });
    };

    const deleteItem = (item: any) => {
      setShowCancelModal(!showCancelModal);
      setCurrentItem(item);
    };

    return (
      <View className="flex-row items-center justify-between px-7 py-6">
        <View className="flex-1">
          <Text className="text-md font-bold my-2">
            {key === "pickups"
              ? translateDate(item?.PickUpDate)
              : translateDate(item?.DropDate)}
          </Text>
          <Text className="text-sm my-2">
            {/* {key === "pickups"
              ? translateTime(item?.PickUpTime)
              : translateTime(item?.DropOffTime)} */}
            {key === "pickups" ? item?.PickUpTime : item?.DropOffTime}
          </Text>
          {key === "pickups" ? (
            <Text numberOfLines={2} className="font-sm my-2 leading-6">
              {item?.Services}
            </Text>
          ) : null}
        </View>

        <View className="flex-1 flex-row justify-end">
          <Pressable className="mx-2 p-6" onPress={() => editItem(item)}>
            <Icon
              name="edit"
              color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
            />
          </Pressable>
          <Pressable className="mx-2 p-6" onPress={() => deleteItem(item)}>
            <Icon
              name="delete"
              color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTabBar = (props: object) => (
    <TabBarCustom index={index} setIndex={setIndex} {...props} />
  );

  if (loading) {
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <View className="flex-1 bg-defaultWhite items-center justify-center">
        <CommonLoading />
      </View>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      {showCancelModal ? (
        <View className="flex-1">
          <CancelPickup
            setCancelReason={setCancelReason}
            onClose={() => setShowCancelModal(!showCancelModal)}
          />

          <Pressable
            onPress={onCancelRequest}
            className="items-center bg-buttonColor py-5"
          >
            <Text className="color-defaultWhite text-md">
              {t("auth.submit")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Header />
          <View className="flex-1 bg-defaultWhite">
            <TabView
              renderTabBar={renderTabBar}
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: width }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};
export default MyRequest;
const styles = StyleSheet.create({});
