/* ==========================================================================
   COFFEE SHOP - ADMIN PRODUCT MANAGEMENT JAVASCRIPT
   ========================================================================== */

const ADMIN_API = "/products";
let adminProductsCache = [];

const adminCategoryMap = {
    "coffee": { label: "Cà Phê", color: "#f59e0b" },
    "bakery": { label: "Bánh Ngọt", color: "#ec4899" },
    "services": { label: "Dịch Vụ", color: "#3b82f6" },
    "beans": { label: "Hạt & Phin", color: "#10b981" },
    "tea": { label: "Trà", color: "#84cc16" },
    "Drink": { label: "Đồ Uống", color: "#f59e0b" }
};

/* ==========================================================================
   LOAD PRODUCTS FOR ADMIN
   ========================================================================== */

async function loadAdminProducts() {
    const container = document.getElementById("adminProducts");
    if (!container) return;

    try {
        const response = await fetch(ADMIN_API);
        if (!response.ok) throw new Error("Load failed");

        const products = await response.json();
        adminProductsCache = products;
        renderAdminTable(products);

    } catch (error) {
        console.error("Load admin products error:", error);
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--danger);">
                <i class="fa-solid fa-circle-exclamation fa-2x" style="margin-bottom: 8px;"></i>
                <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại!</p>
            </div>
        `;
    }
}

/* ==========================================================================
   RENDER ADMIN TABLE
   ========================================================================== */

function renderAdminTable(products) {
    const container = document.getElementById("adminProducts");
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-box-open fa-2x" style="margin-bottom: 10px; color: var(--primary);"></i>
                <p>Chưa có sản phẩm nào trong hệ thống.</p>
                <button class="btn btn-primary" onclick="resetSampleProducts()" style="margin-top: 15px;">
                    <i class="fa-solid fa-rotate"></i> Nạp dữ liệu cà phê & dịch vụ mẫu ngay
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th style="width: 60px;">ID</th>
                    <th style="width: 80px;">Hình ảnh</th>
                    <th>Tên sản phẩm / Dịch vụ</th>
                    <th>Danh mục</th>
                    <th>Giá niêm yết</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th style="text-align: center; width: 120px;">Thao tác</th>
                </tr>
            </thead>
            <tbody>
    `;

    products.forEach(product => {
        const price = Number(product.price).toLocaleString('vi-VN') + " VND";
        const imageSrc = product.image ? `images/${product.image}` : "images/banner.png";
        const qty = product.quantity !== undefined ? product.quantity : 0;
        const cat = adminCategoryMap[product.category] || { label: product.category || "Khác", color: "#a3a3a3" };

        let statusPill = `<span class="badge-stock" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600;">Sẵn sàng</span>`;
        if (qty <= 0) {
            statusPill = `<span class="badge-stock" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600;">Hết hàng</span>`;
        } else if (qty < 10) {
            statusPill = `<span class="badge-stock" style="background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600;">Sắp hết (${qty})</span>`;
        }

        html += `
            <tr>
                <td style="color: var(--text-muted); font-weight: 600;">#${product.id}</td>
                <td>
                    <img src="${imageSrc}" 
                         class="admin-prod-thumb" 
                         alt="${product.name}" 
                         onerror="this.onerror=null; this.src='images/banner.png';">
                </td>
                <td>
                    <div style="font-weight: 600; color: #ffffff;">${product.name}</div>
                    <div style="font-size: 0.78rem; color: #888; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${product.description || "Chưa có mô tả"}
                    </div>
                </td>
                <td>
                    <span style="color: ${cat.color}; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
                        ${cat.label}
                    </span>
                </td>
                <td style="color: var(--primary-light); font-weight: 700;">${price}</td>
                <td>${qty}</td>
                <td>${statusPill}</td>
                <td style="text-align: center;">
                    <div class="table-action-btns" style="justify-content: center;">
                        <button class="btn-icon-action btn-edit" onclick="editProduct(${product.id})" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon-action btn-del" onclick="deleteProduct(${product.id})" title="Xóa">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

/* ==========================================================================
   SEARCH ADMIN PRODUCTS
   ========================================================================== */

function searchAdminProducts() {
    const input = document.getElementById("adminSearchInput");
    if (!input) return;

    const val = input.value.trim().toLowerCase();
    if (!val) {
        renderAdminTable(adminProductsCache);
        return;
    }

    const filtered = adminProductsCache.filter(p =>
        p.name.toLowerCase().includes(val) || 
        String(p.id).includes(val) ||
        (p.category && p.category.toLowerCase().includes(val))
    );

    renderAdminTable(filtered);
}

/* ==========================================================================
   MODAL CONTROLS (OPEN / CLOSE)
   ========================================================================== */

function openAddModal() {
    document.getElementById("modalTitle").innerText = "Thêm Sản Phẩm Mới";
    document.getElementById("productId").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productCategory").value = "coffee";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "100";
    document.getElementById("productImage").value = "caphesua.jpg";
    document.getElementById("productDescription").value = "";

    const modal = document.getElementById("productModal");
    if (modal) modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.classList.add("hidden");
}

/* ==========================================================================
   SAVE PRODUCT (CREATE OR UPDATE)
   ========================================================================== */

async function saveProduct() {
    const id = document.getElementById("productId").value;
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);
    const image = document.getElementById("productImage").value.trim();
    const description = document.getElementById("productDescription").value.trim();

    if (!name || isNaN(price) || isNaN(quantity) || !image) {
        showToast("Vui lòng điền đầy đủ thông tin sản phẩm!", "warning");
        return;
    }

    const product = {
        name: name,
        category: category,
        price: price,
        quantity: quantity,
        image: image,
        description: description,
        status: "ACTIVE"
    };

    let url = ADMIN_API;
    let method = "POST";

    if (id) {
        url += "/" + id;
        method = "PUT";
        product.id = parseInt(id);
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            showToast("Lưu sản phẩm thất bại", "error");
            return;
        }

        showToast(id ? "Cập nhật sản phẩm thành công!" : "Thêm mới sản phẩm thành công!", "success");
        closeModal();
        loadAdminProducts();

    } catch (error) {
        console.error("Save product error:", error);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

/* ==========================================================================
   EDIT PRODUCT
   ========================================================================== */

async function editProduct(id) {
    try {
        const response = await fetch(`${ADMIN_API}/${id}`);
        if (!response.ok) throw new Error("Fetch failed");

        const product = await response.json();

        document.getElementById("modalTitle").innerText = "Chỉnh Sửa Sản Phẩm / Dịch Vụ";
        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name || "";
        document.getElementById("productCategory").value = product.category || "coffee";
        document.getElementById("productPrice").value = product.price || 0;
        document.getElementById("productQuantity").value = product.quantity !== undefined ? product.quantity : 0;
        document.getElementById("productImage").value = product.image || "";
        document.getElementById("productDescription").value = product.description || "";

        const modal = document.getElementById("productModal");
        if (modal) modal.classList.remove("hidden");

    } catch (error) {
        console.error("Edit product fetch error:", error);
        showToast("Không thể tải thông tin sản phẩm", "error");
    }
}

/* ==========================================================================
   DELETE PRODUCT
   ========================================================================== */

async function deleteProduct(id) {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm/dịch vụ #${id} không?`)) {
        return;
    }

    try {
        const response = await fetch(`${ADMIN_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            showToast("Xóa sản phẩm thất bại", "error");
            return;
        }

        showToast("Đã xóa sản phẩm thành công!", "success");
        loadAdminProducts();

    } catch (error) {
        console.error("Delete product error:", error);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

/* ==========================================================================
   RESET SAMPLE PRODUCTS
   ========================================================================== */

async function resetSampleProducts() {
    if (!confirm("Hệ thống sẽ nạp lại toàn bộ 19 sản phẩm cà phê và dịch vụ phụ mẫu chuẩn. Bạn có muốn tiếp tục không?")) {
        return;
    }

    try {
        const response = await fetch(`${ADMIN_API}/seed`, {
            method: "POST"
        });

        if (!response.ok) {
            showToast("Khôi phục dữ liệu mẫu thất bại", "error");
            return;
        }

        showToast("Khôi phục thành công danh mục Cà Phê & Dịch Vụ phụ!", "success");
        loadAdminProducts();
    } catch (e) {
        console.error("Reset sample error:", e);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

// Auto load
document.addEventListener("DOMContentLoaded", () => {
    loadAdminProducts();
});
