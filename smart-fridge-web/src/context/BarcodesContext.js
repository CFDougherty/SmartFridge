// src/context/BarcodesContext.js
import React, { createContext } from "react";
import axios from "axios";

export const BarcodesContext = createContext();

export const BarcodesProvider = ({ children }) => {
  const BASE_URL = "http://localhost:5001/barcodes/lookup";

  const lookupBarcode = async (code) => {
    try {
      const res = await axios.get(`${BASE_URL}/${code}`);
      // Expect: { found: boolean, productName: string }
      return res.data;
    } catch (error) {
      console.error("Barcode lookup error:", error);
      return { found: false, productName: "" };
    }
  };

  return (
    <BarcodesContext.Provider value={{ lookupBarcode }}>
      {children}
    </BarcodesContext.Provider>
  );
};
