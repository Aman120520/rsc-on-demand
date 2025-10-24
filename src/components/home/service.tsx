import { FlatList, Pressable, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { router } from "expo-router";
import { LOCAL_DATA } from "@/src/utils/data";
import { Image } from "expo-image";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { colors } from "@/src/styles/theme";
import { useService } from "@/src/context/ServiceProvider";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { showToast } from "@/src/utils/CommonFunctions";
import { ColorSpace } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

interface ServiceProps {
  data: Array<[]>;
  serviceMsg?: string;
}

const Service = ({ data, serviceMsg }: ServiceProps) => {
  const isFocused = useIsFocused();
  const { appConfig } = useAppConfig();
  const { t } = useTranslation();
  const isCheckoutEnabled = appConfig?.enableCheckout;

  const { selectedHomeServices, setSelectedHomeServices } = useService();
  const [btnActive, setBtnActive] = useState(false);

  useEffect(() => {
    // setSelectedHomeServices([]);
  }, [isFocused]);

  useEffect(() => {
    if (selectedHomeServices?.length > 0) {
      setBtnActive(true);
    } else {
      setBtnActive(false);
    }
  }, [selectedHomeServices]);

  // renderItems
  const renderItemForCheckout = ({ item, index }: any) => {
    // console.log("ITEM", item);
    return (
      <Pressable
        key={item?.ServiceCode}
        onPress={() => {
          router.push({
            pathname: "/(app)/screens/catalouge/CatalougeScreen",
            params: { index: index, tab: item?.ServiceName },
          });
        }}
      >
        <View
          className="w-32 h-32 rounded-2xl items-center justify-center px-2 bg-white border-primary border"
        // style={{
        //   backgroundColor: `${
        //     appConfig?.theme?.primaryColor ?? (colors.primaryColor || "#000")
        //   }33`,
        // }}
        >
          <View>
            <Image
              source={{ uri: item?.ServiceURL }}
              style={{ height: 40, width: 40 }}
              contentFit="contain"
            />
            {/* {LOCAL_DATA.localServiceData?.map((service: any, index: any) =>
              service.serviceCode === item?.ServiceCode ? (
                <SvgXml key={index} xml={service?.xml} height={24} />
              ) : (
                <View className="" key={index}></View>
              )
            )} */}
          </View>
          <Text className="text-buttonColor text-sm font-[600] text-center capitalize mt-2">
            {item?.ServiceName}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable key={item?.ServiceCode} onPress={() => onTilePress(item)}>
        <View
          className="w-32 h-32 rounded-2xl items-center justify-center px-2 bg-white"
          style={{
            backgroundColor: selectedHomeServices?.includes(item)
              ? `${appConfig?.theme?.primaryColor ??
              (colors.primaryColor || "#000")
              }33`
              : colors.defaultWhite,

            borderColor: selectedHomeServices?.includes(item)
              ? appConfig?.theme?.buttonColor
              : `${appConfig?.theme?.primaryColor ??
              (colors.primaryColor || "#000")
              }99`,

            // borderWidth: selectedHomeServices?.includes(item) ? 0 : 2,
            borderWidth: selectedHomeServices?.includes(item) ? 1.1 : 1,
          }}
        >
          <View>
            <Image
              source={{ uri: item?.ServiceURL }}
              style={{ height: 40, width: 40 }}
              contentFit="contain"
            />
            {/* {LOCAL_DATA.localServiceData?.map((service: any, index: any) =>
              service.serviceCode === item?.ServiceCode ? (
                <SvgXml key={index} xml={service?.xml} height={24} />
              ) : (
                <View className="" key={index}></View>
              )
            )} */}
          </View>
          <Text className="text-buttonColor text-sm font-[600] text-center capitalize mt-2">
            {item?.ServiceName}
          </Text>
        </View>
      </Pressable>
    );
  };

  const onTilePress = (newItem: any) => {
    setSelectedHomeServices((prevItems: any) => {
      // Check if the new item's ServiceCode already exists in the state
      const itemIndex = prevItems.findIndex(
        (item: any) => item?.ServiceCode === newItem?.ServiceCode
      );

      if (itemIndex !== -1) {
        // If it exists, remove the item from the array
        return prevItems?.filter(
          (item: any) => item?.ServiceCode !== newItem?.ServiceCode
        );
      } else {
        // If it doesn't exist, add the new item to the array
        return [...prevItems, newItem];
      }
    });
  };

  const onPerss = () => {
    if (selectedHomeServices?.length > 0) {
      router.push({
        pathname: "/(app)/screens/service/RequestPickup",
        params: { stepId: 1 },
      });
    } else {
      showToast(t("static_messages.select_services"));
    }
  };

  return (
    <>
      {data?.length > 0 ? (
        <FlatList
          style={{
            paddingVertical: 20,
          }}
          data={data}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          renderItem={isCheckoutEnabled ? renderItemForCheckout : renderItem}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            gap: 15,
          }}
        />
      ) : (
        <View className="items-center mt-12 min-h-28 px-5">
          {serviceMsg ? (
            <Text className="text-buttonColor font-semibold">{serviceMsg}</Text>
          ) : null}
        </View>
      )}
    </>
  );
};

export default Service;