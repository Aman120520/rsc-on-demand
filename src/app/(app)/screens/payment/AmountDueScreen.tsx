import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import groupBy from "lodash.groupby";
import sumBy from "lodash.sumby";
import uniqBy from "lodash.uniqby";
import StoreList from "./StoreList";
import config from "@/config";
import defaultClient from "@/src/lib/qdc-api";
import CommonLoading from "@/src/components/CommonLoading";
import Header from "@/src/components/Header";
import { useStore } from "@/src/context/StoreProvider";
import { useUser } from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import { formatCurrency, showToast } from "@/src/utils/CommonFunctions";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import CouponModal from "@/src/components/coupon/CouponModal";
import Icon from "@/src/icons/Icon";
import Divider from "@/src/components/Divider";
// import AllInOneSDKManager from "paytm_allinone_react-native";
import * as Haptics from "expo-haptics";
import PaymentSuccessful from "./PaymentSuccessful";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";
// import TelrSdk from "@telrsdk/rn-telr-sdk";

const AmountDueScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // params
  const { type, orderNumber }: any = useLocalSearchParams();

  // Context API
  const { appConfig } = useAppConfig();
  const { user, clientId, branchId, customerCode, referralId } = useUser();
  const { pendingOrdersData, storeDetails, isNetAmountDecimal } = useStore();

  // useState
  const [multipleStore, setMultipleStore] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [orderwisePayment, setOderwisePayment] = useState(false);

  const [value, setValue] = useState(0);
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

  // Coupons
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState(null);
  const [couponRes, setCouponRes] = useState<any>(null);
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalDueAmount, setFinalDueAmount] = useState<number | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  // useEffect
  useEffect(() => {
    setCouponRes(null);
    setMultipleStore(false);
    setSelectedStore(null);
  }, [isFocused]);

  useEffect(() => {
    if (type && orderNumber) {
      return;
    }

    checkForMultipleStores();
  }, [isFocused, orderwisePayment, type, orderNumber]);

  useEffect(() => {
    // check for orderwise payment
    setTimeout(() => {
      if (orderNumber !== undefined && type !== "" && orderNumber !== "") {
        setOderwisePayment(true);
      } else {
        setOderwisePayment(false);
      }
    }, 500);
  }, [type, orderNumber]);

  useEffect(() => {
    setValue(0);
    // calculate the price value
    async function calculateAmount() {
      if (orderwisePayment) {
        await pendingOrdersData?.map((order: any) => {
          if (order?.OrderNo === orderNumber) {
            return isNetAmountDecimal
              ? setValue(order?.PendingAmount)
              : setValue(Math.round(order?.PendingAmount));
          }
        });
      } else {
        let totalValue = 0;
        await pendingOrdersData?.map((order: any) => {
          if (order && Number(order?.PendingAmount) > 0) {
            totalValue += Number(order?.PendingAmount);
            return isNetAmountDecimal
              ? setValue(totalValue)
              : setValue(Math.round(totalValue));
          }
        });
      }
    }

    calculateAmount();
  }, [isFocused, orderwisePayment, type, orderNumber, pendingOrdersData]);

  useEffect(() => {
    if (couponCode && couponRes) {
      let finalAmount = value - couponRes?.validateCoupon?.discount.toFixed(2);

      if (finalAmount > 0) {
        isNetAmountDecimal
          ? setFinalDueAmount(finalAmount)
          : setFinalDueAmount(Math.round(finalAmount));
      } else {
        setFinalDueAmount(0);
      }
    }
  }, [couponRes, couponCode, selectedStore]);

  useEffect(() => {
    // Razorpay keys
    if (clientId && branchId) {
      defaultClient
        .activePaymentMethods(clientId, branchId)
        .then((res: any) => {
          console.log("ACTIVE PAYMENT METHODS", JSON.stringify(res));
          const method = res?.find((method: any) => {
            if (
              method?.PaymentMethodName.toLowerCase() === "razorpay" ||
              method?.PaymentMethodName.toLowerCase() === "razor pay"
            ) {
              return method;
            } else if (method?.PaymentMethodName.toLowerCase() === "paytm") {
              return method;
            } else if (method?.PaymentMethodName.toLowerCase() === "stripe") {
              return method;
            } else if (method?.PaymentMethodName?.toLowerCase() === "telr") {
              return method;
            }
          });

          // console.log(method);

          if (method) {
            setPaymentMethodId(method?.PaymentMethodID);
            method?.PaymentVariables?.find((variable: any) => {
              if (variable?.Key === "key_id") {
                // check for Razor Pay
                setRazorpayKey(variable?.Value);
              } else if (variable?.Key === "Publishable_key") {
                // check for Stripe
                setPublishableKey(variable?.Value);
              } else if (variable?.Key === "StoreId") {
                // check for telr
                setStoreId(variable?.Value);
              } else if (variable?.Key === "AutKey") {
                setTelrKey(variable?.Value);
              }
            });
          }
        });
    }
  }, [clientId, branchId]);

  useEffect(() => {
    if (orderwisePayment) {
      return;
    }

    if (selectedStore !== null) {
      setMultipleStore(false);

      isNetAmountDecimal
        ? setValue(selectedStore?.amount)
        : setValue(Math.round(selectedStore?.amount));
    }
  }, [selectedStore]);

  // Functions
  const getOrderNumber = () => {
    if (orderwisePayment) {
      return orderNumber;
    }

    if (selectedStore) {
      return pendingOrdersData
        ?.filter((order: any) => order?.PendingAmount !== "0")
        ?.filter((order: any) => order?.BranchID === selectedStore?.id)
        ?.map((order: any) => order?.OrderNo)
        ?.join(",");
    }

    return pendingOrdersData
      ?.filter((o: any) => o.PendingAmount !== "0")
      ?.map((o: any) => o.OrderNo)
      .join(",");
  };

  const checkForMultipleStores = () => {
    if (orderwisePayment) {
      return;
    }

    const stores = uniqBy(
      (pendingOrdersData || [])
        .filter((r: any) => Number(r.PendingAmount))
        .map((o: any) => ({
          branchId: o.BranchID,
          name: o.StoreName,
        })),
      "branchId"
    );

    // console.log("STORES", JSON.stringify(stores));

    if (stores.length > 1) {
      setMultipleStore(true);
    } else {
      setMultipleStore(false);
    }
  };

  const getStores = () => {
    const result: any = [];

    const orders = groupBy(
      (pendingOrdersData || []).filter((r: any) => Number(r.PendingAmount)),
      (r: any) => String(r.BranchID)
    );

    Object.keys(orders).forEach((key) => {
      const store = {
        id: key,
        name: orders[key][0].StoreName,
        amount: sumBy(orders[key], (o: any) => parseFloat(o.PendingAmount)),
      };
      result.push(store);
    });

    return result;
  };

  const getPaymentVariables = (activePaymentMethod: any) => {
    return activePaymentMethod?.PaymentVariables.reduce(
      (a: any, { Key, Value }: any) => ({ ...a, [Key]: Value }),
      {}
    );
  };

  const handleRazorPay = () => {
    const grandTotal =
      finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value;

    if (grandTotal > 0) {
      let options = {
        description: `Order Number ${getOrderNumber()}`,
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

      // console.log(JSON.stringify(options));

      // @ts-ignore
      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // console.log(JSON.stringify(data));

          setLoading(true);
          paymentSuccess(
            paymentMethodId,
            grandTotal * 100,
            data.razorpay_payment_id
          );

          // alert(`Success: ${data.razorpay_payment_id}`);
        })
        .catch((error: any) => {
          // handle failure
          // console.log("ERROR: ", error?.description);

          setLoading(false);

          if (error && Platform.OS === "ios") {
            showToast(error?.description, 2500);
          } else {
            showToast(error?.error?.description, 2500);
          }
        });
    } else {
      paymentSuccess(paymentMethodId, grandTotal * 100, "");
    }
  };

  const handlePayTm = async () => {
    const grandTotal =
      finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value;

    if (grandTotal > 0) {
      const payload = {
        ClientID: clientId,
        BranchID: branchId,
        OrderNumber: getOrderNumber(),
        Amount: grandTotal?.toString(),
        CustomerCode: customerCode,
      };

      // console.log("PAYLOAD", JSON.stringify(payload));
      const response = await paytmPaymentSum(payload);

      // console.log("MID", paymentVariables?.MID);

      try {
        // console.log("PAYTTM PAYMENT SUM", { response });
        // console.log("PAYMENT VARIABLES", JSON.stringify(paymentVariables));

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
        //       console.log("PAYTM RRESULT", JSON.stringify(result));

        //       if (result?.response) {
        //         showToast(result?.response);
        //       }

        //       const { STATUS, RESPMSG, RESPCODE } = result;

        //       if (STATUS === "TXN_SUCCESS" && RESPCODE === "01") {
        //         paymentSuccess(
        //           paymentMethodId,
        //           grandTotal * 100,
        //           JSON.stringify(result)
        //         );
        //       } else if (STATUS === "PENDING") {
        //         showToast(RESPMSG, 3000);
        //       } else if (STATUS === "TXN_FAILURE") {
        //         showToast(RESPMSG, 3000);
        //       }
        //     })
        //     .catch((err) => {
        //       console.error(err);
        //     });
        // } else {
        //   showToast("Payment gateway error");
        // }
      } catch (e) {
        console.error(e);
      }
    } else {
      paymentSuccess(paymentMethodId, grandTotal * 100, "");
    }
  };

  const paytmPaymentSum = async (payload: any) => {
    let response: any;
    await defaultClient.paytmPaymentOrderID(payload).then((res: any) => {
      console.log("PAYTM RESPONSE", JSON.stringify(res));

      if (res) {
        response = res;
      }
    });

    return response;
  };

  const paymentSuccess = async (
    paymentMethodID: any,
    amount: any,
    ResponseData: any
  ) => {
    if (isProcessing) return;

    setIsProcessing(true);

    let payloads = [];

    let order = pendingOrdersData?.find((o: any) => o.OrderNo === orderNumber);
    let BranchID = selectedStore
      ? selectedStore?.id
      : order
      ? order?.BranchID
      : branchId;

    if (orderwisePayment) {
      payloads.push({
        ClientID: clientId,
        BranchID: BranchID,
        PaymentMethodID: paymentMethodID.toString(),
        ResponseData: ResponseData,
        OrderNumber: orderNumber,
        Amount: amount.toString(),
      });
    } else {
      payloads.push({
        ClientID: clientId,
        BranchID: BranchID,
        PaymentMethodID: paymentMethodID.toString(),
        ResponseData: ResponseData,
        OrderNumber: getOrderNumber(),
        Amount: amount.toString(),
      });
    }

    console.log("PAYLOADS", JSON.stringify(payloads));

    try {
      const res = await defaultClient.paymentResponse(payloads);

      console.log("PAYMENT RESPONSE API", JSON.stringify(res));

      if (res?.Message) {
        setLoading(false);
        showToast(res?.Message, 3000);
        setIsProcessing(false);
        return;
      }

      let couponId = couponRes?.validateCoupon?.coupon?.id;
      let discount = couponRes?.validateCoupon?.discount;
      let orderId = getOrderNumber();

      if (couponRes) {
        await redeemCoupon(
          couponId,
          discount,
          orderId,
          customerCode,
          branchId,
          finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value
        );
      }

      setValue(0);
      setSelectedStore(null);
      setMultipleStore(false);
      setLoading(false);

      // Construct transaction ID
      const stripeTxnId = publishableKey ? JSON.parse(ResponseData)?.id : "";
      const paytmTxnId = payTmKey ? JSON.parse(ResponseData)?.TXNID : "";
      const telrTxnId = telrKey ? JSON.parse(ResponseData)?.tranref : "";
      const amount =
        finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value;

      router.push({
        pathname: "/(app)/screens/payment/PaymentSuccessful",
        params: {
          amount: amount,
          currencyCode: storeDetails?.Currency,
          transactionId: razorpayKey
            ? ResponseData
            : payTmKey
            ? paytmTxnId
            : publishableKey
            ? stripeTxnId
            : telrKey
            ? telrTxnId
            : "",
        },
      });
    } catch (err) {
      console.error("Payment API Error", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setLoading(true);

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
      setLoading(false);
    } else if (storeId && telrKey) {
      showTelrPaymentPage();
      setLoading(false);
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

  const applyCoupon = () => {
    setCouponCode(null);
    setCouponError(null);
    setShowCouponModal(!showCouponModal);
  };

  const couponModalOnPress = () => {
    if (couponCode) {
      const orderAmount = value;
      validateCoupon(couponCode, orderAmount, customerCode);
    }
  };

  const validateCoupon = async (
    couponCode: string,
    orderAmount: number,
    customerCode: string
  ) => {
    // console.log({ couponCode, orderAmount, customerCode });

    if (couponCode && couponCode !== null) {
      setCouponLoading(true);

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_COUPONS_API_URL}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Org-Id": config.OrganizationId.toString(),
              "accept-language": i18n.language.toString(),
            },
            body: JSON.stringify({
              operationName: "validateCoupon",
              variables: {
                code: couponCode,
                orderAmount: Number(orderAmount),
                userId: customerCode,
              },
              query:
                "query validateCoupon($code: String!, $orderAmount: Float!, $userId: String!) {\n  validateCoupon(code: $code, orderAmount: $orderAmount, userId: $userId) {\n    discount\n    coupon{\n id\n title\n   description\n type\n value\n  }\n}\n}\n",
            }),
          }
        );
        const json = await response.json();

        const res = json;
        console.log("RES", JSON.stringify(res));

        if (res && res?.data !== null) {
          setCouponRes(res?.data);
          setShowCouponModal(false);
          setCouponLoading(false);
        } else {
          setCouponCode(null);
          setCouponError(res?.errors[0]?.message);
          setShowCouponModal(true);
          setCouponLoading(false);
          // showToast(res?.errors[0]?.message);
          // console.log("ERROR MSG", res?.errors[0]?.message);
        }
      } catch (error) {
        console.error(JSON.stringify(error));
        setCouponLoading(false);
      }
    }
  };

  const redeemCoupon = async (
    couponId: number,
    discount: number,
    orderId: string,
    userId: string,
    branchId: string,
    orderValue: number
  ) => {
    // console.log(couponId, discount, orderId, userId, branchId, orderValue);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_COUPONS_API_URL}`,
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
            operationName: "createCouponRedemption",
            variables: {
              data: {
                couponId: couponId,
                discount: discount,
                orderId: orderId,
                userId: userId,
                locationId: branchId || null,
                orderValue:
                  finalDueAmount === 0 || finalDueAmount
                    ? finalDueAmount
                    : value,
              },
            },
            query:
              "mutation createCouponRedemption($data: CouponRedemptionCreateInput!) {\n  createCouponRedemption(data: $data)\n}",
          }),
        }
      );
      const json = await response.json();

      const res = json;

      // console.log("API CALl");

      if (res && res?.data) {
        console.log("COUPON REEDEMED", res?.data);
      } else {
        console.log("COUPON REEDEM FAILED");
        showToast(res?.errors[0]?.message);
        console.log(res?.errors[0]?.message);
        // showToast(res?.errors[0]?.message);
        setCouponError(res?.errors[0]?.message);
      }
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  };

  const removeCoupon = () => {
    Alert.alert(
      "Coupon",
      "Are you sure you want to remove the coupon",
      [
        {
          text: "No",
          onPress: () => {
            console.log("Cancel");
          },
        },
        {
          text: "Yes",
          onPress: () => {
            setCouponCode(null);
            setCouponRes(null);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // const createReferalTransactionForOrder = async (amount: any) => {
  //   console.log({
  //     locationId: branchId,
  //     orderNumber: getOrderNumber(),
  //     orderValue: amount,
  //     referralId: Number(referralId),
  //   });

  //   try {
  //     const response = await fetch(
  //       `${process.env.EXPO_PUBLIC_REFERRAL_API_URL}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           "X-Org-Id":
  //             appConfig?.organizationId?.toString() ??
  //             config.OrganizationId.toString(),
  //         },
  //         body: JSON.stringify({
  //           operationName: "CreateReferralTransactionForOrder",
  //           variables: {
  //             data: {
  //               locationId: branchId,
  //               orderNumber: getOrderNumber(),
  //               orderValue: amount,
  //               referralId: Number(referralId),
  //             },
  //           },
  //           query:
  //             "mutation CreateReferralTransactionForOrder($data: ReferralTransactionOrderInput!) {\n  createReferralTransactionForOrder(data: $data) \n}",
  //         }),
  //       }
  //     );

  //     const json = await response.json();
  //     const res = json;

  //     console.log("CREATE REFERRAL TRANSACTION ORDER", JSON.stringify(res));

  //     const { data }: any = res;

  //     console.log("data", data);
  //   } catch (err) {
  //     console.log({ err });
  //   }
  // };

  const handleStripe = async () => {
    try {
      await initializePaymentSheet();
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  const initializePaymentSheet = async () => {
    setLoading(true);
    const grandTotal =
      finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value;

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

    const paymentDetailsResponse = await fetchStripePaymentDetails(result?.id);

    if (paymentDetailsResponse?.status === "succeeded") {
      await paymentSuccess(
        paymentMethodId,
        grandTotal * 100,
        JSON.stringify(paymentDetailsResponse)
      );
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

    let order = pendingOrdersData?.find((o: any) => o.OrderNo === orderNumber);

    let BranchID = selectedStore
      ? selectedStore?.id
      : order
      ? order?.BranchID
      : branchId;

    try {
      console.log({
        amount: Number(finalAmount),
        currency: storeDetails?.Currency ?? config.currency,
        email: email,
        clientId: clientId,
        branchId: BranchID,
        orderId: orderwisePayment ? orderNumber : getOrderNumber(),
      });

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
              branchId: BranchID,
              orderId: orderwisePayment ? orderNumber : getOrderNumber(),
            },
            query:
              "mutation createPaymentIntent(\n  $amount: Float!\n  $currency: String!\n  $email: String!\n  $branchId: String!\n  $clientId: String!\n  $orderId: [String!]!\n) {\n  createPaymentIntent(\n    amount: $amount\n    currency: $currency\n    email: $email\n    clientId: $clientId\n    branchId: $branchId\n    orderId: $orderId\n    ) {\n    id\n    currency\n    customerId\n    amountPayable\n    amountReceived\n    status\n    paymentIntentClientSecret\n    ephemeralKey\n    clientId\n    branchId\n    orderId\n  }\n}",
          }),
        }
      );
      const result = await response.json();

      console.log("payment intent result", JSON.stringify(result));

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

  const telrModalClose = () => {
    setTelrModalVisible(false);
    setLoading(false);
    Alert.alert("Transaction aborted by user");
  };

  const didFailWithError = (message: string) => {
    setTelrModalVisible(false);
    setLoading(false);
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

      // handleOrderCreation(JSON.stringify(response));

      const grandTotal =
        finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value;

      paymentSuccess(
        paymentMethodId,
        grandTotal * 100,
        JSON.stringify(response)
      );
    }
  };

  const showTelrPaymentPage = () => {
    const grandTotal =
      finalDueAmount === 0 || finalDueAmount ? finalDueAmount : value;

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
      tran_currency: "AED",
      tran_amount: grandTotal,
      tran_firstref: "",
      billing_name_title: "Mr",
      billing_name_first: user?.name,
      billing_name_last: user?.name,
      billing_address_line1: user?.address,
      billing_address_region: appConfig?.defaultCountry?.toLowerCase(),
      billing_address_country: "UAE",
      billing_custref: "001",
      billing_email: user?.email,
      // billing_email: "faridul.akthar@wesence.com",
      billing_phone: user?.phoneNumber,
    };
    console.log(paymentRequest);
    setPaymentRequest(paymentRequest);
    setTelrModalVisible(true);
  };

  if (multipleStore) {
    return (
      <StoreList
        stores={getStores()}
        currencyCode={storeDetails?.Currency}
        selectStore={setSelectedStore}
      />
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme="your-url-scheme">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            appConfig?.theme?.primaryColor ?? colors.primaryColor,
        }}
      >
        <Header />

        <View className="flex-1 bg-defaultWhite justify-center px-5 py-20">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">
              {t("payment.amount_due")}{" "}
            </Text>
            <Text className="text-xl font-bold">
              {formatCurrency(
                value ?? 0,
                storeDetails?.Currency ?? config.currency,
                Number(value) % 1 !== 0 ? 2 : 0
              )}
            </Text>
          </View>

          {/* COUPON FEATURE UNCOMMENDTED */}

          {/* {appConfig?.enableCoupon && orderwisePayment ? (
            <>
              {couponCode && couponRes ? (
                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <Text
                      numberOfLines={3}
                      className="text-sm font-bold max-w-80"
                    >
                      {t("payment.discount")} {couponRes?.validateCoupon?.coupon?.title}
                    </Text>

                    <Text className="text-xl font-bold">
                      -{" "}
                      {formatCurrency(
                        couponRes?.validateCoupon?.discount.toFixed(2) ?? 0,
                        storeDetails?.Currency ?? config.currency,
                        0
                      )}
                    </Text>
                  </View>
                  <Pressable
                    className="flex-row items-center"
                    onPress={removeCoupon}
                  >
                    <Icon name="close" color={colors.notificationBadgeColor} />
                    <Text className="text-sm font-bold  ml-2">
                      {t("payment.remove_coupon")}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={applyCoupon} className="mt-10">
                  <Text className="font-semibold">{t("payment.apply_coupon")}</Text>
                </Pressable>
              )}
            </>
          ) : null} */}

          {couponRes ? (
            <View className="mt-5">
              <Divider />
              <View className="flex-row items-center justify-between mt-5">
                <Text className="text-lg font-semibold">
                  {t("payment.final_amount_due")}{" "}
                </Text>
                <Text className="text-xl font-bold">
                  {formatCurrency(
                    finalDueAmount ?? 0,
                    storeDetails?.Currency ?? config.currency,
                    Number(finalDueAmount) % 1 !== 0 ? 2 : 0
                  )}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {appConfig?.disablePayment ? (
          <Pressable
            disabled={true}
            className="items-center justify-center py-6 bg-buttonColor"
          >
            <Text className="text-md font-bold color-defaultWhite capitalize">
              {t("payment.payment_disabled")}
            </Text>
          </Pressable>
        ) : (
          <>
            {value > 0 ? (
              <Pressable
                disabled={loading}
                onPress={onPress}
                className="items-center justify-center py-6 bg-buttonColor"
              >
                {!loading ? (
                  <Text className="text-md font-bold color-defaultWhite capitalize">
                    {t("payment.pay_now")}
                  </Text>
                ) : (
                  <CommonLoading />
                )}
              </Pressable>
            ) : (
              <></>
            )}
          </>
        )}

        {showCouponModal ? (
          <CouponModal
            open={showCouponModal}
            setOpen={setShowCouponModal}
            code={couponCode}
            setCode={setCouponCode}
            couponError={couponError}
            setCouponError={setCouponError}
            couponRes={couponRes}
            setCouponRes={setCouponRes}
            couponModalOnPress={couponModalOnPress}
            couponLoading={couponLoading}
          />
        ) : null}

        {/* <TelrSdk
          paymentRequest={paymentRequest}
          telrModalVisible={telrModalVisible}
          telrModalClose={telrModalClose}
          didFailWithError={didFailWithError}
          didPaymentSuccess={didPaymentSuccess}
        /> */}
      </SafeAreaView>
    </StripeProvider>
  );
};

export default AmountDueScreen;
