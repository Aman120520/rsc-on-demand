import React, { createContext, useCallback, useContext, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

type LoginAlertContextType = {
  showLoginAlert: (message?: string | null, onCancel?: () => void) => void;
};

const LoginAlertContext = createContext<LoginAlertContextType | null>(null);

export const LoginAlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | null>(
    null
  );

  const router = useRouter();

  const showLoginAlert = useCallback(
    (msg?: string | null, onCancel?: () => void) => {
      setMessage(msg || t("auth.login_msg"));
      setOnCancelCallback(() => onCancel || null);
      setVisible(true);
    },
    []
  );

  const handleCancel = () => {
    setVisible(false);
    if (onCancelCallback) onCancelCallback();
  };

  const handleLogin = () => {
    setVisible(false);
    router.push("/(auth)/login");
  };

  const { t } = useTranslation();

  return (
    <LoginAlertContext.Provider value={{ showLoginAlert }}>
      {children}
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white p-6 rounded-xl ">
            <View className="flex flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-center flex-1">
                {t("auth.login_required")}
              </Text>
              <Pressable
                onPress={handleCancel}
                className="absolute right-0 p-2"
              >
                <Ionicons name="close" size={24} color="black" />
              </Pressable>
            </View>
            <Text className="text-base font-normal text-center mb-4 mt-8">
              {message}
            </Text>
            <View className="flex-row w-full space-x-6 mt-6">
              {/* <TouchableOpacity
                onPress={handleCancel}
                className="mx-2 flex-1 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-center text-red-500 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={handleLogin}
                className="mx-2 flex-1 bg-buttonColor rounded-lg py-3"
              >
                <Text className="text-center text-white font-medium">
                  {t("not_servicable.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LoginAlertContext.Provider>
  );
};

export const useLoginAlert = () => {
  const context = useContext(LoginAlertContext);
  if (!context)
    throw new Error("useLoginAlert must be used within LoginAlertProvider");
  return context.showLoginAlert;
};
