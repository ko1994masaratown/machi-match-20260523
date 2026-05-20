import { useState } from "react";

const INITIAL_PENDING = [
  { id: "p1", type: "SOS", town: "福島県 只見町", title: "雪かき緊急支援募集2026冬", submittedAt: "2026-05-18", status: "pending" },
  { id: "p2", type: "SOS", town: "秋田県 仙北市", title: "観光DX支援者募集（SNS・動画）", submittedAt: "2026-05-19", status: "pending" },
  { id: "p3", type: "SOS", town: "高知県 四万十町", title: "農業担い手 移住支援付き", submittedAt: "2026-05-20", status: "pending" },
  { id: "p4", type: "M&A審査", town: "長野県 小海町", title: "ペンション組合 事業承継案件（企業審査待ち）", submittedAt: "2026-05-19", status: "pending" },
  { id: "p5", type: "SOS", town: "大分県 九重町", title: "温泉旅館スタッフ（住み込み可）", submittedAt: "2026-05-20", status: "pending" },
];

const FLAGGED_POSTS = [
  { id: "f1", content: "スパム的なSOS投稿の疑い（繰り返し投稿）", target: "匿名ユーザー ID: USR-4421", flaggedAt: "2026-05-19" },
  { id: "f2", content: "不審な企業アカウント（実態確認要）", target: "企業ID: COMP-9821", flaggedAt: "2026-05-20" },
];

export default function AdminDashboard({ towns }) {
  const [pendingItems, setPendingItems] = useState(INITIAL_PENDING);
  const [activeTab, setActiveTab] = useState("overview");
  const [sosOverrides, setSosOverrides] = useState({});

  function approve(id) {
    setPendingItems(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
  }

  function reject(id) {
    setPendingItems(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
  }

  const pendingCount = pendingItems.filter(p => p.status === "pending").length;
  const approvedCount = pendingItems.filter(p => p.status === "approved").length;

  const tabs = [
    { id: "overview", label: "概要", emoji: "📊" },
    { id: "approvals", label: `承認管理${pendingCount > 0 ? ` (${pendingCount})` : ""}`, emoji: "✅" },
    { id: "users", label: "ユーザー管理", emoji: "👥" },
    { id: "sos_settings", label: "SOS設定", emoji: "⚙️" },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            管理者ダッシュボード
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">システム管理画面</h2>
        <p className="text-sm text-gray-500 mt-1">全ユーザー・投稿・承認を一元管理します</p>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-amber-800">
              承認待ちが {pendingCount}件 あります
            </div>
            <div className="text-xs text-amber-600 mt-0.5">承認管理タブから確認・対応してください</div>
          </div>
          <button
            onClick={() => setActiveTab("approvals")}
            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            確認する
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5 overflow-x-auto">
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
        <div className="space-y-4">
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "全ユーザー数", value: "1,247", icon: "👤", color: "text-indigo-600" },
              { label: "自治体アカウント", value: towns.length, icon: "🏛️", color: "text-emerald-600" },
              { label: "企業アカウント", value: "186", icon: "🏢", color: "text-slate-700" },
              { label: "公開中SOS数", value: "34", icon: "🆘", color: "text-red-600" },
              { label: "承認待ち投稿", value: pendingCount, icon: "⏳", color: "text-amber-600" },
              { label: "M&A審査待ち", value: pendingItems.filter(p => p.type === "M&A審査" && p.status === "pending").length, icon: "🏢", color: "text-slate-600" },
              { label: "今日の承認数", value: approvedCount, icon: "✓", color: "text-emerald-600" },
              { label: "不適切投稿", value: FLAGGED_POSTS.length, icon: "🚩", color: "text-rose-600" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-lg mb-0.5">{icon}</div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Towns list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">
              参加自治体一覧（{towns.length}件）
            </div>
            <div className="space-y-0">
              {towns.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.sos_score >= 90 ? "bg-red-500" : t.sos_score >= 80 ? "bg-amber-400" : "bg-blue-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700">{t.prefecture} {t.name}</span>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      t.sos_score >= 90 ? "text-red-600" : t.sos_score >= 80 ? "text-amber-600" : "text-blue-600"
                    }`}
                  >
                    SOS {sosOverrides[t.id] ?? t.sos_score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 承認管理 ── */}
      {activeTab === "approvals" && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            承認待ち一覧（{pendingCount}件）
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {pendingItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 shadow-sm">
              承認待ちの投稿はありません
            </div>
          ) : (
            pendingItems.map(item => (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                  item.status === "pending"
                    ? "border-gray-200"
                    : item.status === "approved"
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-red-200 bg-red-50/30 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      item.type === "SOS"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500">{item.town}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : item.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === "pending" ? "待機中" : item.status === "approved" ? "承認済" : "差し戻し"}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</div>
                <div className="text-xs text-gray-400 mb-3">{item.submittedAt} 提出</div>

                {item.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(item.id)}
                      className="flex-1 text-xs bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      ✓ 承認
                    </button>
                    <button
                      onClick={() => reject(item.id)}
                      className="flex-1 text-xs bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                    >
                      ✗ 差し戻し
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          </div>{/* end inner grid */}
        </div>
      )}

      {/* ── ユーザー管理 ── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* User stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "総ユーザー", value: "1,247", color: "text-indigo-600" },
              { label: "自治体", value: towns.length, color: "text-emerald-600" },
              { label: "企業", value: "186", color: "text-slate-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Flagged posts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-800 mb-3">
              不適切投稿チェック（{FLAGGED_POSTS.length}件）
            </div>
            <div className="space-y-2">
              {FLAGGED_POSTS.map(f => (
                <div key={f.id} className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <span className="text-rose-400 text-sm mt-0.5">🚩</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-rose-800 leading-tight">{f.content}</div>
                    <div className="text-xs text-rose-500 mt-0.5">{f.target} · {f.flaggedAt}</div>
                  </div>
                  <button className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-rose-700 transition-colors flex-shrink-0">
                    対応
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SOS設定 ── */}
      {activeTab === "sos_settings" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            スコアを変更すると、地域カードの優先順位や表示が変わります。実際の本番環境では管理者権限が必要です。
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-800 mb-4">SOSスコア管理</div>
            <div className="space-y-4">
              {towns.map(t => {
                const score = sosOverrides[t.id] ?? t.sos_score;
                const scoreColor =
                  score >= 90 ? "text-red-600" : score >= 80 ? "text-amber-600" : "text-blue-600";
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-medium text-gray-800">
                        {t.prefecture} {t.name}
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>{score}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={score}
                      onChange={e =>
                        setSosOverrides(prev => ({ ...prev, [t.id]: Number(e.target.value) }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                );
              })}
            </div>
            <button className="mt-5 w-full text-xs bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
              スコア変更を保存（デモ）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
