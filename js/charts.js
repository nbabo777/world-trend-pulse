/* =====================================================
   charts.js — バブルチャート・横棒グラフ・ドーナツ
   ===================================================== */

Chart.defaults.color = '#8899bb';
Chart.defaults.font.family = "'Inter', sans-serif";

let bubbleChartInst = null;
let miniDonutInst = null;

// ============ グローバルバブルチャート ============
function renderBubbleChart(globalRanking) {
    const canvas = document.getElementById('bubbleChart');
    if (!canvas) return;

    if (bubbleChartInst) { bubbleChartInst.destroy(); bubbleChartInst = null; }

    const top20 = globalRanking.slice(0, 20);
    const maxCount = top20[0]?.count || 1;

    // カテゴリ別にデータセット分割
    const cats = ['geo', 'econ', 'tech', 'social'];
    const catLabels = { geo: '地政学', econ: '経済', tech: '技術', social: '社会' };
    const catColors = { geo: '#f97316', econ: '#22d3ee', tech: '#a855f7', social: '#34d399' };

    // 散布座2D配置（x=ランク, y=ランダムY軸クラスタリング）
    const catYBase = { geo: 70, econ: 50, tech: 30, social: 15 };

    const datasets = cats.map(cat => {
        const items = top20.filter(d => d.cat === cat);
        return {
            label: catLabels[cat],
            data: items.map(d => ({
                x: d.globalRank,
                y: catYBase[cat] + (Math.random() - 0.5) * 12,
                r: Math.max(5, Math.round((d.count / maxCount) * 30)),
                word: d.word,
                count: d.count,
                countries: d.countries,
            })),
            backgroundColor: catColors[cat] + 'bb',
            borderColor: catColors[cat],
            borderWidth: 1.5,
        };
    });

    bubbleChartInst = new Chart(canvas, {
        type: 'bubble',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 10, padding: 10, font: { size: 10 } },
                },
                tooltip: {
                    backgroundColor: 'rgba(12,16,24,.97)',
                    borderColor: 'rgba(99,179,237,.3)',
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => {
                            const d = ctx.raw;
                            return [
                                ` ${d.word}`,
                                ` 言及数: ${d.count.toLocaleString()}`,
                                ` 国数: ${d.countries?.length || 1}カ国`,
                            ];
                        },
                        title: () => '',
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'グローバルランク →', font: { size: 9 }, color: '#3d4f6e' },
                    grid: { color: 'rgba(255,255,255,.03)' },
                    ticks: { font: { size: 9 }, color: '#3d4f6e' },
                    border: { display: false },
                },
                y: {
                    display: false,
                    min: 0, max: 90,
                }
            }
        }
    });
}

// ============ 横棒ランキング（カスタムDOM） ============
function renderBarRanking(globalRanking, catFilter = 'all') {
    const container = document.getElementById('barRankList');
    if (!container) return;

    const filtered = catFilter === 'all'
        ? globalRanking
        : globalRanking.filter(d => d.cat === catFilter);

    const top30 = filtered.slice(0, 30);
    const maxCount = top30[0]?.count || 1;

    const trendIcon = { up: '↑', down: '↓', st: '→' };
    const trendCls = { up: 'trend-up', down: 'trend-dn', st: 'trend-st' };

    container.innerHTML = top30.map((item, i) => {
        const pct = Math.round((item.count / maxCount) * 100);
        const color = DataAPI.catColor(item.cat);
        const flags = item.countries.map(c => COUNTRY_TRENDS[c]?.flag || '').join('');
        const delay = i * 40;
        const cList = JSON.stringify(item.countries).replace(/"/g, "'");
        return `
      <div class="bar-item" style="animation-delay:${delay}ms; cursor:pointer;" onclick="highlightCountriesOnWordClick(${cList})">
        <span class="bar-rank">#${i + 1}</span>
        <span class="bar-word" style="color:${color}">${item.word}</span>
        <div class="bar-outer">
          <div class="bar-inner" style="width:${pct}%;background:${color}44;border-left:2px solid ${color};transition-delay:${delay}ms">
            <span class="bar-val">${item.count.toLocaleString()}</span>
          </div>
        </div>
        <span class="bar-flags">${flags}</span>
        <span class="bar-trend ${trendCls[item.trend]}">${trendIcon[item.trend]}</span>
      </div>
    `;
    }).join('');
}

// ============ ミニドーナツ（カテゴリ分布） ============
function renderMiniDonut(trends) {
    const canvas = document.getElementById('miniDonut');
    if (!canvas) return;
    if (miniDonutInst) { miniDonutInst.destroy(); miniDonutInst = null; }

    const counts = { geo: 0, econ: 0, tech: 0, social: 0 };
    trends.forEach(t => { if (counts[t.cat] !== undefined) counts[t.cat] += t.count; });

    miniDonutInst = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['地政学', '経済', '技術', '社会'],
            datasets: [{
                data: [counts.geo, counts.econ, counts.tech, counts.social],
                backgroundColor: ['#f9731666', '#22d3ee66', '#a855f766', '#34d39966'],
                borderColor: ['#f97316', '#22d3ee', '#a855f7', '#34d399'],
                borderWidth: 1.5,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 8, padding: 6, font: { size: 9 } }
                },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()}` }
                }
            }
        }
    });
}
