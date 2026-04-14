pagemodule = 'Course'; // Sesuaikan modul
setDataType('course'); // Mengatur endpoint ke course
fetchAndUpdateData();

window.rowTemplate = function (item, index, perPage = 10) {
  // --- Penyiapan Data & Dummy Fallback ---
  // Menggunakan fallback OR (||) jika API backend belum menyediakan field yang sesuai
  const title = item.title || item.product || 'Judul Course Tidak Diketahui';
  const category = item.category || 'Proses Awal'; // Dummy Kategori
  
  const kemitraan = item.business_categories && item.business_categories.length > 0 
      ? item.business_categories.map(cat => cat.business_category).join(', ') 
      : 'DCC-XTRA'; // Dummy Kemitraan
      
  const isVip = item.is_vip === 1 || item.is_vip === true; // Logika VIP badge
  
  // URL Gambar: Gunakan dari API, jika tidak ada pakai gambar dummy abu-abu
  const imageUrl = item.image_url || item.thumbnail || 'https://via.placeholder.com/400x200?text=Gambar+Course';
  
  // Karena script Anda awalnya pakai product_id, saya sesuaikan agar mendukung course_id
  const id = item.course_id || item.product_id || item.id;

  // --- Render HTML Kartu ---
  return `
  <div class="bg-white rounded-xl border border-gray-300 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
    
    <div class="relative h-48 w-full bg-gray-100 border-b border-gray-200">
      <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover" />
      
      ${isVip ? `
        <span class="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-extrabold px-3 py-1 rounded shadow">
          VIP
        </span>
      ` : ''}
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <h3 class="text-lg font-bold text-gray-900 mb-1 leading-snug">${title}</h3>
      
      <div class="text-blue-500 text-3xl leading-none mb-3" style="line-height: 0.5;">.</div>

      <div class="text-sm text-gray-500 space-y-1 mb-4 flex-1">
        <p>Kategori: ${category}</p>
        <p>Kemitraan: ${kemitraan}</p>
      </div>

      <hr class="border-t-2 border-gray-200 mb-4" />

      <div class="flex justify-between items-center text-sm font-medium">
        <button onclick="loadModuleContent('course_form', '${id}', '${title.replace(/'/g, "\\'")}')" class="text-blue-600 hover:text-blue-800 transition">
          Edit
        </button>
        <button onclick="handleDelete('${id}')" class="text-red-600 hover:text-red-800 transition">
          Hapus
        </button>
      </div>
    </div>
    
  </div>
  `;
};

// Navigasi ke Form Course
document.getElementById('addButton').addEventListener('click', () => {
  loadModuleContent('course_form');
});

// Mematikan sementara fetch data dari API untuk melihat UI Dummy
// fetchAndUpdateData(); 

function renderDummyCourses() {
  // 1. Buat array data dummy persis seperti di gambar
  const dummyData = [
    {
      course_id: 1,
      title: "Proses Marinasi Ayam",
      category: "Proses Awal",
      is_vip: true,
      image_url: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=400&auto=format&fit=crop", // Gambar ilustrasi ayam
      business_categories: [{ business_category: "DCC-XTRA" }]
    },
    {
      course_id: 2,
      title: "Membuat Air Celupan",
      category: "Proses Awal",
      is_vip: true,
      image_url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=400&auto=format&fit=crop", // Gambar ilustrasi
      business_categories: [{ business_category: "DCC-XTRA" }]
    },
    {
      course_id: 3,
      title: "Penuangan Tepung Crispy ke Wadah",
      category: "Proses Awal",
      is_vip: true,
      image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop", // Gambar ilustrasi
      business_categories: [{ business_category: "DCC-XTRA" }]
    }
  ];

  // 2. Pastikan variabel state bawaan script Anda tidak error saat membaca currentPage
  window.state = window.state || {};
  window.state['course'] = window.state['course'] || { currentPage: 1 };

  // 3. Masukkan data dummy ke dalam kontainer HTML
  const container = document.getElementById('tableBody');
  container.innerHTML = ''; // Bersihkan kontainer dulu
  
  dummyData.forEach((item, index) => {
    container.innerHTML += window.rowTemplate(item, index, 10);
  });
  
  // Update teks info jika diperlukan
  const infoText = document.getElementById('infoText');
  if(infoText) infoText.innerHTML = "Menampilkan <b>1-3</b> dari <b>3</b> data (Mode Dummy)";
}

// Panggil fungsi render dummy
renderDummyCourses();

// ... [Pertahankan fungsi importData, handleFileRead, startImport, dll dari kode Anda sebelumnya, cukup pastikan endpoint mengarah ke '/add/course' di handleImport] ...