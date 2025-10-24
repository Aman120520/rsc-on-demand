import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";
import defaultClient from "../../../../lib/qdc-api";
import moment from "moment";
import CancelPickup from "../../../../components/schedule/CancelPickup";
import RazorpayCheckout from "react-native-razorpay";
import config from "../../../../../config";
import LoadingScreen from "../../../LoadingScreen";
import { useUser } from "@/src/context/UserProvider";
import { useCart } from "@/src/context/CartProvider";
import { formatCurrency, showToast } from "@/src/utils/CommonFunctions";
import { colors } from "@/src/styles/theme";
import { ARROW_LEFT, ARROW_RIGHT, BACK_ARROW_BLACK } from "@/src/icons/svg";
import PickupAndDelivery from "@/src/components/checkout/PickupAndDelivery";
import OrderSummary from "./OrderSummary";
import SuccessfulCheckout from "./SuccessfulCheckout";
import { useStripe } from "@stripe/stripe-react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useStore } from "@/src/context/StoreProvider";
import { useAppConfig } from "@/src/context/ConfigProvider";
import CouponScreen from "./CouponScreen";
// import TelrSdk from "@telrsdk/rn-telr-sdk";
import axios from "axios";
import PaylaterSheet from "./paylaterSheet";
import { defineAnimation } from "react-native-reanimated";
import ValidationModal from "@/src/components/checkout/ValidationModal";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";
// import DeviceInfo from "react-native-device-info";

// const deviceId = DeviceInfo.getUniqueId();

const CheckoutScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { storeDetails } = useStore();

  // contextAPI
  const { setAppConfig, appConfig } = useAppConfig();
  const { user, clientId, branchId, customerCode, referralId } = useUser();
  const {
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
    netAmount,
    setNetAmount,
    expressAmount,
    setExpressAmount,
    taxAmount,
    setTaxAmount,
  }: any = useCart();

  // useState

  const isRtl = i18n.dir() === "rtl";
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Pickup & Delivery Details");
  const [buttonText, setButtonText] = useState("Continue");
  const [btnLoading, setBtnLoading] = useState(false);

  // bookingConfig
  const [dates, setDate] = useState<any>([]);
  const [bookingConfig, setBookingConfig] = useState<any>(null);

  // Pickup and delivery state
  const [loading, setLoading] = useState<any>(false);
  const [pickupDate, setPickupDate] = useState<any>(null);
  const [pickupTime, setPickupTime] = useState<any>(null);
  const [deliveryDate, setDeliveryDate] = useState<any>(null);
  const [deliveryTime, setDeliveryTime] = useState<any>(null);
  const [deliveryNotes, setDeliveryNotes] = useState(null);
  const [expressDeliveryData, setExpressDeliveryData] = useState<any>(null);
  // const [expressDelivery, setExpressDelivery] = useState<any>(null);

  // review order state
  const [reviewNotes, setReviewNotes] = useState("");
  const [garmentsOnHanger, setGarmentsOnHanger] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);

  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [activePackagesData, setActivePackagesData] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Payment
  const [razorpayKey, setRazorpayKey] = useState<string | null>("");
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

  const [publishableKey, setPublishableKey] = useState("");

  const [telrModalVisible, setTelrModalVisible] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [telrKey, setTelrKey] = useState<string | null>(null);

  // coupons
  const [couponCode, setCouponCode] = useState(null);
  const [couponRes, setCouponRes] = useState<any | null>(null);
  const [couponError, setCouponError] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponRemainingAmount, setCouponRemainingAmount] = useState(0);
  const [couponLoadingState, setCouponLoadingState] = useState(false);

  const [couponValidForCleaningService, setCouponValidForCleaningService] =
    useState(false);
  const [couponValidForLaundryService, setCouponValidForLaundryService] =
    useState(false);

  const [splitValueOne, setSplitValueOne] = useState<any>(null);
  const [splitValueTwo, setSplitValueTwo] = useState<any>(null);

  const [couponValueForCleaningService, setCouponValueForCleaningService] =
    useState<number | null>(null);
  const [couponValueForLaundryService, setCouponValueForLaundryService] =
    useState<number | null>(null);

  const [showPaylater, setShowPaylater] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  // useEffect
  useEffect(() => {
    setLoading(true);
    if (clientId && branchId && customerCode) {
      defaultClient
        .bookingConfiguration(clientId, branchId)
        .then(async (res: any) => {
          // console.log("Booking Config", JSON.stringify(res));
          if (res) {
            // const pickup = moment(`${res?.BookingDate}`, "DD MMM YYYY");
            // setPickupDate({
            //   date: moment(pickup).format("DD MMM YYYY"),
            //   dateLabel: pickup,
            // });
            // setPickupTime({ time: res?.DefaultTime });

            const delivery = moment(`${res?.DeliveryDate}`, "DD MMM YYYY");
            setDeliveryDate({
              date: moment(delivery).format("DD MMM YYYY"),
              dateLabel: delivery,
            });
            // setDeliveryTime({ time: res?.DefaultTime });

            setBookingConfig(res);
            setLoading(false);
          }
        });

      defaultClient.pickupDates(clientId, branchId).then((res: any) => {
        // console.log("PICKUP DATES", JSON.stringify(res));
        const pickup = moment(`${res?.[0]?.PickUpDate}`, "DD MMM YYYY");
        setPickupDate({
          date: moment(pickup).format("DD MMM YYYY"),
          dateLabel: pickup,
        });
        setPickupTime({ time: res?.[0]?.PickUpTime?.[0]?.Slots });

        setDate(res);
      });

      defaultClient.scheduleDetails(clientId, branchId).then((res: any) => {
        // console.log("EXPRESS", JSON.stringify(res));

        if (res?.ShowExpressService === "True") {
          getUrgentOptions(res);
        }
      });

      defaultClient
        .customerActivePackages(clientId, customerCode)
        .then((res) => {
          // console.log("Active Packages", JSON.stringify(res));
          setActivePackagesData(res);
        });
    }
  }, [isFocused, clientId, branchId, customerCode]);

  useEffect(() => {
    if (pickupDate) {
      const payload = {
        ClientID: clientId,
        BranchID: branchId,
        BookingDate: pickupDate?.date,
        ExpressDeliveryId: expressDelivery && expressDelivery?.id,
      };
      defaultClient.orderDeliveryDate(payload).then((res: any) => {
        const delivery = moment(`${res?.DeliveryDate}`, "DD MMM YYYY");
        setDeliveryDate({
          date: res?.DeliveryDate,
          dateLabel: delivery,
        });
      });
    }
  }, [pickupDate, expressDelivery]);

  useEffect(() => {
    setExpressDelivery(null);
    setExpressAmount(null);
    setExpressDeliveryData(null);
    setTaxAmount(0);
    setNetAmount(0);
    setCleaningExpressAmount(0);
    setLaundryExpressAmount(0);
  }, [isFocused]);

  let couponAmountValue = couponRes?.validateCoupon?.discount;
  let isCouponValidForCleaningService = false;
  let isCouponValidForLaundryService = false;

  let splitValue1: any = null;
  let splitValue2: any = null;

  useEffect(() => {
    let processCodeDetails: any = [];

    if (bookingConfig && serviceItems && serviceItems?.length > 0) {
      // check the services is available to calculate the taxes.
      const hasCleaningService = serviceItems?.find(
        (item: any) => !item.isLaundryService
      );

      const hasLaundryService = serviceItems?.find(
        (item: any) => item?.isLaundryService
      );

      // Filter services
      const cleaningServices = serviceItems.filter(
        (item: any) => !item.isLaundryService
      );

      const laundryServices = serviceItems.filter(
        (item: any) => item.isLaundryService
      );

      // Get Cart Total for Each Services
      const cleaningTotal = chooseServiceForCoupon(cleaningServices);
      const laundryTotal = chooseServiceForCoupon(laundryServices);

      let couponValueAmount = couponRes?.validateCoupon?.discount;

      if (cleaningTotal >= couponValueAmount) {
        console.log("COUPON APPLIED FOR CLEANING ORDER");

        setCouponValidForCleaningService(true);
        setCouponValidForLaundryService(false);

        isCouponValidForCleaningService = true;
        isCouponValidForLaundryService = false;
      } else if (laundryTotal >= couponValueAmount) {
        console.log("COUPON APPLIED FOR LAUNDRY ORDER");
        setCouponValidForCleaningService(false);
        setCouponValidForLaundryService(true);

        isCouponValidForLaundryService = true;
        isCouponValidForCleaningService = false;
      } else if (
        couponAmountValue > cleaningTotal &&
        couponAmountValue > laundryTotal
      ) {
        console.log("SPLIT COUPON VALUE FOR MULTIPLE ORDERS");

        setCouponLoadingState(true);

        setCouponValidForCleaningService(true);
        setCouponValidForLaundryService(true);

        isCouponValidForCleaningService = true;
        isCouponValidForLaundryService = true;

        const { cleaningCoupon, laundryCoupon, remainingCoupon } =
          distributeCoupon(cleaningTotal, laundryTotal, couponAmountValue);

        // console.log({ cleaningCoupon }, { laundryCoupon }, { remainingCoupon });

        setCouponValueForCleaningService(cleaningCoupon);
        setCouponValueForLaundryService(laundryCoupon);

        const { finalA, finalB, totalAmount } =
          splitCouponAmountForMultipleOrders(
            cleaningTotal,
            laundryTotal,
            couponValueAmount
          );

        splitValue1 = finalA;
        splitValue2 = finalB;

        setSplitValueOne(finalA);
        setSplitValueTwo(finalB);
        // console.log({ finalA }, { finalB }, { totalAmount });
      }

      const getTaxAmountFunction = async () => {
        setCouponLoadingState(true);
        if (hasCleaningService) {
          // Check for express delivery services.
          if (expressDelivery) {
            // Apply percentage for each garment and return the sum of total value
            const result = await calculateTotalValueForExpress(
              cleaningServices,
              expressDelivery?.rate
            );

            if (result) {
              setCleaningExpressAmount(Number(result));
            } else {
              setCleaningExpressAmount(0);
            }

            processCodeDetails = await calculateTotalAmountWithPercentage(
              cleaningServices,
              expressDelivery?.rate
            );
          } else {
            // Calculate total amount for each cleaning service
            // With Coupon
            if (
              isCouponValidForCleaningService &&
              couponRes &&
              couponRes !== null
            ) {
              processCodeDetails = cleaningServices.map((service: any) => {
                const totalAmount = service.garmentDetails.reduce(
                  (acc: any, garment: any) => {
                    return acc + garment.quantity * parseFloat(garment.price);
                  },
                  0
                );

                return {
                  ProcessCode: service.processCode,
                  TotalAmount:
                    splitValue1 !== null && splitValue1 >= 0
                      ? splitValue1
                      : totalAmount,
                };
              });

              let remainingCoupon = couponRes?.validateCoupon?.discount;

              processCodeDetails = processCodeDetails.map(
                (service: any, index: any) => {
                  let { TotalAmount } = service;
                  if (remainingCoupon <= 0) {
                    return service; // No coupon left to apply
                  }

                  // If it's the first service and its TotalAmount is greater than remaining coupon
                  if (index === 0 && TotalAmount > remainingCoupon) {
                    TotalAmount -= remainingCoupon;
                    remainingCoupon = 0; // Coupon fully used
                  } else {
                    // Apply coupon to the service as much as possible
                    if (TotalAmount <= remainingCoupon) {
                      remainingCoupon -= TotalAmount;
                      TotalAmount = 0; // Service amount is fully discounted
                    } else {
                      TotalAmount -= remainingCoupon;
                      remainingCoupon = 0; // Coupon fully used
                    }
                  }

                  return { ProcessCode: service.ProcessCode, TotalAmount };
                }
              );
            } else {
              // Without Coupon
              processCodeDetails = cleaningServices.map((service: any) => {
                const totalAmount = service.garmentDetails.reduce(
                  (acc: any, garment: any) => {
                    return acc + garment.quantity * parseFloat(garment.price);
                  },
                  0
                );

                return {
                  ProcessCode: service.processCode,
                  TotalAmount: totalAmount,
                };
              });
            }
          }

          // console.log(
          //   "CLEANING PROCESS CODE",
          //   JSON.stringify(processCodeDetails)
          // );

          if (bookingConfig && processCodeDetails) {
            const payload = {
              ClientId: clientId,
              BranchId: branchId,
              DiscountRate: "0",
              TaxType: bookingConfig?.InclusiveExclusive,
              IsDiscountTypeFlat: "False",
              ProcessCodeDetails: processCodeDetails,
            };

            const taxValue = await taxCalculation(payload);

            let originalValue = Number(taxValue);

            let formattedValue = originalValue.toFixed(2);

            setCleaningTaxAmount(formattedValue);
          }
        } else {
          setCleaningTaxAmount(0);
        }

        if (hasLaundryService) {
          // Check for Express delivery services
          if (expressDelivery) {
            // Apply percentage for each garment and return the sum of total value

            const result = await calculateTotalValueForExpress(
              laundryServices,
              expressDelivery?.rate
            );

            if (result) {
              setLaundryExpressAmount(Number(result));
            } else {
              setLaundryExpressAmount(0);
            }

            processCodeDetails = await calculateTotalAmountWithPercentage(
              laundryServices,
              expressDelivery?.rate
            );
          } else {
            // Calculate total amount for each laundry service
            // With coupon
            if (
              isCouponValidForLaundryService &&
              couponRes &&
              couponRes !== null
            ) {
              processCodeDetails = laundryServices.map((service: any) => {
                const totalAmount = service.garmentDetails.reduce(
                  (acc: any, garment: any) => {
                    return acc + garment.quantity * parseFloat(garment.price);
                  },
                  0
                );

                // console.log({
                //   ProcessCode: service.processCode,
                //   TotalAmount: splitValue2
                //     ? splitValue2
                //     : totalAmount
                // });

                return {
                  ProcessCode: service.processCode,
                  TotalAmount:
                    splitValue2 !== null && splitValue2 >= 0
                      ? splitValue2
                      : totalAmount,
                };
              });

              let remainingCoupon = couponRes?.validateCoupon?.discount;

              processCodeDetails = processCodeDetails.map(
                (service: any, index: any) => {
                  let { TotalAmount } = service;
                  if (remainingCoupon <= 0) {
                    return service; // No coupon left to apply
                  }

                  // If it's the first service and its TotalAmount is greater than remaining coupon
                  if (index === 0 && TotalAmount > remainingCoupon) {
                    TotalAmount -= remainingCoupon;
                    remainingCoupon = 0; // Coupon fully used
                  } else {
                    // Apply coupon to the service as much as possible
                    if (TotalAmount <= remainingCoupon) {
                      remainingCoupon -= TotalAmount;
                      TotalAmount = 0; // Service amount is fully discounted
                    } else {
                      TotalAmount -= remainingCoupon;
                      remainingCoupon = 0; // Coupon fully used
                    }
                  }

                  return { ProcessCode: service.ProcessCode, TotalAmount };
                }
              );
            } else {
              // without coupon
              processCodeDetails = laundryServices.map((service: any) => {
                const totalAmount = service.garmentDetails.reduce(
                  (acc: any, garment: any) => {
                    return acc + garment.quantity * parseFloat(garment.price);
                  },
                  0
                );
                return {
                  ProcessCode: service.processCode,
                  TotalAmount: totalAmount,
                };
              });
            }
          }

          // console.log(
          //   "LAUNDRY PROCESS CODE",
          //   JSON.stringify(processCodeDetails)
          // );

          if (bookingConfig && processCodeDetails) {
            const payload = {
              ClientId: clientId,
              BranchId: branchId,
              DiscountRate: "0",
              TaxType: bookingConfig?.InclusiveExclusive,
              IsDiscountTypeFlat: "False",
              ProcessCodeDetails: processCodeDetails,
            };

            // console.log("LAUNDRY TAX PAYLOAD", JSON.stringify(payload));

            const taxValue = await taxCalculation(payload);

            let originalValue = Number(taxValue);

            let formattedValue = originalValue.toFixed(2);

            setLaundryTaxAmount(formattedValue);
          }
        } else {
          setLaundryTaxAmount(0);
        }

        setTimeout(() => {
          setCouponLoadingState(false);
        }, 500);
      };

      getTaxAmountFunction();
    }
  }, [bookingConfig, serviceItems, expressDelivery, cartTotal, couponRes]);

  // console.log({ cleaningTaxAmount });
  // console.log({ laundryTaxAmount });
  // console.log({ taxAmount });

  // AMOUNT CALCULATION FOR CLEANIGN ORDERS
  useEffect(() => {
    setCleaningNetAmount(Number(cleaningCartTotal) + Number(cleaningTaxAmount));
  }, [cleaningCartTotal, cleaningTaxAmount]);

  // AMOUNT CALCULATION FOR LAUNDRY ORDERS
  useEffect(() => {
    setLaundryNetAmount(Number(laundryCartTotal) + Number(laundryTaxAmount));
  }, [laundryCartTotal, laundryTaxAmount]);

  // TOTAL AMOUNT CALCULCATION FOR PAYMENT GATEWAY
  useEffect(() => {
    let totalTaxAmount = Number(cleaningTaxAmount) + Number(laundryTaxAmount);

    if (totalTaxAmount > 0) {
      return setTaxAmount(totalTaxAmount.toFixed(2));
    } else {
      setTaxAmount(0);
    }
  }, [cleaningTaxAmount, laundryTaxAmount, isFocused]);

  useEffect(() => {
    let totalExpressAmount =
      Number(cleaningExpressAmount) + Number(laundryExpressAmount);

    setExpressAmount(totalExpressAmount.toFixed(2));
  }, [cleaningExpressAmount, laundryExpressAmount]);

  useEffect(() => {
    // if (expressDelivery === null) {
    //   setExpressAmount(0);
    // }

    if (expressDelivery && expressAmount) {
      if (couponRes && couponAmountValue) {
        let totalNetAmountWithExpressAmount =
          Number(cartTotal) +
          Number(expressAmount) +
          Number(taxAmount) -
          Number(couponAmountValue);

        if (bookingConfig?.IsNetAmountDecimal === "True") {
          setNetAmount(totalNetAmountWithExpressAmount.toFixed(2));
        } else {
          setNetAmount(Math.round(totalNetAmountWithExpressAmount).toFixed(2));
        }
      } else {
        let totalNetAmountWithExpressAmount =
          Number(cartTotal) + Number(expressAmount) + Number(taxAmount);
        setNetAmount(totalNetAmountWithExpressAmount.toFixed(2));

        if (bookingConfig?.IsNetAmountDecimal === "True") {
          setNetAmount(totalNetAmountWithExpressAmount.toFixed(2));
        } else {
          setNetAmount(Math.round(totalNetAmountWithExpressAmount).toFixed(2));
        }
      }
    } else {
      if (couponRes && couponAmountValue) {
        let totalNetAmount =
          Number(cartTotal) + Number(taxAmount) - Number(couponAmountValue);

        if (totalNetAmount > 0) {
          return bookingConfig?.IsNetAmountDecimal === "True"
            ? setNetAmount(totalNetAmount.toFixed(2))
            : setNetAmount(Math.round(totalNetAmount).toFixed(2));
        } else {
          setNetAmount(0);
        }

        // setNetAmount(Math.round(totalNetAmount).toFixed(2));
      } else {
        let totalNetAmount = Number(cartTotal) + Number(taxAmount);

        if (bookingConfig?.IsNetAmountDecimal === "True") {
          setNetAmount(totalNetAmount.toFixed(2));
        } else {
          setNetAmount(Math.round(totalNetAmount).toFixed(2));
        }
      }
    }
  }, [
    cartTotal,
    taxAmount,
    expressAmount,
    expressDelivery,
    isFocused,
    couponRes,
  ]);

  useEffect(() => {
    setStep(0);
    setTitle(t("checkout.pickup_delivery_details"));
    setButtonText("Continue");
  }, [isFocused]);

  useEffect(() => {
    switch (step) {
      case 0:
        setTitle(t("checkout.pickup_delivery_details"));
        setButtonText(t("common.continue"));
        break;
      case 1:
        setTitle(t("orders.order_summary"));
        setButtonText(
          netAmount > 0 ? t("common.continue") : t("common.continue")
        );
        break;
      default:
        setTitle(t("checkout.pickup_delivery_details"));
        setButtonText(t("common.continue"));
    }
  }, [step, buttonText, netAmount]);

  useEffect(() => {
    // If no items in cart navigate the user to catalogue screen
    if (serviceItems && serviceItems?.length === 0) {
      setCouponRes(null);
      setCouponCode(null);
      setExpressDelivery(false);
      router.push("/screens/catalouge/CatalougeScreen");
    }
  }, [serviceItems]);

  useEffect(() => {
    // Razorpay keys
    defaultClient.activePaymentMethods(clientId, branchId).then((res: any) => {
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
  }, []);

  useEffect(() => {
    if (couponCode === null) {
      setCouponValidForCleaningService(false);
      setCouponValidForLaundryService(false);
      splitValue1 = null;
      splitValue2 = null;
      setSplitValueOne(null);
      setSplitValueTwo(null);
    }
  }, [couponCode]);

  useEffect(() => {
    setCouponRes(null);
    setCouponCode(null);
  }, [serviceItems]);

  // Functions
  const onPress = async () => {
    switch (step) {
      case 0:
        setStep(1);
        break;
      case 1:
        if (appConfig?.disablePayment) {
          showToast(t("checkout.payment_disabled"));
          setBtnLoading(false);
          return;
        }

        const isValid = await isMinOrderAmountValid();
        if (!isValid) {
          setLoading(false);
          return;
        }

        if (appConfig?.enablePaylater) {
          setShowPaylater(true);
          setBtnLoading(false);
          return;
        }

        payOnline();

        // if (razorpayKey) {
        //   handleRazorPay();
        // } else if (publishableKey) {
        //   handleStripe();
        // } else if (storeId && telrKey) {
        //   showTelrPaymentPage();
        // } else {
        //   Alert.alert("Payment Gateway Not Found.", "Try Again Later");
        //   setLoading(false);
        // }
        break;

      default:
        setStep(0);
    }
  };

  const onBackPress = () => {
    switch (step) {
      case 0:
        // router navigation
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/(app)/screens/catalouge/CatalougeScreen");
        break;
      case 1:
        setStep(0);
        break;
      case 2:
        setStep(1);
        break;
      case 3:
        setStep(2);
        break;
      case 4:
        setStep(1);
        break;
      default:
        setStep(0);
    }
  };

  let pickupNumber = "";

  const schedulePickupFn = async (): Promise<string> => {
    const payload: Object = {
      ClientID: clientId,
      BranchID: branchId,
      CustomerCode: customerCode,
      PickupDate: pickupDate?.date,
      PickupTime: pickupTime?.time,
      ExpressDeliveryID: expressDelivery?.id,
      PickUpNumber: " ",
      Flag: 1,
      PickUpSource: "CODApp",
      Services: "",
      SpecialInstruction: getOrderNotes(),
    };

    // console.log("pickup payload", JSON.stringify(payload));

    try {
      const res: any = await defaultClient.schdedulePickup(payload);
      console.log("PICKUP SCHEDULE COMPLETED", JSON.stringify(res));

      if (res?.Status === "False") {
        showToast(res?.Reason, 3000);
        showToast(t("checkout.chagne_pickup_date_time"), 3000);
        setLoading(false);
        setBtnLoading(false);
        return res?.Status;
      }

      pickupNumber = res?.Status;

      return res?.Status ?? "Unknown";
    } catch (error) {
      console.error("Error scheduling pickup", error);
      showToast(t("static_messages.error_occurred_scheduling"));
      setLoading(false);
      setBtnLoading(false);
      return "Error";
    }
  };

  let orderIdsArr: any = [];

  const handleOrderCreation = async (paymentResponse: any) => {
    if (btnLoading) return;
    setBtnLoading(true);

    const hasLaundryOrder = serviceItems?.some(
      (service: any) => service?.isLaundryService
    );

    const hasDryCleanOrder = serviceItems?.some(
      (service: any) => !service?.isLaundryService
    );

    try {
      let orderIds: string[] = [];

      if (hasLaundryOrder) {
        const laundryOrderIds = await handleLaundryOrderCreation();
        orderIds.push(...laundryOrderIds);
      }

      if (hasDryCleanOrder) {
        const dryCleanOrderIds = await handleDryCleanOrderCreation();
        orderIds.push(...dryCleanOrderIds);
      }

      if (publishableKey) {
        return { ...orderIds };
      }

      if (paymentResponse !== "0" && orderIdsArr?.length > 0) {
        const result = await paymentSuccess(
          paymentMethodId,
          netAmount * 100,
          paymentResponse
        );

        if (result) {
          resetOrderState();
          showToast(t("checkout.payment_successful"));
        }
      } else if (paymentResponse === "0" && orderIdsArr?.length > 0) {
        resetOrderState();
        showToast(t("checkout.order_created"));
      }
    } catch (error: any) {
      console.error(`Error during API calls: ${error.message}`);
      // Alert.alert(error.message);
      setBtnLoading(false);
    }

    return orderIdsArr;
  };

  const resetOrderState = () => {
    setBtnLoading(false);
    setServiceItems(null);
    setPaymentFailed(false);
    setDeliveryNotes(null);
    setExpressDelivery(null);
    setExpressAmount(null);
    setExpressDeliveryData(null);
    setCleaningTaxAmount(0);
    setLaundryTaxAmount(0);
    setTaxAmount(0);
    setNetAmount(0);
    setSplitValueOne(null);
    setSplitValueTwo(null);
    setCouponValueForCleaningService(null);
    setCouponValueForLaundryService(null);
    setCouponRes(null);
    setStep(2);
  };

  // For Dry cleaning service
  const handleDryCleanOrderCreation = async () => {
    // console.log("DRY CLEAN API FUNCTION CALLED");

    const serviceDetails = serviceItems
      ?.map((item: any) => {
        if (!item?.isLaundryService) {
          const garmentDetails = item?.garmentDetails?.map((garment: any) => {
            return {
              ItemId: garment?.id,
              ItemName: garment?.name,
              ItemQuantity: String(garment?.quantity),
              ItemTotal: expressDelivery
                ? String(
                  garment?.quantity *
                  Number(
                    Number(garment?.price) +
                    Number((garment?.price * expressDelivery?.rate) / 100)
                  )
                )
                : String(garment?.quantity * garment?.price),

              ItemRate: expressDelivery
                ? Number(garment?.price) +
                Number((garment?.price * expressDelivery?.rate) / 100)
                : garment?.price,
              ItemUnitType: garment?.unit,
              ItemDesc: "",
              brands: [],
              defects: [],
              colors: [],
              topUp: [],
            };
          });

          let newArr = {
            ProcessCode: item?.processCode,
            GarmentDetails: garmentDetails,
          };

          return newArr;
        }
      })
      .filter(Boolean);

    const finalCartTotal =
      expressDelivery && cleaningExpressAmount
        ? Number(Number(cleaningCartTotal) + Number(cleaningExpressAmount))
        : couponValidForCleaningService
          ? Number(cleaningCartTotal)
          : Number(cleaningCartTotal);

    const splitCouponTotal =
      Number(cleaningCartTotal) -
      Number(splitValueOne) +
      Number(cleaningTaxAmount);

    const finalNetAmount =
      expressDelivery && cleaningExpressAmount
        ? Number(
          Number(cleaningCartTotal) +
          Number(cleaningExpressAmount) +
          Number(cleaningTaxAmount)
        )
        : splitValueOne && splitValueOne >= 0
          ? splitCouponTotal
          : couponValidForCleaningService
            ? Number(cleaningCartTotal) -
            Number(couponAmountValue) +
            Number(cleaningTaxAmount)
            : Number(cleaningNetAmount);

    // console.log("SERVCIES DETAILS", JSON.stringify(serviceDetails));

    const payload = {
      ClientId: clientId,
      BranchId: branchId,
      CustomerCode: customerCode,
      BookingDate: new Date(),
      BookingDeliveryDate: deliveryDate?.date,
      BookingDeliveryTime: bookingConfig?.DefaultTime,
      UserName: "CustomerApp",
      TotalCost: finalCartTotal,
      TaxAmount: cleaningTaxAmount,
      NetAmount:
        bookingConfig?.IsNetAmountDecimal === "True"
          ? finalNetAmount?.toFixed(2)
          : Math.round(finalNetAmount),
      OrderNotes: getOrderNotes(),
      TaxType: bookingConfig?.InclusiveExclusive,
      ItemTotalQuantity: "1",
      HomeDelivery: "0",
      WorkshopNote: "",
      PaymentMode: "Online",
      AdvanceAmount: "",
      AdvanceRemark: "",
      CustomerSignature: "",
      ServiceDetails: serviceDetails,
      IsUrgent: expressDelivery ? true : false,
      PkgAssignID: selectedPackage ? selectedPackage?.AssignID : "",
      PickUpNumberCheckout: pickupNumber,
      couponId:
        couponRes && couponValidForCleaningService
          ? couponRes?.validateCoupon?.coupon?.id
          : "",
      couponCode: couponCode && couponValidForCleaningService ? couponCode : "",
      DiscountRate:
        couponRes?.validateCoupon?.coupon?.type === "PERCENTAGE" &&
          couponValidForCleaningService
          ? couponRes?.validateCoupon?.coupon?.value.toString()
          : "0",
      DiscountAmt:
        couponValueForCleaningService !== null
          ? couponValueForCleaningService
          : couponRes && couponValidForCleaningService
            ? couponRes?.validateCoupon?.discount
            : "0",
      DiscountOption:
        couponRes?.validateCoupon?.coupon?.type === "PERCENTAGE" &&
          couponValidForCleaningService
          ? "0"
          : "1",
    };

    // console.log("CLEANING ORDER PAYLOAD", JSON.stringify(payload, null, 2));

    if (payload) {
      await defaultClient
        .orderCreation(payload)
        .then((res: any) => {
          // console.log("DRY CLEANING ORDER CREATION", JSON.stringify(res));
          if (res?.status === "True") {
            // getOrdersId(res?.message);

            let id = res?.message;

            orderIdsArr.push({ id });
          } else {
            // setStep(2);
            setBtnLoading(false);
            showToast(t("static_messages.order_creation_failed"), 2500);
          }
        })
        .catch((err: any) => {
          setBtnLoading(false);
          // console.log(JSON.stringify(err));
          showToast(err?.Message);
        });
    }

    return orderIdsArr;
  };

  // console.log({ splitValue1 }, { splitValue2 });
  // console.log({ splitValueOne }, { splitValueTwo });

  // For Laundry Services
  const handleLaundryOrderCreation = async () => {
    // console.log("LAUNDRY API FUNCTION CALLED");

    const laundryOrderDetails = await serviceItems
      ?.map((service: any) => {
        if (service?.isLaundryService) {
          const laundry = service?.garmentDetails[0];

          // If Express delivery it'll apply on this servicePrice with it's respective amount.
          return {
            ServiceName: laundry?.serviceName,
            ServiceCode: laundry?.serviceCode,
            ServicePrice: expressDelivery
              ? Number(laundry?.price) +
              Number((laundry?.price * expressDelivery?.rate) / 100)
              : laundry?.price,
            Weight: String(laundry?.quantity),
            TotalQty: String(laundry?.quantity),
          };
        }
      })
      .filter(Boolean);

    // console.log("LAUNDRY ORDER DETAILS", JSON.stringify(laundryOrderDetails));

    const finalCartTotal =
      expressDelivery && laundryExpressAmount
        ? Number(Number(laundryCartTotal) + Number(laundryExpressAmount))
        : // : couponValidForLaundryService
        // ? Number(laundryCartTotal) - Number(couponAmountValue)
        Number(laundryCartTotal);

    const splitCouponTotal =
      Number(laundryCartTotal) -
      Number(splitValueTwo) +
      Number(laundryTaxAmount);

    const finalNetAmount =
      expressDelivery && laundryExpressAmount
        ? Number(
          Number(laundryCartTotal) +
          Number(laundryExpressAmount) +
          Number(laundryTaxAmount)
        )
        : splitValueTwo && splitValueTwo >= 0
          ? splitCouponTotal
          : couponValidForLaundryService
            ? Number(laundryCartTotal) -
            Number(couponAmountValue) +
            Number(laundryTaxAmount)
            : Number(laundryNetAmount);

    const laundryServicePayload = {
      ClientId: clientId,
      BranchId: branchId,
      CustomerCode: customerCode,
      BookingDate: new Date(),
      BookingDeliveryDate: deliveryDate?.date,
      BookingDeliveryTime: bookingConfig?.DefaultTime,
      UserId: "CustomerApp",
      TotalCost: finalCartTotal,
      TaxAmount: laundryTaxAmount,
      NetAmount:
        bookingConfig?.IsNetAmountDecimal === "True"
          ? finalNetAmount?.toFixed(2)
          : Math.round(finalNetAmount),
      TaxType: bookingConfig?.InclusiveExclusive,
      OrderNotes: getOrderNotes(),
      PaymentMode: "Online",
      WorkshopNote: "",
      IsUrgent: expressDelivery ? true : false,
      orderDetails: laundryOrderDetails,
      PickUpNumberCheckout: pickupNumber,
      couponId:
        couponRes && couponValidForLaundryService
          ? couponRes?.validateCoupon?.coupon?.id
          : "",
      couponCode: couponCode && couponValidForLaundryService ? couponCode : "",
      DiscountRate:
        couponRes?.validateCoupon?.coupon?.type === "PERCENTAGE" &&
          couponValidForLaundryService
          ? couponRes?.validateCoupon?.coupon?.value.toString()
          : "0",
      DiscountAmt:
        couponValueForLaundryService !== null
          ? couponValueForLaundryService
          : couponRes && couponValidForLaundryService
            ? couponRes?.validateCoupon?.discount
            : "0",
      DiscountOption:
        couponRes?.validateCoupon?.coupon?.type === "PERCENTAGE" &&
          couponValidForLaundryService
          ? "0"
          : "1",
    };

    // console.log(
    //   "LAUNDRY PAYLOAD",
    //   JSON.stringify(laundryServicePayload, null, 2)
    // );

    if (laundryServicePayload) {
      await defaultClient
        .LaundryCreateOrder(laundryServicePayload)
        .then((res: any) => {
          // console.log(
          //   "LAUNDRY ORDER CREATION RESPONSE",
          //   JSON.stringify(res, null, 2)
          // );
          if (res?.Message) {
            showToast(`LAUNDRY ORDER: ${res?.Message}`);
          }

          if (res?.ResponseCode === "OK") {
            // getOrdersId(res?.BookingNo);
            let id = res?.BookingNo;
            orderIdsArr.push({ id });
          } else {
            setBtnLoading(false);
            showToast(t("static_messages.order_creation_failed"), 2500);
          }
        })
        .catch((err) => {
          setBtnLoading(false);
          console.log(JSON.stringify(err));
        });
    }

    return orderIdsArr;
  };

  const getOrderNotes = () => {
    let notes = "";

    if (deliveryNotes) {
      notes += deliveryNotes;
    }

    if (garmentsOnHanger) {
      if (notes) {
        notes += ", ";
      }
      notes += "Deliver Garments on hanger";
    }

    return notes;
  };

  const getOrderNumber = () => {
    if (orderIdsArr?.length > 0) {
      // console.log(JSON.stringify(orderIdsArr));

      return orderIdsArr.map((order: any) => order.id).join(", ");
    }
  };

  const getUrgentOptions = (scheduleDetails: any) => {
    const { ExpressDelivery1, ExpressDelivery2 } = scheduleDetails;

    let result = [ExpressDelivery1, ExpressDelivery2]
      .reduce(
        (a, c) => [
          ...a,
          ...c?.map((o: any) => ({
            id: o.Key,
            label: o.Value,
            value: o.Key,
            rate: o.Rate,
            isSelected: false,
          })),
        ],
        []
      )
      .filter((o: any) => o.label !== "" && o.value !== "");

    if (result) {
      return setExpressDeliveryData(result);
    }
  };

  const calculateTotalAmountWithPercentage = async (
    serviceItems: any,
    percentageRate: any
  ) => {
    let result = [];

    for (const serviceItem of serviceItems) {
      let totalAmount = 0;

      for (const garmentDetail of serviceItem?.garmentDetails) {
        const garmentTotal =
          garmentDetail?.price *
          garmentDetail?.quantity *
          (1 + percentageRate / 100);

        totalAmount += garmentTotal;
      }

      // result.push({
      //   ProcessCode: serviceItem.processCode,
      //   TotalAmount: totalAmount.toFixed(2),
      // });

      if (couponRes && couponRes !== null) {
        result.push({
          ProcessCode: serviceItem.processCode,
          TotalAmount:
            totalAmount - couponRes?.validateCoupon?.discount.toFixed(2),
        });
      } else {
        result.push({
          ProcessCode: serviceItem.processCode,
          TotalAmount: totalAmount.toFixed(2),
        });
      }
    }

    return result;
  };

  const calculateTotalValueForExpress = async (
    serviceItems: any,
    percentageRate: any
  ) => {
    let totalIncreasedAmount = 0;

    serviceItems?.forEach((serviceItem: any) => {
      const { garmentDetails } = serviceItem;

      const serviceItemIncreasedAmount = garmentDetails?.reduce(
        (total: any, garment: any) => {
          const garmentPrice = parseFloat(garment?.price);
          const quantity = parseInt(garment?.quantity);

          const increasedPrice =
            garmentPrice + (garmentPrice * percentageRate) / 100;

          const garmentIncreasedAmount =
            (increasedPrice - garmentPrice) * quantity;

          return total + garmentIncreasedAmount;
        },
        0
      );

      totalIncreasedAmount += serviceItemIncreasedAmount;
    });

    // Return the final total increased amount
    return totalIncreasedAmount;
  };

  const taxCalculation = async (payload: any) => {
    let tax: string = "";

    await defaultClient
      .bookingDiscountAndTax(payload)
      .then((res: any) => {
        // console.log("Booking Discount and Tax", JSON.stringify(res));
        if (res) {
          tax = res?.TaxAmount;
        }
      })
      .catch((err: any) => { });

    return tax;
  };

  const handleRazorPay = () => {
    let options = {
      // description: `Order Number ${getOrderNumber()}`,
      description: "",
      key: razorpayKey,
      currency: "INR",
      amount: Number(Math.round(netAmount * 100)),
      name: appConfig?.appName ?? config.appName?.toLowerCase(),
      prefill: {
        email: user?.email,
        contact: user?.phoneNumber,
        name: user?.name,
      },
      theme: { color: appConfig?.theme?.primaryColor ?? colors.primaryColor },
    };

    if (netAmount > 0) {
      // @ts-ignore
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // console.log(JSON.stringify(data));

          // handle success

          if (data) {
            handleOrderCreation(data.razorpay_payment_id);
          }
        })
        .catch((error: any) => {
          // handle failure
          setLoading(false);
          setBtnLoading(false);
          // setServiceItems(null);
          // setPaymentFailed(true);
          // setExpressDelivery(false);
          setStep(1);
          if (error && Platform.OS === "ios") {
            showToast(error?.description, 3000);
          } else {
            showToast(error?.error?.description, 3000);
          }
        });
    } else {
      handleOrderCreation("0");
    }
  };

  const paymentSuccess = async (
    PaymentMethodID: any,
    amount: any,
    ResponseData: any
  ) => {
    // console.log("PAYMENT RESPONSE API IS CALLING");

    const payloads = [
      {
        ClientID: clientId,
        BranchID: branchId,
        PaymentMethodID: PaymentMethodID.toString(),
        OrderNumber: getOrderNumber(),
        ResponseData: ResponseData,
        Amount: Math.round(amount).toString(),
      },
    ];

    // console.log("PAYMENT RESEPONSE PAYLOAD:", JSON.stringify(payloads));

    try {
      const res = await defaultClient.paymentResponse(payloads);
      console.log("PAYMENT RESPONSE API", JSON.stringify(res));

      let couponId = couponRes?.validateCoupon?.coupon?.id;
      let discount = couponRes?.validateCoupon?.discount;
      let orderId = getOrderNumber();

      if (couponRes) {
        await redeemCoupon(couponId, discount, orderId, customerCode);
      }

      setLoading(false);
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(JSON.stringify(couponRes));

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
              "X-Org-Id":
                appConfig?.organizationId?.toString() ??
                config.OrganizationId.toString(),
              "accept-language": i18n.language.toString(),
            },
            body: JSON.stringify({
              operationName: "validateCoupon",
              variables: {
                code: couponCode,
                orderAmount: Number(orderAmount),
                userId: customerCode,
                locationId: Number(branchId),
              },
              query:
                "query validateCoupon(\n  $code: String!\n  $locationId: BigInt\n  $orderAmount: Float!\n  $userId: String!\n) {\n  validateCoupon(\n    code: $code\n    locationId: $locationId\n    orderAmount: $orderAmount\n    userId: $userId\n  ) {\n    coupon {\n      title\n      description\n      type\n      value\n    }\n    discount\n  }\n}",
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
          setStep(1);
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
    userId: string
  ) => {
    // console.log({
    //   couponId: couponId,
    //   discount: discount,
    //   orderId: orderId,
    //   userId: userId,
    //   locationId: branchId || null,
    //   orderValue: Number(cartTotal),
    // });

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
                orderValue: Number(cartTotal),
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
        console.log("COUPON REDEEM SUCCESS");
      } else {
        console.log("COUPON REDEEM FAIL");

        // showToast(res?.errors[0]?.message);
        setCouponError(res?.errors[0]?.message);
      }
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  };

  const chooseServiceForCoupon = (serviceArr: any) => {
    // This function will reutrn the grand total amount of all services
    let totalAmount = 0;
    serviceArr.forEach((service: any) => {
      const serviceTotal = service?.garmentDetails?.reduce(
        (acc: any, garment: any) =>
          acc + garment.quantity * parseFloat(garment.price),
        0
      );
      totalAmount += serviceTotal;
    });
    return totalAmount;
  };

  const couponModalOnPress = (code: string) => {
    if (couponCode || code) {
      const orderAmount = cartTotal;
      validateCoupon(couponCode ?? code, orderAmount, customerCode);
    }
  };

  const splitCouponAmountForMultipleOrders = (
    cleaningTotal: any,
    laundryTotal: any,
    couponAmount: any
  ) => {
    let remainingCoupon = couponAmount;

    // Apply the coupon to variable cleaningTotal first
    if (remainingCoupon >= cleaningTotal) {
      remainingCoupon -= cleaningTotal;
      cleaningTotal = 0;
    } else {
      cleaningTotal -= remainingCoupon;
      remainingCoupon = 0;
    }

    // Apply any remaining coupon to variable laundryTotal
    if (remainingCoupon > 0) {
      if (remainingCoupon >= laundryTotal) {
        laundryTotal = 0;
      } else {
        laundryTotal -= remainingCoupon;
      }
    }

    // Calculate the total amount after applying the coupon
    const totalAmount = cleaningTotal + laundryTotal;
    return { finalA: cleaningTotal, finalB: laundryTotal, totalAmount };
  };

  const distributeCoupon = (
    cleaningAmount: any,
    laundryAmount: any,
    couponAmount: any
  ) => {
    // Apply coupon to cleaning amount first
    let cleaningCoupon = Math.min(cleaningAmount, couponAmount);
    let remainingCoupon = couponAmount - cleaningCoupon;

    // Apply the remaining coupon to laundry amount
    let laundryCoupon = Math.min(laundryAmount, remainingCoupon);
    remainingCoupon -= laundryCoupon;

    return {
      cleaningCoupon: parseFloat(cleaningCoupon.toFixed(2)),
      laundryCoupon: parseFloat(laundryCoupon.toFixed(2)),
      remainingCoupon: parseFloat(remainingCoupon.toFixed(2)),
    };
  };

  const handleStripe = async () => {
    try {
      if (netAmount > 0) {
        const result = await handleOrderCreation("0");

        if (result) {
          await initializePaymentSheet();
        }
      } else {
        await handleOrderCreation("0");

        setServiceItems(null);
        setBtnLoading(false);
        setPaymentFailed(false);
        setDeliveryNotes(null);
        setExpressDelivery(null);

        setExpressAmount(null);
        setExpressDeliveryData(null);
        setCleaningTaxAmount(0);
        setLaundryTaxAmount(0);
        setTaxAmount(0);
        setNetAmount(0);
        splitValue1 = null;
        splitValue2 = null;
        setSplitValueOne(null);
        setSplitValueTwo(null);
        setCouponValueForCleaningService(null);
        setCouponValueForLaundryService(null);
        setCouponRes(null);
        setStep(2);
        showToast(t("static_messages.order_created"));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setBtnLoading(false);
    }
  };

  const initializePaymentSheet = async () => {
    setLoading(true);

    const result = await createPaymentIntent(netAmount, user?.email);

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
      setBtnLoading(false);
      showToast(error.message);
      return;
    }

    // It will open stripe payment sheet
    await openPaymentSheet();

    const paymentDetailsResponse = await fetchStripePaymentDetails(result?.id);

    if (paymentDetailsResponse?.status === "succeeded") {
      const result = await paymentSuccess(
        paymentMethodId,
        netAmount * 100,
        JSON.stringify(paymentDetailsResponse)
      );

      if (result) {
        setServiceItems(null);
        setBtnLoading(false);
        setPaymentFailed(false);
        setDeliveryNotes(null);
        setExpressDelivery(null);

        setExpressAmount(null);
        setExpressDeliveryData(null);
        setCleaningTaxAmount(0);
        setLaundryTaxAmount(0);
        setTaxAmount(0);
        setNetAmount(0);
        splitValue1 = null;
        splitValue2 = null;
        setSplitValueOne(null);
        setSplitValueTwo(null);
        setCouponValueForCleaningService(null);
        setCouponValueForLaundryService(null);
        setCouponRes(null);
        setStep(2);
        showToast(t("checkout.payment_successful"));
      } else {
        setServiceItems(null);
        setBtnLoading(false);
        setPaymentFailed(false);
        setDeliveryNotes(null);
        setExpressDelivery(null);

        setExpressAmount(null);
        setExpressDeliveryData(null);
        setCleaningTaxAmount(0);
        setLaundryTaxAmount(0);
        setTaxAmount(0);
        setNetAmount(0);
        splitValue1 = null;
        splitValue2 = null;
        setSplitValueOne(null);
        setSplitValueTwo(null);
        setCouponValueForCleaningService(null);
        setCouponValueForLaundryService(null);
        setCouponRes(null);
        setStep(2);
        showToast(t("checkout.order_created"));
      }
    }

    setLoading(false);
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      setLoading(false);
      setBtnLoading(false);
      showToast(error.message);
    } else {
      showToast(t("checkout.order_created"), 2000);
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
              orderId: getOrderNumber(),
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

  const telrModalClose = () => {
    setTelrModalVisible(false);
    setBtnLoading(false);
    Alert.alert(t("checkout.transition_aborted"));
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

      handleOrderCreation(JSON.stringify(response));
    }
  };

  const showTelrPaymentPage = () => {
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
      tran_amount: netAmount,
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

  const payOnline = async () => {
    setShowPaylater(false);
    setLoading(true);

    const status = await schedulePickupFn();

    if (status === "False") {
      console.log("Schedule Pickup failed.");
      setLoading(false);
      setBtnLoading(false);
      return;
    }

    if (razorpayKey) {
      handleRazorPay();
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

  const payLater = async () => {
    setShowPaylater(false);

    setLoading(true);

    const status = await schedulePickupFn();

    if (status === "False") {
      console.log("Schedule Pickup Failed.");
      setLoading(false);
      return;
    }

    handleOrderCreation("0");
  };

  const isMinOrderAmountValid = async (): Promise<boolean> => {
    try {
      const res = await defaultClient.minOrderAmount(clientId);
      // For testing:
      // const res = {
      //   IsMinimumOrderAmountActive: "False",
      //   MinimumOrderAmountValue: "500",
      //   MinimumOrderAmountMessage: "This is test message",
      // };

      if (!res) {
        return true;
      }

      if (res?.IsMinimumOrderAmountActive === "False") {
        return true;
      }

      const grossAmount = expressDelivery
        ? Number(expressAmount) + Number(cartTotal)
        : Number(cartTotal);

      if (Number(grossAmount) >= Number(res?.MinimumOrderAmountValue)) {
        return true;
      } else {
        setValidationData(res);
        setShowValidation(true);
        // showToast(res?.MinimumOrderAmountMessage, 3000);
        return false;
      }
    } catch (error) {
      console.error("Error validating minimum order amount:", error);
      return false;
    }
  };

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme="your-url-scheme">
      <SafeAreaView
        pointerEvents={couponLoadingState ? "none" : "auto"}
        style={[
          {
            width: "100%",
            height: "100%",
            backgroundColor: colors.defaultWhite,
            opacity: couponLoadingState ? 0.5 : 1,
          },
        ]}
      >
        {step !== 2 ? (
          <>
            <Pressable onPress={onBackPress} style={styles.header}>
              <SvgXml xml={BACK_ARROW_BLACK} />
            </Pressable>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-md font-semibold mt-1 px-5 color-defaultBlack capitalize ">
                {title}
              </Text>
            </View>
            {step === 4 && (
              <Text className="text-md font-medium mt-1 px-5 text-gray-600 capitalize w-[50%]">
                {t("checkout.your_cart")}{" "}
                {`${formatCurrency(
                  cartTotal,
                  storeDetails?.Currency,
                  cartTotal % 1 !== 0 ? 2 : 0
                )}`}
              </Text>
            )}
          </>
        ) : null}

        {/* Pickup */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.defaultWhite,
          }}
        >
          {step === 0 ? (
            <PickupAndDelivery
              calendarData={dates}
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
              pickupTime={pickupTime}
              setPickupTime={setPickupTime}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              deliveryTime={deliveryTime}
              setDeliveryTime={setDeliveryTime}
              expressDelivery={expressDelivery}
              setExpressDelivery={setExpressDelivery}
              deliveryNotes={deliveryNotes}
              setDeliveryNotes={setDeliveryNotes}
              garmentsOnHanger={garmentsOnHanger}
              setGarmentsOnHanger={setGarmentsOnHanger}
              expressDeliveryData={expressDeliveryData}
              setExpressDeliveryData={setExpressDeliveryData}
              fetching={loading}
            />
          ) : step === 1 ? (
            <OrderSummary
              expressDelivery={expressDelivery}
              pickupDate={pickupDate}
              pickupTime={pickupTime}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
              deliveryNotes={deliveryNotes}
              reviewNotes={reviewNotes}
              setReviewNotes={setReviewNotes}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              activePackagesData={activePackagesData}
              showPackagePopup={showPackagePopup}
              setShowPackagePopup={setShowPackagePopup}
              setStep={setStep}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponRes={couponRes}
              setCouponRes={setCouponRes}
              couponError={couponError}
              setCouponError={setCouponError}
              showCouponModal={showCouponModal}
              setShowCouponModal={setShowCouponModal}
              couponModalOnPress={couponModalOnPress}
              couponLoading={couponLoading}
              showPaylater={showPaylater}
              setShowPaylater={setShowPaylater}
            />
          ) : step === 2 ? (
            <SuccessfulCheckout
              pickupDate={pickupDate}
              setStep={setStep}
              failure={paymentFailed}
              pickupTime={pickupTime}
            />
          ) : step === 3 ? (
            <CancelPickup
              setCancelReason={setCancelReason}
              onClose={() => {
                setStep(0);
              }}
            />
          ) : step === 4 ? (
            <>
              <CouponScreen
                open={showCouponModal}
                setOpen={setShowCouponModal}
                giftCardCode={couponCode}
                setGiftCardCode={setCouponCode}
                couponError={couponError}
                setCouponError={setCouponError}
                couponRes={couponRes}
                setCouponRes={setCouponRes}
                couponModalOnPress={couponModalOnPress}
                couponLoading={couponLoading}
                cartTotal={cartTotal}
                setStep={setStep}
              />
            </>
          ) : (
            <></>
          )}
        </View>

        {/* Button */}
        {step !== 2 && step !== 4 ? (
          <View
            style={[
              {
                paddingVertical: Platform.OS === "android" ? 15 : 0,
              },
            ]}
            className="flex flex-col items-center justify-center py-2"
          >
            <Pressable
              disabled={btnLoading}
              onPress={onPress}
              style={[
                styles.btn,
                {
                  backgroundColor:
                    appConfig?.theme?.buttonColor ?? colors.buttonColor,
                },
              ]}
            >
              {btnLoading ? (
                <ActivityIndicator color={colors.defaultWhite} />
              ) : // <>
                //   <Text
                //     className="text-[14] font-bold"
                //     style={[{ color: colors.defaultWhite }]}
                //   >
                //     {buttonText}
                //   </Text>
                //   <SvgXml
                //     style={{ marginTop: 3, marginLeft: 12 }}
                //     xml={ARROW_RIGHT}
                //   />
                // </>
                isRtl ? (
                  <>
                    <Text
                      className="text-[14] font-bold"
                      style={[{ color: colors.defaultWhite }]}
                    >
                      {buttonText}
                    </Text>
                    <SvgXml
                      style={{ marginTop: 3, marginLeft: 12 }}
                      xml={ARROW_LEFT}
                    />
                  </>
                ) : (
                  <>
                    <Text
                      className="text-[14] font-bold"
                      style={[{ color: colors.defaultWhite }]}
                    >
                      {buttonText}
                    </Text>
                    <SvgXml
                      style={{ marginTop: 3, marginLeft: 12 }}
                      xml={ARROW_RIGHT}
                    />
                  </>
                )}
            </Pressable>
          </View>
        ) : null}

        {/* {activePackagesData?.length > 0 && step === 1 && showPackagePopup ? (
        <PackagePopup
          data={activePackagesData}
          open={showPackagePopup}
          setOpen={setShowPackagePopup}
          selectedPackage={selectedPackage}
          setSelectedPackage={setSelectedPackage}
        />
      ) : null} */}

        {/* <TelrSdk
          paymentRequest={paymentRequest}
          telrModalVisible={telrModalVisible}
          telrModalClose={telrModalClose}
          didFailWithError={didFailWithError}
          didPaymentSuccess={didPaymentSuccess}
        /> */}

        {showPaylater && (
          <PaylaterSheet
            open={showPaylater}
            setOpen={setShowPaylater}
            onPayLater={payLater}
            onPayOnline={payOnline}
          />
        )}

        {showValidation ? (
          <ValidationModal
            open={showValidation}
            setOpen={setShowValidation}
            onClick={() => {
              setLoading(false);
              setBtnLoading(false);
              setShowValidation(false);
            }}
            amount={Number(validationData?.MinimumOrderAmountValue ?? 0)}
          />
        ) : null}
      </SafeAreaView>
    </StripeProvider>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navTitle: {},
  btn: {
    width: 244,
    height: 46,
    borderRadius: 30,
    backgroundColor: colors.buttonColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
});
