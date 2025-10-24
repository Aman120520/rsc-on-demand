import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface SearchAddressProps {
  locality: any;
  setLocality: Function;
  searchLocation: boolean;
  setSearchLocation: Function;
  setLocation: Function;
}

const SearchAddress = ({
  locality,
  setLocality,
  searchLocation,
  setSearchLocation,
  setLocation,
}: SearchAddressProps) => {
  const { t } = useTranslation();
  const { setAppConfig, appConfig } = useAppConfig();
  return (
    <View className="flex-1 color-defaultWhite p-5">
      <View className="w-full h-14 justify-center">
        <View>
          <Text className="text-sm color-primary ml-14 capitalize">
            {t("auth.address.update_location")}
          </Text>
        </View>

        <GooglePlacesAutocomplete
          placeholder={t("auth.address.placeholders.search_area")}
          minLength={2}
          fetchDetails={true}
          listViewDisplayed="auto"
          // renderDescription={(row) => row.description || row.vicinity}
          onFail={(error) => {
            console.error(error);
          }}
          onPress={(data, details) => {
            setLocality(data?.description);
            setLocation((prevState: any) => {
              return {
                ...prevState,
                coords: {
                  ...prevState?.coords,
                  latitude: details?.geometry?.location?.lat,
                  longitude: details?.geometry?.location?.lng,
                },
              };
            });
            setSearchLocation(!searchLocation);
          }}
          currentLocation={true}
          currentLocationLabel="Your location"
          query={{
            key: "AIzaSyA54ncU-u1RwaJvS-AfZz5muaCAcsjRzqc",
            language: "en",
          }}
          nearbyPlacesAPI={"GooglePlacesSearch"}
          GoogleReverseGeocodingQuery={{}}
          filterReverseGeocodingByTypes={[
            "locality",
            "administrative_area_level_3",
          ]}
          renderLeftButton={() => (
            <Pressable
              onPress={() => setSearchLocation(!searchLocation)}
              className="h-12 w-14 justify-center items-start"
            >
              <Image source={require("../../icons/back1.png")} />
            </Pressable>
          )}
          styles={{
            textInputContainer: {
              backgroundColor: "rgba(0,0,0,0)",
              borderTopWidth: 0,
              borderBottomWidth: 1,
              borderColor: colors.defaultBlack,
              width: "100%",
            },

            textInput: {
              marginLeft: -10,
              marginRight: 50,
              height: 40,
              color: "#5d5d5d",
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#FFFFFF",
            },
            predefinedPlacesDescription: {
              color: appConfig?.theme?.primaryColor ?? colors.primaryColor,
            },
            description: {
              fontWeight: "bold",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            listView: {
              color: "black", //To see where exactly the list is
              //To popover the component outwards
              position: "absolute",
              top: 70,
              width: "100%",
              elevation: 1,
              backgroundColor: "white",
              borderRadius: 5,
            },
          }}
        />
      </View>
    </View>
  );
};

export default SearchAddress;

const styles = StyleSheet.create({});
