import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

import { Platform } from "react-native";
import { router, usePathname, useSegments } from "expo-router";
import { useUser } from "../context/UserProvider";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
  // triggerTestNotification?: () => Promise<void>;
}

export const usePushNotifications = (): PushNotificationState => {
  const currentPathname = usePathname();
  const segments = useSegments();
  const segmentsArray = (segments as unknown as string[]) || [];
  const lastHandledNotificationIdRef = useRef<string | undefined>(undefined);
  const { user } = useUser();

  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const content = notification?.request?.content as
        | Notifications.NotificationContent
        | undefined;
      const data = (content?.data ?? {}) as Record<string, unknown>;
      const imageUrl =
        (data.image as string | undefined) ||
        (data.imageUrl as string | undefined);

      if (imageUrl) {
        return {
          shouldPlaySound: true,
          shouldShowAlert: true,
          shouldSetBadge: true,
        };
      }

      return {
        shouldPlaySound: true,
        shouldShowAlert: true,
        shouldSetBadge: true,
      };
    },
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const responseListener = useRef<Notifications.Subscription>();
  const notificationListener = useRef<Notifications.Subscription>();

  const { setFcmToken, clientId, branchId, customerCode } = useUser();

  async function registerForPushNotificationsAsync() {
    let expoToken: Notifications.ExpoPushToken | undefined;
    let nativeDeviceToken: string | undefined;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Expo push token (for Expo push service)
      expoToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });

      // Native device token (APNs on iOS) for your backend
      if (Platform.OS === "ios") {
        try {
          const devicePushToken: Notifications.DevicePushToken =
            await Notifications.getDevicePushTokenAsync();
          nativeDeviceToken = devicePushToken.data;
        } catch { }
      }
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return { expoToken, nativeDeviceToken };
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (tokens) => {
      const { expoToken, nativeDeviceToken } = tokens ?? {};
      if (expoToken) setExpoPushToken(expoToken);
      try {
        console.log("====================================");
        console.log("FEM TOKEN", expoToken);
        console.log("====================================");
        // iOS: use native APNs token for backend; Android: use Expo token

        if (Platform.OS === "ios") {
          const tokenString =
            (typeof expoToken === "object" && expoToken && "data" in expoToken
              ? (expoToken as Notifications.ExpoPushToken).data
              : undefined) ?? expoToken?.toString?.();

          setFcmToken(tokenString);
        } else {
          const tokenString =
            (typeof expoToken === "object" && expoToken && "data" in expoToken
              ? (expoToken as Notifications.ExpoPushToken).data
              : undefined) ?? expoToken?.toString?.();

          setFcmToken(tokenString);
        }

        const expoTokenString =
          (typeof expoToken === "object" && expoToken && "data" in expoToken
            ? (expoToken as Notifications.ExpoPushToken).data
            : undefined) ?? undefined;

        const deviceTokenForPost =
          Platform.OS === "ios" ? nativeDeviceToken : undefined;

        if (
          process.env.EXPO_PUBLIC_PUSH_TOKEN_API_URL &&
          clientId &&
          branchId &&
          customerCode &&
          (expoTokenString || deviceTokenForPost)
        ) {
          try {
            await fetch(process.env.EXPO_PUBLIC_PUSH_TOKEN_API_URL, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                clientId,
                branchId,
                customerCode,
                expoPushToken: expoTokenString,
                devicePushToken: deviceTokenForPost,
              }),
            });
          } catch { }
        }
      } catch { }
    });
    // Foreground notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        try {
          setNotification(notif);
        } catch { }
      });

    // Notification responses (user taps)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const rawData = (response?.notification?.request?.content?.data ??
            {}) as Record<string, unknown>;
          const notifId = response?.notification?.request?.identifier as
            | string
            | undefined;
          const route =
            (rawData.route as string | undefined) ||
            (rawData.screen as string | undefined);

          // Skip if we already handled this notification
          if (notifId && lastHandledNotificationIdRef.current === notifId) {
            return;
          }
          if (notifId) lastHandledNotificationIdRef.current = notifId;
          if (user === null) {
            router.replace({ pathname: "/(app)/(tabs)/home" });
            return;
          } else {
            const navigateIfNeeded = (targetPath: string) => {
              try {
                if (currentPathname === targetPath) {
                  return;
                }
                router.replace({ pathname: targetPath as any });
              } catch { }
            };
            switch (route) {
              case "/(app)/(tabs)/home":
                // Only navigate if not already on home screen
                if (currentPathname !== "/(app)/(tabs)/home" &&
                  !currentPathname?.startsWith("/(app)/(tabs)/home")) {
                  router.replace({ pathname: "/(app)/(tabs)/home" });
                }
                break;
              case "/(app)/(tabs)/orders":
                navigateIfNeeded("/(app)/(tabs)/orders");
                break;
              case "/(app)/(tabs)/packages":
                navigateIfNeeded("/(app)/(tabs)/packages");
                break;
              case "/(app)/(tabs)/refer&earn":
                navigateIfNeeded("/(app)/(tabs)/refer&earn");
                break;
              case "/(app)/screens/payment/AmountDueScreen":
                navigateIfNeeded("/(app)/screens/payment/AmountDueScreen");
                break;
              case "/(app)/screens/package/PackageDetailsScreen":
                navigateIfNeeded("/(app)/screens/package/PackageDetailsScreen");
                break;
              // case "/(app)/screens/service/Reschedule":
              //   navigateIfNeeded("/(app)/screens/service/Reschedule");
              //   break;
              default:
                if (route) {
                  navigateIfNeeded(route);
                }
                break;
            }
          }
        } catch (e) {
          try {
            router.push("/(app)/(tabs)/home");
          } catch { }
        }
      });

    // Handle cold start: navigate if the app was launched from a notification
    (async () => {
      try {
        const initialResponse =
          await Notifications.getLastNotificationResponseAsync();
        if (initialResponse) {
          const rawData = (initialResponse.notification?.request?.content
            ?.data ?? {}) as Record<string, unknown>;
          const notifId = initialResponse?.notification?.request?.identifier as
            | string
            | undefined;
          const route =
            (rawData.route as string | undefined) ||
            (rawData.screen as string | undefined);

          // Skip if we already handled this notification
          if (notifId && lastHandledNotificationIdRef.current === notifId) {
            return;
          }
          if (notifId) lastHandledNotificationIdRef.current = notifId;

          if (user === null) {
            // router.replace("/(app)/(tabs)");
            return;
          } else {
            const navigateIfNeeded = (targetPath: string) => {
              try {
                if (currentPathname === targetPath) {
                  return;
                }
                router.replace({ pathname: targetPath as any });
              } catch { }
            };

            switch (route) {
              case "/(app)/(tabs)/home": {
                const isOnHomeScreen =
                  currentPathname === "/(app)/(tabs)" ||
                  currentPathname?.startsWith("/(app)/(tabs)/home") ||
                  (Array.isArray(segmentsArray) &&
                    segmentsArray.includes("(tabs)") &&
                    segmentsArray[segmentsArray.length - 1] === "home");

                // Only navigate if not already on home screen
                if (!isOnHomeScreen) {
                  navigateIfNeeded("/(app)/(tabs)/home");
                }
                break;
              }
              case "/(app)/(tabs)/orders":
                navigateIfNeeded("/(app)/(tabs)/orders");
                break;
              case "/(app)/(tabs)/packages":
                navigateIfNeeded("/(app)/(tabs)/packages");
                break;
              case "/(app)/(tabs)/refer&earn":
                navigateIfNeeded("/(app)/(tabs)/refer&earn");
                break;
              case "/(app)/screens/payment/AmountDueScreen":
                navigateIfNeeded("/(app)/screens/payment/AmountDueScreen");
                break;
              case "/(app)/screens/package/PackageDetailsScreen":
                navigateIfNeeded("/(app)/screens/package/PackageDetailsScreen");
                break;
              default:
                if (route) {
                  navigateIfNeeded(route);
                }
                break;
            }
          }
        }
      } catch { }
    })();

    return () => {
      try {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
      } catch { }
      try {
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
        }
      } catch { }
    };
  }, [clientId, branchId, customerCode]);

  return {
    expoPushToken,
    notification,
  };
};