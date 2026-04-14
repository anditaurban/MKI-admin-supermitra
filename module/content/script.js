pagemodule = 'Content'; 
setDataType('content'); // Set endpoint context API

// 1. Matikan sementara fetch asli jika API belum ada
// fetchAndUpdateData(); 

// 2. Fungsi Template Baris Tabel
window.rowTemplate = function (item, index, perPage = 10) {
  // Mapping fallback jika key dari API berbeda
  const title = item.title || item.judul || '-';
  const subtitle = item.subtitle || item.subjudul || '-';
  const sortOrder = item.sort_order !== undefined ? item.sort_order : (item.urutan || 0);
  
  // Logic untuk status Aktif
  const isActive = item.is_active === 1 || item.is_active === true || item.status === 'Active';
  const badgeClass = isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
  const badgeText = isActive ? 'Aktif' : 'Tidak Aktif';
  
  // ID Data
  const id = item.content_id || item.id;

  return `
  <tr class="hover:bg-gray-50 transition bg-white">
    <td class="px-4 py-4 text-gray-800 font-medium whitespace-nowrap">
      ${title}
    </td>
    
    <td class="px-4 py-4 text-gray-500 whitespace-nowrap">
      ${subtitle}
    </td>
    
    <td class="px-4 py-4 text-gray-600 whitespace-nowrap">
      ${sortOrder}
    </td>
    
    <td class="px-4 py-4 whitespace-nowrap">
      <span class="px-3 py-1 rounded-full text-xs font-bold ${badgeClass}">
        ${badgeText}
      </span>
      <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
       <button onclick="event.stopPropagation(); loadModuleContent('product_form', '${item.product_id}', '${item.product.replace(/'/g, "\\'")}');" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
        ✏️ Edit Product
      </button>
        ${item.status === 'Active' 
          ? `<button onclick="toggleProductStatus('${item.product_id}', '2')" class="block w-full text-left px-4 py-2 hover:bg-gray-100">🔴 Inactivate Product</button>` 
          : `<button onclick="toggleProductStatus('${item.product_id}', '1')" class="tblock w-full text-left px-4 py-2 hover:bg-gray-100">🟢 Activate Product</button>`}
        <button onclick="event.stopPropagation(); handleDelete(${item.product_id})" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
          🗑 Delete Product
        </button>
      </div>
    </td>
    
  </tr>`;
};

// 3. Fungsi Render Dummy Data (Meniru Mockup Persis)
function renderDummyContent() {
  const dummyData = [
    { id: 1, title: "DCSA", subtitle: "-", sort_order: 0, is_active: true },
    { id: 2, title: "DCBK", subtitle: "-", sort_order: 0, is_active: true },
    { id: 3, title: "DMCC", subtitle: "-", sort_order: 0, is_active: true },
    { id: 4, title: "DCCR", subtitle: "-", sort_order: 0, is_active: true },
    { id: 5, title: "DPKB", subtitle: "-", sort_order: 0, is_active: true },
    { id: 6, title: "DBDS", subtitle: "-", sort_order: 0, is_active: true },
    { id: 7, title: "CCR", subtitle: "-", sort_order: 1, is_active: true },
    { id: 8, title: "DCC-XTRA", subtitle: "-", sort_order: 2, is_active: true },
    { id: 9, title: "PFF", subtitle: "-", sort_order: 4, is_active: true }
  ];

  window.state = window.state || {};
  window.state['content'] = window.state['content'] || { currentPage: 1 };

  const container = document.getElementById('tableBody');
  container.innerHTML = ''; 
  
  dummyData.forEach((item, index) => {
    container.innerHTML += window.rowTemplate(item, index, 10);
  });
  
  const infoText = document.getElementById('infoText');
  if(infoText) infoText.innerHTML = `Menampilkan <b>1-${dummyData.length}</b> dari <b>${dummyData.length}</b> data (Mode Dummy)`;
}

// 4. Tombol Tambah diarahkan ke Form Konten
document.getElementById('addButton').addEventListener('click', () => {
  loadModuleContent('content_form');
});

// Jalankan Dummy Data (Hapus/Komentari baris ini jika API sudah siap)
renderDummyContent();