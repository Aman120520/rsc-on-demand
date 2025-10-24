import { View, Text, StyleSheet } from "react-native";
import { colors } from "../styles/theme";
const Divider = () => {
  return (
    <View
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.defaultBackgroundColor,
      }}
    ></View>
  );
};
export default Divider;
