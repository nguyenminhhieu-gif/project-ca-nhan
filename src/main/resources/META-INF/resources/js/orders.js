/* ==========================================================================
   COFFEE SHOP - CUSTOMER ORDER HISTORY & TRACKING JAVASCRIPT
   ========================================================================== */

const ORDERS_API = "/orders";
let currentOrders = [];
let currentFilter = "ALL";
let orderToCancelId = null;

/* ==========================================================================
   STATUS STEPPER CONFIGURATION
   ========================================================================== */
const STATUS_STEPS = [
    { key: "PENDING", label: "Chờ duyệt", icon: "fa-hourglass-half" },
    { key: "PROCESSING", label: "Đang pha chế", icon: "fa-fire-burner" },
    { key: "DELIVERING", label: "Đang giao", icon: "fa-truck-fast" },
    { key: "COMPLETED", label: "Hoàn thành", icon: "fa-circle-check" }
];

/* ==========================================================================
   FORMAT DATE HELPER
   ========================================================================== */
function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const pad = (n) => String(n).padStart(2, '0');
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch (e) {
        return dateStr;
    }
}

/* ==========================================================================
   LOAD ORDERS FOR CURRENT USER
   ========================================================================== */
async function loadOrders() {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    if (!userId) {
        container.innerHTML = `
            <div class="empty-cart-state" style="padding: 60px 20px;">
                <div class="empty-cart-icon">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h3>Bạn chưa đăng nhập</h3>
                <p>Vui lòng đăng nhập để xem lịch sử và theo dõi tiến độ các đơn hàng của bạn.</p>
                <a href="login.html" class="btn btn-primary" style="margin-top: 10px;">
                    <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập ngay
                </a>
            </div>
        `;
        updateFilterCounts([]);
        return;
    }

    try {
        const response = await fetch(`${ORDERS_API}/user/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Lỗi khi tải đơn hàng.`);
        }

        const data = await response.json();
        currentOrders = Array.isArray(data) ? data : [];

        // Sắp xếp đơn hàng mới nhất lên đầu
        currentOrders.sort((a, b) => (b.id || 0) - (a.id || 0));

        updateFilterCounts(currentOrders);
        renderOrders();
    } catch (error) {
        console.error("Load orders error:", error);
        container.innerHTML = `
            <div class="empty-cart-state" style="padding: 50px 20px;">
                <div class="empty-cart-icon" style="color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1);">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3>Không thể tải danh sách đơn hàng</h3>
                <p>${error.message || "Đã xảy ra sự cố khi kết nối máy chủ. Vui lòng thử lại sau."}</p>
                <button class="btn btn-secondary" onclick="loadOrders()" style="margin-top: 10px;">
                    <i class="fa-solid fa-rotate"></i> Tải lại
                </button>
            </div>
        `;
    }
}

/* ==========================================================================
   UPDATE FILTER BADGE COUNTS
   ========================================================================== */
function updateFilterCounts(orders) {
    const counts = {
        ALL: orders.length,
        PENDING: 0,
        PROCESSING: 0,
        DELIVERING: 0,
        COMPLETED: 0,
        CANCELLED: 0
    };

    orders.forEach(o => {
        const st = (o.status || "").toUpperCase();
        if (counts[st] !== undefined) {
            counts[st]++;
        }
    });

    const setBadge = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setBadge("countAll", counts.ALL);
    setBadge("countPending", counts.PENDING);
    setBadge("countProcessing", counts.PROCESSING);
    setBadge("countDelivering", counts.DELIVERING);
    setBadge("countCompleted", counts.COMPLETED);
    setBadge("countCancelled", counts.CANCELLED);
}

/* ==========================================================================
   FILTER TABS SWITCH
   ========================================================================== */
function filterOrders(status) {
    currentFilter = status;
    const tabs = document.querySelectorAll(".order-filter-tab");
    tabs.forEach(tab => {
        tab.classList.remove("active");
        if (tab.getAttribute("onclick") && tab.getAttribute("onclick").includes(`'${status}'`)) {
            tab.classList.add("active");
        }
    });
    renderOrders();
}

/* ==========================================================================
   RENDER ORDERS LIST
   ========================================================================== */
function renderOrders() {
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    let filtered = currentOrders;
    if (currentFilter !== "ALL") {
        filtered = currentOrders.filter(o => (o.status || "").toUpperCase() === currentFilter);
    }

    if (!filtered || filtered.length === 0) {
        let msg = "Bạn chưa có đơn hàng nào.";
        if (currentFilter !== "ALL") {
            msg = `Không có đơn hàng nào ở trạng thái này.`;
        }
        container.innerHTML = `
            <div class="empty-cart-state" style="padding: 60px 20px;">
                <div class="empty-cart-icon">
                    <i class="fa-solid fa-receipt"></i>
                </div>
                <h3>${msg}</h3>
                <p>Khám phá thực đơn phong phú hoặc tự pha chế hương vị cà phê riêng biệt của bạn!</p>
                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 14px; flex-wrap: wrap;">
                    <a href="products.html" class="btn btn-primary">
                        <i class="fa-solid fa-mug-hot"></i> Khám phá thực đơn
                    </a>
                    <a href="custom-blend.html" class="btn btn-secondary">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Custom Brew Studio
                    </a>
                </div>
            </div>
        `;
        return;
    }

    let html = "";
    filtered.forEach(order => {
        html += createOrderCardHTML(order);
    });

    container.innerHTML = html;
}

/* ==========================================================================
   BUILD SINGLE ORDER CARD HTML
   ========================================================================== */
function createOrderCardHTML(order) {
    const status = (order.status || "PENDING").toUpperCase();
    const orderId = order.id || 0;
    const createdAtFormatted = formatDate(order.createdAt);
    const totalPrice = Number(order.totalPrice || 0);

    // Status Badge Details
    let statusBadgeClass = "status-pending";
    let statusBadgeText = "Chờ duyệt";
    let statusIcon = "fa-hourglass-half";

    if (status === "PROCESSING") {
        statusBadgeClass = "status-processing";
        statusBadgeText = "Đang pha chế";
        statusIcon = "fa-fire-burner";
    } else if (status === "DELIVERING") {
        statusBadgeClass = "status-delivering";
        statusBadgeText = "Đang giao hàng";
        statusIcon = "fa-truck-fast";
    } else if (status === "COMPLETED") {
        statusBadgeClass = "status-completed";
        statusBadgeText = "Hoàn thành";
        statusIcon = "fa-circle-check";
    } else if (status === "CANCELLED") {
        statusBadgeClass = "status-cancelled";
        statusBadgeText = "Đã hủy đơn";
        statusIcon = "fa-ban";
    }

    // Stepper Generation
    const stepperHTML = buildStepperHTML(status);

    // Items list
    const items = Array.isArray(order.items) ? order.items : [];
    let itemsHTML = "";

    if (items.length > 0) {
        items.forEach(item => {
            const rawImg = item.productImage || "caphesua.jpg";
            const imgSrc = rawImg.startsWith("images/") ? rawImg : `images/${rawImg}`;
            const itemPrice = Number(item.price || 0);
            const itemQty = Number(item.quantity || 1);
            const subtotal = Number(item.subtotal || (itemPrice * itemQty));

            itemsHTML += `
                <div class="order-item-row">
                    <div class="order-item-main">
                        <img src="${imgSrc}" class="order-item-img" alt="${item.productName || 'Món'}" onerror="this.onerror=null; this.src='images/banner.png';">
                        <div class="order-item-details">
                            <h5>${item.productName || 'Sản phẩm'}</h5>
                            <p>${formatVND(itemPrice)} × ${itemQty}</p>
                        </div>
                    </div>
                    <div class="order-item-pricing">
                        <span class="order-item-subtotal">${formatVND(subtotal)}</span>
                    </div>
                </div>
            `;
        });
    } else {
        itemsHTML = `
            <div style="font-size: 0.85rem; color: var(--text-muted); padding: 8px 0;">
                (Chi tiết món đang được đồng bộ)
            </div>
        `;
    }

    // Payment method text
    let paymentMethodText = "Tiền mặt khi nhận hàng (COD)";
    if (order.paymentMethod === "BANKING") paymentMethodText = "Chuyển khoản VietQR";
    if (order.paymentMethod === "MOMO") paymentMethodText = "Ví điện tử MoMo";
    if (order.paymentMethod === "VNPAY") paymentMethodText = "VNPAY";

    let paymentStatusBadge = "";
    if (order.paymentStatus === "SUCCESS") {
        paymentStatusBadge = `<span style="color: #10b981; font-weight: 600;"><i class="fa-solid fa-check-circle"></i> Đã thanh toán</span>`;
    } else {
        paymentStatusBadge = `<span style="color: #f59e0b; font-weight: 600;"><i class="fa-solid fa-clock"></i> Chờ thanh toán</span>`;
    }

    // Cancel Button (Only if PENDING)
    let cancelBtnHTML = "";
    if (status === "PENDING") {
        cancelBtnHTML = `
            <button class="btn-cancel-order" onclick="openCancelModal(${orderId})">
                <i class="fa-solid fa-ban"></i> Hủy đơn
            </button>
        `;
    }

    // Points earned preview
    const pointsEarned = Math.floor(totalPrice / 10000);

    return `
        <div class="order-card" id="order-card-${orderId}">
            <!-- HEADER -->
            <div class="order-card-header">
                <div class="order-meta-info">
                    <span class="order-code">Đơn Hàng #${orderId}</span>
                    <span class="order-date"><i class="fa-regular fa-clock"></i> ${createdAtFormatted}</span>
                </div>
                <div class="order-header-actions">
                    <span class="status-badge ${statusBadgeClass}">
                        <i class="fa-solid ${statusIcon}"></i> ${statusBadgeText}
                    </span>
                    ${cancelBtnHTML}
                </div>
            </div>

            <!-- STEPPER -->
            <div class="order-stepper-wrap">
                ${stepperHTML}
            </div>

            <!-- ITEMS -->
            <div class="order-items-list">
                ${itemsHTML}
            </div>

            <!-- FOOTER -->
            <div class="order-card-footer">
                <div class="order-delivery-meta">
                    <div><i class="fa-solid fa-user"></i> <strong>Người nhận:</strong> ${order.receiverName || order.customerName || "-"} (${order.phone || "-"})</div>
                    <div><i class="fa-solid fa-location-dot"></i> <strong>Địa chỉ:</strong> ${order.shippingAddress || "Tại quầy"}</div>
                    <div><i class="fa-solid fa-credit-card"></i> <strong>Thanh toán:</strong> ${paymentMethodText} — ${paymentStatusBadge}</div>
                    ${order.note ? `<div><i class="fa-solid fa-comment-dots"></i> <strong>Ghi chú:</strong> <em>${order.note}</em></div>` : ""}
                </div>

                <div class="order-total-block">
                    <span class="order-total-label">Tổng thanh toán:</span>
                    <span class="order-total-amount">${formatVND(totalPrice)}</span>
                    ${status === "COMPLETED" 
                        ? `<span style="font-size: 0.8rem; color: #fbbf24; margin-top: 4px;"><i class="fa-solid fa-coins"></i> Đã tích lũy +${pointsEarned} Bean</span>`
                        : `<span style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;"><i class="fa-solid fa-coins"></i> Dự kiến tích lũy +${pointsEarned} Bean</span>`}
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   STATUS STEPPER BUILDER
   ========================================================================== */
function buildStepperHTML(status) {
    if (status === "CANCELLED") {
        return `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #f87171; padding: 10px 0;">
                <i class="fa-solid fa-circle-xmark" style="font-size: 1.6rem;"></i>
                <div style="text-align: left;">
                    <div style="font-weight: 700; font-size: 1rem;">Đơn hàng đã được hủy bỏ</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">Đơn hàng này không còn tiếp tục thực hiện. Cảm ơn bạn!</div>
                </div>
            </div>
        `;
    }

    const stepIndexMap = {
        "PENDING": 0,
        "PROCESSING": 1,
        "DELIVERING": 2,
        "COMPLETED": 3
    };

    const currentIdx = stepIndexMap[status] !== undefined ? stepIndexMap[status] : 0;
    const progressPercent = (currentIdx / (STATUS_STEPS.length - 1)) * 100;

    let stepsHTML = "";
    STATUS_STEPS.forEach((step, idx) => {
        let stepClass = "";
        let stepIcon = step.icon;

        if (idx < currentIdx) {
            stepClass = "completed";
            stepIcon = "fa-check";
        } else if (idx === currentIdx) {
            stepClass = "active";
        }

        stepsHTML += `
            <div class="stepper-step ${stepClass}">
                <div class="stepper-icon">
                    <i class="fa-solid ${stepIcon}"></i>
                </div>
                <span class="stepper-label">${step.label}</span>
            </div>
        `;
    });

    return `
        <div class="stepper-steps">
            <div class="stepper-progress-line" style="width: calc(${progressPercent}% - 80px * ${progressPercent / 100});"></div>
            ${stepsHTML}
        </div>
    `;
}

/* ==========================================================================
   CANCEL ORDER MODAL & ACTION
   ========================================================================== */
function openCancelModal(orderId) {
    orderToCancelId = orderId;
    const modal = document.getElementById("cancelOrderModal");
    const textEl = document.getElementById("cancelModalText");
    if (textEl) {
        textEl.innerText = `Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không? Sau khi hủy, đơn hàng sẽ không thể khôi phục.`;
    }
    if (modal) modal.classList.remove("hidden");
}

function closeCancelModal() {
    orderToCancelId = null;
    const modal = document.getElementById("cancelOrderModal");
    if (modal) modal.classList.add("hidden");
}

async function executeCancelOrder() {
    if (!orderToCancelId) return;

    const btn = document.getElementById("btnConfirmCancel");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...`;
    }

    try {
        let response = await fetch(`${ORDERS_API}/${orderToCancelId}/cancel`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });

        // Fallback: If PUT /orders/{id}/cancel is not implemented or 404, try PUT /orders/{id}/status with CANCELLED
        if (response.status === 404 || response.status === 405) {
            response = await fetch(`${ORDERS_API}/${orderToCancelId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" })
            });
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || "Không thể hủy đơn hàng vào lúc này.");
        }

        showToast(`Đã hủy thành công đơn hàng #${orderToCancelId}`, "success");
        closeCancelModal();

        // Reload orders
        await loadOrders();
        if (typeof updateUserPointsBadge === "function") updateUserPointsBadge();

    } catch (error) {
        console.error("Cancel order error:", error);
        showToast(error.message || "Lỗi khi hủy đơn hàng", "error");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-ban"></i> Xác nhận hủy`;
        }
    }
}

// Auto load on ready
document.addEventListener("DOMContentLoaded", loadOrders);
