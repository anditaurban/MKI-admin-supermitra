pagemodule = 'BusinessCategory'; 
colSpanCount = 5; // Ubah jadi 5 karena kita tambah kolom Thumbnail
setDataType('business_category');

window.state = window.state || {};
window.state['business_category'] = window.state['business_category'] || { currentPage: 1 };

fetchAndUpdateData();

// Fungsi Template Baris Tabel
window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  const globalIndex = (currentPage - 1) * perPage + index + 1;

  // Fungsi helper untuk memastikan URL gambar valid (bisa baca filename saja atau full URL)
  // Fungsi helper URL yang lebih pintar
  // Fungsi helper URL
  const getImageUrl = (path, type) => {
    if (!path || path.trim() === "") return null;
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/^\/+/, '');
    if (cleanPath.includes(`${type}/business_category`)) {
      return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/${type}/business_category/${cleanPath}`;
  };

  const logoUrl = getImageUrl(item.logo, 'logo');
  const thumbnailUrl = getImageUrl(item.thumbnail, 'thumbnail');

  // Render elemen Logo (Gunakan data-secured-src, BUKAN src)
  const logoHtml = logoUrl
    ? `<img data-secured-src="${logoUrl}" class="w-10 h-10 object-contain rounded bg-gray-100 border border-gray-200 secured-image" title="Memuat gambar...">`
    : `<div class="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-400 text-xs rounded font-medium border border-gray-200">N/A</div>`;

  // Render elemen Thumbnail (Gunakan data-secured-src, BUKAN src)
  const thumbnailHtml = thumbnailUrl
    ? `<img data-secured-src="${thumbnailUrl}" class="w-16 h-10 object-cover rounded bg-gray-100 border border-gray-200 secured-image" title="Memuat gambar...">`
    : `<div class="w-16 h-10 flex items-center justify-center bg-gray-200 text-gray-400 text-xs rounded font-medium border border-gray-200">N/A</div>`;

  return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
    
    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden mt-2">Logo</span>
      ${logoHtml}
    </td>

    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden mt-2">Thumbnail</span>
      ${thumbnailHtml}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Kategori</span>  
      <span class="font-semibold">${item.business_category || "-"}</span>
    </td>

    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Deskripsi</span>
      ${item.description || "-"}
    </td>
  
    <td class="px-6 py-4 text-sm text-center text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
        ${item.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
        ${item.status === "Active" ? "Active" : "Inactive"}
      </span>

      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); loadModuleContent('business_category_form', '${item.business_category_id}', '${(item.business_category || '').replace(/'/g, "\\'")}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
         ✏️ Edit Category
        </button>
        <button onclick="event.stopPropagation(); openEditContentModal('${item.business_category_id}', '${item.url || ''}')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
          🖼️ Edit Konten
        </button>
        ${
          item.status === "Active"
            ? `<button onclick="toggleStatus('${item.business_category_id}', '2')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">🔴 Inactivate</button>`
            : `<button onclick="toggleStatus('${item.business_category_id}', '1')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">🟢 Activate</button>`
        }
        <button onclick="event.stopPropagation(); handleDelete(${item.business_category_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete Category
        </button>
      </div>
    </td>
    
  </tr>`;
};

async function loadSecuredImages() {
  // Cari semua gambar yang punya class 'secured-image' dan belum diload
  const images = document.querySelectorAll('.secured-image:not(.loaded)');

  for (let img of images) {
    const url = img.getAttribute('data-secured-src');
    if (!url) continue;

    try {
      // Fetch data dengan Bearer Token
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'image/*'
        }
      });

      if (response.ok) {
        // Ubah response menjadi data Blob, lalu jadikan URL lokal (Object URL)
        const blob = await response.blob();
        img.src = URL.createObjectURL(blob);
        img.classList.add('loaded'); // Tandai bahwa sudah selesai
        img.classList.remove('bg-gray-100'); // Hapus warna loading
        img.removeAttribute('title');
      } else {
        // Jika statusnya bukan 200 OK (misal 404), ganti jadi kotak N/A
        replaceWithNA(img);
      }
    } catch (error) {
      console.error("Gagal memuat gambar:", url, error);
      replaceWithNA(img);
    }
  }
}

// Fungsi kecil untuk mengganti gambar rusak menjadi kotak N/A
function replaceWithNA(imgElement) {
  // Cek apakah ini thumbnail (w-16) atau logo (w-10)
  const isThumbnail = imgElement.classList.contains('w-16');
  const widthClass = isThumbnail ? 'w-16' : 'w-10';
  imgElement.outerHTML = `<div class="${widthClass} h-10 flex items-center justify-center bg-gray-200 text-gray-400 text-xs rounded font-medium border border-gray-200">N/A</div>`;
}

// Fungsi untuk membuka Modal Edit Konten
// Fungsi untuk membuka Modal Edit Konten
function openEditContentModal(id, currentUrl = '') {
  // Template HTML untuk form di dalam modal (ditambah keterangan Max 5MB)
  const contentFormHtml = `
    <form id="editContentForm" class="space-y-4 text-left mt-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Logo Baru</label>
        <input type="file" id="logoInput" name="logo" accept="image/*" 
               class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border p-1 rounded">
        <div class="flex flex-col mt-1">
          <span class="text-xs font-semibold text-gray-500">Maksimal ukuran: 5MB</span>
          <span class="text-xs text-red-500">*Biarkan kosong jika tidak ingin mengubah logo.</span>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Thumbnail Baru</label>
        <input type="file" id="thumbnailInput" name="thumbnail" accept="image/*" 
               class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border p-1 rounded">
        <div class="flex flex-col mt-1">
          <span class="text-xs font-semibold text-gray-500">Maksimal ukuran: 5MB</span>
          <span class="text-xs text-red-500">*Biarkan kosong jika tidak ingin mengubah thumbnail.</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">URL</label>
        <input type="text" id="urlInput" name="url" 
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
               placeholder="Masukkan URL (opsional)...">
      </div>
    </form>
  `;

  Swal.fire({
    title: 'Edit Konten Kategori',
    html: contentFormHtml,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    didOpen: () => {
      if (currentUrl && currentUrl !== 'null' && currentUrl !== 'undefined') {
        document.getElementById('urlInput').value = currentUrl;
      }
    },
    preConfirm: () => {
      const form = document.getElementById('editContentForm');
      const formData = new FormData(form);

      const logoFile = document.getElementById('logoInput').files[0];
      const thumbnailFile = document.getElementById('thumbnailInput').files[0];
      
      // Batas ukuran 5MB dalam satuan bytes
      const maxSize = 5 * 1024 * 1024; 

      // Validasi Logo
      if (logoFile) {
        if (logoFile.size > maxSize) {
          Swal.showValidationMessage('Ukuran file Logo melebihi batas 5MB!');
          return false;
        }
      } else {
        formData.delete('logo'); // Jangan kirim file kosong
      }

      // Validasi Thumbnail
      if (thumbnailFile) {
        if (thumbnailFile.size > maxSize) {
          Swal.showValidationMessage('Ukuran file Thumbnail melebihi batas 5MB!');
          return false;
        }
      } else {
        formData.delete('thumbnail'); // Jangan kirim file kosong
      }

      return submitEditContent(id, formData);
    }
  });
}

// Fungsi untuk mengeksekusi fetch PUT ke API
function submitEditContent(id, formData) {
  Swal.showLoading();
  
  // Endpoint sesuai dengan screenshot Postman Anda
  const url = `${baseUrl}/update/business_category_content/${id}`;

  return fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
      // PENTING: JANGAN tulis 'Content-Type': 'multipart/form-data' di sini.
      // Browser akan mengaturnya secara otomatis jika menggunakan FormData.
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    // Jika backend merespon berhasil
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Konten gambar berhasil diperbarui!',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Refresh tabel untuk melihat gambar baru
    fetchAndUpdateData(); 
  })
  .catch(error => {
    console.error("Error updating content:", error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan saat mengupdate gambar.'
    });
  });
}

// Pastikan id tombol sama dengan di HTML Anda (misal tambah konten)
document.getElementById("addButton")?.addEventListener("click", () => {
  loadModuleContent("content_form");
});