import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  I18nManager,
  Text,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";
import { router } from "expo-router";
import { colors } from "../styles/theme";
import { useService } from "../context/ServiceProvider";
import { useStore } from "../context/StoreProvider";
import { showToast } from "../utils/CommonFunctions";
import { useAppConfig } from "../context/ConfigProvider";
import { useLoginAlert } from "../context/LoginAlertProvider";
import { useUser } from "../context/UserProvider";
import { useLanguageManager } from "@/src/i18n/useLanguageManager";
import i18n from "@/src/i18n";
import { use } from "i18next";
import { useTranslation } from "react-i18next";

interface BannerProps {
  data: any;
}

export const screenHeight = Dimensions.get("window").height;
export const imageHeight = screenHeight * 0.29;

export const screenWidth = Dimensions.get("window").width;
export const imageWidth = screenWidth;

const Banner = ({ data }: BannerProps) => {
  const { appConfig } = useAppConfig();
  const { packagesData } = useStore();
  const { setSelectedPackageDetail } = useService();
  const showLoginAlert = useLoginAlert();
  const { user } = useUser();
  const [isUserHandled, setIsUserHandled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<FlatList>(null);
  const { t } = useTranslation();

  const { isLoading } = useLanguageManager();

  const isRtl = i18n.dir() === "rtl";
  const reversedData = isRtl === true ? [...data].reverse() : data;
  const dataLength = data?.length || 0;

  useEffect(() => {
    const myInterval = setInterval(() => {
      if (data?.length > 0 && !isUserHandled)
        if (currentIndex < data.length - 1) setCurrentIndex((prev) => prev + 1);
        else setCurrentIndex(0);
    }, 2000);
    return () => {
      clearInterval(myInterval);
    };
  });

  useEffect(() => {
    !isUserHandled &&
      scrollViewRef.current?.scrollToIndex({
        animated: true,
        index: currentIndex,
        viewPosition: 0.3,
      });
    return () => { };
  }, [currentIndex, isUserHandled]);

  const clearSliderTimeout = () => setIsUserHandled(true);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveIndex(index);
  };

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      scrollViewRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.3,
      });
    });
  };

  if (isLoading) {
    return <View />;
  }

  return (
    <View>
      {dataLength > 0 ? (
        <Animated.FlatList
          key={i18n.language} // <-- Force re-render with new key
          data={reversedData}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToStart
          snapToEnd
          ref={scrollViewRef}
          onScrollToIndexFailed={onScrollToIndexFailed}
          renderItem={({ item, index }: any) => {
            const screenName = item?.ScreenName?.split(":")[0];
            const serviceCode = item?.ScreenName?.split(":")[1];
            const packageId = item?.ScreenName?.split(":").pop();
            const filteredPackage = packagesData?.filter(
              (pack: any) => pack?.PackageID === packageId
            );

            return (
              <TouchableOpacity
                key={index}
                className="relative bg-darkGray"
                disabled={screenName ? false : true}
                onPress={() => {
                  if (screenName === "packages" && filteredPackage) {
                    setSelectedPackageDetail(...filteredPackage);
                    if (!user) {
                      return showLoginAlert(null, () => { });
                    }
                    router.push({
                      pathname: "/(app)/screens/package/PackageDetailsScreen",
                      params: {
                        routeKey: filteredPackage[0]?.AssignID
                          ? "active"
                          : "available",
                      },
                    });
                  } else {
                    showToast(t("static_messages.package_not_found"));
                  }
                }}
              >
                <Image
                  recyclingKey={item?.BannerImageURL}
                  key={index}
                  source={item?.BannerImageURL}
                  placeholder={"blurhash"}
                  contentFit="cover"
                  transition={1000}
                  style={[
                    {
                      width: imageWidth,
                      height: imageHeight,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View
          style={[
            {
              width: imageWidth,
              height: imageHeight,
              backgroundColor: colors.defaultBackgroundColor,
            },
          ]}
        ></View>
      )}

      <View
        key={`dots-${i18n.language}`} // <-- Force re-render with new key
        className="flex flex-row items-center justify-center my-8"
        // Explicitly set flexDirection for dots
        style={{ flexDirection: isRtl ? "row-reverse" : "row" }}
      >
        {data?.map((_: any, index: any) => (
          <View
            key={index}
            className="h-0.5 w-7 rounded-full items-center mx-1.5"
            style={[
              activeIndex === index
                ? {
                  backgroundColor:
                    appConfig?.theme?.buttonColor ?? colors.buttonColor,
                }
                : { backgroundColor: "#C5D5DE" },
            ]}
          ></View>
        ))}
      </View>
    </View>
  );
};

export default Banner;
