import React, {
  Children,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const StoreContext = createContext<any>(null);

export const NOTIFICATION_COUNT = "notificationCount";

const StoreProvider = ({ children }: any) => {
  // useState
  const [pendingOrdersData, setPendingOrdersData] = useState(null);
  const [dialNumber, setDialNumber] = useState("");
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [packagesData, setPackagesData] = useState<[]>([]);
  const [availablePackagesData, setAvailablePackagesData] = useState<any>([]);
  const [activePackagesData, setActivePackagesData] = useState<any>([]);
  const [notificationData, setNotificationData] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [storeDetails, setStoreDetails] = useState<any>(null);
  const [isNetAmountDecimal, setIsnetAmountDecimal] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATION_COUNT).then((res: any) => {
      if (res >= 0) {
        let item = JSON.parse(res);
        setNotificationCount(item);
      }
    });
  }, []);

  useEffect(() => {
    if (notificationCount && notificationCount >= 0) {
      let item = JSON.stringify(notificationCount);
      AsyncStorage.setItem(NOTIFICATION_COUNT, item);
    }
  }, [notificationCount]);

  return (
    <StoreContext.Provider
      value={{
        pendingOrdersData,
        setPendingOrdersData,
        dialNumber,
        setDialNumber,
        rescheduleItem,
        setRescheduleItem,
        packagesData,
        setPackagesData,
        availablePackagesData,
        setAvailablePackagesData,
        activePackagesData,
        setActivePackagesData,
        notificationData,
        setNotificationData,
        notificationCount,
        setNotificationCount,
        storeDetails,
        setStoreDetails,
        isNetAmountDecimal,
        setIsnetAmountDecimal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;

export const useStore = () => useContext(StoreContext);
