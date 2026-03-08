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
    const globalRanking = DataAPI.getGlobalRanking();

    // 初期描画
    UIController.updateClock();
    UIController.updateTime();
    UIController.renderTop3(globalRanking);

    // 地図
    initMap();

    // チャート（少し遅延させてローディングUIが完了してから描画）
    setTimeout(() => {
        renderBubbleChart(globalRanking);
        renderBarRanking(globalRanking, 'all');
        UIController.renderCountryCards();
    }, 300);

    // イベントリスナー
    setupEvents(globalRanking);

    // 時計
    setInterval(() => UIController.updateClock(), 1000);

    // 定期的なカウントのゆらぎ（リアル感）
    setInterval(() => {
        const updated = DataAPI.getGlobalRanking();
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

function setupEvents(globalRanking) {

    // 横棒グラフ カテゴリフィルタ
    document.querySelectorAll('.bcat-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.bcat-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentBarCat = this.dataset.cat;
            renderBarRanking(globalRanking, currentBarCat);
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

    // 地図クリックを受け取ってパネルを更新（openRankPanel内でcurrentRankCodeを更新できるようにラップ）
    const origOpen = UIController.openRankPanel.bind(UIController);
    UIController.openRankPanel = (code) => {
        currentRankCode = code;
        origOpen(code);
    };
}

document.addEventListener('DOMContentLoaded', initApp);
