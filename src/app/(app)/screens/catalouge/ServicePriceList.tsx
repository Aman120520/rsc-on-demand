import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import CommonLoading from "@/src/components/CommonLoading";
import CommonBorder from "@/src/components/CommonBorder";
import { colors } from "@/src/styles/theme";
import Counter from "@/src/components/Counter";
import SuggestedPackage from "./SuggestedPackage";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import config from "@/config";
import { useStore } from "@/src/context/StoreProvider";
import { useTranslation } from "react-i18next";

interface ServicePriceListProps {
  data: any;
  title?: string;
  filter?: any;
  selectedServiceTab: string;
  suggestedPackages: any;
}

const ServicePriceList = ({
  data,
  title,
  filter,
  selectedServiceTab,
  suggestedPackages,
}: ServicePriceListProps) => {
  const { appConfig } = useAppConfig();
  const { storeDetails } = useStore();

  // useState
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

  // useEffects
  useEffect(() => {
    if (data) {
      let filteredItems: any = [];
      data?.map((item: any, index: any) => {
        if (item?.category?.includes(filter?.label)) {
          // adding items for cleaning services
          filteredItems.push({
            id: item?.id,
            garment: item?.garmentName,
            price: item?.garmentPrice,
            unit: item?.unitType,
            serviceName: item?.serviceName,
            serviceCode: item?.serviceCode,
          });

          if (filteredItems?.length > 0) {
            return setDataList(filteredItems);
          }
        } else if (item && item?.unitType?.toLowerCase() === "kg") {
          // adding items for laundry services
          filteredItems.push({
            id: index,
            garment: item?.serviceName,
            price: item?.garmentPrice,
            unit: item?.unitType,
            serviceName: item?.serviceName,
            serviceCode: item?.serviceCode,
          });

          if (filteredItems?.length > 0) {
            return setDataList(filteredItems);
          }
        } else {
        }
      });
    }
  }, [data, filter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dataList) {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [dataList]);

  // renderItems
  const renderItem = ({ item, index }: any) => {
    // Functions
    const removeCategoryInLabel = (label: string) => {
      if (label) {
        return label?.replace(/^[^-]*-\s/, "");
      }
    };

    if (dataList?.length > 3 ? index === 3 : index === 0) {
      return (
        <>
          <View
            key={index}
            className="flex flex-row items-center justify-between px-5"
          >
            {/* content */}
            <View>
              <Text className="text-[14px] font-semibold capitalize my-2 color-black">
                {removeCategoryInLabel(dataList[index]?.garment)}
              </Text>
              <Text className="text-[12px] font-semibold capitalize color-black">
                {formatCurrency(
                  dataList[index]?.price ?? 0,
                  storeDetails?.Currency ?? config.currency,
                  dataList[index]?.price % 1 !== 0 ? 2 : 0
                )}
              </Text>
            </View>

            {/* counter */}
            <View>
              {appConfig?.enableCheckout ? (
                <Counter
                  item={item}
                  selectedServiceTab={selectedServiceTab}
                  filter={filter}
                />
              ) : null}
            </View>
          </View>
          {appConfig?.enablePackages &&
            suggestedPackages &&
            suggestedPackages?.length > 0 ? (
            <SuggestedPackage data={suggestedPackages} />
          ) : null}
        </>
      );
    }

    return (
      <View
        key={index}
        className="flex flex-row items-center justify-between px-5 my-4 h-10"
      >
        {/* content */}
        <View>
          <Text className="text-[14px] font-semibold capitalize my-2 color-black">
            {removeCategoryInLabel(item?.garment)}
          </Text>
          <Text className="text-[12px] font-semibold text-blcolor-black">
            {formatCurrency(
              item?.price ?? 0,
              storeDetails?.Currency ?? config.currency,
              item?.price % 1 !== 0 ? 2 : 0
            )}
          </Text>
        </View>

        {/* counter */}
        <View>
          {appConfig?.enableCheckout ? (
            <Counter
              item={item}
              selectedServiceTab={selectedServiceTab}
              filter={filter}
            />
          ) : null}
        </View>
      </View>
    );
  };

  const HeaderItem = () => {
    return (
      <>
        <View className="flex flex-row items-center mb-3 px-5">
          <Text className="text-lg font-medium color-buttonColor">{title}</Text>
          <Text className="font-md mx-4 text-sm color-[#606060] ">
            {data[0]?.unitType?.toLowerCase() === "kg"
              ? t("home.price_per_kg")
              : t("home.price_per_item")}
          </Text>
        </View>
      </>
    );
  };

  return (
    <View className="mt-3 pb-[520]">
      {title ? <HeaderItem /> : <></>}
      {data?.length > 0 ? (
        <FlatList
          data={dataList}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View className="px-5">
              <CommonBorder color={colors.defaultBackgroundColor} />
            </View>
          )}
          ListFooterComponent={() => <View style={{ height: 150 }}></View>}
        />
      ) : (
        <View
          className="flex flex-col items-center justify-center"
          style={[{ height: 300 }]}
        >
          <CommonLoading size="large" />
        </View>
      )}
    </View>
  );
};

export default memo(ServicePriceList);
