"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface IndustryData {
  [key: string]: string; // 各セクションのプロンプトに対応
}

const ReportPageContent = () => {
  const searchParams = useSearchParams();
  const companyName = searchParams.get("companyName") || "株式会社虎屋";
  const selectedIndustry = searchParams.get("selectedIndustry");

  // 初期データの設定
  const initialPrompts = {
    current_situation: "対象会社の概要や事業内容について説明してください。",
    future_outlook: "業界の将来の見立てを説明してください。",
    investment_advantages: "業界への投資メリットを教えてください。",
    investment_disadvantages: "業界への投資デメリットを教えてください。",
    value_up_hypothesis: "DXによるバリューアップ仮説を説明してください。",
    industry_challenges: "業界が抱える課題を説明してください。",
    growth_drivers: "業界の成長ドライバーについて説明してください。",
    financial_analysis: "業界の財務分析について説明してください。",
  };

  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>(
    Object.keys(initialPrompts).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  useEffect(() => {
    const mockData: IndustryData = {
      current_situation: "現在の業界は安定した成長を遂げています。",
      future_outlook: "将来的にはさらなる需要が見込まれます。",
      investment_advantages: "市場規模が大きく、多様な顧客層があります。",
      investment_disadvantages: "競合が多く、価格競争が激化しています。",
      value_up_hypothesis: "DXにより効率化が図られ、利益率の向上が期待されます。",
      industry_challenges: "規制対応が課題となっています。",
      growth_drivers: "新興国市場の拡大が成長ドライバーとなっています。",
      financial_analysis: "財務健全性が高く、収益性が良好です。",
    };
    setIndustryData(mockData);
  }, []);

  const handlePromptChange = (key: string, value: string) => {
    setPrompts({ ...prompts, [key]: value });
  };

  const handleRegenerate = (key: string) => {
    alert(`再生成中: ${prompts[key]}`);
    // 実際の再生成ロジックをここに追加します
  };

  const toggleSection = (key: string) => {
    setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {industryData &&
          Object.keys(initialPrompts).map((key, index) => (
            <div className="mb-6" key={key}>
              <div className="flex justify-between items-center">
                <h2
                  className="text-xl font-bold text-gray-700 cursor-pointer"
                  onClick={() => toggleSection(key)}
                >
                  {index + 1} {initialPrompts[key]} {isOpen[key] ? "▲" : "▼"}
                </h2>
                <button
                  onClick={() => handleRegenerate(key)}
                  className="bg-gray-700 text-white py-1 px-4 rounded-md"
                >
                  再生成
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={prompts[key]}
                  onChange={(e) => handlePromptChange(key, e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  placeholder={`再生成用のプロンプトを入力`}
                />
              </div>
              {isOpen[key] && (
                <p className="text-base text-gray-800 mt-4">{industryData[key]}</p>
              )}
            </div>
          ))}

        <div className="text-center mt-6">
          <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">
            テキスト出力
          </button>
        </div>
        <Link
          href="/"
          className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 mt-6 text-center block"
        >
          戻る
        </Link>
      </div>
    </div>
  );
};

const ReportPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ReportPageContent />
  </Suspense>
);

export default ReportPage;