"use client";

import { useState, useCallback, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import Link from "next/link";
import industryHierarchy from "./industry_hierarchy.json" assert { type: "json" };
import { useRouter } from 'next/router'; // 必要に応じてインポート
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

// interface QueryParams { ... }（不要なコードはコメントアウト）

interface IndustryData {
  現状: string;
  将来性と課題: string;
  競合と差別化: string;
  Exit先検討: string;
  バリューアップ施策: string;
  "M&A事例": string;
  SWOT分析: string;
}

interface ValuationOutput {
  revenue_current: number;
  revenue_forecast: number;
  ebitda_current: number | null;
  ebitda_forecast: number | null;
  net_debt_current: number;
  net_debt_forecast: number;
  equity_value_current: number;
  equity_value_forecast: number;
  ev_current: number;
  ev_forecast: number;
  entry_multiple_current: string | null;
  entry_multiple_forecast: string | null;
  industry_median_multiple_current: string | null;
  industry_median_multiple_forecast: string | null;
}

// 型定義
interface Summaries {
  [key: string]: string;
}

interface KeyMapping {
  [key: string]: string;
}

// ★★【変更点①】★★
// ChatGPTの出力テキストにMarkdown見出しが付与されていない場合、
// 特定キーワード（例："強み", "弱み", "機会", "脅威", "SWOT分析", "Strengths", "Weaknesses", "Opportunities", "Threats"）で始まる行に対して
// 先頭に「### 」を挿入することで、Markdownの見出しとして認識させる前処理関数を追加
const preprocessChatGPT = (text: string): string => {
  const headingKeywords = ["強み", "弱み", "機会", "脅威", "SWOT", "SWOT分析", "Strengths", "Weaknesses", "Opportunities", "Threats"];
  const lines = text.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    // すでにMarkdown記法（#）で始まっていなければ、特定キーワードで始まる場合は「### 」を挿入
    if (!trimmed.startsWith("#")) {
      for (const keyword of headingKeywords) {
        if (trimmed.startsWith(keyword)) {
          return "### " + trimmed;
        }
      }
    }
    return line;
  });
  return processedLines.join("\n");
};

const IndexPage = () => {
  // 各種ローディング状態・エラーメッセージなど
  const [isLoadingInvestigate, setIsLoadingInvestigate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<Record<string, boolean>>({});
  const [isRegeneratingPerplexity, setIsRegeneratingPerplexity] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [summarizeError, setSummarizeError] = useState("");
  const [perplexityError, setPerplexityError] = useState("");
  const [regenerateError, setRegenerateError] = useState("");
  const [exportError, setExportError] = useState("");  
  const [valuationError, setValuationError] = useState("");
  const [regeneratePerplexityError, setRegeneratePerplexityError] = useState("");
  const handleBack = () => {
    window.location.reload(); // ページリロードで状態リセット
  };

  // ユーザー入力状態
  const [perplexitySummaries, setPerplexitySummaries] = useState<Record<string, string>>({});
  const [chatgptSummaries, setChatgptSummaries] = useState<Record<string, string>>({});
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRevenueChange = (
    value: string, 
    setValue: (val: string) => void, 
    allowNegative: boolean = false,
    fieldName: string
  ) => {
    let sanitizedValue = value;
    
    if (allowNegative) {
      sanitizedValue = value.replace(/[^0-9.-]/g, "");
      sanitizedValue = sanitizedValue.replace(/(?!^)-/g, "");
    } else {
      sanitizedValue = value.replace(/[^0-9.]/g, "");
    }
    
    if (allowNegative) {
      const regex = /^-?\d*\.?\d*$/;
      if (!regex.test(sanitizedValue)) {
        setErrors((prev) => ({ ...prev, [fieldName]: "有効な数値を入力してください。" }));
      } else {
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      }
    } else {
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(sanitizedValue)) {
        setErrors((prev) => ({ ...prev, [fieldName]: "有効な数値を入力してください。" }));
      } else {
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      }
    }
    
    setValue(sanitizedValue);
  };

  const [summaries, setSummaries] = useState<Record<string, string>>({});  
  const [errorMessage, setErrorMessage] = useState("");

  const [valuationData, setValuationData] = useState<
    { label: string; current: number | string | null; forecast: number | string | null; highlight?: boolean }[]
  >([]);

  const BASE_URL = "https://investment-backend.azurewebsites.net/";

  // PerplexityセクションとChatGPTセクションの開閉状態
  const [isOpenPerplexity, setIsOpenPerplexity] = useState<Record<string, boolean>>({});
  const [isOpenChatGPT, setIsOpenChatGPT] = useState<Record<string, boolean>>({});

  // プロンプトの状態（ChatGPT用）
  const [prompts, setPrompts] = useState<Record<string, string>>({
    現状: `業界の現状を説明してください。`,
    将来性と課題: `業界の将来性や抱えている課題を説明してください。`,
    競合と差別化: `業界の競合情報および株式会社サンプルの差別化要因を教えてください。`,
    Exit先検討: `株式会社サンプルのExit先はどのような相手が有力でしょうか？`,
    バリューアップ施策: `株式会社サンプルのバリューアップ施策をDX関連とその他に分けて教えてください。`,
    "M&A事例": `業界のM&A事例について過去実績、将来の見込みを教えてください。`,
    SWOT分析: `株式会社サンプルのSWOT分析をお願いします。`,
  });

  // Perplexity用プロンプト
  const [promptsPerplexity, setPromptsPerplexity] = useState<Record<string, string>>({
    現状: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。検討にあたり事業内容及び業界について詳しく教えてください。`,
    将来性と課題: `私たちは投資ファンドを運営しており、${smallCategory || "△△業界"}に属する企業の買収を検討しています。業界の趨勢、将来性、抱えている課題について教えてください。`,
    競合と差別化: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。業界の競合状況及び差別化要因を教えてください。`,
    Exit先検討: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。Exit先はどのような相手が有力でしょうか。`,
    バリューアップ施策: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。有力なバリューアップ施策についてDX関連とその他に分けて教えてください。`,
    "M&A事例": `私たちは投資ファンドを運営しており、${smallCategory || "△△業界"}に属する企業の買収を検討しています。業界のM&A事例について過去実績、将来の見込みを教えてください。`,
    SWOT分析: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。${companyName || "〇〇株式会社"}のSWOT分析をお願いします。難しい場合は業界の一般的なSWOT分析をお願いします。`,
  });

  // セクションのトグル関数
  const togglePerplexitySection = (key: string) => {
    setIsOpenPerplexity(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleChatGPTSection = (key: string) => {
    setIsOpenChatGPT(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [includePerplexity, setIncludePerplexity] = useState(true);
  const keyMapping: Record<string, string> = {
    現状: "current_situation",
    将来性と課題: "future_outlook",
    競合と差別化: "investment_advantages",
    Exit先検討: "investment_disadvantages",
    バリューアップ施策: "value_up",
    "M&A事例": "use_case",
    SWOT分析: "swot_analysis",
  };

  // ★★【変更点②】★★
  // ChatGPTの出力テキストに対して、preprocessChatGPT関数を適用してMarkdown見出しを付与する処理
  // ※Perplexityの出力はそのまま利用
  const processChatGPTText = (text: string): string => {
    return preprocessChatGPT(text);
  };

  // 以下、各APIコール関数（Word出力、ChatGPT再生成、Perplexity再生成など）はそのまま

  const handleWordExport = async () => {
    setIsExporting(true);
    setExportError("");
    try {
      console.log("Sending Perplexity summaries:", perplexitySummaries);
      console.log("Sending ChatGPT summaries:", chatgptSummaries);
      console.log("Sending valuation data:", valuationData);
    
      const transformedPerplexitySummaries: Record<string, string> = { ...perplexitySummaries };
      const transformedChatgptSummaries: Record<string, string> = { ...chatgptSummaries };
    
      const transformedValuationData: Record<string, { current: string; forecast: string }> = valuationData.reduce(
        (acc, item) => {
          acc[item.label] = {
            current: item.current !== null ? item.current.toString() : "不明",
            forecast: item.forecast !== null ? item.forecast.toString() : "不明",
          };
          return acc;
        },
        {} as Record<string, { current: string; forecast: string }>
      );
    
      const response = await fetch(
        BASE_URL + `word_export?company_name=${encodeURIComponent(companyName)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summaries: {
              Perplexity: transformedPerplexitySummaries,
              ChatGPT: transformedChatgptSummaries,
            },
            valuation_data: transformedValuationData,
          }),
        }
      );
    
      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Error details:", errorDetails);
        throw new Error("Wordファイルの生成に失敗しました。");
      }
    
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
      setExportError(error instanceof Error ? error.message : "Wordファイル生成中にエラーが発生しました。");
      console.error("handleWordExport: Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSummarize = async (
    multi: boolean = false,
    section: string | null = null
  ): Promise<void> => {
    console.log(`handleSummarize called with multi=${multi}, section=${section}`);
    setSummarizeError("");
    
    if (multi) {
      console.log("Summarizing all sections for ChatGPT.");
      const keys = Object.keys(prompts);
      for (const key of keys) {
        await regenerateSectionChatGPT(key);
      }
    } else if (section) {
      console.log(`Summarizing single section for ChatGPT: ${section}`);
      if (!prompts.hasOwnProperty(section)) {
        setSummarizeError(`指定されたセクションが存在しません: ${section}`);
        console.error(`Section does not exist: ${section}`);
        return;
      }
      await regenerateSectionChatGPT(section);
    } else {
      setSummarizeError("無効なパラメータが渡されました。");
      console.error("Invalid parameters passed to handleSummarize.");
    }
  };
    
  const regenerateSectionChatGPT = async (key: string) => {
    console.log(`Regenerating section: ${key}`);
    const query_key: string = keyMapping[key];
    console.log(`Mapped query_key: ${query_key}`);
    setIsRegenerating((prev) => ({ ...prev, [query_key]: true }));
    
    try {
      const response = await fetch(BASE_URL + "summarize/speeda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry: majorCategory,
          sector: middleCategory,
          category: smallCategory,
          query_type: query_key,
          prompt: prompts[key],
        }),
      });
    
      if (!response.ok) {
        throw new Error(`ChatGPTによる要約データの取得に失敗しました: ${key}`);
      }
    
      const data = await response.json();
      console.log(`Received data for ${key}:`, data[query_key]);
    
      setChatgptSummaries((prevSummaries) => ({
        ...prevSummaries,
        [query_key]: data[query_key] || "内容がありません",
      }));
    } catch (error) {
      setSummarizeError((prev) =>
        `${prev}\n${error instanceof Error ? error.message : "ChatGPT要約処理中にエラーが発生しました。"}`
      );
      console.error(`Error regenerating section ${key}:`, error);
    } finally {
      setIsRegenerating((prev) => ({ ...prev, [query_key]: false }));
      console.log(`Completed regenerating section: ${key}`);
    }
  };

  const handleSummarizePerplexity = async (
    multi: boolean = false,
    section: string | null = null
  ): Promise<void> => {
    console.log(`handleSummarizePerplexity called with multi=${multi}, section=${section}`);
    setPerplexityError("");
    
    if (multi) {
      console.log("Summarizing all sections for Perplexity.");
      const keys = Object.keys(promptsPerplexity);
      for (const key of keys) {
        await regenerateSectionPerplexity(key);
      }
    } else if (section) {
      console.log(`Summarizing single section for Perplexity: ${section}`);
      if (!promptsPerplexity.hasOwnProperty(section)) {
        setPerplexityError(`指定されたセクションが存在しません: ${section}`);
        console.error(`Section does not exist: ${section}`);
        return;
      }
      await regenerateSectionPerplexity(section);
    } else {
      setPerplexityError("無効なパラメータが渡されました。");
      console.error("Invalid parameters passed to handleSummarizePerplexity.");
    }
  };
    
  const regenerateSectionPerplexity = async (key: string) => {
    console.log(`Regenerating section: ${key}`);
    const query_key: string = keyMapping[key];
    console.log(`Mapped query_key: ${query_key}`);
    setIsRegeneratingPerplexity((prev) => ({ ...prev, [query_key]: true }));
    
    try {
      const response = await fetch(BASE_URL + "summarize/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query_type: query_key,
          prompt: promptsPerplexity[key],
        }),
      });
    
      if (!response.ok) {
        throw new Error(`Perplexityによる要約データの取得に失敗しました: ${key}`);
      }
    
      const data = await response.json();
      console.log(`Received data for ${key}:`, data[query_key]);
    
      setPerplexitySummaries((prevSummaries) => ({
        ...prevSummaries,
        [query_key]: data[query_key] || "内容がありません",
      }));
    } catch (error) {
      setPerplexityError((prev) =>
        `${prev}\n${error instanceof Error ? error.message : "Perplexity要約処理中にエラーが発生しました。"}`
      );
      console.error(`Error regenerating section ${key}:`, error);
    } finally {
      setIsRegeneratingPerplexity((prev) => ({ ...prev, [query_key]: false }));
      console.log(`Completed regenerating section: ${key}`);
    }
  };

  const handleInvestigate = async () => {
    setIsLoadingInvestigate(true);
    setSummarizeError("");
    setPerplexityError("");
    setValuationError("");
  
    try {
      await handleSummarize(true, "");
      console.log("ChatGPTによる要約が完了しました。");
      await handleSummarizePerplexity(true, "");
      console.log("Perplexityによる要約が完了しました。");
      await fetchValuationData();
      console.log("バリュエーションデータの取得が完了しました。");
      alert("調査が完了しました。");
    } catch (error) {
      console.error("handleInvestigate: Error:", error);
    } finally {
      setIsLoadingInvestigate(false);
    }
  };

  const fetchValuationData = async () => {
    try {
      const payload = {
        revenue_current: parseFloat(revenueCurrent) || 0,
        revenue_forecast: parseFloat(revenueForecast) || 0,
        ebitda_current: ebitdaCurrent ? parseFloat(ebitdaCurrent) : null,
        ebitda_forecast: ebitdaForecast ? parseFloat(ebitdaForecast) : null,
        net_debt_current: parseFloat(netDebtCurrent) || 0,
        equity_value_current: parseFloat(equityValueCurrent) || 0,
        category: smallCategory,
      };

      const response = await fetch(BASE_URL+"valuation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Error details:", errorDetails);
        throw new Error("バリュエーションデータの取得に失敗しました。");
      }

      const data: ValuationOutput = await response.json();
      console.log("Response data:", data);
      setValuationData([
        { label: "売上", current: data.revenue_current, forecast: data.revenue_forecast },
        { label: "EBITDA", current: data.ebitda_current, forecast: data.ebitda_forecast },
        { label: "NetDebt", current: data.net_debt_current, forecast: data.net_debt_forecast },
        { label: "想定EquityValue", current: data.equity_value_current, forecast: data.equity_value_forecast },
        { label: "EV", current: data.ev_current, forecast: data.ev_forecast, highlight: true },
        { label: "エントリーマルチプル", current: data.entry_multiple_current, forecast: data.entry_multiple_forecast, highlight: true },
        { label: "マルチプル業界中央値", current: data.industry_median_multiple_current, forecast: data.industry_median_multiple_forecast },
      ]);
    } catch (error) {
      setValuationError(error instanceof Error ? error.message : "バリュエーションデータ取得中にエラーが発生しました。");
      console.error("fetchValuationData: Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("Summaries after rendering:", summaries);
    console.log("Perplexity Summaries after rendering:", perplexitySummaries);

    setPrompts({
      現状: `業界の現状を説明してください。`,
      将来性と課題: `業界の将来性や抱えている課題を説明してください。`,
      競合と差別化: `業界の競合情報および${companyName || "株式会社サンプル"}の差別化要因を教えてください。`,
      Exit先検討: `${companyName || "株式会社サンプル"}のExit先はどのような相手が有力でしょうか？`,
      バリューアップ施策: `${companyName || "株式会社サンプル"}のバリューアップ施策をDX関連とその他に分けて教えてください。`,
      "M&A事例": `業界のM&A事例について過去実績、将来の見込みを教えてください。`,
      SWOT分析: `${companyName || "株式会社サンプル"}のSWOT分析をお願いします。`,
    });

    const industryName = smallCategory || "△△業界";

    setPromptsPerplexity({
      現状: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。検討にあたり事業内容及び業界について詳しく教えてください。`,
      将来性と課題: `私たちは投資ファンドを運営しており、${industryName}に属する企業の買収を検討しています。業界の趨勢、将来性、抱えている課題について教えてください。`,
      競合と差別化: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。業界の競合状況及び差別化要因を教えてください。`,
      Exit先検討: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。Exit先はどのような相手が有力でしょうか。`,
      バリューアップ施策: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。有力なバリューアップ施策についてDX関連とその他に分けて教えてください。`,
      "M&A事例": `私たちは投資ファンドを運営しており、${industryName}に属する企業の買収を検討しています。業界のM&A事例について過去実績、将来の見込みを教えてください。`,
      SWOT分析: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（住所：${address} 主要事業：${businessDescription || "△△事業"}）の買収を検討しています。${companyName || "〇〇株式会社"}のSWOT分析をお願いします。難しい場合は業界の一般的なSWOT分析をお願いします。`,
    });
  }, [companyName, businessDescription, smallCategory]);

  // Summariesを日本語キーに変換
  const transformedSummaries: Record<string, string> = Object.entries(summaries).reduce(
    (acc, [key, value]) => {
      const japaneseKey = Object.keys(keyMapping).find((k) => keyMapping[k] === key) || key;
      acc[japaneseKey] = value;
      return acc;
    },
    {} as Record<string, string>
  );
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center pt-12">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">A3 AI Reconnoiter</h1>

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
              <input
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: ソフトウェア開発、ITコンサルティング"
                style={{ color: "black" }}
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

        <div>
          <label className="block pt-10">
            <span className="text-gray-700">バリュエーション（百万円）</span>
          </label>
        </div>

        {/* 財務データ入力 */}
        <div className="grid grid-cols-2 gap-8 mt-4">
          {/* 売上 */}
          <div>
            <label className="block mb-4">
              <span className="text-gray-700">売上（直近期）</span>
              <input
                type="text"
                value={revenueCurrent}
                onChange={(e) => handleRevenueChange(e.target.value, setRevenueCurrent, false, 'revenueCurrent')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 100"
                style={{ color: "black" }}
              />
            </label>
          </div>
          <div>
            <label className="block mb-4">
              <span className="text-gray-700">売上（進行期見込）</span>
              <input
                type="text"
                value={revenueForecast}
                onChange={(e) => handleRevenueChange(e.target.value, setRevenueForecast, false, 'revenueForecast')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 150"
                style={{ color: "black" }}
              />
            </label>
          </div>
          {/* EBITDA */}
          <div>
            <label className="block mb-4">
              <span className="text-gray-700">EBITDA（直近期）</span>
              <input
                type="text"
                value={ebitdaCurrent}
                onChange={(e) => handleRevenueChange(e.target.value, setEbitdaCurrent, true, 'ebitdaCurrent')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 20または -20"
                style={{ color: "black" }}
              />
              {errors.ebitdaCurrent && <p className="text-red-500 text-sm mt-1">{errors.ebitdaCurrent}</p>}
            </label>
          </div>
          <div>
            <label className="block mb-4">
              <span className="text-gray-700">EBITDA（進行期見込）</span>
              <input
                type="text"
                value={ebitdaForecast}
                onChange={(e) => handleRevenueChange(e.target.value, setEbitdaForecast, true, 'ebitdaForecast')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 30または -30"
                style={{ color: "black" }}
              />
              {errors.ebitdaForecast && <p className="text-red-500 text-sm mt-1">{errors.ebitdaForecast}</p>}
            </label>
          </div>
          {/* NetDebt */}
          <div>
            <label className="block mb-20">
              <span className="text-gray-700">NetDebt（直近期）</span>
              <input
                type="text"
                value={netDebtCurrent}
                onChange={(e) => handleRevenueChange(e.target.value, setNetDebtCurrent, true, 'netDebtCurrent')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 50または -50"
                style={{ color: "black" }}
              />
              {errors.netDebtCurrent && <p className="text-red-500 text-sm mt-1">{errors.netDebtCurrent}</p>}
            </label>
          </div>
          <div>
            <label className="block mb-20">
              <span className="text-gray-700">想定EquityValue</span>
              <input
                type="text"
                value={equityValueCurrent}
                onChange={(e) => handleRevenueChange(e.target.value, setEquityValueCurrent, false, 'equityValueCurrent')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="例: 45"
                style={{ color: "black" }}
              />
            </label>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="w-1/2 bg-[#CCCCCC] text-white py-4 rounded-md font-bold hover:bg-[#07061B]"
            onClick={handleInvestigate}
            disabled={isLoadingInvestigate}
          >
            {isLoadingInvestigate ? "調査中..." : "調査開始"}
          </button>
        </div>
      </div>
      
      {/* 調査結果セクション */}
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3 mt-12 mb-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>
        <hr className="my-8 border-t-2 border-gray-300" />

        {/* Perplexity分析セクション */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-4">Perplexity 分析</h2>
        {perplexityError && <p className="text-red-600 mb-4">Perplexity要約エラー: {perplexityError}</p>}
        {regeneratePerplexityError && <p className="text-red-600 mb-4">Perplexity再生成エラー: {regeneratePerplexityError}</p>}
        {Object.keys(prompts).map((key, index) => {
          const mappedKey = keyMapping[key];
          const summary = perplexitySummaries[mappedKey];
          return (
            <div key={key} className="mb-5">
              <div className="flex justify-between items-center">
                <h2
                  className="text-xl font-normal text-gray-700 cursor-pointer"
                  onClick={() => togglePerplexitySection(key)}
                >
                  {index + 1} {key} {isOpenPerplexity[key] ? "▲" : "▼"}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSummarizePerplexity(false, key)}
                    className="bg-[#999999] text-white py-1 px-4 rounded-md hover:bg-[#404040]"
                    disabled={isRegeneratingPerplexity[mappedKey] || false}
                  >
                    {isRegeneratingPerplexity[mappedKey] ? "生成中..." : "再生成"}
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={promptsPerplexity[key]}
                  onChange={(e) => setPromptsPerplexity({ ...promptsPerplexity, [key]: e.target.value })}
                  className="block w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              {isOpenPerplexity[key] && (
                <ReactMarkdown
                  className="markdown-content font-noto-sans-jp text-base text-gray-800 mt-4"
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    table: ({ node, ...props }) => (
                      <table className="min-w-full bg-white border border-gray-300 mt-4" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="py-2 px-4 border-b bg-[#EFEFEF] text-black text-left" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="py-2 px-4 border-b text-black" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 mb-0" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 mb-0" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      // 変更点③:
                      // ChatGPTの出力でプレプロセスした「見出し」としてのh3は、
                      // 太字化するがフォントサイズは継承（他のテキストと同一サイズ）するようにスタイルを上書き
                      <p style={{ fontWeight: "normal", fontSize: "inherit", margin: "1em 0" }} {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="font-bold text-lg my-4" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-lg" {...props} />
                    ),
                  }}
                >
                  {summary || "データがありません"}
                </ReactMarkdown>
              )}
            </div>
          );
        })}

        {/* ChatGPT分析セクション */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-12 pb-4">ChatGPT+SPEEDA 分析</h2>
        {summarizeError && <p className="text-red-600 mb-4">ChatGPT要約取得エラー: {summarizeError}</p>}
        {regenerateError && <p className="text-red-600 mb-4">ChatGPT再生成エラー: {regenerateError}</p>}
        {Object.keys(prompts).map((key, index) => {
          const mappedKey = keyMapping[key];
          const summary = chatgptSummaries[mappedKey];
          return (
            <div key={key} className="mb-5">
              <div className="flex justify-between items-center">
                <h2
                  className="text-xl font-normal text-gray-700 cursor-pointer"
                  onClick={() => toggleChatGPTSection(key)}
                >
                  {index + 1} {key} {isOpenChatGPT[key] ? "▲" : "▼"}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSummarize(false, key)}
                    className="bg-[#999999] text-white py-1 px-4 rounded-md hover:bg-[#404040]"
                    disabled={isRegenerating[mappedKey] || false}
                  >
                    {isRegenerating[mappedKey] ? "生成中..." : "再生成"}
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
              {isOpenChatGPT[key] && (
                <ReactMarkdown
                  className="markdown-content font-noto-sans-jp text-base text-gray-800 mt-4 pre-wrap"
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    table: ({ node, ...props }) => (
                      <table className="min-w-full bg-white border border-gray-300 mt-4" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="py-2 px-4 border-b bg-[#EFEFEF] text-black text-left" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="py-2 px-4 border-b text-black" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 mb-0" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 mb-0" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      // 変更点③:
                      // ChatGPTの出力テキストに対してpreprocessChatGPTを適用して見出しとして処理しているが、
                      // デザインは太字かつ通常テキストと同一サイズにするように上書き
                      <p style={{ fontWeight: "bold", fontSize: "inherit", margin: "1em 0" }} {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="font-bold text-lg my-4" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-lg" {...props} />
                    ),
                  }}
                >
                  {summary ? processChatGPTText(summary) : "データがありません"}
                </ReactMarkdown>
              )}
            </div>
          );
        })}

        {/* バリュエーションセクション */}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        {valuationError && <p className="text-red-600 mb-4">バリュエーションエラー: {valuationError}</p>}
        <div className="mb-6 pt-10">
          <h2 className="text-xl font-bold text-gray-700">バリュエーション</h2>
          <table className="min-w-full bg-white border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b bg-[#EFEFEF] text-black text-left">項目</th>
                <th className="py-2 px-4 border-b bg-[#EFEFEF] text-black text-left">直近実績</th>
                <th className="py-2 px-4 border-b bg-[#EFEFEF] text-black text-left">進行期見込</th>
              </tr>
            </thead>
            <tbody>
              {valuationData.map((item, index) => (
                <tr key={index} className={item.highlight ? "bg-[#D0EEFB]" : ""}>
                  <td className="py-2 px-4 border-b text-black">{item.label}</td>
                  <td className="py-2 px-4 border-b text-black">{item.current}</td>
                  <td className="py-2 px-4 border-b text-black">{item.forecast}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Word出力 */}
        {exportError && <p className="text-red-600 mb-4">Word出力エラー: {exportError}</p>}
        <div className="flex justify-center mt-20">
          <button
            onClick={handleWordExport}
            className="w-1/2 bg-[#CCCCCC] text-white py-4 rounded-md font-bold hover:bg-[#07061B]"
            disabled={isExporting}
          >
            {isExporting ? "ダウンロード中..." : "出力する（Word）"}
          </button>
        </div>

        <div className="flex justify-center mt-0.5">
          <button
            onClick={handleBack}
            className="w-1/2 bg-white text-[#07061B] py-2 rounded-md border border-[#07061B] hover:bg-[#07061B] hover:text-white mt-6 text-center block"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;