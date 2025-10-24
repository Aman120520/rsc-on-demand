import { StyleSheet, Text, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import CustomDrawer from "@/src/custom/CustomDrawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Layout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          drawerStyle: {
            width: "70%",
          },
        }}
        drawerContent={(props: any) => <CustomDrawer {...props} />}
        // initialRouteName="home"
        backBehavior="history"
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};
export default Layout;
