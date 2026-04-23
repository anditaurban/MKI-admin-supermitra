
MAX_FILES = 10;
 MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
 ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// window.detail_id pada konteks ini adalah business_category_id
window.detail_id = window.detail_id || null; 

 totalCurrentFiles = 0;

// ==========================================
// 2. INISIALISASI HALAMAN
// ==========================================
async function jalankanInisialisasiMedia() {
  if (!window.detail_id) {
    Swal.fire('Error', 'ID Kategori Bisnis tidak ditemukan!', 'error');
    return;
  }

  setTimeout(async () => {
    await fetchDetailMedia(window.detail_id);
  }, 200);
}

// ==========================================
// 3. FETCH DETAIL DATA (GET)
// ==========================================
async function fetchDetailMedia(categoryId) {
  try {
    Swal.fire({ title: 'Memuat Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const response = await fetch(`${baseUrl}/detail/business_category_media/${categoryId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });

    if (!response.ok) throw new Error('Gagal mengambil data kemitraan dari server.');

    const result = await response.json();
    
    if (result && result.detail) {
      const detail = result.detail;
      
      // Isi Header Info
      document.getElementById('infoCategory').innerText = detail.business_category || '-';
      document.getElementById('infoDesc').innerText = detail.description || '-';
      document.getElementById('infoStatus').innerText = detail.status || 'Unknown';

      // Render Media Existing
      renderExistingMedia(detail.media || []);
      Swal.close();
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.message, 'error');
  }
}

// ==========================================
// 4. RENDER MEDIA TERSIMPAN (UPDATE / DELETE)
// ==========================================
// ==========================================
// 4. RENDER MEDIA TERSIMPAN (UPDATE / DELETE)
// ==========================================
function renderExistingMedia(mediaArray) {
  const container = document.getElementById('existingMediaContainer');
  container.innerHTML = '';
  totalCurrentFiles = mediaArray.length;
  updateCounterBadge();

  if (mediaArray.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">Belum ada media tersimpan.</div>`;
    return;
  }

  mediaArray.forEach(item => {
    // Kita biarkan src kosong dulu, lalu dimuat via JS agar bisa disisipkan Token (jika perlu)
    const cardHTML = `
      <div class="existing-media-card flex gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm" data-id="${item.id}">
        <div class="w-32 h-32 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative group flex items-center justify-center">
          
          <div id="loading-${item.id}" class="absolute text-slate-400 text-xs text-center z-0">
            ⏳ Memuat...
          </div>

          <img src="${item.file}" alt="Preview" 
               class="w-full h-full object-cover relative z-10 transition-opacity duration-300" 
               id="preview-existing-${item.id}"
               onerror="this.onerror=null; this.src='https://placehold.co/400x400/f8fafc/94a3b8?text=Gambar+Rusak'; document.getElementById('loading-${item.id}').style.display='none';">
          
          <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold cursor-pointer transition z-20">
            Ganti Gambar
            <input type="file" class="hidden" accept=".png,.jpg,.jpeg,.webp" onchange="handleExistingFileChange(this, ${item.id})">
          </label>
        </div>
        
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Judul Media</label>
            <input type="text" id="title-existing-${item.id}" value="${item.title}" class="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
          </div>
          
          <div class="flex items-center gap-2 mt-3 justify-end">
            <button type="button" onclick="updateSingleMedia(${item.id})" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded border border-blue-200 transition">
              💾 Simpan Ubahan
            </button>
            <button type="button" onclick="deleteSingleMedia(${item.id})" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded border border-red-200 transition">
              🗑 Hapus
            </button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHTML);

    // Coba muat ulang gambar dengan Bearer Token JIKA direct link gagal
    // (Buka komentar kode di bawah jika API /file/ backend Anda butuh Token)
    
    fetchImageWithToken(item.file, `preview-existing-${item.id}`, `loading-${item.id}`);
    
  });
}

// Fungsi tambahan untuk memuat gambar yang diproteksi Token
async function fetchImageWithToken(url, imgId, loaderId) {
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      document.getElementById(imgId).src = imgUrl;
    }
  } catch (err) {
    console.error("Gagal load gambar pakai token:", err);
  } finally {
    const loader = document.getElementById(loaderId);
    if(loader) loader.style.display = 'none';
  }
}

// Handler Preview Gambar Existing
function handleExistingFileChange(input, id) {
  if (!validateFile(input.files[0])) {
    input.value = ""; return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById(`preview-existing-${id}`).src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

// ==========================================
// 5. UPDATE SINGLE MEDIA (PUT)
// ==========================================
async function updateSingleMedia(mediaId) {
  const title = document.getElementById(`title-existing-${mediaId}`).value.trim();
  const fileInput = document.querySelector(`.existing-media-card[data-id="${mediaId}"] input[type="file"]`);
  
  if (!title) {
    Swal.fire('Perhatian', 'Judul media tidak boleh kosong!', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  if (fileInput && fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  }

  Swal.fire({ title: 'Memperbarui...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(`${baseUrl}/update/business_category_media/${mediaId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` },
      body: formData // Mengirim FormData (multipart/form-data)
    });

    if (response.ok) {
      // Tambahkan .then() di akhir Swal
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil', 
        text: 'Media berhasil diperbarui.', 
        timer: 1500, 
        showConfirmButton: false 
      }).then(() => {
        // Baru panggil refresh SETELAH notif sukses hilang
        fetchDetailMedia(window.detail_id); 
      });
    } else {
      const errorData = await response.json();
      Swal.fire('Gagal', errorData.message || 'Gagal memperbarui data.', 'error');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
  }
}

// ==========================================
// 6. DELETE SINGLE MEDIA (DELETE)
// ==========================================
async function deleteSingleMedia(mediaId) {
  const confirm = await Swal.fire({
    title: 'Hapus Media?', text: "Data tidak dapat dikembalikan!", icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, Hapus!'
  });

  if (confirm.isConfirmed) {
    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const response = await fetch(`${baseUrl}/delete/business_category_media/${mediaId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
      });

     if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Media berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          fetchDetailMedia(window.detail_id); // Refresh setelah notif selesai
        });
      } else {
        const errData = await response.json();
        Swal.fire('Gagal', errData.message || 'Gagal menghapus media.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Kesalahan jaringan saat menghapus.', 'error');
    }
  }
}

// ==========================================
// 7. RENDER MEDIA BARU (BATCH INSERT)
// ==========================================
function addMediaRow() {
  const newRowsCount = document.querySelectorAll('.new-media-row').length;
  
  if ((totalCurrentFiles + newRowsCount) >= MAX_FILES) {
    Swal.fire('Maksimal Tercapai', `Maksimal total ${MAX_FILES} file diperbolehkan.`, 'warning');
    return;
  }

  const rowId = Date.now();
  const container = document.getElementById('newMediaContainer');
  
  const rowHTML = `
    <div class="new-media-row flex gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 relative group" id="new-row-${rowId}">
      <button type="button" onclick="removeNewMediaRow(${rowId})" class="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow hover:bg-red-600 transition" title="Batal Tambah">✖</button>
      
      <div class="w-32 h-32 rounded-lg bg-white border-2 border-dashed border-slate-300 overflow-hidden shrink-0 relative flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition" onclick="document.getElementById('file-new-${rowId}').click()">
        <img src="" id="preview-new-${rowId}" class="w-full h-full object-cover hidden absolute inset-0 z-10">
        <span class="text-2xl mb-1 z-0">📁</span>
        <span class="text-[10px] text-slate-500 font-medium z-0 text-center px-1">Klik Pilih Gambar</span>
        <input type="file" id="file-new-${rowId}" class="file-input-new hidden" accept=".png,.jpg,.jpeg,.webp" onchange="handleNewFileChange(this, ${rowId})">
      </div>
      
      <div class="flex-1 flex flex-col justify-center">
        <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Judul Media <span class="text-red-500">*</span></label>
        <input type="text" class="title-input-new w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white" placeholder="Masukkan judul gambar...">
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', rowHTML);
  toggleSaveButton();
  updateCounterBadge();
}

function removeNewMediaRow(rowId) {
  const el = document.getElementById(`new-row-${rowId}`);
  if (el) el.remove();
  toggleSaveButton();
  updateCounterBadge();
}

function handleNewFileChange(input, rowId) {
  if (!input.files || input.files.length === 0) return;
  if (!validateFile(input.files[0])) {
    input.value = ""; return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById(`preview-new-${rowId}`);
    img.src = e.target.result;
    img.classList.remove('hidden');
  };
  reader.readAsDataURL(input.files[0]);
}

// ==========================================
// 8. SIMPAN BATCH MEDIA BARU (POST)
// ==========================================
async function saveNewMediaBatch() {
  const newRows = document.querySelectorAll('.new-media-row');
  if (newRows.length === 0) return;

  const formData = new FormData();
  formData.append('business_category_id', window.detail_id);

  let hasError = false;
  let fileIndex = 0;

  // Sesuai requirement: kirim title[0], title[1] dan file, file secara multiple
  newRows.forEach((row) => {
    const title = row.querySelector('.title-input-new').value.trim();
    const fileInput = row.querySelector('.file-input-new');

    if (!title || fileInput.files.length === 0) {
      hasError = true;
    } else {
      formData.append(`title[${fileIndex}]`, title);
      formData.append('file', fileInput.files[0]); // Menggunakan key 'file' berulang sesuai contoh Postman
      fileIndex++;
    }
  });

  if (hasError) {
    Swal.fire('Lengkapi Data', 'Pastikan semua baris baru memiliki Judul dan Gambar!', 'warning');
    return;
  }

  Swal.fire({ title: 'Menyimpan Media...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(`${baseUrl}/add/business_category_media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }, // Hapus Content-Type agar browser set boundary multipart otomatis
      body: formData
    });

    if (response.ok) {
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil!', 
        text: `${fileIndex} media baru tersimpan.`, 
        timer: 1500, 
        showConfirmButton: false 
      }).then(() => {
        // Bersihkan list dan reload setelah notif sukses selesai
        document.getElementById('newMediaContainer').innerHTML = '';
        toggleSaveButton();
        fetchDetailMedia(window.detail_id); 
      });
    } else {
      const errorData = await response.json();
      Swal.fire('Gagal', errorData.message || 'Gagal menyimpan data.', 'error');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Kesalahan jaringan saat menyimpan.', 'error');
  }
}

// ==========================================
// 9. UTILITAS (VALIDASI & UI STATE)
// ==========================================
function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    Swal.fire('Tipe File Ditolak', 'Hanya diperbolehkan format PNG, JPG, dan WEBP.', 'error');
    return false;
  }
  if (file.size > MAX_SIZE_BYTES) {
    Swal.fire('Ukuran Terlalu Besar', 'Maksimal ukuran file adalah 5 GB.', 'error');
    return false;
  }
  return true;
}

function updateCounterBadge() {
  const newRowsCount = document.querySelectorAll('.new-media-row').length;
  const total = totalCurrentFiles + newRowsCount;
  const badge = document.getElementById('mediaCountBadge');
  if(badge) badge.innerText = `${total} / ${MAX_FILES} Media`;
  
  if (total >= MAX_FILES) {
    badge.classList.remove('bg-slate-100', 'text-slate-600');
    badge.classList.add('bg-red-100', 'text-red-600');
  } else {
    badge.classList.remove('bg-red-100', 'text-red-600');
    badge.classList.add('bg-slate-100', 'text-slate-600');
  }
}

function toggleSaveButton() {
  const newRowsCount = document.querySelectorAll('.new-media-row').length;
  const btn = document.getElementById('btnSaveNewMedia');
  if (newRowsCount > 0) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}

// ==========================================
// 10. TRIGGER SCRIPT AWAL
// ==========================================
jalankanInisialisasiMedia();