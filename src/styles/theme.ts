// @format
import { StyleSheet } from "react-native";
import config from "@/config";

const defaults = {
  opacity: 0.7,
};

const colors = {
  defaultBlack: "#000",
  defaultWhite: "#FFF",
  defaultBackgroundColor: "#DDD",
  dividerColor: "rgba(0, 0, 0, 0.12)",
  darkgray: "#808080",
  overlayColor: `rgba(0, 0, 0, ${defaults.opacity})`,
  transparent: "rgba(0,0,0, 0)",
  ...config.theme,
};

const dimens = {
  width: "100%",
  margin: 16,
  marginVertical: 16,
  marginHorizontal: 16,
  padding: 16,
  paddingVertical: 16,
  paddingHorizontal: 16,
  borderRadius: 4,
  dividerHeight: StyleSheet.hairlineWidth,
  headerHeight: 56,
};

export function configureFont(type: any = "regular") {
  const fontConfig = {
    regular: {
      fontFamily: "Roboto-Regular",
      fontWeight: "400",
    },
    bold: {
      fontFamily: "Roboto-Bold",
      fontWeight: "700",
    },
  };

  return fontConfig[type];
}

const font = {
  ...configureFont(),
  fontSizeS: 12,
  fontSize: 16,
  fontSizeLG: 18,
  fontSizeXL: 20,
  fontSizeSM: 14,
  fontSizeXS: 12,
  lineHeight: 24,
};

const buttons = {
  fontSize: font.fontSizeSM,
  fontWeight: font.fontWeight,
  color: colors.buttonTextColor,
  textTransform: config.theme.buttonTextTransform,
  borderRadius: dimens.borderRadius,
  backgroundColor: colors.buttonColor,
};

export { defaults, colors, dimens, font, buttons };
