// DATA DEFAULT PRODUK
const defaultProduk = [
  {
    id: 1,
    nama: "Smartphone Premium",
    harga: 12000000,
    gambar: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    deskripsi: "Spesifikasi utama: layar 120Hz, RAM 12GB, memori 256GB."
  },
  {
    id: 2,
    nama: "Laptop Ultra",
    harga: 18500000,
    gambar: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    deskripsi: "Spesifikasi utama: Intel i7 Gen 13, RAM 16GB, SSD 1TB."
  }
];

// STATE LOKAL
let dataProduk = JSON.parse(localStorage.getItem('cityShop_produk')) || defaultProduk;
let dataPesanan = JSON.parse(localStorage.getItem('cityShop_pesanan')) || [];
let currentUser = null;

// FUNGSI UTAMA SAAT HALAMAN DIMUAT
document.addEventListener('DOMContentLoaded', () => {
  simpanDataKeStorage();
});

function simpanDataKeStorage() {
  localStorage.setItem('cityShop_produk', JSON.stringify(dataProduk));
  localStorage.setItem('cityShop_pesanan', JSON.stringify(dataPesanan));
}

// SYSTEM LOGIN
function login() {
  const u = document.getElementById('username').value.trim().toLowerCase();
  const p = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('loginError');

  if (u === "suci" && p === "12345") {
    currentUser = { username: "suci", role: "admin" };
    errorEl.innerText = "";
    bukaDashboard();
  } else if (u === "rara" && p === "1234") {
    currentUser = { username: "rara", role: "customer" };
    errorEl.innerText = "";
    bukaDashboard();
  } else {
    errorEl.innerText = "Username atau Password salah!";
  }
}

function logout() {
  currentUser = null;
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

function bukaDashboard() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('userGreeting').innerText = `Halo, ${currentUser.username.toUpperCase()} (${currentUser.role.toUpperCase()})`;

  if (currentUser.role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('customerPanel').style.display = 'none';
    renderAdminView();
  } else {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('customerPanel').style.display = 'block';
    renderCustomerView();
  }
}

/* --- FITUR ADMIN --- */
function renderAdminView() {
  // Render Tabel Inventaris Produk
  const tbodyProduk = document.getElementById('tabelAdminProduk');
  tbodyProduk.innerHTML = dataProduk.map(p => `
    <tr>
      <td><img src="${p.gambar}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
      <td><b>${p.nama}</b></td>
      <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
      <td>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="hapusProduk(${p.id})">Hapus</button>
      </td>
    </tr>
  `).join('');

  // Render Laporan Pesanan Admin
  const tbodyPesanan = document.getElementById('tabelAdminPesanan');
  if (dataPesanan.length === 0) {
    tbodyPesanan.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada pesanan masuk</td></tr>`;
  } else {
    tbodyPesanan.innerHTML = dataPesanan.map((p, index) => `
      <tr>
        <td>${p.tanggal}</td>
        <td>${p.pelanggan}</td>
        <td>${p.namaProduk}</td>
        <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
        <td><b>${p.status}</b></td>
        <td>
          <select onchange="ubahStatusPesanan(${index}, this.value)" style="padding:4px; font-size:12px;">
            <option value="Pesanan Belum Dibayar" ${p.status === 'Pesanan Belum Dibayar' ? 'selected' : ''}>Belum Dibayar</option>
            <option value="Pesanan Diproses" ${p.status === 'Pesanan Diproses' ? 'selected' : ''}>Diproses</option>
            <option value="Pesanan Dikirim" ${p.status === 'Pesanan Dikirim' ? 'selected' : ''}>Dikirim</option>
            <option value="Pesanan Selesai" ${p.status === 'Pesanan Selesai' ? 'selected' : ''}>Selesai</option>
          </select>
        </td>
      </tr>
    `).join('');
  }
}

function tambahProduk(e) {
  e.preventDefault();
  const nama = document.getElementById('namaProduk').value;
  const harga = parseInt(document.getElementById('hargaProduk').value);
  const gambar = document.getElementById('urlGambar').value;
  const video = document.getElementById('urlVideo').value;
  const deskripsi = document.getElementById('deskripsiProduk').value;

  const produkBaru = { id: Date.now(), nama, harga, gambar, video, deskripsi };
  dataProduk.push(produkBaru);
  simpanDataKeStorage();
  
  document.getElementById('formInputProduk').reset();
  showToast("Produk berhasil disimpan ke Database!");
  renderAdminView();
}

function hapusProduk(id) {
  dataProduk = dataProduk.filter(p => p.id !== id);
  simpanDataKeStorage();
  renderAdminView();
  showToast("Produk berhasil dihapus!");
}

function ubahStatusPesanan(index, statusBaru) {
  dataPesanan[index].status = statusBaru;
  simpanDataKeStorage();
  renderAdminView();
  showToast("Status pesanan diperbarui!");
}

/* --- FITUR CUSTOMER --- */
function switchCustomerTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');

  if (tabId === 'pesananTab') renderPesananCustomer();
}

function renderCustomerView() {
  const grid = document.getElementById('katalogGrid');
  grid.innerHTML = dataProduk.map(p => `
    <div class="produk-card">
      <img src="${p.gambar}" alt="${p.nama}">
      <div class="produk-info">
        <div class="produk-title">${p.nama}</div>
        <div class="harga-kontras">Rp ${p.harga.toLocaleString('id-ID')}</div>
        <div class="deskripsi-singkat">${p.deskripsi}</div>
        
        <div class="video-container">
          <video controls>
            <source src="${p.video}" type="video/mp4">
            Browser Anda tidak mendukung tag video.
          </video>
        </div>

        <a href="#" class="btn btn-primary" onclick="prosesCheckout(${p.id}); return false;">Beli Sekarang</a>
      </div>
    </div>
  `).join('');
}

function prosesCheckout(idProduk) {
  const p = dataProduk.find(item => item.id === idProduk);
  const pesananBaru = {
    tanggal: new Date().toISOString().split('T')[0],
    pelanggan: currentUser.username,
    namaProduk: p.nama,
    harga: p.harga,
    status: 'Pesanan Diproses'
  };

  dataPesanan.push(pesananBaru);
  simpanDataKeStorage();
  showToast("Pesanan berhasil dibuat!");
  switchCustomerTab('pesananTab');
}

function renderPesananCustomer() {
  const tbody = document.getElementById('tabelPesananCustomer');
  const pesananSaya = dataPesanan.filter(p => p.pelanggan === currentUser.username);

  if (pesananSaya.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada riwayat transaksi.</td></tr>`;
  } else {
    tbody.innerHTML = pesananSaya.map(p => `
      <tr>
        <td>${p.tanggal}</td>
        <td><b>${p.namaProduk}</b></td>
        <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
        <td><span style="background:#e2e8f0; padding:4px 8px; border-radius:4px; font-weight:bold;">${p.status}</span></td>
      </tr>
    `).join('');
  }
}

/* HELPER NOTIFIKASI TOAST */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
