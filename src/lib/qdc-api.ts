import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import config from "../../config";
import { TOKEN } from "../context/UserProvider";
import i18n from "../i18n";

export class QDCAPI {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async makeRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data: any = undefined
  ) {
    this.token =
      "hJOnsVHYFUdEfxVyVUQkDbmV9SpivSLpFE/YrZAl3cBJU4CxaNU/zBVf9btDm+YBd0oEvIJp/QmnRepbQAqiixuYia3k8mrUKOO5reVFyIfNHwNirVF4kp4X39WRY0bE1E3IBo7KKbzpzoB35oPYbreqCC0E6E1sSDvtV0HjVwI=";

    AsyncStorage.getItem(TOKEN).then((value) => {
      if (value !== null) this.token = value;
    });
    console.log("====================================");
    console.log("CURRENT LANGUAGE", i18n.language.toString());
    console.log("====================================");
    const url = new URL(endpoint, this.baseUrl);
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "accept-language": i18n.language.toString(),
      },
    };

    if (data) {
      if (method === "GET") {
        Object.keys(data).forEach((key) => {
          url.searchParams.set(key, data[key]);
        });
      } else {
        options.body = JSON.stringify(data);
      }
    }

    if (this.token) {
      // @ts-ignore
      // console.log(this.token);
      options.headers["token"] = this.token;
    }

    try {
      // console.log({ url });
      // console.log({ options });

      const response = await fetch(url, options);
      const text = await response.text();
      // console.log("TEXT", text);
      const json = JSON.parse(text);

      return { json, response };
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  async getBaseAPIUrl(ClientID: string) {
    const { json: result } = await this.makeRequest(
      `APIBaseURL/${ClientID}`,
      "GET"
    );

    return result.APIBaseURL;
  }

  async getStoreDetails(slug: string) {
    const { json: result } = await this.makeRequest(
      "PackageNameClientID",
      "POST",
      { PackageName: slug }
    );

    const baseAPIUrl = await this.getBaseAPIUrl(result.ClientID);

    // console.log({ baseAPIUrl });

    this.setBaseUrl(baseAPIUrl);
    // this.setBaseUrl("https://api.quickdrycleaning.com/SubscriptionManagementTesting/");
    // this.setBaseUrl("https://api.quickdrycleaning.com/packageAPISubs/");

    return {
      clientId: result.ClientID,
      branchId: result.BranchID,
    };
  }

  async checkExistingUser(
    clientID: string,
    branchId: string,
    mobileNo: string
  ) {
    const { json: result } = await this.makeRequest(
      "CheckExistingCustomer",
      "GET",
      {
        ClientID: clientID,
        branchid: branchId,
        FaceBookID: "",
        EmailID: "",
        MobileNo: mobileNo,
      }
    );

    return result;
  }

  async getAuthorizationToken(
    clientID: string,
    branchId: string,
    customerCode: string
  ) {
    const data = await this.makeRequest("GetCustomerToken", "POST", {
      ClientID: clientID,
      BranchID: branchId,
      CustomerCode: customerCode,
    });
    const responseHeaders: Headers | undefined = data?.response?.headers;
    if (responseHeaders) {
      const tokenHeader = responseHeaders.get("token");
      if (tokenHeader) {
        this.token = tokenHeader;
      }
    }
    return data;
  }

  async generateOTP(clientID: string, branchId: string, customerCode: string) {
    const { json: result } = await this.makeRequest("ReSendOTP", "POST", {
      ClientID: clientID,
      BranchID: branchId,
      CustomerCode: customerCode,
    });

    return result;
  }

  async verifyOTP(
    otp: string,
    clientId: string,
    branchId: string,
    customerCode: string
  ) {
    const { json: result } = await this.makeRequest(
      `OTPCheck/${clientId}/${branchId}/${customerCode}/${otp}`,
      "GET"
    );

    return result;
  }

  async termsAndConditions(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `StoreAboutUsDetails/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async checkLocality(payload: any) {
    payload.PackageName = config.slug;

    // payload.PackageName = "ironout";
    // payload.PackageName = "SubscriptionManagement";
    // payload.Latitude = "28.6920307";
    // payload.Longitude = "77.1357094";

    const data = await this.makeRequest(
      `CODStoreLoginDetails`,
      "POST",
      payload
    );

    return data;
  }

  async RegisterNewCustomer(payload: any) {
    const payloadObj: any = {
      ClientID: payload.clientID,
      BranchID: payload.branchId,
      Name: payload.name,
      Address: payload.address,
      Mobile: payload.mobile,
      EmailId: payload.email,
      AreaLocation: payload.AreaLocation,
      Pincode: payload.pincode,
      Latitude: payload.latitude,
      Longitude: payload.longitude,
      SubLocality: "",
      FacebookID: "",

      CustomerSalutation: " ", // send space in salutation
      CustomerPriority: "0",
      DefaultDiscountRate: "0",
      Remarks: "",
      BirthDate: "",
      CommunicationMeans: "Both",
      MemberShipId: "",
      RateListId: "0",
      HomeDelivery: "False",
      CustomerRefferedBy: "",
      GSTIN: "",
      AnniversaryDate: "",
      StateID: "0",
    };

    if (Platform.OS === "ios") {
      payloadObj.DeviceToken = payload.fcmToken;
    } else {
      payloadObj.GCMKey = payload.fcmToken;
    }

    const data = await this.makeRequest("CustomerCreation", "POST", payloadObj);

    return data;
  }

  async homeBanners(clientID: string) {
    const payload = {
      ClientID: clientID,
    };

    const { json: result } = await this.makeRequest(
      "CODBannerDetails",
      "POST",
      payload
    );

    return result;
  }

  async serviceAndGarmentsPriceDetailsData(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `ServiceAndGarmentPriceDetailsData/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async serviceList(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `ServiceList/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async getMyOrders(ClientID: string, BranchID: string, CustomerCode: string) {
    const { json: result } = await this.makeRequest(
      `MyOrders/${ClientID}/${BranchID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async allActivePackageList(ClientID: string) {
    const { json: result } = await this.makeRequest(
      `AllActivePackageList/${ClientID}?PackageID=`,
      "GET"
    );

    return result;
  }

  async customerAvailablePackage(
    ClientID: string,
    BranchID: string,
    CustomerCode: string
  ) {
    const { json: result } = await this.makeRequest(
      `CustomerPackageAvailable/${ClientID}/${BranchID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async updateCustomerDetails(requestPayload: any) {
    const { json: result } = await this.makeRequest(
      "CustomerProfileUpdate",
      "POST",
      requestPayload
    );

    return result;
  }

  async pickupDates(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `PickUpDate/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async orderDeliveryDate(payload: any) {
    const { json: result } = await this.makeRequest(
      "OrderDeliveryDate",
      "POST",
      payload
    );

    return result;
  }

  async scheduleDetails(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `ScheduleDetails/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async schdedulePickup(payload: any) {
    const { json: result } = await this.makeRequest(
      "SchedulePickup",
      "POST",
      payload
    );

    return result;
  }

  async scheduleDropoff(payload: any) {
    const { json: result } = await this.makeRequest(
      "DropOffDateAndTime",
      "GET",
      payload
    );

    return result;
  }

  async cancelReasons(ClientID: string) {
    const { json: result } = await this.makeRequest(
      `CancelReason/${ClientID}`,
      "GET"
    );

    return result;
  }

  async cancelPickupReasons(ClientID: string) {
    try {
      const query = `
        query GetCancelPickupReasons {
          cancelPickupReasons {
            reason
          }
        }
      `;

      const variables = {};

      // console.log("Making GraphQL request for cancel pickup reasons...");
      // console.log("GraphQL Query:", query);
      // console.log("GraphQL Variables:", variables);

      const response = await fetch(
        "https://pickup-scheduler-api.quickdrycleaning.com/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Org-Id": config.OrganizationId.toString(),
            "accept-language": i18n.language.toString(),
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        }
      );

      const data = await response.json();

      // console.log("=== GRAPHQL CANCEL REASONS RESPONSE ===");
      // console.log("Response Status:", response.status);
      // console.log("Raw Response Data:", JSON.stringify(data, null, 2));
      // console.log("Response Errors:", data.errors);
      // console.log("Response Data:", data.data);
      // console.log("=== END GRAPHQL RESPONSE ===");

      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        throw new Error("GraphQL request failed");
      }

      return data.data?.cancelPickupReasons || [];
    } catch (error) {
      console.error("GraphQL cancel pickup reasons error:", error);
      throw error;
    }
  }

  async getCustomerActivePackages(ClientID: string, CustomerCode: string) {
    const { json: result } = await this.makeRequest(
      `CustomerActivePackages/${ClientID}/${CustomerCode}`
    );

    return result;
  }

  // Payment
  async activePaymentMethods(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `ActivePaymentMethodDetails/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async paymentResponse(payloads: any) {
    try {
      for (const payload of payloads) {
        const { json: result } = await this.makeRequest(
          `PaymentResponse`,
          "POST",
          payload
        );

        return result;
      }
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  async packageAssign(payload: any) {
    const { json: result } = await this.makeRequest(
      "PackageAssign",
      "POST",
      payload
    );

    return result;
  }

  async getCompletedOrders(ClientID: string, CustomerCode: string) {
    const { json: result } = await this.makeRequest(
      `CompletedOrderDetails/${ClientID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async getOrderDetails(
    ClientID: string,
    BranchID: string,
    OrderNumber: string
  ) {
    const { json: result } = await this.makeRequest(
      `OrderDetails/${ClientID}/${BranchID}/${OrderNumber}`,
      "GET"
    );

    return result;
  }

  async getPriceList(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `NewServicePriceList/${ClientID}/${BranchID}`,
      "POST"
    );

    return result;
  }

  async getAppFeedbackReasons(ClientID: string) {
    const { json: result } = await this.makeRequest(
      `AppFeedbackReason/${ClientID}`
    );

    return result;
  }

  async sendFeedback(payload: any) {
    const { json: result } = await this.makeRequest(
      "Feedback",
      "POST",
      payload
    );

    return result;
  }

  async accountDeletion(payload: any) {
    const { json: result } = await this.makeRequest(
      `DeleteCustomer`,
      "POST",
      payload
    );

    return result;
  }

  async customerSummary(
    ClientID: string,
    BranchID: string,
    CustomerCode: string
  ) {
    const { json: result } = await this.makeRequest(
      `CustomerSummary/${ClientID}/${BranchID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async storeAboutDetails(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `StoreAboutUsDetails/${ClientID}/${BranchID}`
    );

    return result;
  }

  async getPickups(ClientID: string, BranchID: string, CustomerCode: string) {
    const { json: result } = await this.makeRequest(
      `MyRequset/${ClientID}/${BranchID}/${CustomerCode}`
    );

    return result;
  }

  async getDropoffs(ClientID: string, BranchID: string, CustomerCode: string) {
    const { json: result } = await this.makeRequest(
      `CustomerDropOffRequest/${ClientID}/${BranchID}/${CustomerCode}`
    );

    return result;
  }

  async getPushNotification(
    ClientID: string,
    BranchID: string,
    CustomerCode: string
  ) {
    const { json: result } = await this.makeRequest(
      `PushNotification/${ClientID}/${BranchID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async paytmCheckSum(payload: any) {
    const { json: result } = await this.makeRequest(
      "PaytmCheckSum",
      "POST",
      payload
    );

    return result;
  }

  async paytmPaymentOrderID(payload: any) {
    const { json: result } = await this.makeRequest(
      "PaytmPaymentOrderID",
      "POST",
      payload
    );

    return result;
  }

  async paytmPackageSaleOrderID(payload: any) {
    const { json: result } = await this.makeRequest(
      "PaytmPackageSaleOrderID",
      "POST",
      payload
    );

    return result;
  }

  async updateNonServicableArea(payload: any) {
    const { json: result } = await this.makeRequest(
      "UpdateNonServiceableArea",
      "POST",
      payload
    );

    return result;
  }

  async updateGCM(payload: any) {
    const { json: result } = await this.makeRequest(
      "UpdateGCM",
      "POST",
      payload
    );

    return result;
  }

  async storeDetails(ClientID: any, BranchID: any) {
    const { json: result } = await this.makeRequest(
      `Store/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  // order creation
  async bookingConfiguration(ClientID: string, BranchID: string) {
    const { json: result } = await this.makeRequest(
      `BookingConfiguration/${ClientID}/${BranchID}`,
      "GET"
    );

    return result;
  }

  async customerActivePackages(ClientID: string, CustomerCode: string) {
    const { json: result } = await this.makeRequest(
      `CustomerActivePackages/${ClientID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async orderCreation(payload: any) {
    const { json: result } = await this.makeRequest(
      "OrderCreate",
      "POST",
      payload
    );

    return result;
  }

  async LaundryCreateOrder(payload: any) {
    const { json: result } = await this.makeRequest(
      "LaundryCreateOrder",
      "POST",
      payload
    );

    return result;
  }

  async CustomerPackageAvailableServiceDetails(
    ClientID: string,
    BranchID: string,
    CustomerCode: string
  ) {
    const { json: result } = await this.makeRequest(
      `CustomerPackageAvailableServiceDetails/${ClientID}/${BranchID}/${CustomerCode}`,
      "GET"
    );

    return result;
  }

  async bookingDiscountAndTax(payload: any) {
    const { json: result } = await this.makeRequest(
      "BookingDiscountAndTax",
      "POST",
      payload
    );

    return result;
  }

  async minOrderAmount(ClientID: string) {
    const { json: result } = await this.makeRequest(
      `MinimumOrderAmountData/${ClientID}`,
      "GET"
    );

    return result;
  }
}

const defaultClient = new QDCAPI(config.apiBase);

export default defaultClient;
