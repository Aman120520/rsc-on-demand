import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import { useCart } from "../context/CartProvider";
import { colors } from "../styles/theme";
import { useTranslation } from "react-i18next";

interface CounterProps {
  item: any;
  selectedServiceTab?: string;
  filter?: string;
}

const Counter = ({ item, selectedServiceTab, filter }: CounterProps) => {
  // context API
  const { serviceItems, setServiceItems }: any = useCart();
  const { t } = useTranslation();

  // useState
  const [count, setCount] = useState(0);

  // useEffects
  // It will update the counter automatically based on the data in the state.
  useEffect(() => {
    if (serviceItems && serviceItems?.length > 0) {
      let newCount = 0;

      serviceItems.forEach((serviceItem: any) => {
        if (serviceItem.processCode === item?.serviceCode) {
          // Find the item in garmentDetails that matches the selected item's ID and service name
          const foundItem = serviceItem.garmentDetails.find(
            (garment: any) =>
              garment.id === item?.id &&
              garment.serviceName === item?.serviceName
          );

          if (foundItem) {
            // If the item is found, set the count to its quantity
            newCount = foundItem.quantity;
          }
        }
      });

      setCount(newCount);
    } else {
      setCount(0);
    }
  }, [count, filter, selectedServiceTab, serviceItems]);

  // Functions
  const addItems = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount((prevState) => prevState + 1);

    if (serviceItems === null) {
      // Initially create new service with item
      await setServiceItems([
        {
          processCode: item?.serviceCode,
          serviceName: item?.serviceName,
          isLaundryService: item?.unit?.toLowerCase() === "kg" ? true : false,
          garmentDetails: [
            {
              id: item?.id,
              name: item?.garment,
              price: item?.price,
              quantity: count + 1,
              unit: item?.unit,
              serviceName: item?.serviceName,
              serviceCode: item?.serviceCode,
            },
          ],
        },
      ]);
    } else {
      const newItem = {
        id: item?.id,
        name: item?.garment,
        price: item?.price,
        quantity: count + 1,
        unit: item?.unit,
        serviceName: item?.serviceName,
        serviceCode: item?.serviceCode,
      };

      let updatedServiceItems = [...serviceItems];
      let itemAdded = false;

      updatedServiceItems = updatedServiceItems.map((serviceItem: any) => {
        if (serviceItem.processCode === newItem.serviceCode) {
          // Existing processCode matches item's serviceCode
          const updatedGarmentDetails = [...serviceItem.garmentDetails];

          const existingItemIndex = updatedGarmentDetails.findIndex(
            (detail) => detail.id === newItem.id
          );

          if (existingItemIndex !== -1) {
            // If item exists, increment its quantity by one
            updatedGarmentDetails[existingItemIndex].quantity += 1;
            itemAdded = true;
          } else {
            // If item doesn't exist, add it with quantity one
            updatedGarmentDetails.push({ ...newItem });
            itemAdded = true;
          }

          return { ...serviceItem, garmentDetails: updatedGarmentDetails };
        }
        return serviceItem;
      });

      if (!itemAdded) {
        // If no matching processCode was found, create a new service in the top array with it's item
        const newServiceItem = {
          processCode: newItem.serviceCode,
          serviceName: newItem?.serviceName,
          isLaundryService: item?.unit?.toLowerCase() === "kg" ? true : false,
          garmentDetails: [{ ...newItem }],
        };
        updatedServiceItems.push(newServiceItem);
      }

      setServiceItems(updatedServiceItems);
    }
  };

  const removeItems = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount((prevState) => prevState - 1);

    const updatedServiceItems = serviceItems.map((serviceItem: any) => {
      if (serviceItem.processCode === item?.serviceCode) {
        const updatedGarmentDetails = serviceItem.garmentDetails
          .map((garmentDetail: any) => {
            if (garmentDetail.id === item?.id) {
              // Decrement quantity by one
              const updatedQuantity = garmentDetail.quantity - 1;

              if (updatedQuantity > 0) {
                // If updated quantity > 0, update the quantity
                return { ...garmentDetail, quantity: updatedQuantity };
              } else {
                // If updated quantity is 0 or less, remove the item from the array
                return null;
              }
            }
            return garmentDetail;
          })
          .filter(Boolean);

        if (updatedGarmentDetails.length === 0) {
          // If the garmentDetails array is empty, remove the serviceItem
          return null;
        }

        return { ...serviceItem, garmentDetails: updatedGarmentDetails };
      }

      return serviceItem;
    });

    const filteredServiceItems = updatedServiceItems.filter(Boolean); // Remove null values

    setServiceItems(filteredServiceItems);
  };

  return (
    <View className="flex flex-row items-center justify-between">
      {count > 0 ? (
        <>
          <TouchableOpacity
            onPress={removeItems}
            className="w-7 h-7 rounded-full items-center justify-center bg-defaultWhite border border-buttonColor mr-4"
          >
            <Text className="text-[14px] font-semibold text-center color-buttonColor">
              -
            </Text>
          </TouchableOpacity>
          <Text className="text-[14px] font-semibold text-center color-buttonColor min-w-5">
            {count}
          </Text>
          <TouchableOpacity
            onPress={addItems}
            className="w-7 h-7 rounded-full items-center justify-center bg-defaultWhite  border border-buttonColor ml-4"
          >
            <Text className="text-[14px] font-semibold text-center color-buttonColor">
              +
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={addItems}
          className=" h-8 px-3 rounded-full border items-center justify-center border-buttonColor"
        >
          <Text
            className="text-[14px] font-semibold color-buttonColor"
            style={[{ lineHeight: 24 }]}
          >
            {t("common.add")} +
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Counter;
