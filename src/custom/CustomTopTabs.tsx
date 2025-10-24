import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { colors } from "../styles/theme";
import { useAppConfig } from "../context/ConfigProvider";

const Tab = createMaterialTopTabNavigator();

const tabActiveColor = appConfig?.theme?.primaryColor ?? colors.primaryColor;
const tabLabelActiveColor = colors.defaultWhite;
const tabLabelInActiveColor = colors.defaultWhite;

interface topTabProps {
  tabsData: Array<any>;
  scrollEnabled?: boolean;
  activeColor?: string;
  inActiveColor?: string;
  tabsColor?: string;
  isCustom?: true;
  swipeEnabled?: boolean;
  initialRouteName?: string;
  backgroundColor?: string;
  indicatorBackgroundColor?: string;
  sharedDataToTabs?: any;
  labelStyle?: StyleProp<TextStyle>;
  indicatorContainerHeight?: number;
  fontSize?: number;
  icon?: any;
}
export const TopTabContext = React.createContext();

const CustomTopTabs = ({
  tabsData,
  scrollEnabled,
  activeColor,
  inActiveColor,
  initialRouteName,
  backgroundColor,
  indicatorBackgroundColor,
  sharedDataToTabs,
  labelStyle,
  indicatorContainerHeight,
  fontSize,
  icon,
}: topTabProps) => {
  const { setAppConfig, appConfig } = useAppConfig();
  return (
    <TopTabContext.Provider value={sharedDataToTabs}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: activeColor
            ? activeColor
            : tabLabelActiveColor,
          //   tabBarInactiveTintColor: inActiveColor
          //     ? inActiveColor
          //     : tabLabelInActiveColor,
          tabBarAllowFontScaling: scrollEnabled == true ? false : true,
          tabBarScrollEnabled: scrollEnabled ? scrollEnabled : false,
          tabBarPressColor: "rgba(225, 225, 225, 0)",
          tabBarLabelStyle: {
            fontSize: fontSize ? fontSize : 14,
            fontWeight: "500",
            textTransform: "uppercase",
            ...labelStyle,
          },
          tabBarStyle: {
            backgroundColor: backgroundColor
              ? backgroundColor
              : colors.defaultWhite,
            height: 50,
          },
          tabBarContentContainerStyle: {},
          tabBarItemStyle: {},
          tabBarIndicatorContainerStyle: {
            backgroundColor:
              appConfig?.theme?.primaryColor ?? colors.primaryColor,
            height: indicatorContainerHeight ? indicatorContainerHeight : 1,
            top: "100%",
            borderRadius: indicatorContainerHeight ? 90 : 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: indicatorBackgroundColor
              ? indicatorBackgroundColor
              : "transparent",
            height: 2,
            borderRadius: 90,
          },
        }}
        backBehavior="initialRoute"
        initialRouteName={initialRouteName}
      >
        {tabsData.map((item, index) => {
          return (
            <Tab.Screen
              name={item.tabName}
              options={{
                title: item.label,
              }}
              component={item.component}
              key={index.toString() + "_" + item.tabName}
            />
          );
        })}
      </Tab.Navigator>
    </TopTabContext.Provider>
  );
};

export default React.memo(CustomTopTabs);
