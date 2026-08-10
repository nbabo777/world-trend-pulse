/* =====================================================
   main.js — アプリエントリーポイント
   ===================================================== */

const LOADING_SOURCES = [
    'Reuters API...', 'BBC News...', 'NHK Web...', '新浪财经...',
    'Google Trends...', 'Wikipedia Trending...', 'Twitter/X API...',
    'Reddit Hot...', 'Bloomberg...', '集計中...',
];

async function initApp() {
    // ローディングアニメーション
    animateLoading();

    // データ取得
    await DataAPI.loadData();
    // 初期描画
    UIController.updateClock();
    UIController.updateTime();
    refreshDashboard();

    // 地図
    initMap();

    // チャート（少し遅延させてローディングUIが完了してから描画）
    setTimeout(() => {
        refreshDashboard();
    }, 300);

    // イベントリスナー
    setupEvents();

    // 時計
    setInterval(() => UIController.updateClock(), 1000);

    // 定期的なカウントのゆらぎ（リアル感）
    setInterval(() => {
        const updated = DataAPI.getGlobalRanking(getRankingMode());
        UIController.renderTop3(updated);
        renderBarRanking(updated, currentBarCat);
    }, 12000);
}

// ============ ローディングアニメーション ============
function animateLoading() {
    const fill = document.getElementById('loadingFill');
    const overlay = document.getElementById('loadingOverlay');
    const srcEl = document.getElementById('loadingSources');
    if (!fill || !overlay) return;

    let idx = 0;
    const steps = [10, 25, 42, 58, 72, 85, 96, 100];
    let si = 0;

    const tick = () => {
        if (si >= steps.length) {
            setTimeout(() => overlay.classList.add('done'), 400);
            return;
        }
        fill.style.width = steps[si] + '%';
        if (srcEl && idx < LOADING_SOURCES.length) {
            srcEl.textContent = LOADING_SOURCES[idx++];
        }
        si++;
        setTimeout(tick, 180 + Math.random() * 180);
    };
    setTimeout(tick, 100);
}

// ============ イベント設定 ============
let currentBarCat = 'all';
let currentRankCode = null;
let currentRankingMode = 'curated';

function getRankingMode() {
    return currentRankingMode;
}

function refreshDashboard() {
    const globalRanking = DataAPI.getGlobalRanking(getRankingMode());
    UIController.renderTop3(globalRanking);
    renderBubbleChart(globalRanking);
    renderBarRanking(globalRanking, currentBarCat);
    UIController.renderCountryCards();
    if (currentRankCode) UIController.openRankPanel(currentRankCode);
}

function setupEvents() {

    // 横棒グラフ カテゴリフィルタ
    document.querySelectorAll('.bcat-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.bcat-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentBarCat = this.dataset.cat;
            renderBarRanking(DataAPI.getGlobalRanking(getRankingMode()), currentBarCat);
        });
    });

    // 国別パネル カテゴリタブ
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (currentRankCode) {
                UIController.filterRankByCat(currentRankCode, this.dataset.cat);
            }
        });
    });

    document.querySelectorAll('.rank-mode-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            currentRankingMode = this.dataset.mode;
            document.querySelectorAll('.rank-mode-btn').forEach(b => b.classList.toggle('active', b === this));
            refreshDashboard();
        });
    });

    // 地図クリックを受け取ってパネルを更新（openRankPanel内でcurrentRankCodeを更新できるようにラップ）
    const origOpen = UIController.openRankPanel.bind(UIController);
    UIController.openRankPanel = (code) => {
        currentRankCode = code;
        origOpen(code);
    };
}

document.addEventListener('DOMContentLoaded', initApp);
