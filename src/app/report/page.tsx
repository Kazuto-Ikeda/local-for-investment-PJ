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

// トグル状態を管理
const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
// プロンプトの初期設定
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

// トグル処理
const toggleSection = (key: string) => {
  setIsOpen((prev) => ({ ...prev, [key]: !prev[key] })); // 開閉状態の切り替え
};

// 再生成処理
const handleRegenerate = (key: string) => {
  alert(`再生成: ${prompts[key]}`); // 実際の再生成処理はAPI連携等で実装
};

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
  const [isOpenIndustry, setIsOpenIndustry] = useState(false);

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

  {industryData &&
    Object.keys(industryData).map((key, index) => (
      <div key={key} className="mb-6">
        {/* トグルセクション */}
        <div className="flex justify-between items-center">
          <h2
            className="text-xl font-bold text-gray-700 cursor-pointer"
            onClick={() => toggleSection(key)} // トグル切り替え
          >
            {index + 1} {key.replace(/_/g, " ")} {isOpen[key] ? "▲" : "▼"}
          </h2>
          {/* 再生成ボタン */}
          <button
            onClick={() => handleRegenerate(key)} // 再生成処理
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
            onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })} // プロンプト更新
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
  
        {/* トグル開閉に対応した表示 */}
        {isOpen[key] && (
          <p className="text-base text-gray-800 mt-4">{industryData[key as keyof IndustryData]}</p>
        )}
      </div>
    ))}

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {/* エラーメッセージ */}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <hr className="my-8 border-t-2 border-gray-300" />

        {/* ChatGPT＋SPEEDAレポート分析 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ChatGPT＋SPEEDA分析</h2>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => setIsOpenIndustry(!isOpenIndustry)}
            >
              業界分析 {isOpenIndustry ? "▲" : "▼"}
            </h2>
          </div>
          {isOpenIndustry && industryData && (
            <div className="text-base text-gray-800 mt-4">
              <strong>現状</strong>: {industryData.current_situation}<br />
              <strong>将来の見立て</strong>: {industryData.future_outlook}<br />
              <strong>メリット</strong>: {industryData.investment_advantages}<br />
              <strong>デメリット</strong>: {industryData.investment_disadvantages}<br />
              <strong>DXによるバリューアップ</strong>: {industryData.value_up_hypothesis}
            </div>
          )}
        </div>

        {/* バリュエーション */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-700">バリュエーション</h2>
          <table className="min-w-full bg-white border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b bg-gray-600 text-gray-200 text-left">項目</th>
                <th className="py-2 px-4 border-b bg-gray-600 text-gray-200 text-left">直近実績</th>
                <th className="py-2 px-4 border-b bg-gray-600 text-gray-200 text-left">進行期見込</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">売上</td>
                <td className="py-2 px-4 border-b">{revenueCurrent}</td>
                <td className="py-2 px-4 border-b">{revenueForecast}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">EBITDA</td>
                <td className="py-2 px-4 border-b">{ebitdaCurrent}</td>
                <td className="py-2 px-4 border-b">{ebitdaForecast}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b bg-indigo-100">EV</td>
                <td className="py-2 px-4 border-b bg-indigo-100">{evCurrent}</td>
                <td className="py-2 px-4 border-b bg-indigo-100">{evForecast}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* テキスト出力 */}
        <div className="text-center mt-6">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
            onClick={() => alert("テキスト出力機能が呼び出されました。")}
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