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

  // フィールドデータ
  const revenueCurrent = searchParams.get("revenueCurrent") || "0";
  const revenueForecast = searchParams.get("revenueForecast") || "0";
  const ebitdaCurrent = searchParams.get("ebitdaCurrent") || "0";
  const ebitdaForecast = searchParams.get("ebitdaForecast") || "0";
  const netDebtCurrent = searchParams.get("netDebtCurrent") || "0";
  const netDebtForecast = searchParams.get("netDebtForecast") || "0";
  const equityValueCurrent = searchParams.get("equityValueCurrent") || "0";
  const equityValueForecast = searchParams.get("equityValueForecast") || "0";

  // EV計算
  const evCurrent = (parseFloat(netDebtCurrent) + parseFloat(equityValueCurrent)).toLocaleString();
  const evForecast = (parseFloat(netDebtForecast) + parseFloat(equityValueForecast)).toLocaleString();

  // ステート
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [prompts, setPrompts] = useState<Record<string, string>>({
    current_situation: "対象会社および事業内容に関する説明を記入してください。",
    future_outlook: "業界の将来の見立てを記入してください。",
    investment_advantages: "投資メリットについて記入してください。",
    investment_disadvantages: "投資デメリットについて記入してください。",
    value_up_hypothesis: "DXによるバリューアップ仮説を記入してください。",
    industry_challenges: "業界の課題について記入してください。",
    growth_drivers: "成長ドライバーについて記入してください。",
    financial_analysis: "財務分析について記入してください。",
  });

  // 初回のモックデータ設定
  useEffect(() => {
    if (!selectedIndustry) {
      setErrorMessage("業界情報が指定されていません。");
      return;
    }

    const mockData: IndustryData = {
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

    setIndustryData(mockData);
    setErrorMessage("");
  }, [selectedIndustry]);

  // トグル処理
  const toggleSection = (key: string) => {
    setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 再生成処理
  const handleRegenerate = async (key: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompts[key],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("再生成に失敗しました。");
      }

      const data = await response.json();

      setIndustryData((prev) => {
        const updatedData: IndustryData = {
          current_situation: prev?.current_situation || "",
          future_outlook: prev?.future_outlook || "",
          investment_advantages: prev?.investment_advantages || "",
          investment_disadvantages: prev?.investment_disadvantages || "",
          value_up_hypothesis: prev?.value_up_hypothesis || "",
          industry_challenges: prev?.industry_challenges || "",
          growth_drivers: prev?.growth_drivers || "",
          financial_analysis: prev?.financial_analysis || "",
          ev_ebitda_median: prev?.ev_ebitda_median || "",
        };

        return { ...updatedData, [key]: data.summary || "" };
      });
    } catch (error) {
      console.error(error);
      alert("要約の再生成に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        {industryData &&
          Object.keys(industryData).map((key, index) => (
            <div key={key} className="mb-6">
              <div className="flex justify-between items-center">
                <h2
                  className="text-xl font-bold text-gray-700 cursor-pointer"
                  onClick={() => toggleSection(key)}
                >
                  {index + 1} {key.replace(/_/g, " ")} {isOpen[key] ? "▲" : "▼"}
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
                  onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })}
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {isOpen[key] && (
                <p className="text-base text-gray-800 mt-4">{industryData[key as keyof IndustryData]}</p>
              )}
            </div>
          ))}

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