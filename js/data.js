/* =====================================================
   data.js — 各国トレンドワードデータ（言及数・ランキング）
   ===================================================== */

// カテゴリ定義
const CAT = { geo: '地政学', econ: '経済', tech: '技術', social: '社会' };
const CAT_COLOR = { geo: '#f97316', econ: '#22d3ee', tech: '#a855f7', social: '#34d399' };

// ===== 各国トレンドワードデータ =====
// count = 言及数（24時間で収集されたニュース記事・SNS投稿の該当ワード数）
let COUNTRY_TRENDS = {};

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
    loadData: async () => {
        try {
            const res = await fetch('data.json?v=' + new Date().getTime());
            if (res.ok) {
                COUNTRY_TRENDS = await res.json();
            } else {
                console.warn('data.json could not be loaded');
            }
        } catch (e) {
            console.error('Network error loading data.json', e);
        }
    },
    getCountry: (code) => COUNTRY_TRENDS[code] || null,
    getAllCountries: () => COUNTRY_TRENDS,
    getGlobalRanking: () => buildGlobalRanking(),
    getSharedWords: () => findSharedWords(),
    getCompareCountries: () => ['US', 'JP', 'CN', 'DE', 'GB', 'IN'],
    isoToCode: (iso3) => ISO3_TO_CODE[iso3] || null,
    scoreToColor,
    catColor: (cat) => CAT_COLOR[cat] || '#8899bb',
};
