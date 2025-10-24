import {
  Alert,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIntroSlider from "react-native-app-intro-slider";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FIRST_TIME_INSTALL,
  IS_VALID_USER,
  useUser,
} from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import defaultClient from "@/src/lib/qdc-api";
import * as Location from "expo-location";
import { useVideoPlayer, VideoView } from "expo-video";
import Octicons from "@expo/vector-icons/Octicons";
import { useTranslation } from "react-i18next";
import { usePushNotifications } from "@/src/hooks/usePushNotification";

const OnBoardingScreen = () => {
  const { t } = useTranslation();
  const { appConfig } = useAppConfig();
  const isVideo = appConfig?.onboardImage?.[0]?.toLowerCase().endsWith(".mp4");
  const { expoPushToken, notification } = usePushNotifications();
  useEffect(() => {
    if (expoPushToken) {
      console.log("====================================");
      console.log("Expo Push Token:", expoPushToken?.data);
      console.log("====================================");
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log("====================================");
      console.log("Notification:", notification);
      console.log("====================================");
    }
  }, [notification]);

  const slides = isVideo
    ? []
    : [
      {
        key: "k1",
        title: "Ecommerce Leader",
        text: "Best ecommerce in the world",
        image: appConfig?.onboardImage?.[0] ?? "",
        // require("../../assets/walkthrough-assets/screen1.png"),
      },
      {
        key: "k2",
        title: "fast delivery",
        text: "get your order insantly fast",
        image: appConfig?.onboardImage?.[1] ?? "",
        // require("../../assets/walkthrough-assets/screen2.png"),
      },
      {
        key: "k3",
        title: "many store ",
        text: "Multiple store location",
        image: appConfig?.onboardImage?.[2] ?? "",
        // require("../../assets/walkthrough-assets/screen3.png"),
      },
    ];

  const { setClientId, setBranchId } = useUser();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isServicable, setIsServiable] = useState(false);

  const [region, setRegion] = useState({
    latitude: location?.coords?.latitude,
    longitude: location?.coords?.longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [mute, setMute] = useState(false);

  const assetId = isVideo ? appConfig?.onboardImage?.[0] : "";

  const player1 = useVideoPlayer(assetId);

  player1.play();
  player1.muted = true;
  player1.loop = true;

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("schedule.location_permission"),
          t("schedule.location_permission_msg"),
          [
            {
              text: t("common.close"),
              onPress: () => router.push("/NotServicable"),
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

  useEffect(() => {
    const payload = {
      Latitude: region.latitude ? region?.latitude : location?.coords?.latitude,
      Longitude: region?.longitude
        ? region?.longitude
        : location?.coords?.longitude,
    };

    // Test location
    // const payload = {
    //   PackageName: "SubscriptionManagement",
    //   Latitude: "13.045626439391159",
    //   Longitude: "80.21921102079459",
    // };

    // console.log("LAT, LONG", JSON.stringify(payload));

    defaultClient.checkLocality(payload).then(async (res: any) => {
      // console.log("LOCALITY", JSON.stringify(res?.json));

      if (res?.json?.Message) {
        setIsServiable(false);
        setBranchId("");
        return;
      }

      if (res?.json[0]?.BranchID) {
        await setClientId(res?.json[0]?.ClientID);
        await setBranchId(res?.json[0]?.BranchID);
      }

      if (res?.response?.status === 200) {
        setIsServiable(true);
      }

      if (res?.response?.status === 404) {
        setIsServiable(false);
      }
    });
  }, [location, region]);

  const renderItem = ({ item }: any) => {
    return (
      <View className="flex-1 items-center justify-center">
        <ImageBackground
          // source={item.image}
          source={appConfig?.onboardImage ? { uri: item.image } : item.image}
          className="w-full h-full mb-10"
          resizeMethod="auto"
          resizeMode={Platform.OS === "ios" ? "contain" : "contain"}
        ></ImageBackground>
      </View>
    );
  };

  const btnStyles =
    "mt-2 px-5 py-3 w-full  items-center justify-center text-white font-semibold text-center";

  const renderNextButton = () => {
    return (
      <View>
        <Text className={btnStyles}>{t("onboarding.next")}</Text>
      </View>
    );
  };

  const renderSkipButton = () => {
    return (
      <View>
        <Text className={btnStyles}>{t("onboarding.skip")}</Text>
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View>
        <Text className={btnStyles}>{t("onboarding.done")}</Text>
      </View>
    );
  };

  const onComplete = async () => {
    if (!isServicable) {
      return router.push("/NotServicable");
    }
    await AsyncStorage.setItem(FIRST_TIME_INSTALL, "True");
    let userStatus = "True";
    await AsyncStorage.setItem(IS_VALID_USER, userStatus);
    router.replace("/(app)/(tabs)/home");
    setMute(true);
  };

  useEffect(() => {
    if (mute) {
      player1.muted = false;
    } else {
      player1.muted = true;
    }
  }, [mute]);

  return (
    <SafeAreaView
      className="flex-1"
      style={[
        {
          backgroundColor:
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
        },
        isVideo && {
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      {isVideo ? (
        <>
          <VideoView
            style={styles.video}
            player={player1}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="cover"
            nativeControls={false}
          />

          <View className="absolute top-24 right-8">
            <Octicons
              onPress={() => setMute(!mute)}
              name={mute ? "unmute" : "mute"}
              size={24}
              color="white"
            />
          </View>

          <View
            className="flex items-center justify-center"
            style={{ marginBottom: Platform.OS === "android" ? 3 : 0 }}
          >
            <TouchableOpacity
              onPress={onComplete}
              className="bg-buttonColor px-20 py-4 rounded-full items-center justify-center"
            >
              <Text className="font-medium text-white">
                {t("onboarding.continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="flex-1">
          {!isVideo && (
            <AppIntroSlider
              dotStyle={styles.dot}
              activeDotStyle={styles.activeDot}
              data={slides}
              onDone={onComplete}
              onSkip={onComplete}
              showSkipButton={true}
              renderItem={renderItem}
              nextLabel={t("onboarding.next")}
              renderNextButton={renderNextButton}
              renderDoneButton={renderDoneButton}
              renderSkipButton={renderSkipButton}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    marginTop: 20,
    backgroundColor: colors.darkgray,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    marginTop: 20,
    backgroundColor: colors.defaultWhite,
  },
  video: {
    width: "100%",
    height: "92%",
  },
});
