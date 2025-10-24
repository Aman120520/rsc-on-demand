import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import Banner from "@/src/components/Banner";
import Header from "@/src/components/Header";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useService } from "@/src/context/ServiceProvider";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SvgXml } from "react-native-svg";
import Service from "@/src/components/home/service";
import LinearGradient from "react-native-linear-gradient";
import PopupBanner from "@/src/components/PopupBanner";
import { useAppConfig } from "@/src/context/ConfigProvider";
import Icon from "@/src/icons/Icon";
import { getLightestColor } from "@/src/utils/CommonFunctions";
import config from "@/config";
import { usePushNotifications } from "@/src/hooks/usePushNotifcation";
import i18n from "@/src/i18n";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

const Home = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const SCREEN_WIDTH = Dimensions.get("screen").width;
  const SCREEN_HEIGHT = Dimensions.get("screen").height;

  // context API
  const { setAppConfig, appConfig } = useAppConfig();

  const {
    clientId,
    branchId,
    customerCode,
    setBranchId,
    user,
    setReferralId,
    fcmToken,
  } = useUser();

  const {
    setDialNumber,
    setPendingOrdersData,
    packagesData,
    setPackagesData,
    availablePackagesData,
    setAvailablePackagesData,
    activePackagesData,
    setActivePackagesData,
    storeDetails,
    setStoreDetails,
    setIsnetAmountDecimal,
  } = useStore();
  const {
    isRazorPayActive,
    setIsRazorPayActive,
    selectedHomeServices,
    setSelectedHomeServices,
  } = useService();

  const isCheckoutEnabled = appConfig?.enableCheckout;

  // useState
  const [refreshing, setRefreshing] = useState(false);
  const [showPopupBanner, setShowPopupBanner] = useState<boolean>(false);
  const [popupBannerImg, setPopupBannerImg] = useState<string>("");
  const [bannerData, setBannerData] = useState([]);
  const [serviceListData, setServiceListData] = useState([]);
  const [serviceMsg, setServiceMsg] = useState("");
  const [pendingOrders, setPendingOrders] = useState([]);
  const isRtl = i18n.dir() === "rtl";
  const { expoPushToken, notification } = usePushNotifications();

  const [greenTileDimensions, setGreenTileDimensions] = useState<{
    width: number;
    height: number;
  }>();

  useEffect(() => {
    loadDataWithoutRegister();
    loadData();
    getReferralCode();
  }, []);

  useEffect(() => {
    if (clientId && branchId && customerCode) {
      defaultClient
        .getMyOrders(clientId, branchId, customerCode)
        .then((res: any) => {
          // console.log("MY ORDERS", JSON.stringify(res));
          setPendingOrdersData(res[0]?.OrderDetails);
        });
    }

    setSelectedHomeServices([]);
  }, [isFocused]);

  useEffect(() => {
    if (notification) {
      console.log("====================================");
      console.log("Notification:", notification);
      console.log("====================================");
    }
  }, [notification]);

  const loadData = async () => {
    if (clientId && branchId && customerCode) {
      await defaultClient.homeBanners(clientId).then((res: any) => {
        // console.log(JSON.stringify(res));
        if (
          res &&
          res?.IsPopUpImageOn === "True" &&
          res?.PopUpImageUrl !== ""
        ) {
          setShowPopupBanner(true);
          setPopupBannerImg(res?.PopUpImageUrl);
        } else {
          setShowPopupBanner(false);
          setPopupBannerImg("");
        }

        return setBannerData(res?.Bannerlist);
      });

      defaultClient.serviceList(clientId, branchId).then((res: any) => {
        // console.log("Service List", JSON.stringify(res));
        if (res?.Message) {
          setServiceMsg(res?.Message);
        }
        if (res?.length > 0) {
          setServiceListData(res);
        }
      });

      defaultClient
        .getMyOrders(clientId, branchId, customerCode)
        .then((res: any) => {
          // console.log("MY ORDERS", JSON.stringify(res));
          if (res) {
            setPendingOrders(res[0]?.OrderDetails);
          }
        });

      defaultClient
        .customerSummary(clientId, branchId, customerCode)
        .then((res: any) => {
          // console.log("CUSTOMER SUMMARY", JSON.stringify(res));

          if (res) {
            setDialNumber(res?.DialNumber);
          }

          if (res?.BranchID !== branchId) {
            setBranchId(res?.BranchID);
          }
        });

      await defaultClient
        .customerAvailablePackage(clientId, branchId, customerCode)
        .then((res: any) => {
          // console.log("CUSTOMER AVAILABLE PACKAGES", JSON.stringify(res));
          if (res) {
            setAvailablePackagesData(res?.SuggestedPackage);
            setPackagesData(res?.SuggestedPackage);
            setIsRazorPayActive(
              res?.IsRazorPayActive === "True" ? true : false
            );
          }
        })
        .catch((err) => { });

      await defaultClient
        .getCustomerActivePackages(clientId, customerCode)
        .then((res: any) => {
          // console.log("CUSTOMER ACTIVE PACKAGES", JSON.stringify(res));
          if (res?.length > 0) {
            setActivePackagesData(res);
            setPackagesData((prevState: any) => [...prevState, ...res]);
          }
        })
        .catch((err) => { });

      await defaultClient.storeDetails(clientId, branchId).then((res: any) => {
        if (res) {
          setStoreDetails(res);
        }
      });

      defaultClient
        .bookingConfiguration(clientId, branchId)
        .then(async (res: any) => {
          // console.log("Booking Config", JSON.stringify(res));
          if (res) {
            // setBookingConfig(res);

            if (res?.IsNetAmountDecimal === "True") {
              setIsnetAmountDecimal(true);
            } else {
              setIsnetAmountDecimal(false);
            }
          }
        });
      const expoTokenPayload = {
        CustomerCode: customerCode,
        ClientID: clientId,
        BranchID: branchId,
        GCMKey: Platform.OS === "android" ? fcmToken : undefined,
        DeviceToken: Platform.OS === "ios" ? fcmToken : undefined,
      };

      console.log("====================================");
      console.log("expoTokenPayload", expoTokenPayload);
      console.log("user", user);
      console.log("====================================");
      setTimeout(() => {
        if (user !== null) {
          defaultClient.updateGCM(expoTokenPayload).then((res: any) => {
            console.log("UPDATE GCM", JSON.stringify(res));
          });
        }
      }, 3000);
    }
  };

  const loadDataWithoutRegister = async () => {
    if (clientId && branchId) {
      await defaultClient.homeBanners(clientId).then((res: any) => {
        // console.log(JSON.stringify(res));
        if (
          res &&
          res?.IsPopUpImageOn === "True" &&
          res?.PopUpImageUrl !== ""
        ) {
          setShowPopupBanner(true);
          setPopupBannerImg(res?.PopUpImageUrl);
        } else {
          setShowPopupBanner(false);
          setPopupBannerImg("");
        }

        return setBannerData(res?.Bannerlist);
      });

      defaultClient.serviceList(clientId, branchId).then((res: any) => {
        // console.log("Service List", JSON.stringify(res));
        if (res?.Message) {
          setServiceMsg(res?.Message);
        }
        if (res?.length > 0) {
          setServiceListData(res);
        }
      });

      await defaultClient.storeDetails(clientId, branchId).then((res: any) => {
        if (res) {
          setStoreDetails(res);
        }
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRefreshing(false);
  };

  const linearGradietnColors = [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
  ];

  linearGradietnColors.push(
    getLightestColor(
      appConfig?.theme?.primaryColor ?? colors.primaryColor,
      appConfig?.theme?.buttonColor ?? colors.buttonColor
    )
  );

  const adjustLastColorOpacity = (
    colors: string[],
    opacity: number
  ): string[] =>
    colors.map((color, index) => {
      if (index === colors.length - 1 && color.startsWith("#")) {
        const hex = color.slice(1);
        const bigint = parseInt(hex, 16);

        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        const alpha = Math.round(opacity * 255)
          .toString(16)
          .padStart(2, "0");

        return `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}${alpha}`;
      }
      return color;
    });

  const opacity = 0.98;
  const backgroundColors = adjustLastColorOpacity(
    linearGradietnColors,
    opacity
  );

  const getReferralCode = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_REFERRAL_API_URL}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Org-Id":
              appConfig?.organizationId?.toString() ??
              config.OrganizationId.toString(),
            "accept-language": i18n.language.toString(),
          },
          body: JSON.stringify({
            operationName: "Referral",
            variables: {
              externalId: customerCode,
            },
            query:
              "query Referral($externalId: String) {\n    referral(externalId: $externalId) {\n    code\n    externalId\n  id\n  locationId\n    referrer {\n      id\n      code\n    }\n    referrerId\n    transactions {\n      policyId\n    }\n    statistics {\n      id\n      totalReferrals\n      successfulReferrals\n      rewardEarned\n      rewardRedeemed\n      rewardBalance\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      // console.log("ReferralCodeData", JSON.stringify(data));

      if (data?.referral && data?.referral?.id) {
        setReferralId(data?.referral?.id?.toString());
      }
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white -mb-40">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-primary opacity-90"
        style={{
          backgroundColor: getLightestColor(
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
            appConfig?.theme?.buttonColor ?? colors.buttonColor
          ),
        }}
        refreshControl={
          <RefreshControl
            tintColor={appConfig?.theme?.buttonColor ?? colors.buttonColor}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <LinearGradient
          colors={backgroundColors}
          style={{
            flex: 1,
          }}
        >
          <Banner data={bannerData} />

          {isCheckoutEnabled ? (
            <>
              <Text className="px-4 text-md font-bold text-center color-black mt-7 mb-2">
                {t("home.select_service_get_estimate")}
              </Text>

              <Service data={serviceListData} serviceMsg={serviceMsg} />

              <Text className="px-4 text-md font-bold text-center color-black mt-12">
                {t("home.choose_pickup_select")}
              </Text>
              <Text className="px-4 text-md font-bold text-center color-black mt-1">
                {t("home.service_and_relax")}
              </Text>

              <View className="items-center justify-center mt-8 mb-28 py-3">
                <Pressable
                  onPress={() => {
                    router.push("/(app)/screens/service/RequestPickup");
                  }}
                  className="bg-buttonColor px-4 py-3 flex flex-row items-center rounded-lg mb-16"
                >
                  {isRtl ? (
                    <>
                      <Text className="text-white font-semibold text-sm mx-4">
                        {t("home.schedule_pickup")}
                      </Text>
                      <Icon
                        name="arrow_left"
                        size={20}
                        color={colors.defaultWhite}
                      />
                    </>
                  ) : (
                    <>
                      <Text className="text-white font-semibold text-sm mx-4">
                        {t("home.schedule_pickup")}
                      </Text>
                      <Icon
                        name="arrow_right"
                        size={20}
                        color={colors.defaultWhite}
                      />
                    </>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <View className="flex-1">
              <View className="">
                <Text className="px-4 text-md font-bold text-center color-black mt-3 mb-2">
                  {t("home.choose_services_pickup_relax")}
                </Text>

                <Text className="px-4 text-md font-bold text-center color-black mt-3 mb-5">
                  {t("home.its_that_simple")}
                </Text>

                <Service data={serviceListData} serviceMsg={serviceMsg} />
              </View>

              <View className="items-center justify-center mt-16 mb-20 py-3">
                <Pressable
                  disabled={
                    !isCheckoutEnabled && selectedHomeServices?.length === 0
                  }
                  onPress={() => {
                    isCheckoutEnabled && selectedHomeServices?.length > 0
                      ? router.push({
                        pathname: "/(app)/screens/service/RequestPickup",
                        params: { stepId: 1 },
                      })
                      : router.push({
                        pathname: "/(app)/screens/service/RequestPickup",
                        params: { stepId: 1 },
                      });
                  }}
                  className="bg-buttonColor px-4 py-3 flex flex-row items-center rounded-lg mb-16"
                  style={{
                    opacity: isCheckoutEnabled
                      ? 1
                      : selectedHomeServices?.length > 0
                        ? 1
                        : 0.6,
                  }}
                >
                  {isRtl ? (
                    <>
                      <Icon
                        name="arrow_right"
                        size={20}
                        color={colors.defaultWhite}
                      />
                      <Text className="text-white font-semibold text-sm mx-4">
                        {t("home.schedule_pickup")}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-white font-semibold text-sm mx-4">
                        {t("home.schedule_pickup")}
                      </Text>
                      <Icon
                        name="arrow_right"
                        size={20}
                        color={colors.defaultWhite}
                      />
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {showPopupBanner ? (
            <PopupBanner
              showPopupBanner={showPopupBanner}
              setShowPopupBanner={setShowPopupBanner}
              popupBannerImg={popupBannerImg}
            />
          ) : null}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Home;
