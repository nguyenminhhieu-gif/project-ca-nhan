/* ==========================================================================
   COFFEE SHOP - PRODUCT CATALOG JAVASCRIPT
   ========================================================================== */

const PRODUCT_API = "/products";
let allProductsList = [];
let currentSelectedProduct = null;

// Map category code to display label
const categoryMap = {
    "coffee": { label: "Cà Phê", icon: "fa-mug-hot", color: "#f59e0b" },
    "bakery": { label: "Bánh Ngọt", icon: "fa-cake-candles", color: "#ec4899" },
    "services": { label: "Dịch Vụ", icon: "fa-laptop-code", color: "#3b82f6" },
    "beans": { label: "Hạt & Phin", icon: "fa-seedling", color: "#10b981" },
    "tea": { label: "Trà Thanh Nhiệt", icon: "fa-leaf", color: "#84cc16" },
    "Drink": { label: "Đồ Uống", icon: "fa-glass-water", color: "#f59e0b" }
};

/* ==========================================================================
   LOAD PRODUCTS
   ========================================================================== */

async function loadProducts() {
    const container = document.getElementById("products");
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary); margin-bottom: 12px;"></i>
            <p>Đang tải danh sách cà phê & dịch vụ...</p>
        </div>
    `;

    try {
        const response = await fetch(PRODUCT_API);
        if (!response.ok) throw new Error("Fetch failed");
        
        allProductsList = await response.json();
        renderProducts(allProductsList);
    } catch (error) {
        console.error("Load products error:", error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
                <i class="fa-solid fa-circle-exclamation fa-2x" style="margin-bottom: 10px;"></i>
                <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!</p>
            </div>
        `;
    }
}

/* ==========================================================================
   RENDER PRODUCTS
   ========================================================================== */

function renderProducts(products) {
    const container = document.getElementById("products");
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-mug-saucer fa-3x" style="color: var(--primary); margin-bottom: 15px; opacity: 0.7;"></i>
                <h3 style="color: #fff; font-size: 1.3rem; margin-bottom: 8px;">Không tìm thấy sản phẩm nào</h3>
                <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác nhé!</p>
            </div>
        `;
        return;
    }

    let html = "";

    products.forEach((product, index) => {
        const catInfo = categoryMap[product.category] || { label: "Đặc Sản", icon: "fa-tag", color: "#d97706" };
        const formattedPrice = Number(product.price).toLocaleString('vi-VN') + " VND";
        const imageSrc = product.image ? `images/${product.image}` : "images/banner.png";
        
        // Mô tả sản phẩm
        const descText = product.description && product.description.trim() 
            ? product.description 
            : "Hương vị thơm ngon đậm đà, được chế tác tỉ mỉ từ nguyên liệu hảo hạng nhất.";

        // Badge góc sản phẩm
        let badgeText = "Best Seller";
        if (product.category === "services") badgeText = "Dịch Vụ Tiện Ích";
        else if (product.category === "bakery") badgeText = "Bánh Mới Ra Lò";
        else if (product.category === "beans") badgeText = "Hạt Rang Mộc";
        else if (index % 4 === 1) badgeText = "Signature";
        else if (index % 4 === 2) badgeText = "Yêu Thích";
        else if (index % 4 === 3) badgeText = "Món Mới";

        html += `
            <div class="card">
                <span class="card-badge-top">${badgeText}</span>
                
                <div class="product-img-wrap" onclick="viewProductDetail(${product.id})" style="cursor: pointer;">
                    <img src="${imageSrc}" 
                         class="product-image" 
                         alt="${product.name}" 
                         onerror="this.onerror=null; this.src='images/banner.png';">
                </div>

                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.78rem; font-weight: 700; color: ${catInfo.color}; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid ${catInfo.icon}"></i> ${catInfo.label}
                        </span>

                        <div class="card-rating" style="margin-bottom: 0;">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star-half-stroke"></i>
                            <span>(4.9)</span>
                        </div>
                    </div>

                    <h3 onclick="viewProductDetail(${product.id})" style="cursor: pointer; font-size: 1.15rem; margin-bottom: 8px;" title="${product.name}">
                        ${product.name}
                    </h3>
                    
                    <p class="card-desc-brief" style="font-size: 0.85rem; color: #a3a3a3; line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 38px;">
                        ${descText}
                    </p>

                    <div class="card-footer-action">
                        <div class="price" style="font-size: 1.15rem;">${formattedPrice}</div>
                        <button class="card-btn-add" onclick="openProductModalById(${product.id})" title="Thêm vào giỏ hàng / Đặt dịch vụ">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/* ==========================================================================
   SEARCH PRODUCTS
   ========================================================================== */

function searchProducts() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const keyword = input.value.trim().toLowerCase();

    if (!keyword) {
        renderProducts(allProductsList);
        return;
    }

    const filtered = allProductsList.filter(product =>
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword)) ||
        (product.category && product.category.toLowerCase().includes(keyword))
    );

    renderProducts(filtered);
}

/* ==========================================================================
   FILTER CATEGORY
   ========================================================================== */

function filterCategory(category, buttonEl) {
    // Update active filter chip UI
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');

    if (category === 'all') {
        renderProducts(allProductsList);
        return;
    }

    const filtered = allProductsList.filter(p => {
        const cat = (p.category || "").toLowerCase();
        const name = p.name.toLowerCase();

        if (category === 'coffee') {
            return cat === 'coffee' || cat === 'drink' || name.includes('cà phê') || name.includes('caphe') || name.includes('bạc xỉu') || name.includes('espresso') || name.includes('cold brew') || name.includes('cappuccino') || name.includes('americano');
        }
        if (category === 'bakery') {
            return cat === 'bakery' || name.includes('bánh') || name.includes('croissant') || name.includes('tiramisu') || name.includes('cookie');
        }
        if (category === 'services') {
            return cat === 'services' || name.includes('co-working') || name.includes('workshop') || name.includes('tiệc trà') || name.includes('dịch vụ') || name.includes('combo');
        }
        if (category === 'beans') {
            return cat === 'beans' || name.includes('hạt') || name.includes('phin') || name.includes('robusta') || name.includes('arabica');
        }
        if (category === 'tea') {
            return cat === 'tea' || name.includes('trà') || name.includes('tra');
        }
        return true;
    });

    renderProducts(filtered);
}

/* ==========================================================================
   NAVIGATION TO DETAIL
   ========================================================================== */

function viewProductDetail(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

function addToCart(id) {
    viewProductDetail(id);
}

/* ==========================================================================
   MODAL QUICK BUY
   ========================================================================== */

function openProductModalById(id) {
    const product = allProductsList.find(p => p.id === id);
    if (!product) return;

    currentSelectedProduct = product;

    const modalImg = document.getElementById("modalImage");
    const modalName = document.getElementById("modalName");
    const modalPrice = document.getElementById("modalPrice");
    const qtyInput = document.getElementById("qtyInput");
    const modal = document.getElementById("productModal");

    if (modalImg) modalImg.src = product.image ? `images/${product.image}` : "images/banner.png";
    if (modalName) modalName.innerText = product.name;
    if (modalPrice) modalPrice.innerText = Number(product.price).toLocaleString('vi-VN') + " VND";
    if (qtyInput) qtyInput.value = 1;

    if (modal) modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.classList.add("hidden");
}

function changeQty(val) {
    const input = document.getElementById("qtyInput");
    if (!input) return;

    let current = parseInt(input.value) || 1;
    current += val;
    if (current < 1) current = 1;
    input.value = current;
}

/* ==========================================================================
   CONFIRM ADD TO CART
   ========================================================================== */

async function confirmAddToCart() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        showToast("Vui lòng đăng nhập để thêm món vào giỏ hàng!", "warning");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
        return;
    }

    if (!currentSelectedProduct) return;

    const qtyInput = document.getElementById("qtyInput");
    const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;

    const data = {
        userId: userId,
        productId: currentSelectedProduct.id,
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
            const errText = await response.text();
            showToast(errText || "Lỗi khi thêm giỏ hàng", "error");
            return;
        }

        showToast(`Đã thêm ${quantity} x ${currentSelectedProduct.name} vào giỏ hàng!`, "success");
        closeModal();
        if (typeof updateCartBadge === "function") {
            updateCartBadge();
        }
    } catch (error) {
        console.error("Confirm add to cart error:", error);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

// Auto load on ready
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
