pagemodule = 'Product';
colSpanCount = 9;
setDataType('product');

setupPriceInputEvents();

if (window.detail_id) {
  loadDetail(detail_id);
  document.getElementById('addButton').classList.add('hidden');
} else {
  document.getElementById('updateButton').classList.add('hidden');
  loadDropdown('formCategory', `${baseUrl}/list/product_category/${owner_id}`, 'category_id', 'category');
  loadKategoriOptions();
}

async function loadDropdown(selectId, apiUrl, valueField, labelField) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">Loading...</option>`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log(`Data untuk ${selectId}:`, result);
    const listData = result.listData;

    select.innerHTML = `<option value="">Pilih...</option>`;

    if (Array.isArray(listData)) {
      listData.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[labelField];
        select.appendChild(option);
      });
    } else {
      console.error('Format listData tidak sesuai:', listData);
    }

  } catch (error) {
    console.error(`Gagal memuat data untuk ${selectId}:`, error);
    select.innerHTML = `<option value="">Gagal memuat data</option>`;
  }
}

function switchTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

  // Remove active styling
  document.querySelectorAll('.tab-link').forEach(btn => {
    btn.classList.remove('bg-blue-100', 'text-blue-600', 'font-semibold');
    btn.classList.add('text-gray-600');
  });

  // Show selected tab
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');

  // Set active tab link
  document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('bg-blue-100', 'text-blue-600', 'font-semibold');
  document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.remove('text-gray-600');
}

async function loadDetail(Id) {
  document.getElementById('formTitle').innerText = `UPDATE DATA PRODUK`;
  window.detail_id = Id;

  await loadDropdown('formCategory', `${baseUrl}/list/product_category/${owner_id}`, 'category_id', 'category');

  try {
    const res = await fetch(`${baseUrl}/detail/product/${Id}?_=${Date.now()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      cache: 'no-store'
    });

    const { detail } = await res.json();
    
    // Sesuaikan mapping data dengan field baru
    document.getElementById('formProduct').value = detail.product || '';
    document.getElementById('formCategory').value = detail.category_id || '';
    document.getElementById('formStock').value = detail.stock || detail.limitstock || '';
    document.getElementById('formDescription').value = detail.description || '';
    
    // Format harga ke Rupiah
    document.getElementById('formPriceFree').value = detail.price_free?.toLocaleString('id-ID') || detail.sale_price?.toLocaleString('id-ID') || '';
    document.getElementById('formPriceVIP').value = detail.price_vip?.toLocaleString('id-ID') || '';

    const selectedBusinessCategories = (detail.business_categories || []).map(cat => cat.business_category_id);
    await loadKategoriOptions(Id, selectedBusinessCategories);

  } catch (err) {
    console.error('Gagal load detail:', err);
  }
}


async function loadKategoriOptions(Id, selectedIds = []) {
  try {
    const res = await fetch(`${baseUrl}/list/business_category/${owner_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await res.json();
    const kategoriList = result.listData || [];

    const container = document.getElementById('kategoriList');
    const countDisplay = document.getElementById('selectedCount');
    const searchInput = document.getElementById('searchKategori');

    container.innerHTML = '';
    countDisplay.textContent = `0 kategori dipilih`;

    // Pisahkan yang terpilih dan tidak terpilih
    const selectedItems = kategoriList.filter(item => selectedIds.includes(item.business_category_id));
    const unselectedItems = kategoriList.filter(item => !selectedIds.includes(item.business_category_id));
    const sortedList = [...selectedItems, ...unselectedItems];

    sortedList.forEach(item => {
      const checkboxWrapper = document.createElement('label');
      checkboxWrapper.className = "flex items-start gap-2 p-2 border rounded hover:bg-gray-100 kategori-item";

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'kategori';
      checkbox.value = item.business_category_id;
      checkbox.className = 'mt-1';

      // Jika termasuk yang dipilih
      if (selectedIds.includes(item.business_category_id)) {
        checkbox.checked = true;
        checkboxWrapper.classList.add('bg-green-100'); // Warna hijau
      }

      const labelText = document.createElement('div');
      labelText.innerHTML = `<strong>${item.business_category}</strong><br><small>${item.description || ''}</small>`;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(labelText);
      container.appendChild(checkboxWrapper);

      checkbox.addEventListener('change', () => updateSelectedCount());

      checkboxWrapper.dataset.category = `${item.business_category} ${item.description || ''}`.toLowerCase();
    });

    function updateSelectedCount() {
      const selected = container.querySelectorAll('input[name="kategori"]:checked').length;
      countDisplay.textContent = `${selected} kategori dipilih`;
    }

    // Inisialisasi count awal
    updateSelectedCount();

    // Pencarian
    searchInput.addEventListener('input', function () {
      const keyword = this.value.toLowerCase();
      const items = container.querySelectorAll('.kategori-item');

      items.forEach(item => {
        const text = item.dataset.category;
        item.style.display = text.includes(keyword) ? 'flex' : 'none';
      });
    });

  } catch (err) {
    console.error('Gagal load kategori:', err);
  }
}


function getDataPayload() {
  const getVal = id => document.getElementById(id).value.trim();
  const getInt = id => parseInt(getVal(id).replace(/\./g, ''), 10) || 0;

  const payload = {
    owner_id,
    product: getVal('formProduct'),
    category_id: parseInt(getVal('formCategory')),
    stock: getInt('formStock'),
    description: getVal('formDescription'),
    price_free: getInt('formPriceFree'),
    price_vip: getInt('formPriceVIP'),
    business_category_ids: Array.from(document.querySelectorAll('#kategoriForm input[name="kategori"]:checked'))
      .map(input => parseInt(input.value))
  };

  // Validasi wajib
  if (!payload.product || !payload.category_id || isNaN(payload.stock)) {
    Swal.fire({
      icon: 'warning',
      title: 'Lengkapi data',
      text: 'Pastikan Nama Produk, Kategori, dan Stok sudah diisi.'
    });
    return null;
  }

  return payload;
}

async function submitData(method, id = '') {
  const payload = getDataPayload();
  if (!payload) return;

  const url = `${baseUrl}/${method === 'POST' ? 'add' : 'update'}/product${id ? '/' + id : ''}`;
  const actionText = method === 'POST' ? 'ditambahkan' : 'diperbarui';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.data && result.data.id) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Produk berhasil ${actionText}`
      });
      loadModuleContent('product');
    } else {
      throw new Error(result.message || `Gagal ${actionText} produk`);
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.message || `Terjadi kesalahan saat ${actionText} produk.`
    });
  }
}

// Contoh penggunaan:
async function createData() {
  await submitData('POST');
}

async function updateData() {
  await submitData('PUT', detail_id);
}


async function loadKategoriOptions(Id, selectedIds = []) {
  try {
    const res = await fetch(`${baseUrl}/list/business_category/${owner_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    const result = await res.json();
    const kategoriList = result.listData || [];

    const container = document.getElementById('kategoriList');
    const countDisplay = document.getElementById('selectedCount');
    const searchInput = document.getElementById('searchKategori');

    container.innerHTML = '';
    countDisplay.textContent = `0 kategori dipilih`;

    // Pisahkan yang terpilih dan tidak terpilih
    const selectedItems = kategoriList.filter(item => selectedIds.includes(item.business_category_id));
    const unselectedItems = kategoriList.filter(item => !selectedIds.includes(item.business_category_id));
    const sortedList = [...selectedItems, ...unselectedItems];

    sortedList.forEach(item => {
      const checkboxWrapper = document.createElement('label');
      checkboxWrapper.className = "flex items-start gap-2 p-2 border rounded hover:bg-gray-100 kategori-item";

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'kategori';
      checkbox.value = item.business_category_id;
      checkbox.className = 'mt-1';

      // Jika termasuk yang dipilih
      if (selectedIds.includes(item.business_category_id)) {
        checkbox.checked = true;
        checkboxWrapper.classList.add('bg-green-100'); // Warna hijau
      }

      const labelText = document.createElement('div');
      labelText.innerHTML = `<strong>${item.business_category}</strong><br><small>${item.description || ''}</small>`;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(labelText);
      container.appendChild(checkboxWrapper);

      checkbox.addEventListener('change', () => updateSelectedCount());

      checkboxWrapper.dataset.category = `${item.business_category} ${item.description || ''}`.toLowerCase();
    });

    function updateSelectedCount() {
      const selected = container.querySelectorAll('input[name="kategori"]:checked').length;
      countDisplay.textContent = `${selected} kategori dipilih`;
    }

    // Inisialisasi count awal
    updateSelectedCount();

    // Pencarian
    searchInput.addEventListener('input', function () {
      const keyword = this.value.toLowerCase();
      const items = container.querySelectorAll('.kategori-item');

      items.forEach(item => {
        const text = item.dataset.category;
        item.style.display = text.includes(keyword) ? 'flex' : 'none';
      });
    });

  } catch (err) {
    console.error('Gagal load kategori:', err);
  }
}

function formatCurrencyInput(input) {
  const raw = input.value.replace(/[^\d]/g, '');
  if (!raw) {
    input.value = '';
    return;
  }
  input.value = parseInt(raw, 10).toLocaleString('id-ID');
}

function getNumericValue(inputId) {
  const val = document.getElementById(inputId).value.replace(/[^\d]/g, '');
  return parseInt(val || '0', 10);
}

function validatePrices() {
  const priceFree = getNumericValue('formPriceFree');
  const priceVIP = getNumericValue('formPriceVIP');
  const warnVIP = document.getElementById('warnPriceVIP');

  // Menampilkan peringatan jika Harga VIP lebih mahal dari Harga Free
  if (priceVIP > priceFree && priceFree > 0) {
    warnVIP.classList.remove('hidden');
    warnVIP.textContent = '⚠️ Harga VIP lebih tinggi dari Harga Free User.';
  } else {
    warnVIP.classList.add('hidden');
  }
}

function setupPriceInputEvents() {
  ['formPriceFree', 'formPriceVIP'].forEach(id => {
    const input = document.getElementById(id);
    if(input) {
        input.addEventListener('input', () => {
          formatCurrencyInput(input);
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(validatePrices, 800);
        });
    }
  });
}










