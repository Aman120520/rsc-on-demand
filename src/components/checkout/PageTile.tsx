import { I18nManager, Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";

interface PageTitleProps {
  title: string;
  color?: string;
}

const PageTitle = ({ title, color }: PageTitleProps) => {
  const { appConfig } = useAppConfig();
  const isRTL = Platform.OS === "ios" && I18nManager.isRTL;
  return (
    <View className="p-4">
      <Text
        className="text-lg font-semibold capitalize mb-4"

        style={[
          color
            ? { color: color }
            : { color: appConfig?.theme?.buttonColor ?? colors.buttonColor }, {
            ...(isRTL
              ? {
                alignSelf: 'flex-start'
              }
              : {}),
          }
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

export default PageTitle;
