// تهيئة الخريطة في وسط مصراتة
var map = L.map('map').setView([32.374, 15.092], 13);

// إضافة طبقة الخريطة (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// تجميع العلامات لتجنب الازدحام
var markersCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true
});

var categoryColors = {
    restaurants: '#fbbf24', // ذهبي
    hotels: '#1e3a8a',      // أزرق داكن
    resorts: '#10b981'      // أخضر (للتباين) أو يمكن جعله ذهبي آخر
};
// حفظ جميع العلامات للتصفية
var allMarkers = [];

// دوال مساعدة لإنشاء محتوى النافذة المنبثقة حسب الفئة
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
    
    // إضافة زر الاتجاهات
    content += `<a href="https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}" target="_blank">🗺️ الاتجاهات</a>`;
    
    return content;
}

// إضافة جميع العلامات من البيانات
function addMarkers() {
    for (let category in misrataData) {
        misrataData[category].forEach(item => {
            // إنشاء رمز مخصص
            let marker = L.marker([item.lat, item.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${categoryColors[category]}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [20, 20]
                })
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

// تصفية العلامات حسب الفئة
function filterMarkers(category) {
    markersCluster.clearLayers();
    
    let filteredMarkers = [];
    if (category === 'all') {
        filteredMarkers = allMarkers;
    } else {
        filteredMarkers = allMarkers.filter(m => m.category === category);
    }
    
    filteredMarkers.forEach(m => markersCluster.addLayer(m));
    
    // تحديث القائمة الجانبية
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
            details = `<p>📍 ${item.address || ''}</p><p>📞 ${item.phone || ''}</p>`;
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

// ربط أزرار التصفية
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterMarkers(this.dataset.category);
    });
});

// بدء التطبيق
window.onload = function() {
    addMarkers();
    filterMarkers('all');
};