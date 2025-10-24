import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import { Image } from "expo-image";
import Icon from "../icons/Icon";
import { colors } from "../styles/theme";

interface PopupBannersProps {
  showPopupBanner: boolean;
  setShowPopupBanner: Function;
  popupBannerImg: string;
}

const PopupBanner = ({
  showPopupBanner,
  setShowPopupBanner,
  popupBannerImg,
}: PopupBannersProps) => {
  showPopupBanner;

  const { height: screenHeight } = Dimensions.get("window");
  const ASPECT_RATIO = 1563 / 2779;

  const maxHeight = screenHeight * 0.6;
  const imageWidth = maxHeight * ASPECT_RATIO;

  return (
    <Modal
      backdropColor={colors.defaultBlack}
      isVisible={showPopupBanner}
      style={styles.modalContainer}
      onBackdropPress={() => setShowPopupBanner(false)}
    >
      <View className="bg-transparent">
        <Pressable
          onPress={() => setShowPopupBanner(false)}
          className="items-end bg-transparent"
        >
          <View className="w-auto bg-defaultWhite">
            <Icon name="close" />
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={{ width: imageWidth, height: maxHeight }}>
            <Image
              source={{ uri: popupBannerImg }}
              style={styles.bannerImage}
              contentFit="cover"
            />
          </View>
        </Pressable>
      </View>
    </Modal>
  );
};

export default PopupBanner;

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bannerContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
});
