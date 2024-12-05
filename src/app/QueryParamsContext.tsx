"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface QueryParams {
  companyName: string;
  revenueCurrent: number;
  revenueForecast: number;
  ebitdaCurrent: number;
  ebitdaForecast: number;
  netDebtCurrent: number;
  netDebtForecast: number;
  equityValueCurrent: number;
  equityValueForecast: number;
  majorCategory?: string;
  middleCategory?: string;
  smallCategory?: string;
}

interface QueryParamsContextType {
  queryParams: QueryParams;
  setQueryParams: (params: QueryParams) => void;
}

const defaultQueryParams: QueryParams = {
  companyName: "",
  revenueCurrent: 0,
  revenueForecast: 0,
  ebitdaCurrent: 0,
  ebitdaForecast: 0,
  netDebtCurrent: 0,
  netDebtForecast: 0,
  equityValueCurrent: 0,
  equityValueForecast: 0,
  majorCategory: undefined,
  middleCategory: undefined,
  smallCategory: undefined,
};


const QueryParamsContext = createContext<any>(null);

export const QueryParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryParams, setQueryParams] = useState({});
  return (
    <QueryParamsContext.Provider value={{ queryParams, setQueryParams }}>
      {children}
    </QueryParamsContext.Provider>
  );
};

export const useQueryParams = (): QueryParamsContextType => {
  const context = useContext(QueryParamsContext);
  if (!context) {
    throw new Error("useQueryParams must be used within a QueryParamsProvider");
  }
  return context;
};