import { useState } from "react";

export const ROLES = [
  {
    id: "general",
    label: "一般ユーザー",
    emoji: "👤",
    bg: "bg-indigo-600",
    text: "text-white",
    border: "border-indigo-600",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    desc: "地域課題を探す・参加する",
  },
  {
    id: "municipality",
    label: "自治体担当者",
    emoji: "🏛️",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    desc: "SOS投稿・地域情報管理",
  },
  {
    id: "company",
    label: "企業ユーザー",
    emoji: "🏢",
    bg: "bg-slate-700",
    text: "text-white",
    border: "border-slate-700",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    desc: "協業・DX・M&A案件検索",
  },
  {
    id: "admin",
    label: "システム管理者",
    emoji: "⚙️",
    bg: "bg-red-600",
    text: "text-white",
    border: "border-red-600",
    badge: "bg-red-100 text-red-700 border-red-200",
    desc: "全ユーザー・投稿承認管理",
  },
];

export function getRoleInfo(role) {
  return ROLES.find(r => r.id === role) || ROLES[0];
}

export default function RoleSwitcher({ currentRole, onChange }) {
  const [open, setOpen] = useState(false);
  const current = getRoleInfo(currentRole);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`text-xs px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 transition-all ${current.bg} ${current.text} ${current.border}`}
      >
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-[10px] opacity-70">▼</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden w-58">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                ロール切替（デモ用）
              </div>
            </div>
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => { onChange(role.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-b border-gray-50 last:border-0 ${
                  currentRole === role.id ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${role.bg} ${role.text} flex-shrink-0`}
                >
                  {role.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-800 leading-tight">{role.label}</div>
                  <div className="text-xs text-gray-400 leading-tight mt-0.5">{role.desc}</div>
                </div>
                {currentRole === role.id && (
                  <div className="ml-auto text-indigo-600 text-sm flex-shrink-0 font-bold">✓</div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
