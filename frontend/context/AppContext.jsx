import { createContext, useState } from "react";

export const AppContent = createContext();

export const AppProvider = ({ children }) => {
  const [isLoggedin, setIsLoggedin] = useState(false);

  // Your backend URL
  const backendUrl = "http://localhost:4000"; // replace with your deployed backend if needed

  return (
    <AppContent.Provider value={{ backendUrl, isLoggedin, setIsLoggedin }}>
      {children}
    </AppContent.Provider>
  );
};
