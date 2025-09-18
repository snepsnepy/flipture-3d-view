import React, { createContext, useContext } from "react";

const PagesContext = createContext();

export const usePages = () => {
  const context = useContext(PagesContext);
  if (!context) {
    throw new Error("usePages must be used within a PagesProvider");
  }
  return context;
};

export const PagesProvider = ({ children, pages }) => {
  return (
    <PagesContext.Provider value={{ pages }}>{children}</PagesContext.Provider>
  );
};
