import { StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/theme";

interface StatusTextProps {
  status: any;
}

const StatusText = ({ status }: StatusTextProps) => {
  return (
    <View className="flex-row items-center">
      <View
        className="h-2 w-2 rounded bg-primary"
        style={
          status === "READY"
            ? { backgroundColor: colors.readyStatusColor }
            : { backgroundColor: colors.pendingStatusColor }
        }
      ></View>
      <Text className="ml-4">{status}</Text>
    </View>
  );
};
export default StatusText;
