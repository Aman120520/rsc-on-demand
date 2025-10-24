import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import CommonLoading from "../CommonLoading";
import { colors } from "@/src/styles/theme";
import { Image } from "expo-image";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useFirebaseAnalyticsEvent } from "@/src/hooks/useFirebaseAnalyticsEvent";
import { useTranslation } from "react-i18next";

interface SelectScheduleProps {
  data: any[];
  selectedServices: any;
  setSelectedServices: Function;
}

const SelectSchedule = ({
  data,
  selectedServices,
  setSelectedServices,
}: SelectScheduleProps) => {
  const isFocused = useIsFocused();
  const { setAppConfig, appConfig } = useAppConfig();
  const { t } = useTranslation();

  const { logEvent } = useFirebaseAnalyticsEvent();

  // useState
  const [dataList, setDataList] = useState<any>([]);

  // useEffects
  useEffect(() => {
    if (data) {
      let newArr: any = [];
      data?.map((service, index) => {
        if (service) {
          newArr.push({
            id: index,
            label: service?.ServiceName,
            serviceUrl: service?.ServiceURL,
            serviceCode: service?.ServiceCode,
          });
        }
      });
      setDataList(newArr);
    }
  }, [data, isFocused]);

  // Functions
  const selectItems = (prevState: any, item: any, index: any) => {
    // logEvent("service_selected", {
    //   service_type: item?.label,
    // });

    if (prevState.some((prevItem: any) => prevItem.id === item.id)) {
      // Remove if items are already exist
      return prevState.filter((i: any) => i.id !== item.id);
    } else {
      // Add items
      return [
        ...prevState,
        {
          id: index,
          serviceName: item?.label,
          serviceCode: item?.serviceCode,
          serviceUrl: item?.serviceUrl,
        },
      ];
    }
  };

  return (
    <View className="flex-1 mx-5 my-4">
      {data?.length > 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-row flex-wrap justify-between"
          showsVerticalScrollIndicator={false}
        >
          {dataList?.map((item: any, index: number) => {
            const isSelected = selectedServices.some(
              (selected: any) => selected.serviceCode === item.serviceCode
            );
            return (
              <Pressable
                key={item?.serviceCode?.toString()}
                onPress={() => {
                  setSelectedServices((prevState: any) =>
                    selectItems(prevState, item, index)
                  );
                }}
                style={[
                  styles.item,
                  isSelected && {
                    backgroundColor: colors.defaultBackgroundColor,
                    borderColor:
                      appConfig?.theme?.primaryColor ?? colors.primaryColor,
                  },
                ]}
              >
                <Image
                  source={item.serviceUrl}
                  style={{ height: 50, width: 50 }}
                />
                <Text className="mt-2">{item?.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <CommonLoading />
          <Text className="text-center text-md font-bold mt-10 text-defaultBlack">
            {t("schedule.no_service_found")}
          </Text>
        </View>
      )}
    </View>
  );
};

export default SelectSchedule;

const styles = StyleSheet.create({
  item: {
    width: "48%",
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
