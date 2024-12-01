"use client";

import { useState, useEffect, Suspense } from "react";
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

const ReportPageContent = () => {
  const searchParams = useSearchParams();
  const companyName = searchParams ? searchParams.get("companyName") || "株式会社虎屋" : "株式会社虎屋";
  const selectedIndustry = searchParams.get("selectedIndustry");

  // ステート
  const [isOpenIndustry, setIsOpenIndustry] = useState(false);
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
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

  useEffect(() => {
    const fetchIndustryData = async () => {
      try {
        const response = await fetch(
          `/api/get-summary?companyName=${encodeURIComponent(companyName)}`
        );
        if (!response.ok) {
          throw new Error("データ取得に失敗しました。");
        }
        const data = await response.json();
        setIndustryData(data.summaries); // APIのレスポンスに合わせて調整
      } catch (error) {
        // エラーがError型かどうかを確認してメッセージを設定
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("データ取得中に予期しないエラーが発生しました。");
        }
      }
    };
  
    fetchIndustryData();
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