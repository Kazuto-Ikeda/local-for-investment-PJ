"use client";

import { useState } from "react";
import Link from "next/link";
import industryHierarchy from "./industry_hierarchy.json" assert { type: "json" };

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

const IndexPage = () => {
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [revenueCurrent, setRevenueCurrent] = useState("");
  const [revenueForecast, setRevenueForecast] = useState("");
  const [ebitdaCurrent, setEbitdaCurrent] = useState("");
  const [ebitdaForecast, setEbitdaForecast] = useState("");
  const [netDebtCurrent, setNetDebtCurrent] = useState("");
  const [netDebtForecast, setNetDebtForecast] = useState("");
  const [equityValueCurrent, setEquityValueCurrent] = useState("");
  const [equityValueForecast, setEquityValueForecast] = useState("");


  const [majorCategory, setMajorCategory] = useState("");
  const [middleCategory, setMiddleCategory] = useState("");
  const [smallCategory, setSmallCategory] = useState("");
  const [middleCategories, setMiddleCategories] = useState<string[]>([]);
  const [smallCategories, setSmallCategories] = useState<string[]>([]);

  const majorCategories = Object.keys(industryHierarchy);

  const handleMajorCategoryChange = (category: string) => {
    setMajorCategory(category);
    setMiddleCategory("");
    setSmallCategory("");
    setMiddleCategories(
      Object.keys(industryHierarchy[category as keyof typeof industryHierarchy] || {})
    );
    setSmallCategories([]);
  };

  const handleMiddleCategoryChange = (category: string) => {
    setMiddleCategory(category);
    setSmallCategory("");
    setSmallCategories(
      (industryHierarchy[majorCategory as keyof typeof industryHierarchy] as {
        [key: string]: string[];
      })[category] || []
    );
  };

  const handleSmallCategoryChange = (category: string) => {
    setSmallCategory(category);
  };

  const handleRevenueChange = (value: string, setValue: (val: string) => void) => {
    setValue(value.replace(/,/g, ""));
  };

  const queryParams: QueryParams = {
    companyName: companyName || "株式会社サンプル",
    revenueCurrent: parseFloat(revenueCurrent) || 0,
    revenueForecast: parseFloat(revenueForecast) || 0,
    ebitdaCurrent: parseFloat(ebitdaCurrent) || 0,
    ebitdaForecast: parseFloat(ebitdaForecast) || 0,
    netDebtCurrent: parseFloat(netDebtCurrent) || 0,
    netDebtForecast: parseFloat(netDebtForecast) || 0,
    equityValueCurrent: parseFloat(equityValueCurrent) || 0,
    equityValueForecast: parseFloat(equityValueForecast) || 0,
    majorCategory: majorCategory || undefined,
    middleCategory: middleCategory || undefined,
    smallCategory: smallCategory || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">FundamentAI β版</h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">対象会社名</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 株式会社サンプル"
                style={{ color: "black" }}
              />
            </label>
          </div>

          {/* 会社住所 */}
          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">会社住所</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 東京都千代田区丸の内1-1-1"
                style={{ color: "black" }}
              />
            </label>
          </div>

          {/* 事業内容 */}
          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">事業内容</span>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: ソフトウェア開発、ITコンサルティング"
                style={{ color: "black" }}
                rows={4}
              />
            </label>
          </div>

          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">業界 - 大分類</span>
              <div className="mt-2 grid grid-cols-3 gap-4">
                {majorCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleMajorCategoryChange(category)}
                    className={`p-2 border rounded-md text-sm ${
                      majorCategory === category ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </label>
          </div>

          {majorCategory && (
            <div className="col-span-2">
              <label className="block mb-4">
                <span className="text-gray-700">業界 - 中分類</span>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {middleCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleMiddleCategoryChange(category)}
                      className={`p-2 border rounded-md text-sm ${
                        middleCategory === category ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          )}

          {middleCategory && (
            <div className="col-span-2">
              <label className="block mb-4">
                <span className="text-gray-700">業界 - 小分類</span>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {smallCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleSmallCategoryChange(category)}
                      className={`p-2 border rounded-md text-sm ${
                        smallCategory === category ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          )}
        </div>

    {/* 財務データ入力 */}
    <div className="grid grid-cols-2 gap-8 mt-8">
    {/* 売上 */}
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">売上（直近期, 百万円）</span>
        <input
          type="text"
          value={revenueCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setRevenueCurrent)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 100"
          style={{ color: "black" }}
        />
      </label>
    </div>
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">売上（進行期見込, 百万円）</span>
        <input
          type="text"
          value={revenueForecast}
          onChange={(e) => handleRevenueChange(e.target.value, setRevenueForecast)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 150"
          style={{ color: "black" }}
        />
      </label>
    </div>
    {/* EBITDA */}
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">EBITDA（直近期, 百万円）</span>
        <input
          type="text"
          value={ebitdaCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setEbitdaCurrent)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 20"
          style={{ color: "black" }}
        />
      </label>
    </div>
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">EBITDA（進行期見込, 百万円）</span>
        <input
          type="text"
          value={ebitdaForecast}
          onChange={(e) => handleRevenueChange(e.target.value, setEbitdaForecast)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 30"
          style={{ color: "black" }}
        />
      </label>
    </div>
    {/* NetDebt */}
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">NetDebt（直近期, 百万円）</span>
        <input
          type="text"
          value={netDebtCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setNetDebtCurrent)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 50"
          style={{ color: "black" }}
        />
      </label>
    </div>
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">想定EquityValue（百万円）</span>
        <input
          type="text"
          value={equityValueForecast}
          onChange={(e) => handleRevenueChange(e.target.value, setEquityValueForecast)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 45"
          style={{ color: "black" }}
        />
      </label>
    </div>
    </div>
        <Link
          href={{
            pathname: "/report",
          }}
        >
          <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900">
            調査開始
          </button>
        </Link>
      </div>
    </div>
  );
};

export default IndexPage;