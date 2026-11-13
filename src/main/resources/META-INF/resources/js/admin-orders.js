/* ==========================================================================
   COFFEE SHOP - ADMIN ORDER MANAGEMENT JAVASCRIPT
   ========================================================================== */

const ORDERS_API = "/orders";

let adminOrdersCache = [];
let currentStatusFilter = "ALL";
let isUpdatingStatus = false;

// Status metadata for display
const orderStatusMap = {
    "PENDING": {
        label: "Chờ xử lý",
        badgeClass: "badge-status-pending",
        icon: "fa-hourglass-half",
        color: "#f59e0b"
    },
    "PROCESSING": {
        label: "Đang pha chế",
        badgeClass: "badge-status-processing",
        icon: "fa-mug-hot",
        color: "#60a5fa"
    },
    "DELIVERING": {
        label: "Đang giao",
        badgeClass: "badge-status-delivering",
        icon: "fa-truck-fast",
        color: "#c084fc"
    },
    "COMPLETED": {
        label: "Hoàn thành",
        badgeClass: "badge-status-completed",
        icon: "fa-circle-check",
        color: "#10b981"
    },
    "CANCELLED": {
        label: "Đã hủy",
        badgeClass: "badge-status-cancelled",
        icon: "fa-circle-xmark",
        color: "#ef4444"
    }
};

/* ==========================================================================
   LOAD ORDERS FROM BACKEND (GET /orders)
   ========================================================================== */

async function loadAdminOrders(showFeedback = false) {
    const container = document.getElementById("ordersTableContainer");
    const refreshIcon = document.getElementById("refreshIcon");

    if (refreshIcon) refreshIcon.classList.add("fa-spin");

    try {
        const response = await fetch(ORDERS_API);
        if (!response.ok) throw new Error("HTTP error " + response.status);

        const orders = await response.json();
        adminOrdersCache = Array.isArray(orders) ? orders : [];

        updateStatsOverview(adminOrdersCache);
        updateStatusTabBadges(adminOrdersCache);
        filterAdminOrders();

        if (showFeedback && typeof showToast === "function") {
            showToast("Đã đồng bộ danh sách đơn hàng mới nhất!", "info", 2000);
        }
    } catch (error) {
        console.error("Load admin orders error:", error);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--danger);">
                    <i class="fa-solid fa-circle-exclamation fa-2x" style="margin-bottom: 10px;"></i>
                    <p style="font-size: 1.05rem; font-weight: 600;">Không thể tải dữ liệu đơn hàng từ máy chủ.</p>
                    <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px;">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
                    <button class="btn btn-primary" onclick="loadAdminOrders(true)" style="margin-top: 16px;">
                        <i class="fa-solid fa-rotate-right"></i> Thử lại
                    </button>
                </div>
            `;
        }
        if (typeof showToast === "function") {
            showToast("Lỗi tải danh sách đơn hàng!", "error");
        }
    } finally {
        if (refreshIcon) {
            setTimeout(() => {
                refreshIcon.classList.remove("fa-spin");
            }, 400);
        }
    }
}

/* ==========================================================================
   STATS OVERVIEW UPDATE
   ========================================================================== */

function updateStatsOverview(orders) {
    let total = orders.length;
    let pendingCount = 0;
    let activeCount = 0;
    let completedRevenue = 0;

    orders.forEach(order => {
        const s = (order.status || "").toUpperCase();
        if (s === "PENDING") {
            pendingCount++;
        } else if (s === "PROCESSING" || s === "DELIVERING") {
            activeCount++;
        } else if (s === "COMPLETED") {
            completedRevenue += (order.totalPrice || 0);
        }
    });

    const statTotalEl = document.getElementById("statTotalOrders");
    const statPendingEl = document.getElementById("statPendingOrders");
    const statActiveEl = document.getElementById("statActiveOrders");
    const statRevenueEl = document.getElementById("statCompletedRevenue");

    if (statTotalEl) statTotalEl.innerText = total;
    if (statPendingEl) statPendingEl.innerText = pendingCount;
    if (statActiveEl) statActiveEl.innerText = activeCount;
    if (statRevenueEl) {
        statRevenueEl.innerText = (typeof formatVND === "function") 
            ? formatVND(completedRevenue) 
            : Number(completedRevenue).toLocaleString('vi-VN') + " VND";
    }
}

/* ==========================================================================
   TAB BADGES UPDATE
   ========================================================================== */

function updateStatusTabBadges(orders) {
    const counts = {
        "ALL": orders.length,
        "PENDING": 0,
        "PROCESSING": 0,
        "DELIVERING": 0,
        "COMPLETED": 0,
        "CANCELLED": 0
    };

    orders.forEach(order => {
        const s = (order.status || "").toUpperCase();
        if (counts.hasOwnProperty(s)) {
            counts[s]++;
        }
    });

    for (const [key, count] of Object.entries(counts)) {
        const badgeEl = document.getElementById(`count-${key}`);
        if (badgeEl) badgeEl.innerText = count;
    }
}

/* ==========================================================================
   STATUS TAB SWITCHING
   ========================================================================== */

function switchStatusTab(statusKey, btnElement) {
    currentStatusFilter = statusKey;

    document.querySelectorAll(".order-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    if (btnElement) {
        btnElement.classList.add("active");
    }

    const tabHeadings = {
        "ALL": "Danh sách tất cả đơn hàng",
        "PENDING": "Đơn hàng đang chờ duyệt xử lý",
        "PROCESSING": "Đơn hàng đang pha chế tại quầy",
        "DELIVERING": "Đơn hàng đang giao đến khách",
        "COMPLETED": "Đơn hàng đã giao thành công",
        "CANCELLED": "Đơn hàng đã hủy"
    };

    const headingEl = document.getElementById("currentTabHeading");
    if (headingEl) {
        headingEl.innerText = tabHeadings[statusKey] || "Danh sách đơn hàng";
    }

    filterAdminOrders();
}

/* ==========================================================================
   FILTER & SEARCH ORDERS
   ========================================================================== */

function filterAdminOrders() {
    const searchInput = document.getElementById("orderSearchInput");
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filtered = adminOrdersCache.filter(order => {
        const status = (order.status || "").toUpperCase();
        if (currentStatusFilter !== "ALL" && status !== currentStatusFilter) {
            return false;
        }

        if (!keyword) return true;

        const idMatch = String(order.id || "").toLowerCase().includes(keyword.replace("#", ""));
        const nameMatch = (order.receiverName || "").toLowerCase().includes(keyword) ||
                          (order.customerName || "").toLowerCase().includes(keyword);
        const phoneMatch = (order.phone || "").toLowerCase().includes(keyword);
        const addressMatch = (order.shippingAddress || "").toLowerCase().includes(keyword);

        let itemMatch = false;
        if (order.items && order.items.length > 0) {
            itemMatch = order.items.some(it => (it.productName || "").toLowerCase().includes(keyword));
        }

        return idMatch || nameMatch || phoneMatch || addressMatch || itemMatch;
    });

    const summaryEl = document.getElementById("orderCountSummary");
    if (summaryEl) {
        summaryEl.innerText = `Hiển thị ${filtered.length} trên tổng số ${adminOrdersCache.length} đơn`;
    }

    renderOrdersTable(filtered);
}

/* ==========================================================================
   RENDER ORDERS TABLE
   ========================================================================== */

function renderOrdersTable(orders) {
    const container = document.getElementById("ordersTableContainer");
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-clipboard-question fa-3x" style="color: rgba(217,119,6,0.4); margin-bottom: 14px;"></i>
                <h4 style="color: #fff; font-size: 1.1rem; margin-bottom: 6px;">Không tìm thấy đơn hàng nào</h4>
                <p style="font-size: 0.88rem;">Không có đơn hàng nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại.</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th style="width: 110px;">Mã Đơn</th>
                    <th style="width: 170px;">Khách Hàng</th>
                    <th style="width: 200px;">Địa Chỉ Giao</th>
                    <th style="min-width: 220px;">Món Đã Đặt</th>
                    <th style="width: 150px;">Tổng Tiền</th>
                    <th style="width: 140px;">Trạng Thái</th>
                    <th style="text-align: center; width: 190px;">Thao Tác</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        const orderId = order.id;
        const status = (order.status || "PENDING").toUpperCase();
        const statusMeta = orderStatusMap[status] || {
            label: status,
            badgeClass: "badge-status-pending",
            icon: "fa-circle-question",
            color: "#9ca3af"
        };

        const formattedDate = formatDateTime(order.createdAt);
        const customerName = order.receiverName || order.customerName || "Khách Hàng";
        const phone = order.phone || "---";
        const address = order.shippingAddress || "Tại quầy / Chưa có";
        const totalFormatted = (typeof formatVND === "function") 
            ? formatVND(order.totalPrice) 
            : Number(order.totalPrice || 0).toLocaleString('vi-VN') + " VND";

        // Payment status tag
        const isPaid = (order.paymentStatus || "").toUpperCase() === "SUCCESS" || 
                       (order.paymentStatus || "").toUpperCase() === "PAID";
        const paymentMethod = order.paymentMethod || "COD";
        const paymentTag = isPaid 
            ? `<span class="tag-payment-status tag-payment-paid"><i class="fa-solid fa-check"></i> Đã thanh toán</span>`
            : `<span class="tag-payment-status tag-payment-unpaid"><i class="fa-solid fa-clock"></i> Chưa thanh toán</span>`;

        // Render items snippet
        const itemsHtml = renderOrderItemsSnippet(order.items, orderId);

        // Action buttons based on status
        const actionButtons = renderActionButtons(orderId, status);

        html += `
            <tr>
                <!-- MÃ ĐƠN -->
                <td>
                    <div style="font-weight: 700; color: #ffffff; font-size: 0.98rem;">#${orderId}</div>
                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-regular fa-clock" style="font-size: 0.72rem;"></i>
                        ${formattedDate}
                    </div>
                </td>

                <!-- KHÁCH HÀNG -->
                <td>
                    <div class="order-cust-box">
                        <span class="order-cust-name">${escapeHtml(customerName)}</span>
                        <span class="order-cust-phone">
                            <i class="fa-solid fa-phone" style="font-size: 0.72rem; color: var(--primary);"></i>
                            ${escapeHtml(phone)}
                        </span>
                        ${order.note ? `
                            <div class="order-cust-note" title="${escapeHtml(order.note)}">
                                <i class="fa-regular fa-comment-dots"></i> ${escapeHtml(order.note)}
                            </div>
                        ` : ''}
                    </div>
                </td>

                <!-- ĐỊA CHỈ GIAO -->
                <td>
                    <div class="order-cust-address" title="${escapeHtml(address)}">
                        <i class="fa-solid fa-location-dot" style="color: var(--primary-light); margin-right: 4px;"></i>
                        ${escapeHtml(address)}
                    </div>
                </td>

                <!-- MÓN ĐÃ ĐẶT -->
                <td>
                    ${itemsHtml}
                </td>

                <!-- TỔNG TIỀN & PHƯƠNG THỨC -->
                <td>
                    <div style="font-weight: 700; color: var(--primary-light); font-size: 1.05rem;">
                        ${totalFormatted}
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 3px;">
                        ${escapeHtml(paymentMethod)}
                    </div>
                    <div style="margin-top: 4px;">
                        ${paymentTag}
                    </div>
                </td>

                <!-- TRẠNG THÁI -->
                <td>
                    <span class="badge-order-status ${statusMeta.badgeClass}">
                        <i class="fa-solid ${statusMeta.icon}"></i>
                        ${statusMeta.label}
                    </span>
                </td>

                <!-- THAO TÁC -->
                <td>
                    <div style="display: flex; gap: 6px; align-items: center; justify-content: center; flex-wrap: wrap;">
                        ${actionButtons}
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
   RENDER ORDER ITEMS SNIPPET (TABLE CELL)
   ========================================================================== */

function renderOrderItemsSnippet(items, orderId) {
    if (!items || items.length === 0) {
        return `<span style="font-size: 0.82rem; color: var(--text-muted); font-style: italic;">Không có món nào</span>`;
    }

    const maxPreview = 2;
    const previewList = items.slice(0, maxPreview);
    const remainingCount = items.length - maxPreview;

    let html = `<div class="order-items-summary">`;

    previewList.forEach(item => {
        const imgSrc = item.productImage ? `images/${item.productImage}` : "images/banner.png";
        const name = item.productName || "Món nước/bánh";
        const qty = item.quantity || 1;

        html += `
            <div class="order-item-chip" title="${escapeHtml(name)} x${qty}">
                <img src="${imgSrc}" onerror="this.src='images/banner.png'" alt="Thumb">
                <span style="max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(name)}
                </span>
                <strong style="color: var(--primary-light); font-size: 0.78rem;">x${qty}</strong>
            </div>
        `;
    });

    if (remainingCount > 0) {
        html += `
            <span class="order-items-more" onclick="viewOrderDetail(${orderId})">
                +${remainingCount} món khác (Xem tất cả)
            </span>
        `;
    }

    html += `</div>`;
    return html;
}

/* ==========================================================================
   RENDER ACTION BUTTONS FOR EACH STATUS (1-CLICK WORKFLOW)
   ========================================================================== */

function renderActionButtons(orderId, status) {
    let advanceBtn = "";
    let cancelBtn = "";

    // 1-Click status advance buttons
    if (status === "PENDING") {
        advanceBtn = `
            <button class="btn-action-status btn-status-processing" 
                    onclick="advanceOrderStatus(${orderId}, 'PROCESSING', 'Đang pha chế')" 
                    title="Duyệt đơn và chuyển vào quầy pha chế">
                <i class="fa-solid fa-mug-hot"></i>
                <span>Duyệt & Pha chế</span>
            </button>
        `;
        cancelBtn = `
            <button class="btn-action-status btn-status-cancel" 
                    onclick="cancelOrder(${orderId})" 
                    title="Hủy đơn hàng này">
                <i class="fa-solid fa-ban"></i>
                <span>Hủy</span>
            </button>
        `;
    } else if (status === "PROCESSING") {
        advanceBtn = `
            <button class="btn-action-status btn-status-delivering" 
                    onclick="advanceOrderStatus(${orderId}, 'DELIVERING', 'Đang giao hàng')" 
                    title="Pha xong, bàn giao cho shipper">
                <i class="fa-solid fa-truck-fast"></i>
                <span>Giao hàng</span>
            </button>
        `;
        cancelBtn = `
            <button class="btn-action-status btn-status-cancel" 
                    onclick="cancelOrder(${orderId})" 
                    title="Hủy đơn hàng này">
                <i class="fa-solid fa-ban"></i>
                <span>Hủy</span>
            </button>
        `;
    } else if (status === "DELIVERING") {
        advanceBtn = `
            <button class="btn-action-status btn-status-completed" 
                    onclick="advanceOrderStatus(${orderId}, 'COMPLETED', 'Hoàn thành')" 
                    title="Khách đã nhận hàng thành công, tích điểm thưởng">
                <i class="fa-solid fa-circle-check"></i>
                <span>Hoàn thành & Tích điểm</span>
            </button>
        `;
        cancelBtn = `
            <button class="btn-action-status btn-status-cancel" 
                    onclick="cancelOrder(${orderId})" 
                    title="Hủy đơn hàng này">
                <i class="fa-solid fa-ban"></i>
                <span>Hủy</span>
            </button>
        `;
    } else if (status === "COMPLETED") {
        advanceBtn = `
            <span style="font-size: 0.78rem; color: #10b981; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-check-double"></i> Đã hoàn tất
            </span>
        `;
    } else if (status === "CANCELLED") {
        advanceBtn = `
            <span style="font-size: 0.78rem; color: #f87171; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-ban"></i> Đã hủy
            </span>
        `;
    }

    const detailBtn = `
        <button class="btn-action-status btn-order-view" 
                onclick="viewOrderDetail(${orderId})" 
                title="Xem chi tiết hóa đơn">
            <i class="fa-solid fa-eye"></i>
        </button>
    `;

    return advanceBtn + cancelBtn + detailBtn;
}

/* ==========================================================================
   ADVANCE ORDER STATUS (PUT /orders/{id}/status)
   ========================================================================== */

async function advanceOrderStatus(orderId, newStatus, statusLabel) {
    if (isUpdatingStatus) return;

    try {
        isUpdatingStatus = true;

        const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Cập nhật trạng thái thất bại.");
        }

        const updatedOrder = await response.json();

        // Update local cache
        const idx = adminOrdersCache.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            adminOrdersCache[idx] = updatedOrder;
        }

        if (typeof showToast === "function") {
            showToast(`Đã chuyển đơn #${orderId} sang "${statusLabel}" thành công!`, "success");
        }

        // Re-render
        updateStatsOverview(adminOrdersCache);
        updateStatusTabBadges(adminOrdersCache);
        filterAdminOrders();

        // If detail modal is open for this order, refresh modal
        const modal = document.getElementById("orderDetailModal");
        if (modal && !modal.classList.contains("hidden")) {
            viewOrderDetail(orderId);
        }

    } catch (error) {
        console.error("Update order status error:", error);
        if (typeof showToast === "function") {
            showToast("Lỗi: " + error.message, "error");
        }
    } finally {
        isUpdatingStatus = false;
    }
}

/* ==========================================================================
   CANCEL ORDER HELPER
   ========================================================================== */

function cancelOrder(orderId) {
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`)) {
        advanceOrderStatus(orderId, "CANCELLED", "Đã hủy");
    }
}

/* ==========================================================================
   ORDER DETAIL MODAL
   ========================================================================== */

function viewOrderDetail(orderId) {
    const order = adminOrdersCache.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById("orderDetailModal");
    const titleEl = document.getElementById("modalOrderTitle");
    const dateEl = document.getElementById("modalOrderDate");
    const contentEl = document.getElementById("modalOrderContent");
    const buttonsEl = document.getElementById("modalStatusAdvanceButtons");

    if (!modal || !contentEl) return;

    const status = (order.status || "PENDING").toUpperCase();
    const statusMeta = orderStatusMap[status] || {
        label: status,
        badgeClass: "badge-status-pending",
        icon: "fa-circle-question"
    };

    if (titleEl) {
        titleEl.innerHTML = `
            <i class="fa-solid fa-receipt" style="color: var(--primary-light);"></i>
            Đơn Hàng #${order.id}
            <span class="badge-order-status ${statusMeta.badgeClass}" style="margin-left: 10px; font-size: 0.8rem;">
                <i class="fa-solid ${statusMeta.icon}"></i> ${statusMeta.label}
            </span>
        `;
    }

    if (dateEl) {
        dateEl.innerText = `Thời gian đặt: ${formatDateTime(order.createdAt)}`;
    }

    const customerName = order.receiverName || order.customerName || "Khách Hàng";
    const phone = order.phone || "Chưa cung cấp";
    const address = order.shippingAddress || "Tại quầy / Nhận tại quán";
    const paymentMethod = order.paymentMethod || "COD (Tiền mặt)";
    const isPaid = (order.paymentStatus || "").toUpperCase() === "SUCCESS" || 
                   (order.paymentStatus || "").toUpperCase() === "PAID";
    const paymentStatusText = isPaid ? "Đã thanh toán" : "Chưa thanh toán";
    const paymentStatusColor = isPaid ? "#10b981" : "#f59e0b";

    // Products table in modal
    let itemsRows = "";
    let itemsTotal = 0;

    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            const sub = item.subtotal || ((item.price || 0) * (item.quantity || 1));
            itemsTotal += sub;
            const imgSrc = item.productImage ? `images/${item.productImage}` : "images/banner.png";
            const priceVnd = (typeof formatVND === "function") ? formatVND(item.price) : Number(item.price || 0).toLocaleString('vi-VN') + " VND";
            const subVnd = (typeof formatVND === "function") ? formatVND(sub) : Number(sub).toLocaleString('vi-VN') + " VND";

            itemsRows += `
                <tr>
                    <td style="color: var(--text-muted); font-size: 0.82rem; padding: 10px 12px;">#${index + 1}</td>
                    <td style="padding: 10px 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${imgSrc}" onerror="this.src='images/banner.png'" style="width: 38px; height: 38px; border-radius: 6px; object-fit: cover;" alt="Prod">
                            <div>
                                <div style="font-weight: 600; color: #fff; font-size: 0.88rem;">${escapeHtml(item.productName || "Sản phẩm")}</div>
                                <div style="font-size: 0.78rem; color: var(--text-muted);">${priceVnd}</div>
                            </div>
                        </div>
                    </td>
                    <td style="text-align: center; font-weight: 600; color: var(--primary-light); padding: 10px 12px;">x${item.quantity || 1}</td>
                    <td style="text-align: right; font-weight: 600; color: #fff; padding: 10px 12px;">${subVnd}</td>
                </tr>
            `;
        });
    } else {
        itemsRows = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Không có thông tin chi tiết món.
                </td>
            </tr>
        `;
    }

    const orderFinalTotal = (typeof formatVND === "function") 
        ? formatVND(order.totalPrice || itemsTotal) 
        : Number(order.totalPrice || itemsTotal).toLocaleString('vi-VN') + " VND";

    contentEl.innerHTML = `
        <div class="order-modal-details-grid">
            <!-- CỘT 1: THÔNG TIN KHÁCH HÀNG & GIAO HÀNG -->
            <div class="order-info-block">
                <h4><i class="fa-solid fa-user"></i> Người nhận & Giao hàng</h4>
                <p><strong>Người nhận:</strong> ${escapeHtml(customerName)}</p>
                <p><strong>Số điện thoại:</strong> ${escapeHtml(phone)}</p>
                <p><strong>Địa chỉ nhận:</strong> ${escapeHtml(address)}</p>
                ${order.note ? `<p style="margin-top: 6px;"><strong style="color: #f59e0b;">Ghi chú:</strong> <span style="color: #fcd34d; font-style: italic;">"${escapeHtml(order.note)}"</span></p>` : ''}
            </div>

            <!-- CỘT 2: THÔNG TIN THANH TOÁN -->
            <div class="order-info-block">
                <h4><i class="fa-solid fa-credit-card"></i> Thông tin thanh toán</h4>
                <p><strong>Phương thức:</strong> ${escapeHtml(paymentMethod)}</p>
                <p><strong>Trạng thái TT:</strong> <span style="color: ${paymentStatusColor}; font-weight: 600;">${paymentStatusText}</span></p>
                ${order.transactionId ? `<p><strong>Mã giao dịch:</strong> <code>${escapeHtml(order.transactionId)}</code></p>` : ''}
                <p style="margin-top: 10px; font-size: 1.05rem;">
                    <strong>Tổng thanh toán:</strong> 
                    <span style="color: var(--primary-light); font-weight: 800; font-size: 1.2rem;">${orderFinalTotal}</span>
                </p>
            </div>
        </div>

        <!-- DANH SÁCH MÓN ĐẶT -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); overflow: hidden; margin-top: 16px;">
            <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem; font-weight: 600; color: #d1d5db;">
                <i class="fa-solid fa-list-ul" style="margin-right: 6px; color: var(--primary);"></i> Danh sách món đã đặt
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 0.78rem;">
                        <th style="padding: 8px 12px; width: 40px;">STT</th>
                        <th style="padding: 8px 12px;">Sản phẩm</th>
                        <th style="padding: 8px 12px; text-align: center; width: 70px;">Số lượng</th>
                        <th style="padding: 8px 12px; text-align: right; width: 120px;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>
        </div>
    `;

    // Render advance buttons inside modal footer as well
    if (buttonsEl) {
        if (status === "PENDING") {
            buttonsEl.innerHTML = `
                <button class="btn-action-status btn-status-processing" onclick="advanceOrderStatus(${order.id}, 'PROCESSING', 'Đang pha chế')">
                    <i class="fa-solid fa-mug-hot"></i> Duyệt & Pha chế
                </button>
                <button class="btn-action-status btn-status-cancel" onclick="cancelOrder(${order.id})">
                    <i class="fa-solid fa-ban"></i> Hủy đơn
                </button>
            `;
        } else if (status === "PROCESSING") {
            buttonsEl.innerHTML = `
                <button class="btn-action-status btn-status-delivering" onclick="advanceOrderStatus(${order.id}, 'DELIVERING', 'Đang giao hàng')">
                    <i class="fa-solid fa-truck-fast"></i> Giao hàng ngay
                </button>
                <button class="btn-action-status btn-status-cancel" onclick="cancelOrder(${order.id})">
                    <i class="fa-solid fa-ban"></i> Hủy đơn
                </button>
            `;
        } else if (status === "DELIVERING") {
            buttonsEl.innerHTML = `
                <button class="btn-action-status btn-status-completed" onclick="advanceOrderStatus(${order.id}, 'COMPLETED', 'Hoàn thành')">
                    <i class="fa-solid fa-circle-check"></i> Hoàn thành & Tích điểm
                </button>
                <button class="btn-action-status btn-status-cancel" onclick="cancelOrder(${order.id})">
                    <i class="fa-solid fa-ban"></i> Hủy đơn
                </button>
            `;
        } else {
            buttonsEl.innerHTML = `
                <span class="badge-order-status ${statusMeta.badgeClass}">
                    <i class="fa-solid ${statusMeta.icon}"></i> ${statusMeta.label}
                </span>
            `;
        }
    }

    modal.classList.remove("hidden");
}

function closeOrderDetailModal() {
    const modal = document.getElementById("orderDetailModal");
    if (modal) modal.classList.add("hidden");
}

// Close modal when clicking outside modal-content
window.addEventListener("click", (e) => {
    const modal = document.getElementById("orderDetailModal");
    if (modal && e.target === modal) {
        closeOrderDetailModal();
    }
});

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */

function formatDateTime(dateStr) {
    if (!dateStr) return "N/A";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (e) {
        return String(dateStr);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ==========================================================================
   INITIALIZE ON PAGE LOAD
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadAdminOrders();
});
