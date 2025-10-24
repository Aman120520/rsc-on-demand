import config from "@/config";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

interface RedeemModalProps {
  open: boolean;
  setOpen: Function;
  data: any;
  referralCode?: string | null;
  onPress: () => void;
}

const RedeemModal = ({
  open,
  setOpen,
  data,
  referralCode,
  onPress,
}: RedeemModalProps) => {
  const { storeDetails } = useStore();
  const { appConfig } = useAppConfig();
  const { t } = useTranslation();
  return (
    <ReactNativeModal
      backdropColor={colors.defaultBlack}
      isVisible={open}
      className="items-center justify-center"
    >
      <View style={styles.container}>
        <View className="flex-row items-center justify-between">
          <Text className="text-md font-semibold text-black">
            {t("referral.redeem_points")}
          </Text>
          <Pressable onPress={() => setOpen(!open)}>
            <Icon name="close" />
          </Pressable>
        </View>

        <View className="flex-col items-stretch justify-between bg-defaultWhite py-3 mt-4">
          {/* Reward Earned */}
          <View className="flex flex-row items-center justify-between my-2">
            <Text className="text-md text-[#6A6A6A] mt-2 font-normal text-center">
              {t("referral.rewards_earned")}
            </Text>
            <Text className="text-lg font-semibold">
              {formatCurrency(
                data?.rewardEarned ?? 0,
                storeDetails?.Currency ?? config.currency,
                data?.rewardEarned % 1 !== 0 ? 2 : 0
              )}
            </Text>
          </View>

          <View className="w-[1px] bg-gray-300  mx-2" />

          {/* Reward Redeemed */}
          <View className="flex flex-row items-center justify-between my-2 mb-8">
            <Text className="text-md text-[#6A6A6A] mt-2 font-normal text-center">
              {t("referral.rewards_redeemed")}
            </Text>
            <Text className="text-lg font-semibold">
              -{" "}
              {formatCurrency(
                data?.rewardRedeemed ?? 0,
                storeDetails?.Currency ?? config.currency,
                data?.rewardRedeemed % 1 !== 0 ? 2 : 0
              )}
            </Text>
          </View>

          <View className="h-[1px] w-full bg-gray-300" />

          {/* Reward Balance */}
          <View className="flex flex-row items-center justify-between my-2">
            <Text className="text-md text-[#6A6A6A] mt-2 font-normal text-center">
              {t("referral.rewards_available")}
            </Text>
            <Text className="text-lg font-semibold">
              {formatCurrency(
                data?.rewardBalance ?? 0,
                storeDetails?.Currency ?? config.currency,
                data?.rewardBalance % 1 !== 0 ? 2 : 0
              )}
            </Text>
          </View>

          <View className="w-[1px] bg-gray-300 mx-2" />
        </View>

        <View className="flex items-center justify-center mt-16">
          {referralCode && data?.rewardBalance > 0 ? (
            <Pressable
              disabled={referralCode && data?.rewardBalance > 0 ? false : true}
              onPress={onPress}
              className={`py-4 w-1/2 rounded-full flex-row items-center justify-center ${
                referralCode && data?.rewardBalance > 0
                  ? "bg-buttonColor"
                  : "bg-buttonColor"
              }`}
              style={[
                referralCode && data?.rewardBalance > 0
                  ? {
                      backgroundColor: appConfig?.theme?.buttonColor,
                    }
                  : {
                      backgroundColor: appConfig?.theme?.buttonColor,
                      opacity: 0.3,
                    },
              ]}
            >
              <Text className="text-defaultWhite font-bold text-md mx-4">
                Redeem{" "}
                {formatCurrency(
                  data?.rewardBalance ?? 0,
                  storeDetails?.Currency ?? config.currency,
                  data?.rewardBalance % 1 !== 0 ? 2 : 0
                )}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </ReactNativeModal>
  );
};
export default RedeemModal;

const styles = StyleSheet.create({
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: 360,
    minHeight: 180,
    borderRadius: 10,
    backgroundColor: colors.defaultWhite,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
});
