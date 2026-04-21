pagemodule = "Product";
colSpanCount = 8; // Ubah menjadi 8 karena kita tambah 1 kolom foto
setDataType("product");
fetchAndUpdateData();

window.rowTemplate = function (item, index, perPage = 10) {
  const { currentPage } = state[currentDataType];
  const globalIndex = (currentPage - 1) * perPage + index + 1;

  // Fungsi helper untuk path gambar (jaga-jaga jika isinya path relatif atau absolute)
  // Fungsi helper URL (tetap sama)
  const getPhotoUrl = (path) => {
    if (!path || path.trim() === "") return null;
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/^\/+/, '');
    if (cleanPath.includes(`photo/product`)) {
      return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/photo/product/${cleanPath}`;
  };

  const photoUrl = getPhotoUrl(item.photo);

  // UBAH BAGIAN INI: Gunakan trik secured-image yang sudah kita buat sebelumnya
  const photoHtml = photoUrl
    ? `<img data-secured-src="${photoUrl}" class="w-10 h-10 object-cover rounded bg-gray-100 border border-gray-200 secured-image" title="Memuat foto...">`
    : `<div class="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-400 text-xs rounded font-medium border border-gray-200">N/A</div>`;
  return `
  <tr class="flex flex-col sm:table-row border rounded sm:rounded-none mb-4 sm:mb-0 shadow-sm sm:shadow-none transition hover:bg-gray-50">
    
    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden mt-2">Foto</span>
      ${photoHtml}
    </td>

    <td class="px-6 py-4 text-sm border-b sm:border-0 flex justify-between sm:table-cell bg-gray-800 text-white sm:bg-transparent sm:text-gray-700">
      <span class="font-medium sm:hidden">Kode</span>
      ${item.productcode}
    </td>
  
    <td class="px-6 py-4 text-sm text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Barang</span>  
      ${item.product}
    </td>

    <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Harga</span>
      ${formatRupiah(item.sale_price)}
    </td>
  
    <td class="px-6 py-4 text-sm text-center text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Kategori</span>  
      ${item.category}
    </td>
  
    <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Stok</span>  
      ${finance(item.weight)} gr
    </td>
  
    <td class="px-6 py-4 text-sm text-right text-gray-700 border-b sm:border-0 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Kemitraan</span>  
      ${
        item.business_categories.length > 0
          ? item.business_categories.map((cat) => cat.business_category).join(", ")
          : "-"
      }
    </td>
  
    <td class="px-6 py-4 text-sm text-center text-gray-700 flex justify-between sm:table-cell">
      <span class="font-medium sm:hidden">Status</span>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
        ${item.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
        ${item.status === "Active" ? "Active" : "Inactive"}
      </span>
      
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
        <button onclick="event.stopPropagation(); openEditPhotoModal('${item.product_id}')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600">
          🖼️ Edit Photo
        </button>

      </div>
    </td>
  </tr>`;
};

async function loadSecuredImages() {
  const images = document.querySelectorAll('.secured-image:not(.loaded)');

  for (let img of images) {
    const url = img.getAttribute('data-secured-src');
    if (!url) continue;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        
        // CEK PENTING: Apakah yang dikembalikan server BENAR-BENAR gambar?
        if (blob.type.startsWith('image/')) {
          img.src = URL.createObjectURL(blob);
          img.classList.add('loaded');
          img.classList.remove('bg-gray-200'); // hilangkan background abu-abu
        } else {
          // Jika server merespon 200 OK tapi isinya HTML/JSON error
          console.error("❌ Gagal: URL tidak mengembalikan file gambar. Tipe file:", blob.type, "URL:", url);
          replaceWithNA(img);
        }
      } else {
        console.error("❌ Gagal Fetch Gambar. Status:", response.status, url);
        replaceWithNA(img);
      }
    } catch (error) {
      console.error("❌ Error Jaringan saat memuat gambar:", url, error);
      replaceWithNA(img);
    }
  }
}

// Fungsi kecil untuk mengganti gambar rusak menjadi kotak N/A
function replaceWithNA(imgElement) {
  const isThumbnail = imgElement.classList.contains('w-16');
  const widthClass = isThumbnail ? 'w-16' : 'w-10';
  imgElement.outerHTML = `<div class="${widthClass} h-10 flex items-center justify-center bg-gray-200 text-gray-400 text-xs rounded font-medium border border-gray-200">N/A</div>`;
}

// Fungsi untuk membuka Modal Edit Foto Produk
function openEditPhotoModal(id) {
  const photoFormHtml = `
    <form id="editPhotoForm" class="space-y-4 text-left mt-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Upload Foto Baru</label>
        <input type="file" id="photoInput" name="file" accept="image/*" 
               class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border p-1 rounded">
        <div class="flex flex-col mt-1">
          <span class="text-xs font-semibold text-gray-500">Maksimal ukuran: 5MB</span>
        </div>
      </div>
    </form>
  `;

  Swal.fire({
    title: 'Edit Foto Produk',
    html: photoFormHtml,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const form = document.getElementById('editPhotoForm');
      const formData = new FormData(form);
      const photoFile = document.getElementById('photoInput').files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!photoFile) {
        Swal.showValidationMessage('Silakan pilih foto terlebih dahulu!');
        return false;
      }

      if (photoFile.size > maxSize) {
        Swal.showValidationMessage('Ukuran file melebihi batas 5MB!');
        return false;
      }

      return submitEditPhoto(id, formData);
    }
  });
}

// Fungsi Fetch ke Backend
function submitEditPhoto(id, formData) {
  Swal.showLoading();
  
  // Endpoint sesuai instruksi: /update/product_photo/{id}
  const url = `${baseUrl}/update/product_photo/${id}`;

  return fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
      // Ingat: Jangan set Content-Type untuk FormData
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    // Mengecek dari response success API Anda
    if (data.data && data.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Content successfully updated',
        timer: 2000,
        showConfirmButton: false
      });
      fetchAndUpdateData(); // Render ulang tabel
    } else {
      throw new Error(data.data?.message || 'Gagal dari server');
    }
  })
  .catch(error => {
    console.error("Error updating photo:", error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan saat mengupdate foto.'
    });
  });
}

document.getElementById("addButton").addEventListener("click", () => {
  // showFormModal();
  // loadDropdownCall();
  loadModuleContent("product_form");
});

function toggleProductStatus(id, status_id) {
  const actionText = status_id === 1 ? "mengaktifkan" : "menonaktifkan";

  Swal.fire({
    title: `Yakin ingin ${actionText} produk ini?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${baseUrl}/update/product_status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({ status_id: status_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data && data.data.status_id) {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: data.data.message || "Status berhasil diperbarui",
              timer: 2000,
              showConfirmButton: false,
            });
            // Refresh list produk jika perlu:
            fetchAndUpdateData(); // ganti dengan fungsi Anda jika berbeda
          } else {
            throw new Error("Gagal memperbarui status");
          }
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: err.message || "Terjadi kesalahan",
          });
        });
    }
  });
}

formHtml = `
<form id="dataform" class="space-y-2">
  <label for="fileInput" class="block text-sm font-medium text-gray-700 dark:text-gray-200 text-left">File</label>
  <input id="fileInput" type="file" class="form-control w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">

  <div class="text-sm text-gray-500 dark:text-gray-300">
    Belum punya format? 
    <a href="assets/doc/contoh_import_produk.xlsx" download class="text-blue-600 hover:underline">Download template Excel</a>
  </div>
</form>
`;

function importData() {
  Swal.fire({
    title: "Import Produk",
    html: formHtml,

    confirmButtonText: "Import",
    showCancelButton: true,
    preConfirm: () => {
      const file = document.getElementById("fileInput").files[0];
      if (!file) {
        Swal.showValidationMessage("Silakan pilih file terlebih dahulu");
      } else {
        return file;
      }
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      handleFileRead(result.value);
    }
  });
}

function handleFileRead(file) {
  if (typeof XLSX === "undefined") {
    return showErrorAlert(
      "Library XLSX tidak ditemukan. Pastikan sudah di-include.",
    );
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (!jsonData.length) {
        return showErrorAlert("File kosong atau format tidak valid.");
      }

      startImport(jsonData);
    } catch (err) {
      console.error(err);
      showErrorAlert("Gagal membaca file. Pastikan format file benar.");
    }
  };

  reader.readAsArrayBuffer(file);
}

function startImport(data) {
  let total = data.length;
  let current = 0;
  let successCount = 0;

  Swal.fire({
    title: "Mengimpor Produk...",
    html: `<div id="importStatus" style="text-align:left; max-height:300px; overflow-y:auto; font-size:14px;"></div>`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      const statusContainer = document.getElementById("importStatus");

      function importNext() {
        if (current >= total) {
          console.log("current : ", current);
          console.log("total : ", total);
          statusContainer.innerHTML += `<hr class="my-2" />
    <p>✅ Total data: <strong>${total}</strong></p>
    <p>✅ Berhasil diimpor: <strong>${successCount}</strong></p>
    <div class="mt-4 text-right">
      <button id="doneBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded">Selesai</button>
    </div>`;

          // Tombol selesai handler
          setTimeout(() => {
            const doneBtn = document.getElementById("doneBtn");
            if (doneBtn) {
              doneBtn.addEventListener("click", () => {
                Swal.close();
                fetchAndUpdateData();
              });
            }
          }, 100);

          return;
        }

        const row = data[current];
        let businessCategories = [];

        try {
          businessCategories = JSON.parse(row.business_category_ids || "[]");
        } catch (e) {
          console.warn(
            `Baris ${
              current + 1
            }: Format business_category_ids tidak valid, default []`,
          );
        }

        const formData = {
          owner_id: owner_id,
          category_id: parseInt(row.category_id || 1),
          unit_id: parseInt(row.unit_id || 6),
          status_id: parseInt(row.status_id || 1),
          productcode: row.productcode,
          product: row.product,
          cogs: parseInt(row.cogs || 0),
          sale_price: parseInt(row.sale_price || 0),
          wholesale_price: parseInt(row.wholesale_price || 0),
          limitstock: parseInt(row.limitstock || 0),
          description: row.description || "",
          weight: parseFloat(row.weight || 0),
          business_category_ids: businessCategories,
        };

        const itemNo = current + 1;
        statusContainer.innerHTML += `<p>⏳ Mengimpor data #${itemNo} - ${formData.product}...</p>`;
        statusContainer.scrollTop = statusContainer.scrollHeight;

        handleImport(formData, null, (success = true) => {
          if (success) successCount++;

          statusContainer.innerHTML += `<p>✅ Selesai data #${itemNo} - ${formData.product}</p>`;
          statusContainer.scrollTop = statusContainer.scrollHeight;
          current++;
          setTimeout(importNext, 300);
        });
      }

      importNext();
    },
  });
}

function handleImport(formData, detail_id, callback) {
  // Swal.showLoading();

  const createUrl = `${baseUrl}/add/product`;
  if (!createUrl) {
    showErrorAlert("Endpoint tidak ditemukan.");
    return;
  }

  fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      const isSuccess = !!data?.data?.id;
      handleImportResponse(data, detail_id);
      if (typeof callback === "function") callback(isSuccess);
    })
    .catch((err) => {
      console.error(err);
      showErrorAlert("Gagal mengirim data. Silakan coba lagi.");
      if (typeof callback === "function") callback(false);
    });
}

function handleImportResponse(data, detail_id) {
  if (data?.data?.id) {
    console.log("Produk berhasil dibuat:", data.data.id);
  } else {
    console.warn("Gagal membuat produk:", data);
  }
}

function showErrorAlert(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
  });
}
