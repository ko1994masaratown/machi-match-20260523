import { useState } from "react";
import { matchBusinessRegion } from "../services/matchService";

const INDUSTRY_OPTIONS = ["IT・ソフトウェア","製造業","食品・農業","観光・ホテル","物流・運輸","医療・介護","教育","メディア・広告","金融・保険","コンサル","建設・不動産"];
const STRENGTH_OPTIONS = ["DX・システム開発","マーケティング・SNS","多言語・インバウンド","食品加工・流通","農業技術","医療・介護技術","教育コンテンツ","観光・体験設計","物流・EC","人材育成","資金・融資"];
const PURPOSE_OPTIONS = [
  { key: "DX支援",    label: "DX・技術支援",    desc: "自社技術で地域課題を解決" },
  { key: "CSR",       label: "CSR・社会貢献",   desc: "SDGs・ブランド向上" },
  { key: "事業拡大",  label: "事業拡大・新市場",desc: "地域資源を活かした新規事業" },
  { key: "M&A",       label: "M&A・事業承継",   desc: "地域企業を引き継ぐ" },
];

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
    more: "現在FAXと電話のみで予約受付。予約システム導入・多言語LP制作を期待。報酬は自治体補助金を活用予定。現地視察・合宿対応可。",
    sdgs: [9, 11],
  },
  {
    id: "c2",
    region: "北海道 東川町",
    title: "インバウンド対応 多言語コンテンツ制作",
    type: "CSR/地域貢献",
    urgency: "緊急",
    details: "旭岳登山・写真観光向けの多言語コンテンツ制作。外国人観光客対応を企業連携で強化したい。",
    more: "英語・中国語・韓国語対応を想定。既存の日本語パンフレットの多言語化＋SNS用ショート動画制作。観光協会との共同プロジェクト。",
    sdgs: [11, 17],
  },
  {
    id: "c3",
    region: "高知県 四万十町",
    title: "漁業組合ECサイト構築・デジタル販路開拓",
    type: "DX支援",
    urgency: "中",
    details: "カツオ・川魚を直販するECサイトの構築支援。食品・ECノウハウを持つ企業との協業を求めています。",
    more: "既存の道の駅販売に加え、EC直販で売上を倍増させたい。在庫管理・配送連携も含めた一気通貫のDX支援を想定。",
    sdgs: [9, 14],
  },
  {
    id: "c4",
    region: "岩手県 遠野市",
    title: "国産ホップ × クラフトビール事業連携",
    type: "協業",
    urgency: "中",
    details: "全国ビールの原料となる遠野産ホップを活用したクラフトビール事業への連携・出資を検討する企業を探しています。",
    more: "遠野産ホップは国内シェアの80%以上。農家との直接契約・醸造ノウハウ提供・共同ブランド立ち上げを想定したパートナーを求めています。",
    sdgs: [8, 17],
  },
  {
    id: "c5",
    region: "福島県 只見町",
    title: "只見線観光コンテンツ SNS発信支援",
    type: "CSR/地域貢献",
    urgency: "高",
    details: "奇跡の鉄道・只見線のインバウンド向けPR・SNS動画発信を支援する企業パートナーを求めています。",
    more: "只見線は2011年の水害で不通→2022年全線復旧。絶景路線として国際的注目が高まっている。SNS運用・動画制作・インフルエンサー招待など幅広い協力を歓迎。",
    sdgs: [11, 17],
  },
  {
    id: "c6",
    region: "大分県 九重町",
    title: "温泉地 スマート農業・ジビエ流通DX",
    type: "DX支援",
    urgency: "中",
    details: "くじゅう連山麓の有機農場でスマート農業・ジビエ流通のDX支援を行う企業パートナーを募集。",
    more: "センサー・IoT活用による栽培管理、ジビエ（シカ・イノシシ）の冷凍流通・ECルート開拓を検討中。農業技術・食品流通DXに強みを持つ企業を優先。",
    sdgs: [9, 12],
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

const SDG_LABELS = {
  8:  { label: "働きがい・経済成長", color: "bg-red-700" },
  9:  { label: "産業と技術革新",     color: "bg-orange-600" },
  11: { label: "持続可能なまちを",   color: "bg-yellow-600" },
  12: { label: "つくる責任",         color: "bg-amber-700" },
  14: { label: "海の豊かさを守ろう", color: "bg-blue-600" },
  17: { label: "パートナーシップ",   color: "bg-indigo-700" },
};

// ── 共通問い合わせモーダル ──
function ContactModal({ title, ctaLabel = "送信する", onClose }) {
  const [form, setForm] = useState({ company: "", name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!form.company || !form.name || !form.email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <div className="text-lg font-bold text-gray-900 mb-2">送信完了！</div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            担当者より <strong>3営業日以内</strong> にご連絡いたします。
          </p>
          <button onClick={onClose} className="w-full bg-slate-700 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            閉じる
          </button>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/60 mb-0.5 uppercase tracking-wider">お問い合わせ</div>
          <div className="text-white font-bold text-sm leading-snug max-w-xs">{title}</div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">✕</button>
      </div>
      <div className="p-6 space-y-4">
        {[
          { key: "company", label: "会社名", placeholder: "株式会社〇〇", type: "text" },
          { key: "name",    label: "担当者名", placeholder: "山田 太郎",   type: "text" },
          { key: "email",   label: "メールアドレス", placeholder: "taro@example.com", type: "email" },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{label} <span className="text-red-500">*</span></label>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">メッセージ（任意）</label>
          <textarea
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="ご質問・ご要望・貴社のご状況などをお気軽にご記入ください"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 resize-none transition-all"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!form.company || !form.name || !form.email}
          className="w-full bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {ctaLabel}
        </button>
        <p className="text-xs text-gray-400 text-center">送信後、担当者より3営業日以内にご連絡します</p>
      </div>
    </ModalWrapper>
  );
}

function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ── SDGsバッジ ──
function SdgBadges({ goals }) {
  if (!goals || goals.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {goals.map(num => {
        const g = SDG_LABELS[num];
        if (!g) return null;
        return (
          <span key={num} className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${g.color}`}>
            SDG{num} {g.label}
          </span>
        );
      })}
    </div>
  );
}

// ── メインコンポーネント ──
function BusinessMatchPanel({ towns }) {
  const [industry, setIndustry] = useState("");
  const [strengths, setStrengths] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function toggleStrength(s) {
    setStrengths(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleMatch() {
    setLoading(true);
    setResult(null);
    try {
      const res = await matchBusinessRegion({ industry, strengths, purpose, freeText }, towns);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-700 to-indigo-800 text-white rounded-2xl px-5 py-4">
        <div className="text-sm font-bold mb-1">AIビジネスマッチング</div>
        <p className="text-xs text-white/70">貴社の強みと目的を入力すると、AIが最適な連携地域を推薦します</p>
      </div>

      {/* 業種 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-xs font-bold text-gray-700 mb-3">業種</div>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setIndustry(opt)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${industry === opt ? "bg-slate-700 text-white border-slate-700" : "border-gray-200 text-gray-500 hover:border-slate-400"}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 強み */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-xs font-bold text-gray-700 mb-3">自社の強み・技術 <span className="text-gray-400 font-normal">（複数選択可）</span></div>
        <div className="flex flex-wrap gap-2">
          {STRENGTH_OPTIONS.map(opt => (
            <button key={opt} onClick={() => toggleStrength(opt)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${strengths.includes(opt) ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 目的 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-xs font-bold text-gray-700 mb-3">連携目的</div>
        <div className="grid grid-cols-2 gap-2">
          {PURPOSE_OPTIONS.map(({ key, label, desc }) => (
            <button key={key} onClick={() => setPurpose(key)}
              className={`py-3 px-3 rounded-xl border-2 text-left transition-all ${purpose === key ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}>
              <div className={`text-xs font-bold ${purpose === key ? "text-indigo-700" : "text-gray-700"}`}>{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 自由記述 */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4">
        <div className="text-xs font-bold text-gray-700 mb-2">貴社からのメッセージ <span className="text-gray-400 font-normal">（任意・AIが最重視）</span></div>
        <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
          placeholder="例：物流ネットワークを活かして産地直送を実現したい。農家との直接取引で新市場を開拓したい。"
          rows={3} maxLength={300}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 resize-none transition-all placeholder:text-gray-300" />
      </div>

      <button onClick={handleMatch} disabled={loading || (!industry && strengths.length === 0)}
        className="w-full bg-gradient-to-r from-slate-700 to-indigo-700 text-white py-4 rounded-2xl font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-lg text-sm">
        {loading ? "AIがビジネスマッチング中…" : "AIで最適な連携地域を探す"}
      </button>

      {result && (
        <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-slate-700 to-indigo-700 px-5 py-3 flex items-center justify-between">
            <div className="text-sm font-bold text-white">AIビジネスマッチング結果</div>
            <span className="text-xs text-indigo-200 bg-indigo-900/40 px-2 py-0.5 rounded-full">{result.source}</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">推薦連携地域</div>
                <div className="text-xl font-bold text-gray-900">{result.recommendedRegion}</div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-3xl font-extrabold text-indigo-600">{result.matchScore}<span className="text-lg">%</span></div>
                <div className="text-xs text-gray-400">マッチ度</div>
              </div>
            </div>
            <span className="inline-block text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200">{result.collabType}</span>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <div className="text-xs font-semibold text-indigo-600 mb-1">貴社が貢献できること</div>
              <p className="text-sm text-indigo-800 font-medium">{result.companyContribution}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">マッチング理由</div>
              <p className="text-sm text-gray-700 leading-relaxed">{result.businessReason}</p>
            </div>
            <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
              <div className="text-xs font-semibold text-red-500 mb-0.5">解決できるSOS課題</div>
              <p className="text-sm text-red-700 font-medium">{result.sosIssue}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-600 mb-0.5">貴社のビジネス機会</div>
              <p className="text-sm text-emerald-800">{result.businessOpportunity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompanyDashboard({ isVerifiedCompany, onVerifyToggle, towns = [] }) {
  const [activeTab, setActiveTab] = useState("ai");
  const [expandedId, setExpandedId] = useState(null);
  const [contactModal, setContactModal] = useState(null);

  const tabs = [
    { id: "ai",            label: "AIマッチ",     emoji: "✨" },
    { id: "opportunities", label: "協業・DX案件", emoji: "🤝" },
    { id: "ma",            label: "M&A・承継",    emoji: "🏢" },
    { id: "csr",           label: "CSR",          emoji: "🌿" },
  ];

  function toggleExpand(id) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">

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
        <p className="text-sm text-gray-500 mt-1">地域課題と企業資源をつなぐ入口。協業・DX・CSR・M&A案件を探す。</p>
      </div>

      {/* 認証バナー */}
      <div className={`rounded-2xl p-4 mb-5 border ${isVerifiedCompany ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={`text-sm font-bold ${isVerifiedCompany ? "text-emerald-800" : "text-amber-800"}`}>
              {isVerifiedCompany ? "✓ 企業審査済み・NDA締結済み" : "⚠️ 企業未審査"}
            </div>
            <div className={`text-xs mt-0.5 leading-relaxed ${isVerifiedCompany ? "text-emerald-600" : "text-amber-600"}`}>
              {isVerifiedCompany
                ? "M&A・事業承継案件の詳細情報（売価・担当者・財務情報）をすべてご覧いただけます"
                : "M&A・事業承継案件の詳細は企業審査とNDA同意後に解放されます。協業・CSR案件はすぐにご覧いただけます。"}
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

      {/* タブ */}
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

      {/* ── AIビジネスマッチ ── */}
      {activeTab === "ai" && <BusinessMatchPanel towns={towns} />}

      {/* ── 協業・DX案件 ── */}
      {activeTab === "opportunities" && (
        <div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4 text-xs text-blue-800 leading-relaxed">
            🤝 自社のDX技術・ノウハウを地域課題解決に活かせる案件を掲載しています。補助金活用型・プロボノ型など形式はさまざま。まずはお気軽にお問い合わせください。
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {COLLAB_OPPS.filter(c => c.type === "協業" || c.type === "DX支援").map(opp => (
              <div key={opp.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[opp.type]}`}>{opp.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_STYLE[opp.urgency]}`}>緊急度：{opp.urgency}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">{opp.title}</div>
                  <div className="text-xs text-gray-500 mb-2">📍 {opp.region}</div>
                  <div className="text-xs text-gray-600 leading-relaxed mb-3">{opp.details}</div>
                  <SdgBadges goals={opp.sdgs} />

                  {/* 詳細展開 */}
                  {expandedId === opp.id && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-900 leading-relaxed">
                      <div className="font-semibold text-blue-700 mb-1">📋 詳細情報</div>
                      {opp.more}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleExpand(opp.id)}
                      className="text-xs border border-slate-300 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      {expandedId === opp.id ? "▲ 閉じる" : "詳細を見る"}
                    </button>
                    <button
                      onClick={() => setContactModal({ title: opp.title, cta: "問い合わせを送信する" })}
                      className="text-xs bg-slate-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                      問い合わせ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── M&A・事業承継 ── */}
      {activeTab === "ma" && (
        <div>
          {!isVerifiedCompany && (
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-2xl p-5 mb-4 flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">🔒</div>
              <div className="flex-1">
                <div className="font-bold text-base mb-1">詳細閲覧には企業審査が必要です</div>
                <p className="text-sm text-white/70 leading-relaxed mb-3">
                  売価・財務情報・担当者連絡先などの機密情報はNDA締結済み企業のみ閲覧可能です。審査は通常3〜5営業日で完了します。
                </p>
                <button
                  onClick={onVerifyToggle}
                  className="bg-amber-400 text-slate-900 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-amber-300 transition-colors shadow-sm"
                >
                  審査申請（デモ）→ 詳細を解放する
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {MA_CASES.map(ma => (
              <div key={ma.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[ma.type]}`}>{ma.type}</span>
                    <span className="text-xs text-gray-400">📍 {ma.region}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{ma.business}</div>
                  <div className="text-xs text-gray-600 mb-3 leading-relaxed">{ma.summary}</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ma.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>

                  {/* 従業員数 */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
                    <div className="text-xs text-gray-400 mb-0.5">従業員数</div>
                    <div className="text-sm font-semibold text-gray-700">{ma.employees}</div>
                  </div>

                  {/* 詳細情報：ロック or 解放 */}
                  {isVerifiedCompany ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
                        <span>✓</span> 詳細情報（NDA締結済み・機密）
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">{ma.detail}</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden mb-3">
                      <div className="bg-gray-100 px-3 py-2.5 blur-sm select-none text-xs text-gray-600 leading-relaxed">
                        {ma.detail}
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
                        <span className="text-lg mb-1">🔒</span>
                        <span className="text-xs font-semibold text-gray-600">審査後に詳細を閲覧できます</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        isVerifiedCompany
                          ? setContactModal({ title: `M&A相談：${ma.business}`, cta: "M&A相談を申し込む" })
                          : onVerifyToggle()
                      }
                      className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors ${
                        isVerifiedCompany
                          ? "bg-slate-700 text-white hover:bg-slate-800"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                      }`}
                    >
                      {isVerifiedCompany ? "M&A相談を申込む" : "🔓 審査申請する"}
                    </button>
                    <button
                      onClick={() => setContactModal({ title: `概要資料請求：${ma.business}`, cta: "資料を請求する" })}
                      className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      概要資料を請求
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CSR・社会貢献 ── */}
      {activeTab === "csr" && (
        <div>
          {/* 企業メリットカード */}
          <div className="bg-gradient-to-br from-green-700 to-emerald-800 text-white rounded-2xl p-5 mb-4">
            <div className="text-sm font-bold mb-3">🌿 地域課題への参加が、企業価値を高める</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "📊", label: "SDGs対応",   sub: "ESGレポートに活用できる" },
                { emoji: "👥", label: "社員研修",    sub: "地域での体験が人材育成に" },
                { emoji: "📣", label: "PR・ブランド", sub: "社会課題解決のストーリーを発信" },
              ].map(({ emoji, label, sub }) => (
                <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs font-bold">{label}</div>
                  <div className="text-[10px] text-white/70 mt-0.5 leading-snug">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {COLLAB_OPPS.filter(c => c.type === "CSR/地域貢献").map(opp => (
              <div key={opp.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[opp.type]}`}>{opp.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_STYLE[opp.urgency]}`}>緊急度：{opp.urgency}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5">{opp.title}</div>
                  <div className="text-xs text-gray-500 mb-2">📍 {opp.region}</div>
                  <div className="text-xs text-gray-600 leading-relaxed mb-2">{opp.details}</div>
                  <SdgBadges goals={opp.sdgs} />

                  {/* 詳細展開 */}
                  {expandedId === opp.id && (
                    <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-900 leading-relaxed">
                      <div className="font-semibold text-green-700 mb-1">📋 詳細情報</div>
                      {opp.more}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleExpand(opp.id)}
                      className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      {expandedId === opp.id ? "▲ 閉じる" : "詳細を見る"}
                    </button>
                    <button
                      onClick={() => setContactModal({ title: opp.title, cta: "CSR参加を相談する" })}
                      className="text-xs bg-green-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-800 transition-colors"
                    >
                      CSR参加を相談する
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 問い合わせモーダル */}
      {contactModal && (
        <ContactModal
          title={contactModal.title}
          ctaLabel={contactModal.cta}
          onClose={() => setContactModal(null)}
        />
      )}
    </div>
  );
}
