"use client";

import { useState } from "react";
import Link from "next/link"; // Linkコンポーネントを使う

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

  const [showMiddlePopup, setShowMiddlePopup] = useState(false);
  const [showSmallPopup, setShowSmallPopup] = useState(false);
  const [headOfficeLocation, setHeadOfficeLocation] = useState("");

  const majorCategories: string[] = ["素材・素材加工品", "機械・電気製品", "輸送機械", "食品", "消費財", "小売", "運輸サービス"];

  const middleCategories: Record<string, string[]> = {
    "食品": ["農業", "畜産・水産業", "食品加工", "飲料・たばこ製造"]
  };

  const smallCategories: Record<string, string[]> = {
    "食品加工": ["製糖", "製油", "乳業・乳製品", "水産加工品", "製パン", "菓子", "調味料類", "健康食品"]
  };

  const handleRevenueCurrentChange = (value: string) => {
    const cleanedValue = value.replace(/,/g, ""); // カンマを削除
    setRevenueCurrent(cleanedValue); // 状態を更新
  };

  const handleRevenueForecastChange = (value: string) => {
    const cleanedValue = value.replace(/,/g, ""); // カンマを削除
    setRevenueForecast(cleanedValue); // 状態を更新
  };

  const handleEbitdaCurrentChange = (value: string) => {
    const cleanedValue = value.replace(/,/g, ""); // カンマを削除
    setEbitdaCurrent(cleanedValue); // 状態を更新
  };

  const handleEbitdaForecastChange = (value: string) => {
    const cleanedValue = value.replace(/,/g, ""); // カンマを削除
    setEbitdaForecast(cleanedValue); // 状態を更新
  };

  const handleNetDebtChange = (value: string) => {
    const cleanedValue = value.replace(/,/g, ""); // カンマを削除
    setNetDebt(cleanedValue); // 状態を更新
  };

  const handleEquityValueChange = (value: string) => {
    const cleanedValue = value.replace(/,/g, ""); // カンマを削除
    setEquityValue(cleanedValue); // 状態を更新
  };

  const handleMajorCategoryChange = (category: string) => {
    setMajorCategory(category);
    setShowMiddlePopup(true);
    setMiddleCategory("");
    setSmallCategory("");
  };

  const handleMiddleCategoryChange = (category: string) => {
    setMiddleCategory(category);
    setShowMiddlePopup(false);
    if (category === "食品加工") {
      setShowSmallPopup(true);
    }
  };

  const handleSmallCategoryChange = (category: string) => {
    console.log("Setting smallCategory to:", category); // デバッグログ
    const newIndustry = `${majorCategory} > ${middleCategory} > ${category}`;
    setSelectedIndustries([newIndustry]); // 1つの業界のみを保存
    setSmallCategory(category);
    setShowSmallPopup(false);
  };
  
  const removeIndustry = (industry: string) => {
    setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
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

          {showMiddlePopup && (
            <div className="col-span-2 popup bg-white p-4 shadow-lg rounded-lg">
              <h2 className="text-lg font-bold">中分類を選択</h2>
              {middleCategories[majorCategory]?.map((category) => (
                <button
                  key={category}
                  onClick={() => handleMiddleCategoryChange(category)}
                  className="block p-2 bg-gray-200 rounded-md my-2"
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {showSmallPopup && (
            <div className="col-span-2 popup bg-white p-4 shadow-lg rounded-lg">
              <h2 className="text-lg font-bold">小分類を選択</h2>
              {smallCategories[middleCategory]?.map((category) => (
                <button
                  key={category}
                  onClick={() => handleSmallCategoryChange(category)}
                  className="block p-2 bg-gray-200 rounded-md my-2"
                >
                  {category}
                </button>
              ))}
            </div>
          )}

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
