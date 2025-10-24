import {
  Alert,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
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
import Svg, { Path, SvgXml } from "react-native-svg";
import { formatCurrency, showToast } from "@/src/utils/CommonFunctions";
import { useStore } from "@/src/context/StoreProvider";
import { WHATSAPP_OUTLINE } from "@/src/icons/svg";
import Icon from "@/src/icons/Icon";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Loading from "@/src/components/ui/Loading";
import RedeemModal from "@/src/components/referral/RedeemModal";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

const Referral = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  // Fallback translation for FAQs
  const getFAQsTranslation = () => {
    const currentLang = i18n.language;
    const translations: { [key: string]: string } = {
      en: "FAQs",
      fr: "FAQs",
      hi: "FAQs",
      ar: "الأسئلة الشائعة",
    };

    // Try JSON translation first
    const jsonTranslation = t("refs.FAQs");
    if (jsonTranslation !== "refs.FAQs") {
      return jsonTranslation;
    }

    // Fallback to hardcoded translations
    return translations[currentLang] || translations.en;
  };

  const { setAppConfig, appConfig } = useAppConfig();
  const { user, clientId, branchId, customerCode } = useUser();
  const { storeDetails } = useStore();

  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>("");
  const [referralData, setReferralData] = useState<any>(null);
  const [policyData, setPolicyData] = useState<any>(null);
  const [termsModal, setTermsModal] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const appName = appConfig?.appName ?? config.appName?.toLowerCase();
  // const referralURL = `tumbledry://refer/${referralCode}`;

  const slug = config.slug;

  const testflightLink = `https://testflight.apple.com/join/DRgzQdum/${slug}/${referralCode}`;

  const referralURL = `https://referral.quickdrycleaning.com/${slug}/${referralCode}`;

  // console.log({ testingURL });

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
              "query Referral($externalId: String) {\n    referral(externalId: $externalId) {\n    code\n    externalId\n    locationId\n    referrer {\n      id\n      code\n    }\n    referrerId\n    transactions {\n      policyId\n    }\n    statistics {\n      id\n      totalReferrals\n  rewardBalance\n    successfulReferrals\n      rewardEarned\n      rewardRedeemed\n      rewardBalance\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      // console.log("ReferralCodeData", JSON.stringify(data));

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

      // console.log("createNewReferralCode", { data });

      if (data?.createReferral) {
        let code = data?.createReferral?.code;

        setReferralCode(code);
        setReferralData(data?.createReferral);
        setLoading(false);
      } else {
        setLoading(false);
        // showToast("Error in create new referral", 2000);
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
            operationName: "ReferralPolicies",
            variables: {
              where: {
                organizationId: {
                  equals:
                    appConfig?.organizationId?.toString() ??
                    config.OrganizationId.toString(),
                },
              },
            },
            query:
              "query ReferralPolicies($orderBy: ReferralPolicyOrderByInput\n$page: Float\n$pageSize: Float\n$where: ReferralPolicyWhereInput) {\n  referralPolicies(\n    where: $where\n    page: $page\n    pageSize: $pageSize\n    orderBy: $orderBy\n  ) {\n    nodes {\n      active\n      organizationId\n  title\n  description\n  refereeRewardDescription\n   referrerRewardDescription\n      imageUrl\n      messageTemplate\n      referrerRewardDescription\n      refereeRewardDescription\n      refereeReward\n      referrerReward\n      termsAndConditions\n    }\n  }\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;
      const { data }: any = res;

      // console.log("referralPolicies", JSON.stringify(data));

      if (data?.referralPolicies) {
        setPolicyData(data?.referralPolicies?.nodes[0]);
        setMessageTemplate(data?.referralPolicies?.nodes[0]?.messageTemplate);
        setLoading(false);
      } else {
        // showToast("Error in getting Referral policies.");
        setLoading(false);
      }
    } catch (err) {
      console.log({ err });
      setLoading(false);
    }
  };

  // const message = messageTemplate
  //   ?.replace("{{refereeReward}}", policyData.refereeReward)
  //   ?.replace("{{link}}", referralURL)
  //   ?.replace(/{{code}}/g, referralCode)
  //   ?.replace(/:slug/, slug)
  //   ?.replace(/:code/, referralCode);

  const message = `${messageTemplate}\n\nYour Referral Code: ${referralCode}\nDownload from the given link: ${referralURL}`;

  const onPress = () => {
    const options = {
      title: t("referral.refer_a_friend"),
      message: message,
      // url: referralURL,
      subject: "Refer a Friend",
    };

    Share.open(options).catch((err) => {
      if (err && err.message !== "User did not share") {
        console.log("Share error:", err);
      }
    });
  };

  const onWhatsapp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("WhatsApp is not installed on this device.");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("Error opening WhatsApp:", err));
  };

  const copyToClipboard = async () => {
    if (!referralCode) {
      showToast(t("referral.code_not_found"));
      return;
    }

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await Clipboard.setStringAsync(referralCode);
    showToast(t("referral.code_copied"));
  };

  const onRedeemPoints = async () => {
    if (Number(referralData?.statistics?.rewardBalance) === 0) {
      showToast(t("referral.no_rewards"));
      return;
    }

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
            operationName: "ProcessReferralRedemption",
            variables: {
              data: {
                externalId: customerCode,
                amount: Number(referralData?.statistics?.rewardBalance) ?? 0,
              },
            },
            query:
              "mutation ProcessReferralRedemption($data: ReferralRedemptionInput!) {\n  processReferralRedemption(data: $data)\n}",
          }),
        }
      );

      const json = await response.json();
      const res = json;

      // console.log("PROCESS REFERRAL REDEMPTION", JSON.stringify(res));

      const { data }: any = res;

      if (data?.processReferralRedemption === true) {
        getReferralCode();
        Alert.alert(
          t("referral.earned_wallet_credit"),
          t("referral.earned_message")
        );
      }
    } catch (err) {
      console.log({ err });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getReferralCode();
    getReferralPrivacy();
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setRefreshing(false);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center"></SafeAreaView>
    );
  }

  return (
    <>
      {/* <Header headerTitle="Refer & Earn" /> */}
      {loading ? (
        <View className="flex-1 bg-defaultWhite justify-center">
          <CommonLoading />
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 bg-gray-100"
            refreshControl={
              <RefreshControl
                tintColor={appConfig?.theme?.buttonColor ?? colors.buttonColor}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <Image
              // source={require("../../../../assets/banners/referral-banner.jpg")}
              source={policyData?.imageUrl}
              placeholder={"blurhash"}
              contentFit="cover"
              transition={1000}
              style={[
                {
                  height: imageHeight - 42,
                  width: imageWidth,
                  backgroundColor: colors.defaultBackgroundColor,
                },
              ]}
            />

            <View className="px-5 py-4">
              <View>
                <Text className="text-xl text-black font-medium">
                  {policyData?.title}
                </Text>
                <Text className="text-md text-gray-700 font-normal mt-2.5">
                  {policyData?.description}
                </Text>
              </View>

              <View className="mt-10">
                <Text className="text-xl text-black font-medium">
                  {t("referral_tabs.you_get")}
                </Text>

                <View className="flex flex-row items-center py-3">
                  <View className="">
                    <GiftBox />
                  </View>

                  <View className="ml-4 w-[86%]">
                    <Text className="text-lg text-black font-medium">
                      {formatCurrency(
                        policyData?.referrerReward ?? 0,
                        storeDetails?.Currency ?? config.currency,
                        policyData?.referrerReward % 1 !== 0 ? 2 : 0
                      )}{" "}
                    </Text>
                    <Text
                      numberOfLines={5}
                      className="text-gray-500 font-medium"
                    >
                      {policyData?.referrerRewardDescription}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-8">
                <Text className="text-xl text-black font-medium">
                  {t("referral_tabs.friend_get")}
                </Text>

                <View className="flex flex-row items-center py-3">
                  <View className="">
                    <MailBox />
                  </View>

                  <View className="ml-4 w-[86%]">
                    <Text className="text-lg text-black font-medium">
                      {formatCurrency(
                        policyData?.refereeReward ?? 0,
                        storeDetails?.Currency ?? config.currency,
                        policyData?.refereeReward % 1 !== 0 ? 2 : 0
                      )}
                    </Text>
                    <Text
                      numberOfLines={5}
                      className="text-gray-500 font-semibold"
                    >
                      {policyData?.refereeRewardDescription}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={copyToClipboard}
                className="mt-5 flex flex-row items-center justify-between rounded-md p-3 bg-[#666666]"
                style={{
                  backgroundColor: `${appConfig?.theme?.buttonColor}33`,
                }}
              >
                <Text className="text-buttonColor text-lg font-semibold">
                  {referralCode}
                </Text>

                <View className="bg-buttonColor py-3 px-5 rounded-full">
                  <Text className="text-white text-md font-semibold">
                    {t("refs.copy")}
                  </Text>
                </View>
              </Pressable>

              <View className="mt-6">
                <Text className="text-black text-md font-medium">
                  {t("referral.you_have")}{" "}
                  {referralData?.statistics?.rewardBalance}{" "}
                  {t("referral.points")}
                </Text>

                {referralData?.statistics?.rewardBalance > 0 ? (
                  <Text
                    // disabled={referralData?.statistics?.rewardBalance === 0}
                    // onPress={() => setShowRedeem(true)}
                    onPress={onRedeemPoints}
                    className="text-buttonColor text-md font-semibold items-center justify-center my-3"
                  >
                    {t("refs.redeem_now")}
                  </Text>
                ) : null}
              </View>

              <View className="mt-3">
                <Pressable onPress={() => setTermsModal(!termsModal)}>
                  <Text className="text-sm font-normal text-black">
                    {t("refs.click_here_to")}{" "}
                    <Text className="text-buttonColor">
                      {t("refs.read")} {getFAQsTranslation()} →
                    </Text>
                  </Text>
                </Pressable>
              </View>
            </View>

            {termsModal ? (
              <TermsModal
                open={termsModal}
                setOpen={setTermsModal}
                data={policyData?.termsAndConditions}
              />
            ) : null}

            {showRedeem ? (
              <RedeemModal
                open={showRedeem}
                setOpen={setShowRedeem}
                data={referralData?.statistics}
                referralCode={referralCode}
                onPress={onRedeemPoints}
              />
            ) : null}
          </ScrollView>

          <View className="bg-white px-5 py-4 items-center justify-center shadow-sm">
            <Pressable
              onPress={onPress}
              className="bg-buttonColor py-5 w-full items-center justify-center rounded-lg"
            >
              <Text className="text-white text-lg font-medium">
                {t("refs.invite_friends")}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
};
export default Referral;

const GiftBox = () => {
  return (
    <SvgXml
      xml={`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" width="25px" height="60px" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#FFCC33;" d="M450.424,73.976c-3.276,32.712-35.617,59.14-68.494,59.14H255.999 c-6.902,0-13.098-4.25-15.576-10.685c-2.489-6.44-0.75-13.745,4.37-18.381l95.229-86.304C359.707-0.107,387.043-4.515,411.37,6.267 C437.835,17.998,453.38,44.458,450.424,73.976z M299.283,99.724h83.695c17.397,0,33.073-12.83,34.316-30.182 c1.161-16.195-8.162-29.697-24.041-34.433c-11.064-3.3-23.032,0.318-31.587,8.072C341.678,61.298,299.283,99.724,299.283,99.724z"></path> <path style="fill:#FFE14D;" d="M255.891,133.115H129.963c-32.869,0-65.212-26.42-68.496-59.125 C58.504,44.474,74.052,18.005,100.51,6.273c24.316-10.778,51.641-6.386,71.358,11.468l95.229,86.31 c5.12,4.636,6.859,11.941,4.37,18.381C268.989,128.866,262.794,133.115,255.891,133.115z M127.652,33.838 c-4.715,0-9.501,1.053-14.15,3.201c-8.882,4.105-15.752,12.217-18.034,21.732c-5.182,21.606,11.149,40.952,31.901,40.952h85.239 l-63.152-57.239C143.152,36.779,135.522,33.838,127.652,33.838z"></path> <path style="fill:#FF9F19;" d="M289.391,99.724h-66.783l0,0c0-18.442,14.949-33.391,33.391-33.391l0,0 C274.442,66.333,289.391,81.283,289.391,99.724L289.391,99.724z"></path> <path style="fill:#F28618;" d="M289.391,99.724c0-18.442-14.949-33.391-33.391-33.391v33.391H289.391z"></path> <path style="fill:#E6563A;" d="M478.609,166.506v311.652c0,18.477-14.916,33.391-33.391,33.391H66.783 c-18.475,0-33.391-14.915-33.391-33.391V166.506L478.609,166.506L478.609,166.506z"></path> <path style="fill:#D9472B;" d="M256,511.55h189.217c18.475,0,33.391-14.915,33.391-33.391V166.506H256V511.55z"></path> <path style="fill:#FF9F19;" d="M478.609,99.724H33.391C14.916,99.724,0,114.639,0,133.115v50.087 c0,9.238,7.456,16.696,16.696,16.696h478.609c9.239,0,16.696-7.457,16.696-16.696v-50.087 C512,114.639,497.084,99.724,478.609,99.724z"></path> <path style="fill:#F28618;" d="M478.609,99.724H256v100.174h239.304c9.239,0,16.696-7.457,16.696-16.696v-50.087 C512,114.639,497.084,99.724,478.609,99.724z"></path> <rect x="222.609" y="99.727" style="fill:#FFE14D;" width="66.783" height="411.826"></rect> <rect x="256" y="99.727" style="fill:#FFCC33;" width="33.391" height="411.826"></rect> </g></svg>`}
    />
  );
};

const MailBox = () => {
  return (
    <SvgXml
      xml={`<svg height="30px" width="28px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path style="fill:#8EC737;" d="M372.356,300.688l-16.8-25.725l133.163-87.306c4.806-3.151,11.256-1.803,14.398,3.008l5.436,8.324 c3.134,4.799,1.791,11.229-3.003,14.372L372.356,300.688z"></path> </g> <g> <path style="fill:#8EC737;" d="M139.644,300.688l16.8-25.725L23.281,187.657c-4.806-3.151-11.256-1.803-14.398,3.008 l-5.436,8.324c-3.134,4.799-1.791,11.229,3.003,14.372L139.644,300.688z"></path> </g> </g> <g> <path style="fill:#FFCE8B;" d="M316.489,51.744L290.928,76.66l6.026,35.187c0.903,5.264-4.619,9.29-9.355,6.8L256,102.027 l-31.6,16.619c-4.735,2.49-10.258-1.536-9.355-6.8l2.839-16.593l3.187-18.593l-25.561-24.916 c-3.819-3.729-1.716-10.232,3.574-11.006l35.328-5.135L250.219,3.59c2.361-4.787,9.2-4.787,11.561,0l15.806,32.012l14.877,2.168 l20.451,2.968C318.206,41.512,320.309,48.015,316.489,51.744z"></path> <path style="fill:#FFB54E;" d="M316.489,51.744L290.928,76.66l6.026,35.187c0.903,5.264-4.619,9.29-9.355,6.8L256,102.027 l-31.6,16.619c-4.735,2.49-10.258-1.536-9.355-6.8l2.839-16.593c47.406-13.122,66.76-39.716,74.579-57.483l20.451,2.968 C318.206,41.512,320.309,48.015,316.489,51.744z"></path> </g> <path style="fill:#BDEB73;" d="M373.825,511.997h-235.65c-5.651,0-10.231-4.581-10.231-10.231v-235.65 c0-5.651,4.581-10.231,10.231-10.231h235.65c5.651,0,10.231,4.581,10.231,10.231v235.65 C384.056,507.416,379.476,511.997,373.825,511.997z"></path> <path style="fill:#A4E540;" d="M384.054,266.114v235.655c0,5.648-4.573,10.231-10.231,10.231h-24.074 c5.648,0,10.231-4.584,10.231-10.231V266.114c0-5.648-4.584-10.231-10.231-10.231h24.074 C379.48,255.882,384.054,260.466,384.054,266.114z"></path> <path style="fill:#E3F6C5;" d="M384.054,307.376v84.622c-7.489,7.581-15.613,15.817-24.074,24.371 c-33.149,33.528-71.311,71.956-95.293,95.631h-85.267l180.56-180.55L384.054,307.376z"></path> <path style="fill:#BDEB73;" d="M384.054,307.376v84.622c-7.489,7.581-15.613,15.817-24.074,24.371V331.45L384.054,307.376z"></path> <path style="fill:#E3F6C5;" d="M335.895,255.882c-58.512,58.952-146.47,147.452-207.949,208.819v-85.379l123.439-123.439H335.895z"></path> <g> <path style="fill:#8ECBFD;" d="M331.681,211.529c-0.283,0-0.567-0.015-0.855-0.046c-4.238-0.468-7.298-4.276-6.835-8.514 c0.348-3.187,9.219-78.66,70.117-132.715c3.19-2.834,8.073-2.542,10.907,0.65c2.832,3.191,2.541,8.074-0.65,10.907 c-56.315,49.986-64.933,122.119-65.013,122.842C338.913,208.603,335.567,211.529,331.681,211.529z"></path> <path style="fill:#ED6264;" d="M168.084,212.336c-3.943,0-7.309-3.004-7.684-7.008l0,0C160.28,204.045,147.582,76.49,80.006,30.35 c-3.524-2.406-4.431-7.214-2.024-10.738c2.406-3.523,7.214-4.429,10.737-2.024c31.111,21.243,55.23,59.169,71.685,112.725 c12.097,39.369,15.253,72.2,15.382,73.579c0.396,4.25-2.727,8.014-6.976,8.41C168.567,212.323,168.324,212.336,168.084,212.336z"></path> </g> <path style="fill:#FFCE8B;" d="M256,220.741c-4.267,0-7.726-3.459-7.726-7.726v-63.574c0-4.268,3.459-7.726,7.726-7.726 c4.268,0,7.726,3.459,7.726,7.726v63.574C263.726,217.282,260.268,220.741,256,220.741z"></path> <g> <g> <circle style="fill:#A4E540;" cx="66.189" cy="114.289" r="27.29"></circle> <path style="fill:#8EC737;" d="M92.785,120.397c-3.376,14.692-18.017,23.859-32.699,20.493c-0.399-0.092-0.788-0.194-1.187-0.297 c9.331-2.599,16.984-10.098,19.306-20.196c3.284-14.293-5.31-28.535-19.306-32.412c4.225-1.176,8.809-1.351,13.393-0.297 C86.984,91.065,96.161,105.705,92.785,120.397z"></path> </g> <g> <circle style="fill:#8998DD;" cx="445.811" cy="38.137" r="27.29"></circle> <path style="fill:#6D80D6;" d="M472.407,44.245c-3.376,14.692-18.017,23.859-32.699,20.493c-0.399-0.092-0.788-0.194-1.187-0.297 c9.331-2.599,16.984-10.098,19.306-20.196c3.284-14.293-5.31-28.535-19.306-32.412c4.225-1.176,8.809-1.351,13.393-0.297 C466.606,14.912,475.783,29.553,472.407,44.245z"></path> </g> </g> </g> </g></svg>`}
    />
  );
};
