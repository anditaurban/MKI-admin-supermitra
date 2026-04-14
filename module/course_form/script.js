pagemodule = 'CourseForm';
setDataType('course');

// Inisialisasi awal
initCourseForm();

function initCourseForm() {
  // Trigger file input click when the dashed box is clicked
  const fileInput = document.getElementById('formThumbnail');
  const dropZone = fileInput.parentElement;
  
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const fileName = this.files[0].name;
      dropZone.querySelector('span.text-sm').textContent = fileName;
      dropZone.querySelector('span.text-sm').classList.add('text-blue-600');
    }
  });

  if (window.detail_id) {
    // Mode UPDATE
    loadDetailCourse(detail_id);
    document.getElementById('btnSaveCourse').classList.add('hidden');
    document.getElementById('btnUpdateCourse').classList.remove('hidden');
    document.getElementById('formTitle').innerText = 'UPDATE COURSE';
  } else {
    // Mode TAMBAH
    document.getElementById('btnSaveCourse').classList.remove('hidden');
    document.getElementById('btnUpdateCourse').classList.add('hidden');
    loadKemitraanOptions(); // Load kemitraan kosong
  }
}

// Fungsi Pindah Tab
function switchTab(tabId) {
  // Sembunyikan semua konten tab
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('block');
  });

  // Hapus styling aktif dari semua tombol tab
  document.querySelectorAll('.tab-link').forEach(btn => {
    btn.classList.remove('bg-blue-50', 'border-blue-600', 'text-blue-600');
    btn.classList.add('hover:bg-gray-50', 'text-gray-500', 'border-transparent');
  });

  // Tampilkan konten tab terpilih
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  document.getElementById(`tab-${tabId}`).classList.add('block');

  // Beri style aktif pada tombol tab terpilih
  const activeBtn = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
  activeBtn.classList.remove('hover:bg-gray-50', 'text-gray-500', 'border-transparent');
  activeBtn.classList.add('bg-blue-50', 'border-blue-600', 'text-blue-600');
}

// Load Checkbox Kemitraan (Menggunakan fungsi mirip loadKategoriOptions produk)
async function loadKemitraanOptions(selectedIds = []) {
  try {
    const res = await fetch(`${baseUrl}/list/business_category/${owner_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });

    const result = await res.json();
    const kemitraanList = result.listData || [];
    const container = document.getElementById('kategoriList');
    container.innerHTML = '';

    // Dummy fallback if API fails/empty, remove this in production
    if(kemitraanList.length === 0) {
        const dummy = ['DCC-XTRA', 'DBDS', 'DCBK', 'CCR', 'DCCC', 'DCSA', 'DMCC', 'DPKB', 'MHRE', 'PFFR', 'PCCR'];
        dummy.forEach((item, index) => kemitraanList.push({ business_category_id: index+1, business_category: item }));
    }

    kemitraanList.forEach(item => {
      const isChecked = selectedIds.includes(item.business_category_id) ? 'checked' : '';
      
      const checkboxHTML = `
        <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
          <input type="checkbox" name="kemitraan" value="${item.business_category_id}" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" ${isChecked}>
          <span class="ml-3 text-sm font-medium text-gray-700">${item.business_category}</span>
        </label>
      `;
      container.insertAdjacentHTML('beforeend', checkboxHTML);
    });

  } catch (err) {
    console.error('Gagal load kemitraan:', err);
  }
}

// Load Data Detail (Untuk Edit)
async function loadDetailCourse(id) {
  try {
    const res = await fetch(`${baseUrl}/detail/course/${id}?_=${Date.now()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    const { detail } = await res.json();
    
    document.getElementById('formJudul').value = detail.title || '';
    document.getElementById('formInstruktur').value = detail.instructor || '';
    document.getElementById('formDurasi').value = detail.duration || '';
    document.getElementById('formKategori').value = detail.category || ''; // Asumsi text, jika select ganti logicnya
    document.getElementById('formVideoUrl').value = detail.video_url || '';
    document.getElementById('formDeskripsi').value = detail.description || '';
    document.getElementById('formVIP').checked = detail.is_vip === 1 || detail.is_vip === true;

    // Mapping Kemitraan Terpilih
    const selectedBusinessCategories = (detail.business_categories || []).map(cat => cat.business_category_id);
    await loadKemitraanOptions(selectedBusinessCategories);

  } catch (err) {
    console.error('Gagal load detail course:', err);
  }
}

// Generate Payload
function getCoursePayload() {
  const getVal = id => document.getElementById(id).value.trim();
  
  const payload = {
    owner_id,
    title: getVal('formJudul'),
    instructor: getVal('formInstruktur'),
    duration: getVal('formDurasi'),
    category: getVal('formKategori'),
    video_url: getVal('formVideoUrl'),
    description: getVal('formDeskripsi'),
    is_vip: document.getElementById('formVIP').checked ? 1 : 0,
    business_category_ids: Array.from(document.querySelectorAll('#kategoriList input[name="kemitraan"]:checked'))
      .map(input => parseInt(input.value))
  };

  if (!payload.title || !payload.instructor) {
    Swal.fire({
      icon: 'warning',
      title: 'Lengkapi Data',
      text: 'Judul Course dan Instructor wajib diisi.'
    });
    return null;
  }
  return payload;
}

// Simpan Data
async function saveCourse() {
  const payload = getCoursePayload();
  if (!payload) return;
  
  /* * NOTE PENTING: 
   * Jika Anda benar-benar mengirim FILE GAMBAR (Thumbnail), Anda TIDAK BISA menggunakan JSON.stringify.
   * Anda harus menggunakan objek `FormData`.
   * Contoh menggunakan FormData ada di komentar di bawah ini.
   */

  try {
    const response = await fetch(`${baseUrl}/add/course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.data && result.data.id) {
      Swal.fire('Berhasil', 'Course berhasil ditambahkan', 'success');
      loadModuleContent('course');
    } else {
      throw new Error(result.message || 'Gagal menambahkan course');
    }
  } catch (error) {
    Swal.fire('Gagal', error.message, 'error');
  }
}

// Update Data
async function updateCourse() {
  const payload = getCoursePayload();
  if (!payload) return;

  try {
    const response = await fetch(`${baseUrl}/update/course/${detail_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.data && result.data.id) {
      Swal.fire('Berhasil', 'Course berhasil diperbarui', 'success');
      loadModuleContent('course');
    } else {
      throw new Error(result.message || 'Gagal memperbarui course');
    }
  } catch (error) {
    Swal.fire('Gagal', error.message, 'error');
  }
}

/* --- CONTOH MENGIRIM FILE MENGGUNAKAN FORMDATA (JIKA DIPERLUKAN BACKEND) ---
async function saveCourseWithImage() {
  const fileInput = document.getElementById('formThumbnail');
  const formData = new FormData();
  
  formData.append('title', document.getElementById('formJudul').value);
  formData.append('instructor', document.getElementById('formInstruktur').value);
  // ... append data lainnya ...

  if (fileInput.files.length > 0) {
    formData.append('thumbnail', fileInput.files[0]);
  }

  // Fetch API TANPA header 'Content-Type' (Browser akan set otomatis ke multipart/form-data)
  fetch(`${baseUrl}/add/course`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    body: formData
  })
}
*/