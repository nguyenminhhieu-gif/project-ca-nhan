/* ==========================================================================
   COFFEE SHOP - AUTHENTICATION JAVASCRIPT
   ========================================================================== */

const AUTH_BASE_URL = "";

/* ==========================================================================
   LOGIN
   ========================================================================== */

async function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!username || !password) {
        showToast("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", "warning");
        return;
    }

    try {
        const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.message && !result.token) {
            showToast(result.message, "error");
            return;
        }

        // Store auth details
        localStorage.setItem("token", result.token || "");
        localStorage.setItem("role", result.role || "CUSTOMER");
        localStorage.setItem("username", result.username || username);
        localStorage.setItem("userId", result.userId || "");

        showToast(`Xin chào, ${result.username || username}! Đăng nhập thành công.`, "success");

        setTimeout(() => {
            if (result.role === "ADMIN") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }
        }, 800);

    } catch (error) {
        console.error("Login error:", error);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

/* ==========================================================================
   REGISTER
   ========================================================================== */

async function register() {
    const fullNameEl = document.getElementById("fullName");
    const phoneEl = document.getElementById("phone");
    const addressEl = document.getElementById("address");
    const genderEl = document.getElementById("gender");
    const birthDateEl = document.getElementById("birthDate");
    const usernameEl = document.getElementById("registerUsername");
    const passwordEl = document.getElementById("registerPassword");
    const confirmPasswordEl = document.getElementById("confirmPassword");

    const data = {
        fullName: fullNameEl ? fullNameEl.value.trim() : "",
        phone: phoneEl ? phoneEl.value.trim() : "",
        address: addressEl ? addressEl.value.trim() : "",
        gender: genderEl ? genderEl.value.trim() : "Nam",
        birthDate: birthDateEl ? birthDateEl.value.trim() : "",
        username: usernameEl ? usernameEl.value.trim() : "",
        password: passwordEl ? passwordEl.value.trim() : "",
        confirmPassword: confirmPasswordEl ? confirmPasswordEl.value.trim() : "",
        role: "CUSTOMER"
    };

    if (
        !data.fullName ||
        !data.phone ||
        !data.address ||
        !data.gender ||
        !data.birthDate ||
        !data.username ||
        !data.password ||
        !data.confirmPassword
    ) {
        showToast("Vui lòng điền đầy đủ các thông tin!", "warning");
        return;
    }

    if (data.password !== data.confirmPassword) {
        showToast("Mật khẩu xác nhận không trùng khớp!", "error");
        return;
    }

    if (data.password.length < 4) {
        showToast("Mật khẩu phải có ít nhất 4 ký tự!", "warning");
        return;
    }

    try {
        const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.text();

        if (result.toLowerCase().includes("success") || response.ok) {
            showToast("🎉 Đăng ký thành công! Đang chuyển đến trang đăng nhập...", "success", 3000);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } else {
            showToast(result || "Đăng ký không thành công", "error");
        }

    } catch (error) {
        console.error("Register error:", error);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}

/* ==========================================================================
   RESET PASSWORD
   ========================================================================== */

async function resetPassword() {
    const usernameEl = document.getElementById("username");
    const newPasswordEl = document.getElementById("newPassword");
    const confirmPasswordEl = document.getElementById("confirmPassword");

    const username = usernameEl ? usernameEl.value.trim() : "";
    const newPassword = newPasswordEl ? newPasswordEl.value.trim() : "";
    const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value.trim() : "";

    if (!username || !newPassword || !confirmPassword) {
        showToast("Vui lòng nhập đầy đủ các trường thông tin!", "warning");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("Mật khẩu mới xác nhận không khớp!", "error");
        return;
    }

    const data = {
        username: username,
        newPassword: newPassword,
        confirmPassword: confirmPassword
    };

    try {
        const response = await fetch(`${AUTH_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.text();

        if (result.toLowerCase().includes("success") || response.ok) {
            showToast("🎉 Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success", 3000);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } else {
            showToast(result || "Đổi mật khẩu thất bại", "error");
        }

    } catch (err) {
        console.error("Reset password error:", err);
        showToast("Lỗi kết nối máy chủ", "error");
    }
}