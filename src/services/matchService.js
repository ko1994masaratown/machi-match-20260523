// Machi Match — 地域マッチングサービス
// 優先順: Gemini API → Groq API → ローカルフォールバック

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY   = import.meta.env.VITE_GROQ_API_KEY;
const API_TIMEOUT_MS = 7000;
const GEMINI_TIMEOUT_MS = 25000;

const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    recommendedRegion: { type: "STRING" },
    matchScore:        { type: "INTEGER" },
    reason:            { type: "STRING" },
    sosIssue:          { type: "STRING" },
    firstAction:       { type: "STRING" },
    matchType:         { type: "STRING" },
    userContribution:  { type: "STRING" },
  },
  required: ["recommendedRegion", "matchScore", "reason", "sosIssue", "firstAction", "matchType", "userContribution"],
};

const PRIORITY_CRITERIA = {
  sos: (skills) =>
    `【最優先ロジック: SOS課題解決型】
ユーザーのスキル(${skills.join(",") || "未指定"})が地域のSOS課題・参加テーマに直接一致する地域を必ず選ぶ。
スキルと課題の直接的な接続が最重要。SOS度の高さも重視。ライフスタイルは副次条件。
userContributionには「${skills.join("・")}スキルが、この地域の[具体的なSOS課題名]に直接役立つ理由」を50文字以内で書く。`,

  lifestyle: (skills, regionImage, freeText) =>
    `【最優先ロジック: ライフスタイル型】
ユーザーの自由記述「${freeText || "未記入"}」と希望地域イメージ(${regionImage.join(",") || "未指定"})への適合を最重視。
地域の雰囲気・自然環境・暮らしやすさを優先。スキル×SOS接続は副次条件。
userContributionには「この地域でのあなたらしい暮らし方・関わり方」を50文字以内で書く。`,

  work: (skills, _regionImage, _freeText, involvement) =>
    `【最優先ロジック: 副業・スキル活用型】
ユーザーのスキル(${skills.join(",") || "未指定"})を活かせるリモート可・副業案件が豊富な地域を必ず選ぶ。
実際の仕事の有無（リモート可件数・スポット件数）を最重視。関わり方の希望(${involvement || "未指定"})に合致することが必須。
userContributionには「${skills.join("・")}スキルで稼げる・活かせる具体的な仕事機会」を50文字以内で書く。`,

  volunteer: () =>
    `【最優先ロジック: ボランティア・社会貢献型】
SOS度が最も高い・緊急性の高い地域を最優先で選ぶ。短期・スポット・ボランティア案件があることを必ず確認。
社会的インパクトと関わりやすさを重視。
userContributionには「この地域のどのSOS課題にどう貢献できるか」を50文字以内で書く。`,
};

// ── タイムアウト付き fetch ──────────────────────────────────
async function fetchWithTimeout(url, options, timeout = API_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ── AI へのプロンプト生成 ────────────────────────────────────
function buildPrompt(userInput, regions) {
  const { themes, involvement, skills, regionImage, freeText, matchPriority } = userInput;

  const regionSummaries = regions.map(r => {
    const remoteCount = r.jobs?.filter(j => j.remote).length ?? 0;
    const spotCount   = r.jobs?.filter(j => j.period === "spot").length ?? 0;
    const hasLong     = r.jobs?.some(j => j.period === "long");
    return `・${r.prefecture}${r.name}
  SOS度=${r.sos_score} 高齢化率=${r.aging_rate}% 人口=${r.population?.toLocaleString()}人
  課題=[${r.issues?.join(",") ?? ""}]
  強み=[${r.strengths?.slice(0, 3).join(",") ?? ""}]
  産業=[${r.industries?.map(i => i.name).join(",") ?? ""}]
  参加テーマ=[${r.participationThemes?.join(",") ?? ""}]
  仕事: スポット${spotCount}件 リモート可${remoteCount}件 長期定住=${hasLong ? "あり" : "なし"}
  移住支援=[${r.support?.slice(0, 2).join(",") ?? ""}]
  外国人材受入=${r.foreigners_ok ? "可" : "準備中"} 家賃目安=¥${r.rent?.toLocaleString()}/月`;
  }).join("\n");

  const freeSection = freeText?.trim()
    ? `\n- 本人の言葉・思い: 「${freeText.trim()}」`
    : "";

  const prioritySection = PRIORITY_CRITERIA[matchPriority]
    ? `\n${PRIORITY_CRITERIA[matchPriority](skills, regionImage, freeText, involvement ?? "")}`
    : `\n【マッチング優先基準】
1. 本人の言葉がある場合、その価値観・感情を重視する
2. スキルが地域の課題に直接役立つかを判定する
3. 希望する関わり方に対応した仕事があるかを確認する
4. SOS度が高い地域を優先しつつ、ミスマッチは避ける`;

  return `あなたは地域マッチングの専門AIです。ユーザーの価値観・スキルと各地域の課題・特性を照合し、最もマッチする地域を1つ選んでください。
${prioritySection}

【ユーザー情報】
- 興味テーマ: ${themes.join(", ") || "未指定"}
- 希望する関わり方: ${involvement || "未指定"}
- スキル・経験: ${skills.join(", ") || "未指定"}
- 希望地域イメージ: ${regionImage.join(", ") || "未指定"}${freeSection}

【候補地域データ】
${regionSummaries}`;
}

// ── JSON 解析 ──────────────────────────────────────────────
function parseAIResponse(text, source) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON found in ${source} response (text: ${text.slice(0, 100)})`);
  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch (e) {
    throw new Error(`JSON parse error in ${source}: ${e.message} (text: ${text.slice(0, 100)})`);
  }
  if (parsed.recommendedRegion == null || parsed.recommendedRegion === "") {
    throw new Error(`Missing recommendedRegion in ${source} (keys: ${Object.keys(parsed).join(",")})`);
  }
  return { ...parsed, source };
}

// ── Gemini API Free Tier ───────────────────────────────────
export async function matchRegionsByGemini(userInput, regions) {
  if (!GEMINI_API_KEY) throw new Error("VITE_GEMINI_API_KEY not set");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: buildPrompt(userInput, regions) }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, GEMINI_TIMEOUT_MS);
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const finishReason = data.candidates?.[0]?.finishReason;
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.find(p => !p.thought)?.text ?? parts[parts.length - 1]?.text ?? "";
  if (!text) throw new Error(`Gemini empty response (finishReason=${finishReason})`);
  return parseAIResponse(text, "Gemini");
}

// ── Groq API Free Tier ────────────────────────────────────
export async function matchRegionsByGroq(userInput, regions) {
  if (!GROQ_API_KEY) throw new Error("VITE_GROQ_API_KEY not set");
  const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: buildPrompt(userInput, regions) }],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Groq HTTP ${res.status}: ${err.slice(0, 100)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseAIResponse(text, "Groq");
}

// ── スコアリング（フォールバック用・priority重み付き） ──────────
export function calculateMatchScore(userInput, region) {
  const { themes, skills, involvement, regionImage, matchPriority } = userInput;

  // priority別の重み係数
  const W = {
    sos:       { theme: 0.5, skill: 3.0, inv: 1.0, img: 0.3, sos: 2.5 },
    lifestyle: { theme: 1.0, skill: 0.5, inv: 1.0, img: 3.0, sos: 0.5 },
    work:      { theme: 0.8, skill: 2.0, inv: 3.0, img: 0.5, sos: 0.5 },
    volunteer: { theme: 0.5, skill: 0.5, inv: 1.0, img: 0.5, sos: 4.0 },
  }[matchPriority] ?? { theme: 1, skill: 1, inv: 1, img: 1, sos: 1 };

  let score = 0;

  // 興味テーマ一致 (最大20点)
  const themeHits = themes.filter(t =>
    region.strengths?.some(s => s.includes(t)) ||
    region.industries?.some(i => i.name.includes(t) || i.detail.includes(t)) ||
    region.participationThemes?.some(p => p.includes(t))
  );
  score += Math.min(themeHits.length * 7 * W.theme, 20);

  // スキル × 地域ニーズ一致 (最大25点)
  const skillHits = skills.filter(s =>
    region.issues?.some(i => i.includes(s)) ||
    region.participationThemes?.some(p => p.includes(s)) ||
    region.industry_partners?.some(p => p.tech?.some(t => t.includes(s)))
  );
  score += Math.min(skillHits.length * 9 * W.skill, 25);

  // 関わり方一致 (最大25点)
  const invMap = {
    "移住したい":          ["long"],
    "副業で関わりたい":     ["mid", "remote"],
    "ボランティアしたい":   ["short"],
    "旅行から始めたい":     ["spot"],
    "企業として支援したい": ["mid", "long"],
  };
  const invKeys = invMap[involvement] ?? [];
  const invHit = region.jobs?.some(j =>
    invKeys.includes(j.period) || (j.remote && invKeys.includes("remote"))
  );
  score += (invHit ? 25 : 10) * W.inv;

  // 地域イメージ一致 (最大20点)
  const imgHits = regionImage.filter(img =>
    region.strengths?.some(s => s.includes(img)) ||
    region.catchCopy?.includes(img) ||
    region.sosSummary?.includes(img)
  );
  score += Math.min(imgHits.length * 7 * W.img, 20);

  // SOS緊急度ボーナス (最大10点)
  const sosBase = region.sos_score >= 90 ? 10 : region.sos_score >= 80 ? 6 : 3;
  score += sosBase * W.sos;

  return Math.min(Math.round(score), 97);
}

// ── フォールバック推薦文生成 ────────────────────────────────
export function generateFallbackRecommendation(userInput, region) {
  const { themes, skills, involvement, regionImage } = userInput;
  const score = calculateMatchScore(userInput, region);
  const skillText  = skills.length  > 0 ? skills.slice(0, 3).join("・") : "あなたのスキル";
  const themeText  = themes.length  > 0 ? themes.slice(0, 2).join("・") : "地域課題";
  const imageText  = regionImage.length > 0 ? regionImage[0] : "";

  const invLabelMap = {
    "移住したい": "移住",
    "副業で関わりたい": "副業",
    "ボランティアしたい": "ボランティア",
    "旅行から始めたい": "旅行・体験参加",
    "企業として支援したい": "企業連携",
  };
  const invLabel = invLabelMap[involvement] ?? "副業";

  const spotJob = region.jobs?.find(j => j.period === "spot");
  const firstAction = spotJob
    ? `まずは「${spotJob.title}」（${typeof spotJob.pay === "number" ? `日給¥${spotJob.pay.toLocaleString()}` : spotJob.pay ?? "要相談"}）から始めてみましょう。`
    : `まずは${region.name}の${region.issues?.[0] ?? "地域課題"}解決に向けた${invLabel}からスタートしましょう。`;

  const reason = `${skillText}スキルと「${themeText}」への関心は、${region.issues?.[0] ?? "担い手不足"}に取り組む${region.name}と相性が良いです。${imageText ? `${imageText}の地域イメージにも合っています。` : ""}${invLabel}として関わる機会があります。`;

  return {
    recommendedRegion: `${region.prefecture} ${region.name}`,
    matchScore: score,
    reason,
    sosIssue: region.issues?.slice(0, 2).join("・") ?? "人材不足",
    firstAction,
    matchType: invLabel,
    source: "ローカル",
  };
}

// ── フォールバック全体推薦 ───────────────────────────────────
export function matchRegionsByFallback(userInput, regions) {
  const scored = regions
    .map(r => ({ region: r, score: calculateMatchScore(userInput, r) }))
    .sort((a, b) => b.score - a.score);
  return generateFallbackRecommendation(userInput, scored[0].region);
}

// ── メイン関数（Gemini→Groq→フォールバック） ─────────────────
export async function matchRegions(userInput, regions) {
  let geminiError = null;
  if (GEMINI_API_KEY) {
    try {
      const result = await matchRegionsByGemini(userInput, regions);
      console.info("[Machi Match] Gemini AI 推薦成功");
      return result;
    } catch (err) {
      geminiError = err.message;
      console.warn("[Machi Match] Gemini 失敗 →", err.message);
    }
  }

  if (GROQ_API_KEY) {
    try {
      const result = await matchRegionsByGroq(userInput, regions);
      console.info("[Machi Match] Groq AI 推薦成功");
      return result;
    } catch (err) {
      console.warn("[Machi Match] Groq 失敗 →", err.message);
    }
  }

  console.info("[Machi Match] ローカルフォールバック推薦を使用");
  const fallback = matchRegionsByFallback(userInput, regions);
  return { ...fallback, debugError: geminiError };
}
