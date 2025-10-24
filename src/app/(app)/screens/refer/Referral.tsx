import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import config from "@/config";
import Header from "@/src/components/Header";
import { useUser } from "@/src/context/UserProvider";
import { colors } from "@/src/styles/theme";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Share from "react-native-share";
import CommonLoading from "@/src/components/CommonLoading";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { Image } from "expo-image";
import { imageHeight, imageWidth } from "@/src/components/Banner";
import TermsModal from "@/src/components/referral/TermsModal";
import Svg, { Path } from "react-native-svg";
import { formatCurrency, showToast } from "@/src/utils/CommonFunctions";
import { useStore } from "@/src/context/StoreProvider";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const Referral = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const { setAppConfig, appConfig } = useAppConfig();
  const { user, clientId, branchId, customerCode } = useUser();
  const { storeDetails } = useStore();

  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>("");
  const [referralData, setReferralData] = useState<any>(null);
  const [policyData, setPolicyData] = useState<any>(null);
  const [termsModal, setTermsModal] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState<any>(null);

  const appName = appConfig?.appName ?? config.appName?.toLowerCase();
  const referralURL = `tumbledry://refer/${referralCode}`;

  const slug = config.slug.toLowerCase();

  const testflightLink = `https://testflight.apple.com/join/DRgzQdum/${slug}/${referralCode}`;

  const testingURL = `https://referral.quickdrycleaning.com/${slug}/${referralCode}`;

  useEffect(() => {
    getReferralCode();
    getReferralPrivacy();
  }, [isFocused]);

  const getReferralCode = async () => {
    setLoading(true);
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
              externalId: customerCode,
            },
            query:
              "query Referral($externalId: String) {\n    referral(externalId: $externalId) {\n    code\n    externalId\n    locationId\n    referrer {\n      id\n      code\n    }\n    referrerId\n    transactions {\n      policyId\n    }\n    statistics {\n      id\n      totalReferrals\n      successfulReferrals\n      rewardEarned\n      rewardRedeemed\n      rewardBalance\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      console.log("ReferralCodeData", JSON.stringify(data));

      if (data?.referral) {
        setReferralCode(data?.referral?.code);
        setReferralData(data?.referral);
        setLoading(false);
      } else {
        setLoading(false);
        createNewReferralCode(customerCode);
      }

      return data?.referral?.code;
    } catch (err) {
      console.log({ err });
      setLoading(false);
    }
  };

  const createNewReferralCode = async (customerCode: any) => {
    // console.log({ customerCode });
    setLoading(true);
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
              locationId: parseInt(branchId),
            },
            query:
              "mutation createReferral (\n    $locationId: Float!\n    $externalId: String!\n    $referralCode: String\n) {\n    createReferral(\n    data: {\n    locationId: $locationId\n    externalId: $externalId\n    referralCode: $referralCode\n    }\n  ) {\n    id\n    code\n    referrer {\n      code\n    }\n    referrerId\n    locationId\n    transactions {\n      policyId\n    }\n    statistics {\n      id\n      totalReferrals\n      successfulReferrals\n      rewardEarned\n      rewardRedeemed\n      rewardBalance\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      console.log("createNewReferralCode", { data });

      if (data?.createReferral) {
        let code = data?.createReferral?.code;

        setReferralCode(code);
        setReferralData(data?.createReferral);
        setLoading(false);
      } else {
        setLoading(false);
        showToast(t("static_messages.error_create_referral"), 2000);
      }
    } catch (err) {
      console.log({ err });
      setLoading(false);
    }
  };

  const getReferralPrivacy = async () => {
    setLoading(true);
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
            operationName: "referralPolicies",
            variables: {
              where: {
                organizationId: { equals: config.OrganizationId.toString() },
              },
            },
            query:
              "query referralPolicies(\n    $first: PositiveInt\n    $where: ReferralPolicyWhereInput\n) {\n  referralPolicies(first: $first, where: $where) {\n    edges {\n      node {\n        id\n        active\n        imageUrl\n        messageTemplate\n        referrerRewardDescription\n        refereeRewardDescription\n        refereeReward\n        referrerReward\n        termsAndConditions\n      }\n    }\n    pageInfo {\n      hasNextPage\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      // console.log("referralPolicies", JSON.stringify(data));

      if (data?.referralPolicies) {
        setPolicyData(data?.referralPolicies?.edges[0]?.node);
        setMessageTemplate(
          data?.referralPolicies?.edges[0]?.node?.messageTemplate
        );
        setLoading(false);
      } else {
        showToast(t("static_messages.error_getting_referral_policies"));
        setLoading(false);
      }
    } catch (err) {
      console.log({ err });
      setLoading(false);
    }
  };

  const message = messageTemplate
    ?.replace("{{referreeReward}}", policyData.refereeReward)
    ?.replace(/{{code}}/g, referralCode)
    ?.replace(/:slug/, slug)
    ?.replace(/:code/, referralCode);

  // Testflight URL for testing
  // message?.replace(/https?:\/\/[^\s]+/, testflightLink);

  // const message = testflightLink;

  console.log({ message });

  const onPress = () => {
    const options = Platform.select({
      ios: {
        activityItemSources: [
          {
            // For sharing url with custom title.
            placeholderItem: { type: "url", content: testingURL },
            item: {
              default: { type: "text", content: message },
            },
            subject: {
              default: message,
            },
          },
          // {
          //   // For sharing text.
          //   placeholderItem: { type: "text", content: message },
          //   item: {
          //     default: { type: "text", content: message },
          //     message: null, // Specify no text to share via Messages app.
          //   },
          //   linkMetadata: {
          //     // For showing app icon on share preview.
          //     title: "Refer a Friend",
          //   },
          // },
        ],
      },

      default: {
        subject: "Refer a Friend",
        message: `${message}`,
      },
    });

    // @ts-ignore
    Share.open(options);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: appConfig?.theme?.primaryColor ?? colors.primaryColor,
      }}
    >
      <Header />
      {loading ? (
        <View className="flex-1 bg-defaultWhite justify-center">
          <CommonLoading />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-gray-100"
        >
          <View className="items-center justify-center bg-defaultWhite py-2">
            <Text className="text-lg font-md text-black text-center">
              {t("referral.refer_earn")}
            </Text>
            <View className="bg-buttonColor h-0.5 w-20 my-2.5"></View>
          </View>

          <Image
            // source={require("../../../../assets/banners/referral-banner.jpg")}
            source={policyData?.imageUrl}
            placeholder={"blurhash"}
            contentFit="cover"
            transition={1000}
            style={[
              {
                height: imageHeight - 40,
                width: imageWidth,
              },
            ]}
          />

          <View className="flex flex-row items-center justify-between bg-defaultWhite py-4">
            <View className="py-4  w-1/2">
              <Text className="text-lg text-center font-semibold">
                {referralData?.statistics?.totalReferrals ?? 0}
              </Text>
              <Text className="text-sm text-[#6A6A6A] mt-2 text-center font-normal">
                {t("referral.no_referrals")}
              </Text>
            </View>

            <View className="h-full w-[1px] bg-gray-300"></View>

            <View className="py-4  w-1/2">
              <Text className="text-lg text-center font-semibold">
                {formatCurrency(
                  referralData?.statistics?.rewardEarned ?? 0,
                  storeDetails?.Currency ?? config.currency,
                  0
                )}
              </Text>
              <Text className="text-sm text-[#6A6A6A] mt-2 text-center font-normal">
                {t("referral.earned")}
              </Text>
            </View>
          </View>

          <View className="bg-gray-100 pt-10 pb-2">
            <Text className="text-center text-black font-semibold">
              {t("referral.you_earn")}
            </Text>
          </View>

          <View className="bg-defaultWhite py-5 px-5">
            <Text className="text-lg text-center text-black font-semibold">
              {formatCurrency(
                policyData?.referrerReward ?? 0,
                storeDetails?.Currency ?? config.currency,
                0
              )}
              {t("referral.with_each_referral")}
            </Text>
            <Text numberOfLines={2} className="px-10 my-2 text-center">
              {policyData?.referrerRewardDescription}
            </Text>
          </View>

          <View className="bg-gray-100 pt-10 pb-2">
            <Text className="text-center text-black font-semibold">
              {t("referral.friend_earn")}
            </Text>
          </View>

          <View className="bg-defaultWhite py-5 px-5">
            <Text className="text-lg text-center text-black font-semibold">
              {formatCurrency(
                policyData?.refereeReward ?? 0,
                storeDetails?.Currency ?? config.currency,
                0
              )}
              {t("referral.with_each_referral")}
            </Text>
            <Text numberOfLines={2} className="px-10 my-2 text-center">
              {policyData?.refereeRewardDescription}
            </Text>
          </View>

          <View className="bg-gray-100 pt-6 items-center justify-center pb-10">
            <Pressable
              disabled={referralCode ? false : true}
              onPress={onPress}
              className={`py-4 px-14 rounded-full flex-row items-center justify-center ${
                referralCode ? "bg-buttonColor" : "bg-defaultBackgroundColor"
              }`}
            >
              <Text className="text-defaultWhite font-bold text-md mx-4">
                {t("referral.refer_now")}
              </Text>
              <Svg
                width="20"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                // xmlns="http://www.w3.org/2000/svg"
              >
                <Path
                  d="M15.7975 4.66892C15.7973 4.66871 15.7971 4.66847 15.7969 4.66826L12.1874 1.07616C11.917 0.807061 11.4796 0.808062 11.2104 1.07851C10.9413 1.34892 10.9423 1.78629 11.2128 2.05542L13.6362 4.46711L-0.993293 4.4671C-1.37482 4.4671 -1.68408 4.77637 -1.68408 5.15789C-1.68408 5.53942 -1.37482 5.84868 -0.993293 5.84868L13.6361 5.84868L11.2128 8.26037C10.9424 8.5295 10.9413 8.96687 11.2105 9.23728C11.4796 9.50776 11.917 9.50869 12.1874 9.23963L15.7969 5.64753C15.7971 5.64732 15.7973 5.64708 15.7976 5.64687C16.0681 5.37684 16.0672 4.93805 15.7975 4.66892Z"
                  fill="white"
                />
              </Svg>
            </Pressable>

            <Pressable
              onPress={() => setTermsModal(!termsModal)}
              className="mt-4"
            >
              <Text className="text-sm font-normal underline text-black p-2">
                {t("referral.terms_conditions")}
              </Text>
            </Pressable>
          </View>

          {termsModal ? (
            <TermsModal
              open={termsModal}
              setOpen={setTermsModal}
              data={policyData?.termsAndConditions}
            />
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
export default Referral;
const styles = StyleSheet.create({});
