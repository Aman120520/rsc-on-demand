import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

const ValidationModal = ({
  open,
  setOpen,
  onClick,
  amount,
}: {
  open: boolean;
  setOpen: Function;
  onClick: () => void;
  amount: number;
}) => {
  const { t } = useTranslation();
  return (
    <ReactNativeModal
      backdropColor={colors.defaultBlack}
      isVisible={open}
      className="items-center justify-center"
    >
      <View style={styles.container}>
        <View className="flex-row items-center justify-between">
          <Text className="text-md font-semibold">
            {t("checkout.minimum_order_amount_required_title")}
          </Text>
          <Pressable onPress={() => setOpen(!open)}>
            <Icon name="close" />
          </Pressable>
        </View>

        <View className="my-5">
          <Text className="text-md text-gray-800">
            {`${t("checkout.order_total_must_be")} ${amount} ${t(
              "checkout.to_proceed_add_more_items"
            )}`}
          </Text>
        </View>

        <View className="items-center justify-center mt-10">
          <Pressable
            onPress={() => setOpen(false)}
            className="bg-buttonColor py-3 px-3 rounded-full w-1/2"
          >
            <Text className="text-center text-white font-semibold">
              {t("common.ok")}
            </Text>
          </Pressable>
        </View>
      </View>
    </ReactNativeModal>
  );
};

export default ValidationModal;

const styles = StyleSheet.create({
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: 365,
    minHeight: 180,
    borderRadius: 10,
    backgroundColor: colors.defaultWhite,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
});
