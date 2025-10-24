import config from "@/config";
import { useService } from "@/src/context/ServiceProvider";
import { useStore } from "@/src/context/StoreProvider";
import { formatCurrency } from "@/src/utils/CommonFunctions";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface PackageProps {
  index: number;
  item: any;
}

const Package = ({ item, index }: PackageProps) => {
  const { t } = useTranslation();
  const { setSelectedPackageDetail } = useService();
  const { storeDetails } = useStore();

  // Date translation function
  const translateDate = (dateString: string) => {
    if (!dateString) return dateString;

    // Parse date format like "31 Dec 9999" or "15 Oct 2024"
    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const translatedMonth = t(`date_formatting.months.${month}`);
      return `${day} ${translatedMonth} ${year}`;
    }
    return dateString;
  };

  const key = index === 0 ? "available" : "active";
  const currencyCode = storeDetails?.Currency;

  const onPress = () => {
    const pathName = "/(app)/screens/package/PackageDetailsScreen";

    if (key === "available") {
      router.push({
        pathname: pathName,
        params: { routeKey: key },
      });
      setSelectedPackageDetail(item);
    } else {
      router.push({
        pathname: pathName,
        params: { routeKey: key },
      });
      setSelectedPackageDetail(item);
    }
  };

  return (
    <View className="p-3 ml-1 px-1 my-1" style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        className="flex min-h-60"
        style={styles.card}
      >
        <View className="bg-primary items-center">
          {item?.ImageURL != "" ? (
            <Image
              style={styles.img}
              source={{
                uri: item?.ImageURL,
              }}
            />
          ) : (
            <Image
              style={styles.img}
              source={require("../../raw-assets/discount.png")}
            />
          )}
        </View>
        <View className="px-4 py-2">
          <Text numberOfLines={1} className="font-bold">
            {item?.PackageName}
          </Text>

          {key === "available" ? (
            <Text className="my-2">
              {t("packages.price")}{" "}
              {formatCurrency(
                item?.PackageCost,
                storeDetails?.Currency ?? config.currency,
                item?.PackageCost % 1 !== 0 ? 2 : 0
              )}
            </Text>
          ) : (
            <Text className="my-2">
              {/* Balance: {formatCurrency(item?.PackageBalance, currencyCode)} */}
            </Text>
          )}

          {key === "available" ? null : (
            <Text className="my-2">
              {t("packages.expire_on")}{" "}
              {item?.EndDate !== "31 Dec 9999"
                ? translateDate(item?.EndDate)
                : t("packages.unlimited")}
            </Text>
          )}

          {key === "available" &&
          (item?.ValidityYear == "0" || item?.ValidityYear == undefined) &&
          (item?.ValidityMonth == "0" || item?.ValidityMonth == undefined) &&
          (item?.ValidityDays == "0" || item?.ValidityDays == undefined) ? (
            <Text className="">
              {t("packages.validity")} {t("packages.unlimited")}
            </Text>
          ) : null}
          {key === "available" &&
          item?.ValidityDays != "0" &&
          item?.ValidityDays != undefined ? (
            <Text className="">
              {t("packages.validity")} {item?.ValidityDays}{" "}
              {t("packages.validity_days")}
            </Text>
          ) : null}
          {key === "available" &&
          item?.ValidityMonth != "0" &&
          item?.ValidityMonth != undefined ? (
            <Text className="">
              {t("packages.validity")} {item?.ValidityMonth}{" "}
              {t("packages.validity_months")}
            </Text>
          ) : null}
          {key === "available" &&
          item?.ValidityYear != "0" &&
          item?.ValidityYear != undefined ? (
            <Text className="">
              {t("packages.validity")} {item?.ValidityYear}{" "}
              {t("packages.validity_year")}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default Package;

const styles = StyleSheet.create({
  container: {
    width: "49%",
  },
  img: {
    height: 100,
    width: 100,
    alignItems: "center",
  },
  card: {
    width: "99%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    overflow: "hidden",
    shadowRadius: 1,
    shadowOffset: {
      width: 3,
      height: 3,
    },
  },
});
