/* ==========================================================================
   COFFEE SHOP - PRODUCT DETAIL JAVASCRIPT
   ========================================================================== */

const API_URL = "/products";
let currentProduct = null;
let selectedSize = "M";

const detailCatMap = {
    "coffee": { label: "Cà Phê", icon: "fa-mug-hot", unit: "ly" },
    "bakery": { label: "Bánh Ngọt", icon: "fa-cake-candles", unit: "phần" },
    "services": { label: "Dịch Vụ & Tiện Ích", icon: "fa-laptop-code", unit: "gói" },
    "beans": { label: "Hạt & Phin", icon: "fa-seedling", unit: "gói" },
    "tea": { label: "Trà Thanh Nhiệt", icon: "fa-leaf", unit: "ly" },
    "Drink": { label: "Đồ Uống", icon: "fa-glass-water", unit: "ly" }
};

/* ==========================================================================
   LOAD PRODUCT DETAIL
   ========================================================================== */

async function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const container = document.getElementById("productDetail");
    const breadcrumb = document.getElementById("breadcrumbCurrent");

    if (!id) {
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 60px 20px;">
                    <i class="fa-solid fa-triangle-exclamation fa-3x" style="color: var(--warning); margin-bottom: 15px;"></i>
                    <h2 style="color: #fff; margin-bottom: 10px;">Không tìm thấy mã sản phẩm</h2>
                    <p style="color: var(--text-muted); margin-bottom: 25px;">Vui lòng chọn sản phẩm từ danh mục thực đơn.</p>
                    <a href="products.html" class="btn btn-primary">Xem thực đơn</a>
                </div>
            `;
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Product not found");

        const product = await response.json();
        currentProduct = product;

        if (breadcrumb) breadcrumb.innerText = product.name;

        const catInfo = detailCatMap[product.category] || { label: "Đặc Sản", icon: "fa-tag", unit: "phần" };
        const formattedPrice = Number(product.price).toLocaleString('vi-VN') + " VND";
        const imageSrc = product.image ? `images/${product.image}` : "images/banner.png";
        const stockCount = product.quantity !== undefined ? product.quantity : 50;
        const descText = product.description && product.description.trim() 
            ? product.description 
            : "Hương vị thơm ngon tuyệt hảo, được chế tác tỉ mỉ từ nguyên liệu thượng hạng.";

        // Chỉ hiển thị chọn Size nếu là Cà phê hoặc Trà đồ uống
        const isDrink = product.category === "coffee" || product.category === "tea" || product.category === "Drink";
        const sizeSelectorHtml = isDrink ? `
            <!-- SIZE SELECTOR -->
            <div class="option-group">
                <label><i class="fa-solid fa-mug-saucer" style="color: var(--primary);"></i> Chọn kích cỡ:</label>
                <div class="size-chips">
                    <div class="size-chip" onclick="selectProductSize('S', 0, this)">Size S (Nhỏ)</div>
                    <div class="size-chip active" onclick="selectProductSize('M', 0, this)">Size M (Vừa)</div>
                    <div class="size-chip" onclick="selectProductSize('L', 6000, this)">Size L (Lớn +6k)</div>
                </div>
            </div>
        ` : `
            <div class="option-group" style="padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 0.88rem; color: #d4d4d4; margin: 0;">
                    <i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 6px;"></i>
                    Cam kết chất lượng chuẩn vị, phục vụ tận tâm và nhanh chóng.
                </p>
            </div>
        `;

        container.innerHTML = `
            <div class="detail-card">
                <div class="detail-image">
                    <img src="${imageSrc}" 
                         alt="${product.name}" 
                         onerror="this.onerror=null; this.src='images/banner.png';">
                </div>

                <div class="detail-info">
                    <div class="detail-meta">
                        <span class="badge-stock" style="background: rgba(217,119,6,0.15); color: var(--primary-light); border: 1px solid rgba(217,119,6,0.3);">
                            <i class="fa-solid ${catInfo.icon}"></i> ${catInfo.label}
                        </span>
                        <span class="badge-stock">
                            <i class="fa-solid fa-check-circle"></i> Sẵn sàng: ${stockCount} ${catInfo.unit}
                        </span>
                        <div class="card-rating" style="margin-bottom: 0;">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <span style="color: #fff; font-weight: 600;">(4.9 / 5.0)</span>
                        </div>
                    </div>

                    <h1>${product.name}</h1>
                    <div class="detail-price" id="displayDetailPrice">${formattedPrice}</div>

                    <p class="detail-desc" style="white-space: pre-line; line-height: 1.8;">
                        ${descText}
                    </p>

                    ${sizeSelectorHtml}

                    <!-- QUANTITY STEPPER -->
                    <div class="qty-stepper-wrap">
                        <label style="font-weight: 600; font-size: 0.95rem; margin-right: 8px;">Số lượng:</label>
                        <div class="qty-stepper">
                            <button onclick="changeQty(-1)"><i class="fa-solid fa-minus"></i></button>
                            <input type="number" id="detailQtyInput" value="1" min="1" max="${stockCount}" readonly>
                            <button onclick="changeQty(1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="handleAddToCart(false)">
                            <i class="fa-solid fa-cart-plus"></i>
                            Thêm vào giỏ hàng
                        </button>
                        <button class="btn btn-secondary" onclick="handleAddToCart(true)">
                            <i class="fa-solid fa-bolt"></i>
                            Đặt mua ngay
                        </button>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error loading detail:", error);
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 60px 20px;">
                    <i class="fa-solid fa-circle-xmark fa-3x" style="color: var(--danger); margin-bottom: 15px;"></i>
                    <h2 style="color: #fff; margin-bottom: 10px;">Lỗi tải thông tin sản phẩm</h2>
                    <p style="color: var(--text-muted); margin-bottom: 25px;">Không thể tìm thấy sản phẩm này trên hệ thống.</p>
                    <a href="products.html" class="btn btn-primary">Quay lại thực đơn</a>
                </div>
            `;
        }
    }
}

/* ==========================================================================
   SIZE SELECTOR
   ========================================================================== */

function selectProductSize(size, extraPrice, element) {
    selectedSize = size;
    document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

    if (!currentProduct) return;
    const basePrice = Number(currentProduct.price);
    const finalPrice = basePrice + extraPrice;

    const displayEl = document.getElementById("displayDetailPrice");
    if (displayEl) {
        displayEl.innerText = finalPrice.toLocaleString('vi-VN') + " VND";
    }
}

/* ==========================================================================
   QUANTITY HANDLER
   ========================================================================== */

function changeQty(delta) {
    const input = document.getElementById("detailQtyInput");
    if (!input) return;

    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    input.value = val;
}

/* ==========================================================================
   HANDLE ADD TO CART
   ========================================================================== */

async function handleAddToCart(isBuyNow = false) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        showToast("Vui lòng đăng nhập để đặt hàng!", "warning");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
        return;
    }

    if (!currentProduct) return;

    const qtyInput = document.getElementById("detailQtyInput");
    const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;

    const data = {
        userId: userId,
        productId: currentProduct.id,
        quantity: quantity
    };

    try {
        const response = await fetch("/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const err = await response.text();
            showToast(err || "Lỗi khi thêm vào giỏ hàng", "error");
            return;
        }

        showToast(`Đã thêm ${quantity} x ${currentProduct.name} vào giỏ hàng!`, "success");

        if (typeof updateCartBadge === "function") {
            updateCartBadge();
        }

        if (isBuyNow) {
            setTimeout(() => {
                window.location.href = "cart.html";
            }, 800);
        }

    } catch (e) {
        console.error("Add to cart error:", e);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProductDetail();
});
