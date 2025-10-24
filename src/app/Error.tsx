import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ErrorScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FEFEFE" }}>
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-xl font-semibold my-4">
          App Configuration Error.
        </Text>
        <Text className="text-md font-medium">Please try again later.</Text>
      </View>
    </SafeAreaView>
  );
};

export default ErrorScreen;
