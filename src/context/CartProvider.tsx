import React, {
  Children,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SERVICE_CART_DATA = "serviceItemsCartData";

export const CartContext = createContext<any>(null);

const CartProvider = ({ children }: any) => {
  // useState
  const [serviceItems, setServiceItems] = useState(null);
  const [expressDelivery, setExpressDelivery] = useState<any>(null);

  // CLEANING ORDERS STATE
  const [cleaningCartTotal, setCleaningCartTotal] = useState(0);
  const [cleaningTaxAmount, setCleaningTaxAmount] = useState<string | number>(
    0
  );
  const [cleaningNetAmount, setCleaningNetAmount] = useState(0);
  const [cleaningExpressAmount, setCleaningExpressAmount] = useState<
    string | number
  >(0);

  // LAUNDRY ORDERS STATE
  const [laundryCartTotal, setLaundryCartTotal] = useState(0);
  const [laundryTaxAmount, setLaundryTaxAmount] = useState<string | number>(0);
  const [laundryNetAmount, setLaundryNetAmount] = useState(0);
  const [laundryExpressAmount, setLaundryExpressAmount] = useState<
    string | number
  >(0);

  // GLOBAL STATE FOR USERS
  const [cartTotal, setCartTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState<string | number>(0);
  const [netAmount, setNetAmount] = useState(0);
  const [expressAmount, setExpressAmount] = useState<number | string>(0);

  useEffect(() => {
    // storing a object
    if (serviceItems !== null) {
      const jsonValue = JSON.stringify(serviceItems);
      AsyncStorage.setItem(SERVICE_CART_DATA, jsonValue);
    }
  }, [serviceItems]);

  useEffect(() => {
    const getServiceCart = async () => {
      // object items
      const serviceCart = await AsyncStorage.getItem(SERVICE_CART_DATA);
      return serviceCart != null
        ? setServiceItems(JSON.parse(serviceCart))
        : null;
    };

    getServiceCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        serviceItems,
        setServiceItems,

        expressDelivery,
        setExpressDelivery,

        cleaningCartTotal,
        setCleaningCartTotal,
        cleaningTaxAmount,
        setCleaningTaxAmount,
        cleaningNetAmount,
        setCleaningNetAmount,
        cleaningExpressAmount,
        setCleaningExpressAmount,

        laundryCartTotal,
        setLaundryCartTotal,
        laundryTaxAmount,
        setLaundryTaxAmount,
        laundryNetAmount,
        setLaundryNetAmount,
        laundryExpressAmount,
        setLaundryExpressAmount,

        cartTotal,
        setCartTotal,
        netAmount,
        setNetAmount,
        taxAmount,
        setTaxAmount,
        expressAmount,
        setExpressAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => useContext(CartContext);
