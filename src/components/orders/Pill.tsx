import { Text, View } from "react-native";
import React from "react";

interface PillProps {
  label: string;
  value?: string | number;
  icon: React.ReactNode;
}

const Pill = ({ label, value, icon }: PillProps) => {
  return (
    <View className="flex-1 h-10 flex-row items-center justify-between px-4 mx-2 rounded bg-defaultWhite">
      <View className="flex-row items-center flex-shrink">
        <View className="pr-2">{icon}</View>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-sm font-bold capitalize text-defaultTextColor"
        >
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className="ml-2 flex-shrink text-sm text-defaultTextColor text-right"
      >
        {value ?? 0}
      </Text>
    </View>
  );
};

export default Pill;
