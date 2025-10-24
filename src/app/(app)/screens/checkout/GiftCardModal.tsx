import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "@/src/styles/colors";
import { STYLES } from "@/src/styles/common";
import { TEXT_STYLE } from "@/src/styles/typography";
import { SvgXml } from "react-native-svg";
import { CLOSE_SMALL } from "@/src/icons/svg";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { colors } from "@/src/styles/theme";
import config from "@/config";
import { useUser } from "@/src/context/UserProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

interface GiftCardScreenProps {
  setOpen: Function;
  giftCardCode: string | null;
  setGiftCardCode: Function;
  couponError: any;
  couponRes: any;
  setCouponRes: Function;
  couponModalOnPress: (value: string) => void;
  couponLoading: boolean;
  setCouponError: Function;
  cartTotal: number;
}

const GiftCardScreen = ({
  setOpen,
  giftCardCode,
  setGiftCardCode,
  couponError,
  couponRes,
  setCouponRes,
  couponModalOnPress,
  couponLoading,
  setCouponError,
  cartTotal,
}: GiftCardScreenProps) => {
  const { appConfig } = useAppConfig();
  const { user, clientId, branchId, customerCode } = useUser();

  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [couponList, setCouponList] = useState<any>([]);

  useEffect(() => {
    getCouponsList({ orderAmount: cartTotal });
  }, []);

  const getCouponsList = async ({
    orderAmount,
  }: {
    orderAmount: number | string;
  }) => {
    if (orderAmount && customerCode !== null) {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_COUPONS_API_URL}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Org-Id":
                appConfig?.organizationId?.toString() ??
                config.OrganizationId.toString(),
              "accept-language": i18n.language.toString(),
            },
            body: JSON.stringify({
              operationName: "AvailableCouponsForUser",
              variables: {
                orderAmount: Number(orderAmount),
                userId: customerCode,
              },
              query:
                "query AvailableCouponsForUser($orderAmount: Float!, $userId: String!) {\n  availableCouponsForUser(userId: $userId, orderAmount: $orderAmount) {\n    id\n    code\n    title\n    discount\n    description\n  }\n}",
            }),
          }
        );
        const json = await response.json();

        if (json?.data !== null) {
          setCouponList(json?.data);
        }
      } catch (error) {
        console.error(JSON.stringify(error));
      }
    }
  };

  const renderItem = ({ item }: any) => (
    <Pressable
      onPress={() => {
        setGiftCardCode(item.code);
        couponModalOnPress(item.code);
      }}
      className="min-h-20 w-full bg-gray-100 rounded-md p-3 my-3"
    >
      <Text className="my-1 text-md text-buttonColor font-semibold">
        {item.title}
      </Text>
      <Text className="my-1 text-medium text-primaryTextColor">{`Save ${item.discount} with this code`}</Text>
      <Text className="my-1 text-buttonColor font-bold uppercase">
        {item.code}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[STYLES.flexRowAcSb, styles.header]}>
        <Text className="text-primary text-lg font-medium">Apply Coupon</Text>
        <Pressable onPress={() => setOpen(false)}>
          <SvgXml xml={CLOSE_SMALL} height={15} width={15} />
        </Pressable>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t("checkout.enter_coupon_code")}
          value={giftCardCode || ""}
          onChangeText={(value) => {
            setCouponError(null);
            setGiftCardCode(value);
          }}
          placeholderTextColor={"#D4D4D4"}
        />
        <Text
          onPress={() => couponModalOnPress(giftCardCode ?? "")}
          disabled={!giftCardCode}
          className="uppercase font-medium text-medium text-buttonColor py-3.5"
          style={{ color: giftCardCode ? "" : colors.defaultBackgroundColor }}
        >
          {t("common.apply")}
        </Text>
      </View>

      {couponError ? (
        <Text className="my-3" style={[TEXT_STYLE.TEXT_12_SB, styles.error]}>
          {couponError}
        </Text>
      ) : (
        <View style={{ height: 20 }}></View>
      )}

      <Text className="text-primary text-md font-medium">
        {t("common.payment_coupons")}
      </Text>

      <FlatList
        data={couponList?.availableCouponsForUser ?? []}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text className="text-black text-md font-medium mb-2">
            {t("common.no_available_coupons")}
          </Text>
        )}
      />
    </View>
  );
};

export default GiftCardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE.d0,
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.GRAY.d8,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  error: {
    color: COLORS.RED.d0,
  },
});
