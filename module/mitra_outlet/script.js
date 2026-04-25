

// Tangkap ID Pelanggan dari tombol navigasi sebelumnya
// Default ke 4828 jika dibuka langsung (untuk testing)
 pelanggan_id = window.detail_id || 4828; 

var map = null;
var marker = null;
var currentDetailId = null;
 var currentPageOutlet = 1;
 var currentLat = null;
var currentLng = null;

// ==========================================
// 2. INISIALISASI (Tanpa Fungsi Global)
// ==========================================
// ==========================================
// 2. INISIALISASI (SPA Safe)
// ==========================================
function jalankanInisialisasiOutlet() {
    console.log("🚀 Memulai Inisialisasi Titik Outlet...");
    
    // Beri jeda 200ms agar HTML benar-benar sudah disuntikkan ke DOM
    setTimeout(() => {
        const tbody = document.getElementById('tableBody');
        if (tbody) {
            loadTableOutlet(1); // Langsung muat halaman 1
        } else {
            console.error("🔴 Elemen 'tableBody' tidak ditemukan di layar!");
        }
    }, 200);
}


// ==========================================
// 3. FUNGSI FETCH & RENDER TABEL KHUSUS
// ==========================================
async function loadTableOutlet(page = 1) {
    currentPageOutlet = page;
    const tbody = document.getElementById('tableBody');
    
    // Tampilkan state loading di tabel
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">⏳ Memuat data...</td></tr>`;

    try {
        const response = await fetch(`${baseUrl}/table/client_sales_coordinate/${pelanggan_id}/${page}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });

        if (!response.ok) throw new Error('Gagal mengambil data tabel');

        const data = await response.json();
        
        renderTableOutlet(data.tableData || [], page);
        renderPaginationOutlet(data.totalPages, page);

    } catch (error) {
        console.error("Error loading table:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">❌ Gagal memuat data outlet</td></tr>`;
    }
}

function renderTableOutlet(items, page) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500 bg-gray-50">Belum ada titik outlet untuk mitra ini.</td></tr>`;
        return;
    }

    const statusClass = {
        'Menunggu Persetujuan': 'bg-amber-50 text-amber-600 border-amber-200',
        'Diterima': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'Ditolak': 'bg-rose-50 text-rose-600 border-rose-200'
    };

    const perPage = 10; // Asumsi 10 data per halaman dari API
    
    items.forEach((item, index) => {
        const rowNum = (page - 1) * perPage + (index + 1);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition border-b border-gray-100';
        
        tr.innerHTML = `
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
            </td>
           <td class="px-6 py-4 text-center relative">
    <button onclick="event.stopPropagation(); toggleActionDropdown('${item.coordinate_id}')" class="p-2 hover:bg-gray-200 rounded-full transition">
        <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"/></svg>
    </button>
    <div id="dropdown-${item.coordinate_id}" class="action-dropdown hidden absolute right-12 top-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-sm overflow-hidden">
        
        <button onclick="event.stopPropagation(); showDetail('${item.coordinate_id}')" class="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium transition border-b border-gray-50">
            <span>📍</span> Lihat Detail & Map
        </button>

        <button onclick="event.stopPropagation(); sendWhatsAppCoordinate('${item.coordinate_id}')" class="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-green-50 text-green-600 font-medium transition border-b border-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.672.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.373-.025-.521-.075-.148-.672-1.623-.922-2.23-.242-.584-.487-.505-.672-.515l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.08 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 2.112.553 4.062 1.593 5.808L2 22l4.301-1.368A10.002 10.002 0 0 0 12.004 22c5.525 0 10.004-4.479 10.004-9.996C22.008 6.48 17.529 2 12.004 2zm-.002 18.4a8.36 8.36 0 0 1-4.272-1.174l-.306-.182-2.544.812.84-2.482-.198-.317a8.371 8.371 0 1 1 6.48 3.343z"/>
            </svg>
            Kabari via WA
        </button>

        <button onclick="event.stopPropagation(); window.open('https://maps.google.com/?q=${item.lat},${item.lng}', '_blank')" class="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Buka di Maps
        </button>

    </div>
</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPaginationOutlet(totalPages, currentPage) {
    const pag = document.getElementById('pagination');
    pag.innerHTML = '';
    
    if (totalPages <= 1) return;

    // Tombol Prev
    const prevBtn = document.createElement('button');
    prevBtn.className = `px-4 py-1.5 text-sm font-medium border rounded-l-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    prevBtn.innerText = 'Sebelumnya';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => loadTableOutlet(currentPage - 1);
    pag.appendChild(prevBtn);

    // Info Halaman
    const infoSpan = document.createElement('span');
    infoSpan.className = 'px-4 py-1.5 text-sm font-medium border-t border-b bg-white text-gray-700';
    infoSpan.innerText = `Hal ${currentPage} dari ${totalPages}`;
    pag.appendChild(infoSpan);

    // Tombol Next
    const nextBtn = document.createElement('button');
    nextBtn.className = `px-4 py-1.5 text-sm font-medium border rounded-r-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    nextBtn.innerText = 'Selanjutnya';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => loadTableOutlet(currentPage + 1);
    pag.appendChild(nextBtn);
}

// ==========================================
// 4. FUNGSI DETAIL, MAP & STATUS
// ==========================================
// ==========================================
// FUNGSI DETAIL, MAP & STATUS
// ==========================================
async function showDetail(id) {
    currentDetailId = id;
    document.getElementById('modalDetail').classList.remove('hidden');
    
    try {
        Swal.fire({ title: 'Memuat Peta...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        // Load Library Leaflet secara dinamis (jika pakai pendekatan dinamis sebelumnya)
        if (typeof loadLeafletLibrary === 'function') {
            await loadLeafletLibrary();
        }

        // Fetch Detail Coordinate (Sekarang menarik detail & otherCoordinate)
        const response = await fetch(`${baseUrl}/detail/sales_coordinate/${id}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const data = await response.json();
        const detail = data.detail;
        const otherCoordinates = data.otherCoordinate || []; // Ambil array perbandingan

        // Fetch Dropdown Status Master
        const statusRes = await fetch(`${baseUrl}/list/sales_coordinate_status/${owner_id}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const statusData = await statusRes.json();

        // Mapping Data Text ke Modal
        document.getElementById('detNama').innerText = detail.nama || '-';
        document.getElementById('detBooth').innerText = detail.booth_name || '-';
        document.getElementById('detAlamat').innerText = detail.booth_address || '-';
        document.getElementById('detRegion').innerText = detail.region_name || '-';

        // Simpan koordinat global untuk tombol Google Maps
        currentLat = detail.lat;
        currentLng = detail.lng;

        // Mapping Data Dropdown Status
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

        // Jalankan Peta Leaflet dengan melempar data utama DAN data pembanding
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
        map.remove(); // Bersihkan instance map lama
        map = null;
    }

    // Inisialisasi map dasar (tanpa setView dulu, karena akan kita hitung otomatis)
    map = L.map('map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Array untuk menampung semua marker agar bisa di-zoom otomatis (Fit Bounds)
    const allMarkers = [];

    // 1. Buat Marker Utama (Warna MERAH agar mencolok)
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
        .openPopup(); // Otomatis popup terbuka
    
    allMarkers.push(mainMarker);

    // 2. Buat Marker Pembanding (Warna BIRU Bawaan Leaflet)
    if (otherCoordinates.length > 0) {
        otherCoordinates.forEach(coord => {
            const lat = parseFloat(coord.lat);
            const lng = parseFloat(coord.lng);
            
            // Pastikan lat & lng valid (bukan NaN)
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

    // 3. Gabungkan semua marker ke dalam satu "Feature Group" untuk hitung batas (Bounds)
    const group = new L.featureGroup(allMarkers);
    
    // Zoom otomatis agar semua marker terlihat (padding 40px agar tidak terlalu mepet tepi)
    map.fitBounds(group.getBounds(), { padding: [40, 40] });

    // 4. Trik perbaikan ukuran peta di dalam Modal (Paksa render ulang)
    setTimeout(() => {
        if (map) {
            map.invalidateSize(true);
            map.fitBounds(group.getBounds(), { padding: [40, 40] }); // Hitung ulang batas setelah ukuran pas
        }
    }, 400);
}

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
                method: 'PUT', // Ganti POST jika backend hanya menerima POST
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({ status_id: parseInt(statusId) })
            });

            if (response.ok) {
                Swal.fire('Berhasil', 'Status outlet berhasil diperbarui.', 'success').then(() => {
                    closeModal();
                    loadTableOutlet(currentPageOutlet); // Reload tabel di page yang sama
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

function closeModal() {
    document.getElementById('modalDetail').classList.add('hidden');
    if (map) {
        map.remove();
        map = null;
    }
}

// ==========================================
// 5. DROPDOWN HANDLER
// ==========================================
window.toggleActionDropdown = function(id) {
    // Tutup yang lain
    document.querySelectorAll('.action-dropdown').forEach(el => {
        if (el.id !== `dropdown-${id}`) el.classList.add('hidden');
    });
    // Toggle yang diklik
    const dropdown = document.getElementById(`dropdown-${id}`);
    if(dropdown) dropdown.classList.toggle('hidden');
};

// Tutup dropdown jika klik di luar area
document.addEventListener('click', () => {
    document.querySelectorAll('.action-dropdown').forEach(el => el.classList.add('hidden'));
});

// ==========================================
// 6. SEARCH DEBOUNCE (Opsional)
// ==========================================   
window.debounceSearch = function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const keyword = document.getElementById('searchInput').value.toLowerCase();
        // Anda dapat menambahkan logika query param ke loadTableOutlet jika API mendukung search, 
        // misal: loadTableOutlet(1, keyword)
        console.log("Mencari:", keyword);
    }, 500);
};

// ==========================================
// FUNGSI LOAD LIBRARY LEAFLET DINAMIS
// ==========================================
function loadLeafletLibrary() {
    return new Promise((resolve, reject) => {
        // Load CSS jika belum ada
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Load JS jika belum ada
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Gagal memuat Leaflet JS"));
            document.head.appendChild(script);
        } else {
            resolve(); // Sudah ter-load sebelumnya
        }
    });
}

// ==========================================
// FUNGSI KIRIM NOTIFIKASI WHATSAPP
// ==========================================
async function sendWhatsAppCoordinate(targetId = currentDetailId) {
    // Ubah pengecekan menggunakan targetId
    if (!targetId) {
        return Swal.fire('Error', 'Data outlet belum dipilih.', 'error');
    }

    try {
        Swal.fire({ title: 'Menyiapkan Pesan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        // Ubah URL fetch menggunakan targetId
        const resOutlet = await fetch(`${baseUrl}/detail/sales_coordinate/${targetId}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });

        if (!resOutlet.ok) throw new Error("Gagal mengambil data detail outlet");

        const { detail: outletDetail } = await resOutlet.json();
        const { pelanggan_id, nama, booth_name, booth_address, kota, status, business_category } = outletDetail;

        // 2. Ambil data detail client berdasarkan pelanggan_id dari outlet
        const resClient = await fetch(`${baseUrl}/detail/client/${pelanggan_id}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });

        if (!resClient.ok) throw new Error("Gagal mengambil data detail profil mitra");

        const { detail: clientDetail } = await resClient.json();
        
        // Ekstrak dan format nomor WA dari endpoint client
        const rawWa = clientDetail.whatsapp || '';
        const wa = rawWa.replace(/\D/g, '').replace(/^0/, '62');

        if (!wa) {
            Swal.close();
            return Swal.fire('Peringatan', `Nomor WhatsApp untuk mitra ${nama} tidak ditemukan pada profilnya.`, 'warning');
        }

        // 3. Susun teks pesan WA secara dinamis berdasarkan status
        let iconStatus = status === 'Diterima' ? '✅' : (status === 'Ditolak' ? '❌' : '⏳');
        
        let pesan = `Halo *${nama}*,\n\n`;
        pesan += `Berikut adalah informasi terkait pengajuan titik outlet kemitraan Anda:\n\n`;
        pesan += `🏷️ *Kategori:* ${business_category}\n`;
        pesan += `🏪 *Nama Booth:* ${booth_name}\n`;
        pesan += `📍 *Lokasi:* ${booth_address}, ${kota}\n\n`;
        pesan += `Status Pengajuan: ${iconStatus} *${status.toUpperCase()}*\n\n`;

        // Pesan spesifik
        if (status === 'Diterima') {
            pesan += `Selamat! Pengajuan titik outlet Anda telah disetujui. Tim kami akan segera memproses tahap selanjutnya.\n\n`;
        } else if (status === 'Ditolak') {
            pesan += `Mohon maaf, pengajuan titik outlet Anda saat ini belum dapat kami setujui. Silakan hubungi kami untuk info lebih lanjut atau mengajukan lokasi alternatif.\n\n`;
        } else {
            pesan += `Saat ini pengajuan Anda sedang dalam peninjauan. Mohon kesediaannya untuk menunggu kabar selanjutnya.\n\n`;
        }

        pesan += `Terima kasih 🙏`;

        Swal.close();

        // 4. Buka Tab WhatsApp Web / App
        const url = `https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`;
        window.open(url, '_blank');

    } catch (err) {
        console.error("❌ Gagal kirim WA:", err);
        Swal.fire("Error", "Gagal menyiapkan pesan WhatsApp. Periksa koneksi jaringan.", "error");
    }
}

window.openInGoogleMaps = function() {
    if (!currentLat || !currentLng) {
        return Swal.fire('Gagal', 'Koordinat lokasi tidak ditemukan.', 'error');
    }

    // Format URL Google Maps menggunakan URL Search API agar lebih user-friendly
    // URL ini akan membuka pin tepat di koordinat lat,lng
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;
    
    // Buka di tab baru
    window.open(gmapsUrl, '_blank');
};

// Panggil fungsi inisialisasi langsung di baris ini
jalankanInisialisasiOutlet();