import Store from "@/src/components/amount/Store";
import Divider from "@/src/components/Divider";
import Header from "@/src/components/Header";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { colors } from "@/src/styles/theme";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StoreListProps {
  stores: any;
  currencyCode: string;
  selectStore: Function;
}

const StoreList = ({ stores, currencyCode, selectStore }: StoreListProps) => {
  const { setAppConfig, appConfig } = useAppConfig();
  const renderItem = ({ item }: any) => {
    return (
      <Store
        item={item}
        currencyCode={currencyCode}
        selectStore={selectStore}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <View className="flex-1 bg-defaultWhite">
        <Header />
        <FlatList
          data={stores}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
    </SafeAreaView>
  );
};
export default StoreList;
const styles = StyleSheet.create({});
