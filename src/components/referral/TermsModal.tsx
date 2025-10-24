import Icon from "@/src/icons/Icon";
import { colors } from "@/src/styles/theme";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import i18n from "@/src/i18n";

interface TermsModalProps {
  open: boolean;
  setOpen: Function;
  data: any;
}

const TermsModal = ({ open, setOpen, data }: TermsModalProps) => {
  const { t } = useTranslation();

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
    console.log("FAQs JSON translation:", jsonTranslation);
    console.log("Current language:", currentLang);

    if (jsonTranslation !== "refs.FAQs") {
      return jsonTranslation;
    }

    // Fallback to hardcoded translations
    const fallbackTranslation = translations[currentLang] || translations.en;
    console.log("FAQs fallback translation:", fallbackTranslation);
    return fallbackTranslation;
  };

  return (
    <ReactNativeModal
      backdropColor={colors.defaultBlack}
      isVisible={open}
      className="items-center justify-center"
    >
      <View style={styles.container}>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-black">
            {getFAQsTranslation()}
          </Text>
          <Pressable className="py-2 pl-2" onPress={() => setOpen(!open)}>
            <Icon name="close" />
          </Pressable>
        </View>

        <ScrollView>
          <Text className="mt-2 pb-5 text-black">{data}</Text>
        </ScrollView>
      </View>
    </ReactNativeModal>
  );
};
export default TermsModal;

const styles = StyleSheet.create({
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: 320,
    minHeight: 250,
    maxHeight: 540,
    borderRadius: 10,
    backgroundColor: colors.defaultWhite,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
