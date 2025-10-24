import { useAppConfig } from "@/src/context/ConfigProvider";
import { colors } from "@/src/styles/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type sizes = "large" | "small";

interface ActivityIndicatorProps {
  color?: string;
  size?: sizes;
}

const Loading = ({ color, size }: ActivityIndicatorProps) => {
    const { setAppConfig, appConfig } = useAppConfig();
  return (
    <ActivityIndicator
      size={size ? size : "large"}
      color={
        color ? color : appConfig?.theme?.primaryColor ?? colors.primaryColor
      }
      className="flex-1 items-center justify-center"
    />
  );
};
export default Loading;
