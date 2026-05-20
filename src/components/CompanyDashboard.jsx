import { useState } from "react";

const MA_CASES = [
  {
    id: "ma1",
    region: "秋田県 仙北市",
    business: "農業法人（あきたこまち）",
    type: "事業承継",
    summary: "70年続く農業法人の後継者不在による事業承継案件",
    employees: "5〜10名",
    detail:
      "負債なし・農業設備一式含む。希望売価1.5億円。農業継続の意思がある買い手を希望。担当：〇〇コンサルティング（FAアドバイザー付き）。",
    tags: ["農業", "M&A", "後継者不足"],
  },
  {
    id: "ma2",
    region: "島根県 津和野町",
    business: "石州和紙工房「和の心」",
    type: "事業承継",
    summary: "ユネスコ無形文化遺産関連技術を持つ伝統工芸の事業承継",
    employees: "3〜5名",
    detail:
      "1300年の歴史を持つ石州和紙技術保有。承継者要件あり（技術習得意思必須）。希望売価8000万円。専門FA相談窓口あり。",
    tags: ["伝統工芸", "M&A", "文化遺産"],
  },
  {
    id: "ma3",
    region: "大分県 九重町",
    business: "九重温泉郷旅館「湯の宿 九重」",
    type: "M&A",
    summary: "70年続く温泉旅館の事業売却・後継者募集",
    employees: "15〜30名",
    detail:
      "源泉権利含む。不動産一括売却。希望売価3億円。旅館継続運営が条件。担当：地域金融機関・中小企業診断士。",
    tags: ["観光", "旅館", "M&A", "源泉権利"],
  },
];

const COLLAB_OPPS = [
  {
    id: "c1",
    region: "長野県 小海町",
    title: "観光サイトDX化・オンライン予約支援",
    type: "DX支援",
    urgency: "高",
    details: "八ヶ岳高原ペンション組合のオンライン予約・多言語対応DX。3ヶ月プロジェクト。IT企業との協業を希望。",
  },
  {
    id: "c2",
    region: "北海道 東川町",
    title: "インバウンド対応 多言語コンテンツ制作",
    type: "CSR/地域貢献",
    urgency: "緊急",
    details: "旭岳登山・写真観光向けの多言語コンテンツ制作。外国人観光客対応を企業連携で強化したい。",
  },
  {
    id: "c3",
    region: "高知県 四万十町",
    title: "漁業組合ECサイト構築・デジタル販路開拓",
    type: "DX支援",
    urgency: "中",
    details: "カツオ・川魚を直販するECサイトの構築支援。食品・ECノウハウを持つ企業との協業を求めています。",
  },
  {
    id: "c4",
    region: "岩手県 遠野市",
    title: "国産ホップ × クラフトビール事業連携",
    type: "協業",
    urgency: "中",
    details: "全国ビールの原料となる遠野産ホップを活用したクラフトビール事業への連携・出資を検討する企業を探しています。",
  },
  {
    id: "c5",
    region: "福島県 只見町",
    title: "只見線観光コンテンツ SNS発信支援",
    type: "CSR/地域貢献",
    urgency: "高",
    details: "奇跡の鉄道・只見線のインバウンド向けPR・SNS動画発信を支援する企業パートナーを求めています。",
  },
  {
    id: "c6",
    region: "大分県 九重町",
    title: "温泉地 スマート農業・ジビエ流通DX",
    type: "DX支援",
    urgency: "中",
    details: "くじゅう連山麓の有機農場でスマート農業・ジビエ流通のDX支援を行う企業パートナーを募集。",
  },
];

const URGENCY_STYLE = {
  緊急: "bg-red-50 text-red-600 border-red-200",
  高: "bg-amber-50 text-amber-600 border-amber-200",
  中: "bg-blue-50 text-blue-600 border-blue-200",
};

const TYPE_STYLE = {
  "DX支援": "bg-blue-100 text-blue-700",
  "CSR/地域貢献": "bg-green-100 text-green-700",
  協業: "bg-purple-100 text-purple-700",
  事業承継: "bg-slate-100 text-slate-700",
  "M&A": "bg-slate-100 text-slate-700",
};

export default function CompanyDashboard({ isVerifiedCompany, onVerifyToggle }) {
  const [activeTab, setActiveTab] = useState("opportunities");

  const tabs = [
    { id: "opportunities", label: "協業・DX案件", emoji: "🤝" },
    { id: "ma", label: "M&A・事業承継", emoji: "🏢" },
    { id: "csr", label: "CSR・社会貢献", emoji: "🌿" },
  ];

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-100 border border-slate-300 px-3 py-1 rounded-full">
            企業ダッシュボード
          </span>
          {isVerifiedCompany && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              ✓ 審査済・NDA締結済
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">企業向け 地域連携DB</h2>
        <p className="text-sm text-gray-500 mt-1">協業・DX支援・CSR・M&A案件を探す</p>
      </div>

      {/* Verification banner */}
      <div
        className={`rounded-2xl p-4 mb-5 border ${
          isVerifiedCompany ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={`text-sm font-semibold ${isVerifiedCompany ? "text-emerald-800" : "text-amber-800"}`}>
              {isVerifiedCompany ? "✓ 企業審査済み・NDA締結済み" : "⚠️ 企業未審査"}
            </div>
            <div className={`text-xs mt-0.5 leading-relaxed ${isVerifiedCompany ? "text-emerald-600" : "text-amber-600"}`}>
              {isVerifiedCompany
                ? "M&A・事業承継案件の詳細情報をご覧いただけます"
                : "詳細閲覧には企業審査とNDA同意が必要です。M&A・承継案件の詳細はロック状態です。"}
            </div>
          </div>
          <button
            onClick={onVerifyToggle}
            className={`text-xs px-4 py-2 rounded-xl font-semibold flex-shrink-0 transition-colors ${
              isVerifiedCompany
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            {isVerifiedCompany ? "認証解除（デモ）" : "審査申請（デモ）"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-semibold py-2.5 rounded-xl transition-all ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="hidden sm:inline">{tab.emoji} </span>{tab.label}
          </button>
        ))}
      </div>

      {/* ── 協業・DX案件 ── */}
      {activeTab === "opportunities" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {COLLAB_OPPS.filter(c => c.type === "協業" || c.type === "DX支援").map(opp => (
            <div key={opp.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[opp.type]}`}>
                  {opp.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_STYLE[opp.urgency]}`}>
                  {opp.urgency}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-0.5">{opp.title}</div>
              <div className="text-xs text-gray-500 mb-2">📍 {opp.region}</div>
              <div className="text-xs text-gray-600 leading-relaxed mb-3">{opp.details}</div>
              <div className="flex gap-2">
                <button className="text-xs bg-slate-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                  詳細を見る
                </button>
                <button className="text-xs border border-slate-300 text-slate-600 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  問い合わせ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── M&A・事業承継 ── */}
      {activeTab === "ma" && (
        <div className="space-y-3 lg:max-w-3xl">
          {!isVerifiedCompany && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-1">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <div className="text-sm font-semibold text-amber-800 mb-1">詳細閲覧には企業審査とNDA同意が必要です</div>
                  <div className="text-xs text-amber-600 leading-relaxed">
                    M&A・事業承継案件は機密性の高い情報を含みます。上部の「審査申請（デモ）」ボタンから企業審査をお申し込みください。
                  </div>
                </div>
              </div>
            </div>
          )}

          {MA_CASES.map(ma => (
            <div key={ma.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[ma.type]}`}>
                    {ma.type}
                  </span>
                  <span className="text-xs text-gray-400">📍 {ma.region}</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{ma.business}</div>
                <div className="text-xs text-gray-600 mb-3 leading-relaxed">{ma.summary}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ma.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>

                {/* Detail: locked or visible */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-1.5 font-semibold">従業員数</div>
                  <div className="text-sm font-medium text-gray-700">{ma.employees}</div>
                </div>

                {isVerifiedCompany ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3">
                    <div className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
                      <span>✓</span> 詳細情報（NDA締結済み）
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">{ma.detail}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3 flex items-center gap-2 text-gray-400">
                    <span>🔒</span>
                    <span className="text-xs">企業審査・NDA同意後に詳細が閲覧できます</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors ${
                      isVerifiedCompany
                        ? "bg-slate-700 text-white hover:bg-slate-800"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isVerifiedCompany}
                  >
                    {isVerifiedCompany ? "M&A相談を申込む" : "審査後に利用可"}
                  </button>
                  <button className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    概要資料を請求
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CSR・社会貢献 ── */}
      {activeTab === "csr" && (
        <div className="space-y-3 lg:max-w-3xl">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 mb-1">
            <p className="text-sm text-green-800 leading-relaxed">
              🌿 地域課題解決への参加は、企業のCSR・SDGs対応・従業員エンゲージメント向上にもつながります。
            </p>
          </div>
          {COLLAB_OPPS.filter(c => c.type === "CSR/地域貢献").map(opp => (
            <div key={opp.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[opp.type]}`}>
                  {opp.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_STYLE[opp.urgency]}`}>
                  {opp.urgency}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-0.5">{opp.title}</div>
              <div className="text-xs text-gray-500 mb-2">📍 {opp.region}</div>
              <div className="text-xs text-gray-600 leading-relaxed mb-3">{opp.details}</div>
              <div className="flex gap-2">
                <button className="text-xs bg-green-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-800 transition-colors">
                  CSR参加を相談する
                </button>
                <button className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  詳細を見る
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
