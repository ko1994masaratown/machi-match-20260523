import { useEffect, useRef, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const CONFETTI_COLORS = [
  "#6366f1", "#a78bfa", "#f59e0b", "#34d399",
  "#f472b6", "#38bdf8", "#fb923c", "#e879f9",
];

function sr(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function MatchCelebration({
  regionName, prefecture, matchScore, imageUrl, onDismiss,
}) {
  const [visible,  setVisible]  = useState(false);
  const [cardIn,   setCardIn]   = useState(false);
  const [scoreIn,  setScoreIn]  = useState(false);
  const [imgError, setImgError] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true),  30);
    const t2 = setTimeout(() => setCardIn(true),  160);
    const t3 = setTimeout(() => setScoreIn(true), 580);
    const t4 = setTimeout(() => onDismissRef.current(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const confetti = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left:  sr(i * 7)  * 100,
      delay: sr(i * 11) * 900,
      dur:   1000 + sr(i * 13) * 800,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w:     7 + Math.round(sr(i * 5) * 7),
      h:     5 + Math.round(sr(i * 9) * 6),
      round: i % 4 === 0,
      rot:   Math.round(sr(i * 17) * 360),
    }))
  , []);

  const sparkles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id:    i,
      top:   6  + sr(i * 19) * 88,
      left:  4  + sr(i * 23) * 92,
      delay: sr(i * 29) * 1200,
      size:  12 + Math.round(sr(i * 31) * 10),
    }))
  , []);

  const hasImage = imageUrl && !imgError;

  const overlay = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={() => onDismissRef.current()}
    >
      {/* ── Backdrop ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(23,20,90,0.97) 0%, rgba(70,14,115,0.96) 50%, rgba(23,20,90,0.97) 100%)",
      }} />

      {/* ── Confetti ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {confetti.map(p => (
          <div key={p.id} style={{
            position: "absolute", left: `${p.left}%`, top: -16,
            width: p.w, height: p.h,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `matchConfettiFall ${p.dur}ms ${p.delay}ms ease-in both`,
          }} />
        ))}
      </div>

      {/* ── Sparkles ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {sparkles.map(s => (
          <div key={s.id} style={{
            position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
            fontSize: s.size, color: "#fde68a", lineHeight: 1,
            animation: `matchSparklePulse 1.6s ${s.delay}ms ease-in-out infinite`,
          }}>✦</div>
        ))}
      </div>

      {/* ── Ambient glow behind card ── */}
      <div style={{
        position: "absolute",
        width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* ── Card ── */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 320, margin: "0 16px",
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity:    cardIn ? 1 : 0,
          transform:  cardIn ? "scale(1) translateY(0)" : "scale(0.68) translateY(30px)",
          transition: "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: "100%", borderRadius: 24, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 16px 56px rgba(99,102,241,0.45), 0 4px 20px rgba(0,0,0,0.35)",
        }}>

          {/* ── Hero: image + "Machi Match" ── */}
          <div style={{
            position: "relative", height: 172, overflow: "hidden",
            background: hasImage
              ? "transparent"
              : "linear-gradient(135deg, #4338ca 0%, #7c3aed 55%, #5b21b6 100%)",
          }}>
            {/* Town image */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={regionName}
                onError={() => setImgError(true)}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "cover",
                }}
              />
            )}

            {/* Gradient overlay for readability */}
            <div style={{
              position: "absolute", inset: 0,
              background: hasImage
                ? "linear-gradient(to bottom, rgba(15,10,60,0.30) 0%, rgba(45,18,90,0.72) 65%, rgba(25,10,70,0.93) 100%)"
                : "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(20,10,60,0.55) 100%)",
            }} />

            {/* Decorative blur circles */}
            <div style={{
              position: "absolute", top: -24, right: -24,
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            }} />
            <div style={{
              position: "absolute", bottom: 8, left: -16,
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }} />

            {/* "Machi Match" title */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 6,
            }}>
              {/* Sparkle row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 13, color: "#fde68a",
                  animation: "matchSparklePulse 2s 0.1s ease-in-out infinite",
                }}>✦</span>
                <span style={{
                  fontSize: 13, color: "#fde68a",
                  animation: "matchSparklePulse 2s 0.4s ease-in-out infinite",
                }}>✦</span>
                <span style={{
                  fontSize: 13, color: "#fde68a",
                  animation: "matchSparklePulse 2s 0.7s ease-in-out infinite",
                }}>✦</span>
              </div>

              {/* Main brand title */}
              <div style={{
                fontSize: "clamp(2rem, 8.5vw, 2.6rem)",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
                textAlign: "center",
                textShadow: "0 0 28px rgba(196,181,253,0.75), 0 2px 14px rgba(0,0,0,0.65)",
                animation: "matchTitleGlow 2.8s ease-in-out infinite",
              }}>
                Machi Match
              </div>
            </div>
          </div>

          {/* ── Town info + score ── */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            padding: "20px 24px 22px",
            textAlign: "center",
          }}>
            {/* Prefecture */}
            {prefecture && (
              <div style={{
                color: "rgba(255,255,255,0.52)",
                fontSize: 13,
                letterSpacing: "0.04em",
                marginBottom: 3,
              }}>
                {prefecture}
              </div>
            )}

            {/* Town name */}
            <div style={{
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "clamp(1.65rem, 6.5vw, 2.1rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              marginBottom: 18,
            }}>
              {regionName}
            </div>

            {/* Score badge */}
            {matchScore != null && (
              <div style={{
                display: "flex", justifyContent: "center",
                marginBottom: 16,
                opacity:    scoreIn ? 1 : 0,
                transform:  scoreIn ? "scale(1)" : "scale(0.45)",
                transition: "opacity 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                <div style={{
                  display: "inline-flex", flexDirection: "column", alignItems: "center",
                  borderRadius: 16,
                  padding: "11px 30px",
                  background: "rgba(99,102,241,0.30)",
                  border: "1px solid rgba(139,92,246,0.52)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, lineHeight: 1 }}>
                    <span style={{ fontSize: 46, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {matchScore}
                    </span>
                    <span style={{ fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                      %
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 11, marginTop: 5 }}>
                    相性スコア
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Dismiss hint */}
        <div style={{ marginTop: 14, color: "rgba(255,255,255,0.36)", fontSize: 12 }}>
          タップして続ける
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
