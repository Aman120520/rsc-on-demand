import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { ReactNode, useRef, useState } from "react";
import { COLORS } from "../styles/colors";
import Icon from "../icons/Icon";
import { colors } from "../styles/theme";
import { useAppConfig } from "../context/ConfigProvider";

interface CollapsibleViewProps {
  title: string;
  children: ReactNode;
  collapsable: boolean;
}

const CollapsibleView = ({
  title,
  children,
  collapsable,
}: CollapsibleViewProps) => {
  const { setAppConfig, appConfig } = useAppConfig();
  const [collapsed, setCollapsed] = useState(collapsable);
  const [animation] = useState(new Animated.Value(collapsable ? 1 : 0));

  const toggleCollapse = () => {
    if (collapsed) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setCollapsed(!collapsed);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <View style={{ marginBottom: 25 }}>
      <TouchableWithoutFeedback onPress={toggleCollapse}>
        <Animated.View
          style={[
            styles.panel,
            // collapsed
            //   ? { backgroundColor: COLORS.BLUE.d17 }
            //   : { backgroundColor: COLORS.GREEN.d15 },

            collapsed
              ? {
                  backgroundColor:
                    appConfig?.theme?.primaryColor ?? colors.primaryColor,
                }
              : {
                  backgroundColor:
                    appConfig?.theme?.primaryColor ?? colors.primaryColor,
                },
          ]}
        >
          <Text className="text-[12] font-semibold" style={[styles.title]}>
            {title}
          </Text>
          <Icon
            name={collapsed ? "chevronUp" : "chevronDown"}
            color={COLORS.WHITE.d0}
            size={17}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
      {collapsed ? (
        <Animated.View style={{ flex: collapsed ? 1 : 0 }}>
          {children}
        </Animated.View>
      ) : (
        <></>
      )}
      {/* <Animated.View style={{ height: heightInterpolate }}>
        {children}
      </Animated.View> */}
    </View>
  );
};
export default CollapsibleView;

const styles = StyleSheet.create({
  panel: {
    height: 36,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.GREEN.d15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: COLORS.WHITE.d0,
    textTransform: "capitalize",
  },
});
