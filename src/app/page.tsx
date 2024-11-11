"use client";

import { useState, useEffect} from "react";
import Link from "next/link"; // Linkコンポーネントを使う
import industryHierarchy from "./industry_hierarchy.json";

const IndexPage = () => {
  const [companyName, setCompanyName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [revenueCurrent, setRevenueCurrent] = useState("");
  const [revenueForecast, setRevenueForecast] = useState("");
  const [ebitdaCurrent, setEbitdaCurrent] = useState("");
  const [ebitdaForecast, setEbitdaForecast] = useState("");
  const [netDebt, setNetDebt] = useState("");
  const [equityValue, setEquityValue] = useState("");

  const [majorCategory, setMajorCategory] = useState("");
  const [middleCategory, setMiddleCategory] = useState("");
  const [smallCategory, setSmallCategory] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const [middleCategories, setMiddleCategories] = useState<string[]>([]);
  const [smallCategories, setSmallCategories] = useState<string[]>([]);
  const [showMiddlePopup, setShowMiddlePopup] = useState(false);
  const [showSmallPopup, setShowSmallPopup] = useState(false);
  const [headOfficeLocation, setHeadOfficeLocation] = useState("");

  // Major Category (大分類) のデータ取得
  const majorCategories = Object.keys(industryHierarchy);

  const handleRevenueChange = (value: string, setValue: (val: string) => void) => {
    setValue(value.replace(/,/g, "")); // カンマを削除して値を設定
  };

  const handleMajorCategoryChange = (category: string) => {
    setMajorCategory(category);
    setMiddleCategory("");
    setSmallCategory("");
    setShowMiddlePopup(true);
    setShowSmallPopup(false);
    setMiddleCategories(Object.keys(industryHierarchy[category] || {}));
  };

  const handleMiddleCategoryChange = (category: string) => {
    setMiddleCategory(category);
    setSmallCategory("");
    setShowMiddlePopup(false);
    setShowSmallPopup(true);
    setSmallCategories(industryHierarchy[majorCategory][category] || []);
  };

  const handleSmallCategoryChange = (category: string) => {
    setSmallCategory(category);
    setShowSmallPopup(false);
    const newIndustry = `${majorCategory} > ${middleCategory} > ${category}`;
    setSelectedIndustries([newIndustry]); // 一つだけ選択
  };

  const removeIndustry = (industry: string) => {
    setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    setMajorCategory("");     // 大分類の選択を解除
    setMiddleCategory("");    // 中分類の選択を解除
    setSmallCategory("");     // 小分類の選択を解除
    setMiddleCategories([]);  // 中分類リストをリセット
    setSmallCategories([]);   // 小分類リストをリセット
  };

  console.log("Selected Industry:", smallCategory);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">【仮】A3 Investment Reconnoiter</h1>

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
              />
            </label>
          </div>

          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">本社所在地</span>
              <input
                type="text"
                value={headOfficeLocation}
                onChange={(e) => setHeadOfficeLocation(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 東京都千代田区平河町"
              />
            </label>
          </div>

          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">事業内容</span>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: ソフトウェア開発事業"
              />
            </label>
          </div>

          {/* 大分類 */}
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

          {/* 中分類 */}
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

          {/* 小分類 */}
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

          {/* 選択された業種 */}
          <div className="col-span-2">
            <span className="text-gray-700">選択された業種</span>
            <ul className="mt-2">
              {selectedIndustries.map((industry) => (
                <li key={industry} className="flex justify-between items-center">
                  {industry}
                  <button
                    onClick={() => removeIndustry(industry)}
                    className="text-red-500 ml-2"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 売上、EBITDAなどの入力フィールド */}
          <div>
            <label className="block mb-4">
              <span className="text-gray-700">売上（直近期, 百万円）</span>
              <input
                type="text"
                value={revenueCurrent}
                onChange={(e) => handleRevenueCurrentChange(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 100"
              />
            </label>
          </div>

          <div>
            <label className="block mb-4">
              <span className="text-gray-700">売上（進行期見込, 百万円）</span>
              <input
                type="text"
                value={revenueForecast}
                onChange={(e) => handleRevenueForecastChange(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 120"
              />
            </label>
          </div>

          <div>
            <label className="block mb-4">
              <span className="text-gray-700">EBITDA（直近期, 百万円）</span>
              <input
                type="text"
                value={ebitdaCurrent}
                onChange={(e) => handleEbitdaCurrentChange(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 20"
              />
            </label>
          </div>

          <div>
            <label className="block mb-4">
              <span className="text-gray-700">EBITDA（進行期見込, 百万円）</span>
              <input
                type="text"
                value={ebitdaForecast}
                onChange={(e) => handleEbitdaForecastChange(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 25"
              />
            </label>
          </div>

          <div>
            <label className="block mb-4">
              <span className="text-gray-700">NetDebt（直近, 百万円）</span>
              <input
                type="text"
                value={netDebt}
                onChange={(e) => handleNetDebtChange(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 5"
              />
            </label>
          </div>

          <div>
            <label className="block mb-6">
              <span className="text-gray-700">想定EquityValue（百万円）</span>
              <input
                type="text"
                value={equityValue}
                onChange={(e) => handleEquityValueChange(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 30"
              />
            </label>
          </div>
        </div>

        {/* Linkを使用してreportページに遷移 */}
        <Link
          href={{
            pathname: "/report",
            query: {
              companyName: companyName || "株式会社サンプル",
              revenueCurrent: parseFloat(revenueCurrent) || 0,
              revenueForecast: parseFloat(revenueForecast) || 0,
              ebitdaCurrent: parseFloat(ebitdaCurrent) || 0,
              ebitdaForecast: parseFloat(ebitdaForecast) || 0,
              netDebtCurrent: parseFloat(netDebt) || 0,
              netDebtForecast: parseFloat(netDebt) || 0,
              equityValueCurrent: parseFloat(equityValue) || 0,
              equityValueForecast: parseFloat(equityValue) || 0,
              selectedIndustry: smallCategory || undefined,
            },
          }}
          onClick={() => {
            console.log("調査開始ボタンがクリックされました");
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
