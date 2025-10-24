import { Dimensions } from "react-native";
import { COLORS } from "./colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const alignSelfStart = { alignSelf: "flex-start" } as const;
const alignSelfCenter = { alignSelf: "center" } as const;
const centerHorizontal = { justifyContent: "center" } as const;
const centerVertical = { alignItems: "center" } as const;
const centerHV = { ...centerHorizontal, ...centerVertical } as const;
const spaceBetweenHorizontal = { justifyContent: "space-between" } as const;
const spaceBetweenVertical = { alignContent: "space-between" } as const;
const spaceBetweenHV = {
  ...spaceBetweenHorizontal,
  ...spaceBetweenVertical,
} as const;
const spaceAroundHorizontal = { justifyContent: "space-around" } as const;
const spaceAroundVertical = { alignContent: "space-around" } as const;
const spaceAroundHV = {
  ...spaceAroundHorizontal,
  ...spaceAroundVertical,
} as const;

const flexEnd = { alignItems: "flex-end" } as const;
const flexWrap = { flexWrap: "wrap" } as const;
const justifyContentEnd = { justifyContent: "flex-end" } as const;

const fullHeight = { height: "100%" } as const;
const fullWidth = { width: "100%" } as const;
const fullHW = { ...fullHeight, ...fullWidth } as const;

const flexContainer = { display: "flex" } as const;
const flexCol = { ...flexContainer, flexDirection: "column" } as const;
const flexRow = { ...flexContainer, flexDirection: "row" } as const;
const flexColCC = { ...flexCol, ...centerHV } as const;
const flexRowCC = { ...flexRow, ...centerHV } as const;
const flexColSbSb = { ...flexCol, ...spaceBetweenHV } as const;
const flexRowSbSb = { ...flexRow, ...spaceBetweenHV } as const;
const flexColSaSa = { ...flexCol, ...spaceAroundHV } as const;
const flexRowSaSa = { ...flexRow, ...spaceAroundHV } as const;
const flexRowAcSb = {
  ...flexRow,
  ...centerVertical,
  ...spaceBetweenHorizontal,
};

const border = (borderWidth: number, borderColor: string) => ({
  borderWidth: borderWidth,
  borderColor: borderColor,
});

const circle = (height: number, backgroundColor?: string) => ({
  height: height,
  width: height,
  borderRadius: height / 2,
  backgroundColor: backgroundColor,
});

const circleBorder = (
  height: number,
  borderWidth: number,
  borderColor: string,
  backgroundColor?: string
) => ({
  ...circle(height, backgroundColor),
  ...border(borderWidth, borderColor),
});

const shadow = {
  // shadow for android
  elevation: 10,
  // shadow for ios
  shadowColor: "rgba(19, 172, 203, 0.09)",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.75,
  shadowRadius: 2,
} as const;

const packageShadow = {
  // shadow for android
  elevation: 10,
  // shadow for ios
  shadowColor: COLORS.BLUE.d5,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.75,
  shadowRadius: 2,
} as const;

const bannerShadow = {
  // shadow for android
  elevation: 10,
  // shadow for ios
  shadowColor: COLORS.BLUE.d15,
  shadowOffset: {
    width: 0,
    height: -1,
  },
  shadowOpacity: 0.75,
  shadowRadius: 2,
  border: 20,
} as const;

const popupShadow = {
  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.17,
  shadowRadius: 3.05,
  elevation: 4,
};

// const shadow = {
//   // shadow for android
//   elevation: 3,
//   // shadow for ios
//   shadowColor: "#000",
//   shadowOffset: {
//     width: 0,
//     height: 3,
//   },
//   shadowOpacity: 0.15,
//   shadowRadius: 2,
// } as const;

const px = (points: number) =>
  ({
    paddingLeft: points,
    paddingRight: points,
  } as const);

const py = (points: number) =>
  ({
    paddingTop: points,
    paddingBottom: points,
  } as const);

const mx = (points: number) =>
  ({
    marginLeft: points,
    marginRight: points,
  } as const);

const my = (points: number) =>
  ({
    marginTop: points,
    marginBottom: points,
  } as const);

const marginTop = (points: number) =>
  ({
    marginTop: points,
  } as const);

const marginLeft = (points: number) =>
  ({
    marginLeft: points,
  } as const);

const height = (points: number) =>
  ({
    height: points,
  } as const);

const txtAlignCenter = { textAlign: "center" } as const;
const txtAlignRight = { textAlign: "right" } as const;
const txtAlignLeft = { textAlign: "left" } as const;
const txtCapitalize = { textTransform: "capitalize" } as const;
const txtUnderline = { textDecorationLine: "underline" } as const;

export const STYLES = {
  windowHeight,
  windowWidth,
  fullHW,
  fullHeight,
  fullWidth,
  shadow,
  popupShadow,
  flexContainer,
  flexCol,
  flexRow,
  alignSelfStart,
  alignSelfCenter,
  centerHV,
  spaceBetweenHV,
  spaceAroundHV,
  flexColCC,
  flexColSaSa,
  flexColSbSb,
  flexRowCC,
  flexRowSbSb,
  flexRowSaSa,
  flexEnd,
  flexWrap,
  justifyContentEnd,
  centerVertical,
  spaceBetweenHorizontal,
  border,
  circle,
  circleBorder,
  px,
  py,
  mx,
  my,
  marginLeft,
  marginTop,
  txtAlignCenter,
  txtAlignRight,
  txtAlignLeft,
  txtCapitalize,
  txtUnderline,
  flexRowAcSb,
  packageShadow,
  bannerShadow,
};
