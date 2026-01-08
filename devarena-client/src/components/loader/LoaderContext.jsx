import { createContext, useContext, useEffect, useState } from "react";
import { attachLoader } from "../../apis/axios"; 

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    attachLoader(setLoading); 
  }, []);

  return (
    <LoaderContext.Provider value={{ loading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
