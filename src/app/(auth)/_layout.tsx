import { Stack } from "expo-router";
import React from "react";

const PublicLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="login"
    />
  );
};
export default PublicLayout;
