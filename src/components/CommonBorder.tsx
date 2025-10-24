import { View, ViewStyle } from "react-native";
import React from "react";

interface BorderProps {
  color?: string;
  height?: number;
  my?: number;
  mt?: number;
  mb?: number;
  mh?: number;
  style?: ViewStyle;
}

const CommonBorder = ({
  color,
  height,
  my,
  mt,
  mb,
  mh,
  style,
}: BorderProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: color ? color : "#E7F5F8",
          height: height ? height : 1,
          marginVertical: my ? my : 4,
          marginTop: mt ? mt : 4,
          marginBottom: mb ? mb : 4,
          marginHorizontal: mh ? mh : 0,
          ...style,
        },
      ]}
    ></View>
  );
};

export default CommonBorder;
