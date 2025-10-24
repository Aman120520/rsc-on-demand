import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import { useTranslation } from "react-i18next";

const ValidationModal = ({
  open,
  setOpen,
  onContinue,
  message,
}: {
  open: boolean;
  setOpen: Function;
  onContinue: () => void;
  message: string;
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
            {t("schedule.minimum_order_value")}
          </Text>
          <Pressable onPress={() => setOpen(!open)}>
            <Icon name="close" />
          </Pressable>
        </View>

        <View className="my-5">
          <Text className="text-md text-gray-800">{message}</Text>
        </View>

        <View className="flex items-center justify-between ">
          <Pressable
            onPress={() => setOpen(false)}
            className="bg-white border-gray-500 border py-3 px-3 rounded-full"
          >
            <Text className="text-center text-gray-500 font-semibold px-1">
              {t("schedule.no_review")}
            </Text>
          </Pressable>
          <Pressable
            onPress={onContinue}
            className="bg-buttonColor py-3 px-3 mt-3 rounded-full"
          >
            <Text className="text-center text-white font-semibold px-1">
              {t("schedule.yes_continue")}
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
    width: "100%",
    minHeight: 250,
    borderRadius: 10,
    backgroundColor: colors.defaultWhite,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
});
