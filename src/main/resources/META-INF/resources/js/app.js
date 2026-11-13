/* ==========================================================================
   COFFEE SHOP - CORE APP JAVASCRIPT & UTILITIES
   ========================================================================== */

// Base API URL
const BASE_URL = "";

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */

function showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/* ==========================================================================
   FORMAT CURRENCY
   ========================================================================== */

function formatVND(amount) {
    if (amount === undefined || amount === null) return "0 VND";
    return Number(amount).toLocaleString('vi-VN') + " VND";
}

/* ==========================================================================
   CART BADGE COUNTER
   ========================================================================== */

async function updateCartBadge() {
    const userId = localStorage.getItem("userId");
    const badge = document.getElementById("cartBadgeCount");
    if (!badge) return;

    if (!userId) {
        badge.style.display = "none";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/cart/${userId}`);
        if (response.ok) {
            const items = await response.json();
            const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            if (totalQty > 0) {
                badge.innerText = totalQty > 99 ? "99+" : totalQty;
                badge.style.display = "inline-block";
            } else {
                badge.style.display = "none";
            }
        }
    } catch (e) {
        console.log("Cart badge check:", e);
    }
}

/* ==========================================================================
   NAVBAR USER STATE & LOYALTY POINTS INIT
   ========================================================================== */

async function fetchUserPoints(userId) {
    if (!userId) return 0;
    try {
        const res = await fetch(`${BASE_URL}/users/${userId}/points`);
        if (res.ok) {
            const data = await res.json();
            return data.points !== undefined ? data.points : 0;
        }
    } catch (e) {
        console.warn("Points fetch error:", e);
    }
    try {
        const resUser = await fetch(`${BASE_URL}/users/${userId}`);
        if (resUser.ok) {
            const u = await resUser.json();
            return u.points !== undefined ? u.points : 0;
        }
    } catch (e) {}
    return 0;
}

async function updateUserPointsBadge() {
    const userId = localStorage.getItem("userId");
    const pointsSpan = document.getElementById("userPointsVal");
    if (!userId || !pointsSpan) return;

    const points = await fetchUserPoints(userId);
    pointsSpan.innerText = Number(points).toLocaleString('vi-VN');
}

async function initNavbar() {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    const welcomeEl = document.getElementById("welcomeUser");
    const authLink = document.getElementById("auth-link");
    const authText = document.getElementById("auth-text");
    const adminLink = document.getElementById("admin-nav-link");

    if (username) {
        if (welcomeEl) {
            welcomeEl.innerHTML = `
                <div class="user-pill">
                    <span class="user-avatar">${username.charAt(0).toUpperCase()}</span>
                    <span>${username}</span>
                    <span class="bean-points-badge" title="Điểm thưởng Bean tích lũy">
                        <i class="fa-solid fa-coins"></i> <span id="userPointsVal">0</span> Bean
                    </span>
                </div>
            `;
            // Fetch points asynchronously
            updateUserPointsBadge();
        }

        if (authText) authText.innerText = "Đăng xuất";
        if (authLink) {
            authLink.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> <span id="auth-text">Đăng xuất</span>`;
            authLink.href = "#";
            authLink.onclick = function (e) {
                e.preventDefault();
                logout();
            };
        }

        if (adminLink && role === "ADMIN") {
            adminLink.style.display = "inline-flex";
        }
    } else {
        if (welcomeEl) welcomeEl.innerHTML = "";
        if (authText) authText.innerText = "Đăng nhập";
        if (authLink) {
            authLink.innerHTML = `<i class="fa fa-user"></i> <span id="auth-text">Đăng nhập</span>`;
            authLink.href = "login.html";
            authLink.onclick = null;
        }
        if (adminLink) {
            adminLink.style.display = "none";
        }
    }

    updateCartBadge();
}

/* ==========================================================================
   LOGOUT HELPER
   ========================================================================== */

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("cart");
    sessionStorage.clear();
    showToast("Đã đăng xuất thành công", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 600);
}

/* ==========================================================================
   PASSWORD VISIBILITY TOGGLE
   ========================================================================== */

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// Auto init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
});
