"use client";

import { useCallback, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface IndustryData {
  現状: string;
  将来性と課題: string;
  競合と差別化: string;
  Exit先検討: string;
  バリューアップ施策: string;
  ユースケース: string;
  SWOT分析: string;
}

interface QueryParams {
  companyName: string;
  revenueCurrent: number;
  revenueForecast: number;
  ebitdaCurrent: number;
  ebitdaForecast: number;
  netDebtCurrent: number;
  netDebtForecast: number;
  equityValueCurrent: number;
  equityValueForecast: number;
  majorCategory?: string;
  middleCategory?: string;
  smallCategory?: string;
}

const ReportPageContent = () => {
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState("");
  const selectedIndustry = searchParams.get("selectedIndustry");
  const [isOpenIndustry, setIsOpenIndustry] = useState(false);
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [prompts, setPrompts] = useState<Record<string, string>>({
    現状: `業界の現状を説明してください。`,
    将来性と課題: `業界の将来性や抱えている課題を説明してください。`,
    競合と差別化: `業界の競合情報および${companyName}の差別化要因を教えてください。`,
    Exit先検討: `${companyName}のExit先はどのような相手が有力でしょうか？`,
    バリューアップ施策: `${companyName}のバリューアップ施策をDX関連とその他に分けて教えてください。`,
    ユースケース: `業界のM&A事例について過去実績、将来の見込みを教えてください。`,
    SWOT分析: `${companyName}のSWOT分析をお願いします。`,
  });
  
  const [revenueCurrent, setRevenueCurrent] = useState<number | null>(null);
  const [revenueForecast, setRevenueForecast] = useState<number | null>(null);
  const [ebitdaCurrent, setEbitdaCurrent] = useState<number | null>(null);
  const [ebitdaForecast, setEbitdaForecast] = useState<number | null>(null);
  const [netDebtCurrent, setNetDebtCurrent] = useState<number | null>(null);
  const [netDebtForecast, setNetDebtForecast] = useState<number | null>(null);
  const [equityValueCurrent, setEquityValueCurrent] = useState<number | null>(null);
  const [equityValueForecast, setEquityValueForecast] = useState<number | null>(null);

  const [majorCategory, setMajorCategory] = useState("");
  const [middleCategory, setMiddleCategory] = useState("");
  const [smallCategory, setSmallCategory] = useState("");
  const [includePerplexity, setIncludePerplexity] = useState(true);

  const handleAddPerplexity = async (key: string) => {
    try {
      // Perplexity要約のためのAPIリクエスト
      const response = await fetch("/summarize/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: companyName, // 必要なデータ
          query_key: key,
          industry: majorCategory, // 業界情報
          chatgpt_summary: summaries[key], // 初回要約を送信
        }),
      });
  
      if (!response.ok) {
        throw new Error("Perplexityによる要約追加に失敗しました。");
      }
  
      const data = await response.json();
  
      // 取得した統合要約を保存
      setSummaries((prev) => ({
        ...prev,
        [key]: data.final_summary, // APIから返却された統合要約
      }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Perplexity追加処理中にエラーが発生しました。");
    }
  };

  const handleRegenerate = async (key: string) => {
    try {
      // 再生成APIへのリクエストを送信
      const response = await fetch("/regenerate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry: majorCategory,
          sector: middleCategory,
          category: smallCategory,
          company_name: companyName,
          include_perplexity: includePerplexity,
          query_key: key,
          custom_query: prompts[key], // カスタムプロンプトを使用
          perplexity_summary: summaries[key], // 現在のPerplexityサマリーを送信
        }),
      });
  
      if (!response.ok) {
        throw new Error("再生成処理に失敗しました。");
      }
  
      // 再生成された要約を取得
      const data = await response.json();
      setSummaries((prevSummaries) => ({
        ...prevSummaries,
        [key]: data.final_summary, // 再生成された要約を更新
      }));
      alert(`再生成が完了しました: ${key}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "再生成処理中にエラーが発生しました。");
    }
  };

  // Word出力APIコール関数
  const handleWordExport = async () => {
    try {
      const response = await fetch(`/word_export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summaries, // 要約データを送信
          company_name: companyName,
        }),
      });

      if (!response.ok) {
        throw new Error("Wordファイルの生成に失敗しました。");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${companyName}_summary_report.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Wordファイル生成中にエラーが発生しました。");
    }
  };

  const [summaries, setSummaries] = useState<Record<string, string>>({});  const [errorMessage, setErrorMessage] = useState("");
  const [valuationData, setValuationData] = useState<
  { label: string; current: number | null; forecast: number | null; highlight?: boolean }[]
>([]);


      // 要約データ取得関数
    const fetchSummaries = useCallback(async () => {
      try {
        const response = await fetch("/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            industry: majorCategory,
            sector: middleCategory,
            category: smallCategory,
            company_name: companyName,
            include_perplexity: includePerplexity,
          }),
        });
    
        if (!response.ok) {
          throw new Error("要約データの取得に失敗しました。");
        }
    
        const data = await response.json();
        setSummaries(data.summaries);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "要約処理中にエラーが発生しました。");
      }
    }, [majorCategory, middleCategory, smallCategory, companyName, includePerplexity]);  
   
    // バリュエーションデータ取得関数
    const fetchValuationData = async () => {
      try {
        const response = await fetch("/valuation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: companyName,
            ebitda_current: ebitdaCurrent,
            ebitda_forecast: ebitdaForecast,
            net_debt_current: netDebtCurrent,
            net_debt_forecast: netDebtForecast,
            equity_value_current: equityValueCurrent,
            equity_value_forecast: equityValueForecast,
          }),
        });
  
        if (!response.ok) {
          throw new Error("バリュエーションデータの取得に失敗しました。");
        }
  
        const data = await response.json();
        setValuationData([
          { label: "EBITDA", current: ebitdaCurrent, forecast: ebitdaForecast },
          { label: "NetDebt", current: netDebtCurrent, forecast: netDebtForecast },
          { label: "想定EquityValue", current: equityValueCurrent, forecast: equityValueForecast },
          { label: "EV", current: data.calculations.ev_current, forecast: data.calculations.ev_forecast, highlight: true },
          { label: "エントリーマルチプル", current: data.calculations.entry_multiple_current, forecast: data.calculations.entry_multiple_forecast },
          { label: "マルチプル業界中央値", current: data.calculations.industry_median_multiple_current, forecast: data.calculations.industry_median_multiple_forecast },
        ]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "バリュエーションデータ取得中にエラーが発生しました。");
      }
    };


useEffect(() => {
  if (companyName && majorCategory && middleCategory && smallCategory) {
    fetchSummaries();
    fetchValuationData();
  }
}, [companyName, majorCategory, middleCategory, smallCategory, fetchSummaries, fetchValuationData]);
  
  const toggleSection = (key: string) => {
    setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };




  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>
  
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
  
        <hr className="my-8 border-t-2 border-gray-300" />
  
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ChatGPT＋Perplexity</h2>
  
    {/* データが取得できた場合 */}
    {industryData ? (
      Object.keys(industryData).map((key, index) => (
        <div key={key} className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => toggleSection(key)}
            >
              {index + 1} {key} {isOpen[key] ? "▲" : "▼"}
            </h2>
            <div className="flex space-x-2">
              {/* Perplexityで要約を追加ボタン */}
              <button
                onClick={() => handleAddPerplexity(key)}
                className="bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700"
              >
                Perplexityで要約を追加
              </button>
              {/* 再生成ボタン */}
              <button
                onClick={() => handleRegenerate(key)}
                className="bg-gray-700 text-white py-1 px-4 rounded-md hover:bg-gray-800"
              >
                再生成
              </button>
            </div>
          </div>
          <div className="mt-2">
            <input
              type="text"
              value={prompts[key]}
              onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })}
              className="block w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          {isOpen[key] && (
            <p className="text-base text-gray-800 mt-4">{industryData[key as keyof IndustryData]}</p>
          )}
        </div>
      ))
    ) : (
      // ローディング状態の表示
      <p className="text-gray-500 text-center">データを取得中...</p>
    )}

        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

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
              {valuationData.map((item, index) => (
                <tr key={index} className={item.highlight ? "bg-indigo-100" : ""}>
                  <td className="py-2 px-4 border-b text-black">{item.label}</td>
                  <td className="py-2 px-4 border-b text-black">{item.current}</td>
                  <td className="py-2 px-4 border-b text-black">{item.forecast}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleWordExport}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Word出力
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