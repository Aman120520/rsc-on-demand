import {
  FlatList,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";

import { router } from "expo-router";
import { colors } from "@/src/styles/theme";

const data = [
  {
    id: 1,
    title: "Dry Clean",
    subTitle: "green chemicals",
    img: require("../../assets/bottom-banners/image-03.jpg"),
    serviceName: "Dry Cleaning",
    // url: "https://www.instagram.com/reel/C1eCKESMg9b/?igsh=MzRlODBiNWFlZA==",
    url: "",
  },
  {
    id: 2,
    title: "Laundry",
    subTitle: "pick up & delivery",
    img: require("../../assets/bottom-banners/image-01.jpg"),
    serviceName: "Laundry Service",
    // url: "https://www.instagram.com/reel/C1bdDbwBR_c/?igsh=MzRlODBiNWFlZA==",
    url: "",
  },
  {
    id: 3,
    title: "shoe clean",
    subTitle: "pick up & delivery",
    img: require("../../assets/bottom-banners/image-05.jpg"),
    serviceName: "Shoe Cleaning",
    // url: "https://www.instagram.com/reel/C2wwMj4hva7/?igsh=MzRlODBiNWFlZA==",
    url: "",
  },
  {
    id: 4,
    title: "sofa clean",
    subTitle: "green chemicals",
    img: require("../../assets/bottom-banners/image-01.jpg"),
    serviceName: "Sofa Cleaning",
    // url: "https://www.instagram.com/reel/C2ca-GHhYUh/?igsh=MzRlODBiNWFlZA==",
    url: "",
  },
  {
    id: 5,
    title: "curtain",
    subTitle: "pick up & delivery",
    img: require("../../assets/bottom-banners/image-05.jpg"),
    serviceName: "Sofa Cleaning",
    // url: "https://www.instagram.com/reel/C0514z5Baye/?igsh=MzRlODBiNWFlZA==",
    url: "",
  },
];

const onPress = (url: string) => {
  Linking.openURL(url);
};

const HomeSliderTile = () => {
  // renderItems
  const renderItem = ({ item, index }: any) => {
    return (
      <ImageBackground
        key={item?.id}
        source={item?.img}
        style={styles.backgroundImg}
        resizeMethod="auto"
        borderRadius={14}
      >
        <Pressable
          onPress={() => {
            onPress(item?.url);
            // router.push({
            //   pathname: "/screens/catalogue/CatalogueScreen",
            //   params: { index: index, tab: item?.serviceName },
            // });
          }}
          style={styles.container}
        >
          {/* <Text style={styles.title}>{item?.title}</Text> */}
          {/* <Text style={styles.subTitle}>{item?.subTitle}</Text> */}
        </Pressable>
      </ImageBackground>
    );
  };

  return (
    <View className="mt-4">
      <FlatList
        contentContainerStyle={
          data?.length > 1 ? { paddingRight: 20 } : { paddingRight: 25 }
        }
        style={{ paddingHorizontal: 20, paddingBottom: 30 }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
      />
    </View>
  );
};

export default HomeSliderTile;

const styles = StyleSheet.create({
  backgroundImg: {
    flex: 1,
    height: 160,
    width: 180,
    borderRadius: 14,
    marginRight: 14,
  },
  container: {
    flex: 1,
    // backgroundColor: COLORS.TRANSPARENT_BLACK,
    height: 160,
    width: 180,
    borderRadius: 14,
    padding: 20,
    justifyContent: "flex-end",
  },
  title: {
    // ...TEXT_STYLE.TEXT_16_B,
    color: colors.defaultWhite,
    textTransform: "capitalize",
  },
  subTitle: {
      // ...TEXT_STYLE.TEXT_13_SB,
    color: colors.defaultWhite,
    textTransform: "capitalize",
  },
});
