"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ReportPageContent = () => {
  const searchParams = useSearchParams();

  // 入力ページから取得したデータ
  const companyName = searchParams ? searchParams.get("companyName") || "株式会社虎屋" : "株式会社虎屋";
  const primaryBusiness = searchParams ? searchParams.get("primaryBusiness") || "和菓子製造販売" : "和菓子製造販売";
  const selectedIndustry = searchParams.get("selectedIndustry");

  // 業界データのフェッチ
  const [industryData, setIndustryData] = useState(null);
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
        const data = await response.json();
        setIndustryData(data);
      } catch (error) {
        setErrorMessage("業界データの取得に失敗しました。");
      }
    };

    fetchData();
  }, [selectedIndustry]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          {companyName} 調査結果
        </h1>

        {errorMessage && <p className="text-red-600">{errorMessage}</p>}

        {industryData && (
          <div>
            {/* 各セクションの表示 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">① 対象会社および事業内容に関する説明</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.current_situation}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">② 業界に関する最新動向や競合状況</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.future_outlook}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">③ 業界のM&A動向</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.investment_advantages}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">④ 対象会社の優位性・独自性・将来性</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.value_up_hypothesis}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">⑤ 業界の課題</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.industry_challenges}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">⑥ 業界の成長ドライバー</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.growth_drivers}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-700">⑦ 対象会社の財務データに基づく分析</h2>
              <p className="text-base text-gray-800 mt-2">{industryData.financial_analysis}</p>
            </div>
          </div>
        )}

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