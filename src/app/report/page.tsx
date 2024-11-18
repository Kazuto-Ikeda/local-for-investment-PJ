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
}

const ReportPageContent = () => {
  const searchParams = useSearchParams();
  const companyName = searchParams ? searchParams.get("companyName") || "株式会社虎屋" : "株式会社虎屋";
  const selectedIndustry = searchParams.get("selectedIndustry");

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
  });

  const revenueCurrent = searchParams.get("revenueCurrent") || "0";
  const revenueForecast = searchParams.get("revenueForecast") || "0";
  const ebitdaCurrent = searchParams.get("ebitdaCurrent") || "0";
  const ebitdaForecast = searchParams.get("ebitdaForecast") || "0";
  const netDebtCurrent = searchParams.get("netDebtCurrent") || "0";
  const netDebtForecast = searchParams.get("netDebtForecast") || "0";
  const equityValueCurrent = searchParams.get("equityValueCurrent") || "0";
  const equityValueForecast = searchParams.get("equityValueForecast") || "0";

  const evCurrent = (parseFloat(netDebtCurrent) + parseFloat(equityValueCurrent)).toLocaleString();
  const evForecast = (parseFloat(netDebtForecast) + parseFloat(equityValueForecast)).toLocaleString();

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
    };

    setIndustryData(mockData);
    setErrorMessage("");
  }, [selectedIndustry]);

  const toggleSection = (key: string) => {
    setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerate = (key: string) => {
    alert(`再生成: ${prompts[key]}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <hr className="my-8 border-t-2 border-gray-300" />

        <h2 className="text-2xl font-bold text-gray-800 mb-4">ChatGPT＋Perplexity</h2>

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
          {/* トグルでの表示内容 */}
          {isOpenIndustry && industryData && (
            <div className="text-base text-gray-800 mt-4">
              <strong>① 現状と将来の見立て</strong><br /><br />
              <strong>現状</strong><br />
              {industryData.current_situation}<br /><br />
              <strong>将来の見立て</strong><br />
              {industryData.future_outlook}<br /><br />
              <strong>② 投資対象としてのメリットとデメリット</strong><br /><br />
              <strong>メリット</strong><br />
              {industryData.investment_advantages}<br /><br />
              <strong>デメリット</strong><br />
              {industryData.investment_disadvantages}<br /><br />
              <strong>③ DX（デジタルトランスフォーメーション）によるバリューアップ</strong><br /><br />
              <strong>DXによるバリューアップの可能性</strong><br />
              {industryData.value_up_hypothesis}
            </div>
          )}
        </div>

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