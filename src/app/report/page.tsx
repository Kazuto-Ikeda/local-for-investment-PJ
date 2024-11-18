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
  const evCurrent = (parseFloat(netDebtCurrent) + parseFloat(equityValueCurrent)).toLocaleString();
  const evForecast = (parseFloat(netDebtForecast) + parseFloat(equityValueForecast)).toLocaleString();

  // エントリーマルチプルの計算
  const entryMultipleCurrent = (parseFloat(evCurrent.replace(/,/g, "")) / parseFloat(ebitdaCurrent)).toFixed(1) + "x";
  const entryMultipleForecast = (parseFloat(evForecast.replace(/,/g, "")) / parseFloat(ebitdaForecast)).toFixed(1) + "x";

  // 業界データのフェッチ
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpenIndustry, setIsOpenIndustry] = useState(false);

  // モックデータ
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

  // モックデータ設定
  useEffect(() => {
    setIndustryData(mockIndustryData);
    setErrorMessage(""); // エラーメッセージをクリア
  }, [selectedIndustry]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {/* エラーメッセージの表示 */}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <hr className="my-8 border-t-2 border-gray-300" />

        {/* ChatGPT＋SPEEDAレポート分析 タイトル */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ChatGPT＋SPEEDA分析</h2>

        {/* ①業界分析 */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => setIsOpenIndustry(!isOpenIndustry)}
            >
              ① 業界分析 {isOpenIndustry ? "▲" : "▼"}
            </h2>
          </div>

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

        {/* ②バリュエーション */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-700">② バリュエーション</h2>
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
                <td className="py-2 px-4 border-b">{parseFloat(revenueCurrent).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{parseFloat(revenueForecast).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">EBITDA</td>
                <td className="py-2 px-4 border-b">{parseFloat(ebitdaCurrent).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{parseFloat(ebitdaForecast).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">NetDebt</td>
                <td className="py-2 px-4 border-b">{parseFloat(netDebtCurrent).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{parseFloat(netDebtForecast).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">想定EquityValue</td>
                <td className="py-2 px-4 border-b">{parseFloat(equityValueCurrent).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{parseFloat(equityValueForecast).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b bg-indigo-100">EV</td>
                <td className="py-2 px-4 border-b bg-indigo-100">{evCurrent}</td>
                <td className="py-2 px-4 border-b bg-indigo-100">{evForecast}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b bg-indigo-100">エントリーマルチプル</td>
                <td className="py-2 px-4 border-b bg-indigo-100">{entryMultipleCurrent}</td>
                <td className="py-2 px-4 border-b bg-indigo-100">{entryMultipleForecast}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">マルチプル業界中央値</td>
                <td className="py-2 px-4 border-b">
                  {industryData?.ev_ebitda_median?.replace("倍", "x") || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {industryData?.ev_ebitda_median?.replace("倍", "x") || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* テキスト出力ボタン */}
        <div className="text-center mt-6">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
            onClick={() => alert("テキスト出力機能が呼び出されました。")}
          >
            テキスト出力
          </button>
        </div>

        {/* 戻るリンク */}
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

const ReportPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportPageContent />
    </Suspense>
  );
};

export default ReportPage;