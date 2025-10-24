import config from "@/config";
import CommonBorder from "@/src/components/CommonBorder";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import i18n from "@/src/i18n";
import { COLORS } from "@/src/styles/colors";
import { STYLES } from "@/src/styles/common";
import { colors } from "@/src/styles/theme";
import { TEXT_STYLE } from "@/src/styles/typography";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

interface GiftCardModalProps {
  open: boolean;
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
  setStep: Function;
}

const CouponScreen = ({
  open,
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
  setStep,
}: GiftCardModalProps) => {
  const { appConfig } = useAppConfig();
  const { branchId, customerCode } = useUser();
  const { storeDetails } = useStore();
  const { t } = useTranslation();

  const [couponList, setCouponList] = useState<any>([]);

  useEffect(() => {
    if (cartTotal) {
      getCouponsList({ orderAmount: cartTotal });
    }
  }, [cartTotal]);

  const getCouponsList = async ({
    orderAmount,
  }: {
    orderAmount: number | string;
  }) => {
    // console.log({ couponCode, orderAmount, customerCode });

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
                locationId: branchId,
              },
              query:
                "query AvailableCouponsForUser(\n  $locationId: BigInt\n  $orderAmount: Float!\n  $userId: String!\n) {\n  availableCouponsForUser(\n    locationId: $locationId\n    orderAmount: $orderAmount\n    userId: $userId\n  ) {\n    id\n    code\n    title\n    validFrom\n    type\n    value\n  enableAutoApply\n    maxRedemptions\n    maxRedemptionsPerUser\n    description\n    discount\n    minOrderAmount\n    onlyForNewUsers\n  }\n}",
            }),
          }
        );
        const json = await response.json();

        const res = json;
        console.log("Available Coupons For User", JSON.stringify(res));

        if (res && res?.data !== null) {
          setCouponList(res?.data);
        } else {
          // showToast(res?.errors[0]?.message);
          // console.log("ERROR MSG", res?.errors[0]?.message);
        }
      } catch (error) {
        console.error(JSON.stringify(error));
      }
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        onPress={() => {
          setGiftCardCode(item.code);
          couponModalOnPress(item.code);
          setStep(1);
        }}
        className="w-full bg-white rounded-3xl my-3 flex-row"
      >
        {/* First view (Vertical text area) */}
        <View className="w-16 bg-primary rounded-l-3xl flex items-center justify-center">
          <Text className="-rotate-90 text-base font-bold text-white text-nowrap w-28 text-center">
            {item.type === "PERCENTAGE"
              ? `${item.value}% ${t("common.off")}`
              : item.type === "FIXED"
              ? t("common.flat_off")
              : ""}
          </Text>
        </View>

        {/* Second view (Content container) */}
        <View className="flex-1 p-5 overflow-hidden">
          <View className="flex flex-row items-center justify-between">
            <Text
              numberOfLines={2}
              className="my-1 text-base text-gray-800 font-bold uppercase max-w-56 break-all"
            >
              {item.code}
            </Text>
            <Text className="uppercase font-semibold text-primary p-2">
              {t("common.apply")}
            </Text>
          </View>

          <Text className="my-1 text-sm font-medium text-green-400">
            {`${t("common.save")} ${formatCurrency(
              item.discount ?? 0,
              storeDetails?.Currency,
              item.discount % 1 !== 0 ? 2 : 0
            )} ${t("common.on_this_code")}`}
          </Text>

          <CommonBorder mt={10} color={colors.defaultBackgroundColor} />

          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-gray-800 my-1 capitalize"
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-gray-600 my-1"
          >
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#F0F0F5]">
      <View className="p-4 rounded-b-3xl bg-white" style={[STYLES.shadow]}>
        <View
          className="flex flex-row items-center justify-between rounded-lg"
          style={[styles.input]}
        >
          <TextInput
            // style={[TEXT_STYLE.TEXT_14_B, styles.input]}
            placeholder={t("checkout.enter_coupon_code")}
            value={giftCardCode ? giftCardCode : ""}
            onChangeText={(value: any) => {
              setCouponError(null);
              setGiftCardCode(value);
            }}
            placeholderTextColor={"#D4D4D4"}
            className="w-3/4 py-3"
          />

          <Text
            onPress={() => {
              couponModalOnPress(giftCardCode ?? "");
              // setStep(1);
            }}
            disabled={!giftCardCode}
            className="uppercase font-medium text-meidum py-3.5"
            style={{
              color: giftCardCode ? "" : colors.defaultBackgroundColor,
            }}
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
      </View>

      <View style={[STYLES.shadow, styles.container]}>
        <Text className="text-gray-800 text-md font-semibold mb-3">
          {t("common.available_coupons")}
        </Text>

        <View className="flex-1">
          {couponList && couponList?.availableCouponsForUser && (
            <FlatList
              data={couponList?.availableCouponsForUser ?? []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <Text className="text-gray-600 text-center mt-80 text-md font-medium mb-2">
                  {t("common.no_available_coupons")}
                </Text>
              )}
            />
          )}
        </View>

        {/* <View>
          {!couponLoading ? (
            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={couponModalOnPress}
                style={[
                  styles.btn,
                  {
                    backgroundColor:
                      appConfig?.theme?.buttonColor ?? colors.buttonColor,
                  },
                ]}
              >
                <Text
                  style={[TEXT_STYLE.TEXT_14_B, { color: COLORS.WHITE.d0 }]}
                >
                  Submit
                </Text>
              </Pressable>
            </View>
          ) : (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size={"large"}
              color={COLORS.PRIMARY.d0}
            />
          )}
        </View> */}
      </View>
    </View>
  );
};

export default CouponScreen;

const styles = StyleSheet.create({
  container: {
    // width: "95%",
    // height: "90%",
    flex: 1,
    // backgroundColor: COLORS.WHITE.d0,
    backgroundColor: "#F0F0F5",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  input: {
    // height: 52,
    borderWidth: 1,
    borderColor: COLORS.GRAY.d8,
    paddingHorizontal: 12,
    // paddingVertical: 12,
    color: COLORS.GREEN.d2,
  },
  btn: {
    marginTop: 23,
    backgroundColor: COLORS.PRIMARY.d0,
    width: 150,
    height: 42,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: COLORS.RED.d0,
  },
});
