import { useCallback, useRef } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

const PaylaterSheet = ({
  open,
  setOpen,
  onPayLater,
  onPayOnline,
}: {
  open: boolean;
  setOpen: Function;
  onPayLater: () => void;
  onPayOnline: () => void;
}) => {
  const { t, i18n } = useTranslation();

  // Static translations based on current language
  const getChoosePaymentMethodText = () => {
    const currentLanguage = i18n?.language || "en";

    const translations: { [key: string]: string } = {
      en: "Choose Payment method:",
      ar: "اختر طريقة الدفع:",
      fr: "Choisir le mode de paiement:",
      hi: "भुगतान विधि चुनें:",
    };

    return (
      translations[currentLanguage] ||
      translations.en ||
      "Choose Payment method:"
    );
  };

  const getCashOnDeliveryText = () => {
    const currentLanguage = i18n?.language || "en";

    const translations: { [key: string]: string } = {
      en: "Cash on Delivery",
      ar: "الدفع عند التسليم",
      fr: "Paiement à la livraison",
      hi: "कैश ऑन डिलीवरी",
    };

    return (
      translations[currentLanguage] || translations.en || "Cash on Delivery"
    );
  };

  const getPayOnlineText = () => {
    const currentLanguage = i18n?.language || "en";

    const translations: { [key: string]: string } = {
      en: "Pay Online",
      ar: "ادفع عبر الإنترنت",
      fr: "Payer en ligne",
      hi: "ऑनलाइन भुगतान करें",
    };

    return translations[currentLanguage] || translations.en || "Pay Online";
  };

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // renders
  return (
    <BottomSheet
      snapPoints={["30%"]}
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      style={{
        borderWidth: 1,
        borderColor: "gray",
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
      }}
      onClose={() => setOpen(false)}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text className="mb-8 text-base font-semibold">
          {getChoosePaymentMethodText()}
        </Text>

        <Pressable
          onPress={onPayLater}
          className="bg-buttonColor py-4 rounded-md"
        >
          <Text className="text-base font-medium text-white text-center">
            {getCashOnDeliveryText()}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPayOnline}
          className="bg-buttonColor py-4 rounded-md mt-5"
        >
          <Text className="text-base font-medium text-white text-center">
            {getPayOnlineText()}
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
});

export default PaylaterSheet;
