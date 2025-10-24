import Divider from "@/src/components/Divider";
import Header from "@/src/components/Header";
import { useService } from "@/src/context/ServiceProvider";
import { useUser } from "@/src/context/UserProvider";
import defaultClient from "@/src/lib/qdc-api";
import { colors } from "@/src/styles/theme";
import { formatCurrency, showToast } from "@/src/utils/CommonFunctions";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RazorpayCheckout from "react-native-razorpay";
import config from "@/config";
import { useStore } from "@/src/context/StoreProvider";
import CommonLoading from "@/src/components/CommonLoading";
import { useIsFocused } from "@react-navigation/native";
import Icon from "@/src/icons/Icon";
// import AllInOneSDKManager from "paytm_allinone_react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useStripe } from "@stripe/stripe-react-native";
import * as Haptics from "expo-haptics";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";
// import TelrSdk from "@telrsdk/rn-telr-sdk";

const PackageDetailsScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  // Date translation function
  const translateDate = (dateString: string) => {
    if (!dateString) return dateString;

    // Parse date format like "31 Dec 9999" or "15 Oct 2024"
    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const translatedMonth = t(`date_formatting.months.${month}`);
      return `${day} ${translatedMonth} ${year}`;
    }
    return dateString;
  };

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { routeKey, navigation }: any = useLocalSearchParams();
  console.log({ navigation });

  const {
    selectedPackageDetail,
    setSelectedPackageDetail,
    setIsRazorPayActive,
  } = useService();
  const { setAppConfig, appConfig } = useAppConfig();
  const { user, clientId, branchId, customerCode } = useUser();
  const {
    setPackagesData,
    setAvailablePackagesData,
    setActivePackagesData,
    storeDetails,
  } = useStore();

  const [key, setKey] = useState<string>(routeKey);
  const [item, setItem] = useState<any>(null);
  const [validity, setValidity] = useState("");
  const [loading, setLoading] = useState(false);

  const [razorpayKey, setRazorpayKey] = useState<string | null>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [payTmKey, setPayTmKey] = useState<string | null>("");
  const [paymentVariables, setPaymentVariables] = useState<any>(null);
  const [publishableKey, setPublishableKey] = useState("");

  const [telrModalVisible, setTelrModalVisible] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [telrKey, setTelrKey] = useState<string | null>(null);

  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    // setItem(null);
    if (selectedPackageDetail !== null) {
      setKey(routeKey);
      setItem(selectedPackageDetail);
    }
  }, [isFocused, selectedPackageDetail]);

  useEffect(() => {
    if (item != undefined) {
      if (
        (item?.ValidityYear == "0" || item?.ValidityYear == undefined) &&
        (item?.ValidityMonth == "0" || item?.ValidityMonth == undefined) &&
        (item?.ValidityDays == "0" || item?.ValidityDays == undefined)
      ) {
        setValidity(t("packages.unlimited"));
      } else if (item?.ValidityDays != "0" && item?.ValidityDays != undefined) {
        setValidity(`${item?.ValidityDays} days`);
      } else if (
        item?.ValidityMonth != "0" &&
        item?.ValidityMonth != undefined
      ) {
        setValidity(item?.ValidityMonth + " " + t("packages.validity_months"));
      } else if (item?.ValidityYear != "0" && item?.ValidityYear != undefined) {
        setValidity(item?.ValidityYear + " " + t("packages.validity_year"));
      }
    }
  }, [item]);

  useEffect(() => {
    if (clientId && branchId) {
      defaultClient
        .activePaymentMethods(clientId, branchId)
        .then((res: any) => {
          // console.log("ACTIVE PAYMENT METHODS", JSON.stringify(res));
          const method = res?.find((method: any) => {
            if (
              method?.PaymentMethodName.toLowerCase() === "razorpay" ||
              method?.PaymentMethodName.toLowerCase() === "razor pay"
            ) {
              return method;
            } else if (method?.PaymentMethodName.toLowerCase() === "paytm") {
              return method;
            } else if (
              method?.PaymentMethodName.toLowerCase() === "Stripe" ||
              method?.PaymentMethodName.toLowerCase() === "stripe"
            ) {
              return method;
            } else if (method?.PaymentMethodName?.toLowerCase() === "telr") {
              return method;
            }
          });

          if (method) {
            setPaymentMethodId(method?.PaymentMethodID);
            method?.PaymentVariables?.find((variable: any) => {
              if (variable?.Key === "key_id") {
                // check for Razor Pay
                setRazorpayKey(variable?.Value);
              } else if (variable?.Key === "MID") {
                // check for PayTm
                setPayTmKey(variable?.Value);
                setPaymentVariables(getPaymentVariables(method));
              } else if (variable?.Key === "Publishable_key") {
                // check for Stripe
                setPublishableKey(variable?.Value);
                setPaymentVariables(getPaymentVariables(method));
              } else if (variable?.Key === "StoreId") {
                // check for telr
                setStoreId(variable?.Value);
                setPaymentVariables(getPaymentVariables(method));
              } else if (variable?.Key === "AutKey") {
                setTelrKey(variable?.Value);
              }
            });
          }
        });
    }
  }, [clientId, branchId]);

  const getPaymentVariables = (activePaymentMethod: any) => {
    return activePaymentMethod?.PaymentVariables.reduce(
      (a: any, { Key, Value }: any) => ({ ...a, [Key]: Value }),
      {}
    );
  };

  const paytmPackageSaleOrderId = async (payload: any) => {
    let response: any;
    await defaultClient.paytmPackageSaleOrderID(payload).then((res: any) => {
      // console.log("PAYTM RESPONSE", JSON.stringify(res));

      if (res?.Message) {
        setBtnLoading(false);
        showToast(res?.Message, 3000);
        return;
      }

      if (res) {
        response = res;
      }
    });

    return response;
  };

  const assignPackage = async (transactionResponse: any) => {
    const payload = {
      ClientID: clientId,
      BranchID: branchId,
      CustomerCode: customerCode,
      PackageID: item?.PackageID,
      Status: "true",
      StartDate: item?.SaleStartDate,
      PaymentRemark: "",
      PackageAssignSource: "CODApp",
      PaymentMethodID: paymentMethodId?.toString(),
      TransactionResponse: transactionResponse,
      UserName: "Online",
      PackageLinkID: "",
      PaymentTypes: "Package",
      CreatedBy: "Online",
    };

    await defaultClient
      .packageAssign(payload)
      .then(async (res: any) => {
        console.log("PACKAGE ASSIGN", JSON.stringify(res));

        if (res?.Status === "True") {
          await defaultClient
            .customerAvailablePackage(clientId, branchId, customerCode)
            .then((res: any) => {
              // console.log("CUSTOMER AVAILABLE PACKAGES", JSON.stringify(res));
              setAvailablePackagesData(res?.SuggestedPackage);
              setPackagesData(res?.SuggestedPackage);
              setIsRazorPayActive(
                res?.IsRazorPayActive === "True" ? true : false
              );
            })
            .catch((err) => {});

          await defaultClient
            .getCustomerActivePackages(clientId, customerCode)
            .then((res: any) => {
              // console.log("CUSTOMER ACTIVE PACKAGES", JSON.stringify(res));
              setActivePackagesData(res);
              setPackagesData((prevState: any) => [...prevState, ...res]);
            })
            .catch((err) => {});

          setBtnLoading(false);
          // router.push("/(app)/screens/package/Packages");

          const stripeTxnId = publishableKey
            ? JSON.parse(transactionResponse)?.id
            : "";
          const paytmTxnId = payTmKey
            ? JSON.parse(transactionResponse)?.TXNID
            : "";

          router.push({
            pathname: "/(app)/screens/payment/PaymentSuccessful",
            params: {
              amount: item?.PackageCost,
              currencyCode: storeDetails?.Currency,
              transactionId: razorpayKey
                ? transactionResponse
                : payTmKey
                ? paytmTxnId
                : publishableKey
                ? stripeTxnId
                : "",
            },
          });
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const FooterButtons = () => {
    const onCall = () => {
      router.push("/(app)/screens/ContactUs");
    };

    const onPay = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

      if (razorpayKey) {
        handleRazorPay();
      } else if (payTmKey) {
        Alert.alert(
          t("checkout.payment_gateway_not_found"),
          t("checkout.try_again_later"),
          [
            {
              text: t("common.ok"),
              style: "default",
            },
          ]
        );
        setLoading(false);
        // handlePayTm();
      } else if (publishableKey) {
        handleStripe();
      } else if (storeId && telrKey) {
        showTelrPaymentPage();
      } else {
        Alert.alert(
          t("checkout.payment_gateway_not_found"),
          t("checkout.try_again_later"),
          [
            {
              text: t("common.ok"),
              style: "default",
            },
          ]
        );
        setLoading(false);
      }
    };

    const handleRazorPay = () => {
      setLoading(true);
      setBtnLoading(true);
      const grandTotal = item?.PackageCost;

      let options = {
        description: `PackageID ${item?.PackageID}`,
        key: razorpayKey,
        currency: storeDetails?.Currency ?? config.currency,
        amount: grandTotal * 100,
        name: appConfig?.appName ?? config.appName?.toLowerCase(),
        prefill: {
          email: user?.email,
          contact: user?.phoneNumber,
          name: user?.name,
        },
        theme: { color: appConfig?.theme?.primaryColor ?? colors.primaryColor },
      };

      //@ts-ignore
      RazorpayCheckout.open(options)
        .then((data: any) => {
          console.log("SDK RESPONSE", JSON.stringify(data));

          // handle success
          showToast(t("static_messages.payment_successful"));
          assignPackage(data.razorpay_payment_id);

          // alert(`Success: ${data.razorpay_payment_id}`);
        })
        .catch((error: any) => {
          // handle failure
          // console.log("ERROR", JSON.stringify(error));
          setLoading(false);
          setBtnLoading(false);

          if (error && Platform.OS === "ios") {
            showToast(error?.description, 2500);
          } else {
            showToast(error?.error?.description, 2500);
          }
        });
    };

    const handlePayTm = async () => {
      setLoading(true);
      setBtnLoading(true);

      const grandTotal = item?.PackageCost;

      if (grandTotal > 0) {
        const payload = {
          ClientID: clientId,
          BranchID: branchId,
          PackageID: item?.PackageID,
          Amount: grandTotal?.toString(),
          CustomerCode: customerCode,
          PaymentTypes: "Package",
          CreatedBy: "Online",
        };

        // console.log("PAYLOAD", JSON.stringify(payload));
        const response = await paytmPackageSaleOrderId(payload);

        // console.log("RESPONSE", JSON.stringify(response));

        try {
          let orderId = response?.OrderID;
          let mid = paymentVariables?.MID;
          let txnToken = response?.TxnToken;
          let callbackURL = response?.CallBackURL;
          let urlScheme = `paytm${paymentVariables?.MID}`;

          // if (response && orderId && mid && txnToken && callbackURL) {
          //   AllInOneSDKManager.startTransaction(
          //     orderId,
          //     mid,
          //     txnToken,
          //     grandTotal?.toString(),
          //     callbackURL,
          //     false,
          //     true,
          //     urlScheme
          //   )
          //     .then((result) => {
          //       // console.log("PAYTM RRESULT", JSON.stringify(result));

          //       if (result?.response) {
          //         showToast(result?.response);
          //       }

          //       const { STATUS, RESPMSG, RESPCODE } = result;

          //       if (STATUS === "TXN_SUCCESS" && RESPCODE === "01") {
          //         assignPackage(JSON.stringify(result));
          //       } else if (STATUS === "PENDING") {
          //         showToast(RESPMSG, 3000);
          //         setLoading(false);
          //         setLoading(false);
          //       } else if (STATUS === "TXN_FAILURE") {
          //         showToast(RESPMSG, 3000);
          //         setBtnLoading(false);
          //         setLoading(false);
          //       }
          //     })
          //     .catch((err) => {
          //       console.error(err);
          //     });
          // } else {
          //   showToast("Payment gateway not found");
          // }
        } catch {}
      } else {
        //  paymentSuccess(paymentMethodId, grandTotal * 100, "");
      }
    };

    const handleStripe = async () => {
      try {
        await initializePaymentSheet();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const initializePaymentSheet = async () => {
      setLoading(true);
      const grandTotal = item?.PackageCost;

      const result = await createPaymentIntent(grandTotal, user?.email);

      if (!result?.paymentIntentClientSecret) {
        setLoading(false);
        return;
      }

      // It will initialize the stripe payment with payment intent
      const { error } = await initPaymentSheet({
        merchantDisplayName: storeDetails?.BusinessName,
        customerId: result?.customerId,
        customerEphemeralKeySecret: result?.ephemeralKey,
        paymentIntentClientSecret: result?.paymentIntentClientSecret,
        returnURL: "wdf-laundry://stripe-redirect",
        googlePay: {
          merchantCountryCode: storeDetails?.Currency ?? config.currency,
          testEnv: true, // use test environment
        },
      });

      if (error) {
        setLoading(false);
        showToast(error.message);
        return;
      }

      // It will open stripe payment sheet
      await openPaymentSheet();

      const paymentDetailsResponse = await fetchStripePaymentDetails(
        result?.id
      );

      if (paymentDetailsResponse?.status === "succeeded") {
        await assignPackage(JSON.stringify(paymentDetailsResponse));
      }

      setLoading(false);
    };

    const openPaymentSheet = async () => {
      const { error } = await presentPaymentSheet();

      if (error) {
        setLoading(false);
        showToast(error.message);
        return;
      } else {
        showToast(t("static_messages.payment_successful"), 2000);
      }
    };

    const createPaymentIntent = async (
      amount: number | string,
      email: string
    ) => {
      const finalAmount = Number(amount) * 100;

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_STRIPE_API_URL}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Org-Id": config.OrganizationId.toString(),
              "accept-language": i18n.language.toString(),
            },
            body: JSON.stringify({
              operationName: "createPaymentIntent",
              variables: {
                amount: Number(finalAmount),
                currency: storeDetails?.Currency ?? config.currency,
                email: email,
                clientId: clientId,
                branchId: branchId,
                orderId: [item?.PackageID],
              },
              query:
                "mutation createPaymentIntent(\n  $amount: Float!\n  $currency: String!\n  $email: String!\n  $branchId: String!\n  $clientId: String!\n  $orderId: [String!]!\n) {\n  createPaymentIntent(\n    amount: $amount\n    currency: $currency\n    email: $email\n    clientId: $clientId\n    branchId: $branchId\n    orderId: $orderId\n    ) {\n    id\n    currency\n    customerId\n    amountPayable\n    amountReceived\n    status\n    paymentIntentClientSecret\n    ephemeralKey\n    clientId\n    branchId\n    orderId\n  }\n}",
            }),
          }
        );
        const result = await response.json();

        if (result?.errors && result?.errors[0]?.message) {
          showToast(result?.errors[0]?.message, 5000);
          setLoading(false);
          return;
        }

        return result?.data?.createPaymentIntent;
      } catch (error) {
        console.log("Error in paymentIntent API", error);
      }
    };

    const fetchStripePaymentDetails = async (id: string) => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_STRIPE_API_URL}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Org-Id": config.OrganizationId.toString(),
              "accept-language": i18n.language.toString(),
            },
            body: JSON.stringify({
              operationName: "RetrievePaymentIntent",
              variables: {
                paymentIntentId: id,
              },
              query:
                "query RetrievePaymentIntent($paymentIntentId: String!) {\n  retrievePaymentIntent(paymentIntentId: $paymentIntentId) {\n    id\n    amountPayable\n    currency\n    status\n    customerId\n    amountReceived\n    confirmationMethod\n    invoice\n    paymentMethod\n    processing\n    paymentMethodTypes\n    receiptEmail\n    cancelledAt\n    cancellationReason\n    clientSecret\n  }\n}",
            }),
          }
        );
        const result = await response.json();

        if (result?.errors && result?.errors[0]?.message) {
          showToast(result?.errors[0]?.message, 5000);
          setLoading(false);
          return;
        }

        return result?.data?.retrievePaymentIntent;
      } catch (error) {
        console.log("Error in stripe payment details API", error);
      }
    };

    // const assignPackage = async (transactionResponse: any) => {
    //   const payload = {
    //     ClientID: clientId,
    //     BranchID: branchId,
    //     CustomerCode: customerCode,
    //     PackageID: item?.PackageID,
    //     Status: "true",
    //     StartDate: item?.SaleStartDate,
    //     PaymentRemark: "",
    //     PackageAssignSource: "CODApp",
    //     PaymentMethodID: paymentMethodId?.toString(),
    //     TransactionResponse: transactionResponse,
    //     UserName: "Online",
    //     PackageLinkID: "",
    //     PaymentTypes: "Package",
    //     CreatedBy: "Online",
    //   };

    //   await defaultClient
    //     .packageAssign(payload)
    //     .then(async (res: any) => {
    //       console.log("PACKAGE ASSIGN", JSON.stringify(res));

    //       if (res?.Status === "True") {
    //         await defaultClient
    //           .customerAvailablePackage(clientId, branchId, customerCode)
    //           .then((res: any) => {
    //             // console.log("CUSTOMER AVAILABLE PACKAGES", JSON.stringify(res));
    //             setAvailablePackagesData(res?.SuggestedPackage);
    //             setPackagesData(res?.SuggestedPackage);
    //             setIsRazorPayActive(
    //               res?.IsRazorPayActive === "True" ? true : false
    //             );
    //           })
    //           .catch((err) => {});

    //         await defaultClient
    //           .getCustomerActivePackages(clientId, customerCode)
    //           .then((res: any) => {
    //             // console.log("CUSTOMER ACTIVE PACKAGES", JSON.stringify(res));
    //             setActivePackagesData(res);
    //             setPackagesData((prevState: any) => [...prevState, ...res]);
    //           })
    //           .catch((err) => {});

    //         setBtnLoading(false);
    //         // router.push("/(app)/screens/package/Packages");

    //         const stripeTxnId = publishableKey
    //           ? JSON.parse(transactionResponse)?.id
    //           : "";
    //         const paytmTxnId = payTmKey
    //           ? JSON.parse(transactionResponse)?.TXNID
    //           : "";

    //         router.push({
    //           pathname: "/(app)/screens/payment/PaymentSuccessful",
    //           params: {
    //             amount: item?.PackageCost,
    //             currencyCode: storeDetails?.Currency,
    //             transactionId: razorpayKey
    //               ? transactionResponse
    //               : payTmKey
    //               ? paytmTxnId
    //               : publishableKey
    //               ? stripeTxnId
    //               : "",
    //           },
    //         });
    //       }
    //     })
    //     .catch((err) => {
    //       setLoading(false);
    //     });
    // };

    if (btnLoading) {
      return (
        <View className="py-5 bg-buttonColor">
          <ActivityIndicator
            color={appConfig?.theme?.primaryColor ?? colors.primaryColor}
          />
        </View>
      );
    }

    return (
      <View className="bg-buttonColor flex-row items-center justify-around">
        <Pressable
          className="flex-1 py-6 items-center justify-center"
          onPress={() => {
            setSelectedPackageDetail(null);

            if (navigation === "pricelist") {
              router.push("/(app)/screens/catalouge/CatalougeScreen");
            } else {
              router.back();
            }
          }}
        >
          <Text className="color-white text-md font-semibold">
            {t("common.back")}
          </Text>
        </Pressable>

        {key === "available" ? (
          <Pressable
            disabled={appConfig?.disablePayment}
            className="flex-1 py-6 items-center justify-center"
            onPress={onPay}
          >
            <Text className="color-white text-md font-semibold">
              {appConfig?.disablePayment
                ? t("packages.payment_disabled")
                : `${
                    item?.IsForSubscription === "True"
                      ? t("packages.subscribe_now")
                      : t("packages.buy_now")
                  }`}
            </Text>
          </Pressable>
        ) : key === "active" ? (
          <Pressable
            className="flex-1 py-6  items-center justify-center"
            onPress={onCall}
          >
            <Text className="color-white text-md font-semibold">
              {t("packages.contact_us")}
            </Text>
          </Pressable>
        ) : (
          <></>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
        }}
      >
        <CommonLoading />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
        }}
      >
        <View className="flex-1 bg-defaultBackgroundColor">
          <Header />

          <View className="flex-1 justify-between">
            <View></View>
            <View className="items-center">
              <Icon name="not-found" />
              <Text className="text-base mt-4 font-semibold">
                {t("packages.package_not_found")}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                if (navigation === "pricelist") {
                  router.push("/(app)/screens/catalouge/CatalougeScreen");
                } else {
                  router.push("/(app)/(tabs)/home");
                }
              }}
              className="py-6 bg-buttonColor flex-row items-center justify-around"
            >
              <Text className="text-defaultWhite font-semibold text-md">
                {t("common.back")}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const AvailablePackageDetail = () => {
    return (
      <ScrollView className="flex-1 bg-defaultWhite">
        <View className="px-5">
          {item?.ImageURL != "" ? (
            <Image
              style={styles.itemIcon}
              source={{
                uri: item?.ImageURL,
              }}
              contentFit="fill"
            />
          ) : (
            <Image
              style={styles.itemIcon}
              source={require("../../../../raw-assets/discount.png")}
            />
          )}
        </View>

        <View className="px-6 my-8">
          <Text className="text-xl font-bold">{item?.PackageName}</Text>

          <Text className="my-4">{item?.PackageDescription}</Text>
          <View className="flex-row">
            <Text className="text-md">{t("packages.price")}</Text>
            <Text className="text-md ml-2">
              {formatCurrency(
                item?.PackageCost,
                storeDetails?.Currency ?? config.currency,
                item?.PackageCost % 1 !== 0 ? 2 : 0
              )}
            </Text>
          </View>

          <View className="flex-row mt-4">
            <Text className="text-md">{t("packages.validity")}</Text>
            <Text className="text-md ml-2">{validity}</Text>
          </View>
        </View>

        <Divider />
      </ScrollView>
    );
  };

  const ActivePackageDetail = () => {
    return (
      <View className="flex-1 bg-defaultWhite m-6 py-6 px-6 rounded-t-2xl">
        <Text className="text-base font-semibold">{item?.PackageName}</Text>

        {/* <View className="flex-row items-center justify-between mt-8 px-16">
          <Text className="text-md">{t("packages.balance_available")} </Text>
          <Text className="text-md">
            {formatCurrency(item?.PackageBalance, item?.currencyCode)}
          </Text>
        </View> */}

        <View className="flex-row items-center justify-between my-5 px-16">
          <Text className="text-md">{t("packages.expiring_on")} </Text>

          {item?.EndDate == "31 Dec 9999" ? (
            <Text className="text-md">{t("packages.unlimited")}</Text>
          ) : (
            <Text className="text-md">{translateDate(item?.EndDate)}</Text>
          )}
        </View>
      </View>
    );
  };

  const telrModalClose = () => {
    setTelrModalVisible(false);
    setBtnLoading(false);
    Alert.alert("Transaction aborted by user");
  };

  const didFailWithError = (message: string) => {
    setTelrModalVisible(false);
    setBtnLoading(false);
    Alert.alert(message);
  };

  const didPaymentSuccess = (response: any) => {
    // console.log(response);
    // Alert.alert(response.message);
    if (response && response.message === "Authorised") {
      setTelrModalVisible(false);

      if (!response?.tranref) {
        return;
      }

      showToast(t("static_messages.payment_successful"));
      assignPackage(JSON.stringify(response));
    }
  };

  const showTelrPaymentPage = () => {
    const grandTotal = item?.PackageCost;

    const paymentRequest = {
      framed: "0", //open card frame pass 1, and for webview pass 0
      sdk_env: "prod", //prod//dev
      tran_test: "0", // 1=test, 0=production
      something_went_wrong_message: "Something went wrong",
      store_id: storeId,
      key: telrKey,
      device_type: Platform.OS === "ios" ? "iOS" : "Android",
      app_name: appConfig?.appName ?? config.appName?.toLowerCase(), //enter app name
      tran_type: "sale", //sale
      tran_class: "paypage",
      tran_cartid: `${Math.floor(Math.random() * 100) + 2}`, //enter cart id it shoud be unique for every transaction //1234567890
      tran_description: `Store: ${storeDetails?.BranchName}`,
      tran_language: "en",
      // tran_currency: storeDetails?.Currency ?? "AED",
      tran_currency: "AED",
      tran_amount: grandTotal,
      tran_firstref: "",
      billing_name_title: "Mr",
      billing_name_first: user?.name,
      billing_name_last: user?.name,
      billing_address_line1: user?.address,
      billing_address_region: appConfig?.defaultCountry?.toLowerCase(),
      // billing_address_country: appConfig?.defaultCountry?.toLowerCase() ?? "UAE",
      billing_address_country: "UAE",
      billing_custref: "001",
      billing_email: user?.email,
      billing_phone: user?.phoneNumber,
    };
    // console.log(paymentRequest);
    setPaymentRequest(paymentRequest);
    setTelrModalVisible(true);
  };

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme="your-url-scheme">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
        }}
      >
        <View className="flex-1 bg-defaultBackgroundColor">
          <Header />
          {key === "available" ? (
            <AvailablePackageDetail />
          ) : key === "active" ? (
            <ActivePackageDetail />
          ) : (
            <></>
          )}

          {key ? <FooterButtons /> : null}

          {/* <TelrSdk
            paymentRequest={paymentRequest}
            telrModalVisible={telrModalVisible}
            telrModalClose={telrModalClose}
            didFailWithError={didFailWithError}
            didPaymentSuccess={didPaymentSuccess}
          /> */}
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
};
export default PackageDetailsScreen;

const styles = StyleSheet.create({
  itemIcon: {
    width: "100%",
    aspectRatio: 1,
  },
});
