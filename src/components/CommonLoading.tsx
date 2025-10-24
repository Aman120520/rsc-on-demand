import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/theme";
import { useAppConfig } from "../context/ConfigProvider";

interface CommonLoadingProps {
  color?: string;
  size?: "small" | "large";
}

const CommonLoading = ({ color, size }: CommonLoadingProps) => {
  const { setAppConfig, appConfig } = useAppConfig();
  return (
    <ActivityIndicator
      color={
        color ? color : appConfig?.theme?.primaryColor ?? colors.primaryColor
      }
      size={size ? size : "large"}
    />
  );
};
export default CommonLoading;
