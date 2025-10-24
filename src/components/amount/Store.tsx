import { formatCurrency } from "@/src/utils/CommonFunctions";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StoreProps {
  item: any;
  currencyCode: string;
  selectStore: Function;
}

const Store = ({ item, currencyCode, selectStore }: StoreProps) => {
  return (
    <TouchableOpacity
      onPress={() => {
        selectStore(item);
      }}
      className="p-4 bg-white w-full flex-row items-center justify-between"
    >
      <View className="flex-row items-center">
        <Image
          source={require("../../assets/default-logo.png")}
          style={{ height: 50, width: 50, borderRadius: 4 }}
          resizeMode="contain"
        />
        <Text className="ml-4 text-base font-bold">{item?.name}</Text>
      </View>
      <Text className="text-md">
        Pay{" "}
        {formatCurrency(
          item?.amount || 0,
          currencyCode,
          Number(item?.amount) % 1 !== 0 ? 2 : 0
        )}
      </Text>
    </TouchableOpacity>
  );
};
export default Store;
