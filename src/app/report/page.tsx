"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

  // 売上、EBITDA、NetDebt、EquityValueの取得
  const revenueCurrent = searchParams.get("revenueCurrent") || "0";
  const revenueForecast = searchParams.get("revenueForecast") || "0";
  const ebitdaCurrent = searchParams.get("ebitdaCurrent") || "0";
  const ebitdaForecast = searchParams.get("ebitdaForecast") || "0";
  const netDebtCurrent = searchParams.get("netDebtCurrent") || "0";
  const netDebtForecast = searchParams.get("netDebtForecast") || "0";
  const equityValueCurrent = searchParams.get("equityValueCurrent") || "0";
  const equityValueForecast = searchParams.get("equityValueForecast") || "0";
  const selectedIndustry = searchParams.get("selectedIndustry");

  // EVの計算
  const evCurrent = (parseFloat(netDebtCurrent) + parseFloat(equityValueCurrent)).toLocaleString();
  const evForecast = (parseFloat(netDebtForecast) + parseFloat(equityValueForecast)).toLocaleString();

  // エントリーマルチプルの計算
  const entryMultipleCurrent = (parseFloat(evCurrent.replace(/,/g, "")) / parseFloat(ebitdaCurrent)).toFixed(1) + "x";
  const entryMultipleForecast = (parseFloat(evForecast.replace(/,/g, "")) / parseFloat(ebitdaForecast)).toFixed(1) + "x";


  // 業界データのフェッチ
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
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
  }, [selectedIndustry]);


  // テキスト出力処理
  const handleTextOutput = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          industry: selectedIndustry,
          revenueCurrent,
          revenueForecast,
          ebitdaCurrent,
          ebitdaForecast,
          netDebtCurrent,
          netDebtForecast,
          equityValueCurrent,
          equityValueForecast,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report.");
      }

      const result = await response.json();
      alert(`レポート生成が完了しました: ${result.message}`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("レポート生成に失敗しました。");
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {/* エラーメッセージの表示 */}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        {industryData && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">① 対象会社および事業内容に関する説明</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.current_situation}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">② 業界の将来の見立て</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.future_outlook}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">③ 投資メリットとデメリット</h2>
              <p className="text-base text-gray-800 mt-2">メリット: {industryData.investment_advantages}</p>
              <p className="text-base text-gray-800 mt-2">デメリット: {industryData.investment_disadvantages}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">④ DXによるバリューアップ仮説</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.value_up_hypothesis}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">⑤ 業界の課題</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.industry_challenges}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">⑥ 成長ドライバー</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.growth_drivers}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">⑦ 財務分析</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.financial_analysis}</p>
            </div>
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