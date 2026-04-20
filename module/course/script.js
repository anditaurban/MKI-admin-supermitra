// --- INISIALISASI ---
pagemodule = 'Course'; // Sesuaikan modul
setDataType('course'); // Mengatur endpoint ke course

// Aktifkan kembali fetch dari API asli
fetchAndUpdateData();

// --- TEMPLATE BARIS TABEL ---
// --- TEMPLATE BARIS TABEL ---
window.rowTemplate = function (item, index, perPage = 10) {
  // Ambil halaman saat ini untuk kalkulasi nomor urut
  const currentPage = window.state && window.state['course'] ? window.state['course'].currentPage : 1;
  const rowNum = (currentPage - 1) * perPage + (index + 1);

  // Mapping data dari JSON API Anda
  const id = item.course_video_id; 
  const topic = item.topic || 'Tanpa Judul'; 
  const category = item.business_category || '-'; 
  const status = item.status || 'Active'; // Fallback ke Active jika API belum ada field status
  
  // Mencegah error quote pada javascript
  const safeTopic = topic.replace(/'/g, "\\'");

  return `
    <tr class="bg-white border-b border-gray-100 hover:bg-slate-50 transition duration-200">
      <td class="px-6 py-4 font-medium text-gray-900 text-center">${rowNum}</td>
      <td class="px-6 py-4 font-semibold text-gray-800">${topic}</td>
      <td class="px-6 py-4">
        <span class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          ${category}
        </span>
        <div class="dropdown-menu hidden fixed w-48 bg-white border rounded shadow z-50 text-sm">
       <button onclick="event.stopPropagation(); loadModuleContent('course_form', '${id}', '${safeTopic}');" class="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-gray-700 transition">
            ✏️ Edit Course
          </button>
        <button onclick="event.stopPropagation(); handleDelete('${id}')" class="block w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium transition">
            🗑 Delete Course
          </button>
      </div>
      </td>
     
    </tr>
  `;
};



// --- FUNGSI PENDUKUNG DROPDOWN ---



// --- EVENT LISTENER ---
// Navigasi ke Form Tambah Course
document.getElementById('addButton').addEventListener('click', () => {
  // Panggil form tanpa ID (Mode Tambah)
  loadModuleContent('course_form');
});