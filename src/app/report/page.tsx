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
  const companyName = searchParams ? searchParams.get("companyName") || "株式会社虎屋" : "株式会社虎屋"; // 会社名の取得
  const selectedIndustry = searchParams.get("selectedIndustry"); // 選択された業界を取得

  // 売上、EBITDA、NetDebt、EquityValueの取得
  const revenueCurrent = searchParams.get("revenueCurrent") || "0";
  const revenueForecast = searchParams.get("revenueForecast") || "0";
  const ebitdaCurrent = searchParams.get("ebitdaCurrent") || "0";
  const ebitdaForecast = searchParams.get("ebitdaForecast") || "0";
  const netDebtCurrent = searchParams.get("netDebtCurrent") || "0";
  const netDebtForecast = searchParams.get("netDebtForecast") || "0";
  const equityValueCurrent = searchParams.get("equityValueCurrent") || "0";
  const equityValueForecast = searchParams.get("equityValueForecast") || "0";

  // EVの計算
  const evCurrent = (parseFloat(netDebtCurrent) + parseFloat(equityValueCurrent)).toLocaleString(); // 現在のEV
  const evForecast = (parseFloat(netDebtForecast) + parseFloat(equityValueForecast)).toLocaleString(); // 予測EV

  // 業界データのフェッチ用ステート
  const [industryData, setIndustryData] = useState<IndustryData | null>(null); // APIまたはモックデータから取得される業界情報
  const [errorMessage, setErrorMessage] = useState(""); // エラー発生時のメッセージ
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({}); // トグル開閉用の状態
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

  // 業界データを取得するuseEffect
  useEffect(() => {
    if (!selectedIndustry) {
      setErrorMessage("業界情報が指定されていません。"); // 業界未指定の場合のエラー
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summarize?industry=${selectedIndustry}`);
        if (!response.ok) {
          throw new Error("Failed to fetch industry data."); // フェッチ失敗時のエラー
        }
        const data: IndustryData = await response.json();
        setIndustryData(data); // 成功時にデータをステートに格納
      } catch (error) {
        setErrorMessage("業界データの取得に失敗しました。"); // エラー発生時
      }
    };
    fetchData();
  }, [selectedIndustry]);

  // トグル開閉の処理
  const toggleSection = (key: string) => {
    setIsOpen((prev) => ({ ...prev, [key]: !prev[key] })); // セクションごとに開閉状態を更新
  };

  // 再生成処理
  const handleRegenerate = (key: string) => {
    alert(`再生成中: ${prompts[key]}`); // 再生成プロンプトの通知（実装例）
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {/* エラーメッセージの表示 */}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        {/* 業界データを表示 */}
        {industryData &&
          Object.keys(industryData).map((key, index) => (
            <div key={key} className="mb-6">
              <div className="flex justify-between items-center">
                {/* セクションタイトル */}
                <h2
                  className="text-xl font-bold text-gray-700 cursor-pointer"
                  onClick={() => toggleSection(key)} // 開閉トグル
                >
                  {index + 1} {key.replace(/_/g, " ")} {isOpen[key] ? "▲" : "▼"}
                </h2>
                {/* 再生成ボタン */}
                <button
                  onClick={() => handleRegenerate(key)}
                  className="bg-gray-700 text-white py-1 px-4 rounded-md"
                >
                  再生成
                </button>
              </div>

              {/* プロンプト入力欄 */}
              <div className="mt-2">
                <input
                  type="text"
                  value={prompts[key]}
                  onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })} // プロンプトの更新
                  className="block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* セクションコンテンツ（トグル開閉対応） */}
              {isOpen[key] && (
                <p className="text-base text-gray-800 mt-4">{industryData[key as keyof IndustryData]}</p>
              )}
            </div>
          ))}

        {/* テキスト出力ボタン */}
        <div className="text-center mt-6">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
            onClick={() => alert("テキスト出力処理が呼び出されました。")}
          >
            テキスト出力
          </button>
        </div>

        {/* 戻るリンク */}
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