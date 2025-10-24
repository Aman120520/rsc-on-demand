import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";

interface ServiceItemsFilterProps {
  data: any;
  serviceFitler: string;
  setServiceFilter: Function;
}

const ServiceItemsFilter = ({
  data,
  serviceFitler,
  setServiceFilter,
}: ServiceItemsFilterProps) => {
  const { setAppConfig, appConfig } = useAppConfig();
  // refs
  const ref = useRef<FlatList>(null);

  // useState
  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState<any>({});

  // useEffects
  useEffect(() => {
    ref?.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, [index]);

  useEffect(() => {
    setSelected({
      id: data[0]?.id,
      label: data[0]?.label,
    });
    setServiceFilter({
      id: data[0]?.id,
      label: data[0]?.label,
      startingIndex: data[0]?.id,
    });
  }, [data]);

  // renderItems
  const renederItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        key={item?.id}
        onPress={() => {
          setSelected(item);
          setIndex(item?.id);
          setServiceFilter(item);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        className="flex-shrink h-8 border items-center justify-center px-4 rounded-full mr-5 border-primary/60"
        style={[
          selected?.id === index
            ? {
                borderColor:
                  appConfig?.theme?.buttonColor ?? colors.buttonColor,
                borderWidth: 1.2,
              }
            : {
                borderWidth: 1,
                borderColor: "#ABABAB",
              },
        ]}
      >
        <Text
          style={[
            selected?.id === index
              ? {
                  color: appConfig?.theme?.buttonColor ?? colors.buttonColor,
                  fontWeight: "800",
                }
              : { color: "#ABABAB" },
          ]}
          className="text-[13px] font-medium capitalize color-buttonColor"
        >
          {item?.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {data?.length > 0 ? (
        <FlatList
          keyExtractor={(item: any) => item?.id}
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
          style={{ paddingHorizontal: 20, marginVertical: 12 }}
          data={data}
          renderItem={renederItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            data?.length > 1 ? { paddingRight: 20 } : { paddingRight: 25 }
          }
        />
      ) : (
        <View style={{ height: 54 }}></View>
      )}
    </View>
  );
};

export default memo(ServiceItemsFilter);
