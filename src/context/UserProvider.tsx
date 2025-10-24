import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import config from "../../config";

export const UserContext = createContext<any>(null);

export const CLIENT_ID = "clientID";
export const BRANCH_ID = "branchId";
export const TOKEN = "token";
export const CUSTOMER_CODE = "customerCode";
export const OTP_MATCH = "otpMatch";
export const USER = "user";
export const TNC = "T&C";
export const FCM_TOKEN = "fcmToken";
export const FIRST_TIME_INSTALL = "firstTimeInstall";
export const IS_VALID_USER = "isValidUser";
export const SCHEDULE_COPILOT = "firstTimePilot";
export const REFERRALID = "referralID";

const UserProvider = ({ children }: any) => {
  const router = useRouter();

  const [user, setUser] = useState<object | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [customerCode, setCustomerCode] = useState<string | null>("");
  const [token, setToken] = useState<string | null>(null);
  const [otpMatch, setOtpMatch] = useState<string | null>(null);
  const [tncAccepted, setTncAccepted] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);

  const [isValidUser, setIsValidUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUserFromStorage = async () => {
      await AsyncStorage.getItem(IS_VALID_USER).then((value: any) => {
        if (value !== null) {
          // console.log("STORAGE", value);
          return setIsValidUser(value);
        }
      });
    };

    checkUserFromStorage();
  }, []);

  useEffect(() => {
    if (clientId !== "" && branchId !== "") {
      AsyncStorage.setItem(CLIENT_ID, clientId);
      AsyncStorage.setItem(BRANCH_ID, branchId);
    }

    if (customerCode !== "") {
      AsyncStorage.setItem(CUSTOMER_CODE, customerCode);
    }

    if (token !== null) {
      AsyncStorage.setItem(TOKEN, token);
    }

    if (otpMatch) {
      AsyncStorage.setItem(OTP_MATCH, otpMatch);
    }

    // storing a object
    if (user !== null) {
      const jsonValue = JSON.stringify(user);
      AsyncStorage.setItem(USER, jsonValue);
    }

    if (tncAccepted) {
      AsyncStorage.setItem(TNC, tncAccepted);
    }

    if (fcmToken) {
      AsyncStorage.setItem(FCM_TOKEN, fcmToken);
    }

    if (referralId) {
      AsyncStorage.setItem(REFERRALID, referralId);
    }
  }, [
    clientId,
    branchId,
    token,
    customerCode,
    otpMatch,
    user,
    tncAccepted,
    fcmToken,
    referralId,
  ]);

  useEffect(() => {
    const getData = async () => {
      AsyncStorage.getItem(CLIENT_ID).then((value) => {
        if (value !== null) setClientId(value);
      });

      AsyncStorage.getItem(BRANCH_ID).then((value) => {
        if (value !== null) setBranchId(value);
      });

      AsyncStorage.getItem(CUSTOMER_CODE).then((value) => {
        if (value !== null) setCustomerCode(value);
      });

      AsyncStorage.getItem(TOKEN).then((value) => {
        if (value !== null) setToken(value);
      });

      AsyncStorage.getItem(OTP_MATCH).then((value) => {
        if (value !== null) setOtpMatch(value);
      });

      AsyncStorage.getItem(TNC).then((value) => {
        if (value !== null) setTncAccepted(value);
      });

      AsyncStorage.getItem(FCM_TOKEN).then((value) => {
        if (value !== null) setFcmToken(value);
      });

      AsyncStorage.getItem(REFERRALID).then((value) => {
        if (value !== null) setReferralId(value);
      });

      // object items
      const user = await AsyncStorage.getItem(USER);
      return user != null ? setUser(JSON.parse(user)) : null;
    };

    getData();
  }, []);

  const signInFunction = async () => {
    console.log("SIGN IN FUNCTION CALLED >>>>");

    let userStatus = "True";
    await AsyncStorage.setItem(IS_VALID_USER, userStatus);
    setIsValidUser(userStatus);
  };

  const signOutFunction = async () => {
    console.log("SIGN OUT FUNCTION CALLED >>>>");

    await AsyncStorage.multiRemove([IS_VALID_USER, TOKEN, OTP_MATCH, TNC]);
    await AsyncStorage.multiRemove([
      CLIENT_ID,
      BRANCH_ID,
      CUSTOMER_CODE,
      REFERRALID,
    ]);
    await AsyncStorage.removeItem(USER);
    setIsValidUser(null);
    setUser(null);
    setOtpMatch(null);
    setToken(null);
    setReferrerCode(null);
    setUser(null);
    // router.replace("/(auth)/login");

    let userStatus = "True";
    await AsyncStorage.setItem(IS_VALID_USER, userStatus);

    router.replace("/(app)/(tabs)/home");
  };

  return (
    <UserContext.Provider
      value={{
        clientId,
        setClientId,
        branchId,
        setBranchId,
        token,
        setToken,
        customerCode,
        setCustomerCode,
        otpMatch,
        setOtpMatch,
        user,
        setUser,
        tncAccepted,
        setTncAccepted,
        fcmToken,
        setFcmToken,

        isValidUser,
        referralCode,
        setReferralCode,
        referralId,
        setReferralId,
        referrerCode,
        setReferrerCode,

        signIn: signInFunction,

        signOut: signOutFunction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUser = () => useContext(UserContext);
