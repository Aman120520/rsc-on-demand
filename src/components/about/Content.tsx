import { ScrollView } from "react-native";
import NativeWebView from "../NativeWebView";
import { useEffect, useState } from "react";
import Loading from "../ui/Loading";
import { useTranslation } from "react-i18next";

interface ContentProps {
  data: any;
  currentHeading: string;
  setCurrentHeading: Function;
}

const Content = ({ data, currentHeading, setCurrentHeading }: ContentProps) => {
  const { t } = useTranslation();
  const [selectedData, setSelectedData] = useState<any>(null);
  setTimeout(() => {
    setLoading(false);
  }, 1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Map translated headings to content
    const headingToContentMap: { [key: string]: string } = {
      [t("about.about_us")]: data?.AboutUsContent,
      [t("about.terms")]: data?.TermContent,
      [t("about.privacy_policy")]: data?.PrivacyPolicyContent,
      [t("about.returns")]: data?.ReturnsContent,
      [t("about.refund")]: data?.RefundContent,
    };

    const content = headingToContentMap[currentHeading];
    if (content) {
      setSelectedData(content);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } else {
      setLoading(false);
    }
  }, [data, currentHeading, t]);

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-defaultWhite"
    >
      {data && <NativeWebView data={selectedData} />}
    </ScrollView>
  );
};
export default Content;
