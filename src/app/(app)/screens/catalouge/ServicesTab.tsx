import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { memo, useEffect, useRef, useState } from "react";
import { SvgXml } from "react-native-svg";
import { colors } from "@/src/styles/theme";
import { LOCAL_DATA } from "@/src/utils/data";
import Icon from "@/src/icons/Icon";
import { Image } from "expo-image";
import { useAppConfig } from "@/src/context/ConfigProvider";

interface ServicesTabProps {
  data: any;
  selectedTab: any;
  setSelectedTab: Function;
  setSelectedServiceCode: Function;
  initialIndex?: number;
  setShowMore?: Function;
}

const servicesTab = ({
  data,
  selectedTab,
  setSelectedTab,
  setSelectedServiceCode,
  initialIndex,
  setShowMore,
}: ServicesTabProps) => {
  const { setAppConfig, appConfig } = useAppConfig();
  // refs
  const ref = useRef<FlatList>(null);

  const ITEM_HEIGHT = 120;

  // useState
  const [index, setIndex] = useState<number>(0);

  // useEffects
  useEffect(() => {
    ref?.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, [index]);

  // renderItems
  const renderItem = ({ item, index }: any) => {

    return (
      <TouchableOpacity
        key={index.toString()}
        className="flex-col items-center justify-center h-26 ml-1"
        onPress={() => {
          setSelectedTab(item?.ServiceName);
          setSelectedServiceCode(item?.ServiceCode);
          setIndex(index);
          setShowMore(false);
        }}
      >
        <View
          className="w-14 h-14 items-center justify-center rounded-full bg-primary/30"
          style={[
            {
              backgroundColor: `${appConfig?.theme?.primaryColor ??
                (colors.primaryColor || "#000")
                }44`,
            },
            selectedTab === item?.ServiceName
              ? {
                backgroundColor:
                  appConfig?.theme?.buttonColor ?? colors.buttonColor,
              }
              : {},
          ]}
        >
          <Image
            source={{ uri: item?.IconURL }}
            style={{ height: 30, width: 30 }}
            tintColor={selectedTab === item?.ServiceName
              ?
              colors.defaultWhite

              : appConfig?.theme?.buttonColor ?? colors.buttonColor}
          />
        </View>
        <Text
          numberOfLines={2}
          style={[
            selectedTab === item?.ServiceName
              ? { color: appConfig?.theme?.buttonColor ?? colors.buttonColor }
              : { color: "#ABABAB" },
          ]}
          className="text-[11px] font-semibold text-center w-[100] h-9 mt-2 capitalize"
        >
          {item?.ServiceName}
        </Text>
      </TouchableOpacity>
    );
  };

  // Functions
  const getItemLayout = ({ data, index }: any) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={{ marginTop: -14 }}>
      {data?.length > 0 ? (
        <FlatList
          keyExtractor={(item: any) => item?.ServiceCode}
          ref={ref}
          initialScrollIndex={index}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              ref.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
          data={data}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
        />
      ) : (
        <View style={{ height: 100 }}></View>
      )}
    </View>
  );
};

export default memo(servicesTab);