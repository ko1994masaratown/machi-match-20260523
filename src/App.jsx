import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { matchRegions } from "./services/matchService";
import RoleSwitcher, { getRoleInfo } from "./components/RoleSwitcher";
import MunicipalityDashboard from "./components/MunicipalityDashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DartsModal from "./components/DartsModal";
import MatchCelebration from "./components/MatchCelebration";

// ============================================================
// MOCK DATA
// ============================================================
const TOWNS = [
  {
    id: "akita-001", prefecture: "秋田県", name: "仙北市", lat: 39.7183, lng: 140.1023,
    sos_score: 94, aging_rate: 51, population: 26000, rent: 32000, commute_min: 0,
    issues: ["介護人材不足", "農業後継者不足", "地域交通"],
    strengths: ["日本一の米産地（あきたこまち）", "角館武家屋敷・観光資源", "田沢湖の絶景"],
    industries: [{ name: "農業", detail: "米・野菜・果物" }, { name: "観光", detail: "インバウンド増加中" }],
    support: ["移住支援金最大100万円", "空き家バンクあり", "子育て支援充実", "外国人相談窓口"],
    foreigners_ok: true,
    imageUrl: "https://picsum.photos/seed/senboku-akita/800/420",
    catchCopy: "武家屋敷と田沢湖の里。あきたこまちを守る農業・観光の担い手を。",
    issueTags: ["農業後継者不足", "介護人材不足", "観光DX"],
    participationThemes: ["農業体験", "観光支援", "介護", "副業リモート"],
    sosSummary: "高齢化率51%。農業・介護・観光3分野で人材を急募中。あなたのスキルがこの町の未来を変えます。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "田植えアルバイト", date: "6/14〜15", pay: 8500, transport: true, gift_id: "g1" },
      { id: "j2", period: "spot", type: "単発アルバイト", title: "稲刈りスタッフ", date: "9/20〜21", pay: 9000, transport: true, gift_id: "g1" },
      { id: "j3", period: "short", type: "ボランティア", title: "観光案内ボランティア", date: "7月〜8月", pay: null, transport: false, gift_id: "g2" },
      { id: "j4", period: "mid", type: "副業", title: "SNS・広報支援", date: "3ヶ月〜", pay: "要相談", transport: false, gift_id: "g2", remote: true },
      { id: "j5", period: "long", type: "移住して働く", title: "介護スタッフ（正社員）", date: "通年", pay: 200000, transport: false, gift_id: null },
    ],
    gifts: [
      { id: "g1", name: "あきたこまち 5kg", type: "product", emoji: "🌾" },
      { id: "g2", name: "角館・田沢湖 宿泊体験", type: "experience", emoji: "🏯" },
    ],
    voices: [
      { type: "resident", name: "田中 正義さん（68歳・農家）", comment: "若い人が来てくれるだけで、集落全体が明るくなります。田んぼの作業を一緒にやってほしい。", rating: 5 },
      { type: "migrant", name: "佐藤 花さん（32歳・東京から移住）", comment: "最初は不安でしたが、地域の方がすごく温かくて。家賃も安くて、食べ物がおいしくて最高です！", rating: 5 },
      { type: "visitor", name: "山田 剛さん（田植え参加）", comment: "初めての農作業でしたが楽しかった。お米ももらえてうれしかったです。また来ます！", rating: 4 },
    ],
    events: [
      { id: "e1", title: "大曲の花火（全国花火競技大会）", category: "fireworks", date: "2026-08-23", time: "17:30〜21:00", location: "大曲河川敷", has_staff_job: true, job_title: "会場誘導スタッフ", job_pay: 7500, free: false, expected_visitors: 750000 },
      { id: "e2", title: "角館の火振りかまくら", category: "festival", date: "2026-02-13", time: "19:00〜20:00", location: "角館市街地", has_staff_job: false, free: true, expected_visitors: 8000 },
      { id: "e3", title: "仙北市農業大学 収穫祭", category: "culture", date: "2026-10-19", time: "10:00〜15:00", location: "農業大学構内", has_staff_job: true, job_title: "出店・運営スタッフ", job_pay: 6000, free: true, expected_visitors: 3000 },
      { id: "e4", title: "田沢湖マラソン", category: "sport", date: "2026-09-14", time: "9:00〜12:00", location: "田沢湖畔", has_staff_job: true, job_title: "給水・誘導ボランティア", job_pay: null, free: false, expected_visitors: 5000 },
      { id: "e5", title: "移住・定住相談会 in 仙北", category: "other", date: "2026-07-12", time: "13:00〜17:00", location: "仙北市役所", has_staff_job: false, free: true, expected_visitors: 200 },
    ],
    characters: [
      { type: "mascot", name: "かくのだてくん", emoji: "🏯", message: "角館の武士の心意気で、みなさんをお迎えします！一緒に仙北を盛り上げませんか？", use_ai: false },
      { type: "celebrity", name: "吉永小百合さん（田沢湖ゆかりの女優）", emoji: "🎬", message: "田沢湖の美しさは日本一。この町の人たちの温かさも日本一です。ぜひ一度来てみてください。", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "あきた穂波農業法人", category: "農業", emoji: "🌾", tagline: "70年続く米づくりを未来へつなぎたい", story: "あきたこまちの産地で3代続く農業法人。高齢化が進み、一緒に農業を担う仲間と、EC販路を広げるDX人材を求めています。", tech: ["水稲栽培（あきたこまち）", "有機農法", "農業機械操作", "直売所運営"], employee_size: "5〜10名", challenges: ["後継者不足", "農業機械の老朽化", "EC販路未整備", "デジタル対応遅れ"], collab_types: ["副業農業体験", "ECサイト構築支援", "農業担い手", "就農支援"], succession: true, dx_need: true, founded: "1955年創業" },
      { id: "ip2", name: "角館観光旅館「武家の宿」", category: "観光・宿泊", emoji: "🏯", tagline: "武家屋敷の文化を守り続ける旅館", story: "角館の歴史的街並みに佇む旅館。インバウンド急増で多言語対応が急務となり、次の時代を担う後継者も探しています。", tech: ["旅館運営・接客", "茶道・着物体験", "日本庭園維持"], employee_size: "10〜20名", challenges: ["後継者不足", "多言語対応", "予約システム老朽化", "SNS発信不足"], collab_types: ["SNS・動画制作支援", "外国語対応サポート", "事業承継相談", "DX導入支援"], succession: true, dx_need: true, founded: "1962年創業" },
    ],
  },
  {
    id: "shimane-001", prefecture: "島根県", name: "津和野町", lat: 34.4667, lng: 131.7667,
    sos_score: 91, aging_rate: 49, population: 7800, rent: 28000, commute_min: 0,
    issues: ["農業後継者不足", "空き家増加", "高齢者交通"],
    strengths: ["山陰の小京都・景観資源", "鮎・石州和紙の伝統産業", "移住者支援が充実"],
    industries: [{ name: "伝統工芸", detail: "石州和紙・陶芸" }, { name: "農業", detail: "鮎・有機野菜" }],
    support: ["空き家バンク活用補助", "子育て世帯家賃補助", "移住コーディネーターあり"],
    foreigners_ok: false,
    imageUrl: "https://picsum.photos/seed/tsuwano-shimane/800/420",
    catchCopy: "山陰の小京都、石州和紙の技を次の世代へ。伝統と自然に関わる人を求む。",
    issueTags: ["農業後継者不足", "空き家増加", "伝統工芸存続"],
    participationThemes: ["伝統工芸体験", "農業支援", "空き家活用", "移住定住"],
    sosSummary: "人口7,800人。石州和紙職人の技術継承者が不在。空き家活用で新しい暮らしを始めませんか。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "鷺舞祭り設営スタッフ", date: "7/20〜21", pay: 7000, transport: true, gift_id: "g1" },
      { id: "j2", period: "mid", type: "副業", title: "和紙工房のECサイト構築", date: "2ヶ月", pay: "要相談", remote: true, gift_id: "g2" },
      { id: "j3", period: "long", type: "移住して働く", title: "農業担い手（就農支援あり）", date: "通年", pay: 180000, gift_id: null },
    ],
    gifts: [
      { id: "g1", name: "石州和紙 作品セット", type: "product", emoji: "📜" },
      { id: "g2", name: "津和野 鮎料理体験", type: "experience", emoji: "🐟" },
    ],
    voices: [
      { type: "resident", name: "中村 義雄さん（71歳・和紙職人）", comment: "私の技術を次の世代に伝えたい。和紙づくりに興味のある方、ぜひ来てください。", rating: 5 },
      { type: "migrant", name: "木村 誠さん（29歳・大阪から移住）", comment: "町全体が歴史的な街並みで、毎日が映画の中にいるみたい。空き家を改装して快適に暮らしています。", rating: 5 },
    ],
    events: [
      { id: "e1", title: "鷺舞祭り（国指定重要無形民俗文化財）", category: "festival", date: "2026-07-20", time: "14:00〜16:00", location: "津和野町市街地", has_staff_job: true, job_title: "設営・案内スタッフ", job_pay: 7000, free: true, expected_visitors: 20000 },
      { id: "e2", title: "津和野夏の花火大会", category: "fireworks", date: "2026-08-16", time: "20:00〜21:00", location: "津和野川河川敷", has_staff_job: false, free: true, expected_visitors: 5000 },
    ],
    characters: [
      { type: "mascot", name: "つわぶきちゃん", emoji: "🌸", message: "山陰の小京都・津和野へようこそ！伝統と自然があなたを待っています。", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "石州和紙工房「和の心」", category: "伝統工芸", emoji: "📜", tagline: "1300年続く石州和紙の技術を次代へ", story: "ユネスコ無形文化遺産に登録された石州和紙の工房。職人技術を継承しながら、ECや海外販路を開きたいと考えています。", tech: ["手漉き和紙製造", "楮（こうぞ）栽培", "染紙・加工技術"], employee_size: "3〜5名", challenges: ["後継者不足", "ECサイト未整備", "海外販路なし", "若手職人育成"], collab_types: ["弟子入り・職人修行", "ECサイト構築", "海外向けブランディング", "副業クリエイター支援"], succession: true, dx_need: true, founded: "1940年代創業" },
      { id: "ip2", name: "津和野有機農場", category: "農業", emoji: "🐟", tagline: "四季の恵みと鮎が育つ清流農場", story: "津和野川の清流沿いで鮎漁と有機野菜を手がける農場。採用が難しく、農業体験で地域を知ってもらうことから始めたいです。", tech: ["有機野菜栽培", "鮎の養殖・漁業", "農家民泊運営"], employee_size: "3〜8名", challenges: ["採用難", "販路拡大", "設備更新"], collab_types: ["農業体験インターン", "販路開拓支援", "SNS広報", "就農支援"], succession: false, dx_need: true, founded: "1978年創業" },
    ],
  },
  {
    id: "nagano-001", prefecture: "長野県", name: "小海町", lat: 36.0667, lng: 138.5833,
    sos_score: 87, aging_rate: 44, population: 4500, rent: 35000, commute_min: 0,
    issues: ["IT人材不足", "観光業の担い手不足", "子育て環境整備"],
    strengths: ["標高1000mの高原リゾート", "八ヶ岳・清里の絶景", "移住者コミュニティが活発"],
    industries: [{ name: "観光", detail: "ペンション・スキー場" }, { name: "農業", detail: "高原野菜・レタス" }],
    support: ["UIターン奨励金あり", "テレワーク移住補助", "保育所完備"],
    foreigners_ok: true,
    imageUrl: "https://picsum.photos/seed/koumi-nagano/800/420",
    catchCopy: "八ヶ岳麓、標高1000mの高原リゾート。ITと観光で地域に新しい風を。",
    issueTags: ["IT人材不足", "観光DX", "子育て環境整備"],
    participationThemes: ["IT・DX支援", "観光ガイド", "リモートワーク移住", "英語対応"],
    sosSummary: "IT人材・観光担い手が絶対的に不足。テレワーク移住補助あり。高原の自然の中で新しい働き方を。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "八ヶ岳マラソン運営スタッフ", date: "5/25", pay: 8000, transport: true, gift_id: "g1" },
      { id: "j2", period: "mid", type: "リモート支援", title: "観光サイトのDX改善", date: "3ヶ月", pay: "要相談", remote: true, gift_id: "g2" },
      { id: "j3", period: "mid", type: "副業", title: "外国人観光客向け英語ガイド", date: "7〜9月", pay: 15000, transport: false, gift_id: "g1" },
      { id: "j4", period: "long", type: "移住して働く", title: "観光施設スタッフ（テレワーク兼務可）", date: "通年", pay: 220000, gift_id: null },
    ],
    gifts: [
      { id: "g1", name: "八ヶ岳高原 レタス・野菜セット", type: "product", emoji: "🥬" },
      { id: "g2", name: "高原ペンション 1泊体験", type: "experience", emoji: "🏔️" },
    ],
    voices: [
      { type: "migrant", name: "高橋 明さん（35歳・IT企業からUターン）", comment: "東京でリモートワークしながら長野で暮らしています。空気が違う、食が違う、人が違う。最高の選択でした。", rating: 5 },
    ],
    events: [
      { id: "e1", title: "小海リエックス 夏まつり花火", category: "fireworks", date: "2026-08-02", time: "20:00〜20:30", location: "小海リエックス", has_staff_job: false, free: false, expected_visitors: 8000 },
      { id: "e2", title: "八ヶ岳高原音楽祭", category: "other", date: "2026-08-09", time: "15:00〜21:00", location: "清里高原", has_staff_job: true, job_title: "運営・設営スタッフ", job_pay: 8000, free: false, expected_visitors: 15000 },
    ],
    characters: [
      { type: "ai", name: "こうみちゃん（AI）", emoji: "⛰️", message: "八ヶ岳の麓、標高1000mの町からこんにちは！ITスキルを持つあなた、ここで新しい働き方を見つけませんか？", use_ai: true },
    ],
    industry_partners: [
      { id: "ip1", name: "八ヶ岳高原ペンション組合", category: "観光・宿泊", emoji: "🏔️", tagline: "高原の宿を未来につなぐプロジェクト", story: "標高1000mの高原に点在するペンションが連携して存続を模索中。インバウンド対応とオンライン集客のDXが急務です。", tech: ["ペンション・宿泊運営", "自然体験ガイド", "アウトドア施設管理"], employee_size: "各宿2〜5名（組合全体20名超）", challenges: ["後継者不足", "インバウンド対応", "オンライン予約DX", "英語コンテンツ不足"], collab_types: ["英語コンテンツ制作", "予約DX支援", "SNS・動画制作", "外国語ガイド育成"], succession: true, dx_need: true, founded: "1980年代〜各宿創業" },
      { id: "ip2", name: "高原レタス農業法人 小海ファーム", category: "農業", emoji: "🥬", tagline: "日本一の高原野菜を次の世代へ", story: "八ヶ岳の冷涼な気候を活かしたレタス・高原野菜の農業法人。機械化と担い手育成を進めながら、EC販路も広げたいです。", tech: ["高原野菜（レタス・白菜）栽培", "農業機械操作", "低温冷蔵管理"], employee_size: "8〜15名", challenges: ["後継者不足", "農業機械の更新", "EC・直販強化"], collab_types: ["農業体験・就農研修", "EC販路構築", "副業農業サポート"], succession: false, dx_need: true, founded: "1990年創業" },
    ],
  },
  {
    id: "hokkaido-001", prefecture: "北海道", name: "東川町", lat: 43.7, lng: 142.5,
    sos_score: 82, aging_rate: 38, population: 8500, rent: 45000, commute_min: 0,
    issues: ["観光人材不足", "英語対応人材不足", "宿泊業担い手不足"],
    strengths: ["旭岳・大雪山国立公園", "写真文化発信の町", "外国人観光客急増中"],
    industries: [{ name: "観光", detail: "インバウンド・登山" }, { name: "農業", detail: "米・野菜・チーズ" }],
    support: ["移住体験住宅あり", "家具付き短期滞在可", "英語話者歓迎"],
    foreigners_ok: true,
    imageUrl: "https://picsum.photos/seed/higashikawa-hkd/800/420",
    catchCopy: "旭岳と写真の町。急増するインバウンドを迎える多言語人材を求む。",
    issueTags: ["英語対応不足", "観光人材不足", "多言語化"],
    participationThemes: ["英語ガイド", "インバウンド対応", "コンテンツ制作", "多言語サポート"],
    sosSummary: "外国人観光客急増中。英語・多言語対応できる人材が緊急課題。写真文化と大自然の町で活躍を。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "雪まつり設営スタッフ", date: "2/8〜9", pay: 10000, transport: false, gift_id: "g1" },
      { id: "j2", period: "short", type: "短期滞在", title: "英語ガイド（夏季）", date: "7〜8月", pay: 20000, transport: false, gift_id: "g2" },
      { id: "j3", period: "mid", type: "リモート支援", title: "多言語観光コンテンツ制作", date: "継続", pay: "要相談", remote: true, gift_id: "g1" },
    ],
    gifts: [
      { id: "g1", name: "東川米 ゆめぴりか 5kg", type: "product", emoji: "🌾" },
      { id: "g2", name: "旭岳ロープウェイ 往復乗車券", type: "experience", emoji: "🚡" },
    ],
    voices: [
      { type: "visitor", name: "Ahmed さん（外国人材・インドから来日）", comment: "Higashikawa is wonderful! People are kind and nature is amazing. I want to work here forever.", rating: 5 },
    ],
    events: [
      { id: "e1", title: "旭川冬まつり（氷彫刻世界大会）", category: "festival", date: "2026-02-07", time: "日中〜夜", location: "旭川市常盤公園", has_staff_job: true, job_title: "会場案内・多言語対応スタッフ", job_pay: 9000, free: true, expected_visitors: 200000 },
      { id: "e2", title: "東川町写真フェスタ", category: "other", date: "2026-08-03", time: "10:00〜18:00", location: "東川町文化ギャラリー", has_staff_job: false, free: true, expected_visitors: 3000 },
    ],
    characters: [
      { type: "mascot", name: "ひがしかわくん", emoji: "📸", message: "写真文化と大自然の町・東川へ！英語が得意なあなた、外国人観光客を一緒にもてなしましょう！", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "大雪山麓チーズ工房", category: "食品加工", emoji: "🧀", tagline: "北海道の大地から生まれる本格チーズ", story: "大雪山の伏流水と牧草で育てた牛の生乳を使うチーズ工房。EC強化と海外展開の人材が不足しており、副業でも歓迎します。", tech: ["チーズ製造・熟成管理", "乳牛飼育", "食品衛生管理"], employee_size: "5〜10名", challenges: ["EC販路未整備", "海外展開不足", "SNS・ブランディング弱"], collab_types: ["ECサイト構築", "SNS・動画制作", "海外向け広報", "副業マーケター"], succession: false, dx_need: true, founded: "2003年創業" },
      { id: "ip2", name: "東川インバウンド観光協同組合", category: "観光", emoji: "🌿", tagline: "外国人観光客と大雪山の出会いをつくる", story: "旭岳登山・写真観光・農村体験を組み合わせたインバウンドツアーを展開。多言語コンテンツと現地ガイドの確保が課題です。", tech: ["ツアー企画・運営", "自然ガイド", "山岳観光"], employee_size: "10〜25名（組合員含む）", challenges: ["多言語対応不足", "ガイド人材不足", "SNS発信力の弱さ", "予約DX"], collab_types: ["多言語コンテンツ制作", "英語・多言語ガイド", "SNS動画発信支援", "DX導入"], succession: false, dx_need: true, founded: "2015年設立" },
    ],
  },
  {
    id: "kochi-001", prefecture: "高知県", name: "四万十町", lat: 33.1833, lng: 133.1167,
    sos_score: 89, aging_rate: 46, population: 16000, rent: 30000, commute_min: 0,
    issues: ["介護・医療人材不足", "農林業後継者不足", "若者流出"],
    strengths: ["四万十川（日本最後の清流）", "カツオのたたき・海の幸", "自然体験ツーリズム"],
    industries: [{ name: "漁業", detail: "カツオ・うなぎ" }, { name: "農林業", detail: "しょうが・ゆず" }],
    support: ["空き家改修補助", "就農支援金あり", "お試し移住制度"],
    foreigners_ok: false,
    imageUrl: "https://picsum.photos/seed/shimanto-kochi/800/420",
    catchCopy: "日本最後の清流と生きる。自然と地域の恵みを守る仲間を。",
    issueTags: ["医療人材不足", "農林業後継者", "若者流出"],
    participationThemes: ["農林業体験", "地域おこし協力隊", "医療・介護支援", "観光ガイド"],
    sosSummary: "若者流出が深刻。四万十川を守る農業・林業の担い手が急募。清流と食の豊かさと共に生きませんか。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "四万十川いかだ下りスタッフ", date: "7〜8月週末", pay: 8000, transport: false, gift_id: "g1" },
      { id: "j2", period: "short", type: "ボランティア", title: "カツオ祭り手伝い", date: "10/11〜12", pay: null, transport: false, gift_id: "g1" },
      { id: "j3", period: "long", type: "移住して働く", title: "地域おこし協力隊（農業）", date: "通年", pay: 166000, gift_id: null },
    ],
    gifts: [
      { id: "g1", name: "四万十産 カツオのたたきセット", type: "product", emoji: "🐟" },
      { id: "g2", name: "四万十川 川漁体験", type: "experience", emoji: "🎣" },
    ],
    voices: [
      { type: "resident", name: "岡本 幸子さん（58歳・旅館経営）", comment: "四万十川の清流を守りながら、観光で地域を元気にしたい。若い力が必要です！", rating: 5 },
    ],
    events: [
      { id: "e1", title: "四万十川 夏祭り花火大会", category: "fireworks", date: "2026-08-14", time: "20:00〜21:00", location: "四万十川河川敷", has_staff_job: false, free: true, expected_visitors: 12000 },
      { id: "e2", title: "四万十カツオ祭り", category: "festival", date: "2026-10-11", time: "10:00〜16:00", location: "四万十町商店街", has_staff_job: true, job_title: "出店・調理補助スタッフ", job_pay: 7000, free: true, expected_visitors: 8000 },
    ],
    characters: [
      { type: "mascot", name: "しまんとくん", emoji: "🌊", message: "日本最後の清流・四万十川があなたを待っています！自然と食の豊かさ、ぜひ体験してみて。", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "四万十川漁業組合", category: "漁業", emoji: "🐟", tagline: "日本最後の清流で生きる漁師の技を守りたい", story: "カツオの一本釣り・川漁・うなぎ漁など、四万十の伝統漁業を守る組合。後継者不足と販路の課題を抱えています。", tech: ["カツオ一本釣り", "川漁（うなぎ・川エビ）", "漁獲物加工・直販"], employee_size: "15〜30名（組合員含む）", challenges: ["後継者・漁師不足", "EC販路未整備", "広報・PR力の弱さ", "若者への技術継承"], collab_types: ["漁業体験・研修", "ECサイト構築支援", "食品ブランディング", "副業広報"], succession: true, dx_need: true, founded: "1953年設立" },
      { id: "ip2", name: "高知林業株式会社", category: "林業", emoji: "🌲", tagline: "四万十の森を次の世代へつなぐ", story: "四万十源流域の林業・製材を担う地域企業。木材加工から家具製作まで手がけるが、採用難と設備更新に悩んでいます。", tech: ["木材伐採・搬出", "製材・木工加工", "家具・建材製造"], employee_size: "20〜35名", challenges: ["採用難", "設備老朽化", "販路拡大", "DX対応遅れ"], collab_types: ["林業担い手支援", "木材ECサイト構築", "企業連携・BtoBパートナー", "DX導入支援"], succession: false, dx_need: true, founded: "1971年創業" },
    ],
  },
  {
    id: "fukushima-001", prefecture: "福島県", name: "只見町", lat: 37.35, lng: 139.1833,
    sos_score: 96, aging_rate: 54, population: 4000, rent: 22000, commute_min: 0,
    issues: ["全産業での人材不足", "高齢化・医療アクセス", "冬季の孤立リスク"],
    strengths: ["只見線（奇跡の鉄道）絶景スポット", "豊富な積雪・スノーアクティビティ", "ブナ原生林・自然遺産"],
    industries: [{ name: "観光", detail: "只見線ファン・撮り鉄" }, { name: "林業", detail: "ブナ材・木工" }],
    support: ["移住支援金（最大200万円）", "空き家無償提供制度", "医療費補助"],
    foreigners_ok: true,
    imageUrl: "https://picsum.photos/seed/tadami-fukushima/800/420",
    catchCopy: "奇跡の鉄道・只見線の里。全産業でSOSを発信中。移住支援金最大200万円。",
    issueTags: ["全産業人材不足", "高齢化・孤立", "冬季交通リスク"],
    participationThemes: ["雪かき支援", "鉄道観光", "移住定住", "地域おこし協力隊"],
    sosSummary: "SOSスコア全国トップ。冬の孤立・医療アクセス・全産業で人材を緊急募集。移住支援金最大200万円。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "雪かきボランティア（有償）", date: "12〜3月 随時", pay: 6000, transport: true, gift_id: "g1" },
      { id: "j2", period: "spot", type: "単発アルバイト", title: "只見線撮影ガイド", date: "紅葉シーズン 10〜11月", pay: 7500, transport: false, gift_id: "g2" },
      { id: "j3", period: "long", type: "移住して働く", title: "地域おこし協力隊（全職種）", date: "通年", pay: 166000, gift_id: null },
    ],
    gifts: [
      { id: "g1", name: "只見町産 地酒 720ml", type: "product", emoji: "🍶" },
      { id: "g2", name: "只見線 絶景ツアー招待", type: "experience", emoji: "🚂" },
    ],
    voices: [
      { type: "resident", name: "渡辺 清さん（75歳・農家）", comment: "冬は雪が多くて大変ですが、春になるとこんなきれいな景色はどこにもない。ここは宝物の町です。", rating: 5 },
      { type: "migrant", name: "三浦 健さん（41歳・東京IT企業からリモート移住）", comment: "SOS最高スコアの町に来てみたら、人の温かさも最高でした。雪かきは大変だけど楽しいです。", rating: 4 },
    ],
    events: [
      { id: "e1", title: "只見雪まつり", category: "festival", date: "2026-02-08", time: "10:00〜21:00", location: "只見町中心部", has_staff_job: true, job_title: "会場設営・雪像制作補助", job_pay: 6500, free: true, expected_visitors: 5000 },
    ],
    characters: [
      { type: "mascot", name: "ただみん", emoji: "🌨️", message: "SOS日本一の只見町です！だからこそ、来てくれる方への感謝も日本一。移住支援金も最高額でお待ちしています！", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "只見ブナ木工工房", category: "伝統工芸", emoji: "🪵", tagline: "ブナ原生林の恵みを活かした木工の技術を守る", story: "只見のブナ材を使った手作り木工品の工房。職人技を継ぐ後継者を探しながら、EC販路拡大にも取り組もうとしています。", tech: ["ブナ材加工・木工", "漆塗り・伝統仕上げ", "家具・生活用品製造"], employee_size: "3〜6名", challenges: ["後継者不足", "ECサイト未整備", "SNS発信力の弱さ", "販路が地域内のみ"], collab_types: ["職人弟子入り", "ECサイト構築", "SNS・クリエイター支援", "副業デザイナー"], succession: true, dx_need: true, founded: "1967年創業" },
      { id: "ip2", name: "只見線観光推進プロジェクト", category: "観光", emoji: "🚂", tagline: "奇跡の鉄道が紡ぐ観光の可能性を拡げたい", story: "復活した只見線を活かした観光ガイド・撮影スポット案内を行う地域団体。コンテンツ発信人材とガイドの担い手が不足しています。", tech: ["観光ガイド・案内", "撮影スポット管理", "体験ツアー企画"], employee_size: "ボランティア含む10名程度", challenges: ["ガイド人材不足", "SNS発信力の弱さ", "インバウンド対応", "運営資金"], collab_types: ["SNS・動画発信支援", "多言語ガイド育成", "観光コンテンツ制作", "副業ライター"], succession: false, dx_need: true, founded: "2022年設立" },
    ],
  },
  {
    id: "oita-001", prefecture: "大分県", name: "九重町", lat: 33.2167, lng: 131.1667,
    sos_score: 85, aging_rate: 43, population: 9000, rent: 33000, commute_min: 0,
    issues: ["温泉旅館の担い手不足", "農業後継者不足", "IT人材皆無"],
    strengths: ["日本一の温泉地（湧出量）", "九重連山・くじゅう花公園", "ジビエ・有機農業"],
    industries: [{ name: "観光・温泉", detail: "旅館・ペンション" }, { name: "農業", detail: "有機野菜・ジビエ" }],
    support: ["温泉入り放題（移住者特典）", "農業研修制度", "移住者向け交流会"],
    foreigners_ok: true,
    imageUrl: "https://picsum.photos/seed/kokonoe-oita/800/420",
    catchCopy: "日本一の温泉湧出量の町で働く。温泉旅館と農業の担い手に入湯特典あり。",
    issueTags: ["旅館担い手不足", "農業後継者不足", "IT人材皆無"],
    participationThemes: ["温泉旅館スタッフ", "農業体験", "SNS・DX支援", "移住定住"],
    sosSummary: "温泉旅館・農業・ITの全分野で人材不足深刻。移住者には温泉入り放題の特典あり。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "花公園 植栽・整備スタッフ", date: "春・秋 各3日", pay: 7000, transport: false, gift_id: "g1" },
      { id: "j2", period: "mid", type: "副業", title: "旅館のSNS・動画制作", date: "3ヶ月〜", pay: "要相談", remote: true, gift_id: "g2" },
      { id: "j3", period: "long", type: "移住して働く", title: "温泉旅館スタッフ（住込み可）", date: "通年", pay: 190000, gift_id: "g2" },
    ],
    gifts: [
      { id: "g1", name: "くじゅう産 有機野菜セット", type: "product", emoji: "🥕" },
      { id: "g2", name: "九重温泉 1泊2食招待", type: "experience", emoji: "♨️" },
    ],
    voices: [
      { type: "resident", name: "松永 優子さん（45歳・旅館女将）", comment: "日本一の温泉があるのに担い手がいない。一緒にこの温泉文化を守ってほしいんです。", rating: 5 },
    ],
    events: [
      { id: "e1", title: "くじゅう花公園 春の花まつり", category: "nature", date: "2026-05-03", time: "9:00〜17:00", location: "くじゅう花公園", has_staff_job: true, job_title: "ガイド・案内スタッフ", job_pay: 7000, free: false, expected_visitors: 30000 },
    ],
    characters: [
      { type: "mascot", name: "くじゅうベア", emoji: "♨️", message: "日本一の温泉に入りながら働きませんか？体も心もポカポカの九重町でお待ちしています！", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "九重温泉郷旅館「湯の宿 九重」", category: "観光・宿泊", emoji: "♨️", tagline: "日本一の温泉文化を守り続ける旅館", story: "湧出量日本一の温泉地で70年続く旅館。後継者不足と人材確保に悩みながら、SNS活用で若い世代にも知ってもらいたいです。", tech: ["温泉旅館運営・接客", "料理（郷土料理・ジビエ）", "温泉管理・源泉調整"], employee_size: "15〜30名", challenges: ["後継者不足", "採用難", "SNS発信力の弱さ", "予約システム老朽化"], collab_types: ["SNS・動画制作支援", "旅館経営支援", "事業承継相談", "DX・予約システム導入"], succession: true, dx_need: true, founded: "1954年創業" },
      { id: "ip2", name: "九重有機ファーム", category: "農業", emoji: "🥕", tagline: "くじゅうの大地が育む有機野菜とジビエ", story: "くじゅう連山麓の高原農業法人。有機野菜とジビエ加工を手がけるが、ECサイトがなく販路が地域内に留まっています。", tech: ["有機野菜栽培", "ジビエ（鹿・猪）解体・加工", "農家レストラン運営"], employee_size: "5〜12名", challenges: ["EC・直販力が弱い", "採用難", "SNS活用不足", "加工設備の更新"], collab_types: ["ECサイト・ネット販売構築", "SNS発信支援", "農業体験・インターン", "企業連携・食材供給"], succession: false, dx_need: true, founded: "1998年創業" },
    ],
  },
  {
    id: "iwate-001", prefecture: "岩手県", name: "遠野市", lat: 39.3333, lng: 141.5333,
    sos_score: 88, aging_rate: 42, population: 26000, rent: 38000, commute_min: 0,
    issues: ["介護人材不足", "若者Uターン促進", "農業後継者"],
    strengths: ["日本のふるさと（民話の里）", "ホップ産地（ビール原料）", "カッパ伝説・ユニーク観光"],
    industries: [{ name: "農業", detail: "ホップ・山菜" }, { name: "観光", detail: "民話・体験ツーリズム" }],
    support: ["Uターン奨励金", "住宅改修補助", "農業就農支援"],
    foreigners_ok: false,
    imageUrl: "https://picsum.photos/seed/tono-iwate/800/420",
    catchCopy: "カッパの里、ホップの産地。日本のふるさとと共に歩む人を求む。",
    issueTags: ["介護人材不足", "Uターン促進", "農業後継者不足"],
    participationThemes: ["ホップ農業", "民話観光", "介護支援", "Uターン移住"],
    sosSummary: "介護・農業後継者不足が深刻。全国のビールを支えるホップ農業と民話文化の担い手を求む。",
    jobs: [
      { id: "j1", period: "spot", type: "単発アルバイト", title: "ホップ収穫アルバイト", date: "8月上旬 5日間", pay: 8000, transport: true, gift_id: "g1" },
      { id: "j2", period: "short", type: "ボランティア", title: "遠野まつり 民俗芸能補助", date: "9/12〜14", pay: null, transport: false, gift_id: "g2" },
    ],
    gifts: [
      { id: "g1", name: "遠野産 ホップビール 6本セット", type: "product", emoji: "🍺" },
      { id: "g2", name: "遠野民話語り部 体験ツアー", type: "experience", emoji: "📖" },
    ],
    voices: [
      { type: "resident", name: "佐々木 龍さん（55歳・ホップ農家）", comment: "ここのホップが全国のビールになるんですよ。この誇りある農業を一緒にやりませんか。", rating: 5 },
    ],
    events: [
      { id: "e1", title: "遠野まつり", category: "festival", date: "2026-09-13", time: "10:00〜19:00", location: "遠野市内各所", has_staff_job: true, job_title: "祭り補助・案内スタッフ", job_pay: 6500, free: true, expected_visitors: 50000 },
      { id: "e2", title: "遠野ホップ収穫祭", category: "nature", date: "2026-08-10", time: "10:00〜15:00", location: "遠野ホップ農場", has_staff_job: false, free: false, expected_visitors: 1000 },
    ],
    characters: [
      { type: "mascot", name: "カッパくん", emoji: "🦎", message: "カッパの里・遠野へようこそ！ホップ畑でビールの原料を収穫しながら、民話の世界に浸りませんか？", use_ai: false },
    ],
    industry_partners: [
      { id: "ip1", name: "遠野ホップ農場「金ケ崎農園」", category: "農業", emoji: "🍺", tagline: "全国のビールを支えるホップ農業を守りたい", story: "遠野産ホップは国産クラフトビールの原料として注目急増中。農家の高齢化で担い手が不足しており、就農希望者を歓迎します。", tech: ["ホップ栽培・収穫", "農業機械操作（トラクター等）", "山菜採取・加工"], employee_size: "5〜10名（季節労働者含む）", challenges: ["後継者・農業担い手不足", "機械化の遅れ", "副産物の販路拡大"], collab_types: ["農業担い手・就農研修", "副業農業体験", "ホップ加工品EC支援", "クラフトビール事業連携"], succession: true, dx_need: false, founded: "1970年代創業" },
      { id: "ip2", name: "遠野鍛冶屋「南部鉄器工房 虎鉄」", category: "伝統工芸", emoji: "⚙️", tagline: "南部鉄器の技術と誇りを世界へ届けたい", story: "遠野に残る数少ない南部鉄器の鍛冶工房。国内需要は安定しているが、海外需要への対応と弟子育成が急務です。", tech: ["南部鉄器鍛造・鋳造", "金属加工・研磨", "伝統紋様デザイン"], employee_size: "2〜4名", challenges: ["後継者・弟子不足", "海外EC販路なし", "英語対応不可", "ブランディング弱"], collab_types: ["弟子入り・職人修行", "海外ECサイト構築", "多言語対応・翻訳支援", "クラウドファンディング"], succession: true, dx_need: true, founded: "1895年創業" },
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================
const PERIOD_LABELS = { spot: "スポット", short: "短期", mid: "中期", long: "長期" };
const PERIOD_COLORS = {
  spot: "bg-orange-100 text-orange-800 border-orange-200",
  short: "bg-blue-100 text-blue-800 border-blue-200",
  mid: "bg-purple-100 text-purple-800 border-purple-200",
  long: "bg-red-100 text-red-800 border-red-200",
};
const EVT_COLORS = {
  fireworks: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "✨", label: "花火大会" },
  festival:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    icon: "🎏", label: "祭り・神事" },
  culture:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   icon: "🏫", label: "文化祭" },
  sport:     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: "🏃", label: "スポーツ" },
  market:    { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "🛍️", label: "マーケット" },
  nature:    { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",icon: "🌿", label: "自然・農業体験" },
  other:     { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",   icon: "📌", label: "その他" },
};

function sosColor(score) {
  if (score >= 90) return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50", border: "border-red-200", label: "緊急" };
  if (score >= 80) return { bg: "bg-amber-400", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200", label: "注意" };
  return { bg: "bg-blue-400", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200", label: "やや不足" };
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function distanceLabel(km) {
  const h = km / 80;
  if (h < 1) return `約${Math.round(h*60)}分`;
  return `約${h.toFixed(1)}時間`;
}

function formatPay(pay) {
  if (!pay) return "ボランティア";
  if (typeof pay === "string") return pay;
  return `¥${pay.toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const d = new Date(dateStr);
  const days = ["日","月","火","水","木","金","土"];
  return { month: d.getMonth()+1, day: d.getDate(), dow: days[d.getDay()] };
}

function generateVisitPlan(town) {
  return [
    { time: "10:00", item: `${town.prefecture} ${town.name}に到着` },
    { time: "11:00", item: town.issues[0] ? `地域課題「${town.issues[0]}」についてヒアリング` : "地域住民との交流" },
    { time: "13:00", item: "昼食：地元の特産料理を楽しむ" },
    { time: "14:30", item: town.strengths[0] ? `${town.strengths[0]}を体験・見学` : "地域名所を見学" },
    { time: "16:00", item: "移住・支援相談窓口を訪問" },
    { time: "17:30", item: "帰路へ" },
  ];
}

function buildGoogleCalendarUrl(plan) {
  const d = plan.date.replace(/-/g, "");
  const start = `${d}T${plan.startTime.replace(":", "")}00`;
  const end   = `${d}T${plan.endTime.replace(":", "")}00`;
  const details = "Machi Match 訪問プラン\n\n" + plan.planItems.map(p => `${p.time}　${p.item}`).join("\n");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(plan.title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(plan.location)}`;
}

// ============================================================
// MOCK USER STATE
// ============================================================
const MOCK_USER = {
  name: "小野 太郎",
  skills: ["IT・DX支援", "英語", "農業体験あり"],
  location: { lat: 35.6585, lng: 139.7454, label: "東京都 渋谷区" },
  hometown: "秋田県",
  wantedStyles: ["spot", "mid"],
  travelHours: 3,
  favorites: ["akita-001"],
  history: [
    { jobId: "j1", townId: "akita-001", title: "田植えアルバイト — 仙北市", status: "completed", date: "2026-05-18", giftReceived: "g1" }
  ],
};

// Claude APIを直接ブラウザから呼ぶと、APIキー漏洩・CORS制約のリスクがあります。
// デモでは VITE_CLAUDE_PROXY_URL がある場合のみプロキシ経由でAI生成し、
// 未設定時は自然なモック回答にフォールバックします。
const CLAUDE_PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL || "";

async function generateWithClaude(prompt, fallbackText) {
  if (!CLAUDE_PROXY_URL) return fallbackText;
  try {
    const res = await fetch(CLAUDE_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`AI proxy error: ${res.status}`);
    const data = await res.json();
    return data.text || data.message || data.content?.[0]?.text || fallbackText;
  } catch (error) {
    console.warn("AI generation fallback:", error);
    return fallbackText;
  }
}

// ============================================================
// HERO VISUALS — day-based rotation
// ============================================================
const REGION_HIGHLIGHTS = [
  {
    id: 1,
    townId: "kochi-001",
    area: "高知県 四万十町",
    category: "農業・清流",
    title: "夏の清流",
    catchcopy: "川と農の暮らしを、次の世代へつなぐ町",
    description: "四万十川の流れとともに、有機農業と自然の担い手が育まれています。日本最後の清流沿いに暮らす人々の知恵が、今も受け継がれています。",
    sos: "農業の担い手と、地域活動を担う若者が不足",
    image: "https://picsum.photos/id/28/1600/700",
  },
  {
    id: 2,
    townId: "akita-001",
    area: "秋田県 仙北市",
    category: "農業・伝統",
    title: "秋の棚田",
    catchcopy: "あきたこまちが黄金に実る里。農業の担い手を求める町",
    description: "角館武家屋敷と田沢湖を擁する仙北市。高齢化率51%の中で、農業・介護・観光の三分野で人材を急募しています。",
    sos: "農業後継者と介護人材が深刻に不足",
    image: "https://picsum.photos/id/15/1600/700",
  },
  {
    id: 3,
    townId: "shimane-001",
    area: "島根県 津和野町",
    category: "伝統工芸・移住",
    title: "春の古街",
    catchcopy: "山陰の小京都、石州和紙の技を次の世代へ",
    description: "石州和紙の伝統が息づく津和野。鷺舞の祭りとともに、1300年の技術を守る職人たちが後継者を探しています。",
    sos: "伝統工芸の後継者不足と、空き家の活用人材が急務",
    image: "https://picsum.photos/id/42/1600/700",
  },
  {
    id: 4,
    townId: "hokkaido-001",
    area: "北海道 東川町",
    category: "自然・写真文化",
    title: "初夏の大地",
    catchcopy: "大雪山と清流に囲まれた、写真文化の実験都市",
    description: "「写真の町」として知られる東川町。移住者数が増え続ける一方で、地域産業と農業を担う人材が慢性的に不足しています。",
    sos: "農業・観光・地域活動の担い手不足",
    image: "https://picsum.photos/id/10/1600/700",
  },
  {
    id: 5,
    townId: "nagano-001",
    area: "長野県 小海町",
    category: "観光・IT",
    title: "八ヶ岳の高原",
    catchcopy: "標高1000mの高原から、リモートと地域の未来を創る",
    description: "八ヶ岳を望む清里高原の麓。都市から移住するIT人材と、地域の観光業者をつなぐ取り組みが進んでいます。",
    sos: "IT人材と観光業の担い手が不足",
    image: "https://picsum.photos/id/57/1600/700",
  },
  {
    id: 6,
    townId: "fukushima-001",
    area: "福島県 只見町",
    category: "雪・自然遺産",
    title: "冬の雪景色",
    catchcopy: "豪雪地帯に息づく縄文の文化と、只見川の絶景",
    description: "日本有数の豪雪地帯・只見町。只見川の霧に包まれた絶景は世界的に知られますが、過疎化と高齢化が深刻です。",
    sos: "雪かきから農業まで、通年で関わる担い手が急務",
    image: "https://picsum.photos/id/13/1600/700",
  },
  {
    id: 7,
    townId: "oita-001",
    area: "大分県 九重町",
    category: "温泉・農業",
    title: "秋の九重連山",
    catchcopy: "九州の屋根から、農と温泉の暮らしへ誘う",
    description: "くじゅう連山に囲まれた高原の町。温泉と農業が共存する豊かな自然環境の中、後継者と移住者を求めています。",
    sos: "農業後継者と観光業の担い手が慢性的に不足",
    image: "https://picsum.photos/id/45/1600/700",
  },
  {
    id: 8,
    townId: "iwate-001",
    area: "岩手県 遠野市",
    category: "民話・農業",
    title: "初秋の里山",
    catchcopy: "カッパが住む民話の里で、農と文化をつなぐ仕事を",
    description: "柳田国男『遠野物語』の舞台として知られる遠野市。農業・観光・文化伝承の三分野で外部からの関わりを求めています。",
    sos: "文化伝承と農業の担い手、移住定住支援の人材が不足",
    image: "https://picsum.photos/id/37/1600/700",
  },
];

// ============================================================
// SUB COMPONENTS
// ============================================================
function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${className}`}>{children}</span>;
}

function PeriodBadge({ period }) {
  return <Badge className={`border ${PERIOD_COLORS[period]}`}>{PERIOD_LABELS[period]}</Badge>;
}

function SosBar({ score }) {
  const c = sosColor(score);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bg} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold tabular-nums ${c.text}`}>{score}</span>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="text-center bg-white/70 rounded-xl py-2 px-1 border border-white/50">
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-800 leading-tight">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function CharacterBubble({ char, townName }) {
  const [aiMsg, setAiMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 200);
    return () => clearTimeout(t);
  }, []);

  async function generateAI() {
    setLoading(true);
    const prompt = `あなたは「${char.name}」というキャラクターです。${townName}のPRキャラクターとして、移住・支援希望者に向けた温かく魅力的な一言メッセージを50文字以内で生成してください。キャラクターらしい口調で。`;
    const fallback = `${townName}には、あなたの力を待っている人がいます。まずは週末から会いに来てください。`;
    setAiMsg(await generateWithClaude(prompt, fallback || char.message));
    setLoading(false);
  }

  const message = aiMsg || char.message;
  const typeLabel = { mascot: "公式キャラクター", celebrity: "地元出身", ai: "AIキャラ", resident: "住民代表" };
  const typeBg = { mascot: "bg-indigo-50 text-indigo-700", celebrity: "bg-amber-50 text-amber-700", ai: "bg-purple-50 text-purple-700", resident: "bg-green-50 text-green-700" };

  return (
    <div className={`flex gap-3 items-start transition-all duration-500 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-2xl border border-indigo-100 shadow-sm">
        {char.emoji}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700">{char.name}</span>
          <Badge className={typeBg[char.type]}>{typeLabel[char.type]}</Badge>
        </div>
        <div className="relative bg-indigo-50 border border-indigo-100 rounded-lg rounded-tl-none px-3 py-2 text-sm text-gray-800 leading-relaxed">
          {loading ? <span className="text-gray-400 animate-pulse">生成中...</span> : message}
        </div>
        {char.use_ai && !aiMsg && (
          <button onClick={generateAI} className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-800 underline">
            AIで新しい一言を生成
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TOWN CARD
// ============================================================
function TownCard({ town, userLoc, favorites, onToggleFav, onClick, rank }) {
  const c = sosColor(town.sos_score);
  const dist = userLoc ? haversine(userLoc.lat, userLoc.lng, town.lat, town.lng) : null;
  const distH = dist ? dist / 80 : null;
  const isFav = favorites.includes(town.id);
  const spotJobs = town.jobs.filter(j => j.period === "spot");
  const isUrgent = town.sos_score >= 90;

  return (
    <div
      onClick={() => onClick(town)}
      className="relative bg-white rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-gray-100 shadow-sm group"
    >
      {/* Hero image */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        {/* Fallback gradient (always rendered, covered by image if successful) */}
        <div className={`absolute inset-0 ${isUrgent ? "bg-gradient-to-br from-red-700 to-rose-600" : town.sos_score >= 80 ? "bg-gradient-to-br from-amber-600 to-orange-500" : "bg-gradient-to-br from-indigo-700 to-blue-600"}`} />
        {town.imageUrl && (
          <img
            src={town.imageUrl}
            alt={town.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = "none"; }}
          />
        )}
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          {isUrgent && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">緊急SOS</span>
          )}
          {distH !== null && distH <= 3 && (
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">近い</span>
          )}
        </div>

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(town.id); }}
          className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors text-base"
        >
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Town info on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className="text-xs text-white/60 font-medium">{town.prefecture}</span>
          <div className="text-lg font-bold text-white leading-tight drop-shadow">{town.name}</div>
          {town.catchCopy && (
            <div className="text-xs text-white/75 mt-0.5 leading-snug line-clamp-1">{town.catchCopy}</div>
          )}
          {town.issueTags && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {town.issueTags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm text-white/90 border border-white/30 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content below image */}
      <div className="p-4">
        {/* SOS Score */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">SOSスコア</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.light} ${c.text}`}>{c.label}</span>
          </div>
          <SosBar score={town.sos_score} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="text-center bg-gray-50 rounded-xl py-2">
            <div className="text-xs text-gray-400 mb-0.5">高齢化率</div>
            <div className="text-sm font-bold text-gray-700">{town.aging_rate}%</div>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-2">
            <div className="text-xs text-gray-400 mb-0.5">家賃目安</div>
            <div className="text-sm font-bold text-gray-700">¥{(town.rent/10000).toFixed(1)}万</div>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-2">
            <div className="text-xs text-gray-400 mb-0.5">外国人材</div>
            <div className={`text-xs font-bold ${town.foreigners_ok ? "text-emerald-600" : "text-gray-400"}`}>{town.foreigners_ok ? "受入可" : "準備中"}</div>
          </div>
        </div>

        {/* Spot jobs CTA */}
        {spotJobs.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl px-3 py-2.5">
            <div className="text-xs font-semibold text-orange-700 mb-0.5">単発バイト {spotJobs.length}件あり</div>
            <div className="text-xs text-orange-600">{spotJobs[0].title} · 日給¥{typeof spotJobs[0].pay === "number" ? spotJobs[0].pay.toLocaleString() : spotJobs[0].pay}</div>
          </div>
        )}

        {/* Footer: distance + jobs count */}
        {dist && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1 text-xs text-gray-400">
            <span>📍</span>
            <span>{distanceLabel(dist)}</span>
            <span className="mx-1">·</span>
            <span>関わり方 {town.jobs.length}件</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INDUSTRY PARTNERS TAB
// ============================================================
function IndustryPartnersTab({ town }) {
  const [bizMode, setBizMode] = useState(false);
  const partners = town.industry_partners || [];

  if (partners.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">この自治体の企業連携情報は準備中です</div>
    );
  }

  return (
    <div>
      {/* Intro */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-4">
        <p className="text-sm text-emerald-800 leading-relaxed">
          🏘️ この町には、<strong>未来につなぎたい地域産業</strong>があります。技術・食・観光・農業を守るため、個人の副業支援から企業連携まで、さまざまな関わり方を募集しています。
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-medium">表示を切り替える</span>
        <div className="flex bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setBizMode(false)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${!bizMode ? "bg-white text-gray-800 shadow-sm font-medium" : "text-gray-400"}`}
          >
            一般向け
          </button>
          <button
            onClick={() => setBizMode(true)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${bizMode ? "bg-indigo-600 text-white font-medium" : "text-gray-400"}`}
          >
            企業向け
          </button>
        </div>
      </div>

      {/* Partner Cards */}
      <div className="space-y-3">
        {partners.map(p => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-100">
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                    {p.succession && <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">後継者募集</span>}
                    {p.dx_need && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">DX支援歓迎</span>}
                  </div>
                  <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 italic">「{p.tagline}」</div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              {!bizMode ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{p.story}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.collab_types.map(ct => (
                      <span key={ct} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">{ct}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors">
                      🤝 この地域産業を応援する
                    </button>
                    <button className="text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-full hover:border-gray-400 transition-colors">
                      副業で支援する
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-xs text-gray-400 mb-1">従業員規模</div>
                      <div className="text-sm font-medium text-gray-700">{p.employee_size}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-xs text-gray-400 mb-1">創業</div>
                      <div className="text-sm font-medium text-gray-700">{p.founded}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1.5 font-medium">技術・設備・強み</div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.tech.map(t => (
                        <span key={t} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1.5 font-medium">経営課題</div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.challenges.map(ch => (
                        <span key={ch} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">{ch}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1.5 font-medium">協業・支援の形</div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.collab_types.map(ct => (
                        <span key={ct} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">{ct}</span>
                      ))}
                    </div>
                  </div>
                  {(p.succession || p.dx_need) && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.succession && (
                        <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-lg font-medium">📋 事業承継・M&A相談可</span>
                      )}
                      {p.dx_need && (
                        <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg font-medium">💻 DX・IT支援求む</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                      🏢 企業として相談する
                    </button>
                    <button className="text-xs border border-indigo-200 text-indigo-700 px-3 py-2 rounded-full hover:bg-indigo-50 transition-colors">
                      協業を検討する
                    </button>
                    {p.succession && (
                      <button className="text-xs bg-red-600 text-white px-3 py-2 rounded-full hover:bg-red-700 transition-colors">
                        事業承継情報を見る
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// VISIT PLAN MODAL
// ============================================================
function VisitPlanModal({ town, onConfirm, onClose }) {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const [date, setDate] = useState(defaultDate.toISOString().split("T")[0]);
  const planItems = generateVisitPlan(town);

  function handleConfirm() {
    const plan = {
      id: Date.now().toString(),
      townId: town.id,
      townName: town.name,
      prefecture: town.prefecture,
      imageUrl: town.imageUrl ?? null,
      title: `Machi Match：${town.prefecture} ${town.name} 訪問プラン`,
      date,
      startTime: "10:00",
      endTime: "18:00",
      location: `${town.prefecture} ${town.name}`,
      purpose: "観光・地域課題ヒアリング・移住相談",
      planItems,
      status: "confirmed",
      addedToGoogleCalendar: false,
    };
    plan.googleCalendarUrl = buildGoogleCalendarUrl(plan);
    onConfirm(plan);
  }

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", width: "100%", maxWidth: 480, maxHeight: "88vh", borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ background: "linear-gradient(to right, #4f46e5, #7c3aed)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>AIで訪問プランを作る</div>
            <div style={{ color: "rgba(196,181,253,0.9)", fontSize: 12, marginTop: 2 }}>{town.prefecture} {town.name}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>訪問日を選ぶ</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => setDate(e.target.value)}
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 16px", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>AIが提案する訪問プラン</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {planItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#eef2ff", borderRadius: 12, padding: "10px 14px", border: "1px solid #e0e7ff" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", whiteSpace: "nowrap", width: 42, flexShrink: 0, paddingTop: 1 }}>{item.time}</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{item.item}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
            <div>🕙 10:00〜18:00　📍 {town.prefecture} {town.name}</div>
            <div>目的：観光・地域課題ヒアリング・移住相談</div>
          </div>
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6", flexShrink: 0, display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            キャンセル
          </button>
          <button onClick={handleConfirm} style={{ flex: 1, background: "#4f46e5", color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            この予定で確定
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================
// TOWN DETAIL
// ============================================================
function TownDetail({ town, userLoc, favorites, onToggleFav, onClose, isLoggedIn, onScheduleVisit }) {
  const [tab, setTab] = useState("issues");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [evtFilter, setEvtFilter] = useState("all");
  const [aiRecommend, setAiRecommend] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showVisitPlan, setShowVisitPlan] = useState(false);
  const [planConfirmed, setPlanConfirmed] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const dragStartY = useRef(0);

  useEffect(() => {
    // iOS Safari では overflow:hidden だけでは body スクロールが止まらないため
    // position:fixed + top:-scrollY で完全にロックする
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const c = sosColor(town.sos_score);
  const isFav = favorites.includes(town.id);
  const dist = userLoc ? haversine(userLoc.lat, userLoc.lng, town.lat, town.lng) : null;

  const filteredJobs = periodFilter === "all" ? town.jobs : town.jobs.filter(j => j.period === periodFilter);
  const filteredEvts = evtFilter === "all" ? town.events : town.events.filter(e => e.category === evtFilter);

  async function generateAIComment() {
    setAiLoading(true);
    const prompt = `${town.prefecture}${town.name}について、移住・支援希望者向けの魅力的な紹介文を100文字以内で生成してください。強み：${town.strengths.join("、")}。課題：${town.issues.join("、")}。`;
    const fallback = `${town.name}は「${town.issues[0]}」という課題を抱えながら、${town.strengths[0]}という強みを持つ町です。あなたの関わりが、地域の未来を少し前に進めます。`;
    setAiRecommend(await generateWithClaude(prompt, fallback));
    setAiLoading(false);
  }

  const tabs = [
    { id: "issues", label: "課題・困りごと" },
    { id: "strengths", label: "地域の強み" },
    { id: "jobs", label: `関わり方 (${town.jobs.length}件)` },
    { id: "events", label: `イベント (${town.events.length}件)` },
    { id: "voices", label: "住民の声" },
    { id: "gifts", label: "返礼品" },
    { id: "industry", label: "企業連携" },
  ];

  return (
    <>
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      onTouchMove={e => e.stopPropagation()}
    >
      <div
        className="bg-white w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl sm:rounded-3xl rounded-t-3xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image header — collapses when sheet expanded */}
        <div className={`relative flex-shrink-0 transition-all duration-300 overflow-hidden ${sheetExpanded ? "max-h-0" : "max-h-[600px]"}`}>
          <div className="relative h-48 sm:h-56 overflow-hidden">
            {/* Fallback gradient */}
            <div className={`absolute inset-0 ${c.label === "緊急" ? "bg-gradient-to-br from-red-700 to-rose-600" : "bg-gradient-to-br from-indigo-700 to-purple-700"}`} />
            {town.imageUrl && (
              <img
                src={town.imageUrl}
                alt={town.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { e.target.style.display = "none"; }}
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/35 to-transparent" />

            {/* Mobile drag handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/40 rounded-full sm:hidden" />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => onToggleFav(town.id)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors text-xl"
              >
                {isFav ? "❤️" : "🤍"}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full text-white font-bold transition-colors text-sm leading-none"
              >
                ✕
              </button>
            </div>

            {/* Town identity on image */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-white/60 font-medium">{town.prefecture}</span>
                {c.label === "緊急" && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">緊急SOS</span>
                )}
                {town.foreigners_ok && (
                  <span className="text-xs bg-white/20 backdrop-blur-sm text-white border border-white/30 px-2 py-0.5 rounded-full">外国人材OK</span>
                )}
              </div>
              <div className="text-2xl font-bold text-white leading-tight drop-shadow-md">{town.name}</div>
              {town.catchCopy && (
                <div className="text-sm text-white/80 mt-1 leading-snug">{town.catchCopy}</div>
              )}
              {town.issueTags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {town.issueTags.map(tag => (
                    <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm text-white border border-white/30 px-2.5 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SOS bar + Stats + Characters */}
          <div className={`${c.light} px-5 pt-4 pb-4`}>
            {/* SOS */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">SOSスコア</span>
              <div className="flex-1"><SosBar score={town.sos_score} /></div>
              {dist && <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">📍 {distanceLabel(dist)}</span>}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ["人口", `${(town.population/10000).toFixed(1)}万人`],
                ["高齢化率", `${town.aging_rate}%`],
                ["家賃目安", `¥${(town.rent/10000).toFixed(1)}万`],
                ["通勤", `${town.commute_min}分`],
              ].map(([l, v]) => (
                <div key={l} className="text-center bg-white/60 rounded-xl py-2 border border-white/50">
                  <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                  <div className="text-sm font-bold text-gray-800">{v}</div>
                </div>
              ))}
            </div>

            {/* Characters */}
            {town.characters?.length > 0 && (
              <div className="mt-3 space-y-2">
                {town.characters.map((ch, i) => <CharacterBubble key={i} char={ch} townName={town.name} />)}
              </div>
            )}
          </div>
        </div>

        {/* AI紹介文 */}
        <div className="px-5 py-2.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 flex items-center gap-3">
          {aiRecommend ? (
            <p className="text-sm text-gray-700 flex-1 leading-relaxed">{aiRecommend}</p>
          ) : (
            <p className="text-xs text-gray-400 flex-1">AIがこの町の魅力を紹介します</p>
          )}
          <button
            onClick={generateAIComment}
            className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0 font-medium"
          >
            {aiLoading ? "生成中…" : "✨ AI紹介"}
          </button>
        </div>

        {/* Drag handle — pull up to expand content area */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center py-2 cursor-pointer select-none bg-white border-b border-gray-100 active:bg-gray-50 transition-colors"
          onClick={() => setSheetExpanded(p => !p)}
          onTouchStart={e => { dragStartY.current = e.touches[0].clientY; }}
          onTouchEnd={e => {
            const dy = dragStartY.current - e.changedTouches[0].clientY;
            if (dy > 20) setSheetExpanded(true);
            if (dy < -20) setSheetExpanded(false);
          }}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
          <span className="text-xs text-gray-400 mt-1">{sheetExpanded ? "▼ 戻る" : "▲ タブを広げる"}</span>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-4 flex-shrink-0 gap-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${tab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">

          {/* 課題 */}
          {tab === "issues" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">この町が抱える課題</p>
              {town.issues.map(issue => (
                <div key={issue} className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-rose-500 text-sm font-bold">!</span>
                  </div>
                  <div className="font-semibold text-gray-800">{issue}</div>
                </div>
              ))}
              <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
                <p className="text-sm text-indigo-700 font-medium mb-2">あなたの力が必要です</p>
                <p className="text-xs text-indigo-600 leading-relaxed mb-3">
                  {town.sosSummary || "これらの課題に、副業・ボランティア・移住など、さまざまな形で関われます。"}
                </p>
                {town.participationThemes && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {town.participationThemes.map(theme => (
                      <span key={theme} className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">{theme}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setTab("jobs")} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                    関わり方を見る →
                  </button>
                  <button onClick={() => setShowVisitPlan(true)} className="text-xs bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                    📅 訪問プランを作る
                  </button>
                  <button onClick={() => setTab("industry")} className="text-xs border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors">
                    企業として相談する
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 強み */}
          {tab === "strengths" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">この町の宝もの</p>
                {town.strengths.map(s => (
                  <div key={s} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-700 text-xs font-bold">✓</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800 leading-relaxed">{s}</div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">主要産業</p>
                <div className="grid grid-cols-2 gap-2">
                  {town.industries.map(ind => (
                    <div key={ind.name} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                      <div className="font-semibold text-gray-800 text-sm">{ind.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{ind.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">移住・支援制度</p>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  {town.support.map((s, i) => (
                    <div key={s} className={`flex items-center gap-3 px-4 py-3 ${i < town.support.length-1 ? "border-b border-gray-50" : ""}`}>
                      <span className="text-emerald-500 font-bold text-sm">✓</span>
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 関わり方 */}
          {tab === "jobs" && (
            <div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {["all","spot","short","mid","long"].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodFilter(p)}
                    className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all ${periodFilter === p ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"}`}
                  >
                    {p === "all" ? "すべて" : PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filteredJobs.map(job => {
                  const gift = job.gift_id ? town.gifts.find(g => g.id === job.gift_id) : null;
                  const isSpot = job.period === "spot";
                  return (
                    <div key={job.id} className={`rounded-2xl p-4 border ${isSpot ? "border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50" : "border-gray-100 bg-white shadow-sm"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <PeriodBadge period={job.period} />
                            <span className="text-xs text-gray-400">{job.type}</span>
                            {job.remote && <Badge className="bg-blue-50 text-blue-600 border border-blue-100">リモート可</Badge>}
                            {job.transport && <Badge className="bg-gray-50 text-gray-500 border border-gray-200">交通費支給</Badge>}
                          </div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{job.title}</div>
                          <div className="text-xs text-gray-400">{job.date}</div>
                          {gift && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1.5 w-fit font-medium">
                              🎁 返礼品：{gift.emoji} {gift.name}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-gray-900 text-base">{formatPay(job.pay)}</div>
                          <div className="text-xs text-gray-400 mb-2">{job.period === "spot" ? "日給" : "報酬"}</div>
                          <button className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                            {isLoggedIn ? "応募する" : "詳細を見る"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* イベント */}
          {tab === "events" && (
            <div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {["all","fireworks","festival","culture","sport","nature","other"].map(cat => {
                  const ec = EVT_COLORS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setEvtFilter(cat)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${evtFilter === cat ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}
                    >
                      {cat === "all" ? "すべて" : `${ec.icon} ${ec.label}`}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                {filteredEvts.map(evt => {
                  const ec = EVT_COLORS[evt.category] || EVT_COLORS.other;
                  const df = formatDate(evt.date);
                  return (
                    <div key={evt.id} className={`border ${ec.border} ${ec.bg} rounded-2xl p-4`}>
                      <div className="flex gap-3">
                        {df && typeof df === "object" ? (
                          <div className="flex-shrink-0 w-12 text-center bg-white rounded-xl py-2 border border-gray-100 shadow-sm">
                            <div className="text-xs text-gray-400">{df.month}月</div>
                            <div className="text-xl font-bold text-gray-800 leading-tight">{df.day}</div>
                            <div className="text-xs text-gray-400">{df.dow}</div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            <div className="text-2xl">{ec.icon}</div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span className={`text-xs font-semibold ${ec.text}`}>{ec.label}</span>
                            {evt.has_staff_job && <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">スタッフ募集</Badge>}
                            {evt.free && <Badge className="bg-gray-100 text-gray-500">無料</Badge>}
                          </div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{evt.title}</div>
                          <div className="text-xs text-gray-400">{evt.time} · {evt.location}</div>
                          {evt.expected_visitors && (
                            <div className="text-xs text-gray-400 mt-0.5">来場 約{evt.expected_visitors.toLocaleString()}人</div>
                          )}
                          {evt.has_staff_job && (
                            <div className="mt-2.5 bg-white/70 border border-emerald-100 rounded-xl px-3 py-2 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-emerald-700">{evt.job_title}</div>
                                {evt.job_pay && <div className="text-xs text-emerald-600">日給 ¥{evt.job_pay.toLocaleString()}</div>}
                              </div>
                              <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium">
                                応募する
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 住民の声 */}
          {tab === "voices" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">この町に関わる人の声</p>
              {town.voices.map((v, i) => {
                const typeLabel = { resident: "地域住民", migrant: "移住者", visitor: "体験参加者" };
                const typeBg = { resident: "bg-blue-50 text-blue-700 border border-blue-100", migrant: "bg-emerald-50 text-emerald-700 border border-emerald-100", visitor: "bg-amber-50 text-amber-700 border border-amber-100" };
                const typeEmoji = { resident: "🏡", migrant: "🌱", visitor: "✈️" };
                return (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                        {typeEmoji[v.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{v.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={typeBg[v.type]}>{typeLabel[v.type]}</Badge>
                          <span className="text-yellow-400 text-xs">{"★".repeat(v.rating)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">「{v.comment}」</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* 返礼品 */}
          {tab === "gifts" && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-4">活動後に受け取れる地域の返礼品</p>
              <div className="grid grid-cols-2 gap-3">
                {town.gifts.map(gift => (
                  <div key={gift.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 text-center shadow-sm">
                    <div className="text-4xl mb-3">{gift.emoji}</div>
                    <div className="font-semibold text-gray-800 text-sm mb-2">{gift.name}</div>
                    <Badge className={gift.type === "product" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}>
                      {gift.type === "product" ? "産品" : "体験"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 企業連携 */}
          {tab === "industry" && <IndustryPartnersTab town={town} />}
        </div>
      </div>
    </div>

    {showVisitPlan && (
      <VisitPlanModal
        town={town}
        onConfirm={plan => {
          onScheduleVisit?.(plan);
          setShowVisitPlan(false);
          setPlanConfirmed(true);
          setTimeout(() => setPlanConfirmed(false), 3000);
        }}
        onClose={() => setShowVisitPlan(false)}
      />
    )}

    {planConfirmed && createPortal(
      <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 10001, pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div style={{ background: "#4f46e5", color: "#fff", padding: "12px 24px", borderRadius: 16, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(79,70,229,0.45)" }}>
          ✅ 訪問プランをマイページに追加しました！
        </div>
      </div>,
      document.body
    )}
    </>
  );
}

// ============================================================
// INLINE DARTS PANEL (used inside AIRecommendPage right column)
// ============================================================
// ── Google Maps / OSM プレビュー ──────────────────────────────
function GoogleMapPreview({ lat, lng, name, prefecture }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=13&maptype=roadmap&language=ja`;
    return (
      <iframe
        src={src}
        title={`${prefecture}${name}の地図`}
        className="w-full rounded-xl"
        style={{ height: "260px", border: "none" }}
        allowFullScreen
        loading="lazy"
      />
    );
  }

  // APIキー未設定 → OpenStreetMap iframe（無料・キー不要）
  // iframe を表示高より 36px 背高にしてコンテナでクリップ → OSM フッターバーを隠す
  const m = 0.09;
  const bbox = `${(lng - m).toFixed(4)},${(lat - m).toFixed(4)},${(lng + m).toFixed(4)},${(lat + m).toFixed(4)}`;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="relative rounded-xl border border-gray-200" style={{ height: "260px", overflow: "hidden" }}>
      <iframe
        src={osmSrc}
        title={`${prefecture}${name}の地図`}
        className="w-full absolute top-0 left-0"
        style={{ height: "296px", border: "none" }}
        loading="lazy"
      />
      {/* 最低限の帰属表示（OSM ライセンス準拠） */}
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-1.5 right-2 text-[10px] text-gray-400 bg-white/80 px-1.5 py-0.5 rounded hover:underline z-10"
      >
        © OpenStreetMap
      </a>
    </div>
  );
}

// ── ダーツの旅 + マップパネル ──────────────────────────────────
const DART_PHRASES = ["えいっ！🎯", "運命の地へ…", "どこへ飛ぶかな？", "今日のご縁は…！", "全国から選出中…"];

function DartsWithMapPanel({ towns, onSelectTown }) {
  const [phase, setPhase] = useState("idle"); // idle | throwing | revealed
  const [chosenTown, setChosenTown] = useState(null);
  const [phrase, setPhrase] = useState(DART_PHRASES[0]);

  function throwDart() {
    if (phase === "throwing") return;
    const town = towns[Math.floor(Math.random() * towns.length)];
    setChosenTown(town);
    setPhrase(DART_PHRASES[Math.floor(Math.random() * DART_PHRASES.length)]);
    setPhase("throwing");
    setTimeout(() => setPhase("revealed"), 1400);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl mt-0.5">🎯</span>
          <div>
            <div className="text-white font-black text-base leading-snug tracking-wide">ダーツの旅で地域と出会う</div>
            <div className="text-white/90 text-sm font-medium mt-1 leading-relaxed">偶然出会ったまちから、ワクワクが始まる。</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* Idle */}
        {phase === "idle" && (
          <>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 text-center border border-orange-100">
              <div className="text-5xl mb-3">🗾</div>
              <div className="text-sm font-bold text-orange-800 mb-1">どの地域と出会う？</div>
              <div className="text-xs text-orange-600 leading-relaxed">
                ボタンを押すと全国の自治体からランダムに<br/>1か所を選び、実際の地図で表示します。
              </div>
            </div>
            <button
              onClick={throwDart}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-md"
            >
              🎯 ダーツを投げる
            </button>
          </>
        )}

        {/* Throwing animation */}
        {phase === "throwing" && (
          <div className="bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center justify-center gap-3 py-10">
            <div className="text-5xl animate-bounce">🎯</div>
            <div className="text-base font-bold text-orange-700">{phrase}</div>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Revealed: map + card + buttons */}
        {phase === "revealed" && chosenTown && (
          <div className="space-y-3 animate-fade-in">
            {/* 結果ラベル */}
            <div className="text-center">
              <div className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-0.5">今回の旅先は…</div>
              <div className="text-2xl font-black text-gray-900">{chosenTown.prefecture} {chosenTown.name}</div>
            </div>

            {/* Google Map / OSM */}
            <GoogleMapPreview
              lat={chosenTown.lat}
              lng={chosenTown.lng}
              name={chosenTown.name}
              prefecture={chosenTown.prefecture}
            />

            {/* 地域情報カード */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">SOS {chosenTown.sos_score}</span>
                <span className="text-xs text-gray-500">高齢化率 {chosenTown.aging_rate}%</span>
                <span className="text-xs text-gray-500">人口 {chosenTown.population?.toLocaleString()}人</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{chosenTown.catchCopy}</p>
            </div>

            {/* アクションボタン */}
            <button
              onClick={() => onSelectTown && onSelectTown(chosenTown)}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              詳細を見る →
            </button>

            {/* Google Mapsで開くリンク */}
            <a
              href={`https://www.google.com/maps?q=${chosenTown.lat},${chosenTown.lng}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-xs text-gray-400 hover:text-indigo-600 transition-colors"
            >
              Google Maps で開く ↗
            </a>

            <button
              onClick={throwDart}
              className="w-full text-xs text-orange-600 border border-orange-200 py-2.5 rounded-xl hover:bg-orange-50 font-semibold transition-colors"
            >
              🎯 もう一回ダーツを投げる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// AI RECOMMENDATION
// ============================================================
const THEME_OPTIONS = ["農業・食", "観光・交流", "IT・DX", "教育・子育て", "医療・福祉", "自然・環境", "伝統工芸", "移住定住", "企業誘致"];
const SKILL_OPTIONS = ["IT・DX支援", "英語・多言語", "農業", "介護・福祉", "教育", "観光ガイド", "SNS・広報", "料理・加工", "医療", "建築・土木", "経営・経営企画"];
const IMAGE_OPTIONS = ["海・漁村", "山・農村", "都市近郊", "離島", "温泉地", "雪国", "古民家", "自然豊か", "コンパクト"];
const PRIORITY_OPTIONS = [
  { key: "casual",    emoji: "🙌", label: "なんとなく！",           desc: "AIにおまかせ・迷ってる", border: "border-gray-400",    bg: "bg-gray-50",    text: "text-gray-700"    },
  { key: "sos",       emoji: "🆘", label: "SOS課題を解決したい",   desc: "スキルで地域を救う",     border: "border-red-400",     bg: "bg-red-50",     text: "text-red-700"     },
  { key: "lifestyle", emoji: "🏡", label: "暮らしを変えたい",       desc: "移住・自分らしい生活",   border: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  { key: "work",      emoji: "💼", label: "副業・スキル活用",       desc: "スキルを活かして稼ぐ",   border: "border-blue-400",    bg: "bg-blue-50",    text: "text-blue-700"    },
  { key: "volunteer", emoji: "🤝", label: "ボランティア・社会貢献", desc: "社会貢献・助け合い",     border: "border-orange-400",  bg: "bg-orange-50",  text: "text-orange-700"  },
];
const INVOLVEMENT_OPTIONS = [
  { key: "移住したい",        label: "移住したい",        emoji: "🏡", sub: "定住・就職" },
  { key: "副業で関わりたい",   label: "副業で関わりたい",   emoji: "💼", sub: "リモート可" },
  { key: "ボランティアしたい", label: "ボランティア",      emoji: "🤝", sub: "短期・無償" },
  { key: "旅行から始めたい",   label: "旅行から始めたい",   emoji: "✈️", sub: "まず体験" },
  { key: "企業として支援したい", label: "企業支援",        emoji: "🏢", sub: "CSR・連携" },
];

function TagSelector({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? "bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105" : "border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 bg-white"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function toggleTag(list, tag) {
  return list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag];
}

function MatchResultCard({ result, resultTown, onSelectTown }) {
  return (
    <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-md animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-base">✨</span>
          <div className="text-sm font-bold text-white">AIマッチング結果</div>
        </div>
        <span className="text-xs text-indigo-200 bg-indigo-700/50 px-2 py-0.5 rounded-full">{result.source}</span>
      </div>
      <div className="p-5 space-y-4">
        {result.debugError && (
          <div className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-700 break-all">
            🐛 Gemini失敗: {result.debugError}
          </div>
        )}
        {/* Region name + score */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">おすすめ地域</div>
            <div className="text-xl font-bold text-gray-900">{result.recommendedRegion}</div>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-3xl font-extrabold text-indigo-600">{result.matchScore}<span className="text-lg">%</span></div>
            <div className="text-xs text-gray-400">マッチ度</div>
          </div>
        </div>

        {/* Match type badge */}
        <div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100">{result.matchType}</span>
        </div>

        {/* Reason */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">おすすめ理由</div>
          <p className="text-sm text-gray-700 leading-relaxed">{result.reason}</p>
        </div>

        {/* User contribution (priority-matched) */}
        {result.userContribution && (
          <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-200">
            <div className="text-xs font-semibold text-indigo-600 mb-0.5">あなたが貢献できること</div>
            <p className="text-sm text-indigo-800 font-medium">{result.userContribution}</p>
          </div>
        )}

        {/* SOS issue */}
        <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          <div className="text-xs font-semibold text-red-500 mb-0.5">この地域のSOS課題</div>
          <p className="text-sm text-red-700 font-medium">{result.sosIssue}</p>
        </div>

        {/* First action */}
        <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-100">
          <div className="text-xs font-semibold text-green-600 mb-0.5">最初の関わり方</div>
          <p className="text-sm text-green-800">{result.firstAction}</p>
        </div>

        {/* Detail button */}
        {resultTown && (
          <button
            onClick={() => onSelectTown(resultTown)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
          >
            この地域の詳細を見る →
          </button>
        )}
      </div>
    </div>
  );
}

function AIRecommendPage({ towns, onSelectTown }) {
  const [matchPriority, setMatchPriority] = useState("");
  const [themes, setThemes] = useState([]);
  const [involvement, setInvolvement] = useState("");
  const [skills, setSkills] = useState([]);
  const [regionImage, setRegionImage] = useState([]);
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const resultTown = result
    ? towns.find(t => result.recommendedRegion.includes(t.name)) ?? null
    : null;

  async function recommend() {
    setLoading(true);
    setResult(null);
    setError("");
    setShowResult(false);
    setShowCelebration(false);
    try {
      const userInput = { themes, involvement, skills, regionImage, freeText, matchPriority };
      const res = await matchRegions(userInput, towns);
      setResult(res);
      setShowCelebration(true);
    } catch (err) {
      setError("推薦に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  const handleCelebrationDismiss = useCallback(() => {
    setShowCelebration(false);
    setShowResult(true);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Match celebration overlay */}
      {showCelebration && result && (
        <MatchCelebration
          regionName={resultTown?.name ?? result.recommendedRegion}
          prefecture={resultTown?.prefecture ?? ""}
          matchScore={result.matchScore}
          imageUrl={resultTown?.imageUrl ?? null}
          onDismiss={handleCelebrationDismiss}
        />
      )}

      {/* Page header */}
      <div className="mb-6">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">✨ Machi Match</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">あなたに合う地域をAIで見つける</h2>
        <p className="text-sm text-gray-500 leading-relaxed">価値観・スキル・関心から、相性のよいまちを提案します。</p>
      </div>

      {/* 2-col layout on lg+ */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start space-y-5 lg:space-y-0">

        {/* LEFT: form (3/5) */}
        <div className="lg:col-span-3 space-y-4">

          {/* Step 0: 優先軸選択 */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">★</div>
              <div>
                <label className="text-sm font-semibold text-gray-800">まず、あなたの目的を教えてください</label>
                <p className="text-xs text-gray-400 mt-0.5">選択によってAIのマッチングロジックが変わります</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PRIORITY_OPTIONS.map(({ key, emoji, label, desc, border, bg, text }) => (
                <button
                  key={key}
                  onClick={() => setMatchPriority(key)}
                  className={`py-4 px-3 rounded-xl border-2 font-semibold transition-all text-center ${key === "casual" ? "col-span-2" : ""} ${matchPriority === key ? `${border} ${bg} ${text} shadow-sm` : "border-gray-200 text-gray-500 hover:border-purple-200 bg-white"}`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs font-bold leading-tight">{label}</div>
                  <div className={`text-xs mt-1 ${matchPriority === key ? "opacity-80" : "text-gray-400"}`}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: 興味テーマ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</div>
              <label className="text-sm font-semibold text-gray-800">興味のあるテーマ <span className="text-gray-400 font-normal">（複数選択可）</span></label>
            </div>
            <TagSelector options={THEME_OPTIONS} selected={themes} onToggle={t => setThemes(prev => toggleTag(prev, t))} />
          </div>

          {/* Step 2: 関わり方 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</div>
              <label className="text-sm font-semibold text-gray-800">関わり方</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INVOLVEMENT_OPTIONS.map(({ key, label, emoji, sub }) => (
                <button
                  key={key}
                  onClick={() => setInvolvement(key)}
                  className={`py-3 px-3 rounded-xl border font-semibold transition-all text-center ${involvement === key ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 bg-white"}`}
                >
                  <div className="text-lg mb-0.5">{emoji}</div>
                  <div className="text-xs font-bold">{label}</div>
                  <div className={`text-xs mt-0.5 ${involvement === key ? "text-indigo-200" : "text-gray-400"}`}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: スキル */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</div>
              <label className="text-sm font-semibold text-gray-800">あなたのスキル <span className="text-gray-400 font-normal">（複数選択可）</span></label>
            </div>
            <TagSelector options={SKILL_OPTIONS} selected={skills} onToggle={s => setSkills(prev => toggleTag(prev, s))} />
          </div>

          {/* Step 4: 地域イメージ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">4</div>
              <label className="text-sm font-semibold text-gray-800">希望する地域イメージ <span className="text-gray-400 font-normal">（複数選択可）</span></label>
            </div>
            <TagSelector options={IMAGE_OPTIONS} selected={regionImage} onToggle={img => setRegionImage(prev => toggleTag(prev, img))} />
          </div>

          {/* Step 5: 自由記述 */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">5</div>
              <label className="text-sm font-semibold text-gray-800">あなたの思いを自由に <span className="text-gray-400 font-normal">（任意・AIが最重視）</span></label>
            </div>
            <p className="text-xs text-gray-400 mb-3 ml-9">選択肢では伝えきれないこと、背景、気持ちをそのまま書いてください。AIがマッチングに最大限活かします。</p>
            <textarea
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              placeholder={"例：東京の仕事に疲れて、自然の中でもっと人の役に立つことがしたい。農業の経験はないけど、体を動かすのは好き。子どもに本物の自然を見せたい気持ちもある。"}
              rows={4}
              maxLength={400}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all leading-relaxed placeholder:text-gray-300"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-indigo-500 font-medium">✨ 記入するとAIの精度が大幅に上がります</span>
              <span className="text-xs text-gray-300">{freeText.length}/400</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={recommend}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl text-base relative overflow-hidden"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block"/>
                  AIがあなたに合う地域を診断しています...
                </span>
              : <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>Machi Matchを始める</span>
                </span>}
          </button>
          {!loading && (
            <p className="text-center text-xs text-gray-400">
              AI が価値観・スキル・関心を分析して、相性のよい地域を提案します
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
          )}

          {/* Result card — shown only after celebration dismisses */}
          {result && showResult && (
            <MatchResultCard result={result} resultTown={resultTown} onSelectTown={onSelectTown} />
          )}
        </div>

        {/* RIGHT: ダーツの旅 + Google Map (2/5) */}
        <div className="lg:col-span-2">
          <DartsWithMapPanel towns={towns} onSelectTown={onSelectTown} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MYPAGE
// ============================================================
function MyPage({ user, towns, favorites, onToggleFav, scheduledPlans = [], onMarkGoogleAdded }) {
  const favTowns = towns.filter(t => favorites.includes(t.id));
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-5 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border border-white/30">
            {user.name[0]}
          </div>
          <div>
            <div className="font-bold text-xl leading-tight">{user.name}</div>
            <div className="text-sm text-indigo-200 mt-0.5">{user.location.label}</div>
            {user.hometown && <div className="text-xs text-indigo-300 mt-0.5">出身：{user.hometown}</div>}
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {user.skills.map(s => (
            <span key={s} className="text-xs bg-white/15 text-white border border-white/20 px-3 py-1 rounded-full font-medium">{s}</span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["お気に入り", favTowns.length, "自治体"],
          ["活動履歴", user.history.length, "件"],
          ["返礼品", user.history.filter(h => h.giftReceived).length, "個"],
        ].map(([label, val, unit]) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Favorites */}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">お気に入り自治体</div>
        {favTowns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="text-3xl mb-2">🤍</div>
            <div className="text-sm text-gray-400">まだお気に入りはありません</div>
            <div className="text-xs text-gray-300 mt-1">自治体カードのハートマークで追加できます</div>
          </div>
        ) : (
          <div className="space-y-2">
            {favTowns.map(t => {
              const c = sosColor(t.sos_score);
              return (
                <div key={t.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm">
                  <div className={`w-2 h-10 rounded-full ${c.bg} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{t.prefecture} {t.name}</div>
                    <div className="mt-1"><SosBar score={t.sos_score} /></div>
                  </div>
                  <button onClick={() => onToggleFav(t.id)} className="text-xl flex-shrink-0">❤️</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity history */}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">活動履歴</div>
        {user.history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm text-gray-400">まだ活動履歴はありません</div>
          </div>
        ) : (
          <div className="space-y-2">
            {user.history.map((h, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{h.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{h.date}</div>
                    {h.giftReceived && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 font-medium">
                        🎁 返礼品受取済み
                      </div>
                    )}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">参加済み</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Machi Match カレンダー */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Machi Match カレンダー</div>
          {scheduledPlans.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">{scheduledPlans.length}件</span>
          )}
        </div>
        {scheduledPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm text-gray-400">訪問プランがありません</div>
            <div className="text-xs text-gray-300 mt-1">自治体詳細から「📅 訪問プランを作る」で追加できます</div>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledPlans.map(plan => (
              <div key={plan.id} className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
                {plan.imageUrl && (
                  <div className="relative h-20 overflow-hidden">
                    <img src={plan.imageUrl} alt={plan.townName} className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white text-sm font-bold drop-shadow">{plan.prefecture} {plan.townName}</div>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{plan.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{plan.date} · {plan.startTime}〜{plan.endTime}</div>
                      <div className="text-xs text-gray-400">📍 {plan.location}</div>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium flex-shrink-0">確定</span>
                  </div>
                  <div className="space-y-1.5">
                    {plan.planItems.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex gap-2 text-xs text-gray-600">
                        <span className="text-indigo-500 font-semibold w-10 flex-shrink-0">{item.time}</span>
                        <span className="flex-1 truncate">{item.item}</span>
                      </div>
                    ))}
                    {plan.planItems.length > 3 && (
                      <div className="text-xs text-gray-400">他 {plan.planItems.length - 3} 件...</div>
                    )}
                  </div>
                  <a
                    href={plan.googleCalendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onMarkGoogleAdded?.(plan.id)}
                    className={`block text-center text-xs py-2.5 rounded-xl font-medium transition-colors ${plan.addedToGoogleCalendar ? "bg-gray-100 text-gray-500" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                  >
                    {plan.addedToGoogleCalendar ? "✓ Googleカレンダー追加済み" : "📆 Googleカレンダーに追加"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EVENTS PAGE (全国近隣イベント)
// ============================================================
function EventsPage({ towns, userLoc }) {
  const [catFilter, setCatFilter] = useState("all");
  const allEvents = towns.flatMap(t =>
    t.events.map(e => ({
      ...e,
      townName: t.name,
      prefecture: t.prefecture,
      townLat: t.lat,
      townLng: t.lng,
      dist: userLoc ? haversine(userLoc.lat, userLoc.lng, t.lat, t.lng) : null,
    }))
  ).sort((a, b) => {
    if (userLoc && a.dist !== null && b.dist !== null) return a.dist - b.dist;
    return new Date(a.date) - new Date(b.date);
  });

  const filtered = catFilter === "all" ? allEvents : allEvents.filter(e => e.category === catFilter);
  const staffEvents = allEvents.filter(e => e.has_staff_job).length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">全国イベント</div>
        <h2 className="text-2xl font-bold text-gray-900">地域のイベントに参加する</h2>
        {userLoc
          ? <p className="text-sm text-emerald-600 mt-1 font-medium">現在地から近い順に表示中</p>
          : <p className="text-sm text-gray-400 mt-1">スタッフ募集中 {staffEvents}件</p>
        }
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["all","fireworks","festival","culture","sport","nature","other"].map(cat => {
          const ec = EVT_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`text-xs flex-shrink-0 px-3.5 py-1.5 rounded-full border font-medium transition-all ${catFilter === cat ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}
            >
              {cat === "all" ? "すべて" : `${ec.icon} ${ec.label}`}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((evt, i) => {
          const ec = EVT_COLORS[evt.category] || EVT_COLORS.other;
          const df = formatDate(evt.date);
          return (
            <div key={i} className={`bg-white border ${ec.border} rounded-2xl p-4 shadow-sm`}>
              <div className="flex gap-3">
                {df && typeof df === "object" ? (
                  <div className="flex-shrink-0 w-12 text-center bg-gray-50 rounded-xl py-2 border border-gray-100">
                    <div className="text-xs text-gray-400">{df.month}月</div>
                    <div className="text-xl font-bold text-gray-800 leading-tight">{df.day}</div>
                    <div className="text-xs text-gray-400">{df.dow}</div>
                  </div>
                ) : <div className="text-2xl flex-shrink-0 w-10 flex items-center justify-center">{ec.icon}</div>}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span className={`text-xs font-semibold ${ec.text}`}>{ec.label}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{evt.prefecture} {evt.townName}</span>
                    {evt.dist && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">{distanceLabel(evt.dist)}</Badge>}
                    {evt.has_staff_job && <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">スタッフ募集</Badge>}
                    {evt.free && <Badge className="bg-gray-100 text-gray-500">無料</Badge>}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{evt.title}</div>
                  <div className="text-xs text-gray-400">{evt.time} · {evt.location}</div>
                  {evt.has_staff_job && (
                    <div className="mt-2.5 flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                      <div>
                        <div className="text-xs font-semibold text-emerald-700">{evt.job_title}</div>
                        {evt.job_pay && <div className="text-xs text-emerald-600">日給 ¥{evt.job_pay.toLocaleString()}</div>}
                      </div>
                      <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex-shrink-0 ml-2">
                        応募する
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function MachiMatch() {
  const [page, setPage] = useState("map");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("general");
  const [isVerifiedCompany, setIsVerifiedCompany] = useState(false);
  const [user] = useState(MOCK_USER);
  const [userLoc, setUserLoc] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [favorites, setFavorites] = useState(["akita-001"]);
  const [selectedTown, setSelectedTown] = useState(null);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [onlyWithSpot, setOnlyWithSpot] = useState(false);
  const [onlyWithGift, setOnlyWithGift] = useState(false);
  const [travelFilter, setTravelFilter] = useState(0); // 0=off
  const [showDartsModal, setShowDartsModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("recommended");
  const [scheduledPlans, setScheduledPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem("machiMatchPlans") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("machiMatchPlans", JSON.stringify(scheduledPlans));
  }, [scheduledPlans]);

  function addScheduledPlan(plan) {
    setScheduledPlans(prev => [plan, ...prev]);
  }

  function markPlanGoogleAdded(id) {
    setScheduledPlans(prev => prev.map(p => p.id === id ? { ...p, addedToGoogleCalendar: true } : p));
  }

  function toggleFav(id) {
    if (!isLoggedIn) { alert("お気に入りを保存するにはログインが必要です。"); return; }
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  function requestGPS() {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "現在地" });
        setGpsLoading(false);
      },
      () => {
        // Fallback: Tokyo (demo)
        setUserLoc({ lat: 35.6585, lng: 139.7454, label: "東京都 渋谷区（デモ）" });
        setGpsLoading(false);
      },
      { timeout: 5000 }
    );
  }

  let towns = [...TOWNS];
  if (search) towns = towns.filter(t => t.name.includes(search) || t.prefecture.includes(search) || t.issues.some(i => i.includes(search)) || t.strengths.some(s => s.includes(search)));
  if (periodFilter !== "all") towns = towns.filter(t => t.jobs.some(j => j.period === periodFilter));
  if (onlyWithSpot) towns = towns.filter(t => t.jobs.some(j => j.period === "spot"));
  if (onlyWithGift) towns = towns.filter(t => t.gifts.length > 0);
  if (travelFilter > 0 && userLoc) towns = towns.filter(t => haversine(userLoc.lat, userLoc.lng, t.lat, t.lng) / 80 <= travelFilter);
  if (sortOrder === "sos") {
    towns.sort((a, b) => b.sos_score - a.sos_score);
  } else {
    // おすすめ: お気に入り優先 → SOS × 仕事数の複合スコア
    towns.sort((a, b) => {
      const favBoost = (id) => favorites.includes(id) ? 120 : 0;
      const scoreA = favBoost(a.id) + a.sos_score * 0.5 + a.jobs.length * 4;
      const scoreB = favBoost(b.id) + b.sos_score * 0.5 + b.jobs.length * 4;
      return scoreB - scoreA;
    });
  }

  const roleDashboardNav =
    currentRole === "municipality" ? { id: "dashboard", icon: "🏛️", label: "自治体管理" }
    : currentRole === "company" ? { id: "dashboard", icon: "🏢", label: "企業DB" }
    : { id: "dashboard", icon: "⚙️", label: "管理画面" };
  const navItems = currentRole === "general"
    ? [
        { id: "map", icon: "🆘", label: "Machi Help" },
        { id: "events", icon: "🎆", label: "Machi Event" },
        { id: "ai", icon: "✨", label: "Machi Match" },
        { id: "mypage", icon: "👤", label: "マイページ" },
      ]
    : [
        { id: "map", icon: "🆘", label: "Machi Help" },
        { id: "events", icon: "🎆", label: "Machi Event" },
        { id: "ai", icon: "✨", label: "Machi Match" },
        roleDashboardNav,
      ];

  const urgentCount = TOWNS.filter(t => t.sos_score >= 90).length;
  const totalJobs = TOWNS.reduce((acc, t) => acc + t.jobs.length, 0);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (currentRole === "general") {
      if (page === "dashboard") setPage("map");
    } else {
      setPage("dashboard");
    }
  }, [currentRole]);

  useEffect(() => {
    if (!TOWNS.length) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % TOWNS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentTown = TOWNS[currentSlide] || TOWNS[0];
  const slideColor = sosColor(currentTown.sos_score);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif" }}>
      {/* TOP BAR */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
              {/* Match logo: two overlapping circles */}
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <circle cx="7" cy="8" r="6" fill="white" fillOpacity="0.95"/>
                <circle cx="13" cy="8" r="6" fill="white" fillOpacity="0.55"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">Machi Match</span>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={requestGPS}
              className={`text-xs rounded-full border font-medium transition-all whitespace-nowrap ${userLoc ? "bg-emerald-500 border-emerald-400 text-white px-2.5 py-1.5" : "border-gray-200 text-gray-500 hover:border-gray-400 px-2.5 py-1.5"}`}
            >
              <span className="sm:hidden">{gpsLoading ? "…" : "📍"}</span>
              <span className="hidden sm:inline">{gpsLoading ? "取得中..." : userLoc ? "GPS ON" : "現在地"}</span>
            </button>
            <RoleSwitcher currentRole={currentRole} onChange={setCurrentRole} />
            <button
              onClick={() => setIsLoggedIn(p => !p)}
              className={`text-xs px-2.5 py-1.5 rounded-full border font-medium transition-all whitespace-nowrap ${isLoggedIn ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}
            >
              {isLoggedIn ? user.name.split(" ")[0] : "ログイン"}
            </button>
          </div>
        </div>
      </header>

      {/* GPS banner */}
      {userLoc && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-700 text-center font-medium">
          現在地：{userLoc.label} から距離表示中
        </div>
      )}

      {/* Role banner */}
      {currentRole !== "general" && (() => {
        const ri = getRoleInfo(currentRole);
        return (
          <div className={`border-b px-4 py-2 text-xs font-semibold text-center ${ri.badge}`}>
            {ri.emoji} {ri.label} モードで表示中 — 右上のロール切替ボタンで変更できます
          </div>
        );
      })()}

      {/* BODY: sidebar + main */}
      <div className="flex">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-[57px] bottom-0 w-56 bg-white border-r border-gray-100 z-30 pt-4 pb-6 shadow-sm">
          <div className="px-3 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">ナビゲーション</div>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  page === item.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <span className="w-7 flex-shrink-0 flex items-center justify-center text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          {currentRole !== "general" && (() => {
            const ri = getRoleInfo(currentRole);
            return (
              <div className="px-3 mt-auto">
                <div className={`text-xs font-semibold px-3 py-2 rounded-xl border ${ri.badge}`}>
                  {ri.emoji} {ri.label}
                </div>
              </div>
            );
          })()}
        </aside>

      {/* MAIN */}
      <main className="flex-1 lg:ml-56 pb-24 lg:pb-10 min-w-0">
        {/* MAP PAGE */}
        {page === "map" && (
          <div>
            {/* Hero section — photo background with daily visual rotation */}
            <div className="relative w-full overflow-hidden min-h-[280px] sm:min-h-[440px] lg:min-h-[520px]">
              {/* Background: fallback gradient always rendered first */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-800" />
              {/* Background photo — rotates with currentTown */}
              <img
                key={currentSlide}
                src={currentTown.imageUrl}
                alt={currentTown.name}
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                onError={e => { e.target.style.display = "none"; }}
              />
              {/* Dark overlay: stronger on left for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

              {/* Content */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

                  {/* Left: main copy + CTA */}
                  <div className="flex-1 text-white">
                    <div className="text-xs font-semibold text-white/55 uppercase tracking-widest mb-3">Machi Help —</div>
                    <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight mb-4 drop-shadow-md">
                      出かけよう。まちの声を聞きに。
                    </h1>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-lg">
                      あなたの一歩が、まちの力に
                    </p>
                    <div className="flex gap-3 flex-wrap mb-8">
                      <button
                        onClick={requestGPS}
                        className="bg-white text-gray-900 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-md"
                      >
                        近くのまちを見る
                      </button>
                      <button
                        onClick={() => setPage("ai")}
                        className="bg-white/15 text-white font-medium text-sm px-6 py-3 rounded-xl border border-white/30 hover:bg-white/25 transition-colors backdrop-blur-sm"
                      >
                        自分に合う地域を見つける
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-5 max-w-xs sm:max-w-sm">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold">{TOWNS.length}</div>
                        <div className="text-xs text-white/55">参加自治体</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-rose-300">{urgentCount}</div>
                        <div className="text-xs text-white/55">緊急SOS</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold">{totalJobs}</div>
                        <div className="text-xs text-white/55">関わり方</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Today's Regional Art card — PC only */}
                  <div className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                      {/* Card header with dot indicators */}
                      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/15">
                        <div className="text-xs text-white/60 font-semibold uppercase tracking-wider">ピックアップ</div>
                        <div className="flex gap-1 items-center">
                          {TOWNS.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentSlide(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Town photo with fade animation */}
                      <div key={currentSlide} className="relative h-44 overflow-hidden animate-fade-in">
                        <div className={`absolute inset-0 ${slideColor.label === "緊急" ? "bg-gradient-to-br from-red-800 to-rose-700" : "bg-gradient-to-br from-indigo-800 to-purple-700"}`} />
                        <img
                          src={currentTown.imageUrl}
                          alt={currentTown.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/30 to-transparent" />
                        {/* SOS badge */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className={`text-xs ${slideColor.bg} text-white px-2 py-0.5 rounded-full font-bold shadow-sm`}>{slideColor.label}</span>
                        </div>
                        {/* SOS score badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-xs bg-black/40 backdrop-blur-sm text-white/90 border border-white/20 px-2 py-0.5 rounded-full font-semibold">SOS {currentTown.sos_score}</span>
                        </div>
                        {/* Town name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="text-xs text-white/60 mb-0.5">{currentTown.prefecture}</div>
                          <div className="font-bold text-white text-base leading-tight drop-shadow">{currentTown.name}</div>
                        </div>
                      </div>

                      {/* Town info */}
                      <div className="p-3.5 space-y-2.5">
                        {currentTown.catchCopy && (
                          <p className="text-xs text-white/90 font-medium leading-snug">{currentTown.catchCopy}</p>
                        )}
                        {currentTown.issueTags && currentTown.issueTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {currentTown.issueTags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-white/15 border border-white/25 text-white/80 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                        {currentTown.sosSummary && (
                          <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-2.5 py-1.5">
                            <div className="text-xs text-red-300 font-semibold mb-0.5">地域の困りごと</div>
                            <p className="text-xs text-white/75 leading-snug line-clamp-2">{currentTown.sosSummary}</p>
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedTown(currentTown)}
                          className="w-full text-xs bg-white/15 hover:bg-white/28 text-white border border-white/20 py-2 rounded-xl transition-colors font-medium"
                        >
                          この地域の支援募集を見る
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-white/35 mt-2.5 text-center leading-relaxed">地域の魅力と課題を、毎日の入り口に</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Search & filters */}
            <div className="bg-white border-b border-gray-100 sticky top-[57px] z-30 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="市町村名・課題・産業で検索"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {/* 並び替え */}
                  <button
                    onClick={() => setSortOrder("recommended")}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${sortOrder === "recommended" ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-500 hover:border-purple-300"}`}
                  >
                    ✨ おすすめ
                  </button>
                  <button
                    onClick={() => setSortOrder("sos")}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${sortOrder === "sos" ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-500 hover:border-red-300"}`}
                  >
                    🆘 SOS順
                  </button>
                  <div className="w-px bg-gray-200 flex-shrink-0 mx-1" />
                  {["all","spot","short","mid","long"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriodFilter(p)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${periodFilter === p ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}
                    >
                      {p === "all" ? "すべて" : PERIOD_LABELS[p]}
                    </button>
                  ))}
                  <div className="w-px bg-gray-200 flex-shrink-0 mx-1" />
                  <button
                    onClick={() => setOnlyWithSpot(p => !p)}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${onlyWithSpot ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-500 hover:border-orange-300"}`}
                  >
                    単発あり
                  </button>
                  <button
                    onClick={() => setOnlyWithGift(p => !p)}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${onlyWithGift ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-500 hover:border-amber-300"}`}
                  >
                    返礼品あり
                  </button>
                  {userLoc && [1,2,3].map(h => (
                    <button
                      key={h}
                      onClick={() => setTravelFilter(travelFilter === h ? 0 : h)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${travelFilter === h ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-500 hover:border-emerald-300"}`}
                    >
                      〜{h}時間
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency banner */}
            <div className="px-4 sm:px-6 lg:px-8 pt-5">
              <div className="relative bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl px-5 py-4 mb-5 overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">緊急SOS</span>
                      <span className="text-xs text-red-200">今週末</span>
                    </div>
                    <div className="font-bold text-base">福島県 只見町 — SOS 96点</div>
                    <div className="text-xs text-red-200 mt-0.5">雪かきスタッフ 今すぐ必要！日給¥6,000 + 地酒返礼品</div>
                  </div>
                  <button
                    onClick={() => setSelectedTown(TOWNS.find(t => t.id === "fukushima-001"))}
                    className="bg-white text-red-600 text-xs px-4 py-2.5 rounded-xl font-semibold flex-shrink-0 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    詳細 →
                  </button>
                </div>
              </div>
            </div>


            {/* Town grid */}
            <div className="px-4 sm:px-6 lg:px-8 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-700">{towns.length}自治体</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sortOrder === "sos" ? "bg-red-50 text-red-600 border border-red-100" : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
                    {sortOrder === "sos" ? "SOS順" : "おすすめ順"}
                  </span>
                </div>
                {search && <div className="text-xs text-gray-400">「{search}」の検索結果</div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {towns.map((t, i) => (
                  <TownCard
                    key={t.id}
                    town={t}
                    userLoc={userLoc}
                    favorites={favorites}
                    onToggleFav={toggleFav}
                    onClick={setSelectedTown}
                    rank={i + 1}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {page === "events" && <EventsPage towns={TOWNS} userLoc={userLoc} />}
        {page === "ai" && <AIRecommendPage towns={TOWNS} onSelectTown={setSelectedTown} />}

        {/* Role-specific dashboards */}
        {page === "dashboard" && currentRole === "municipality" && (
          <MunicipalityDashboard towns={TOWNS} />
        )}
        {page === "dashboard" && currentRole === "company" && (
          <CompanyDashboard
            isVerifiedCompany={isVerifiedCompany}
            onVerifyToggle={() => setIsVerifiedCompany(p => !p)}
          />
        )}
        {page === "dashboard" && currentRole === "admin" && (
          <AdminDashboard towns={TOWNS} />
        )}

        {page === "mypage" && (
          isLoggedIn
            ? <MyPage user={user} towns={TOWNS} favorites={favorites} onToggleFav={toggleFav} scheduledPlans={scheduledPlans} onMarkGoogleAdded={markPlanGoogleAdded} />
            : (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center max-w-sm mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl mb-5 shadow-sm">👤</div>
                <div className="text-xl font-bold text-gray-900 mb-2">マイページ</div>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">ログインすると、お気に入り自治体・活動履歴・返礼品の管理ができます。</p>
                <button onClick={() => setIsLoggedIn(true)} className="w-full bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                  デモログイン
                </button>
                <p className="text-xs text-gray-300 mt-3">デモ用モックアカウントでログインします</p>
              </div>
            )
        )}
      </main>
      </div>{/* end flex body */}

      {/* BOTTOM NAV (mobile only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center pt-2 pb-3 gap-0.5 transition-all ${page === item.id ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              {page === item.id && <div className="w-6 h-0.5 bg-indigo-600 rounded-full absolute top-0" />}
              <span className={`text-xl leading-none transition-transform ${page === item.id ? "scale-110" : ""}`}>{item.icon}</span>
              <span className={`text-xs leading-none font-medium ${page === item.id ? "text-indigo-600" : "text-gray-400"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* TOWN DETAIL MODAL */}
      {selectedTown && (
        <TownDetail
          town={selectedTown}
          userLoc={userLoc}
          favorites={favorites}
          onToggleFav={toggleFav}
          onClose={() => setSelectedTown(null)}
          isLoggedIn={isLoggedIn}
          onScheduleVisit={addScheduledPlan}
        />
      )}

      {/* DARTS MODAL */}
      {showDartsModal && (
        <DartsModal
          towns={TOWNS}
          onClose={() => setShowDartsModal(false)}
          onSelectTown={(town) => { setSelectedTown(town); }}
        />
      )}
    </div>
  );
}
