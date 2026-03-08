/* =====================================================
   ui.js — UIコントローラー（パネル、ヘッダー、カード）
   ===================================================== */

let currentCatFilter = 'all';

const UIController = {

    // ===== ヘッダー TOP3 ワード =====
    renderTop3(globalRanking) {
        const top3 = globalRanking.slice(0, 3);
        top3.forEach((item, i) => {
            const el = document.getElementById(`top3-${i + 1}`);
            if (!el) return;
            el.querySelector('.top3-word').textContent = item.word;
            el.querySelector('.top3-count').textContent = item.count.toLocaleString() + ' mentions';
        });

        const totalEl = document.getElementById('totalWords');
        if (totalEl) {
            const total = globalRanking.reduce((s, d) => s + d.count, 0);
            totalEl.textContent = `${total.toLocaleString()} 件収集済み`;
        }
    },

    // ===== 時計 =====
    updateClock() {
        const el = document.getElementById('headerClock');
        if (!el) return;
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        el.textContent = `JST ${h}:${m}:${s}`;
    },

    // ===== 更新時刻 =====
    updateTime() {
        const el = document.getElementById('updateTime');
        if (!el) return;
        const now = new Date();
        el.textContent = `最終更新: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    },

    // ===== 国別ランキングパネル =====
    openRankPanel(code) {
        const data = DataAPI.getCountry(code);
        if (!data) return;

        document.getElementById('rankPlaceholder').style.display = 'none';
        const content = document.getElementById('rankContent');
        content.className = 'rank-shown';

        document.getElementById('rankCountryName').textContent = `${data.flag} ${data.name}`;

        currentCatFilter = 'all';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));

        this._renderRankList(data.trends, 'all');
        renderMiniDonut(data.trends);
    },

    _renderRankList(trends, catFilter) {
        const filtered = catFilter === 'all' ? trends : trends.filter(t => t.cat === catFilter);
        const maxCount = filtered[0]?.count || 1;
        const trendIcon = { up: '↑', down: '↓', st: '→' };
        const trendCls = { up: 'trend-up', down: 'trend-dn', st: 'trend-st' };

        const listEl = document.getElementById('rankList');
        if (!listEl) return;

        listEl.innerHTML = filtered.map((item, i) => {
            const pct = Math.round((item.count / maxCount) * 100);
            const color = DataAPI.catColor(item.cat);
            const isTop3 = i < 3;
            const delay = i * 50;
            return `
        <div class="rank-item" style="animation-delay:${delay}ms">
          <span class="ri-rank ${isTop3 ? 'top3' : ''}">#${i + 1}</span>
          <div class="ri-cat-dot" style="background:${color}"></div>
          <span class="ri-word" style="color:${isTop3 ? '#fff' : '#cbd5e1'}">${item.word}</span>
          <span class="ri-trend ${trendCls[item.trend]}">${trendIcon[item.trend]}</span>
          <div class="ri-bar-wrap">
            <div class="ri-bar" style="width:${pct}%;background:${color};transition-delay:${delay}ms"></div>
          </div>
          <span class="ri-count" style="color:${color}">${item.count.toLocaleString()}</span>
        </div>
      `;
        }).join('');
    },

    // ===== カテゴリフィルタ変更 =====
    filterRankByCat(code, cat) {
        currentCatFilter = cat;
        const data = DataAPI.getCountry(code);
        if (!data) return;
        this._renderRankList(data.trends, cat);
    },

    // ===== 国別比較カード =====
    renderCountryCards() {
        const codes = DataAPI.getCompareCountries();
        const sharedWords = DataAPI.getSharedWords();
        const container = document.getElementById('countryCards');
        if (!container) return;

        container.innerHTML = codes.map(code => {
            const data = DataAPI.getCountry(code);
            if (!data) return '';
            const top5 = data.trends.slice(0, 5);

            const wordRows = top5.map((t, i) => {
                const isShared = sharedWords.includes(t.word);
                const color = DataAPI.catColor(t.cat);
                return `
          <div class="cc-word-item ${isShared ? 'is-shared' : ''}">
            <span class="cc-word-rank">#${i + 1}</span>
            <span class="cc-word-text" style="color:${isShared ? '' : color}">${t.word}</span>
            <span class="cc-word-count">${(t.count / 1000).toFixed(0)}K</span>
          </div>
        `;
            }).join('');

            const scoreColor = DataAPI.scoreToColor(data.score);
            return `
        <div class="country-card" style="border-top: 3px solid ${scoreColor}">
          <div class="cc-header">
            <span class="cc-flag">${data.flag}</span>
            <div>
              <div class="cc-name">${data.name}</div>
            </div>
          </div>
          <div class="cc-word-list">${wordRows}</div>
        </div>
      `;
        }).join('');
    },
};
