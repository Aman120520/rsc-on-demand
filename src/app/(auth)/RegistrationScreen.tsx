import AddressSelection from "@/src/components/Auth/AddressSelection";
import Registration from "@/src/components/Auth/Registration";
import ServiceNotAvailable from "@/src/components/Auth/ServiceNotAvailable";
import { useUser } from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import defaultClient from "@/src/lib/qdc-api";
import { getGeocode } from "@/src/utils/geolocation";
import { showToast } from "@/src/utils/CommonFunctions";
import isEmail from "validator/lib/isEmail";
import ReactNativePhoneInput from "react-native-phone-input";
import config from "@/config";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useFirebaseAnalyticsEvent } from "@/src/hooks/useFirebaseAnalyticsEvent";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const RegistrationScreen = () => {
  // params
  const { mobileNo, stepKey }: any = useLocalSearchParams();
  const { logEvent } = useFirebaseAnalyticsEvent();

  // context API
  const { setAppConfig, appConfig } = useAppConfig();
  const {
    clientId,
    setClientId,
    branchId,
    customerCode,
    setCustomerCode,
    setBranchId,
    user,
    setUser,
    setToken,
    fcmToken,
    otpMatch,
    referrerCode,
    setReferrerCode,
    setReferralId,
  } = useUser();

  // useRef
  const phoneRef = useRef<ReactNativePhoneInput>(null);

  // useState
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState(mobileNo);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [currentRef, setCurrentRef] = useState<any>(null);
  const [manualReferralCode, setManualReferralCode] = useState<any>(null);

  // Address states
  // useState
  const [locationUpdate, setLocationUpdate] = useState(false);
  const [searchLocation, setSearchLocation] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const { t } = useTranslation();
  const [isServicable, setIsServiable] = useState(false);
  const [locality, setLocality] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [houseNo, setHouseNo] = useState("");
  const [landMark, setLandMark] = useState<string | undefined>(undefined);
  const [customerAddress, setCustomerAddress] = useState<any>(null);
  const [region, setRegion] = useState({
    latitude: location?.coords?.latitude,
    longitude: location?.coords?.longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const [disabled, setDisabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // useEffects

  useEffect(() => {
    if (phoneRef && phoneRef?.current) {
      setCurrentRef(phoneRef?.current);
    }
  }, [phoneRef]);

  useEffect(() => {
    if (user !== null && user?.isCustExist === "True" && otpMatch === "True") {
      if (stepKey) {
        setStep(Number(stepKey));
        setLocationUpdate(true);
      }
    } else {
      setLocationUpdate(false);
    }
  }, [user, otpMatch, stepKey]);

  useEffect(() => {
    getGeocode(
      region.latitude ? region?.latitude : location?.coords?.latitude,
      region?.longitude ? region?.longitude : location?.coords?.longitude,
      true
    ).then((res: any) => {
      // console.log("GEO", JSON.stringify(res));

      setCustomerAddress(res);
      setLocality(res?.locality);
    });
  }, [location, region]);

  useEffect(() => {
    const payload = {
      Latitude: region.latitude ? region?.latitude : location?.coords?.latitude,
      Longitude: region?.longitude
        ? region?.longitude
        : location?.coords?.longitude,
    };

    // Test location
    // const payload = {
    //   PackageName: "SubscriptionManagement",
    //   Latitude: "13.045626439391159",
    //   Longitude: "80.21921102079459",
    // };

    // console.log("LAT, LONG", JSON.stringify(payload));

    defaultClient.checkLocality(payload).then(async (res: any) => {
      console.log("LOCALITY", JSON.stringify(res?.json));

      if (res?.json?.Message) {
        setIsServiable(false);
        setBranchId("");
        return;
      }

      if (res?.json[0]?.BranchID) {
        await setClientId(res?.json[0]?.ClientID);
        await setBranchId(res?.json[0]?.BranchID);
      }

      if (res?.response?.status === 200) {
        setIsServiable(true);
      }

      if (res?.response?.status === 404) {
        setIsServiable(false);
      }
    });
  }, [location, region]);

  // Functions
  const onRegister = () => {
    let format = /[`~#&+-;:'",.\[\]\/]/gi;

    if (manualReferralCode) {
      getReferralCode(manualReferralCode).then((res: any) => {
        if (res) {
          // CREATE USER PROFILE FLOW
          if (user === "") {
            showToast(t("auth.enter_name"));
          } else if (format.test(userName)) {
            showToast(t("auth.not_enter_spcific_char"));
          } else if (email === "") {
            showToast(t("auth.enter_email"));
          } else if (!isEmail(email)) {
            showToast(t("auth.enter_valid_email"));
          } else {
            setStep(2);
          }
        } else {
          showToast(t("auth.invalid_referal"));
        }
      });
    } else {
      // CREATE USER PROFILE FLOW
      if (user === "") {
        showToast(t("auth.enter_name"));
      } else if (format.test(userName)) {
        showToast(t("auth.not_enter_spcific_char"));
      } else if (email === "") {
        showToast(t("auth.enter_email"));
      } else if (!isEmail(email)) {
        showToast(t("auth.enter_valid_email"));
      } else {
        setStep(2);
      }
    }

    // // CREATE USER PROFILE FLOW
    // if (user === "") {
    //   showToast("Please enter you name");
    // } else if (format.test(userName)) {
    //   showToast("Please do not enter any speacial character in your name ");
    // } else if (email === "") {
    //   showToast("Please enter you email");
    // } else if (!isEmail(email)) {
    //   showToast("Please enter a valid email");
    // } else {
    //   setStep(2);
    // }
  };

  const onConfirm = () => {
    if (locationUpdate && stepKey) {
      updateLocationFunction();
      return;
    }

    registerNewCustomer();
  };

  const registerNewCustomer = async () => {
    if (houseNo === "") {
      showToast(t("static_messages.enter_house_flat_block"), 2500);
      return;
    }

    if (!isServicable) {
      showToast(t("auth.no_service_at_this_location"));
      updateNonServicableAreaFn();
      setStep(3);
      return;
    }

    const countryCode = currentRef?.getCountryCode();
    const phoneNumber = currentRef
      ?.getValue()
      ?.replace(`+${countryCode}`, "")
      ?.replace(/\s+/g, "");

    const payload = {
      clientID: clientId,
      branchId: branchId,
      name: userName,
      mobile: phoneNumber,
      email: email,
      CityState: customerAddress?.CityState,
      AreaLocation: customerAddress?.AreaLocation,
      pincode: customerAddress?.pincode,
      address: landMark
        ? `${houseNo}, ${landMark}, ${locality}`
        : `${houseNo}, ${locality}`,
      latitude: region.latitude ? region?.latitude : location?.coords?.latitude,
      longitude: region?.longitude
        ? region?.longitude
        : location?.coords?.longitude,
      fcmToken: fcmToken,
    };

    // console.log("create new user payload", JSON.stringify(payload));

    if (isServicable && branchId !== "" && clientId !== "") {
      setBtnLoading(true);
      defaultClient
        .RegisterNewCustomer(payload)
        .then(async (res) => {
          // console.log("CREATED", JSON.stringify(res));
          // @ts-ignore
          let custCode = res?.response?.headers?.map?.customercode;
          let userData = res?.json;
          if (custCode) await setCustomerCode(custCode);
          await setUser({
            name: userData?.Name,
            address: userData?.Address,
            email: userData?.EmailId,
            phoneNumber: userData?.Mobile,
            isCustExist: "True",
            AreaLocation: userData?.AreaLocation,
          });

          if (referrerCode) {
            await createNewReferralCode(custCode, branchId);
          }

          setBtnLoading(false);
          defaultClient
            .getAuthorizationToken(clientId, branchId, custCode)
            .then(async (tokenRes) => {
              console.log({ tokenRes });
              // @ts-ignore
              await setToken(tokenRes?.response?.headers?.map?.token);
              if (tokenRes?.json === "Authorized") {
                router.push("/(auth)/OtpScreen");
              } else {
                showToast(t("static_messages.authorization_failed"));
              }
            });
        })
        .catch((err) => {
          console.log({ err });
          setBtnLoading(false);
        });
    } else {
      showToast(t("auth.no_service_at_this_location"));
      setDisabled(false);
      setBtnLoading(false);
    }
  };

  const updateLocationFunction = () => {
    if (houseNo === "") {
      showToast(t("static_messages.enter_house_flat_block"));
      return;
    }

    if (!isServicable) {
      showToast(t("auth.no_service_at_this_location"));
      setStep(3);
      return;
    }

    if (isServicable && clientId !== "" && branchId !== "") {
      setBtnLoading(true);
      const requestPayload = {
        ClientID: clientId,
        BranchID: branchId,
        CustomerCode: customerCode,
        Name: user?.name,
        Address: landMark
          ? `${houseNo}, ${landMark}, ${locality}`
          : `${houseNo}, ${locality}`,
        AreaLocation: customerAddress?.AreaLocation,
        Latitude: region.latitude
          ? region?.latitude
          : location?.coords?.latitude,
        Longitude: region?.longitude
          ? region?.longitude
          : location?.coords?.longitude,
      };

      defaultClient.updateCustomerDetails(requestPayload).then(async (res) => {
        if (res?.Status === "True") {
          await setUser((prevState: any) => ({
            ...prevState,
            address: landMark
              ? `${houseNo}, ${landMark}, ${locality}`
              : `${houseNo}, ${locality}`,
            areaLocation: customerAddress?.AreaLocation,
          }));
          showToast(res?.Message);
          setDisabled(false);
          setBtnLoading(false);
          setLocationUpdate(false);

          // logEvent("location_updated", {
          //   latitude: region.latitude
          //     ? region?.latitude
          //     : location?.coords?.latitude,
          //   longitude: region?.longitude
          //     ? region?.longitude
          //     : location?.coords?.longitude,
          // });

          router.push("/(app)/screens/profile/MyProfile");
        }
      });
    } else {
      Alert.alert("Location not servicable");
      setDisabled(false);
      setBtnLoading(false);
    }
  };

  const updateNonServicableAreaFn = () => {
    const countryCode = currentRef?.getCountryCode();
    const phoneNumber = currentRef
      ?.getValue()
      ?.replace(`+${countryCode}`, "")
      ?.replace(/\s+/g, "");

    const payload: any = {
      Name: userName,
      EmailID: email,
      Mobile: phoneNumber,
      PackageName: config.slug,
      Address: customerAddress?.locality,
      AreaLocation: customerAddress?.AreaLocation,
      Pincode: customerAddress?.pincode,
      Latitude: region.latitude ? region?.latitude : location?.coords?.latitude,
      Longitude: region?.longitude
        ? region?.longitude
        : location?.coords?.longitude,
      CityState: customerAddress?.CityState,
    };

    defaultClient.updateNonServicableArea(payload).then((res: any) => {
      // console.log("NON SERVICABLE AREA REQUEST", JSON.stringify(res));
    });
  };

  const getReferralCode = async (code: string) => {
    console.log("code", code.toUpperCase());

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_REFERRAL_API_URL}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Org-Id":
              appConfig?.organizationId?.toString() ??
              config.OrganizationId.toString(),
            "accept-language": i18n.language.toString(),
          },
          body: JSON.stringify({
            operationName: "Referral",
            variables: {
              code: code?.toUpperCase(),
            },
            query:
              "query Referral($code: String) {\n    referral(code: $code) {\n    code\n    externalId\n    locationId\n    referrer {\n      id\n      code\n    }\n    referrerId\n    transactions {\n      policyId\n    }\n    statistics {\n      id\n      totalReferrals\n      successfulReferrals\n      rewardEarned\n      rewardRedeemed\n      rewardBalance\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      console.log("ReferralCodeData", JSON.stringify(data));

      if (data?.referral) {
        setReferralId(data?.referral?.id?.toString());
        return { code: data?.referral?.code };
      }
    } catch (err) {
      console.log({ err });
    }
  };

  const createNewReferralCode = async (customerCode: any, locationId: any) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_REFERRAL_API_URL}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Org-Id":
              appConfig?.organizationId?.toString() ??
              config.OrganizationId.toString(),
            "accept-language": i18n.language.toString(),
          },
          body: JSON.stringify({
            operationName: "createReferral",
            variables: {
              externalId: customerCode,
              locationId: parseInt(locationId),
              referralCode: referrerCode,
            },
            query:
              "mutation createReferral (\n    $locationId: Float!\n    $externalId: String!\n    $referralCode: String\n) {\n    createReferral(\n    data: {\n    locationId: $locationId\n    externalId: $externalId\n    referralCode: $referralCode\n    }\n  ) {\n    id\n    code\n    referrer {\n      code\n    }\n    referrerId\n    locationId\n    transactions {\n      policyId\n    }\n    statistics {\n      id\n      totalReferrals\n      successfulReferrals\n      rewardEarned\n      rewardRedeemed\n      rewardBalance\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      console.log("CREATE REFERRAL IN REGISTRATION", JSON.stringify(res));
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      {step === 1 ? (
        <Registration
          mobile={mobile}
          setMobile={setMobile}
          userName={userName}
          setUserName={setUserName}
          email={email}
          setEmail={setEmail}
          onRegister={onRegister}
          phoneRef={phoneRef}
          referralCode={referrerCode}
          setReferrerCode={setReferrerCode}
          manualReferralCode={manualReferralCode}
          setManualReferralCode={setManualReferralCode}
        />
      ) : step === 2 ? (
        <AddressSelection
          location={location}
          setLocation={setLocation}
          locality={locality}
          setLocality={setLocality}
          region={region}
          setRegion={setRegion}
          locationUpdate={locationUpdate}
          setLocationUpdate={setLocationUpdate}
          searchLocation={searchLocation}
          setSearchLocation={setSearchLocation}
          houseNo={houseNo}
          setHouseNo={setHouseNo}
          landMark={landMark}
          setLandMark={setLandMark}
          onSubmit={onConfirm}
          setStep={setStep}
          dissbled={disabled}
          setDisabled={setDisabled}
          btnLoading={btnLoading}
          setBtnLoading={setBtnLoading}
        />
      ) : step === 3 ? (
        <ServiceNotAvailable />
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
};
export default RegistrationScreen;
const styles = StyleSheet.create({});
