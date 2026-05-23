import { useState } from "react";
import { matchMunicipalityNeeds } from "../services/matchService";

const TARGET_TYPES = ["移住者", "副業ワーカー", "地域おこし協力隊", "企業", "ボランティア"];

const MY_TOWN_ID = "akita-001";

const INITIAL_SOS_POSTS = [
  { id: "s1", title: "農業後継者募集（あきたこまち）", category: "農業", urgency: "緊急", status: "published", date: "2026-05-10", views: 342, inquiries: 12, applications: 4 },
  { id: "s2", title: "介護スタッフ募集（正社員・住居あり）", category: "介護", urgency: "高", status: "published", date: "2026-05-12", views: 218, inquiries: 7, applications: 2 },
  { id: "s3", title: "観光DX支援者募集（SNS・動画）", category: "観光", urgency: "中", status: "pending", date: "2026-05-19", views: 0, inquiries: 0, applications: 0 },
];

const URGENCY_STYLE = {
  緊急: "bg-red-50 text-red-600 border-red-200",
  高:   "bg-amber-50 text-amber-600 border-amber-200",
  中:   "bg-blue-50 text-blue-600 border-blue-200",
  低:   "bg-gray-50 text-gray-500 border-gray-200",
};

const URGENCY_DOT = { 緊急: "bg-red-500", 高: "bg-amber-400", 中: "bg-blue-400", 低: "bg-gray-300" };

export default function MunicipalityDashboard({ towns }) {
  const myTown = towns.find(t => t.id === MY_TOWN_ID) || towns[0];

  const [activeTab, setActiveTab]     = useState("ai");
  const [sosPosts, setSosPosts]       = useState(INITIAL_SOS_POSTS);
  const [sosFormOpen, setSosFormOpen] = useState(false);
  const [sosForm, setSosForm]         = useState({ title: "", category: "農業", description: "", urgency: "中", foreignerOk: false });
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventForm, setEventForm]         = useState({ title: "", date: "", location: "", hasJob: false, jobTitle: "", jobPay: "" });
  const [successMsg, setSuccessMsg]   = useState("");
  const [foreignerOk, setForeignerOk] = useState(myTown.foreigners_ok);

  // 支援制度
  const [supportList, setSupportList]     = useState([...myTown.support]);
  const [supportInput, setSupportInput]   = useState("");
  const [showSupportForm, setShowSupportForm] = useState(false);

  // 企業連携ニーズ
  const [partnerList, setPartnerList]   = useState([...(myTown.industry_partners || [])]);
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);
  const [partnerForm, setPartnerForm]   = useState({ name: "", category: "", dx_need: false, succession: false });

  // AIアシスト
  const [aiTargetIssue, setAiTargetIssue] = useState(myTown.issues?.[0] ?? "");
  const [aiTargetType, setAiTargetType]   = useState("副業ワーカー");
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiResult, setAiResult]           = useState(null);
  const [aiError, setAiError]             = useState("");
  const [copiedMsg, setCopiedMsg]         = useState(false);

  async function runAIMatch() {
    setAiLoading(true);
    setAiResult(null);
    setAiError("");
    try {
      const result = await matchMunicipalityNeeds({
        town: myTown,
        targetIssue: aiTargetIssue,
        targetType: aiTargetType,
        supportList,
      });
      setAiResult(result);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  function copyOutreach() {
    if (!aiResult?.outreachMessage) return;
    navigator.clipboard.writeText(aiResult.outreachMessage).then(() => {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    });
  }

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  }

  function submitSOS() {
    if (!sosForm.title || !sosForm.category) return;
    setSosPosts(prev => [
      ...prev,
      { id: `s${Date.now()}`, title: sosForm.title, category: sosForm.category, urgency: sosForm.urgency, status: "pending", date: new Date().toISOString().slice(0, 10), views: 0, inquiries: 0, applications: 0 },
    ]);
    setSosForm({ title: "", category: "農業", description: "", urgency: "中", foreignerOk: false });
    setSosFormOpen(false);
    showSuccess("SOS投稿を送信しました。管理者の承認後に公開されます。");
  }

  function closeSOS(id) {
    setSosPosts(prev => prev.map(p => p.id === id ? { ...p, status: "closed" } : p));
    showSuccess("SOSをクローズしました。");
  }

  function reopenSOS(id) {
    setSosPosts(prev => prev.map(p => p.id === id ? { ...p, status: "published" } : p));
    showSuccess("SOSを再公開しました。");
  }

  function submitEvent() {
    if (!eventForm.title) return;
    setEventFormOpen(false);
    setEventForm({ title: "", date: "", location: "", hasJob: false, jobTitle: "", jobPay: "" });
    showSuccess("イベントを登録しました。承認後に公開されます。");
  }

  function addSupport() {
    if (!supportInput.trim()) return;
    setSupportList(prev => [...prev, supportInput.trim()]);
    setSupportInput("");
    setShowSupportForm(false);
    showSuccess("支援制度を追加しました。");
  }

  function addPartner() {
    if (!partnerForm.name) return;
    setPartnerList(prev => [...prev, { id: `ip${Date.now()}`, ...partnerForm, emoji: "🏢", tagline: "", story: "", tech: [], employee_size: "未定", challenges: [], collab_types: [], founded: "" }]);
    setPartnerForm({ name: "", category: "", dx_need: false, succession: false });
    setPartnerFormOpen(false);
    showSuccess("企業連携ニーズを追加しました。");
  }

  const publishedSOS = sosPosts.filter(p => p.status === "published");
  const pendingSOS   = sosPosts.filter(p => p.status === "pending");
  const totalViews   = publishedSOS.reduce((s, p) => s + (p.views || 0), 0);
  const totalInquiries    = publishedSOS.reduce((s, p) => s + (p.inquiries || 0), 0);
  const totalApplications = publishedSOS.reduce((s, p) => s + (p.applications || 0), 0);

  const tabs = [
    { id: "ai",       label: "AIアシスト", emoji: "🤖" },
    { id: "overview", label: "概要",       emoji: "🏛️" },
    { id: "sos",      label: "SOS管理",    emoji: "🆘" },
    { id: "events",   label: "イベント",   emoji: "🎉" },
    { id: "settings", label: "設定・制度", emoji: "⚙️" },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            自治体ダッシュボード
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{myTown.prefecture} {myTown.name}</h2>
        <p className="text-sm text-gray-500 mt-1">担当者向けコントロールパネル</p>
      </div>

      {/* Toast */}
      {successMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
          <span className="font-bold">✓</span>{successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 text-xs font-semibold py-2.5 px-2 rounded-xl transition-all ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* ── AIアシスト ── */}
      {activeTab === "ai" && (
        <div className="space-y-5">
          {/* 説明バナー */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white">
            <div className="text-sm font-bold mb-1">AIターゲット分析</div>
            <div className="text-xs text-white/80">地域のSOS課題に最もマッチする人材・企業をAIが分析。効果的な呼びかけ文も自動生成します。</div>
          </div>

          {/* 入力フォーム */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="text-sm font-semibold text-gray-800 mb-1">解決したいSOS課題と求める連携タイプを選んでください</div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">対象SOS課題 <span className="text-red-500">*</span></label>
              <select
                value={aiTargetIssue}
                onChange={e => setAiTargetIssue(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
              >
                {myTown.issues?.map(issue => <option key={issue} value={issue}>{issue}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">求める連携タイプ</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TARGET_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setAiTargetType(type)}
                    className={`text-xs py-2 px-3 rounded-xl border font-medium transition-all ${
                      aiTargetType === type
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runAIMatch}
              disabled={aiLoading || !aiTargetIssue}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  AI分析中…（最大25秒）
                </>
              ) : "AIでターゲット分析する"}
            </button>
            {aiError && <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{aiError}</div>}
          </div>

          {/* 結果カード */}
          {aiResult && (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-md overflow-hidden">
              {/* スコアヘッダー */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/70 mb-0.5">ターゲット有効性スコア</div>
                  <div className="text-3xl font-bold text-white">{aiResult.matchScore}<span className="text-base font-normal text-white/70 ml-1">/ 100</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/70 mb-0.5">最適連携タイプ</div>
                  <div className="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">{aiResult.matchType}</div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* ターゲットプロフィール */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">ターゲットプロフィール</div>
                  <div className="text-sm text-gray-800 font-medium bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                    {aiResult.targetProfile}
                  </div>
                </div>

                {/* 呼びかけ文 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">呼びかけ文（SNS/チラシ用）</div>
                    <button
                      onClick={copyOutreach}
                      className="text-xs text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
                    >
                      {copiedMsg ? "コピー済み ✓" : "コピー"}
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 leading-relaxed">
                    "{aiResult.outreachMessage}"
                  </div>
                </div>

                {/* 2列グリッド */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-xs font-semibold text-gray-400 mb-1">地域の魅力（ターゲット目線）</div>
                    <div className="text-sm text-gray-700">{aiResult.keyAttraction}</div>
                  </div>
                  <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                    <div className="text-xs font-semibold text-red-400 mb-1">SOS訴求ポイント</div>
                    <div className="text-sm text-red-700">{aiResult.sosHighlight}</div>
                  </div>
                </div>

                {/* アクション提案 */}
                <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100 flex items-start gap-2">
                  <span className="text-indigo-500 font-bold text-xs mt-0.5 flex-shrink-0">NEXT</span>
                  <div className="text-sm text-indigo-700">{aiResult.actionSuggestion}</div>
                </div>

                <div className="text-xs text-gray-300 text-right">AI: {aiResult.source}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 概要 ── */}
      {activeTab === "overview" && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">

          {/* Town profile */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-teal-600" />
              <img src={myTown.imageUrl} alt={myTown.name} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="text-xs text-white/70">{myTown.prefecture}</div>
                <div className="text-lg font-bold text-white">{myTown.name}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-red-50 rounded-xl py-3">
                  <div className="text-xl font-bold text-red-600">{myTown.sos_score}</div>
                  <div className="text-xs text-gray-400 mt-0.5">SOS度</div>
                </div>
                <div className="text-center bg-gray-50 rounded-xl py-3">
                  <div className="text-xl font-bold text-gray-800">{myTown.aging_rate}%</div>
                  <div className="text-xs text-gray-400 mt-0.5">高齢化率</div>
                </div>
                <div className="text-center bg-gray-50 rounded-xl py-3">
                  <div className="text-xl font-bold text-gray-800">{(myTown.population / 10000).toFixed(1)}万</div>
                  <div className="text-xs text-gray-400 mt-0.5">人口</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">現在の課題</div>
                {myTown.issues.map(issue => (
                  <div key={issue} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-400 font-bold text-xs">!</span>{issue}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: stats + analytics */}
          <div className="space-y-3">
            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "公開中SOS",     value: publishedSOS.length,    color: "text-emerald-600" },
                { label: "承認待ち",       value: pendingSOS.length,       color: "text-amber-500"  },
                { label: "累計閲覧数",     value: totalViews,              color: "text-gray-700"   },
                { label: "登録イベント数",  value: myTown.events.length,    color: "text-indigo-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Engagement analytics */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-800 mb-3">📊 反応の集計（公開中SOS）</div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "問い合わせ", value: totalInquiries,    color: "text-blue-600",   bg: "bg-blue-50"   },
                  { label: "参加申込",   value: totalApplications, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "累計閲覧",   value: totalViews,         color: "text-gray-700",   bg: "bg-gray-50"   },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <div className={`text-xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {/* Per-SOS bar */}
              <div className="space-y-2">
                {publishedSOS.map(p => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-gray-600 truncate mr-2">{p.title}</span>
                      <span className="text-gray-400 flex-shrink-0">👁 {p.views}  💬 {p.inquiries}  ✋ {p.applications}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min((p.views / (totalViews || 1)) * 100, 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 外国人材ステータス */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-0.5">外国人材受け入れ</div>
                <div className="text-xs text-gray-400">現在のステータス</div>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium border ${
                foreignerOk ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"
              }`}>
                {foreignerOk ? "✓ 受け入れ可能" : "準備中"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SOS管理 ── */}
      {activeTab === "sos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">投稿済みSOS（{sosPosts.length}件）</div>
            <button onClick={() => setSosFormOpen(true)} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              + SOS投稿
            </button>
          </div>

          <div className="space-y-2">
            {sosPosts.map(post => (
              <div key={post.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-opacity ${post.status === "closed" ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${URGENCY_DOT[post.urgency] || "bg-gray-300"}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${URGENCY_STYLE[post.urgency] || URGENCY_STYLE["中"]}`}>{post.urgency}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    post.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : post.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {post.status === "published" ? "公開中" : post.status === "pending" ? "承認待ち" : "クローズ"}
                  </span>
                </div>

                <div className="text-sm font-bold text-gray-900 mb-0.5">{post.title}</div>
                <div className="text-xs text-gray-400 mb-3">{post.date} 投稿</div>

                {/* Engagement metrics */}
                {post.status === "published" && (
                  <div className="flex gap-3 mb-3">
                    {[
                      { icon: "👁", val: post.views,        label: "閲覧" },
                      { icon: "💬", val: post.inquiries,    label: "問い合わせ" },
                      { icon: "✋", val: post.applications, label: "参加申込" },
                    ].map(({ icon, val, label }) => (
                      <div key={label} className="flex items-center gap-1 text-xs text-gray-500">
                        <span>{icon}</span>
                        <span className="font-semibold text-gray-700">{val}</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {post.status === "published" && (
                  <button onClick={() => closeSOS(post.id)} className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    クローズ
                  </button>
                )}
                {post.status === "closed" && (
                  <button onClick={() => reopenSOS(post.id)} className="text-xs border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                    再公開
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SOS form modal */}
          {sosFormOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSosFormOpen(false)}>
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="text-base font-bold text-gray-900 mb-5">🆘 SOS投稿フォーム</div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">タイトル <span className="text-red-500">*</span></label>
                    <input value={sosForm.title} onChange={e => setSosForm(p => ({ ...p, title: e.target.value }))} placeholder="例：農業後継者を緊急募集" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">カテゴリ</label>
                      <select value={sosForm.category} onChange={e => setSosForm(p => ({ ...p, category: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 bg-white">
                        {["農業", "介護", "観光", "IT・DX", "教育", "医療", "林業", "漁業", "その他"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">緊急度</label>
                      <select value={sosForm.urgency} onChange={e => setSosForm(p => ({ ...p, urgency: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 bg-white">
                        {["低", "中", "高", "緊急"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">詳細説明</label>
                    <textarea value={sosForm.description} onChange={e => setSosForm(p => ({ ...p, description: e.target.value }))} placeholder="課題の背景や求める人材・スキルを記入してください" rows={3} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 resize-none transition-all" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sosForm.foreignerOk} onChange={e => setSosForm(p => ({ ...p, foreignerOk: e.target.checked }))} className="rounded" />
                    <span className="text-sm text-gray-700">外国人材受け入れ可</span>
                  </label>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setSosFormOpen(false)} className="flex-1 text-sm border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
                  <button onClick={submitSOS} disabled={!sosForm.title} className="flex-1 text-sm bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">投稿する</button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">投稿後、管理者の承認を経て公開されます</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── イベント ── */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">登録済みイベント（{myTown.events.length}件）</div>
            <button onClick={() => setEventFormOpen(true)} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              + イベント追加
            </button>
          </div>

          <div className="space-y-2">
            {myTown.events.map(evt => (
              <div key={evt.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="text-sm font-bold text-gray-900 mb-1">{evt.title}</div>
                <div className="text-xs text-gray-400 mb-2">{evt.date} · {evt.location}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {evt.has_staff_job && (
                    <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-medium">
                      スタッフ募集中 {evt.job_pay ? `¥${evt.job_pay.toLocaleString()}/日` : ""}
                    </span>
                  )}
                  {evt.free && <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">無料</span>}
                  {evt.expected_visitors && (
                    <span className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-0.5">
                      想定来場 {evt.expected_visitors.toLocaleString()}人
                    </span>
                  )}
                </div>
                {/* Mock engagement */}
                {evt.has_staff_job && (
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>👁 {Math.floor(Math.random() * 80 + 20)} 閲覧</span>
                    <span>✋ {Math.floor(Math.random() * 5 + 1)} 申込</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Event form modal */}
          {eventFormOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setEventFormOpen(false)}>
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="text-base font-bold text-gray-900 mb-5">🎉 イベント投稿フォーム</div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">イベント名 <span className="text-red-500">*</span></label>
                    <input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="例：田植え体験イベント2026" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">開催日</label>
                      <input type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">場所</label>
                      <input value={eventForm.location} onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} placeholder="会場名" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={eventForm.hasJob} onChange={e => setEventForm(p => ({ ...p, hasJob: e.target.checked }))} className="rounded" />
                    <span className="text-sm text-gray-700">スタッフ募集あり</span>
                  </label>
                  {eventForm.hasJob && (
                    <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-emerald-100">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">職種名</label>
                        <input value={eventForm.jobTitle} onChange={e => setEventForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="例：運営スタッフ" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">日給（円）</label>
                        <input type="number" value={eventForm.jobPay} onChange={e => setEventForm(p => ({ ...p, jobPay: e.target.value }))} placeholder="7000" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setEventFormOpen(false)} className="flex-1 text-sm border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
                  <button onClick={submitEvent} disabled={!eventForm.title} className="flex-1 text-sm bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">登録する</button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">投稿後、管理者の承認を経て公開されます</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 設定・制度 ── */}
      {activeTab === "settings" && (
        <div className="space-y-4">

          {/* 支援制度 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-800">登録済み支援制度</div>
              <button onClick={() => setShowSupportForm(p => !p)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                {showSupportForm ? "キャンセル" : "+ 追加"}
              </button>
            </div>
            <div className="space-y-1.5 mb-3">
              {supportList.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-emerald-500 font-bold text-xs">✓</span>
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
            {showSupportForm && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                  value={supportInput}
                  onChange={e => setSupportInput(e.target.value)}
                  placeholder="例：起業支援補助金（最大50万円）"
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  onKeyDown={e => e.key === "Enter" && addSupport()}
                />
                <button onClick={addSupport} disabled={!supportInput.trim()} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex-shrink-0">
                  追加
                </button>
              </div>
            )}
          </div>

          {/* 企業連携ニーズ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-800">企業連携ニーズ一覧</div>
              <button onClick={() => setPartnerFormOpen(p => !p)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                {partnerFormOpen ? "キャンセル" : "+ 追加"}
              </button>
            </div>
            <div className="space-y-2 mb-3">
              {partnerList.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {p.dx_need && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">DX</span>}
                    {p.succession && <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">承継</span>}
                  </div>
                </div>
              ))}
            </div>
            {partnerFormOpen && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={partnerForm.name} onChange={e => setPartnerForm(p => ({ ...p, name: e.target.value }))} placeholder="企業・団体名" className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 transition-all" />
                  <input value={partnerForm.category} onChange={e => setPartnerForm(p => ({ ...p, category: e.target.value }))} placeholder="業種（例：農業）" className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 transition-all" />
                </div>
                <div className="flex gap-4 px-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={partnerForm.dx_need} onChange={e => setPartnerForm(p => ({ ...p, dx_need: e.target.checked }))} className="rounded" />
                    DXニーズあり
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={partnerForm.succession} onChange={e => setPartnerForm(p => ({ ...p, succession: e.target.checked }))} className="rounded" />
                    事業承継希望
                  </label>
                </div>
                <button onClick={addPartner} disabled={!partnerForm.name} className="w-full text-xs bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  追加する
                </button>
              </div>
            )}
          </div>

          {/* 外国人材受け入れ設定（実動作） */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-0.5">外国人材受け入れ設定</div>
                <div className="text-xs text-gray-400">ステータスを変更すると地域カードに反映されます</div>
              </div>
              <button
                onClick={() => { setForeignerOk(p => !p); showSuccess(`外国人材受け入れを「${!foreignerOk ? "受け入れ可能" : "準備中"}」に変更しました。`); }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${foreignerOk ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${foreignerOk ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className={`mt-3 text-xs px-3 py-2 rounded-lg font-medium ${foreignerOk ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
              現在：{foreignerOk ? "✓ 外国人材受け入れ可能" : "準備中（受け入れ不可）"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
