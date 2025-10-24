import { Animated, Pressable, Text, View } from "react-native";
import { memo, useEffect, useState } from "react";

interface ServicePosterProps {
  tab: string;
  selectedServiceCode: string;
  priceListData: any;
  showMore?: boolean;
}

const MAX_HEIGHT = 60;

const ServicePoster = ({
  tab,
  selectedServiceCode,
  priceListData,
  showMore,
}: ServicePosterProps) => {
  const [expanded, setExpanded] = useState(showMore);
  const [animation] = useState(new Animated.Value(MAX_HEIGHT));
  const [prevTab, setPrevTab] = useState(tab);

  useEffect(() => {
    if (tab !== prevTab) {
      setExpanded(false);
      animation.setValue(MAX_HEIGHT);
      setPrevTab(tab);
    }
  }, [tab]);

  const serviceDescription =
    priceListData && priceListData?.[0]?.serviceCode === selectedServiceCode
      ? priceListData?.[0]?.serviceDescription
      : "";

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? MAX_HEIGHT : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <View className="w-full mb-2 px-4 py-2 mt-2 border border-[#E7E7E7] bg-[#F9F9F9]">
      <Text className="color-buttonColor my-1 font-medium text-[18px]">
        {tab}
      </Text>
      <Animated.View style={{ height: animation, overflow: "hidden" }}>
        <Text
          numberOfLines={expanded ? 0 : 2}
          ellipsizeMode="tail"
          className="text-sm font-md leading-6 mt-1"
        >
          {serviceDescription}
        </Text>
      </Animated.View>
      {serviceDescription && serviceDescription?.length > 120 ? (
        <Pressable className="items-end justify-center" onPress={toggleExpand}>
          <Text className="color-buttonColor font-medium">
            {expanded ? "Show Less" : "Show More"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default memo(ServicePoster);
