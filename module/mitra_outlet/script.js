

// Tangkap ID Pelanggan dari tombol navigasi sebelumnya
// Default ke 4828 jika dibuka langsung (untuk testing)
 pelanggan_id = window.detail_id || 4828; 

 map = null;
 marker = null;
 currentDetailId = null;
 currentPageOutlet = 1;

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
                    <button onclick="showDetail('${item.coordinate_id}')" class="block w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium transition">
                        📍 Lihat Detail & Map
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
async function showDetail(id) {
    currentDetailId = id;
    document.getElementById('modalDetail').classList.remove('hidden');
    
    try {
        Swal.fire({ title: 'Memuat Peta...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        await loadLeafletLibrary();

        // Fetch Detail Coordinate
        const response = await fetch(`${baseUrl}/detail/sales_coordinate/${id}`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const data = await response.json();
        const detail = data.detail;

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

        // Jalankan Peta Leaflet
        initMap(parseFloat(detail.lat), parseFloat(detail.lng), detail.booth_name);

        Swal.close();
    } catch (err) {
        console.error("Gagal load detail map:", err);
        Swal.fire('Error', 'Gagal memuat data detail outlet dari server.', 'error');
    }
}

function initMap(lat, lng, label) {
    if (map !== null) {
        map.remove(); // Bersihkan instance map lama jika modal dibuka ulang
    }

    map = L.map('map').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${label || 'Lokasi Outlet'}</b>`)
        .openPopup();

    // Trik wajib Leaflet di dalam Modal: Re-calculate size setelah modal terbuka penuh
    setTimeout(() => {
        map.invalidateSize();
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

// Panggil fungsi inisialisasi langsung di baris ini
jalankanInisialisasiOutlet();