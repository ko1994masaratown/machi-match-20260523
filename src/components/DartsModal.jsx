import { useState, useEffect, useRef } from "react";
import MatchCelebration from "./MatchCelebration";

// Pre-calculated SVG coordinates for viewBox "0 0 500 600"
// x = (lng - 122) / 26 * 500,  y = (46 - lat) / 22 * 600
const DART_COORDS = {
  "akita-001":    { x: 347, y: 172 },
  "shimane-001":  { x: 188, y: 314 },
  "nagano-001":   { x: 319, y: 271 },
  "hokkaido-001": { x: 394, y: 63  },
  "kochi-001":    { x: 214, y: 349 },
  "fukushima-001":{ x: 330, y: 236 },
  "oita-001":     { x: 176, y: 348 },
  "iwate-001":    { x: 376, y: 182 },
};

const FUN_COPY = [
  "えいっ！🎯",
  "どこへ飛ぶかな…？",
  "運命の地を探せ！",
  "ダーツよ、飛べ！",
  "次の旅先は…！",
];

export default function DartsModal({ towns, onClose, onSelectTown }) {
  // phase: "idle" | "flying" | "wobble" | "landed"
  const [phase, setPhase] = useState("idle");
  const [chosenTown, setChosenTown] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [dartPos, setDartPos] = useState({ x: -80, y: -50 });
  const [targetPos, setTargetPos] = useState({ x: 250, y: 300 });
  const [svgViewBox, setSvgViewBox] = useState("0 0 500 600");
  const [zoomed, setZoomed] = useState(false);
  const [funCopy] = useState(() => FUN_COPY[Math.floor(Math.random() * FUN_COPY.length)]);
  const rafRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  function pickTown() {
    const pool = towns.filter(t => DART_COORDS[t.id]);
    return pool[Math.floor(Math.random() * pool.length)] || towns[0];
  }

  function throwDart() {
    if (phase === "flying") return;

    const town = pickTown();
    const coords = DART_COORDS[town.id] || { x: 250, y: 300 };

    setChosenTown(town);
    setTargetPos(coords);
    setDartPos({ x: -80, y: -50 });
    setSvgViewBox("0 0 500 600");
    setZoomed(false);
    setPhase("flying");

    // After dart lands, wobble then show result
    const flyDuration = 1000;
    setTimeout(() => {
      setPhase("wobble");
      setDartPos(coords);
      setTimeout(() => {
        setPhase("landed");
        setShowCelebration(true);
      }, 600);
    }, flyDuration);
  }

  function zoomToTown(cx, cy) {
    const START_VB = { x: 0, y: 0, w: 500, h: 600 };
    const END_VB = { x: cx - 80, y: cy - 80, w: 160, h: 160 };
    const duration = 700;
    const startTime = performance.now();

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const e = easeInOut(t);
      const vx = lerp(START_VB.x, END_VB.x, e);
      const vy = lerp(START_VB.y, END_VB.y, e);
      const vw = lerp(START_VB.w, END_VB.w, e);
      const vh = lerp(START_VB.h, END_VB.h, e);
      setSvgViewBox(`${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  function zoomOut() {
    const END_VB = { x: 0, y: 0, w: 500, h: 600 };
    const tc = targetPos;
    const START_VB = { x: tc.x - 80, y: tc.y - 80, w: 160, h: 160 };
    const duration = 600;
    const startTime = performance.now();

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const e = easeInOut(t);
      const vx = lerp(START_VB.x, END_VB.x, e);
      const vy = lerp(START_VB.y, END_VB.y, e);
      const vw = lerp(START_VB.w, END_VB.w, e);
      const vh = lerp(START_VB.h, END_VB.h, e);
      setSvgViewBox(`${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  function toggleZoom() {
    if (!zoomed) {
      zoomToTown(targetPos.x, targetPos.y);
      setZoomed(true);
    } else {
      zoomOut();
      setZoomed(false);
    }
  }

  // Dart SVG element position: animate from off-screen to target
  const isFlying = phase === "flying";
  const dartX = isFlying ? targetPos.x : dartPos.x;
  const dartY = isFlying ? targetPos.y : dartPos.y;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Match celebration overlay */}
      {showCelebration && chosenTown && (
        <MatchCelebration
          regionName={chosenTown.name}
          prefecture={chosenTown.prefecture}
          imageUrl={chosenTown.imageUrl ?? null}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex flex-col m-3 sm:m-6 lg:mx-auto lg:my-6 lg:w-full lg:max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-48px)]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <div className="text-white font-bold text-base leading-tight">ダーツの旅</div>
              <div className="text-white/70 text-xs">どこへ行こうか迷ったら、えいっ！</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Japan Map area */}
          <div className="relative bg-gradient-to-b from-sky-100 to-blue-200 p-4">
            <svg
              viewBox={svgViewBox}
              className="w-full"
              style={{ height: "min(55vw, 340px)", display: "block", transition: "none" }}
            >
              {/* Ocean waves (decorative) */}
              <defs>
                <pattern id="wave" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 20 Q10 14 20 20 Q30 26 40 20" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity="0.4"/>
                </pattern>
              </defs>
              <rect width="500" height="600" fill="url(#wave)" opacity="0.6"/>

              {/* Japan islands */}
              {/* Hokkaido */}
              <path
                d="M370 18 C385 10 410 14 430 24 C448 34 458 52 455 70 C452 86 440 100 424 108 C408 116 388 116 372 108 C356 100 346 84 348 68 C350 52 358 26 370 18Z"
                fill="#86efac" stroke="#4ade80" strokeWidth="1.5"
              />
              {/* Honshu */}
              <path
                d="M355 128 C363 138 370 152 374 168 C378 184 378 200 374 216 C370 232 362 244 354 256 C346 268 336 278 326 288 C316 298 306 306 294 312 C282 318 268 320 254 318 C240 316 228 310 216 302 C204 294 192 286 182 282 C172 278 162 278 155 284 C151 288 150 294 154 298 C162 292 172 284 185 280 C198 276 214 272 230 270 C244 268 256 262 266 252 C276 242 284 228 290 214 C298 196 308 176 320 158 C330 142 342 132 350 128 Z"
                fill="#86efac" stroke="#4ade80" strokeWidth="1.5"
              />
              {/* Shikoku */}
              <path
                d="M198 330 C208 322 224 320 240 324 C254 328 262 338 258 348 C254 358 238 364 222 362 C206 360 194 350 196 338 Z"
                fill="#86efac" stroke="#4ade80" strokeWidth="1.5"
              />
              {/* Kyushu */}
              <path
                d="M155 330 C167 322 182 326 193 336 C204 346 210 360 206 374 C202 387 190 396 175 396 C160 396 148 387 143 374 C138 361 140 347 148 337 Z"
                fill="#86efac" stroke="#4ade80" strokeWidth="1.5"
              />

              {/* Town dots */}
              {towns.map(t => {
                const c = DART_COORDS[t.id];
                if (!c) return null;
                const isChosen = chosenTown && chosenTown.id === t.id;
                return (
                  <g key={t.id}>
                    {isChosen && (
                      <circle cx={c.x} cy={c.y} r="14" fill="#f97316" opacity="0.25">
                        <animate attributeName="r" values="10;18;10" dur="1.4s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.35;0.1;0.35" dur="1.4s" repeatCount="indefinite"/>
                      </circle>
                    )}
                    <circle
                      cx={c.x} cy={c.y} r={isChosen ? 5 : 3.5}
                      fill={isChosen ? "#f97316" : "#6366f1"}
                      stroke="white" strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* Dart (emoji-like SVG) */}
              {phase !== "idle" && (
                <g
                  style={{
                    transform: `translate(${dartX}px, ${dartY}px)`,
                    transition: isFlying
                      ? "transform 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                      : "none",
                    transformOrigin: `${dartX}px ${dartY}px`,
                  }}
                  className={phase === "wobble" ? "animate-dart-wobble" : ""}
                >
                  {/* dart body */}
                  <g transform="translate(-18, -8) rotate(-30, 18, 8)">
                    {/* shaft */}
                    <rect x="4" y="6" width="22" height="3" rx="1.5" fill="#f59e0b"/>
                    {/* tip */}
                    <polygon points="26,4 32,7.5 26,11" fill="#ef4444"/>
                    {/* flight */}
                    <polygon points="4,4 -4,0 0,7.5 -4,15 4,11" fill="#3b82f6" opacity="0.9"/>
                    {/* center band */}
                    <rect x="10" y="5.5" width="3" height="4" rx="1" fill="#d97706"/>
                  </g>
                </g>
              )}
            </svg>

            {/* Zoom button */}
            {phase === "landed" && chosenTown && (
              <button
                onClick={toggleZoom}
                className="absolute bottom-5 right-5 bg-white/90 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md hover:bg-white transition-colors border border-gray-200"
              >
                {zoomed ? "🔍 全体表示" : "🔎 拡大"}
              </button>
            )}

            {/* Idle state CTA overlay */}
            {phase === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-sm font-bold text-gray-700 mb-4">日本地図にダーツを投げよう！</div>
                  <button
                    onClick={throwDart}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    🎯 ダーツを投げる
                  </button>
                </div>
              </div>
            )}

            {/* Flying state */}
            {phase === "flying" && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm text-orange-600 text-xs font-bold px-4 py-2 rounded-full shadow">
                  {funCopy} どこへ刺さるかな…
                </div>
              </div>
            )}
          </div>

          {/* Result card */}
          {(phase === "wobble" || phase === "landed") && chosenTown && (
            <div className={`p-4 ${phase === "wobble" ? "opacity-0" : "animate-bounce-in"}`}>
              <div className="text-center mb-3">
                <div className="text-lg font-black text-orange-600">
                  🎯 今回の旅先は…
                </div>
                <div className="text-2xl font-black text-gray-900 mt-0.5">
                  {chosenTown.prefecture} {chosenTown.name}！
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl overflow-hidden">
                {/* Image strip */}
                <div className="relative h-28 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-rose-500" />
                  {chosenTown.imageUrl && (
                    <img src={chosenTown.imageUrl} alt={chosenTown.name} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-white/80 bg-red-500/80 px-2 py-0.5 rounded-full">SOS {chosenTown.sos_score}</span>
                    <span className="text-xs text-white/70">高齢化率 {chosenTown.aging_rate}%</span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{chosenTown.catchCopy}</p>

                  {/* Spot jobs */}
                  <div className="space-y-1.5 mb-4">
                    {chosenTown.jobs.filter(j => j.period === "spot").slice(0, 2).map(j => (
                      <div key={j.id} className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-orange-100 rounded-lg px-2.5 py-1.5">
                        <span>💼</span>
                        <span>{j.title}</span>
                        {typeof j.pay === "number" && (
                          <span className="ml-auto font-semibold text-orange-700">日給¥{j.pay.toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                    {chosenTown.events.filter(e => e.has_staff_job).slice(0, 1).map(e => (
                      <div key={e.id} className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-emerald-100 rounded-lg px-2.5 py-1.5">
                        <span>🎉</span>
                        <span className="flex-1">{e.title}</span>
                        <span className="text-emerald-600 font-medium flex-shrink-0">スタッフ募集</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onSelectTown(chosenTown); onClose(); }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    >
                      この地域を見る →
                    </button>
                    <button
                      onClick={throwDart}
                      className="flex-shrink-0 text-sm border-2 border-orange-300 text-orange-600 font-bold px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors"
                    >
                      もう一回 🎯
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
