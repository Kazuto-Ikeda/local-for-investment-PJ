"use client";

import { useState, useCallback, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import Link from "next/link";
import industryHierarchy from "./industry_hierarchy.json" assert { type: "json" };

// interface QueryParams {
//   companyName: string;
//   revenueCurrent: number;
//   revenueForecast: number;
//   ebitdaCurrent: number;
//   ebitdaForecast: number;
//   netDebtCurrent: number;
//   netDebtForecast: number;
//   equityValueCurrent: number;
//   equityValueForecast: number;
//   industryMedianMultipleCurrent: number;
//   industryMedianMultipleForecast: number;
//   majorCategory?: string;
//   middleCategory?: string;
//   smallCategory?: string;
// }

interface IndustryData {
  現状: string;
  将来性と課題: string;
  競合と差別化: string;
  Exit先検討: string;
  バリューアップ施策: string;
  ユースケース: string;
  SWOT分析: string;
}


const IndexPage = () => {
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [revenueCurrent, setRevenueCurrent] = useState("");
  const [revenueForecast, setRevenueForecast] = useState("");
  const [ebitdaCurrent, setEbitdaCurrent] = useState("");
  const [ebitdaForecast, setEbitdaForecast] = useState("");
  const [netDebtCurrent, setNetDebtCurrent] = useState("");
  const [netDebtForecast, setNetDebtForecast] = useState("");
  const [equityValueCurrent, setEquityValueCurrent] = useState("");
  const [equityValueForecast, setEquityValueForecast] = useState("");
  const [industryMedianMultipleCurrent, setIndustryMedianMultipleCurrent] = useState<string>("");
  const [industryMedianMultipleForecast, setIndustryMedianMultipleForecast] = useState<string>("");


  const [majorCategory, setMajorCategory] = useState("");
  const [middleCategory, setMiddleCategory] = useState("");
  const [smallCategory, setSmallCategory] = useState("");
  const [middleCategories, setMiddleCategories] = useState<string[]>([]);
  const [smallCategories, setSmallCategories] = useState<string[]>([]);

  const majorCategories = Object.keys(industryHierarchy);

  const handleMajorCategoryChange = (category: string) => {
    setMajorCategory(category);
    setMiddleCategory("");
    setSmallCategory("");
    setMiddleCategories(
      Object.keys(industryHierarchy[category as keyof typeof industryHierarchy] || {})
    );
    setSmallCategories([]);
  };

  const handleMiddleCategoryChange = (category: string) => {
    setMiddleCategory(category);
    setSmallCategory("");
    setSmallCategories(
      (industryHierarchy[majorCategory as keyof typeof industryHierarchy] as {
        [key: string]: string[];
      })[category] || []
    );
  };

  const handleSmallCategoryChange = (category: string) => {
    setSmallCategory(category);
  };

  const handleRevenueChange = (value: string, setValue: (val: string) => void) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, ""); // 数値とピリオドのみ許可
    setValue(sanitizedValue);
  };

  // const queryParams: QueryParams = {
  //   companyName: companyName || "株式会社サンプル",
  //   revenueCurrent: parseFloat(revenueCurrent) || 0,
  //   revenueForecast: parseFloat(revenueForecast) || 0,
  //   ebitdaCurrent: parseFloat(ebitdaCurrent) || 0,
  //   ebitdaForecast: parseFloat(ebitdaForecast) || 0,
  //   netDebtCurrent: parseFloat(netDebtCurrent) || 0,
  //   netDebtForecast: parseFloat(netDebtForecast) || 0,
  //   equityValueCurrent: parseFloat(equityValueCurrent) || 0,
  //   equityValueForecast: parseFloat(equityValueForecast) || 0,
  //   industryMedianMultipleCurrent: parseFloat(industryMedianMultipleCurrent) || 0, 
  //   industryMedianMultipleForecast: parseFloat(industryMedianMultipleForecast) || 0,
  //   majorCategory: majorCategory || undefined,
  //   middleCategory: middleCategory || undefined,
  //   smallCategory: smallCategory || undefined,
  // };

    // const searchParams = useSearchParams();
    // const selectedIndustry = searchParams.get("selectedIndustry");
    const [isOpenIndustry, setIsOpenIndustry] = useState(false);
    const [industryData, setIndustryData] = useState<IndustryData | null>(null);
    const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
    const [prompts, setPrompts] = useState<Record<string, string>>({
      現状: `業界の現状を説明してください。`,
      将来性と課題: `業界の将来性や抱えている課題を説明してください。`,
      競合と差別化: `業界の競合情報および株式会社サンプルの差別化要因を教えてください。`,
      Exit先検討: `株式会社サンプルのExit先はどのような相手が有力でしょうか？`,
      バリューアップ施策: `株式会社サンプルのバリューアップ施策をDX関連とその他に分けて教えてください。`,
      ユースケース: `業界のM&A事例について過去実績、将来の見込みを教えてください。`,
      SWOT分析: `株式会社サンプルのSWOT分析をお願いします。`,
    });    
    const [includePerplexity, setIncludePerplexity] = useState(true);
    const keyMapping: Record<string, string> = {
      現状: "current_situation",
      将来性と課題: "future_outlook",
      競合と差別化: "investment_advantages",
      Exit先検討: "investment_disadvantages",
      バリューアップ施策: "value_up",
      ユースケース: "use_case",
      SWOT分析: "swot_analysis",
    };
    
    
  
  
  
    const handleAddPerplexity = async (key: string) => {
      try {
        // Perplexity要約のためのAPIリクエスト
        const response = await fetch("https://investment-backend.azurewebsites.net/summarize/perplexity", {
          method: "POST",
          mode: "cors",
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
        const response = await fetch("https://investment-backend.azurewebsites.net/regenerate-summary", {
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
        console.log("Sending summaries:", summaries);
        console.log("Sending valuation data:", valuationData);
    
        // 日本語キーに変換した要約データを生成
        const transformedSummaries: Record<string, string> = Object.entries(summaries).reduce(
          (acc, [key, value]) => {
            const japaneseKey = Object.keys(keyMapping).find((k) => keyMapping[k] === key) || key;
            acc[japaneseKey] = value || "内容がありません"; // データが空の場合のフォールバック
            return acc;
          },
          {} as Record<string, string>
        );
    
        // バリュエーションデータをフォーマット
        const transformedValuationData: Record<string, string> = valuationData.reduce(
          (acc, item) => {
            acc[item.label] = `現在値: ${item.current ?? "不明"}, 予測値: ${item.forecast ?? "不明"}`;
            return acc;
          },
          {} as Record<string, string>
        );
    
        // エンドポイントにリクエストを送信
        const response = await fetch(
          `https://investment-backend.azurewebsites.net/word_export?company_name=${encodeURIComponent(companyName)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summaries: transformedSummaries, // 日本語のキーで送信
              valuation_data: transformedValuationData, // フォーマット済みのバリュエーションデータ
            }),
          }
        );
    
        if (!response.ok) {
          const errorDetails = await response.text();
          console.error("Error details:", errorDetails);
          throw new Error("Wordファイルの生成に失敗しました。");
        }
    
        // レスポンスからWordファイルをダウンロード
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${companyName || "デフォルト会社名"}_summary_report.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
        setErrorMessage(error instanceof Error ? error.message : "Wordファイル生成中にエラーが発生しました。");
      }
    };

    const [summaries, setSummaries] = useState<Record<string, string>>({});  
    const [errorMessage, setErrorMessage] = useState("");

    const [valuationData, setValuationData] = useState<
    { label: string; current: number | null; forecast: number | null; highlight?: boolean }[]
  >([]);
  
  
  const handleSummarize = async () => {
    try {
      const response = await fetch("https://investment-backend.azurewebsites.net/summarize", {
        method: "POST",
        mode: "cors",
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
  
      const data: { summaries: Record<string, { chatgpt_summary: string }> } = await response.json();
  
      console.log("Fetched summaries (raw):", data.summaries);
  
      const transformedSummaries: Record<string, string> = Object.entries(data.summaries).reduce(
        (acc, [key, value]) => {
          acc[key] = value.chatgpt_summary;
          return acc;
        },
        {} as Record<string, string>
      );
  
      console.log("Transformed summaries:", transformedSummaries);
  
      setSummaries((prev) => {
        console.log("Previous summaries:", prev);
        console.log("New summaries being set:", transformedSummaries);
        return transformedSummaries;
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "要約処理中にエラーが発生しました。");
    }
  };  
  
      // バリュエーションデータ取得関数
      const fetchValuationData = async () => {
        setIsLoading(true);

        try {
          const test = JSON.stringify({
            revenue_current: parseFloat(revenueCurrent) || 0,
            revenue_forecast: parseFloat(revenueForecast) || 0,
            ebitda_current: ebitdaCurrent ? parseFloat(ebitdaCurrent) : null,
            ebitda_forecast: ebitdaForecast ? parseFloat(ebitdaForecast) : null,
            net_debt_current: parseFloat(netDebtCurrent) || 0,
            equity_value_current: parseFloat(equityValueCurrent) || 0,
            category: smallCategory,
          })

          console.log(test)

          
          const response = await fetch("https://investment-frontend.azurewebsites.net/valuation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: test
          });
      
          if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Error details:", errorDetails);
            console.log(smallCategory);
            throw new Error("バリュエーションデータの取得に失敗しました。");
          }
      
          const data = await response.json();
          console.log("Response data:", data)
      
          setValuationData([
            { label: "EBITDA", current: data.ebitda_current, forecast: data.ebitda_forecast },
            { label: "NetDebt", current: data.net_debt_current, forecast: data.net_debt_forecast },
            { label: "想定EquityValue", current: data.equity_value_current, forecast: data.equity_value_forecast },
            { label: "EV", current: data.ev_current, forecast: data.ev_forecast, highlight: true },
            { label: "エントリーマルチプル", current: data.entry_multiple_current, forecast: data.entry_multiple_forecast },
            { label: "マルチプル業界中央値", current: data.industry_median_multiple_current, forecast: data.industry_median_multiple_forecast },
            { label: "Implied Equity Value", current: data.implied_equity_value_current, forecast: data.implied_equity_value_forecast },
          ]);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "バリュエーションデータ取得中にエラーが発生しました。");
        } finally {
          setIsLoading(false);
        }
      };
      
      

  // useEffect(() => {
  //   if (companyName && majorCategory && middleCategory && smallCategory) {
      // fetchSummaries();
  //     fetchValuationData();
  //   }
  // }, [companyName, majorCategory, middleCategory, smallCategory, fetchSummaries, fetchValuationData]);
    
  useEffect(() => {
    console.log("Summaries after rendering:", summaries);    // companyName の変更を反映
    setPrompts({
      現状: `業界の現状を説明してください。`,
      将来性と課題: `業界の将来性や抱えている課題を説明してください。`,
      競合と差別化: `業界の競合情報および${companyName || "株式会社サンプル"}の差別化要因を教えてください。`,
      Exit先検討: `${companyName || "株式会社サンプル"}のExit先はどのような相手が有力でしょうか？`,
      バリューアップ施策: `${companyName || "株式会社サンプル"}のバリューアップ施策をDX関連とその他に分けて教えてください。`,
      ユースケース: `業界のM&A事例について過去実績、将来の見込みを教えてください。`,
      SWOT分析: `${companyName || "株式会社サンプル"}のSWOT分析をお願いします。`,
    });
  }, [companyName],); // companyName の変更を監視

    const toggleSection = (key: string) => {
      setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
    };

  // Summaries を日本語キーに変換
  const transformedSummaries: Record<string, string> = Object.entries(summaries).reduce(
    (acc, [key, value]) => {
      const japaneseKey = Object.keys(keyMapping).find((k) => keyMapping[k] === key) || key;
      acc[japaneseKey] = value;
      return acc;
    },
    {} as Record<string, string>
  );
  
  
  



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">FundamentAI β版</h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">対象会社名</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 株式会社サンプル"
                style={{ color: "black" }}
              />
            </label>
          </div>

          {/* 会社住所 */}
          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">会社住所</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 東京都千代田区丸の内1-1-1"
                style={{ color: "black" }}
              />
            </label>
          </div>

          {/* 事業内容 */}
          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">事業内容</span>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: ソフトウェア開発、ITコンサルティング"
                style={{ color: "black" }}
                rows={4}
              />
            </label>
          </div>

          <div className="col-span-2">
            <label className="block mb-4">
              <span className="text-gray-700">業界 - 大分類</span>
              <div className="mt-2 grid grid-cols-3 gap-4">
                {majorCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleMajorCategoryChange(category)}
                    className={`p-2 border rounded-md text-sm ${
                      majorCategory === category ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </label>
          </div>

          {majorCategory && (
            <div className="col-span-2">
              <label className="block mb-4">
                <span className="text-gray-700">業界 - 中分類</span>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {middleCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleMiddleCategoryChange(category)}
                      className={`p-2 border rounded-md text-sm ${
                        middleCategory === category ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          )}

          {middleCategory && (
            <div className="col-span-2">
              <label className="block mb-4">
                <span className="text-gray-700">業界 - 小分類</span>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {smallCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleSmallCategoryChange(category)}
                      className={`p-2 border rounded-md text-sm ${
                        smallCategory === category ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          )}
        </div>

    {/* 財務データ入力 */}
    <div className="grid grid-cols-2 gap-8 mt-8">
    {/* 売上 */}
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">売上（直近期, 百万円）</span>
        <input
          type="text"
          value={revenueCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setRevenueCurrent)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 100"
          style={{ color: "black" }}
        />
      </label>
    </div>
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">売上（進行期見込, 百万円）</span>
        <input
          type="text"
          value={revenueForecast}
          onChange={(e) => handleRevenueChange(e.target.value, setRevenueForecast)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 150"
          style={{ color: "black" }}
        />
      </label>
    </div>
    {/* EBITDA */}
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">EBITDA（直近期, 百万円）</span>
        <input
          type="text"
          value={ebitdaCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setEbitdaCurrent)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 20"
          style={{ color: "black" }}
        />
      </label>
    </div>
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">EBITDA（進行期見込, 百万円）</span>
        <input
          type="text"
          value={ebitdaForecast}
          onChange={(e) => handleRevenueChange(e.target.value, setEbitdaForecast)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 30"
          style={{ color: "black" }}
        />
      </label>
    </div>
    {/* NetDebt */}
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">NetDebt（直近期, 百万円）</span>
        <input
          type="text"
          value={netDebtCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setNetDebtCurrent)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 50"
          style={{ color: "black" }}
        />
      </label>
    </div>
    <div>
      <label className="block mb-4">
        <span className="text-gray-700">想定EquityValue（百万円）</span>
        <input
          type="text"
          value={equityValueForecast}
          onChange={(e) => handleRevenueChange(e.target.value, setEquityValueForecast)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="例: 45"
          style={{ color: "black" }}
        />
      </label>
    </div>

    </div>
        {/* <Link */}
          {/* href={{
            pathname: "/report",
          }}
        > */}
          <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900"
                onClick={() => {
                  handleSummarize();
                  fetchValuationData();
                }
      }>
            調査開始
          </button>

          {isLoading && <p className="text-blue-500 mt-4">Loading...</p>} {/* ローディングメッセージ */}

        {/* </Link> */}
    </div>
      
    <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <hr className="my-8 border-t-2 border-gray-300" />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">ChatGPT（＋Perplexity）要約分析</h2>

      {/* データが取得できた場合 */}
      {Object.keys(prompts).map((key, index) => {
        const mappedKey = keyMapping[key]; // 日本語キーを英語キーに変換
        const summary = summaries[mappedKey]; // summariesからデータを取得

        return (
          <div key={key} className="mb-6">
            <div className="flex justify-between items-center">
              <h2
                className="text-xl font-bold text-gray-700 cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                {index + 1} {key} {isOpen[key] ? "▲" : "▼"}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddPerplexity(mappedKey)}
                  className="bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700"
                >
                  Perplexityで要約を追加
                </button>
                <button
                  onClick={() => handleRegenerate(mappedKey)}
                  className="bg-gray-700 text-white py-1 px-4 rounded-md hover:bg-gray-800"
                >
                  ChatGPTで再生成
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
              <p className="text-base text-gray-800 mt-4">
                {summary || "データがありません"}
              </p>
            )}
          </div>
        );
      })}

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

export default IndexPage;