// ==========================================
// 1. KONFIGURASI GLOBAL MODULE
// ==========================================
pagemodule = 'TitikOutlet';

// SET DATA TYPE - Sesuaikan value ini dengan logic endpoint tabel di app.js Anda
// Contoh jika backend global me-request: {{baseUrl}}/table/sales_coordinate/...
if (typeof setDataType === 'function') {
    setDataType('sales_coordinate'); 
}

var map = null;
var marker = null;
var currentDetailId = null;
var currentLat = null;
var currentLng = null;

// ==========================================
// 2. TEMPLATE BARIS TABEL (GLOBAL)
// ==========================================
window.rowTemplate = function (item, index, perPage = 10) {
    // Ambil halaman saat ini untuk kalkulasi nomor yang akurat
    const dataType = window.dataType || 'sales_coordinate';
    const currentPage = window.state && window.state[dataType] ? window.state[dataType].currentPage : 1;
    const rowNum = (currentPage - 1) * perPage + (index + 1);

    const statusClass = {
        'Menunggu Persetujuan': 'bg-amber-50 text-amber-600 border-amber-200',
        'Diterima': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'Ditolak': 'bg-rose-50 text-rose-600 border-rose-200'
    };

    return `
        <tr class="hover:bg-gray-50 transition border-b border-gray-100">
            <td class="px-6 py-4 text-center text-gray-400 font-mono text-xs">${rowNum}</td>
            <td class="px-6 py-4">
                <div class="font-bold text-gray-800">${item.nama || '-'}</div>
                <div class="text-[10px] text-blue-500 font-bold uppercase tracking-wider">${item.business_category || '-'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-gray-700 font-medium">${item.booth_name || '-'}</div>
                <div class="text-[11px] text-gray-400 truncate max-w-[200px]">${item.booth_address || '-'}</div>
            </td>
            <td class="px-6 py-4 text-gray-500 text-xs">
                ${item.kelurahan || '-'}, ${item.kecamatan || '-'}
            </td>
            <td class="px-6 py-4 text-center">
                <span class="px-2 py-1 rounded-full border text-[10px] font-bold ${statusClass[item.status] || 'bg-gray-50 text-gray-600'}">
                    ${item.status || 'Unknown'}
                </span>
                <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
               
                
                
                    <button onclick="event.stopPropagation(); showDetail('${item.coordinate_id}')" class="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium transition border-b border-gray-50">
                        <span>📍</span> Lihat Detail & Map
                    </button>
                    <button onclick="event.stopPropagation(); sendWhatsAppCoordinate('${item.coordinate_id}')" class="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-green-50 text-green-600 font-medium transition border-b border-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.672.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.373-.025-.521-.075-.148-.672-1.623-.922-2.23-.242-.584-.487-.505-.672-.515l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.08 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 2.112.553 4.062 1.593 5.808L2 22l4.301-1.368A10.002 10.002 0 0 0 12.004 22c5.525 0 10.004-4.479 10.004-9.996C22.008 6.48 17.529 2 12.004 2zm-.002 18.4a8.36 8.36 0 0 1-4.272-1.174l-.306-.182-2.544.812.84-2.482-.198-.317a8.371 8.371 0 1 1 6.48 3.343z"/></svg>
                        Kabari via WA
                    </button>
                    <button onclick="event.stopPropagation(); window.open('https://maps.google.com/?q=${item.lat},${item.lng}', '_blank')" class="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Buka di Maps
                    </button>
                
            </div>
            </td>
            
        </tr>
    `;
};

// ==========================================
// 3. TRIGGER LOAD TABEL (MEMANGGIL FUNGSI GLOBAL)
// ==========================================
setTimeout(() => {
    if (typeof fetchAndUpdateData === 'function') {
        fetchAndUpdateData(); 
    }
}, 200);

// ==========================================
// 4. FUNGSI LEAFLET, MAP & STATUS UPDATE
// ==========================================
async function showDetail(id) {
    currentDetailId = id;
    document.getElementById('modalDetail').classList.remove('hidden');
    
    try {
        Swal.fire({ title: 'Memuat Peta...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        if (typeof loadLeafletLibrary === 'function') {
            await loadLeafletLibrary();
        }

        const response = await fetch(`${baseUrl}/detail/sales_coordinate/${id}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const data = await response.json();
        const detail = data.detail;
        const otherCoordinates = data.otherCoordinate || []; 

        const statusRes = await fetch(`${baseUrl}/list/sales_coordinate_status/${owner_id}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const statusData = await statusRes.json();

        document.getElementById('detNama').innerText = detail.nama || '-';
        document.getElementById('detBooth').innerText = detail.booth_name || '-';
        document.getElementById('detAlamat').innerText = detail.booth_address || '-';
        document.getElementById('detRegion').innerText = detail.region_name || '-';

        currentLat = detail.lat;
        currentLng = detail.lng;

        const select = document.getElementById('statusSelect');
        select.innerHTML = '';
        if(statusData.listData) {
            statusData.listData.forEach(st => {
                const opt = document.createElement('option');
                opt.value = st.status_id;
                opt.text = st.status;
                opt.selected = (st.status_id === detail.status_id);
                select.appendChild(opt);
            });
        }

        initMap(parseFloat(detail.lat), parseFloat(detail.lng), detail.booth_name, otherCoordinates);
        Swal.close();
    } catch (err) {
        console.error("Gagal load detail map:", err);
        Swal.fire('Error', 'Gagal memuat data detail outlet dari server.', 'error');
    }
}

function initMap(mainLat, mainLng, mainLabel, otherCoordinates = []) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (map !== null) {
        map.remove();
        map = null;
    }

    map = L.map('map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const allMarkers = [];

    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const mainMarker = L.marker([mainLat, mainLng], { icon: redIcon }).addTo(map)
        .bindPopup(`
            <div class="text-center">
                <span class="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">📍 Titik Pengajuan</span>
                <b class="text-sm">${mainLabel || 'Lokasi Utama'}</b>
            </div>
        `)
        .openPopup(); 
    
    allMarkers.push(mainMarker);

    if (otherCoordinates.length > 0) {
        otherCoordinates.forEach(coord => {
            const lat = parseFloat(coord.lat);
            const lng = parseFloat(coord.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
                const otherMarker = L.marker([lat, lng]).addTo(map)
                    .bindPopup(`
                        <div class="text-center">
                            <span class="text-[10px] font-bold text-blue-500 uppercase block mb-1">🏪 Outlet Lain</span>
                            <b>${coord.booth_name}</b><br/>
                            <span class="text-xs text-gray-500">${coord.nama}</span>
                        </div>
                    `);
                allMarkers.push(otherMarker);
            }
        });
    }

    const group = new L.featureGroup(allMarkers);
    map.fitBounds(group.getBounds(), { padding: [40, 40] });

    setTimeout(() => {
        if (map) {
            map.invalidateSize(true);
            map.fitBounds(group.getBounds(), { padding: [40, 40] });
        }
    }, 400);
}

// ==========================================
// 5. STATUS UPDATE & WHATSAPP
// ==========================================
async function saveStatusUpdate() {
    const statusId = document.getElementById('statusSelect').value;

    const confirm = await Swal.fire({
        title: 'Update Status?',
        text: "Persetujuan titik outlet akan diubah",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Update',
        cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
        Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            const response = await fetch(`${baseUrl}/update/sales_coordinate_status/${currentDetailId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({ status_id: parseInt(statusId) })
            });

            if (response.ok) {
                Swal.fire('Berhasil', 'Status outlet berhasil diperbarui.', 'success').then(() => {
                    closeModal();
                    // Karena jadi halaman utama, kita panggil fungsi pembaruan tabel global
                    if (typeof fetchAndUpdateData === 'function') {
                        fetchAndUpdateData();
                    }
                });
            } else {
                const errData = await response.json();
                Swal.fire('Gagal', errData.message || 'Gagal update status di server', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
        }
    }
}

async function sendWhatsAppCoordinate(targetId = currentDetailId) {
    if (!targetId) return Swal.fire('Error', 'Data outlet belum dipilih.', 'error');

    try {
        Swal.fire({ title: 'Menyiapkan Pesan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const resOutlet = await fetch(`${baseUrl}/detail/sales_coordinate/${targetId}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });

        if (!resOutlet.ok) throw new Error("Gagal mengambil data detail outlet");

        const { detail: outletDetail } = await resOutlet.json();
        const { pelanggan_id, nama, booth_name, booth_address, kota, status, business_category } = outletDetail;

        const resClient = await fetch(`${baseUrl}/detail/client/${pelanggan_id}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });

        if (!resClient.ok) throw new Error("Gagal mengambil profil mitra");

        const { detail: clientDetail } = await resClient.json();
        const wa = (clientDetail.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');

        if (!wa) {
            Swal.close();
            return Swal.fire('Peringatan', `Nomor WhatsApp untuk mitra ${nama} tidak ditemukan.`, 'warning');
        }

        let iconStatus = status === 'Diterima' ? '✅' : (status === 'Ditolak' ? '❌' : '⏳');
        let pesan = `Halo *${nama}*,\n\nBerikut adalah informasi terkait pengajuan titik outlet kemitraan Anda:\n\n🏷️ *Kategori:* ${business_category}\n🏪 *Nama Booth:* ${booth_name}\n📍 *Lokasi:* ${booth_address}, ${kota}\n\nStatus Pengajuan: ${iconStatus} *${status.toUpperCase()}*\n\n`;

        if (status === 'Diterima') pesan += `Selamat! Pengajuan Anda disetujui.\n\n`;
        else if (status === 'Ditolak') pesan += `Mohon maaf, pengajuan Anda saat ini belum disetujui.\n\n`;
        else pesan += `Pengajuan Anda sedang dalam peninjauan.\n\n`;

        pesan += `Terima kasih 🙏`;

        Swal.close();
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`, '_blank');
    } catch (err) {
        Swal.fire("Error", "Gagal menyiapkan pesan WhatsApp.", "error");
    }
}

window.openInGoogleMaps = function() {
    if (!currentLat || !currentLng) return Swal.fire('Gagal', 'Koordinat lokasi tidak ditemukan.', 'error');
    window.open(`https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`, '_blank');
};

function loadLeafletLibrary() {
    return new Promise((resolve, reject) => {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link'); link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve(); script.onerror = () => reject();
            document.head.appendChild(script);
        } else resolve();
    });
}

// ==========================================
// 6. UTILS (DROPDOWN, MODAL, DLL)
// ==========================================
window.toggleActionDropdown = function(id) {
    document.querySelectorAll('.action-dropdown').forEach(el => {
        if (el.id !== `dropdown-${id}`) el.classList.add('hidden');
    });
    const dropdown = document.getElementById(`dropdown-${id}`);
    if(dropdown) dropdown.classList.toggle('hidden');
};

document.addEventListener('click', () => {
    document.querySelectorAll('.action-dropdown').forEach(el => el.classList.add('hidden'));
});

function closeModal() {
    document.getElementById('modalDetail').classList.add('hidden');
    if (map) { map.remove(); map = null; }
}

window.debounceSearch = function() {
    // Fungsi ini biasanya sudah terikat di global jika menggunakan fetchAndUpdateData
    // Tetap dibiarkan jika aplikasi Anda memiliki logika custom debounce di lokal
};