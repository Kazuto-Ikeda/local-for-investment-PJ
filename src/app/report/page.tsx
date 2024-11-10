"use client";

import { useState, useEffect,Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ReportPageContent = () => {
  const searchParams = useSearchParams();
  const companyName = searchParams ? searchParams.get("companyName") || "株式会社虎屋" : "株式会社虎屋";

    // 売上、EBITDA、NetDebt、EquityValueの取得
    const revenueCurrent = searchParams.get("revenueCurrent") || "0";
    const revenueForecast = searchParams.get("revenueForecast") || "0";
    const ebitdaCurrent = searchParams.get("ebitdaCurrent") || "0";
    const ebitdaForecast = searchParams.get("ebitdaForecast") || "0";
    const netDebtCurrent = searchParams.get("netDebtCurrent") || "0";
    const netDebtForecast = searchParams.get("netDebtForecast") || "0";
    const equityValueCurrent = searchParams.get("equityValueCurrent") || "0";
    const equityValueForecast = searchParams.get("equityValueForecast") || "0";
    const selectedIndustry = searchParams.get("selectedIndustry");
  
  
  // EVの計算
  const evCurrent = (parseFloat(netDebtCurrent) + parseFloat(equityValueCurrent)).toLocaleString(); // 直近のEV
  const evForecast = (parseFloat(netDebtForecast) + parseFloat(equityValueForecast)).toLocaleString(); // 進行期見込のEV

  // エントリーマルチプルの計算
  const entryMultipleCurrent = (parseFloat(evCurrent.replace(/,/g, "")) / parseFloat(ebitdaCurrent)).toFixed(1) + "x"; // 直近のエントリーマルチプル
  const entryMultipleForecast = (parseFloat(evForecast.replace(/,/g, "")) / parseFloat(ebitdaForecast)).toFixed(1) + "x"; // 進行期見込のエントリーマルチプル

  // アコーディオンの開閉状態管理
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);
  const [isOpenIndustry, setIsOpenIndustry] = useState(true);

  // 各セクションのプロンプト入力管理
  const [prompt1, setPrompt1] = useState("株式会社虎屋（所在地：東京都港区、事業内容：和菓子の製造販売）の企業概要、事業概要をまとめてください。");
  const [prompt2, setPrompt2] = useState("株式会社虎屋（所在地：東京都港区、事業内容：和菓子の製造販売）の属する業界の最新動向、競合状況をまとめてください。また、具体的な競合他社を列挙してください。");
  const [prompt3, setPrompt3] = useState("株式会社虎屋（所在地：東京都港区、事業内容：和菓子の製造販売）の属する業界のM&A動向をまとめてください。");
  const [prompt4, setPrompt4] = useState("株式会社虎屋（所在地：東京都港区、事業内容：和菓子の製造販売）の優位性・独自性・将来性をまとめてください。");


  // `industryData` の型を定義
  interface IndustryData {
    current_situation: string;
    future_outlook: string;
    investment_advantages: string;
    investment_disadvantages: string;
    value_up_hypothesis: string;
    ev_ebitda_median?: string;  // 必要に応じて追加
  }
 
  // 業界データのフェッチ
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!selectedIndustry) {
      setErrorMessage("業界情報が指定されていません。");
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/summarize?industry=${selectedIndustry}`);
        if (!response.ok) {
          throw new Error("Failed to fetch industry data.");
        }
        const data: IndustryData = await response.json();
        setIndustryData(data);
        console.log("Fetched industry data:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("業界データの取得に失敗しました。");
      }
    };
    fetchData();
  }, [selectedIndustry]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-md w-2/3">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">{companyName} 調査結果</h1>

        {/* Genspark分析 タイトル */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Genspark分析</h2>


        {/* アコーディオン形式 */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => setIsOpen1(!isOpen1)}
            >
              ① 対象会社および事業内容に関する説明 {isOpen1 ? "▲" : "▼"}
            </h2>
            <button
              onClick={() => alert(`Re-generating with prompt: ${prompt1}`)}
              className="bg-gray-700 text-white py-1 px-4 rounded-md"
            >
              再生成
            </button>
          </div>

          {/* プロンプト入力 */}
          <div className="mt-2">
            <input
              type="text"
              value={prompt1}
              onChange={(e) => setPrompt1(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 折りたたみ可能な説明文 */}
          {isOpen1 && (
            <p className="text-base text-gray-800 mt-4">
              株式会社虎屋（とらや）は、東京都港区赤坂に本社を置く和菓子製造・販売会社です。創業は室町時代後期に遡り、約480年の歴史を持つ老舗企業です。1947年に法人化され、現在は「とらや」のブランド名で広く知られています。
              <br /><br />
              <strong>企業概要</strong><br />
              設立: 1947年（昭和22年）5月24日<br />
              本社所在地: 東京都港区赤坂4丁目9-22<br />
              資本金: 2,400万円<br />
              売上高: 約196億8,700万円（2024年3月期実績）<br />
              従業員数: 854名（男性274名、女性580名）<br />
              <br />
              <strong>事業内容</strong><br />
              虎屋は主に和菓子の製造と販売を行っており、特に羊羹が有名です。「とらやの羊羹」はその品質と味わいから広く認知されています。事業は以下のような多岐にわたります。
              <br />
              和菓子製造: 伝統的な技術を用いて、季節ごとの生菓子や干菓子など多様な和菓子を製造しています。
              <br />
              販売チャネル: 自社店舗のほか、百貨店や空港ターミナルビル内でも商品を展開しており、国内外での販売も行っています。
              <br />
              文化的活動: 虎屋文庫を設置し、和菓子に関する歴史や文化を伝える活動も行っています。
              <br /><br />
              <strong>経営理念</strong><br />
              虎屋は「おいしい和菓子を喜んで召し上がって頂く」という理念のもと、品質向上と顧客満足を追求しています。持続可能な製品作りにも取り組んでいます。
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => setIsOpen2(!isOpen2)}
            >
              ② 業界に関する最新動向や競合状況 {isOpen2 ? "▲" : "▼"}
            </h2>
            <button
              onClick={() => alert(`Re-generating with prompt: ${prompt2}`)}
              className="bg-gray-700 text-white py-1 px-4 rounded-md"
            >
              再生成
            </button>
          </div>

          <div className="mt-2">
            <input
              type="text"
              value={prompt2}
              onChange={(e) => setPrompt2(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {isOpen2 && (
            <p className="text-base text-gray-800 mt-4">
              株式会社虎屋は、和菓子業界において長い歴史を持つ老舗企業であり、特に羊羹や季節の生菓子で知られています。和菓子業界の最新動向としては、以下の点が挙げられます。
              <br /><br />
              <strong>業界の最新動向</strong><br />
              新業態の展開: 虎屋は伝統を守りつつも、新しいスタイルの店舗「TORAYA GINZA」を2024年4月にオープンしました。ここでは職人が目の前で和菓子を作るスタイルを採用し、顧客とのインタラクションを重視しています。
              <br /><br />
              デジタルマーケティングと国際展開: SNSやオンライン広告を活用し、ブランド認知度を高めています。また、国際市場への進出も視野に入れ、日本国外でのブランド認知度向上を目指しています。
              <br /><br />
              消費者の健康志向への対応: 健康志向の高まりに応じ、低糖質や無添加の商品開発を進めています。季節ごとの限定商品や健康志向を取り入れた新しいラインナップが市場に投入されています。
              <br /><br />
              オンライン販売の拡大: コロナ禍を経て、オンラインでの購入が増加しており、虎屋もオンラインショップを運営しています。
              <br /><br />
              <strong>競合状況</strong><br />
              和菓子業界には多くの競合他社が存在し、それぞれが独自の製品やブランドを展開しています。以下に主要な競合他社を挙げます。
              <br /><br />
              松屋: 伝統的な和菓子メーカーで、長い歴史を持ち、ブランド力を活かしています。
              <br />
              亀屋万年堂: 多様な和菓子を提供し、特に季節限定商品に力を入れています。
              <br />
              赤福: 伊勢名物の赤福餅で有名で、地域密着型のビジネスモデルを採用しています。
              <br />
              塩瀬総本家: 日本最古の菓子司として知られ、特に饅頭の製造で有名です。
              <br />
              舟和本店: 芋ようかんが有名で、伝統的な製法を守りながらも新しい商品開発にも力を入れています。
              <br />
              中村屋: 和菓子だけでなく洋菓子も手掛け、和菓子ブランド「円果天」を展開しています。
              <br /><br />
              これらの企業はそれぞれ異なる強みを持ち、市場で競争しています。虎屋は高価格帯の商品を提供しているため、価格競争が少ない一方で、若年層の顧客離れという課題があります。また、海外市場への進出も重要な戦略となっており、特に高級志向の顧客層をターゲットとしています。
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => setIsOpen3(!isOpen3)}
            >
              ③ 業界のM&A動向 {isOpen3 ? "▲" : "▼"}
            </h2>
            <button
              onClick={() => alert(`Re-generating with prompt: ${prompt3}`)}
              className="bg-gray-700 text-white py-1 px-4 rounded-md"
            >
              再生成
            </button>
          </div>

          <div className="mt-2">
            <input
              type="text"
              value={prompt3}
              onChange={(e) => setPrompt3(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {isOpen3 && (
            <p className="text-base text-gray-800 mt-4">
              株式会社虎屋は、和菓子の製造販売を行う老舗企業であり、特に羊羹の製造で広く知られています。和菓子業界におけるM&A（企業合併・買収）の動向は、業界の持続可能性や競争力を高めるための重要な手段として注目されています。
              <br /><br />
              和菓子業界は、後継者不足や高齢化といった課題に直面しており、多くの和菓子店は家族経営であるため、経営者の高齢化が進む中で後継者が不在となるケースが増加しています。このような状況では、M&Aを通じて事業を継続し、伝統的な技術やブランドを守ることが求められています。M&Aによって、経営資源の強化や新たな市場への進出が可能となり、業界全体の持続可能な発展に寄与することが期待されています。
              <br /><br />
              具体的なM&A事例としては、シャトレーゼホールディングスによる亀屋万年堂の買収があります。この買収は、亀屋万年堂が持つ伝統的な和菓子製造技術とブランドを活かしつつ、シャトレーゼの経営資源とシナジー効果を生み出すことを目的としています。
              <br /><br />
              また、和菓子業界のM&Aにはいくつかのメリットがあります。例えば、従業員の雇用を確保できる点や、独自の製法や技術を承継できる点が挙げられます。特に小規模な和菓子店が突然の事業閉鎖を避けるためには、他社との統合が有効です。また、長年培われたブランド価値を保持しつつ、新たな経営資源を得ることで、市場での競争力を高めることができます。
              <br /><br />
              総じて、和菓子業界におけるM&Aは、伝統的な技術やブランドを守りながら、新たな成長機会を模索するための重要な戦略となっています。今後もこの傾向は続くと考えられ、多様な事業承継や経営統合が進むことでしょう。
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold text-gray-700 cursor-pointer"
              onClick={() => setIsOpen4(!isOpen4)}
            >
              ④ 対象会社の優位性・独自性・将来性 {isOpen4 ? "▲" : "▼"}
            </h2>
            <button
              onClick={() => alert(`Re-generating with prompt: ${prompt4}`)}
              className="bg-gray-700 text-white py-1 px-4 rounded-md"
            >
              再生成
            </button>
          </div>

          <div className="mt-2">
            <input
              type="text"
              value={prompt4}
              onChange={(e) => setPrompt4(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {isOpen4 && (
            <p className="text-base text-gray-800 mt-4"> {/* 文字サイズを調整 */}
              株式会社虎屋は、和菓子の製造販売において長い歴史と伝統を持つ企業であり、その優位性、独自性、将来性は以下のようにまとめられます。
              <br /><br />
              <strong>優位性</strong><br />
              虎屋は高品質な和菓子を提供することで知られています。特に、羊羹や生菓子などの主力商品は、厳選された素材を使用し、伝統的な製法を守りながらも現代的な技術を取り入れています。この品質の高さは、消費者からの信頼を得る要因となっており、和菓子業界において常にトップクラスの売上を誇っています。また、虎屋は全国和菓子協会の中心的な役割を果たしており、業界全体の発展にも寄与しています。
              <br /><br />
              <strong>独自性</strong><br />
              虎屋は「和菓子の日」を制定したり、国際的な菓子展に出品するなど、日本文化の発信にも力を入れています。特にパリ店の開設は、日本の和菓子を海外に広める重要なステップであり、フランス市場での成功がその後の海外展開にもつながっています。虎屋は単なる和菓子店ではなく、日本文化を象徴するブランドとしての地位を確立しています。
              <br /><br />
              <strong>将来性</strong><br />
              虎屋は新商品の開発や市場ニーズへの柔軟な対応を進めています。例えば、「羊羹de 巴里」のような新しい商品ラインは、若い世代へのアプローチとして成功を収めており、今後も多様化する消費者ニーズに応じた商品展開が期待されます。また、生産体制の見直しや効率化も進めており、御殿場工場の稼働によって生産能力が向上し、高品質な製品を安定的に供給できる体制が整っています。
              <br /><br />
              総じて、株式会社虎屋はその伝統と革新を融合させ、高品質な和菓子を提供し続けることで市場での競争力を維持しており、今後も成長が期待される企業です。
            </p>
          )}
        </div>

        <hr className="my-8 border-t-2 border-gray-300" />

        {/* ChatGPT＋SPEEDAレポート分析 タイトル */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ChatGPT＋SPEEDA分析</h2>

        {/* エラーメッセージの表示 */}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

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
                <td className="py-2 px-4 border-b bg-indigo-100">{evCurrent}</td> {/* 計算されたEVを表示 */}
                <td className="py-2 px-4 border-b bg-indigo-100">{evForecast}</td> {/* 計算されたEVを表示 */}
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