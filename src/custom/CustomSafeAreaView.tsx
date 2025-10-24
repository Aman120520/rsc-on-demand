import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const CustomSafeAreaView = ({ children, style }: any) => {
  return <SafeAreaView style={style}>{children}</SafeAreaView>;
};
export default CustomSafeAreaView;
