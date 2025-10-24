import { PixelRatio, TextStyle } from "react-native";

const fontScale = PixelRatio.getFontScale();

// USE THIS FUNCTION TO INCREASE OR DECREASE THE FONT SIZE.
export const getFontSize = (size: number) => size + 2 / fontScale;

import { COLORS } from "./colors";
import { FONT } from "../constants";

// TEXT STYLES - START

const TEXT_10_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  //fontWeight: "600",
  fontSize: getFontSize(10),
};

const TEXT_10_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N5,
  //fontWeight: "800",
  fontSize: getFontSize(10),
  lineHeight: 22,
};

const TEXT_11_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  // fontWeight: "600",
  fontSize: getFontSize(11),
  // lineHeight: 14,
};

const TEXT_11_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N4,
  //fontWeight: "700",
  fontSize: getFontSize(11),
  lineHeight: getFontSize(11) * 1.154,
};

const TEXT_12_M: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N2,
  //fontWeight: "400",
  fontSize: getFontSize(12),
  lineHeight: 16,
};

const TEXT_12_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  //fontWeight: "600",
  fontSize: getFontSize(12),
};

const TEXT_12_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N4,
  //fontWeight: "700",
  fontSize: getFontSize(12),
};

const TEXT_13_M: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  fontSize: getFontSize(13),
  lineHeight: 20,
};

const TEXT_13_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  //fontWeight: "600",
  fontSize: getFontSize(13),
  lineHeight: 20,
};

const TEXT_13_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N4,
  fontSize: getFontSize(13),
  lineHeight: 20,
  //fontWeight: "700",
};

const TEXT_14_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N4,
  //fontWeight: "700",
  fontSize: getFontSize(14),
  lineHeight: 22,
};

const TEXT_14_M: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.V3,
  fontSize: getFontSize(14),
  lineHeight: 20,
};

const TEXT_14_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N4,
  //fontWeight: "700",
  fontSize: getFontSize(14),
  // lineHeight: 20,
};

const TEXT_15_M: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.V3,
  fontSize: getFontSize(15),
  lineHeight: 20,
};

const TEXT_15_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  //fontWeight: "600",
  fontSize: getFontSize(15),
  lineHeight: 20,
};

const TEXT_15_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N4,
  //fontWeight: "700",
  fontSize: getFontSize(15),
  // lineHeight: 18,
};

const TEXT_16_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  //fontWeight: "600",
  fontSize: getFontSize(16),
  // lineHeight: 18,
};

const TEXT_16_B: TextStyle = {
  color: COLORS.BLACK.d0,
  //fontWeight: "800",
  fontFamily: FONT.N5,
  fontSize: getFontSize(16),
  // lineHeight: 24,
};

const TEXT_17_M: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.V3,
  fontSize: getFontSize(17),
  lineHeight: 20,
};

const TEXT_18_B: TextStyle = {
  color: COLORS.BLACK.d0,
  //fontWeight: "700",
  fontFamily: FONT.N4,
  fontSize: getFontSize(18),
  lineHeight: 24,
};

const TEXT_19_B: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N5,
  fontSize: getFontSize(19),
  //fontWeight: "800",
  // lineHeight: 26,
};

const TEXT_20_SB: TextStyle = {
  color: COLORS.BLACK.d0,
  fontFamily: FONT.N3,
  //fontWeight: "700",
  fontSize: getFontSize(20),
  lineHeight: 24,
};

const TEXT_20_B: TextStyle = {
  color: COLORS.BLACK.d0,
  //fontWeight: "700",
  fontFamily: FONT.N4,
  fontSize: getFontSize(20),
};

const TEXT_22_B: TextStyle = {
  color: COLORS.BLACK.d0,
  //fontWeight: "700",
  fontFamily: FONT.N4,
  fontSize: getFontSize(22),
};

export const TEXT_STYLE = {
  TEXT_10_SB,
  TEXT_10_B,
  TEXT_11_SB,
  TEXT_11_B,
  TEXT_12_M,
  TEXT_12_SB,
  TEXT_12_B,
  TEXT_13_M,
  TEXT_13_B,
  TEXT_13_SB,
  TEXT_14_M,
  TEXT_14_B,
  TEXT_15_M,
  TEXT_17_M,
  TEXT_15_SB,
  TEXT_15_B,
  TEXT_16_SB,
  TEXT_16_B,
  TEXT_14_SB,
  TEXT_18_B,
  TEXT_19_B,
  TEXT_20_SB,
  TEXT_20_B,
  TEXT_22_B,
};
