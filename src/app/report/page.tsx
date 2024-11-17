"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface IndustryData {
  current_situation: string;
  future_outlook: string;
  investment_advantages: string;
  investment_disadvantages: string;
  value_up_hypothesis: string;
  industry_challenges: string;
  growth_drivers: string;
  financial_analysis: string;
  ev_ebitda_median?: string;
}

const ReportPageContent = () => {
  const searchParams = useSearchParams();
  const companyName = searchParams ? searchParams.get("companyName") || "株式会社虎屋" : "株式会社虎屋";
  const selectedIndustry = searchParams.get("selectedIndustry");

  // Mock Mode
  const isMockMode = true;

  // State variables
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]); // For toggles

  useEffect(() => {
    if (isMockMode) {
      const mockIndustryData: IndustryData = {
        current_situation: "現在の業界は安定した成長を遂げています。",
        future_outlook: "将来的にはさらなる需要が見込まれます。",
        investment_advantages: "市場規模が大きく、多様な顧客層があります。",
        investment_disadvantages: "競合が多く、価格競争が激化しています。",
        value_up_hypothesis: "DXにより効率化が図られ、利益率の向上が期待されます。",
        industry_challenges: "規制対応が課題となっています。",
        growth_drivers: "新興国市場の拡大が成長ドライバーとなっています。",
        financial_analysis: "財務健全性が高く、収益性が良好です。",
        ev_ebitda_median: "8.4倍",
      };
      setIndustryData(mockIndustryData);
    } else {
      if (!selectedIndustry) {
        setErrorMessage("業界情報が指定されていません。");
        return;
      }
      const fetchData = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summarize?industry=${selectedIndustry}`);
          if (!response.ok) {
            throw new Error("Failed to fetch industry data.");
          }
          const data: IndustryData = await response.json();
          setIndustryData(data);
        } catch (error) {
          setErrorMessage("業界データの取得に失敗しました。");
        }
      };
      fetchData();
    }
  }, [selectedIndustry]);

  const handleToggle = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleRegenerate = (section: string) => {
    alert(`${section} の再生成がリクエストされました。`); // Replace with actual regeneration logic
  };

  const sections = [
    { title: "① 対象会社および事業内容に関する説明", key: "current_situation" },
    { title: "② 業界の将来の見立て", key: "future_outlook" },
    { title: "③ 投資メリットとデメリット", key: "investment_advantages", subKeys: ["investment_disadvantages"] },
    { title: "④ DXによるバリューアップ仮説", key: "value_up_hypothesis" },
    { title: "⑤ 業界の課題", key: "industry_challenges" },
    { title: "⑥ 成長ドライバー", key: "growth_drivers" },
    { title: "⑦ 財務分析", key: "financial_analysis" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        {industryData && (
          <>
            {sections.map((section) => (
              <div key={section.key} className="mb-6">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-xl font-bold text-gray-700 cursor-pointer"
                    onClick={() => handleToggle(section.key)}
                  >
                    {section.title} {expandedSections.includes(section.key) ? "▲" : "▼"}
                  </h2>
                  <button
                    className="bg-gray-700 text-white py-1 px-4 rounded-md hover:bg-gray-800"
                    onClick={() => handleRegenerate(section.title)}
                  >
                    再生成
                  </button>
                </div>
                {expandedSections.includes(section.key) && (
                  <div className="mt-2">
                    <p className="text-base text-gray-800">
                      {industryData[section.key as keyof IndustryData]}
                      {section.subKeys?.map((subKey) => (
                        <span key={subKey} className="block mt-2">
                          {industryData[subKey as keyof IndustryData]}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        <div className="text-center mt-6">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
            onClick={() => alert("テキスト出力処理が呼び出されました。")}
          >
            テキスト出力
          </button>
        </div>

        <Link href="/" className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 mt-6 text-center block">
          戻る
        </Link>
      </div>
    </div>
  );
};

const ReportPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportPageContent />
    </Suspense>
  );
};

export default ReportPage;