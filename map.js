// تهيئة الخريطة في وسط مصراتة
var map = L.map('map').setView([32.374, 15.092], 13);

// إضافة طبقة الخريطة
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// تجميع العلامات
var markersCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true
});

// ألوان وأيقونات الفئات (استخدام رموز تعبيرية)
var categoryIcons = {
    restaurants: { emoji: '🍽️', color: '#fbbf24' }, // ذهبي
    hotels: { emoji: '🏨', color: '#1e3a8a' },      // أزرق
    resorts: { emoji: '🏝️', color: '#10b981' }      // أخضر
};

// حفظ جميع العلامات
var allMarkers = [];

// دالة لإنشاء أيقونة مخصصة أكبر
function createCustomIcon(category) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${categoryIcons[category].color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">${categoryIcons[category].emoji}</div>`,
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });
}

// محتوى النافذة المنبثقة
function getPopupContent(item, category) {
    let content = `<strong>${item.name}</strong><br>`;
    
    if (category === 'restaurants') {
        content += `📍 ${item.address || 'غير متوفر'}<br>`;
        content += `📞 ${item.phone || 'غير متوفر'}<br>`;
        if (item.facebook) {
            content += `<a href="${item.facebook}" target="_blank">📱 صفحة فيسبوك</a><br>`;
        }
    } else if (category === 'hotels') {
        content += `🏨 ${item.classification || ''}<br>`;
        content += `🛏️ غرف: ${item.rooms || 'غير متوفر'}<br>`;
        content += `📞 ${item.phone || 'غير متوفر'}<br>`;
        if (item.website) {
            content += `<a href="http://${item.website}" target="_blank">🌐 الموقع الإلكتروني</a><br>`;
        }
    } else if (category === 'resorts') {
        content += `🏝️ ${item.classification || ''}<br>`;
        content += `🏠 شاليهات: ${item.chalets || 'غير متوفر'}<br>`;
        content += `📞 ${item.phone || 'غير متوفر'}<br>`;
        if (item.beach) content += `🏖️ شاطئ: نعم<br>`;
    }
    
    content += `<a href="https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}" target="_blank">🗺️ الاتجاهات</a>`;
    
    return content;
}

// إضافة العلامات
function addMarkers() {
    for (let category in misrataData) {
        misrataData[category].forEach(item => {
            let marker = L.marker([item.lat, item.lng], {
                icon: createCustomIcon(category)
            });
            
            marker.category = category;
            marker.itemData = item;
            marker.bindPopup(getPopupContent(item, category));
            
            allMarkers.push(marker);
            markersCluster.addLayer(marker);
        });
    }
    map.addLayer(markersCluster);
}

// تصفية العلامات
function filterMarkers(category) {
    markersCluster.clearLayers();
    
    let filteredMarkers = category === 'all' ? allMarkers : allMarkers.filter(m => m.category === category);
    filteredMarkers.forEach(m => markersCluster.addLayer(m));
    
    updateItemsList(category);
}

// تحديث القائمة الجانبية
function updateItemsList(category) {
    let listDiv = document.getElementById('items-list');
    let countSpan = document.getElementById('count');
    
    let filtered = category === 'all' ? allMarkers : allMarkers.filter(m => m.category === category);
    countSpan.innerText = filtered.length;
    
    listDiv.innerHTML = '';
    filtered.forEach(marker => {
        let item = marker.itemData;
        let card = document.createElement('div');
        card.className = 'item-card';
        
        let details = '';
        if (marker.category === 'restaurants') {
            details = `<p>🍽️ ${item.address || ''}</p><p>📞 ${item.phone || ''}</p>`;
        } else if (marker.category === 'hotels') {
            details = `<p>🏨 ${item.classification || ''}</p><p>🛏️ ${item.rooms || ''} غرفة</p><p>📞 ${item.phone || ''}</p>`;
        } else if (marker.category === 'resorts') {
            details = `<p>🏝️ ${item.classification || ''}</p><p>🏠 ${item.chalets || ''} شاليه</p><p>📞 ${item.phone || ''}</p>`;
        }
        
        card.innerHTML = `
            <h4>${item.name}</h4>
            ${details}
            <button onclick="map.flyTo([${item.lat}, ${item.lng}], 16); marker.openPopup();">🔍 عرض على الخريطة</button>
        `;
        listDiv.appendChild(card);
    });
}

// أزرار التصفية
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterMarkers(this.dataset.category);
    });
});

// بدء التشغيل
window.onload = function() {
    addMarkers();
    filterMarkers('all');
};
