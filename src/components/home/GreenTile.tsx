import {
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
  PixelRatio,
} from "react-native";
import React from "react";
import { SvgXml } from "react-native-svg";
import { SMALL_TICK } from "@/src/icons/svg";
import { colors } from "@/src/styles/theme";

const fontScale = PixelRatio.getFontScale();
export const getFontSize = (size: number) => size + 2 / fontScale;

const GreenTile = ({
  onLayout,
}: {
  onLayout: (e: LayoutChangeEvent) => void;
}) => {
  return (
    <View onLayout={onLayout} style={styles.tile}>
      <View
        className="flex flex-row items-center justify-between"
        style={styles.item}
      >
        <SvgXml
          xml={SMALL_TICK}
          height={getFontSize(14)}
          width={getFontSize(14)}
        />
        <View>
          <Text style={styles.text}>Zero-emission</Text>
          <Text style={styles.text}>delivery vehicles</Text>
        </View>
      </View>
      <View
        className="flex flex-row items-center justify-between"
        style={styles.item}
      >
        <SvgXml
          xml={SMALL_TICK}
          height={getFontSize(14)}
          width={getFontSize(14)}
        />
        <Text style={styles.text}>Eco friendly packaging</Text>
      </View>
      <View
        className="flex flex-row items-center justify-between"
        style={styles.item}
      >
        <SvgXml
          xml={SMALL_TICK}
          height={getFontSize(14)}
          width={getFontSize(14)}
        />
        <Text allowFontScaling={false} style={styles.text}>
          Green chemicals
        </Text>
      </View>
    </View>
  );
};

export default GreenTile;

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.buttonColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 28,
    paddingRight: 14,
    paddingVertical: 20,
  },
  item: {
    marginVertical: 8,
    justifyContent: "flex-start",
  },
  text: {
    fontWeight: "semibold",
    color: colors.defaultWhite,
    textAlign: "left",
    marginLeft: 13,
  },
});
