/* =====================================================
   map.js — Leaflet.js ベースの世界地図（スコア強度カラー）
   ===================================================== */

let leafletMap = null;
let geoLayer = null;

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

    loadGeoJSON();
}

function loadGeoJSON() {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
        .then(r => r.json())
        .then(data => {
            geoLayer = L.geoJSON(data, {
                style: feature => styleCountry(feature),
                onEachFeature: (feature, layer) => bindCountryEvents(feature, layer),
            }).addTo(leafletMap);
        })
        .catch(() => renderFallbackMarkers());
}

function styleCountry(feature) {
    const iso3 = feature.properties?.ADM0_A3 || feature.properties?.ISO_A3 || '';
    const code = DataAPI.isoToCode(iso3);
    const data = code ? DataAPI.getCountry(code) : null;

    if (!data) {
        return { fillColor: 'rgba(20,30,48,0.6)', fillOpacity: 0.5, color: 'rgba(255,255,255,0.06)', weight: 0.3 };
    }
    return {
        fillColor: DataAPI.scoreToColor(data.score, 0.8),
        fillOpacity: 0.82,
        color: 'rgba(255,255,255,0.15)',
        weight: 0.6,
    };
}

function bindCountryEvents(feature, layer) {
    const iso3 = feature.properties?.ADM0_A3 || feature.properties?.ISO_A3 || '';
    const code = DataAPI.isoToCode(iso3);
    const data = code ? DataAPI.getCountry(code) : null;
    const name = feature.properties?.ADMIN || feature.properties?.NAME || 'Unknown';

    layer.on({
        mousemove: (e) => {
            layer.setStyle({ weight: data ? 2 : 0.6, color: data ? '#fff' : 'rgba(255,255,255,.2)', fillOpacity: data ? 1 : 0.6 });
            showMapTooltip(e, name, data);
        },
        mouseout: () => {
            if (geoLayer) geoLayer.resetStyle(layer);
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
    const x = e.originalEvent.clientX - rect.left + 14;
    const y = e.originalEvent.clientY - rect.top - 14;

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

// フォールバック: 円マーカー
function renderFallbackMarkers() {
    const positions = {
        US: [38, -97], JP: [36, 138], CN: [35, 105], DE: [51, 10],
        GB: [54, -2], IN: [20, 78], AU: [-25, 133], BR: [-15, -55],
        KR: [37, 128], FR: [46, 2], CA: [56, -96], RU: [62, 90],
    };

    Object.entries(positions).forEach(([code, pos]) => {
        const data = DataAPI.getCountry(code);
        if (!data) return;
        const color = DataAPI.scoreToColor(data.score);

        const marker = L.circleMarker(pos, {
            radius: 16 + data.score / 20,
            fillColor: color, color: 'rgba(255,255,255,.3)',
            weight: 1, fillOpacity: 0.85,
        }).addTo(leafletMap);

        marker.bindTooltip(`<b>${data.flag} ${data.name}</b><br>#1: ${data.trends[0]?.word}<br>${data.trends[0]?.count?.toLocaleString()} mentions`, {
            direction: 'top', className: 'leaflet-dark-tooltip',
        });
        marker.on('click', () => UIController.openRankPanel(code));
    });
}
