/* ==========================================================================
   COFFEE SHOP — BOOKING.JS
   Interactive 2D Seat Map & Co-working Table Booking
   ========================================================================== */

/* --------------------------------------------------------------------------
   TABLE DEFINITIONS
   -------------------------------------------------------------------------- */

const TABLE_DEFS = [
    // Quiet Zone — T01-T06
    { id: 'T01', zone: 'quiet',   zoneLabel: 'Khu Yên Tĩnh',   capacity: '1–2',  icon: 'fa-laptop',      price: 50000  },
    { id: 'T02', zone: 'quiet',   zoneLabel: 'Khu Yên Tĩnh',   capacity: '1–2',  icon: 'fa-laptop',      price: 50000  },
    { id: 'T03', zone: 'quiet',   zoneLabel: 'Khu Yên Tĩnh',   capacity: '1–2',  icon: 'fa-laptop',      price: 50000  },
    { id: 'T04', zone: 'quiet',   zoneLabel: 'Khu Yên Tĩnh',   capacity: '1–2',  icon: 'fa-laptop',      price: 50000  },
    { id: 'T05', zone: 'quiet',   zoneLabel: 'Khu Yên Tĩnh',   capacity: '1–2',  icon: 'fa-laptop',      price: 50000  },
    { id: 'T06', zone: 'quiet',   zoneLabel: 'Khu Yên Tĩnh',   capacity: '1–2',  icon: 'fa-laptop',      price: 50000  },
    // Meeting Zone — M01-M03
    { id: 'M01', zone: 'meeting', zoneLabel: 'Khu Họp Nhóm',   capacity: '4–8',  icon: 'fa-users',       price: 150000 },
    { id: 'M02', zone: 'meeting', zoneLabel: 'Khu Họp Nhóm',   capacity: '4–8',  icon: 'fa-users',       price: 150000 },
    { id: 'M03', zone: 'meeting', zoneLabel: 'Khu Họp Nhóm',   capacity: '4–8',  icon: 'fa-users',       price: 150000 },
    // Window Zone — W01-W04
    { id: 'W01', zone: 'window',  zoneLabel: 'Khu Cửa Sổ',     capacity: '2–4',  icon: 'fa-mug-saucer',  price: 70000  },
    { id: 'W02', zone: 'window',  zoneLabel: 'Khu Cửa Sổ',     capacity: '2–4',  icon: 'fa-mug-saucer',  price: 70000  },
    { id: 'W03', zone: 'window',  zoneLabel: 'Khu Cửa Sổ',     capacity: '2–4',  icon: 'fa-mug-saucer',  price: 70000  },
    { id: 'W04', zone: 'window',  zoneLabel: 'Khu Cửa Sổ',     capacity: '2–4',  icon: 'fa-mug-saucer',  price: 70000  },
];

// Drink price add-ons (matches HTML options)
const DRINK_PRICES = {
    '':                    0,
    'Cà Phê Đen':          30000,
    'Cà Phê Sữa':          35000,
    'Bạc Xỉu':             35000,
    'Cold Brew':            45000,
    'Trà Đào':              40000,
    'Nước ép':              40000,
    'Combo 2 cà phê':       60000,
};

/* --------------------------------------------------------------------------
   STATE
   -------------------------------------------------------------------------- */

let selectedTableId  = null;
let occupiedTableIds = new Set();
let cancelTargetId   = null;

/* --------------------------------------------------------------------------
   INIT
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    renderAllSeats();
    loadOccupied();          // initial fetch
    prefillUserInfo();
    loadBookingHistory();
});

/* --------------------------------------------------------------------------
   DATE HELPERS
   -------------------------------------------------------------------------- */

function setDefaultDate() {
    const datePicker = document.getElementById('filterDate');
    if (!datePicker) return;
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${yyyy}-${mm}-${dd}`;
    datePicker.min   = `${yyyy}-${mm}-${dd}`;
}

function formatDateVN(isoDate) {
    if (!isoDate) return '';
    const [yyyy, mm, dd] = isoDate.split('-');
    return `${dd}/${mm}/${yyyy}`;
}

/* --------------------------------------------------------------------------
   RENDER SEATS
   -------------------------------------------------------------------------- */

function renderAllSeats() {
    const zones = { quiet: 'zone-quiet', meeting: 'zone-meeting', window: 'zone-window' };
    const containers = {
        quiet:   document.getElementById('zone-quiet'),
        meeting: document.getElementById('zone-meeting'),
        window:  document.getElementById('zone-window'),
    };

    TABLE_DEFS.forEach(table => {
        const container = containers[table.zone];
        if (!container) return;

        const btn = document.createElement('button');
        btn.className    = 'seat-btn available';
        btn.id           = `seat-${table.id}`;
        btn.dataset.id   = table.id;
        btn.dataset.zone = table.zone;
        btn.title        = `${table.id} — ${table.zoneLabel} — ${table.capacity} người — ${formatVND(table.price)}/slot`;

        btn.innerHTML = `
            <i class="fa-solid ${table.icon}"></i>
            <span class="seat-num">${table.id}</span>
            <span class="seat-cap">${table.capacity} người</span>
        `;

        btn.addEventListener('click', () => onSeatClick(table.id));
        container.appendChild(btn);
    });
}

/* --------------------------------------------------------------------------
   SEAT CLICK HANDLER
   -------------------------------------------------------------------------- */

function onSeatClick(tableId) {
    if (occupiedTableIds.has(tableId)) {
        showToast(`Bàn ${tableId} đã được đặt trong khung giờ này.`, 'warning');
        return;
    }

    // Deselect previous
    if (selectedTableId && selectedTableId !== tableId) {
        const prevBtn = document.getElementById(`seat-${selectedTableId}`);
        if (prevBtn) prevBtn.className = 'seat-btn available';
    }

    if (selectedTableId === tableId) {
        // Toggle off
        const btn = document.getElementById(`seat-${tableId}`);
        if (btn) btn.className = 'seat-btn available';
        selectedTableId = null;
        hideSummary();
        return;
    }

    selectedTableId = tableId;
    const btn = document.getElementById(`seat-${tableId}`);
    if (btn) btn.className = 'seat-btn selected';

    showSummary(tableId);
}

/* --------------------------------------------------------------------------
   BOOKING SUMMARY PANEL
   -------------------------------------------------------------------------- */

function showSummary(tableId) {
    const table = TABLE_DEFS.find(t => t.id === tableId);
    if (!table) return;

    document.getElementById('summaryEmpty').style.display   = 'none';
    document.getElementById('summaryContent').style.display = 'block';

    document.getElementById('sumTable').textContent = tableId;
    document.getElementById('sumZone').textContent  = table.zoneLabel;
    document.getElementById('sumDate').textContent  = formatDateVN(document.getElementById('filterDate').value);
    document.getElementById('sumSlot').textContent  = document.getElementById('filterSlot').value;

    updateSummaryPrice();

    // Listen for drink change to update price
    document.getElementById('bookingDrink').onchange = updateSummaryPrice;
}

function updateSummaryPrice() {
    if (!selectedTableId) return;
    const table     = TABLE_DEFS.find(t => t.id === selectedTableId);
    if (!table) return;
    const drinkVal  = document.getElementById('bookingDrink').value;
    const drinkCost = DRINK_PRICES[drinkVal] || 0;
    const total     = table.price + drinkCost;
    document.getElementById('sumPrice').textContent = formatVND(total);
}

function hideSummary() {
    document.getElementById('summaryEmpty').style.display   = 'block';
    document.getElementById('summaryContent').style.display = 'none';
}

/* --------------------------------------------------------------------------
   FETCH OCCUPIED TABLES
   -------------------------------------------------------------------------- */

async function loadOccupied() {
    const date = document.getElementById('filterDate').value;
    const slot = document.getElementById('filterSlot').value;

    if (!date) {
        showToast('Vui lòng chọn ngày.', 'warning');
        return;
    }

    // Reset all seats to available
    resetAllSeats();

    try {
        const res = await fetch(`${BASE_URL}/bookings/occupied?date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(slot)}`);

        if (!res.ok) {
            if (res.status === 404) {
                // No bookings found — all tables are free
                occupiedTableIds = new Set();
                return;
            }
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        // data expected: array of table number strings e.g. ["T01","M02"]
        occupiedTableIds = new Set(Array.isArray(data) ? data : []);

        occupiedTableIds.forEach(id => {
            const btn = document.getElementById(`seat-${id}`);
            if (btn) {
                btn.className = 'seat-btn occupied';
                // If this was selected, deselect
                if (selectedTableId === id) {
                    selectedTableId = null;
                    hideSummary();
                }
            }
        });

        const count = occupiedTableIds.size;
        const total = TABLE_DEFS.length;
        showToast(`Còn ${total - count}/${total} bàn trống cho khung giờ này.`, 'success');

    } catch (err) {
        console.warn('Occupied fetch error:', err);
        // Soft fail — show all seats as available
        occupiedTableIds = new Set();
    }
}

function resetAllSeats() {
    TABLE_DEFS.forEach(t => {
        const btn = document.getElementById(`seat-${t.id}`);
        if (btn) {
            if (t.id === selectedTableId) {
                btn.className = 'seat-btn selected';
            } else {
                btn.className = 'seat-btn available';
            }
        }
    });
}

/* --------------------------------------------------------------------------
   PREFILL USER INFO
   -------------------------------------------------------------------------- */

function prefillUserInfo() {
    const username = localStorage.getItem('username');
    const nameInput = document.getElementById('bookingName');
    if (username && nameInput && !nameInput.value) {
        nameInput.value = username;
    }
}

/* --------------------------------------------------------------------------
   SUBMIT BOOKING
   -------------------------------------------------------------------------- */

async function submitBooking() {
    if (!selectedTableId) {
        showToast('Vui lòng chọn một bàn trên sơ đồ.', 'warning');
        return;
    }

    const name  = document.getElementById('bookingName').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();
    const drink = document.getElementById('bookingDrink').value;
    const date  = document.getElementById('filterDate').value;
    const slot  = document.getElementById('filterSlot').value;

    if (!name) {
        showToast('Vui lòng nhập họ tên.', 'warning');
        document.getElementById('bookingName').focus();
        return;
    }

    if (!phone) {
        showToast('Vui lòng nhập số điện thoại.', 'warning');
        document.getElementById('bookingPhone').focus();
        return;
    }

    if (!/^[0-9]{9,11}$/.test(phone.replace(/\s/g, ''))) {
        showToast('Số điện thoại không hợp lệ (9–11 chữ số).', 'error');
        document.getElementById('bookingPhone').focus();
        return;
    }

    const table     = TABLE_DEFS.find(t => t.id === selectedTableId);
    const drinkCost = DRINK_PRICES[drink] || 0;
    const total     = table.price + drinkCost;

    const payload = {
        customerName:  name,
        customerPhone: phone.replace(/\s/g, ''),
        tableNumber:   selectedTableId,
        tableType:     table.zoneLabel,
        bookingDate:   date,
        timeSlot:      slot,
        drinkNote:     drink || null,
        totalPrice:    total,
        userId:        localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null,
        seatsCount:    1,
    };

    const btn = document.getElementById('btnConfirmBook');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `HTTP ${res.status}`);
        }

        // Mark the seat as occupied
        const seatBtn = document.getElementById(`seat-${selectedTableId}`);
        if (seatBtn) seatBtn.className = 'seat-btn occupied';
        occupiedTableIds.add(selectedTableId);

        // Show success modal
        document.getElementById('successTableText').textContent =
            `Bàn ${selectedTableId} — ${table.zoneLabel}`;
        document.getElementById('successSlotText').textContent =
            `${formatDateVN(date)} | ${slot}`;
        document.getElementById('successModal').classList.remove('hidden');

        // Reset form
        const prevSelected = selectedTableId;
        selectedTableId = null;
        hideSummary();
        document.getElementById('bookingName').value  = '';
        document.getElementById('bookingPhone').value = '';
        document.getElementById('bookingDrink').value = '';

        // Reload history
        await loadBookingHistory();

    } catch (err) {
        console.error('Booking error:', err);
        showToast('Đặt chỗ thất bại: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Xác Nhận Đặt Chỗ';
    }
}

/* --------------------------------------------------------------------------
   SUCCESS MODAL
   -------------------------------------------------------------------------- */

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}

/* --------------------------------------------------------------------------
   BOOKING HISTORY
   -------------------------------------------------------------------------- */

async function loadBookingHistory() {
    const userId = localStorage.getItem('userId');
    const historySection = document.getElementById('historySection');
    const grid = document.getElementById('bookingHistoryGrid');

    if (!userId) {
        historySection.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/bookings/user/${userId}`);
        if (!res.ok) {
            if (res.status === 404) {
                historySection.style.display = 'none';
                return;
            }
            throw new Error(`HTTP ${res.status}`);
        }

        const bookings = await res.json();

        if (!Array.isArray(bookings) || bookings.length === 0) {
            historySection.style.display = 'none';
            return;
        }

        historySection.style.display = 'block';

        // Sort newest first
        bookings.sort((a, b) => {
            const da = a.createdDate || a.bookingDate || '';
            const db = b.createdDate || b.bookingDate || '';
            return db.localeCompare(da);
        });

        grid.innerHTML = bookings.map(b => renderHistoryCard(b)).join('');

    } catch (err) {
        console.warn('History load error:', err);
        historySection.style.display = 'none';
    }
}

function renderHistoryCard(b) {
    const statusMap = {
        CONFIRMED:  { label: 'Đã xác nhận', cls: 'status-confirmed' },
        PENDING:    { label: 'Chờ xác nhận', cls: 'status-pending'  },
        CANCELLED:  { label: 'Đã hủy',       cls: 'status-cancelled'},
    };
    const st  = statusMap[b.status] || { label: b.status || 'N/A', cls: 'status-pending' };
    const date = b.bookingDate ? formatDateVN(
        typeof b.bookingDate === 'string' ? b.bookingDate.split('T')[0] : b.bookingDate
    ) : '—';

    const cancelBtn = (b.status === 'PENDING' || b.status === 'CONFIRMED')
        ? `<button class="btn-cancel-booking" onclick="openCancelModal(${b.id})">
               <i class="fa-solid fa-ban"></i> Hủy đặt chỗ
           </button>`
        : '';

    return `
        <div class="history-card">
            <div class="hc-top">
                <span class="hc-table"><i class="fa-solid fa-chair"></i> ${b.tableNumber || '—'}</span>
                <span class="hc-status ${st.cls}">${st.label}</span>
            </div>
            <div class="hc-info">
                <div><strong>${b.tableType || b.zoneLabel || '—'}</strong></div>
                <div>📅 ${date} &nbsp;|&nbsp; ⏰ ${b.timeSlot || '—'}</div>
                <div>👤 ${b.customerName || '—'} &nbsp;|&nbsp; 📞 ${b.customerPhone || '—'}</div>
                ${b.drinkNote ? `<div>☕ ${b.drinkNote}</div>` : ''}
                <div style="margin-top:4px; color: var(--accent); font-weight:600;">
                    ${formatVND(b.totalPrice)}
                </div>
            </div>
            ${cancelBtn}
        </div>
    `;
}

/* --------------------------------------------------------------------------
   CANCEL BOOKING
   -------------------------------------------------------------------------- */

function openCancelModal(bookingId) {
    cancelTargetId = bookingId;
    document.getElementById('cancelBookText').textContent =
        `Hủy lượt đặt chỗ #${bookingId}? Thao tác này không thể hoàn tác.`;
    document.getElementById('cancelBookModal').classList.remove('hidden');
}

async function executeCancelBooking() {
    if (!cancelTargetId) return;

    const btn = document.getElementById('btnExecCancelBook');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const res = await fetch(`${BASE_URL}/bookings/${cancelTargetId}/cancel`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        document.getElementById('cancelBookModal').classList.add('hidden');
        showToast('Đã hủy đặt chỗ thành công.', 'success');
        cancelTargetId = null;

        // Refresh availability and history
        await loadOccupied();
        await loadBookingHistory();

    } catch (err) {
        console.error('Cancel error:', err);
        showToast('Hủy thất bại: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> Xác nhận hủy';
    }
}

/* --------------------------------------------------------------------------
   RE-RENDER SUMMARY DATE/SLOT WHEN FILTER CHANGES
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const datePicker = document.getElementById('filterDate');
    const slotPicker = document.getElementById('filterSlot');

    datePicker.addEventListener('change', () => {
        if (selectedTableId) {
            document.getElementById('sumDate').textContent = formatDateVN(datePicker.value);
        }
    });

    slotPicker.addEventListener('change', () => {
        if (selectedTableId) {
            document.getElementById('sumSlot').textContent = slotPicker.value;
        }
    });
});
