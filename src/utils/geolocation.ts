// @flow
/* global navigator */
import axios from "axios";
import { getCode } from "country-list";
import config from "../../config";

export function getCoords(): Promise<any> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (l) => {
        resolve(l);
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 3600000,
      }
    );
  });
}

export function getDefaultCountryCode() {
  return getCode(config.defaultCountry).toLowerCase();
}

export async function getGeocode(
  latitude: string | number | undefined,
  longitude: string | number | undefined,
  pickup: Boolean
): Promise<any> {
  return new Promise((resolve, reject) => {
    axios
      .get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          latlng: `${latitude},${longitude}`,
          key: "AIzaSyA54ncU-u1RwaJvS-AfZz5muaCAcsjRzqc",
          type: "country|postal_code|administrative_area_level_1|administrative_area_level_2",
        },
      })
      .then(({ data }) => {
        const { results } = data;
        // console.log(`--------------->>>>>>>>>>${JSON.stringify(data)}`);
        let pincode = {};
        try {
          const route = results.length > 0 ? results[0].address_components : {};
          pincode = route.filter((r) => r.types.includes("postal_code"));
          // console.log(
          //   `Pin Code Data------------>>>>>>>${JSON.stringify(pincode)}`
          // );
        } catch (e) {
          console.log(`Postal code error :${e}`);
        }

        let state = {};
        try {
          const route = results.length > 0 ? results[0].address_components : {};
          state = route.filter((r) =>
            r.types.includes("administrative_area_level_1")
          );
          // console.log(`State date ------------>>>>>>>${JSON.stringify(state)}`);
        } catch (e) {
          console.log(`Postal code error :${e}`);
        }
        let area = {};
        try {
          const route = results.length > 0 ? results[0].address_components : {};
          area = route.filter((r) => r.types.includes("locality"));
          // console.log(`State date ------------>>>>>>>${JSON.stringify(area)}`);
        } catch (e) {
          console.log(`Postal code error :${e}`);
        }
        // try {
        //    pincode = results
        //   .filter((r) => r.types.includes('route'))[0]
        //   .address_components.filter((a) => a.types.includes('postal_code'));
        // }catch (e) {
        //   console.log(`Postal code error :${e}`);
        // }

        const locality = results.filter((r) =>
          r.types.includes(pickup ? "political" : "street_address")
        );

        const subLocality = results.filter((r) =>
          r.types.includes("sublocality")
        );

        const country = results.filter((r) => r.types.includes("country"));

        const payload = {
          pincode: pincode.length ? pincode[0].long_name : "",
          locality: locality.length ? locality[0].formatted_address : "",
          subLocality: subLocality.locality
            ? subLocality[0].formatted_address
            : "",
          country: country.length ? country[0].formatted_address : "",
          AreaLocation: area.length ? area[0].long_name : "",
          CityState: state.length ? state[0].long_name : "",
        };

        // console.log(
        //   `Payload--------------->>>>>>>>>>${JSON.stringify(payload)}`
        // );
        const countryCode = getCode(payload.country) || getDefaultCountryCode();

        resolve({
          ...payload,
          countryCode: countryCode.toLowerCase(),
        });

        return results;
      })
      // eslint-disable-next-line no-unused-vars
      .catch((e) => {
        // console.error(e);
        // console.log(`Error in geocode ${JSON.stringify(e)}`);
        reject();
      });
  });
}
