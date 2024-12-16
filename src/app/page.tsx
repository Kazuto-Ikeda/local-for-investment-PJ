"use client";

import { useState, useCallback, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import Link from "next/link";
import industryHierarchy from "./industry_hierarchy.json" assert { type: "json" };
import { useRouter } from 'next/router'; // 必要に応じてインポート

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


const IndexPage = () => {
  // 独立したローディング状態
  const [isLoadingInvestigate, setIsLoadingInvestigate] = useState(false); // 調査開始のローディング
  const [isLoading, setIsLoading] = useState(false); // 調査開始のローディング
  // const [isAddingPerplexity, setIsAddingPerplexity] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState<Record<string, boolean>>({});
  const [isRegeneratingPerplexity, setIsRegeneratingPerplexity] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false); // Word出力のローディング

  // 各アクションごとのエラーメッセージ状態変数
  const [summarizeError, setSummarizeError] = useState("");
  const [perplexityError, setPerplexityError] = useState("");
  const [regenerateError, setRegenerateError] = useState("");
  const [exportError, setExportError] = useState("");  
  const [valuationError, setValuationError] = useState("");
  const [regeneratePerplexityError, setRegeneratePerplexityError] = useState("");
  const handleBack = () => {
    window.location.reload(); // ページをリロードして状態をリセット
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

  const handleRevenueChange = (value: string, setValue: (val: string) => void) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, ""); 
    setValue(sanitizedValue);
  };

  const [summaries, setSummaries] = useState<Record<string, string>>({});  
  const [errorMessage, setErrorMessage] = useState("");

  const [valuationData, setValuationData] = useState<
  { label: string; current: number | string | null; forecast: number | string | null; highlight?: boolean }[]
>([]);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  console.log("NEXT_PUBLIC_BASE_URL", BASE_URL, BASE_URL+"summarize/speeda")


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
    // const [isOpenIndustry, setIsOpenIndustry] = useState(false);
    // const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  //ChatGPTのプロンプト
  const [prompts, setPrompts] = useState<Record<string, string>>({
    現状: `業界の現状を説明してください。`,
    将来性と課題: `業界の将来性や抱えている課題を説明してください。`,
    競合と差別化: `業界の競合情報および株式会社サンプルの差別化要因を教えてください。`,
    Exit先検討: `株式会社サンプルのExit先はどのような相手が有力でしょうか？`,
    バリューアップ施策: `株式会社サンプルのバリューアップ施策をDX関連とその他に分けて教えてください。`,
    "M&A事例": `業界のM&A事例について過去実績、将来の見込みを教えてください。`,
    SWOT分析: `株式会社サンプルのSWOT分析をお願いします。`,
  });

  //Perplexityのプロンプト
  const [promptsPerplexity, setPromptsPerplexity] = useState<Record<string, string>>({
    現状: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。検討にあたり事業内容及び業界について詳しく教えてください。`,
    将来性と課題: `私たちは投資ファンドを運営しており、△△業界に属する企業の買収を検討しています。業界の趨勢、将来性、抱えている課題について教えてください。`,
    競合と差別化: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。業界の競合状況及び差別化要因を教えてください。`,
    Exit先検討: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。Exit先はどのような相手が有力でしょうか。`,
    バリューアップ施策: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。有力なバリューアップ施策についてDX関連とその他に分けて教えてください。`,
    "M&A事例": `私たちは投資ファンドを運営しており、△△業界に属する企業の買収を検討しています。業界のM&A事例について過去実績、将来の見込みを教えてください。`,
    SWOT分析: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。${companyName || "〇〇株式会社"}のSWOT分析をお願いします。難しい場合は業界の一般的なSWOT分析をお願いします。`,
  });



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
    
    
  
  
    // // Perplexityで生成APIコール関数
    // const handleAddPerplexity = async (key: string) => {
    //   setIsAddingPerplexity((prev) => ({ ...prev, [key]: true }));
    //   setPerplexityError("");
    //   try {
    //     const response = await fetch("https://investment-backend.azurewebsites.net/summarize/perplexity", {
    //       method: "POST",
    //       mode: "cors",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         company_name: companyName,
    //         query_key: key,
    //         industry: majorCategory,
    //         chatgpt_summary: chatgptSummaries[key], // 必要に応じて
    //       }),
    //     });

    //     if (!response.ok) {
    //       throw new Error("Perplexityによる要約追加に失敗しました。");
    //     }

    //     const data = await response.json();

    //     setPerplexitySummaries((prev) => ({
    //       ...prev,
    //       [key]: data.final_summary,
    //     }));
    //   } catch (error) {
    //     setPerplexityError(error instanceof Error ? error.message : "Perplexity追加処理中にエラーが発生しました。");
    //     console.error(`handleAddPerplexity: Error adding Perplexity for ${key}`, error);
    //   } finally {
    //     setIsAddingPerplexity((prev) => ({ ...prev, [key]: false }));
    //   }
    // };

    // // ChatGPTで再生成APIコール関数
    // const handleRegenerate = async (key: string) => {
    //   setIsRegenerating((prev) => ({ ...prev, [key]: true }));
    //   setRegenerateError("");
    //   try {
    //     const response = await fetch(BASE_URL+"summarize/speeda", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         industry: majorCategory,
    //         sector: middleCategory,
    //         category: smallCategory,
    //         company_name: companyName,
    //         query_type: key, // 修正: query_key → query_type
    //         prompt: prompts[key], // 修正: custom_query → prompt
    //         // perplexity_summary: perplexitySummaries[key], // 不要
    //       }),
    //     });

    //     if (!response.ok) {
    //       throw new Error("再生成処理に失敗しました。");
    //     }

    //     const data = await response.json();
    //     setChatgptSummaries((prevSummaries) => ({
    //       ...prevSummaries,
    //       [key]: data[key],
    //     }));
    //     alert(`再生成が完了しました: ${key}`);
    //   } catch (error) {
    //     setRegenerateError(error instanceof Error ? error.message : "再生成処理中にエラーが発生しました。");
    //     console.error(`handleRegenerate: Error regenerating for ${key}`, error);
    //   } finally {
    //     setIsRegenerating((prev) => ({ ...prev, [key]: false }));
    //   }
    // };

    // // Perplexityで再生成APIコール関
    // const handleRegeneratePerplexity = async (key: string) => {
    //   setIsRegeneratingPerplexity((prev) => ({ ...prev, [key]: true }));
    //   setRegeneratePerplexityError("");
    //   try {
    //     const response = await fetch(BASE_URL+"summarize/perplexity", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         query_type: key, // 修正: query_key → query_type
    //         prompt: promptsPerplexity[key], // 修正: custom_query → prompt
    //       }),
    //     });
  
    //     if (!response.ok) {
    //       throw new Error("Perplexity再生成処理に失敗しました。");
    //     }
  
    //     const data = await response.json();
    //     setPerplexitySummaries((prevSummaries) => ({
    //       ...prevSummaries,
    //       [key]: data[key],
    //     }));
    //     alert(`Perplexity再生成が完了しました: ${key}`);
    //   } catch (error) {
    //     setRegeneratePerplexityError(error instanceof Error ? error.message : "Perplexity再生成処理中にエラーが発生しました。");
    //     console.error(`handleRegeneratePerplexity: Error regenerating Perplexity for ${key}`, error);
    //   } finally {
    //     setIsRegeneratingPerplexity((prev) => ({ ...prev, [key]: false }));
    //   }
    // };

    //　Word出力
    const handleWordExport = async () => {
      setIsExporting(true);
      setExportError("");
      try {
        console.log("Sending Perplexity summaries:", perplexitySummaries);
        console.log("Sending ChatGPT summaries:", chatgptSummaries);
        console.log("Sending valuation data:", valuationData);
    
        // キーマッピングを使用せず、英語のままsummariesを送信
        const transformedPerplexitySummaries: Record<string, string> = { ...perplexitySummaries };
        const transformedChatgptSummaries: Record<string, string> = { ...chatgptSummaries };
    
        // バリュエーションデータを数値としてフォーマット
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
    
        // エンドポイントにリクエストを送信
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
        setExportError(error instanceof Error ? error.message : "Wordファイル生成中にエラーが発生しました。");
        console.error("handleWordExport: Error:", error);
      } finally {
        setIsExporting(false);
      }
    };
    
  
    // // ChatGPTサマリー
    // const handleSummarize = async (
    //   multi: boolean = false,
    //   section: string | null = null
    // ): Promise<void> => {
    //   setSummarizeError(""); // エラーメッセージをリセット
  
    //   // 単一のセクションを要約する関数
    //   const summarizeSection = async (
    //     key: string,
    //     custom_query: string
    //   ): Promise<void> => {
    //     const query_key: string = keyMapping[key];
    //     setIsRegenerating((prev) => ({ ...prev, [query_key]: true }));
  
    //     try {
    //       const response = await fetch(BASE_URL + "summarize/speeda", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           industry: majorCategory,
    //           sector: middleCategory,
    //           category: smallCategory,
    //           query_type: query_key, // 修正: query_key → query_type
    //           prompt: custom_query, // 修正: custom_query → prompt
    //         }),
    //       });
  
    //       if (!response.ok) {
    //         throw new Error(`ChatGPTによる要約データの取得に失敗しました: ${key}`);
    //       }
  
    //       const data = await response.json();
  
    //       setChatgptSummaries((prevSummaries) => ({
    //         ...prevSummaries,
    //         [query_key]: data[query_key] || "内容がありません",
    //       }));
    //     } catch (error) {
    //       setSummarizeError((prev) =>
    //         `${prev}\n${error instanceof Error ? error.message : "ChatGPT要約処理中にエラーが発生しました。"}`
    //       );
    //       console.error(`handleSummarize: Error processing ${key}:`, error);
    //     } finally {
    //       setIsRegenerating((prev) => ({ ...prev, [query_key]: false }));
    //     }
    //   };
  
    //   if (multi) {
    //     // 初回: 全体を要約
    //     for (const key of Object.keys(prompts)) {
    //       const custom_query: string = prompts[key];
    //       await summarizeSection(key, custom_query);
    //     }
    //   } else if (section) {
    //     // 再生成時: 指定されたセクションのみ要約
    //     if (!prompts.hasOwnProperty(section)) {
    //       setSummarizeError((prev) => `${prev}\n指定されたセクションが存在しません: ${section}`);
    //       console.error(`handleSummarize: Section does not exist: ${section}`);
    //       return;
    //     }
  
    //     const custom_query: string = prompts[section];
    //     await summarizeSection(section, custom_query);
    //   } else {
    //     // 無効なパラメータ
    //     setSummarizeError((prev) => `${prev}\n無効なパラメータが渡されました。`);
    //     console.error("handleSummarize: Invalid parameters - multi:", multi, "section:", section);
    //   }
    // };

    const handleSummarize = async (
      multi: boolean = false,
      section: string | null = null
    ): Promise<void> => {
      console.log(`handleSummarize called with multi=${multi}, section=${section}`);
      setSummarizeError(""); // エラーメッセージをリセット
    
      if (multi) {
        // 全てのセクションを再生成
        console.log("Summarizing all sections for ChatGPT.");
        const keys = Object.keys(prompts);
        for (const key of keys) {
          await regenerateSectionChatGPT(key);
        }
      } else if (section) {
        // 特定のセクションのみ再生成
        console.log(`Summarizing single section for ChatGPT: ${section}`);
        if (!prompts.hasOwnProperty(section)) {
          setSummarizeError(`指定されたセクションが存在しません: ${section}`);
          console.error(`Section does not exist: ${section}`);
          return;
        }
        await regenerateSectionChatGPT(section);
      } else {
        // 無効なパラメータ
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


    // Perplexityサマリー
    const handleSummarizePerplexity = async (
      multi: boolean = false,
      section: string | null = null
    ): Promise<void> => {
      console.log(`handleSummarizePerplexity called with multi=${multi}, section=${section}`);
      setPerplexityError(""); // エラーメッセージをリセット
    
      if (multi) {
        // 全てのセクションを再生成
        console.log("Summarizing all sections for Perplexity.");
        const keys = Object.keys(promptsPerplexity);
        for (const key of keys) {
          await regenerateSectionPerplexity(key);
        }
      } else if (section) {
        // 特定のセクションのみ再生成
        console.log(`Summarizing single section for Perplexity: ${section}`);
        if (!promptsPerplexity.hasOwnProperty(section)) {
          setPerplexityError(`指定されたセクションが存在しません: ${section}`);
          console.error(`Section does not exist: ${section}`);
          return;
        }
        await regenerateSectionPerplexity(section);
      } else {
        // 無効なパラメータ
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

  // 調査開始ボタンハンドラー（バリュエーション取得、ChatGPT要約、Perplexity要約を順次実行）
  const handleInvestigate = async () => {
    setIsLoadingInvestigate(true);
    setSummarizeError("");
    setPerplexityError("");
    setValuationError("");
  
    try {
      // 1. ChatGPTによる要約を実行
      await handleSummarize(true, "");
      console.log("ChatGPTによる要約が完了しました。");
  
      // 2. Perplexityによる要約を実行
      await handleSummarizePerplexity(true, "");
      console.log("Perplexityによる要約が完了しました。");
  
      // 3. バリュエーションデータを取得
      await fetchValuationData();
      console.log("バリュエーションデータの取得が完了しました。");
  
      alert("調査が完了しました。");
    } catch (error) {
      console.error("handleInvestigate: Error:", error);
      // 各エラーメッセージは既に設定されているため、ここでは追加の処理は不要
    } finally {
      setIsLoadingInvestigate(false);
    }
  };

  // バリュエーションデータ取得関数（既存）
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
        // { label: "Implied Equity Value", current: data.implied_equity_value_current, forecast: data.implied_equity_value_forecast },
        // { label: "Implied EV", current: data.implied_ev_current, forecast: data.implied_ev_forecast },
      ]);
    } catch (error) {
      setValuationError(error instanceof Error ? error.message : "バリュエーションデータ取得中にエラーが発生しました。");
      console.error("fetchValuationData: Error:", error);
      throw error; // エラーを上位に伝搬させる
    }
  };
  
  


  
      // // バリュエーションデータ取得関数
      // const fetchValuationData = async () => {
      //   setIsLoading(true);

      //   try {
      //     const test = JSON.stringify({
      //       revenue_current: parseFloat(revenueCurrent) || 0,
      //       revenue_forecast: parseFloat(revenueForecast) || 0,
      //       ebitda_current: ebitdaCurrent ? parseFloat(ebitdaCurrent) : null,
      //       ebitda_forecast: ebitdaForecast ? parseFloat(ebitdaForecast) : null,
      //       net_debt_current: parseFloat(netDebtCurrent) || 0,
      //       equity_value_current: parseFloat(equityValueCurrent) || 0,
      //       category: smallCategory,
      //     })
      //     console.log(test)
      //     const response = await fetch("https://investment-backend.azurewebsites.net/valuation", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: test
      //     });
      
      //     if (!response.ok) {
      //       const errorDetails = await response.text();
      //       console.error("Error details:", errorDetails);
      //       console.log(smallCategory);
      //       throw new Error("バリュエーションデータの取得に失敗しました。");
      //     }
      
      //     const data = await response.json();
      //     console.log("Response data:", data)
      //     setValuationData([
      //       { label: "売上", current: data.revenue_current, forecast: data.revenue_forecast },
      //       { label: "EBITDA", current: data.ebitda_current, forecast: data.ebitda_forecast },
      //       { label: "NetDebt", current: data.net_debt_current, forecast: data.net_debt_forecast },
      //       { label: "想定EquityValue", current: data.equity_value_current, forecast: data.equity_value_forecast },
      //       { label: "EV", current: data.ev_current, forecast: data.ev_forecast, highlight: true },
      //       { label: "エントリーマルチプル", current: data.entry_multiple_current, forecast: data.entry_multiple_forecast },
      //       { label: "マルチプル業界中央値", current: data.industry_median_multiple_current, forecast: data.industry_median_multiple_forecast },
      //       // { label: "Implied Equity Value", current: data.implied_equity_value_current, forecast: data.implied_equity_value_forecast },
      //       // { label: "Implied EV", current: data.implied_ev_current, forecast: data.implied_ev_forecast },
      //     ]);
      //   } catch (error) {
      //     setValuationError(error instanceof Error ? error.message : "バリュエーションデータ取得中にエラーが発生しました。");
      //     console.error("fetchValuationData: Error:", error);
      //     throw error; // エラーを上位に伝搬させる
      //   } finally {
      //     setIsLoading(false);
      //   }
      // };

      // // 調査開始ボタンハンドラー
      // const handleSummarizeAndFetch = async () => {
      //   setIsLoading(true); // 調査開始のローディングを開始
      //   setSummarizeError(""); // 要約取得のエラーメッセージをリセット
      //   setValuationError(""); // バリュエーションデータ取得のエラーメッセージをリセット

      //   try {
      //     console.log("handleSummarizeAndFetch: Start");
      //     await handleSummarize();
      //     console.log("handleSummarizeAndFetch: handleSummarize completed");
      //     await fetchValuationData();
      //     console.log("handleSummarizeAndFetch: fetchValuationData completed");
      //   } catch (error) {
      //     console.error("handleSummarizeAndFetch: Error:", error);
      //     // エラーメッセージは既に設定されているので、ここでは追加の処理は不要
      //   } finally {
      //     setIsLoading(false); // 調査開始のローディングを終了
      //     console.log("handleSummarizeAndFetch: End");
      //   }
      // };
      
      

  // useEffect(() => {
  //   if (companyName && majorCategory && middleCategory && smallCategory) {
      // fetchSummaries();
  //     fetchValuationData();
  //   }
  // }, [companyName, majorCategory, middleCategory, smallCategory, fetchSummaries, fetchValuationData]);
    
  useEffect(() => {
    console.log("Summaries after rendering:", summaries);    // companyName の変更を反映
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
      現状: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。検討にあたり事業内容及び業界について詳しく教えてください。`,
      将来性と課題: `私たちは投資ファンドを運営しており、${industryName}に属する企業の買収を検討しています。業界の趨勢、将来性、抱えている課題について教えてください。`,
      競合と差別化: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。業界の競合状況及び差別化要因を教えてください。`,
      Exit先検討: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。Exit先はどのような相手が有力でしょうか。`,
      バリューアップ施策: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。有力なバリューアップ施策についてDX関連とその他に分けて教えてください。`,
      "M&A事例": `私たちは投資ファンドを運営しており、${industryName}に属する企業の買収を検討しています。業界のM&A事例について過去実績、将来の見込みを教えてください。`,
      SWOT分析: `私たちは投資ファンドを運営しており、${companyName || "〇〇株式会社"}（主要事業：${businessDescription || "△△事業"}）の買収を検討しています。${companyName || "〇〇株式会社"}のSWOT分析をお願いします。難しい場合は業界の一般的なSWOT分析をお願いします。`,
    });
  }, [companyName, businessDescription, smallCategory]); // companyName, businessDescription, smallCategory の変更を監視

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
          onChange={(e) => handleRevenueChange(e.target.value, setRevenueCurrent)}
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
        <span className="text-gray-700">EBITDA（直近期）</span>
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
        <span className="text-gray-700">EBITDA（進行期見込）</span>
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
      <label className="block mb-20">
        <span className="text-gray-700">NetDebt（直近期）</span>
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
      <label className="block mb-20">
        <span className="text-gray-700">想定EquityValue</span>
        <input
          type="text"
          value={equityValueCurrent}
          onChange={(e) => handleRevenueChange(e.target.value, setEquityValueCurrent)}
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
        <div className="flex justify-center mt-6">
          <button
            className="w-1/2 bg-[#CCCCCC] text-white py-4 rounded-md font-bold hover:bg-[#07061B]"
            onClick={handleInvestigate}
            disabled={isLoadingInvestigate} // 全てのローディング中は無効化
          >
            {isLoadingInvestigate ? "調査中..." : "調査開始"}
          </button>
        </div>
        {/* </Link> */}
    </div>
      
    {/* 調査結果セクション */}
    <div className="bg-white p-12 rounded-lg shadow-md w-2/3 mt-12 mb-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

      {/* 各アクションごとのエラーメッセージ表示 */}

      <hr className="my-8 border-t-2 border-gray-300" />

      {/* Perplexity分析セクション */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-4">Perplexity 分析</h2>

      {perplexityError && <p className="text-red-600 mb-4">Perplexity要約エラー: {perplexityError}</p>}
      {regeneratePerplexityError && <p className="text-red-600 mb-4">Perplexity再生成エラー: {regeneratePerplexityError}</p>}

      {/* データが取得できた場合 */}
      {Object.keys(prompts).map((key, index) => {
        const mappedKey = keyMapping[key]; // 日本語キーを英語キーに変換
        const summary = perplexitySummaries[mappedKey]; // summariesからデータを取得
        const multi = false

        return (
          <div key={key} className="mb-5">
            <div className="flex justify-between items-center">
              <h2
                //boldからnormalに変更
                className="text-xl font-normal text-gray-700 cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                {index + 1} {key} {isOpen[key] ? "▲" : "▼"}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSummarizePerplexity(false, key)}
                  className="bg-[#999999] text-white py-1 px-4 rounded-md hover:bg-[#404040]"
                  disabled={isRegeneratingPerplexity[mappedKey] || false} // Perplexityのローディングに依存
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
            {isOpen[key] && (
              <p className="text-base text-gray-800 mt-4">
                {summary || "データがありません"}
              </p>
            )}
          </div>
        );
      })}

      {/* ChatGPT分析セクション */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-12 pb-4">ChatGPT+SPEEDA 分析</h2>

      {/* データが取得できた場合 */}
      {summarizeError && <p className="text-red-600 mb-4">ChatGPT要約取得エラー: {summarizeError}</p>}
      {regenerateError && <p className="text-red-600 mb-4">ChatGPT再生成エラー: {regenerateError}</p>}

      {Object.keys(prompts).map((key, index) => {
        const mappedKey = keyMapping[key]; // 日本語キーを英語キーに変換
        const summary = chatgptSummaries[mappedKey]; // summariesからデータを取得
        const multi = false
      
        return (
          <div key={key} className="mb-5">
            <div className="flex justify-between items-center">
              <h2
                //boldからnormalに変更
                className="text-xl font-normal text-gray-700 cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                {index + 1} {key} {isOpen[key] ? "▲" : "▼"}
              </h2>
              <div className="flex space-x-2">

                <button
                  onClick={() => handleSummarize(false, key)}
                  //700:800を500:700に変更
                  className="bg-[#999999] text-white py-1 px-4 rounded-md hover:bg-[#404040]"
                  disabled={isRegenerating[mappedKey] || false} // 再生成のローディングに依存
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
            {isOpen[key] && (
              <p className="text-base text-gray-800 mt-4">
                {summary || "データがありません"}
              </p>
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
          disabled={isExporting} // Word出力のローディングに依存
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