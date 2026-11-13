/* ==========================================================================
   COFFEE SHOP - ADMIN DASHBOARD & CHARTS JAVASCRIPT
   ========================================================================== */

let currentChart = null;

async function loadDashboard() {
    try {
        let users = [];
        let products = [];
        let orders = [];

        try {
            const usersRes = await fetch("/users");
            if (usersRes.ok) users = await usersRes.json();
        } catch (e) {
            console.warn("Fetch users error:", e);
        }

        try {
            const productRes = await fetch("/products");
            if (productRes.ok) products = await productRes.json();
        } catch (e) {
            console.warn("Fetch products error:", e);
        }

        try {
            const ordersRes = await fetch("/orders");
            if (ordersRes.ok) orders = await ordersRes.json();
        } catch (e) {
            console.warn("Fetch orders error:", e);
        }

        let totalSold = 0;
        let totalRevenue = 0;

        if (orders && orders.length > 0) {
            orders.forEach(order => {
                if (order.status !== "CANCELLED") {
                    totalRevenue += (order.totalPrice || 0);
                    if (order.items && order.items.length > 0) {
                        order.items.forEach(item => {
                            totalSold += (item.quantity || 1);
                        });
                    }
                }
            });
        }

        // Update Stat Cards
        const statUsers = document.getElementById("statUsers");
        const statProducts = document.getElementById("statProducts");
        const statSold = document.getElementById("statSold");
        const statRevenue = document.getElementById("statRevenue");

        if (statUsers) statUsers.innerText = users.length;
        if (statProducts) statProducts.innerText = products.length;
        if (statSold) statSold.innerText = totalSold;
        if (statRevenue) statRevenue.innerText = totalRevenue.toLocaleString('vi-VN') + " VND";

        // Render Chart
        drawChart(users.length, products.length, totalSold, orders.length);

    } catch (error) {
        console.error("Dashboard general error:", error);
    }
}

function drawChart(usersCount, productsCount, soldCount, ordersCount) {
    const canvas = document.getElementById("dashboardChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Thành Viên", "Món Đang Bán", "Đơn Đã Đặt", "Ly Đã Bán"],
            datasets: [{
                label: "Số lượng",
                data: [usersCount, productsCount, ordersCount || 0, soldCount],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.75)",
                    "rgba(245, 158, 11, 0.75)",
                    "rgba(217, 119, 6, 0.75)",
                    "rgba(16, 185, 129, 0.75)"
                ],
                borderColor: [
                    "#3b82f6",
                    "#f59e0b",
                    "#d97706",
                    "#10b981"
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "rgba(20, 14, 10, 0.95)",
                    titleColor: "#ffffff",
                    bodyColor: "#d97706",
                    borderColor: "rgba(217, 119, 6, 0.3)",
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: {
                        color: "rgba(255, 255, 255, 0.05)"
                    },
                    ticks: {
                        color: "#9ca3af",
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 13,
                            weight: "600"
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(255, 255, 255, 0.05)"
                    },
                    ticks: {
                        color: "#9ca3af",
                        stepSize: 1,
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", loadDashboard);