import { StyleSheet, Text, View } from "react-native";
import React, { ReactNode } from "react";
import UserProvider from "./UserProvider";
import ServiceProvider from "./ServiceProvider";
import StoreProvider from "./StoreProvider";
import CartProvider from "./CartProvider";
import AppConfigProvider from "./ConfigProvider";
import { LoginAlertProvider } from "./LoginAlertProvider";

interface ContextProviderWrapperProps {
  children: ReactNode;
}

const ContextWrapper = ({ children }: ContextProviderWrapperProps) => {
  return (
    <AppConfigProvider>
      <UserProvider>
        <LoginAlertProvider>
          <ServiceProvider>
            <StoreProvider>
              <CartProvider>{children}</CartProvider>
            </StoreProvider>
          </ServiceProvider>
        </LoginAlertProvider>
      </UserProvider>
    </AppConfigProvider>
  );
};

export default ContextWrapper;
