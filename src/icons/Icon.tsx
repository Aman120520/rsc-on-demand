import { View, Text } from "react-native";
import iconSet from "./icons";
import { colors } from "../styles/theme";
import { useAppConfig } from "../context/ConfigProvider";

interface IconProps {
  name: string;
  color?: string;
  size?: number;
  height?: number;
  width?: number;
}

const Icon = ({
  name,
  color = colors.primaryColor,
  size,
  height,
  width,
}: IconProps) => {
  const icon = iconSet[name];

  if (icon) {
    return <>{icon(color, height, width, size)}</>;
  }

  return <>{iconSet.failure(color)}</>;
};

export default Icon;
