import Header from "@/src/components/Header";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useStore } from "@/src/context/StoreProvider";
import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { router, useLocalSearchParams } from "expo-router";
import moment from "moment";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const PaymentSuccessful = () => {
  const { t } = useTranslation();
  const { amount, currencyCode, transactionId }: any = useLocalSearchParams();
  const { appConfig } = useAppConfig();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(app)/(tabs)/home");
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <Header />
      <View className="flex-1 bg-defaultBackgroundColor items-center justify-center">
        <Icon name="success" color={colors.primaryColor} />
        <Text className="text-xl my-4 font-bold">
          {t("payment.payment_successful")}
        </Text>
        <Text className="text-md my-4 font-semibold">
          {" "}
          {t("payment.your_payment_of")}{" "}
          {formatCurrency(amount ?? 0, currencyCode, amount % 1 !== 0 ? 2 : 0)}{" "}
          {t("payment.is_successful")}
        </Text>
        <Text className="text-md font-bold my-4 text-center">
          {" "}
          {t("payment.transition_id")} {transactionId?.toUpperCase()}
        </Text>
        <Text className="text-md my-4 font-semibold">
          {" "}
          {t("payment.date")} {moment().format("DD MMM YYYY")}
        </Text>
      </View>
    </SafeAreaView>
  );
};
export default PaymentSuccessful;
