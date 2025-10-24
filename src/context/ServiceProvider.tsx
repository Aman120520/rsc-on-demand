import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const ServiceContext = createContext<any>(null);

const ServiceProvider = ({ children }: any) => {
  const [selectedHomeServices, setSelectedHomeServices] = useState([]);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState(null);
  const [isRazorPayActive, setIsRazorPayActive] = useState(false);

  return (
    <ServiceContext.Provider
      value={{
        selectedHomeServices,
        setSelectedHomeServices,
        selectedPackageDetail,
        setSelectedPackageDetail,
        isRazorPayActive,
        setIsRazorPayActive,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export default ServiceProvider;

export const useService = () => useContext(ServiceContext);
