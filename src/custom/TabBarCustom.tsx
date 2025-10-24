import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../styles/theme";
import { TabBarIndicator } from "react-native-tab-view";

interface TabBarCustomProps {
  index: any;
  setIndex: any;
}

const TabBarCustom = ({ index, setIndex, ...props }: TabBarCustomProps) => {
  const inputRange = props.navigationState.routes?.map((x, i) => i);

  return (
    <View key={index} className="flex-row bg-primary">
      {props.navigationState.routes.map((route, i) => {
        const opacity = props.position.interpolate({
          inputRange,
          outputRange: inputRange?.map((inputIndex) =>
            inputIndex === i ? 1 : 0.6
          ),
        });

        return (
          <TouchableOpacity
            className="flex-1 items-center pt-5"
            onPress={() => setIndex(i)}
          >
            <Animated.Text
              className="uppercase text-defaultWhite items-center justify-center"
              style={{ opacity, fontWeight: "600" }}
              numberOfLines={1}
            >
              {route.title}
            </Animated.Text>
            {index === i ? (
              <View className="h-0.5 mt-5 w-full bg-white"></View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBarCustom;
