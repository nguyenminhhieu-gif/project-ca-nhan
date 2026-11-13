/* ==========================================================================
   COFFEE SHOP - SHOPPING CART & CHECKOUT JAVASCRIPT
   ========================================================================== */

const CART_API = "/cart";
const ORDER_API = "/orders";
const PAYMENT_API = "/payments";

let currentCartItems = [];
let discountPercent = 0;
let discountFlat = 0;
let selectedPaymentMethod = "COD";
let currentPlacedOrder = null;

/* ==========================================================================
   LOAD CART
   ========================================================================== */

async function loadCart() {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("cartItems");
    const summaryBox = document.getElementById("orderSummaryBox");

    if (!container) return;

    if (!userId) {
        container.innerHTML = `
            <div class="empty-cart-state" style="grid-column: 1/-1;">
                <div class="empty-cart-icon">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h3>Bạn chưa đăng nhập</h3>
                <p>Vui lòng đăng nhập để xem giỏ hàng và thanh toán các món đồ uống yêu thích.</p>
                <a href="login.html" class="btn btn-primary">
                    <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập ngay
                </a>
            </div>
        `;
        if (summaryBox) summaryBox.style.display = "none";
        return;
    }

    try {
        const response = await fetch(`${CART_API}/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const items = await response.json();
        currentCartItems = items;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart-state" style="grid-column: 1/-1;">
                    <div class="empty-cart-icon">
                        <i class="fa-solid fa-mug-hot"></i>
                    </div>
                    <h3>Giỏ hàng của bạn đang trống</h3>
                    <p>Hãy khám phá thực đơn đa dạng và chọn cho mình thức uống thơm ngon nhé!</p>
                    <a href="products.html" class="btn btn-primary">
                        <i class="fa-solid fa-mug-hot"></i> Khám phá thực đơn
                    </a>
                </div>
            `;
            if (summaryBox) summaryBox.style.display = "none";
            if (typeof updateCartBadge === "function") updateCartBadge();
            return;
        }

        if (summaryBox) summaryBox.style.display = "block";

        let html = "";
        let subtotal = 0;

        items.forEach(item => {
            if (!item.product) return;

            const product = item.product;
            const price = Number(product.price) || 0;
            const qty = item.quantity || 1;
            const itemSubtotal = price * qty;
            subtotal += itemSubtotal;

            const imageSrc = product.image ? `images/${product.image}` : "images/banner.png";

            html += `
                <div class="cart-item-card">
                    <img src="${imageSrc}" 
                         class="cart-item-thumb" 
                         alt="${product.name}" 
                         onerror="this.onerror=null; this.src='images/banner.png';">

                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <div class="item-unit-price">Đơn giá: ${price.toLocaleString('vi-VN')} VND</div>
                    </div>

                    <div class="qty-stepper">
                        <button onclick="updateQuantity(${item.id}, ${qty - 1})"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" value="${qty}" readonly>
                        <button onclick="updateQuantity(${item.id}, ${qty + 1})"><i class="fa-solid fa-plus"></i></button>
                    </div>

                    <div class="cart-item-subtotal">
                        ${itemSubtotal.toLocaleString('vi-VN')} VND
                    </div>

                    <button class="btn-item-delete" onclick="deleteCartItem(${item.id})" title="Xóa món này">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
        updateOrderSummary(subtotal);
        if (typeof updateCartBadge === "function") updateCartBadge();

    } catch (error) {
        console.error("Load cart error:", error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                <i class="fa-solid fa-circle-exclamation fa-2x" style="margin-bottom: 10px;"></i>
                <p>Không thể tải giỏ hàng. Vui lòng thử lại sau!</p>
            </div>
        `;
    }
}

/* ==========================================================================
   UPDATE ORDER SUMMARY CALCULATIONS
   ========================================================================== */

function getCalculations() {
    let subtotal = 0;
    currentCartItems.forEach(item => {
        if (item.product && item.product.price) {
            subtotal += (Number(item.product.price) * (item.quantity || 1));
        }
    });

    let discountTotal = 0;
    if (discountPercent > 0) {
        discountTotal = subtotal * (discountPercent / 100);
    } else if (discountFlat > 0) {
        discountTotal = Math.min(discountFlat, subtotal);
    }

    const finalTotal = Math.max(0, subtotal - discountTotal);
    return { subtotal, discountTotal, finalTotal };
}

function updateOrderSummary(subtotal) {
    const subtotalEl = document.getElementById("subtotalPrice");
    const totalEl = document.getElementById("totalPrice");
    const discountRow = document.getElementById("discountRow");
    const discountAmountEl = document.getElementById("discountAmount");

    const { discountTotal, finalTotal } = getCalculations();

    if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString('vi-VN') + " VND";
    if (totalEl) totalEl.innerText = finalTotal.toLocaleString('vi-VN') + " VND";

    if (discountTotal > 0 && discountRow && discountAmountEl) {
        discountRow.style.display = "flex";
        discountAmountEl.innerText = "- " + discountTotal.toLocaleString('vi-VN') + " VND";
    } else if (discountRow) {
        discountRow.style.display = "none";
    }
}

/* ==========================================================================
   UPDATE QUANTITY
   ========================================================================== */

async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        await deleteCartItem(cartId);
        return;
    }

    try {
        const response = await fetch(`${CART_API}/${cartId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            loadCart();
        } else {
            showToast("Không thể cập nhật số lượng", "error");
        }
    } catch (error) {
        console.error("Update cart error:", error);
        showToast("Lỗi máy chủ", "error");
    }
}

/* ==========================================================================
   DELETE ITEM
   ========================================================================== */

async function deleteCartItem(cartId) {
    try {
        const response = await fetch(`${CART_API}/${cartId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
        loadCart();
    } catch (error) {
        console.error("Delete item error:", error);
        showToast("Xóa sản phẩm thất bại", "error");
    }
}

/* ==========================================================================
   VOUCHER / DISCOUNT CODE
   ========================================================================== */

function applyVoucher() {
    const input = document.getElementById("voucherCode");
    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
        showToast("Vui lòng nhập mã ưu đãi!", "warning");
        return;
    }

    if (code === "COFFEE10" || code === "WELCOME10") {
        discountPercent = 10;
        discountFlat = 0;
        showToast("Áp dụng mã giảm 10% thành công!", "success");
    } else if (code === "FREESHIP" || code === "GIAM20K") {
        discountPercent = 0;
        discountFlat = 20000;
        showToast("Áp dụng mã giảm 20.000 VND thành công!", "success");
    } else {
        showToast("Mã ưu đãi không hợp lệ hoặc đã hết hạn!", "error");
        discountPercent = 0;
        discountFlat = 0;
    }

    const { subtotal } = getCalculations();
    updateOrderSummary(subtotal);
}

/* ==========================================================================
   CHECKOUT FLOW & MODALS
   ========================================================================== */

function checkout() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        showToast("Vui lòng đăng nhập để tiến hành thanh toán!", "warning");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
        return;
    }

    if (!currentCartItems || currentCartItems.length === 0) {
        showToast("Giỏ hàng của bạn đang trống!", "warning");
        return;
    }

    openCheckoutModal();
}

function openCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (!modal) return;

    // Prefill form from user or localStorage
    const savedName = localStorage.getItem("username") || "";
    const nameInput = document.getElementById("checkoutReceiverName");
    if (nameInput && !nameInput.value) {
        nameInput.value = savedName;
    }

    // Render mini items list
    const itemsListEl = document.getElementById("checkoutItemsList");
    if (itemsListEl) {
        let html = "";
        currentCartItems.forEach(item => {
            if (!item.product) return;
            const p = item.product;
            const price = Number(p.price) || 0;
            const q = item.quantity || 1;
            const img = p.image ? `images/${p.image}` : "images/banner.png";

            html += `
                <div class="checkout-mini-item">
                    <img src="${img}" alt="${p.name}" onerror="this.onerror=null; this.src='images/banner.png';">
                    <div class="checkout-mini-item-name">
                        <div>${p.name}</div>
                        <small>SL: ${q} × ${price.toLocaleString('vi-VN')} VND</small>
                    </div>
                    <div class="checkout-mini-item-price">
                        ${(price * q).toLocaleString('vi-VN')} VND
                    </div>
                </div>
            `;
        });
        itemsListEl.innerHTML = html;
    }

    // Summary numbers
    const { subtotal, discountTotal, finalTotal } = getCalculations();
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const finalTotalEl = document.getElementById("checkoutFinalTotal");
    const discountRow = document.getElementById("checkoutDiscountRow");
    const discountAmountEl = document.getElementById("checkoutDiscountAmount");

    if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString('vi-VN') + " VND";
    if (finalTotalEl) finalTotalEl.innerText = finalTotal.toLocaleString('vi-VN') + " VND";

    if (discountTotal > 0 && discountRow && discountAmountEl) {
        discountRow.style.display = "flex";
        discountAmountEl.innerText = "- " + discountTotal.toLocaleString('vi-VN') + " VND";
    } else if (discountRow) {
        discountRow.style.display = "none";
    }

    modal.classList.remove("hidden");
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.add("hidden");
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Update active visual card styles
    const cards = document.querySelectorAll(".payment-method-card");
    cards.forEach(card => {
        const radio = card.querySelector("input[type='radio']");
        if (radio && radio.value === method) {
            radio.checked = true;
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });
}

/* ==========================================================================
   SUBMIT ORDER
   ========================================================================== */

async function submitOrder() {
    const userId = localStorage.getItem("userId");
    const receiverName = document.getElementById("checkoutReceiverName")?.value.trim();
    const phone = document.getElementById("checkoutPhone")?.value.trim();
    const address = document.getElementById("checkoutAddress")?.value.trim();
    const note = document.getElementById("checkoutNote")?.value.trim() || "";
    const voucherCode = document.getElementById("voucherCode")?.value.trim() || "";

    if (!receiverName || !phone || !address) {
        showToast("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!", "warning");
        return;
    }

    const { discountTotal, finalTotal } = getCalculations();

    const submitBtn = document.getElementById("btnSubmitOrder");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý đơn hàng...`;
    }

    try {
        const payload = {
            userId: Number(userId),
            receiverName: receiverName,
            phone: phone,
            shippingAddress: address,
            paymentMethod: selectedPaymentMethod,
            note: note,
            voucherCode: voucherCode,
            discountAmount: discountTotal
        };

        const response = await fetch(`${ORDER_API}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Tạo đơn hàng thất bại.");
        }

        const order = await response.json();
        currentPlacedOrder = order;

        closeCheckoutModal();

        // Check payment method
        if (selectedPaymentMethod === "BANKING" || selectedPaymentMethod === "MOMO" || selectedPaymentMethod === "VNPAY") {
            openPaymentQRModal(order);
        } else {
            openOrderSuccessModal(order);
        }

        // Refresh cart in background
        loadCart();
        if (typeof updateCartBadge === "function") updateCartBadge();

    } catch (error) {
        console.error("Submit order error:", error);
        showToast(error.message || "Không thể đặt hàng, vui lòng thử lại!", "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Xác nhận đặt hàng`;
        }
    }
}

/* ==========================================================================
   VIETQR / BANKING PAYMENT MODAL
   ========================================================================== */

function openPaymentQRModal(order) {
    const modal = document.getElementById("paymentQRModal");
    if (!modal) return;

    const qrImg = document.getElementById("vietqrImage");
    const amountEl = document.getElementById("qrAmount");
    const transferNoteEl = document.getElementById("qrTransferNote");
    const bankNameEl = document.getElementById("qrBankName");
    const accountNameEl = document.getElementById("qrAccountName");
    const accountNoEl = document.getElementById("qrAccountNo");

    const amount = order.totalPrice || 0;
    const transferNote = `COFFEE DH${order.id}`;

    if (amountEl) amountEl.innerText = amount.toLocaleString('vi-VN') + " VND";
    if (transferNoteEl) transferNoteEl.innerText = transferNote;

    if (selectedPaymentMethod === "MOMO") {
        if (bankNameEl) bankNameEl.innerText = "Ví điện tử MoMo";
        if (accountNameEl) accountNameEl.innerText = "COFFEE SHOP VIETNAM";
        if (accountNoEl) accountNoEl.innerText = "0912345678";
        // Generate QR code via standard QR image API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|0912345678|COFFEE%20SHOP|info@coffee.vn|0|0|${amount}|${transferNote}`;
        if (qrImg) qrImg.src = qrUrl;
    } else {
        if (bankNameEl) bankNameEl.innerText = "MB Bank (Ngân Hàng Quân Đội)";
        if (accountNameEl) accountNameEl.innerText = "COFFEE SHOP PREMIUM";
        if (accountNoEl) accountNoEl.innerText = "0987654321";
        // VietQR Dynamic QR with MB Bank
        const qrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=COFFEE%20SHOP%20PREMIUM`;
        if (qrImg) qrImg.src = qrUrl;
    }

    modal.classList.remove("hidden");
}

function closePaymentQRModal() {
    const modal = document.getElementById("paymentQRModal");
    if (modal) modal.classList.add("hidden");
    if (currentPlacedOrder) {
        openOrderSuccessModal(currentPlacedOrder);
    }
}

async function confirmPaymentSuccess() {
    if (!currentPlacedOrder) return;

    try {
        await fetch(`${PAYMENT_API}/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId: currentPlacedOrder.id,
                paymentStatus: "SUCCESS",
                paymentMethod: currentPlacedOrder.paymentMethod
            })
        });

        showToast("Xác nhận thanh toán thành công!", "success");
    } catch (e) {
        console.warn("Payment process notification:", e);
    }

    const modal = document.getElementById("paymentQRModal");
    if (modal) modal.classList.add("hidden");

    openOrderSuccessModal(currentPlacedOrder);
}

/* ==========================================================================
   ORDER SUCCESS MODAL
   ========================================================================== */

function openOrderSuccessModal(order) {
    const modal = document.getElementById("orderSuccessModal");
    if (!modal) return;

    const orderIdEl = document.getElementById("successOrderId");
    const receiverEl = document.getElementById("successReceiverName");
    const phoneEl = document.getElementById("successPhone");
    const addressEl = document.getElementById("successAddress");
    const methodEl = document.getElementById("successPaymentMethod");
    const totalEl = document.getElementById("successTotal");

    if (orderIdEl) orderIdEl.innerText = `#${order.id || 0}`;
    if (receiverEl) receiverEl.innerText = order.receiverName || order.customerName || "-";
    if (phoneEl) phoneEl.innerText = order.phone || "-";
    if (addressEl) addressEl.innerText = order.shippingAddress || "-";
    
    let methodText = "Tiền mặt khi nhận (COD)";
    if (order.paymentMethod === "BANKING") methodText = "Chuyển khoản VietQR";
    if (order.paymentMethod === "MOMO") methodText = "Ví MoMo";
    if (order.paymentMethod === "VNPAY") methodText = "VNPAY / Thẻ";
    if (methodEl) methodEl.innerText = methodText;

    if (totalEl) totalEl.innerText = (order.totalPrice || 0).toLocaleString('vi-VN') + " VND";

    modal.classList.remove("hidden");
}

/* ==========================================================================
   CLIPBOARD COPY HELPER
   ========================================================================== */

function copyText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const text = el.innerText.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Đã sao chép: "${text}"`, "info", 2000);
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showToast(`Đã sao chép: "${text}"`, "info", 2000);
}

// Auto load on ready
document.addEventListener("DOMContentLoaded", loadCart);