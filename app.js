const API_KEY = 'GBNB9WQ8-GBNB-GBNB-GBNB-GBNB9WQ8FR';
const NAEPO_CENTER = [36.6588, 126.6728];
const ZOOM_LEVEL = 15;

// 범죄주의구간 레이어 리스트 (사용자 요청 순서대로)
const CRIME_CATEGORIES = [
    { id: 'IF_0087_WMS', name: '전체' },
    { id: 'IF_0084_WMS', name: '절도' },
    { id: 'IF_0085_WMS', name: '성폭력' },
    { id: 'IF_0086_WMS', name: '강도' },
    { id: 'IF_0083_WMS', name: '폭력' },
    { id: 'IF_0081_WMS', name: '어린이대상범죄' }
];

let map;
let currentLayer = null;

// 지도 초기화
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView(NAEPO_CENTER, ZOOM_LEVEL);

    // 기본 배경지도 (밝고 컬러풀한 OpenStreetMap 기본 지도)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    renderMenu();
}

// 메뉴 렌더링
function renderMenu() {
    const menuList = document.getElementById('menuList');
    CRIME_CATEGORIES.forEach(category => {
        const item = document.createElement('div');
        item.className = 'menu-item';
        item.innerHTML = `<span>${category.name}</span>`;
        item.onclick = () => selectCategory(category.id, item);
        menuList.appendChild(item);
    });
}

// 카테고리 선택 및 레이어 업데이트
function selectCategory(layerId, element) {
    // UI 업데이트
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // 기존 레이어 제거
    if (currentLayer) {
        map.removeLayer(currentLayer);
    }

    // Safemap API 커스텀 타일 레이어 (범죄주의구간)
    const SafemapLayer = L.TileLayer.extend({
        getTileUrl: function (coords) {
            const tileBounds = this._tileCoordsToBounds(coords);
            const southWest = L.CRS.EPSG3857.project(tileBounds.getSouthWest());
            const northEast = L.CRS.EPSG3857.project(tileBounds.getNorthEast());
            const bbox = `${southWest.x},${southWest.y},${northEast.x},${northEast.y}`;

            return `http://safemap.go.kr/openapi2/${layerId}?serviceKey=${API_KEY}&srs=EPSG:3857&bbox=${bbox}&format=image/png&width=256&height=256&transparent=TRUE`;
        }
    });

    currentLayer = new SafemapLayer('', {
        opacity: 0.7,
        tileSize: 256
    }).addTo(map);
}

// 페이지 로드 시 시작
window.onload = initMap;
