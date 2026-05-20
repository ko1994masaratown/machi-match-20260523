import { useState } from "react";

const MY_TOWN_ID = "akita-001";

const INITIAL_SOS_POSTS = [
  { id: "s1", title: "農業後継者募集（あきたこまち）", category: "農業", urgency: "緊急", status: "published", date: "2026-05-10", views: 342 },
  { id: "s2", title: "介護スタッフ募集（正社員・住居あり）", category: "介護", urgency: "高", status: "published", date: "2026-05-12", views: 218 },
  { id: "s3", title: "観光DX支援者募集（SNS・動画）", category: "観光", urgency: "中", status: "pending", date: "2026-05-19", views: 0 },
];

const URGENCY_STYLE = {
  緊急: "bg-red-50 text-red-600 border-red-200",
  高: "bg-amber-50 text-amber-600 border-amber-200",
  中: "bg-blue-50 text-blue-600 border-blue-200",
  低: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function MunicipalityDashboard({ towns }) {
  const myTown = towns.find(t => t.id === MY_TOWN_ID) || towns[0];
  const [activeTab, setActiveTab] = useState("overview");
  const [sosPosts, setSosPosts] = useState(INITIAL_SOS_POSTS);
  const [sosFormOpen, setSosFormOpen] = useState(false);
  const [sosForm, setSosForm] = useState({ title: "", category: "農業", description: "", urgency: "中", foreignerOk: false });
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", date: "", location: "", hasJob: false, jobTitle: "", jobPay: "" });
  const [successMsg, setSuccessMsg] = useState("");

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  }

  function submitSOS() {
    if (!sosForm.title || !sosForm.category) return;
    setSosPosts(prev => [
      ...prev,
      {
        id: `s${Date.now()}`,
        title: sosForm.title,
        category: sosForm.category,
        urgency: sosForm.urgency,
        status: "pending",
        date: new Date().toISOString().slice(0, 10),
        views: 0,
      },
    ]);
    setSosForm({ title: "", category: "農業", description: "", urgency: "中", foreignerOk: false });
    setSosFormOpen(false);
    showSuccess("SOS投稿を送信しました。管理者の承認後に公開されます。");
  }

  function submitEvent() {
    if (!eventForm.title) return;
    setEventFormOpen(false);
    setEventForm({ title: "", date: "", location: "", hasJob: false, jobTitle: "", jobPay: "" });
    showSuccess("イベントを登録しました。承認後に公開されます。");
  }

  const publishedSOS = sosPosts.filter(p => p.status === "published");
  const pendingSOS = sosPosts.filter(p => p.status === "pending");

  const tabs = [
    { id: "overview", label: "概要", emoji: "🏛️" },
    { id: "sos", label: "SOS管理", emoji: "🆘" },
    { id: "events", label: "イベント", emoji: "🎉" },
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
        <h2 className="text-2xl font-bold text-gray-900">
          {myTown.prefecture} {myTown.name}
        </h2>
        <p className="text-sm text-gray-500 mt-1">担当者向けコントロールパネル</p>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <span className="font-bold">✓</span>
          {successMsg}
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

      {/* ── 概要 ── */}
      {activeTab === "overview" && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {/* Town profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-teal-600" />
              <img
                src={myTown.imageUrl}
                alt={myTown.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { e.target.style.display = "none"; }}
              />
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
                  <div className="text-xs text-gray-400 mt-0.5">SOSスコア</div>
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
                    <span className="text-red-400 font-bold text-xs">!</span>
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "公開中SOS", value: publishedSOS.length, color: "text-emerald-600" },
              { label: "承認待ち", value: pendingSOS.length, color: "text-amber-500" },
              { label: "登録イベント数", value: myTown.events.length, color: "text-indigo-600" },
              { label: "SOS閲覧数（累計）", value: publishedSOS.reduce((s, p) => s + (p.views || 0), 0), color: "text-gray-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Foreign worker status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-0.5">外国人材受け入れ</div>
              <div className="text-xs text-gray-400">現在のステータス</div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium border ${
              myTown.foreigners_ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
              {myTown.foreigners_ok ? "✓ 受け入れ可能" : "準備中"}
            </span>
          </div>
        </div>
      )}

      {/* ── SOS管理 ── */}
      {activeTab === "sos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">投稿済みSOS一覧</div>
            <button
              onClick={() => setSosFormOpen(true)}
              className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              + SOS投稿
            </button>
          </div>

          <div className="space-y-2">
            {sosPosts.map(post => (
              <div key={post.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${URGENCY_STYLE[post.urgency] || URGENCY_STYLE["中"]}`}>
                    {post.urgency}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    post.status === "published"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {post.status === "published" ? "公開中" : "承認待ち"}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900">{post.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{post.date} · 閲覧 {post.views}回</div>
              </div>
            ))}
          </div>

          {/* SOS form modal */}
          {sosFormOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setSosFormOpen(false)}
            >
              <div
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-base font-bold text-gray-900 mb-5">🆘 SOS投稿フォーム</div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">タイトル *</label>
                    <input
                      value={sosForm.title}
                      onChange={e => setSosForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="例：農業後継者を緊急募集"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">カテゴリ</label>
                      <select
                        value={sosForm.category}
                        onChange={e => setSosForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 bg-white"
                      >
                        {["農業", "介護", "観光", "IT・DX", "教育", "医療", "林業", "漁業", "その他"].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">緊急度</label>
                      <select
                        value={sosForm.urgency}
                        onChange={e => setSosForm(p => ({ ...p, urgency: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 bg-white"
                      >
                        {["低", "中", "高", "緊急"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">詳細説明</label>
                    <textarea
                      value={sosForm.description}
                      onChange={e => setSosForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="課題の背景や求める人材・スキルを記入してください"
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 resize-none transition-all"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sosForm.foreignerOk}
                      onChange={e => setSosForm(p => ({ ...p, foreignerOk: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">外国人材受け入れ可</span>
                  </label>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => setSosFormOpen(false)}
                    className="flex-1 text-sm border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={submitSOS}
                    disabled={!sosForm.title}
                    className="flex-1 text-sm bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    投稿する
                  </button>
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
            <button
              onClick={() => setEventFormOpen(true)}
              className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              + イベント追加
            </button>
          </div>

          <div className="space-y-2">
            {myTown.events.map(evt => (
              <div key={evt.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900 mb-1">{evt.title}</div>
                <div className="text-xs text-gray-400 mb-2">{evt.date} · {evt.location}</div>
                <div className="flex flex-wrap gap-1.5">
                  {evt.has_staff_job && (
                    <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-medium">
                      スタッフ募集中 {evt.job_pay ? `¥${evt.job_pay.toLocaleString()}/日` : ""}
                    </span>
                  )}
                  {evt.free && (
                    <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">無料</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Event form modal */}
          {eventFormOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setEventFormOpen(false)}
            >
              <div
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-base font-bold text-gray-900 mb-5">🎉 イベント投稿フォーム</div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">イベント名 *</label>
                    <input
                      value={eventForm.title}
                      onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="例：田植え体験イベント2026"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">開催日</label>
                      <input
                        type="date"
                        value={eventForm.date}
                        onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">場所</label>
                      <input
                        value={eventForm.location}
                        onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))}
                        placeholder="会場名"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventForm.hasJob}
                      onChange={e => setEventForm(p => ({ ...p, hasJob: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">スタッフ募集あり</span>
                  </label>
                  {eventForm.hasJob && (
                    <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-emerald-100">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">職種名</label>
                        <input
                          value={eventForm.jobTitle}
                          onChange={e => setEventForm(p => ({ ...p, jobTitle: e.target.value }))}
                          placeholder="例：運営スタッフ"
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">日給（円）</label>
                        <input
                          type="number"
                          value={eventForm.jobPay}
                          onChange={e => setEventForm(p => ({ ...p, jobPay: e.target.value }))}
                          placeholder="7000"
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => setEventFormOpen(false)}
                    className="flex-1 text-sm border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={submitEvent}
                    disabled={!eventForm.title}
                    className="flex-1 text-sm bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    登録する
                  </button>
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
          {/* Support programs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">登録済み支援制度</div>
            <div className="space-y-2">
              {myTown.support.map(s => (
                <div key={s} className="flex items-center gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-emerald-500 font-bold text-xs">✓</span>
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ 支援制度を追加</button>
          </div>

          {/* Company needs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">企業連携ニーズ一覧</div>
            <div className="space-y-3">
              {(myTown.industry_partners || []).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {p.dx_need && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">DX</span>
                    )}
                    {p.succession && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">承継</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ 企業連携ニーズを追加</button>
          </div>

          {/* Foreign worker toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-800 mb-1">外国人材受け入れ設定</div>
            <div className="text-xs text-gray-400 mb-3">現在のステータスを変更します</div>
            <div className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium border ${
              myTown.foreigners_ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
              {myTown.foreigners_ok ? "✓ 受け入れ可能" : "準備中"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
