import { FlatList, Pressable, Text } from "react-native";
import Divider from "../Divider";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface AboutListingProps {
  data: any;
  heading: string;
  setHeading: Function;
  currentHeading: string;
  setCurrentHeading: Function;
}

const AboutListing = ({
  data,
  heading,
  setHeading,
  currentHeading,
  setCurrentHeading,
}: AboutListingProps) => {
  const { t } = useTranslation();
  const [headingData, setHeadingData] = useState<any>([]);

  useEffect(() => {
    let arrayList: any = [];

    // Use translations instead of API headings
    if (data?.AboutUsHeading != undefined && data?.AboutUsHeading != "") {
      arrayList.push({
        title: t("about.about_us"),
        originalTitle: data?.AboutUsHeading,
        key: "about_us",
      });
    }
    if (data?.TermHeading != undefined && data?.TermHeading != "") {
      arrayList.push({
        title: t("about.terms"),
        originalTitle: data?.TermHeading,
        key: "terms",
      });
    }
    if (
      data?.PrivacyPolicyHeading != undefined &&
      data?.PrivacyPolicyHeading != ""
    ) {
      arrayList.push({
        title: t("about.privacy_policy"),
        originalTitle: data?.PrivacyPolicyHeading,
        key: "privacy_policy",
      });
    }
    if (data?.ReturnsHeading != undefined && data?.ReturnsHeading != "") {
      arrayList.push({
        title: t("about.returns"),
        originalTitle: data?.ReturnsHeading,
        key: "returns",
      });
    }
    if (data?.RefundHeading != undefined && data?.RefundHeading != "") {
      arrayList.push({
        title: t("about.refund"),
        originalTitle: data?.RefundHeading,
        key: "refund",
      });
    }

    // Log the translated headings for debugging
    console.log(
      "About Us - Translated headings:",
      arrayList.map((item) => item.title)
    );
    setHeadingData(arrayList);
  }, [data, t]);

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        onPress={() => setCurrentHeading(item?.title)}
        className="px-5 py-8"
      >
        <Text className="text-md">{item?.title}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={headingData}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};
export default AboutListing;
