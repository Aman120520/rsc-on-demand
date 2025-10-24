import Header from "@/src/components/Header";
import { colors } from "@/src/styles/theme";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";
import { useEffect, useState } from "react";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import icons from "@/src/icons/icons";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import TabBarCustom from "@/src/custom/TabBarCustom";
import Divider from "@/src/components/Divider";
import { useIsFocused } from "@react-navigation/native";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import config from "@/config";
import { useStore } from "@/src/context/StoreProvider";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

const PriceList = () => {
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  // context API
  const { appConfig } = useAppConfig();
  const { clientId, branchId, customerCode, user, isValidUser, fcmToken } =
    useUser();
  const { storeDetails } = useStore();

  // useState
  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState<any>("Dry Cleaning");

  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<any>([]);
  const [serviceListData, setServiceListData] = useState<any>([]);
  const [servicePricelistData, setServicePricelistData] = useState<any>([]);
  const [currentServiceList, setCurrentServiceList] = useState<any>([]);
  const [isLaundryService, setIsLaundryService] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const { t, i18n } = useTranslation();

  const [data, setData] = useState<any>();
  const [listData, setListData] = useState<any>([]);
  const [searchData, setSearchData] = useState<any>([]);
  const [layoutReady, setLayoutReady] = useState(false);

  // RTL detection
  const isRTL = I18nManager.isRTL;

  // Function to translate service names
  const translateServiceName = (serviceName: string) => {
    if (!serviceName) return serviceName;

    const currentLanguage = i18n?.language || "en";

    const serviceTranslations: {
      [key: string]: { [language: string]: string };
    } = {
      "Premium Dry Cleaning": {
        en: "Premium Dry Cleaning",
        ar: "تنظيف جاف مميز",
        fr: "Nettoyage à sec premium",
        hi: "प्रीमियम ड्राई क्लीनिंग",
      },
      "Premium Laundry": {
        en: "Premium Laundry",
        ar: "غسيل مميز",
        fr: "Blanchisserie premium",
        hi: "प्रीमियम लॉन्ड्री",
      },
      "Steam Press Only": {
        en: "Steam Press Only",
        ar: "كبس بالبخار فقط",
        fr: "Repassage à la vapeur uniquement",
        hi: "स्टीम प्रेस ओनली",
      },
      "Dry Cleaning": {
        en: "Dry Cleaning",
        ar: "تنظيف جاف",
        fr: "Nettoyage à sec",
        hi: "ड्राई क्लीनिंग",
      },
      "Laundry Service": {
        en: "Laundry Service",
        ar: "خدمة الغسيل",
        fr: "Service de blanchisserie",
        hi: "धोबी सेवा",
      },
    };

    const translations = serviceTranslations[serviceName];
    if (translations && translations[currentLanguage]) {
      return translations[currentLanguage];
    }

    // Fallback to original service name if no translation found
    return serviceName;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLayoutReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient.getPriceList(clientId, branchId).then(async (res: any) => {
        // console.log("SERVICE PRICE LIST", JSON.stringify(res));

        let newArr: any = [];
        let newServicesArr: any = [];

        await res?.PerPeiceServce?.map((item: any) => {
          newArr.push(item);
        });

        await res?.PerWeightBase?.map((item: any) => {
          newArr.push(item);
        });

        if (res) {
          await res?.PerPeiceServce?.map((item: any) => {
            newServicesArr.push({
              label: translateServiceName(item?.ServiceName),
              value: item?.ServiceName,
            });
          });

          if (res?.PerWeightBase?.length > 0) {
            newServicesArr.push({
              label: translateServiceName("Laundry Service"),
              value: "Laundry Service",
            });
          }
        }

        setCurrentService(
          res?.PerPeiceServce?.[0]?.ServiceName ??
            res?.PerWeightBase?.[0]?.ServiceName ??
            ""
        );
        setServices(newServicesArr);
        setServicePricelistData(res);
        setServiceListData(newArr);
      });
    }
  }, [isFocused]);

  useEffect(() => {
    if (currentService === "Laundry Service") {
      setIsLaundryService(true);
    } else {
      setIsLaundryService(false);
    }

    if (serviceListData && currentService) {
      serviceListData?.map((service: any) => {
        if (service?.ServiceName === currentService) {
          const garmentData = service?.GarmentPriceDetails;
          // console.log(JSON.stringify(garmentData));

          const categories = [
            ...new Set(
              garmentData?.map((item: any) => item?.Garment?.split(" - ")[0])
            ),
          ];

          if (searchEnabled) {
            let filteredData = Object.keys(searchData);
            setRoutes(
              filteredData?.map((category: any) => ({
                key: category?.toLowerCase(),
                title: category,
              }))
            );
          } else {
            setRoutes(
              categories?.map((category: any) => ({
                key: category?.toLowerCase(),
                title: category,
              }))
            );
          }

          setData(
            categories?.reduce((acc: any, category: any) => {
              acc[category?.toLowerCase()] = garmentData?.filter((item: any) =>
                item?.Garment?.startsWith(category)
              );

              return acc;
            }, {})
          );

          setCurrentServiceList(
            categories?.reduce((acc: any, category: any) => {
              acc[category?.toLowerCase()] = garmentData?.filter((item: any) =>
                item?.Garment?.startsWith(category)
              );

              return acc;
            }, {})
          );
        }
      });
    }
  }, [
    currentService,
    serviceListData,
    isLaundryService,
    searchEnabled,
    searchData,
    isFocused,
  ]);

  useEffect(() => {
    if (isLaundryService) {
      const data = servicePricelistData?.PerWeightBase?.flatMap((item: any) =>
        Object?.keys(item)?.map((key) => ({
          title: key,
          value: item[key],
        }))
      );
      setListData(data);
    }
  }, [isLaundryService]);

  useEffect(() => {
    if (query === "") {
      setSearchEnabled(false);
      setSearchData([]);
    }
  }, [query]);

  const handleService = (value: any) => {
    setCurrentService(value);
  };

  const handleSearch = (value: any) => {
    if (query !== "") {
      const result = searchGarments(value, currentServiceList);
      if (result) {
        setSearchData(result);
        setSearchEnabled(true);
      }
    }
  };

  const searchGarments = (searchString: any, data: any) => {
    const result: any = {};
    const searchWords = searchString.toLowerCase().split(" ");

    Object.keys(data).forEach((category) => {
      const filteredItems = data[category].filter((item: any) => {
        const garmentLower = item.Garment.toLowerCase();
        return searchWords.some((word: any) => garmentLower.includes(word));
      });

      if (filteredItems.length > 0) {
        result[category] = filteredItems;
      }
    });

    return result;
  };

  const CustomTabView = () => {
    return (
      <View className="bg-primary px-5 py-2">
        <Text></Text>
      </View>
    );
  };

  const renderTabBar = (props: object) => (
    <TabBarCustom index={index} setIndex={setIndex} {...props} />
  );

  const renderScene = ({ route }: any) => {
    const currentData = searchEnabled ? searchData : data;
    const categoryData = currentData?.[route.key] ?? [];

    return <CategoryList category={route.title} data={categoryData} />;
  };

  const CategoryList = ({ category, data }: any) => {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item?.Garment}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
      />
    );
  };

  const renderItem = ({ item }: any) => {
    return (
      <View className="flex-row items-center justify-between my-6 mx-5">
        <Text className="text-md font-semibold">
          {item.Garment?.split(" - ")[1]}
        </Text>
        <Text className="text-md color-defaultTextColour">
          {formatCurrency(
            parseFloat(item.Price)?.toFixed(2) ?? 0,
            storeDetails?.Currency ?? config.currency,
            item.Price % 1 !== 0 ? 2 : 0
          )}
        </Text>
      </View>
    );
  };

  const listRenderItem = ({ item }: any) => {
    return (
      <View className="flex-row items-center justify-between my-6 mx-5">
        <Text className="text-md font-semibold">{item?.title}</Text>
        <Text className="text-sm color-defaultTextColour">
          {formatCurrency(
            parseFloat(item.value).toFixed(2) ?? 0,
            storeDetails?.Currency ?? config.currency,
            item.value % 1 !== 0 ? 2 : 0
          )}
          Per KG
        </Text>
      </View>
    );
  };

  if (!layoutReady) return null;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <Header />

      <View className="bg-primary px-4 py-4">
        <RNPickerSelect
          onValueChange={(value) => handleService(value)}
          items={services}
          style={{
            inputAndroidContainer: {
              ...styles.pickerInputContainer,
              ...(isRTL && styles.rtlPickerContainer),
            },
            inputAndroid: {
              color: colors.primaryTextColor,
              textAlign: isRTL ? "right" : "left",
            },
            inputIOSContainer: {
              ...styles.pickerInputContainer,
              ...(isRTL && styles.rtlPickerContainer),
            },
            inputIOS: {
              color: colors.primaryTextColor,
              textAlign: isRTL ? "right" : "left",
            },
            iconContainer: {
              paddingHorizontal: 16,
              ...(isRTL && styles.rtlIconContainer),
            },
            placeholder: {
              color: colors.primaryTextColor,
              textAlign: isRTL ? "right" : "left",
            },
          }}
          value={currentService}
          placeholder={{
            label: t("home.select_service"),
            value: null,
          }}
          useNativeAndroidPickerStyle={false}
          Icon={() => icons.chevron(colors.primaryTextColor)}
        />

        <View className="flex-row items-center mt-3 mb-2  px-4 bg-defaultWhite rounded">
          {icons.search(colors.primaryTextColor)}
          <TextInput
            value={query}
            onChangeText={(value: any) => setQuery(value)}
            returnKeyType="search"
            placeholder={t("common.search")}
            className="ml-4 py-5 w-10/12"
            onSubmitEditing={({ nativeEvent: { text } }) => handleSearch(text)}
          />
        </View>
      </View>

      <View className="flex-1 bg-defaultWhite">
        {!isLaundryService ? (
          <>
            {routes.length > 0 && Object.keys(data || {}).length > 0 && (
              <TabView
                key={currentService}
                lazy
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width }}
                renderTabBar={(props) => (
                  <TabBar
                    {...props}
                    scrollEnabled
                    tabStyle={{ width: Dimensions.get("window").width / 2 }}
                    labelStyle={{ fontWeight: "600" }}
                    style={{
                      backgroundColor:
                        appConfig?.theme?.primaryColor ?? colors.primaryColor,
                    }}
                    indicatorStyle={{
                      backgroundColor:
                        appConfig?.theme?.buttonColor ?? colors.buttonColor,
                    }}
                  />
                )}
              />
            )}
          </>
        ) : (
          <FlatList
            data={listData}
            renderItem={listRenderItem}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
export default PriceList;
const styles = StyleSheet.create({
  inputBox: {
    flex: 1,
    height: 56,
  },
  pickerInputContainer: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.defaultWhite,
    borderRadius: 4,
  },
  rtlPickerContainer: {
    flexDirection: "row-reverse",
  },
  rtlIconContainer: {
    left: 0,
    top: 15,
    right: "auto",
  },
});
