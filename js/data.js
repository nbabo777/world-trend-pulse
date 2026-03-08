/* =====================================================
   data.js — 各国トレンドワードデータ（言及数・ランキング）
   ===================================================== */

// カテゴリ定義
const CAT = { geo: '地政学', econ: '経済', tech: '技術', social: '社会' };
const CAT_COLOR = { geo: '#f97316', econ: '#22d3ee', tech: '#a855f7', social: '#34d399' };

// ===== 各国トレンドワードデータ =====
// count = 言及数（24時間で収集されたニュース記事・SNS投稿の該当ワード数）
const COUNTRY_TRENDS = {
    US: {
        name: "アメリカ", flag: "🇺🇸", score: 92,
        trends: [
            { word: "AI regulation", count: 48200, cat: "tech", trend: "up", rank: 1 },
            { word: "tariff war", count: 41800, cat: "econ", trend: "up", rank: 2 },
            { word: "NVIDIA earnings", count: 38500, cat: "tech", trend: "up", rank: 3 },
            { word: "Fed rate cut", count: 35100, cat: "econ", trend: "down", rank: 4 },
            { word: "Ukraine aid", count: 29700, cat: "geo", trend: "up", rank: 5 },
            { word: "immigration bill", count: 26300, cat: "social", trend: "st", rank: 6 },
            { word: "semiconductor", count: 23800, cat: "tech", trend: "up", rank: 7 },
            { word: "recession risk", count: 21400, cat: "econ", trend: "down", rank: 8 },
            { word: "healthcare reform", count: 18900, cat: "social", trend: "st", rank: 9 },
            { word: "Bitcoin ETF", count: 16500, cat: "econ", trend: "up", rank: 10 },
        ]
    },
    JP: {
        name: "日本", flag: "🇯🇵", score: 78,
        trends: [
            { word: "日銀利上げ", count: 42100, cat: "econ", trend: "up", rank: 1 },
            { word: "円安・ドル円", count: 38700, cat: "econ", trend: "up", rank: 2 },
            { word: "AI投資", count: 31200, cat: "tech", trend: "up", rank: 3 },
            { word: "春闘・賃上げ", count: 28400, cat: "social", trend: "up", rank: 4 },
            { word: "防衛費増額", count: 24100, cat: "geo", trend: "st", rank: 5 },
            { word: "物価上昇", count: 21800, cat: "econ", trend: "down", rank: 6 },
            { word: "半導体株", count: 19500, cat: "tech", trend: "up", rank: 7 },
            { word: "訪日外客", count: 17200, cat: "social", trend: "up", rank: 8 },
            { word: "少子化対策", count: 14800, cat: "social", trend: "st", rank: 9 },
            { word: "台湾有事", count: 12600, cat: "geo", trend: "up", rank: 10 },
        ]
    },
    CN: {
        name: "中国", flag: "🇨🇳", score: 85,
        trends: [
            { word: "DeepSeek AI", count: 61300, cat: "tech", trend: "up", rank: 1 },
            { word: "对美贸易战", count: 52800, cat: "geo", trend: "up", rank: 2 },
            { word: "房地产危机", count: 44100, cat: "econ", trend: "down", rank: 3 },
            { word: "经济刺激政策", count: 37600, cat: "econ", trend: "up", rank: 4 },
            { word: "人民币汇率", count: 31200, cat: "econ", trend: "st", rank: 5 },
            { word: "新能源汽车", count: 28700, cat: "tech", trend: "up", rank: 6 },
            { word: "台湾问题", count: 25400, cat: "geo", trend: "up", rank: 7 },
            { word: "消费复苏", count: 21900, cat: "social", trend: "st", rank: 8 },
            { word: "芯片自主研发", count: 19300, cat: "tech", trend: "up", rank: 9 },
            { word: "中美关系", count: 16800, cat: "geo", trend: "up", rank: 10 },
        ]
    },
    DE: {
        name: "ドイツ", flag: "🇩🇪", score: 67,
        trends: [
            { word: "Ukraine Krieg", count: 38400, cat: "geo", trend: "up", rank: 1 },
            { word: "Rezession", count: 33200, cat: "econ", trend: "up", rank: 2 },
            { word: "AI-Regulierung", count: 27600, cat: "tech", trend: "up", rank: 3 },
            { word: "Energiekrise", count: 23100, cat: "econ", trend: "down", rank: 4 },
            { word: "Wahl 2025", count: 21800, cat: "social", trend: "up", rank: 5 },
            { word: "E-Auto Markt", count: 18500, cat: "tech", trend: "st", rank: 6 },
            { word: "Inflation", count: 15400, cat: "econ", trend: "down", rank: 7 },
            { word: "Migration", count: 13200, cat: "social", trend: "up", rank: 8 },
        ]
    },
    GB: {
        name: "イギリス", flag: "🇬🇧", score: 61,
        trends: [
            { word: "AI regulation", count: 29800, cat: "tech", trend: "up", rank: 1 },
            { word: "inflation rate", count: 25400, cat: "econ", trend: "down", rank: 2 },
            { word: "Ukraine support", count: 21700, cat: "geo", trend: "st", rank: 3 },
            { word: "housing crisis", count: 18900, cat: "social", trend: "up", rank: 4 },
            { word: "NHS funding", count: 16200, cat: "social", trend: "st", rank: 5 },
            { word: "Brexit impact", count: 13800, cat: "geo", trend: "down", rank: 6 },
            { word: "BoE rate hold", count: 11500, cat: "econ", trend: "st", rank: 7 },
        ]
    },
    IN: {
        name: "インド", flag: "🇮🇳", score: 82,
        trends: [
            { word: "AI investment", count: 44700, cat: "tech", trend: "up", rank: 1 },
            { word: "tariff war", count: 38100, cat: "econ", trend: "up", rank: 2 },
            { word: "IT sector growth", count: 32500, cat: "tech", trend: "up", rank: 3 },
            { word: "Modi economy", count: 27800, cat: "econ", trend: "st", rank: 4 },
            { word: "Pakistan tension", count: 23400, cat: "geo", trend: "up", rank: 5 },
            { word: "startup funding", count: 19100, cat: "econ", trend: "up", rank: 6 },
            { word: "inflation India", count: 15600, cat: "econ", trend: "down", rank: 7 },
        ]
    },
    AU: {
        name: "オーストラリア", flag: "🇦🇺", score: 55,
        trends: [
            { word: "AI regulation", count: 21200, cat: "tech", trend: "up", rank: 1 },
            { word: "China trade", count: 18700, cat: "econ", trend: "st", rank: 2 },
            { word: "interest rates", count: 15400, cat: "econ", trend: "st", rank: 3 },
            { word: "housing market", count: 13900, cat: "social", trend: "up", rank: 4 },
            { word: "climate policy", count: 11200, cat: "social", trend: "up", rank: 5 },
        ]
    },
    KR: {
        name: "韓国", flag: "🇰🇷", score: 74,
        trends: [
            { word: "HBM 메모리", count: 39800, cat: "tech", trend: "up", rank: 1 },
            { word: "AI 반도체", count: 34200, cat: "tech", trend: "up", rank: 2 },
            { word: "대미 무역", count: 28700, cat: "econ", trend: "up", rank: 3 },
            { word: "환율 불안", count: 24100, cat: "econ", trend: "up", rank: 4 },
            { word: "북한 도발", count: 20500, cat: "geo", trend: "st", rank: 5 },
            { word: "삼성 실적", count: 17300, cat: "econ", trend: "st", rank: 6 },
            { word: "저출산", count: 14600, cat: "social", trend: "up", rank: 7 },
        ]
    },
    FR: {
        name: "フランス", flag: "🇫🇷", score: 59,
        trends: [
            { word: "Ukraine guerre", count: 31200, cat: "geo", trend: "up", rank: 1 },
            { word: "IA réglementation", count: 26800, cat: "tech", trend: "up", rank: 2 },
            { word: "inflation France", count: 22400, cat: "econ", trend: "down", rank: 3 },
            { word: "réforme retraite", count: 19100, cat: "social", trend: "st", rank: 4 },
            { word: "nucléaire énergie", count: 15800, cat: "econ", trend: "up", rank: 5 },
            { word: "Macron politique", count: 13200, cat: "social", trend: "st", rank: 6 },
        ]
    },
    BR: {
        name: "ブラジル", flag: "🇧🇷", score: 52,
        trends: [
            { word: "taxa selic", count: 28400, cat: "econ", trend: "st", rank: 1 },
            { word: "IA no Brasil", count: 23100, cat: "tech", trend: "up", rank: 2 },
            { word: "guerra comercial", count: 19800, cat: "econ", trend: "up", rank: 3 },
            { word: "real desvaloriza", count: 16500, cat: "econ", trend: "up", rank: 4 },
            { word: "segurança pública", count: 14200, cat: "social", trend: "st", rank: 5 },
        ]
    },
    CA: {
        name: "カナダ", flag: "🇨🇦", score: 58,
        trends: [
            { word: "US tariff threat", count: 34600, cat: "econ", trend: "up", rank: 1 },
            { word: "AI investment", count: 26800, cat: "tech", trend: "up", rank: 2 },
            { word: "housing crisis", count: 22100, cat: "social", trend: "up", rank: 3 },
            { word: "immigration cap", count: 18700, cat: "social", trend: "st", rank: 4 },
            { word: "oil prices", count: 15300, cat: "econ", trend: "down", rank: 5 },
        ]
    },
    RU: {
        name: "ロシア", flag: "🇷🇺", score: 80,
        trends: [
            { word: "Украина война", count: 53200, cat: "geo", trend: "up", rank: 1 },
            { word: "санкции запада", count: 44700, cat: "econ", trend: "up", rank: 2 },
            { word: "нефть цена", count: 35100, cat: "econ", trend: "st", rank: 3 },
            { word: "ИИ технологии", count: 28400, cat: "tech", trend: "up", rank: 4 },
            { word: "переговоры мир", count: 24800, cat: "geo", trend: "up", rank: 5 },
        ]
    },
};

// ===== グローバルランキング（全国の言及数を集計） =====
function buildGlobalRanking() {
    const map = {};
    Object.entries(COUNTRY_TRENDS).forEach(([code, data]) => {
        data.trends.forEach(t => {
            // 英語ワードのみ集計（多言語は同じカテゴリとしてまとめる）
            const key = t.word;
            if (!map[key]) {
                map[key] = { word: t.word, count: 0, cat: t.cat, trend: t.trend, countries: [] };
            }
            map[key].count += t.count;
            map[key].countries.push(code);
        });
    });

    return Object.values(map)
        .sort((a, b) => b.count - a.count)
        .map((item, i) => ({ ...item, globalRank: i + 1 }));
}

// ===== 共通ワード検出（複数国で登場するワード） =====
function findSharedWords() {
    const wordCountries = {};
    Object.entries(COUNTRY_TRENDS).forEach(([code, data]) => {
        data.trends.forEach(t => {
            if (!wordCountries[t.word]) wordCountries[t.word] = new Set();
            wordCountries[t.word].add(code);
        });
    });
    return Object.entries(wordCountries)
        .filter(([, s]) => s.size >= 2)
        .map(([word]) => word);
}

// ===== ISO3 → コード マッピング =====
const ISO3_TO_CODE = {
    USA: 'US', JPN: 'JP', CHN: 'CN', DEU: 'DE', GBR: 'GB',
    IND: 'IN', AUS: 'AU', BRA: 'BR', KOR: 'KR', FRA: 'FR',
    CAN: 'CA', RUS: 'RU', SGP: 'SG',
};

// ===== 国スコアから色を返す =====
function scoreToColor(score, alpha = 0.85) {
    // 0-100 → 青〜紫のグラデーション（熱量）
    if (score >= 80) return `rgba(249,115,22,${alpha})`;   // hot orange
    if (score >= 65) return `rgba(234,179,8,${alpha})`;    // yellow
    if (score >= 50) return `rgba(59,130,246,${alpha})`;   // blue
    if (score >= 35) return `rgba(100,116,139,${alpha})`;  // slate
    return `rgba(30,42,60,${alpha})`;                       // dim
}

// ===== Data API =====
const DataAPI = {
    getCountry: (code) => COUNTRY_TRENDS[code] || null,
    getAllCountries: () => COUNTRY_TRENDS,
    getGlobalRanking: () => buildGlobalRanking(),
    getSharedWords: () => findSharedWords(),
    getCompareCountries: () => ['US', 'JP', 'CN', 'DE', 'GB', 'IN'],
    isoToCode: (iso3) => ISO3_TO_CODE[iso3] || null,
    scoreToColor,
    catColor: (cat) => CAT_COLOR[cat] || '#8899bb',
};
