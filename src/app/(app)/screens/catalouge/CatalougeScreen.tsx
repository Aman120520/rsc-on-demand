import { StyleSheet, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams } from "expo-router";

import { useIsFocused } from "@react-navigation/native";
import { useUser } from "@/src/context/UserProvider";
import { useStore } from "@/src/context/StoreProvider";
import defaultClient from "@/src/lib/qdc-api";
import { LOCAL_DATA } from "@/src/utils/data";
import { colors } from "@/src/styles/theme";
import Header from "@/src/components/Header";
import { CONSTANTS } from "@/src/utils/constants";
import PageTitle from "@/src/components/checkout/PageTile";
import ServicesTab from "./ServicesTab";
import ServicesPoster from "./ServicesPoster";
import ServiceItemsFilter from "./ServiceItemsFilter";
import ServicePriceList from "./ServicePriceList";
import ServiceCheckout from "./ServiceCheckout";
import { useCart } from "@/src/context/CartProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

const CatalogueScreen = () => {
  const isFocused = useIsFocused();

  // params
  const {
    tab = "Dry Cleaning",
    index,
    serviceCode,
  }: any = useGlobalSearchParams();
  const { t } = useTranslation();

  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const { clientId, branchId } = useUser();
  const { serviceItems }: any = useCart();
  const { packagesData } = useStore();

  // useState
  const [selectedServiceTab, setSelectedServiceTab] = useState(tab);
  const [selectedServiceCode, setSelectedServiceCode] = useState("DC");
  const [filterData, setFilterData] = useState<any>([]);
  const [filter, setFilter] = useState("");
  const [serviceListData, setServiceListData] = useState([]);
  const [servicePricelistData, setServicePricelistData] = useState<any>([]);
  const [priceListData, setPriceListData] = useState<any>([]);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [suggestedPackages, setSuggestedPackages] = useState<any>([]);
  const [showMore, setShowMore] = useState(false);

  // useEFFects
  useEffect(() => {
    if (clientId && branchId) {
      defaultClient
        .serviceAndGarmentsPriceDetailsData(clientId, branchId)
        .then(async (res: any) => {
          // console.log("NEW SERVICE PRICE LIST DATA", JSON.stringify(res));

          let newArr: any = [];

          await res?.PerPeiceServce?.map((item: any) => {
            newArr.push(item);
          });

          await res?.PerWeightBase?.map((item: any) => {
            newArr.push(item);
          });

          setServicePricelistData(res);
          setServiceListData(newArr);
        })
        .catch((err) => console.log(err));
    }
  }, [clientId, branchId, isFocused]);

  useEffect(() => {
    if (tab) setSelectedServiceTab(tab);
  }, [tab]);

  useEffect(() => {
    LOCAL_DATA?.localServiceData?.map((item: any) => {
      if (item?.serviceCode === serviceCode?.toUpperCase()) {
        setSelectedServiceTab(item?.title);
      }
    });
  }, [serviceCode]);

  useEffect(() => {
    if (serviceItems && serviceItems?.length > 0) {
      setShowCheckout(true);
    } else {
      setShowCheckout(false);
    }
  }, [serviceItems]);

  useEffect(() => {
    const getData = async () => {
      if (servicePricelistData && selectedServiceTab) {
        await servicePricelistData?.PerPeiceServce?.map((service: any) => {
          if (
            service.ServiceName === selectedServiceTab &&
            service?.GarmentPriceDetails?.length > 0
          ) {
            let updatedService: any = [];
            service?.GarmentPriceDetails?.map((item: any, index: any) => {
              updatedService.push({
                id: item?.ItemID,
                category: item?.Category,
                garmentName: item?.GarmentName,
                garmentPrice: item?.Price,
                unitType: item?.Unit,
                serviceName: service.ServiceName,
                serviceCode: service?.ServiceCode,
                serviceDescription: service?.ServiceDescription,
              });
            });

            return setPriceListData(updatedService);
          } else {
            servicePricelistData?.PerWeightBase?.map((service: any) => {
              if (service?.ServiceName === selectedServiceTab) {
                let updatedService: any = [];
                updatedService.push({
                  serviceName: service.ServiceName,
                  serviceCode: service?.ServiceCode,
                  unitType: service?.Unit,
                  garmentPrice: service?.Price,
                  serviceDescription: service?.ServiceDescription,
                });

                return setPriceListData(updatedService);
              }
            });
          }
        });
      }
    };

    getData();
  }, [servicePricelistData, selectedServiceTab]);

  useEffect(() => {
    if (priceListData && priceListData?.length > 0) {
      let newArr: any = [];
      priceListData?.map((item: any, index: any) => {
        if (item?.category) {
          newArr.push({
            id: item?.id,
            label: item?.category,
          });

          const uniqueLabels: any = {};

          newArr.forEach((item: any, index: any) => {
            if (!uniqueLabels.hasOwnProperty(item.label)) {
              uniqueLabels[item.label] = index;
            }
          });

          const uniqueItems = Object.keys(uniqueLabels).map(
            (label: any, index: any) => {
              return {
                id: index,
                label: label,
                startingIndex: uniqueLabels[label],
              };
            }
          );

          setFilterData(uniqueItems);
        } else {
          setFilterData([]);
        }
      });
    } else {
      setFilterData([]);
    }
  }, [servicePricelistData, priceListData]);

  useEffect(() => {
    const getData = async () => {
      if (packagesData && packagesData?.length > 0) {
        let newArr: any = [];

        await packagesData?.map((data: any) => {
          if (data?.IsAllService === "False") {
            data?.ServiceList?.map((service: any) => {
              if (service?.ServiceName === selectedServiceTab) {
                newArr.push(data);
              }
            });
          }

          return newArr;
        });

        await packagesData?.map((data: any) => {
          if (data?.IsAllService === "True") {
            newArr.push(data);
          }

          return newArr;
        });

        return setSuggestedPackages(newArr);
      }
    };
    getData();
  }, [packagesData, selectedServiceTab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.defaultWhite }}>
      <Header />

      <PageTitle title={t("checkout.services")} />

      <ServicesTab
        data={serviceListData}
        selectedTab={selectedServiceTab}
        setSelectedTab={setSelectedServiceTab}
        setSelectedServiceCode={setSelectedServiceCode}
        initialIndex={index}
        setShowMore={setShowMore}
      />

      <View>
        <ServicesPoster
          tab={selectedServiceTab}
          selectedServiceCode={selectedServiceCode}
          priceListData={priceListData}
          showMore={showMore}
        />

        <ServiceItemsFilter
          data={filterData}
          serviceFitler={filter}
          setServiceFilter={setFilter}
        />

        <ServicePriceList
          data={priceListData}
          title={t("pricelist.title")}
          filter={filter}
          selectedServiceTab={selectedServiceTab}
          suggestedPackages={suggestedPackages}
        />
      </View>

      {showCheckout && appConfig?.enableCheckout && <ServiceCheckout />}
    </SafeAreaView>
  );
};

export default memo(CatalogueScreen);

const styles = StyleSheet.create({});
