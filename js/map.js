/* =====================================================
   map.js — Leaflet.js ベースの世界地図（バブルマップ）
   ===================================================== */

let leafletMap = null;
let bgLayer = null; // 背景としての地図層
let bubbleLayer = null; // バブルマーカーの親レイヤー

function initMap() {
    leafletMap = L.map('map', {
        center: [20, 10], zoom: 2,
        minZoom: 1.5, maxZoom: 5,
        zoomControl: true,
        attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 20,
    }).addTo(leafletMap);

    bubbleLayer = L.layerGroup().addTo(leafletMap);

    loadGeoJSON();
}

function loadGeoJSON() {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
        .then(r => r.json())
        .then(data => {
            // 背景レイヤー（色は一律で非常に薄く、インタラクションなし）
            bgLayer = L.geoJSON(data, {
                style: {
                    fillColor: 'rgba(20,30,48,0.3)',
                    fillOpacity: 0.3,
                    color: 'rgba(255,255,255,0.05)',
                    weight: 0.5,
                },
                interactive: false // 背景はクリック等に反応しない
            }).addTo(leafletMap);

            // バブルレイヤーの生成
            renderBubbles(data);
        })
        .catch(() => renderFallbackMarkers());
}

// 各国の代表点（必要に応じて微調整）
const CUSTOM_POSITIONS = {
    US: [38, -97], JP: [36, 138], CN: [35, 105], DE: [51, 10],
    GB: [54, -2], IN: [20, 78], AU: [-25, 133], BR: [-15, -55],
    KR: [37, 128], FR: [46, 2], CA: [56, -96], RU: [62, 90],
};

function renderBubbles(geoData) {
    bubbleLayer.clearLayers();

    // 取得できている国のデータリスト
    const allData = DataAPI.getAllCountries();

    // geoJSONから各国の中心点（おおまか）を計算するか、カスタム座標を使う
    geoData.features.forEach(feature => {
        const iso3 = feature.properties?.ADM0_A3 || feature.properties?.ISO_A3 || '';
        const code = DataAPI.isoToCode(iso3);
        const data = code ? allData[code] : null;

        if (data) {
            const name = feature.properties?.ADMIN || feature.properties?.NAME || 'Unknown';
            // カスタム座標があれば優先、なければポリゴンの最初の座標群から適当な中心を使う
            let latlng = CUSTOM_POSITIONS[code];
            if (!latlng) {
                // GeoJSONの簡単な重心計算（厳密ではないが中央付近）
                const coords = feature.geometry.coordinates;
                let c = coords[0];
                if (feature.geometry.type === 'MultiPolygon') c = coords[0][0];
                // とりあえず1つ目のポイントを使う（かなり適当になる可能性があるため、主要国はCUSTOM_POSITIONSを推奨）
                latlng = [c[0][1], c[0][0]];
            }

            const color = DataAPI.scoreToColor(data.score, 0.9);
            // スコアを元にバブルの半径を決定
            const radius = 10 + (data.score * 0.25);

            const marker = L.circleMarker(latlng, {
                radius: radius,
                fillColor: color,
                fillOpacity: 0.8,
                color: 'rgba(255,255,255,0.3)', // 枠線
                weight: 1.5,
                code: code // カスタムプロパティとして保存
            });

            bindBubbleEvents(marker, name, data, code);
            marker.addTo(bubbleLayer);
        }
    });

    // CUSTOM_POSITIONS にあるが geoData にマッチしなかったものを補完
    Object.keys(CUSTOM_POSITIONS).forEach(code => {
        if (!allData[code]) return;
        // すでにbubbleLayerにあるかチェック
        let exists = false;
        bubbleLayer.eachLayer(l => { if (l.options.code === code) exists = true; });
        if (!exists) {
            const data = allData[code];
            const name = data.name;
            const latlng = CUSTOM_POSITIONS[code];
            const color = DataAPI.scoreToColor(data.score, 0.9);
            const radius = 10 + (data.score * 0.25);

            const marker = L.circleMarker(latlng, {
                radius: radius,
                fillColor: color,
                fillOpacity: 0.8,
                color: 'rgba(255,255,255,0.3)',
                weight: 1.5,
                code: code
            });
            bindBubbleEvents(marker, name, data, code);
            marker.addTo(bubbleLayer);
        }
    });
}

function bindBubbleEvents(marker, name, data, code) {
    const defaultColor = marker.options.fillColor;
    marker.on({
        mousemove: (e) => {
            marker.setStyle({ weight: 3, color: '#fff', fillOpacity: 1 });
            marker.bringToFront();
            showMapTooltip(e, name, data);
        },
        mouseout: () => {
            marker.setStyle({ weight: 1.5, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.8 });
            hideMapTooltip();
        },
        click: () => {
            if (data && code) UIController.openRankPanel(code);
        },
    });
}

function showMapTooltip(e, name, data) {
    const tt = document.getElementById('mapTooltip');
    const mapEl = document.getElementById('map');
    if (!tt || !mapEl) return;

    const rect = mapEl.getBoundingClientRect();
    const x = e.originalEvent.clientX - rect.left;
    const y = e.originalEvent.clientY - rect.top;

    tt.style.left = x + 'px';
    tt.style.top = y + 'px';
    tt.classList.remove('hidden');

    if (data) {
        const top3 = data.trends.slice(0, 3);
        document.getElementById('ttFlag').textContent = data.flag;
        document.getElementById('ttName').textContent = data.name;
        document.getElementById('ttTop1').textContent = `#1 ${top3[0]?.word || '--'}`;
        document.getElementById('ttCount').textContent = `言及数: ${top3[0]?.count?.toLocaleString() || '--'}`;
        document.getElementById('ttWords').innerHTML = top3.map(t =>
            `<span class="tt-tag" style="background:${DataAPI.catColor(t.cat)}33;color:${DataAPI.catColor(t.cat)}">${t.word}</span>`
        ).join('');
    } else {
        document.getElementById('ttFlag').textContent = '';
        document.getElementById('ttName').textContent = name;
        document.getElementById('ttTop1').textContent = 'データなし';
        document.getElementById('ttCount').textContent = '';
        document.getElementById('ttWords').innerHTML = '';
    }
}

function hideMapTooltip() {
    const tt = document.getElementById('mapTooltip');
    if (tt) tt.classList.add('hidden');
}

// フォールバック（ネットワークエラー時など）
function renderFallbackMarkers() {
    bubbleLayer.clearLayers();
    Object.entries(CUSTOM_POSITIONS).forEach(([code, pos]) => {
        const data = DataAPI.getCountry(code);
        if (!data) return;
        const color = DataAPI.scoreToColor(data.score, 0.9);
        const marker = L.circleMarker(pos, {
            radius: 10 + (data.score * 0.25),
            fillColor: color, color: 'rgba(255,255,255,.3)',
            weight: 1.5, fillOpacity: 0.8, code: code
        });
        bindBubbleEvents(marker, data.name, data, code);
        marker.addTo(bubbleLayer);
    });
}

// バブルのハイライト機能
function highlightCountriesOnWordClick(countries) {
    if (!bubbleLayer) return;

    resetMapHighlight();

    if (countries && countries.length > 0) {
        bubbleLayer.eachLayer(marker => {
            if (countries.includes(marker.options.code)) {
                // ハイライト
                marker.setStyle({ weight: 3, color: '#fff', fillOpacity: 1, radius: marker.options.radius + 4 });
                marker.bringToFront();
            } else {
                // 暗くする
                marker.setStyle({ fillOpacity: 0.2, color: 'rgba(255,255,255,0.05)', weight: 0.5 });
            }
        });
    }
}

function resetMapHighlight() {
    if (bubbleLayer) {
        bubbleLayer.eachLayer(marker => {
            marker.setStyle({
                weight: 1.5,
                color: 'rgba(255,255,255,0.3)',
                fillOpacity: 0.8,
                // もとの半径に戻すためにスコアから再計算
                radius: 10 + (DataAPI.getCountry(marker.options.code)?.score * 0.25 || 0)
            });
        });
    }
}
