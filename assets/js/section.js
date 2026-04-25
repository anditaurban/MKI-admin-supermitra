// ==========================================
// 1. Fungsi Logout dengan SweetAlert Modern
// ==========================================
document.getElementById("logout")?.addEventListener("click", function () {
  Swal.fire({
    title: "Yakin ingin logout?",
    text: "Anda harus login kembali untuk mengakses aplikasi.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5", // Warna modern (orange)
    cancelButtonColor: "#f3f4f6", // Warna abu-abu terang modern
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "<span style='color: #374151'>Batal</span>",
    customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-4 py-2 font-medium',
        cancelButton: 'rounded-lg px-4 py-2 font-medium'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.clear();
      localStorage.clear();
      Swal.fire({
        icon: "success",
        title: "Berhasil logout!",
        showConfirmButton: false,
        timer: 1200,
        customClass: { popup: 'rounded-2xl' }
      }).then(() => {
        window.location.href = "login.html";
      });
    }
  });
});

if (typeof owner_id !== 'undefined' || typeof user_id !== 'undefined' || typeof level !== 'undefined' || typeof username !== 'undefined') {
  // const welcomeMessageSpan = document.getElementById('nameUser');
  // welcomeMessageSpan.textContent = `Hi, ${nama} 👋`;
}

// ==========================================
// 2. Logika Sidebar Responsif & Modern
// ==========================================
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
const desktopToggle = document.getElementById("desktopToggle");
const mainContent = document.getElementById("mainContent");

function toggleSidebar() {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Logika Mobile: Slide In/Out
    const isOpen = !sidebar.classList.contains("-translate-x-full");
    if (isOpen) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  } else {
    // Logika Desktop: Expand/Collapse
    sidebar.classList.contains("w-16") ? expandSidebar() : collapseSidebar();
  }
}

function openMobileSidebar() {
  if (!sidebar || !overlay) return;
  sidebar.classList.remove("-translate-x-full");
  overlay.classList.remove("hidden");
  setTimeout(() => overlay.classList.add("opacity-100"), 10);
  document.body.style.overflow = "hidden"; // Cegah scroll background
}

function closeMobileSidebar() {
  if (!sidebar || !overlay) return;
  sidebar.classList.add("-translate-x-full");
  overlay.classList.remove("opacity-100");
  setTimeout(() => overlay.classList.add("hidden"), 300);
  document.body.style.overflow = "auto"; // Kembalikan scroll
}

function collapseSidebar() {
  if (!sidebar) return;
  sidebar.classList.add("w-16");
  sidebar.classList.remove("w-64");
  
  // Sembunyikan teks menu dengan efek transisi yang halus
  document.querySelectorAll(".menu-text").forEach(el => {
    el.classList.add("md:hidden", "opacity-0", "w-0");
    el.classList.remove("opacity-100", "w-auto");
  });
  
  if(mainContent) {
      mainContent.classList.replace("md:ml-64", "md:ml-16");
  }
  
  // Tutup semua submenu yang terbuka saat dikolaps agar rapih
  document.querySelectorAll("[id$='Submenu']").forEach(s => {
    s.classList.add("hidden");
    s.classList.remove("flex");
  });
  // Kembalikan ikon panah submenu ke posisi semula
  document.querySelectorAll("[id$='SubmenuIcon']").forEach(icon => {
    icon.classList.remove("rotate-90");
  });
}

function expandSidebar() {
  if (!sidebar) return;
  sidebar.classList.remove("w-16");
  sidebar.classList.add("w-64");
  
  document.querySelectorAll(".menu-text").forEach(el => {
    el.classList.remove("md:hidden", "opacity-0", "w-0");
    el.classList.add("opacity-100", "w-auto");
  });
  
  if(mainContent) {
      mainContent.classList.replace("md:ml-16", "md:ml-64");
  }
}

// Event Listeners untuk Sidebar
desktopToggle?.addEventListener("click", toggleSidebar);
overlay?.addEventListener("click", closeMobileSidebar);

// Handle resize jendela agar responsif tidak bug
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    overlay?.classList.add("hidden");
    sidebar?.classList.remove("-translate-x-full");
    document.body.style.overflow = "auto";
  } else {
    sidebar?.classList.add("-translate-x-full");
    if (sidebar && !sidebar.classList.contains("w-64")) {
       expandSidebar(); // pastikan ukurannya w-64 saat di mobile (tapi tersembunyi di kiri)
    }
  }
});

// Inisialisasi awal saat pertama di-load
if (window.innerWidth >= 768) {
  expandSidebar();
} else {
  sidebar?.classList.add("-translate-x-full");
  expandSidebar(); // Lebarkan isinya untuk mobile, tapi biarkan tersembunyi
}

// ==========================================
// 3. Logika Dark Mode & Dropdowns
// ==========================================
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark"); 
  document.body.classList.toggle("dark");
  document.body.classList.toggle("bg-gray-50");
  document.body.classList.toggle("bg-gray-950");

  const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", mode);
}

document.getElementById("toggleTheme")?.addEventListener("click", toggleDarkMode);
document.getElementById("mobileToggleTheme")?.addEventListener("click", toggleDarkMode);

const dropdowns = [
  { toggle: "userDropdownToggle", menu: "userDropdown" },
  { toggle: "notificationToggle", menu: "notificationDropdown" },
  { toggle: "apiIndicatorToggle", menu: "apiIndicatorDropdown" },
];

// Pasang event click untuk toggle header (API & User)
dropdowns.forEach(({ toggle, menu }) => {
  const btn = document.getElementById(toggle);
  const dropdown = document.getElementById(menu);

  btn?.addEventListener("click", (e) => {
    e.stopPropagation(); // Mencegah klik menyebar ke document
    dropdown?.classList.toggle("hidden");
  });
});

// Mobile menu dropdown toggle
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileMenuDropdown = document.getElementById("mobileMenuDropdown");

mobileMenuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenuDropdown?.classList.toggle("hidden");
});

// Klik di luar -> tutup semua dropdown header
document.addEventListener("click", (e) => {
  dropdowns.forEach(({ toggle, menu }) => {
    const btn = document.getElementById(toggle);
    const dropdown = document.getElementById(menu);

    if (btn && dropdown && !btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
  
  if (mobileMenuToggle && mobileMenuDropdown && !mobileMenuToggle.contains(e.target) && !mobileMenuDropdown.contains(e.target)) {
    mobileMenuDropdown.classList.add("hidden");
  }
});

// ==========================================
// 4. Fetch Badge Data & Integrasi API
// ==========================================
async function loadBadge() {
  const badgeConfigs = [
    { id: "salesQtyBadge", endpoint: "counting/sales_pending" },
    { id: "receiptQtyBadge", endpoint: "counting/sales_receipt_unvalid" },
    { id: "packageQtyBadge", endpoint: "counting/sales_package_unpack" },
    { id: "shipmentQtyBadge", endpoint: "counting/sales_package_unshipped" },
  ];

  for (const config of badgeConfigs) {
    try {
      if(typeof baseUrl === 'undefined' || typeof API_TOKEN === 'undefined' || typeof owner_id === 'undefined') continue;
      
      const response = await fetch(`${baseUrl}/${config.endpoint}/${owner_id}`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });

      const data = await response.json();
      const total = data?.countData?.total || 0;

      const badge = document.getElementById(config.id);
      if (badge) {
        badge.textContent = total;
        if (total > 0) {
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
      }
    } catch (error) {
      console.error(`Gagal memuat data untuk ${config.id}:`, error);
    }
  }
}

// Panggil loadBadge di awal
if (typeof loadBadge === "function") {
  loadBadge();
}

// ==========================================
// 5. Render Sidebar & Menu Modern
// ==========================================
const allMenus = {
  dashboard: { icon: `<svg class="w-5 h-5 opacity-75 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`, label: "Dashboard" },
  admin: { icon: `<svg class="w-5 h-5 opacity-75 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`, label: "Kelola Admin" },
  mitra: { icon: `<svg class="w-5 h-5 opacity-75 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, label: "Laporan Titik Outlet" },
  product: { icon: `<svg class="w-5 h-5 opacity-75 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`, label: "Konten Produk" },
  course: { icon: `<svg class="w-5 h-5 opacity-75 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`, label: "Konten Pelatihan" },
  content: { icon: `<svg class="w-5 h-5 opacity-75 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`, label: "Konten Kemitraan" },
};

const createMenuItem = (key, menu) => {
  const badgeSpan = `<span id="${key}QtyBadge" class="hidden ml-auto bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">0</span>`;
  

  return `
    <a href="#" id="menu-${key}" onclick="setActiveMenu('${key}'); loadModuleContent('${key}')" class="sidebar-item group flex items-center gap-3 py-2.5 px-3 mb-1 text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-gray-800 dark:hover:text-orange-400 rounded-lg transition-all duration-200">
      <div class="flex-shrink-0 flex items-center justify-center">${menu.icon}</div>
      <span class="menu-text whitespace-nowrap transition-all duration-300 flex-1 flex items-center pr-1">${menu.label} ${badgeSpan}</span>
    </a>`;
};

// Logika Submenu Cerdas: Jika sidebar sedang kecil, besarkan dulu lalu buka submenu
function handleSubMenuClick(submenuId, iconId) {
  if (window.innerWidth >= 768 && sidebar?.classList.contains("w-16")) {
    expandSidebar();
    setTimeout(() => toggleSubMenu(submenuId, iconId), 200); // Tunggu animasi ekspansi selesai
  } else {
    toggleSubMenu(submenuId, iconId);
  }
}

function toggleSubMenu(submenuId, iconId) {
  const submenu = document.getElementById(submenuId);
  const icon = document.getElementById(iconId);

  if (submenu) {
    submenu.classList.toggle("hidden");
    submenu.classList.toggle("flex");
  }
  if (icon) {
    icon.classList.toggle("rotate-90");
  }
}

function renderSidebar() {
  const menuContainer = document.getElementById("sidebarMenu");
  if (!menuContainer) return;
  menuContainer.innerHTML = "";

  menuContainer.innerHTML = `
    <div class="flex flex-col">
      
      ${createMenuItem("content", allMenus.content)}
      ${createMenuItem("product", allMenus.product)}
      ${createMenuItem("course", allMenus.course)}
         ${createMenuItem("mitra", allMenus.mitra)}
    </div>

    
    
  `;
}

// Fungsi untuk menandai menu yang sedang aktif
function setActiveMenu(activeKey) {
  // 1. Ambil semua elemen menu yang memiliki class 'sidebar-item'
  const allMenuItems = document.querySelectorAll('.sidebar-item');
  
  // 2. Reset semua menu ke tampilan default (abu-abu, tanpa background)
  allMenuItems.forEach(item => {
    // Hapus warna aktif
    item.classList.remove('bg-orange-50', 'text-orange-600', 'dark:bg-gray-800', 'dark:text-orange-400');
    // Kembalikan warna teks default
    item.classList.add('text-gray-600', 'dark:text-gray-300');
    
    // Kembalikan opacity icon menjadi agak transparan
    const icon = item.querySelector('svg');
    if(icon) icon.classList.add('opacity-75');
  });

  // 3. Cari menu yang baru saja diklik berdasarkan ID
  const activeItem = document.getElementById(`menu-${activeKey}`);
  if (activeItem) {
    // Hapus warna teks default
    activeItem.classList.remove('text-gray-600', 'dark:text-gray-300');
    // Tambahkan background dan warna teks aktif (orange)
    activeItem.classList.add('bg-orange-50', 'text-orange-600', 'dark:bg-gray-800', 'dark:text-orange-400');
    
    // Buat icon menjadi solid (tidak transparan)
    const icon = activeItem.querySelector('svg');
    if(icon) icon.classList.remove('opacity-75');
  }
}

renderSidebar();

// ==========================================
// 6. Polling API Status (Opsional)
// ==========================================
if (typeof checkApiStatus === "function") {
  checkApiStatus();
  setInterval(checkApiStatus, 10000); // Cek status tiap 10 detik
}
setTimeout(() => {
  setActiveMenu('product');
}, 100);
setInterval(loadBadge, 1000); // Refresh badge tiap 1 detik