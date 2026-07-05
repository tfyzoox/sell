// --- KONFIGURASI ---
// Ganti dengan nomor WhatsApp Anda (Gunakan kode negara tanpa +, contoh: 628...)
const ADMIN_WA_NUMBER = "6281234567890"; 

// --- DATABASE SIMULATOR (Menggunakan format JSON) ---
function getProducts() {
    const data = localStorage.getItem('db_products');
    // Jika kosong, berikan 1 produk contoh
    return data ? JSON.parse(data) : [
        { id: 1710000000000, name: "Kaos Polos Hitam Duff", price: 75000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" }
    ];
}

function saveProducts(products) {
    localStorage.setItem('db_products', JSON.stringify(products));
}

function getOrders() {
    const data = localStorage.getItem('db_orders');
    return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
    localStorage.setItem('db_orders', JSON.stringify(orders));
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

// --- LOGIKA HALAMAN UTAMA (PEMBELI) ---
function renderProducts() {
    const container = document.getElementById('product-list');
    const products = getProducts();
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Belum ada produk.</p>';
        return;
    }

    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${formatRupiah(p.price)}</p>
            <button class="btn-primary" onclick="checkout(${p.id})">Beli Sekarang</button>
        `;
        container.appendChild(div);
    });
}

function checkout(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if(!product) return;

    const buyerName = prompt("Masukkan nama Anda untuk melanjutkan pesanan:");
    if (!buyerName || buyerName.trim() === "") return alert("Nama harus diisi!");

    // 1. Buat ID Pesanan & Simpan ke Database
    const orderId = "ORD-" + Math.floor(Math.random() * 10000);
    const orders = getOrders();
    orders.push({
        id: orderId,
        buyer: buyerName,
        productName: product.name,
        price: product.price,
        status: "Pending" // Masuk dalam proses sampai di-ACC admin
    });
    saveOrders(orders);

    // 2. Arahkan ke WhatsApp
    const message = `Halo Admin, saya ingin memesan produk berikut:%0A%0A*ID Pesanan:* ${orderId}%0A*Nama:* ${buyerName}%0A*Produk:* ${product.name}%0A*Harga:* ${formatRupiah(product.price)}%0A%0AMohon konfirmasinya.`;
    const waLink = `https://wa.me/${ADMIN_WA_NUMBER}?text=${message}`;
    
    alert(`Pesanan berhasil dibuat dengan status PENDING. Anda akan dialihkan ke WhatsApp.`);
    window.open(waLink, '_blank');
}

// --- LOGIKA HALAMAN ADMIN ---
function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-list');
    if (!tbody) return;
    const products = getProducts();
    tbody.innerHTML = '';

    products.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${formatRupiah(p.price)}</td>
                <td><button class="btn-danger" onclick="deleteProduct(${p.id})">Hapus</button></td>
            </tr>
        `;
    });
}

function renderAdminOrders() {
    const tbody = document.getElementById('admin-order-list');
    if (!tbody) return;
    const orders = getOrders();
    tbody.innerHTML = '';

    orders.forEach(o => {
        const statusClass = o.status === 'Done' ? 'status-done' : 'status-pending';
        const actionBtn = o.status === 'Pending' 
            ? `<button class="btn-success" onclick="accOrder('${o.id}')">ACC (Done)</button>`
            : `<button class="btn-outline" disabled>Selesai</button>`;

        tbody.innerHTML += `
            <tr>
                <td>${o.id}</td>
                <td>${o.buyer}</td>
                <td>${o.productName}</td>
                <td class="${statusClass}">${o.status}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

function addProduct(name, price, image) {
    const products = getProducts();
    products.push({ id: Date.now(), name, price: parseInt(price), image });
    saveProducts(products);
    renderAdminProducts();
}

function deleteProduct(id) {
    if(confirm("Hapus produk ini?")) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderAdminProducts();
    }
}

function accOrder(orderId) {
    if(confirm("Terima pesanan ini dan ubah status menjadi Done?")) {
        let orders = getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            orders[orderIndex].status = "Done";
            saveOrders(orders);
            renderAdminOrders();
        }
    }
}
