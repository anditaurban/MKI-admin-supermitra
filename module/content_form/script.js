pagemodule = 'ContentForm';
setDataType('content'); // Set endpoint context sesuai kebutuhan Anda

initContentForm();

function initContentForm() {
  // Sync teks besar "Jenis Konten" dengan isi dropdown
  const selectJenis = document.getElementById('formJenis');
  const displayJenis = document.getElementById('displayJenisKonten');
  
  selectJenis.addEventListener('change', function() {
    displayJenis.innerText = this.options[this.selectedIndex].text;
  });

  // Handle custom file upload UI
  const fileInput = document.getElementById('formFile');
  const btnPilihFile = document.getElementById('btnPilihFile');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const dropzoneArea = document.getElementById('dropzoneArea');

  // Buka dialog file saat tombol atau area diklik
  btnPilihFile.addEventListener('click', (e) => {
    e.stopPropagation(); // Mencegah double trigger jika area juga diklik
    fileInput.click();
  });
  dropzoneArea.addEventListener('click', () => fileInput.click());

  // Ganti teks saat file dipilih
  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      fileNameDisplay.textContent = this.files[0].name;
      fileNameDisplay.classList.add('text-blue-600', 'font-bold');
    } else {
      fileNameDisplay.textContent = 'Belum ada file yang dipilih';
      fileNameDisplay.classList.remove('text-blue-600', 'font-bold');
    }
  });

  // Mode Edit / Update
  if (window.detail_id) {
    loadDetailContent(window.detail_id);
    document.getElementById('btnSave').classList.add('hidden');
    document.getElementById('btnUpdate').classList.remove('hidden');
    document.getElementById('formTitle').innerText = 'Update Konten Website';
  } else {
    document.getElementById('btnSave').classList.remove('hidden');
    document.getElementById('btnUpdate').classList.add('hidden');
  }
}

// Fetch data detail untuk mode Edit
async function loadDetailContent(id) {
  try {
    const res = await fetch(`${baseUrl}/detail/content/${id}?_=${Date.now()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    const { detail } = await res.json();
    
    // Asumsi properti kembalian API. Sesuaikan key-nya dengan field di database Anda
    document.getElementById('formJenis').value = detail.type || 'brand';
    // Trigger event change agar teks besar "Jenis Konten" ikut berubah
    document.getElementById('formJenis').dispatchEvent(new Event('change'));

    document.getElementById('formJudul').value = detail.title || '';
    document.getElementById('formSubjudul').value = detail.subtitle || '';
    document.getElementById('formDeskripsi').value = detail.description || '';
    document.getElementById('formUrlGambar').value = detail.image_url || '';
    document.getElementById('formLink').value = detail.action_link || '';
    document.getElementById('formUrutan').value = detail.sort_order || 0;
    document.getElementById('formAktif').checked = detail.is_active === 1 || detail.is_active === true;

  } catch (err) {
    console.error('Gagal memuat detail konten:', err);
  }
}

// Generate payload data untuk disimpan
function getContentPayload() {
  const getVal = id => document.getElementById(id).value.trim();
  
  const payload = {
    owner_id,
    type: getVal('formJenis'),
    title: getVal('formJudul'),
    subtitle: getVal('formSubjudul'),
    description: getVal('formDeskripsi'),
    image_url: getVal('formUrlGambar'),
    action_link: getVal('formLink'),
    sort_order: parseInt(getVal('formUrutan')) || 0,
    is_active: document.getElementById('formAktif').checked ? 1 : 0
  };

  // Validasi Minimal (Sesuaikan dengan kebutuhan bisnis Anda)
  if (!payload.title || !payload.type) {
    Swal.fire({
      icon: 'warning',
      title: 'Data belum lengkap',
      text: 'Judul dan Jenis Konten wajib diisi.'
    });
    return null;
  }

  return payload;
}

// Simpan Konten Baru
async function saveContent() {
  const payload = getContentPayload();
  if (!payload) return;

  /* * INFO: Jika Anda juga perlu mengirimkan FILE (gambar) secara fisik ke backend, 
   * Anda harus mengubah implementasi ini menggunakan `FormData` alih-alih `JSON.stringify`.
   */

  try {
    const response = await fetch(`${baseUrl}/add/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.data && result.data.id) {
      Swal.fire('Berhasil', 'Konten berhasil ditambahkan', 'success');
      loadModuleContent('content'); // Kembali ke halaman tabel/grid
    } else {
      throw new Error(result.message || 'Gagal menambahkan konten');
    }
  } catch (error) {
    Swal.fire('Gagal', error.message, 'error');
  }
}

// Update Konten Lama
async function updateContent() {
  const payload = getContentPayload();
  if (!payload) return;

  try {
    const response = await fetch(`${baseUrl}/update/content/${detail_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.data && result.data.id) {
      Swal.fire('Berhasil', 'Konten berhasil diperbarui', 'success');
      loadModuleContent('content');
    } else {
      throw new Error(result.message || 'Gagal memperbarui konten');
    }
  } catch (error) {
    Swal.fire('Gagal', error.message, 'error');
  }
}