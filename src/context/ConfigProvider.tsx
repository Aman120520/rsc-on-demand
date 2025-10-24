import React, { createContext, useEffect, useState, useContext } from "react";

export const AppConfigContext = createContext<any>(null);

const AppConfigProvider = ({ children }: any) => {
  const [appConfig, setAppConfig] = useState<any>(null);

  return (
    <AppConfigContext.Provider
      value={{
        appConfig,
        setAppConfig,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export default AppConfigProvider;

export const useAppConfig = () => useContext(AppConfigContext);
