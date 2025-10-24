import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import CommonLoading from "../CommonLoading";
import { useTranslation } from "react-i18next";

interface CouponModalProps {
  open: boolean;
  setOpen: Function;
  code: string | null;
  setCode: Function;
  couponError: any;
  couponRes: any;
  setCouponRes: Function;
  couponModalOnPress: () => void;
  couponLoading: boolean;
  setCouponError: Function;
}

const CouponModal = ({
  open,
  setOpen,
  code,
  setCode,
  couponError,
  couponRes,
  setCouponRes,
  couponModalOnPress,
  couponLoading,
  setCouponError,
}: CouponModalProps) => {
  const { t } = useTranslation();
  return (
    <ReactNativeModal
      backdropColor={colors.defaultBlack}
      isVisible={open}
      className="items-center justify-center"
    >
      <View style={styles.container}>
        <View className="flex-row items-center justify-between">
          <Text className="text-md font-semibold">Apply Coupon</Text>
          <Pressable onPress={() => setOpen(!open)}>
            <Icon name="close" />
          </Pressable>
        </View>

        <TextInput
          className="h-14 mt-3.5 border border-[#EBEBEB] p-4 rounded-sm"
          placeholder={t("checkout.enter_coupon_code")}
          value={code ? code : ""}
          onChangeText={(value: any) => {
            setCouponError(null);
            setCode(value);
          }}
          placeholderTextColor={"#D4D4D4"}
        />

        {couponError ? (
          <Text className="text-sm mt-1 color-red-500">{couponError}</Text>
        ) : (
          <View style={{ height: 20 }}></View>
        )}

        <View>
          {!couponLoading ? (
            <View className="items-center">
              <Pressable
                onPress={couponModalOnPress}
                className="mt-4 bg-buttonColor px-20 py-4 rounded-full items-center justify-center"
              >
                <Text className="text-md font-bold color-defaultWhite">
                  {t("auth.submit")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <CommonLoading />
          )}
        </View>
      </View>
    </ReactNativeModal>
  );
};
export default CouponModal;

const styles = StyleSheet.create({
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: 360,
    height: 230,
    borderRadius: 10,
    backgroundColor: colors.defaultWhite,
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
});
