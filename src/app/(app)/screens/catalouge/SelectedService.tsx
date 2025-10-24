import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { FlatList } from "react-native";
import Counter from "@/src/components/Counter";
import { colors } from "@/src/styles/theme";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { useStore } from "@/src/context/StoreProvider";
import config from "@/config";

interface SelectedServicesProps {
  data: any;
  paddingHorizontal?: number;
  bottomSpace?: boolean;
  scrollEnabled?: boolean;
}

const SelectedServices = ({
  data,
  paddingHorizontal = 20,
  bottomSpace = false,
  scrollEnabled = true,
}: SelectedServicesProps) => {
  const { storeDetails, isNetAmountDecimal } = useStore();
  // renderItem

  const renderItem = useMemo(
    () =>
      ({ item, index }: any) => {
        const removeCategoryInLabel = (label: string) => {
          if (label) {
            return label?.replace(/^[^-]*-\s/, "");
          }
        };
        return (
          <View
            key={index}
            className="flex flex-row items-center justify-between h-auto my-2"
          >
            {/* content */}
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-semibold color-primary">
                {item?.serviceName}
              </Text>

              {item?.garmentDetails?.map((garment: any, i: any) => {
                const quantityWisePrice = garment?.price * garment?.quantity;
                return (
                  <View
                    key={i}
                    className="flex flex-row items-center justify-between"
                  >
                    <View className="my-3">
                      <Text className="text-sm font-semibold w-full my-1 color-defaultBlack capitalize">
                        {removeCategoryInLabel(garment?.name)}
                      </Text>
                      <Text className="text-sm font-semibold w-full my-1 color-defaultBlack capitalize">
                        {formatCurrency(
                          garment?.price ?? 0,
                          storeDetails?.Currency ?? config.currency,
                          garment?.price % 1 !== 0 ? 2 : 0
                        )}{" "}
                      </Text>
                    </View>

                    <View className="flex flex-row items-center justify-center">
                      <Counter item={garment} />
                      <Text className="text-md font-medium ml-5 min-w-20 text-right color-defaultBlack">
                        {formatCurrency(
                          quantityWisePrice ?? 0,
                          storeDetails?.Currency ?? config.currency,
                          quantityWisePrice % 1 !== 0 ? 2 : 0
                        )}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      },
    [data]
  );

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 20,
        paddingBottom: bottomSpace ? 100 : 0,
      }}
    >
      {data && data?.length > 0 ? (
        <FlatList
          scrollEnabled={scrollEnabled}
          style={paddingHorizontal ? { padding: paddingHorizontal } : {}}
          data={data}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }}></View>}
        />
      ) : null}
    </View>
  );
};

export default SelectedServices;
