
// Kosongkan (null) untuk mode TAMBAH, atau isi ID (misal: 1) untuk mode UPDATE
// Biarkan variabel ini menangkap ID yang dikirim dari fungsi loadModuleContent
window.detail_id = window.detail_id || null;

// ==========================================
// 2. INISIALISASI HALAMAN UTAMA (SPA SAFE)
// ==========================================
async function jalankanInisialisasiCourse() {
    console.log("🚀 Menjalankan Inisialisasi Course...");
    
    // Memberikan jeda 200ms agar HTML benar-benar sudah di-render oleh DOM
    setTimeout(async () => {
        // 1. Load Dropdown Kategori Bisnis terlebih dahulu
        await fetchBusinessCategories();

        // 2. Cek Mode berdasarkan keberadaan window.detail_id
        const formTitle = document.getElementById("formTitle");
        const btnSubmitForm = document.getElementById("btnSubmitForm");

        if (window.detail_id) {
            // --- MODE UPDATE ---
            if(formTitle) formTitle.innerText = "UPDATE COURSE TOPIC";
            if(btnSubmitForm) btnSubmitForm.innerHTML = "💾 Update Course";
            
            // Load data detail berdasarkan ID
            await loadDetailCourse(window.detail_id);
        } else {
            // --- MODE TAMBAH ---
            if(formTitle) formTitle.innerText = "CREATE NEW COURSE TOPIC";
            if(btnSubmitForm) btnSubmitForm.innerHTML = "💾 Publish Course";
            
            // Render minimal 1 baris video kosong untuk form baru
            window.addVideoRow(); 
        }
    }, 200); 
}

// ==========================================
// 3. FUNGSI GET KATEGORI BISNIS (DROPDOWN)
// ==========================================
async function fetchBusinessCategories() {
  const urlFetch = `${baseUrl}/list/business_category/${owner_id}`;
  console.log("🟢 Mulai Fetch Kategori ke:", urlFetch);

  const selectKategori = document.getElementById('formKategori');
  if (!selectKategori) {
      console.error("🔴 [ERROR] Elemen <select id='formKategori'> TIDAK DITEMUKAN di HTML!");
      return;
  }

  try {
    const response = await fetch(urlFetch, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) throw new Error(`API Error: Status ${response.status}`);

    const data = await response.json();
    
    // Reset isi dropdown
    selectKategori.innerHTML = '<option value="" disabled selected>Pilih Kategori Bisnis...</option>';
    
    // Looping data dan masukkan ke select option
    if (data && data.listData && data.listData.length > 0) {
      data.listData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.business_category_id;
        option.text = `${item.business_category} - ${item.description}`;
        selectKategori.appendChild(option);
      });
      console.log("🟢 SUKSES! Opsi kategori berhasil dimuat.");
    }
  } catch (error) {
    console.error('🔴 Error fetching categories:', error);
    Swal.fire('Peringatan', 'Gagal memuat daftar Kategori Bisnis. Cek koneksi atau token API.', 'warning');
  }
}

// ==========================================
// 4. FUNGSI DINAMIS BARIS VIDEO
// ==========================================

window.addVideoRow = function(data = null) {
  const container = document.getElementById('videoListContainer');
  if(!container) return;

  const rowCount = container.children.length + 1;
  const partNum = data ? (data.part || data.part_video) : rowCount; 
  
  // Tangkap ID video jika ada
  const vidId = data && data.id ? data.id : '';

  const rowHTML = `
    <div class="video-row relative group p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
      
      <input type="hidden" class="vid-id" value="${vidId}">
      
      <div class="absolute top-4 right-4">
        <button type="button" onclick="window.removeVideoRow(this)" class="text-slate-400 hover:text-red-500 transition" title="Hapus Segmen">
          ✖
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-1">
          <label class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Part</label>
          <div class="vid-part-display w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold">
            ${partNum}
          </div>
          <input type="hidden" class="vid-part" value="${partNum}">
        </div>
        
        <div class="md:col-span-4">
          <label class="text-sm font-semibold text-slate-600 block mb-1">Title <span class="text-red-500">*</span></label>
          <input required type="text" class="vid-title w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Video Title" value="${data ? data.title : ''}">
        </div>
        
        <div class="md:col-span-4">
          <label class="text-sm font-semibold text-slate-600 block mb-1">URL Video <span class="text-red-500">*</span></label>
          <input required type="url" class="vid-url w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs text-blue-600" placeholder="https://drive.google.com/..." value="${data ? data.url_video : ''}">
        </div>
        
        <div class="md:col-span-3">
          <label class="text-sm font-semibold text-slate-600 block mb-1">Duration</label>
          <input type="text" pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}" class="vid-duration w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="00:05:00" value="${data ? data.duration : '00:00:00'}">
        </div>
        
        <div class="md:col-span-12">
          <label class="text-sm font-semibold text-slate-600 block mb-1">Description</label>
          <textarea rows="2" class="vid-desc w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600" placeholder="Explain what this video covers...">${data && data.description ? data.description : ''}</textarea>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', rowHTML);
  updateVideoParts(); 
}

window.removeVideoRow = async function(btn) {
  const row = btn.closest('.video-row');
  const vidId = row.querySelector('.vid-id').value; // Ambil ID video dari hidden input
  const container = document.getElementById('videoListContainer');

  if (container.children.length <= 1) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Minimal harus ada 1 part video!' });
    return;
  }

  // JIKA VIDEO SUDAH ADA DI DATABASE (Punya ID)
  if (vidId) {
    const confirm = await Swal.fire({
      title: 'Hapus Video Ini?',
      text: "Video akan dihapus permanen dari database!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        
        // Panggil Endpoint API DELETE Video
        const response = await fetch(`${baseUrl}/delete/course_video/${vidId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });

        if (response.ok) {
          row.remove();
          updateVideoParts();
          Swal.fire('Terhapus!', 'Video berhasil dihapus dari database.', 'success');
        } else {
          const errData = await response.json();
          Swal.fire('Gagal', errData.message || 'Gagal menghapus video pada server.', 'error');
        }
      } catch (error) {
        console.error('Error delete video:', error);
        Swal.fire('Error', 'Kesalahan jaringan saat menghapus.', 'error');
      }
    }
  } 
  // JIKA VIDEO BARU DITAMBAHKAN (Belum Disimpan)
  else {
    row.remove();
    updateVideoParts();
  }
}

function updateVideoParts() {
  const rows = document.querySelectorAll('.video-row');
  rows.forEach((row, index) => {
    const partNum = index + 1;
    row.querySelector('.vid-part-display').innerText = partNum;
    row.querySelector('.vid-part').value = partNum;
  });
}

// ==========================================
// 5. FUNGSI LOAD DETAIL (GET BY ID)
// ==========================================
async function loadDetailCourse(id) {
  try {
    Swal.fire({
      title: 'Memuat Data...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    // PANGGIL API ASLI
    const response = await fetch(`${baseUrl}/detail/course/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) throw new Error('Data gagal diambil dari server');

    const result = await response.json();
    
    // Sesuai struktur JSON Anda: { "detail": { ... } }
    if (result && result.detail) {
      const data = result.detail;

      // 1. Isi Input Utama
      document.getElementById('formJudul').value = data.topic || '';
      document.getElementById('formKategori').value = data.business_category_id || ''; 

      // 2. Isi Baris Video
      const container = document.getElementById('videoListContainer');
      container.innerHTML = ''; // Kosongkan dulu

      if (data.videos && data.videos.length > 0) {
        data.videos.forEach(vid => {
          // Kirim data video ke fungsi addVideoRow
          window.addVideoRow(vid);
        });
      } else {
        window.addVideoRow(); // Jika tidak ada video, beri 1 baris kosong
      }
      
      Swal.close();
    }
  } catch (err) {
    console.error('Error detail:', err);
    Swal.fire('Error', 'Gagal memuat data detail course.', 'error');
  }
}

// ==========================================
// 6. GENERATE PAYLOAD & SUBMIT DATA
// ==========================================
function getCoursePayload() {
  const getVal = id => document.getElementById(id).value.trim();
  
  const video_detail = [];
  document.querySelectorAll('.video-row').forEach(row => {
    // Sesuai dengan format JSON murni dari Anda (tanpa menyertakan ID)
    video_detail.push({
      part_video: parseInt(row.querySelector('.vid-part').value) || 0,
      title: row.querySelector('.vid-title').value.trim(),
      url_video: row.querySelector('.vid-url').value.trim(),
      description: row.querySelector('.vid-desc').value.trim(),
      duration: row.querySelector('.vid-duration').value.trim() || "00:00:00"
    });
  });

  const payload = {
    owner_id: owner_id,
    business_category_id: parseInt(getVal('formKategori')) || 0,
    topic: getVal('formJudul'),
    video_detail: video_detail
  };

  return payload;
}

window.saveCourse = async function() {
  const payload = getCoursePayload();
  if (!payload) return;
  
  Swal.fire({
    title: 'Menyimpan Data...',
    text: 'Mohon tunggu sebentar',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const response = await fetch(`${baseUrl}/add/course`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${API_TOKEN}` 
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Course baru telah disimpan.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        if (typeof loadModuleContent === 'function') {
           loadModuleContent("course");
        }
      });
    } else {
      const errorData = await response.json();
      Swal.fire('Gagal!', errorData.message || 'Terjadi kesalahan pada server.', 'error');
    }
  } catch (error) {
    console.error("Error saving:", error);
    Swal.fire('Error!', 'Terjadi kesalahan jaringan saat menyimpan data.', 'error');
  }
}

window.updateCourse = async function() {
  // Pastikan ID Course tersedia
  if (!window.detail_id) {
    Swal.fire('Error', 'ID Course tidak ditemukan untuk diupdate!', 'error');
    return;
  }

  const payload = getCoursePayload();
  if (!payload) return;

  // Cek Payload di Console (Buka F12 untuk melihatnya)
  console.log("MENGIRIM PAYLOAD UPDATE KE:", `${baseUrl}/update/course/${window.detail_id}`);
  console.log("DATA JSON:", JSON.stringify(payload, null, 2));

  Swal.fire({
    title: 'Memperbarui Data...',
    text: 'Mohon tunggu sebentar',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const response = await fetch(`${baseUrl}/update/course/${window.detail_id}`, {
      method: 'PUT', // Pastikan backend Anda menerima PUT (atau ubah ke POST jika backend error)
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${API_TOKEN}` 
      },
      body: JSON.stringify(payload)
    });

    // Validasi respons sukses
    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data course telah diupdate.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Kembali ke halaman course list
        if (typeof loadModuleContent === 'function') {
           loadModuleContent("course");
        }
      });
    } else {
      const errorData = await response.json();
      console.error("Response Error:", errorData);
      Swal.fire('Gagal!', errorData.message || 'Gagal mengupdate data di server.', 'error');
    }
  } catch (error) {
    console.error("Catch Error:", error);
    Swal.fire('Error!', 'Terjadi kesalahan jaringan atau server tidak merespons.', 'error');
  }
}

// ==========================================
// 7. JALANKAN SCRIPT
// ==========================================
jalankanInisialisasiCourse();