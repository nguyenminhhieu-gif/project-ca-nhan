/**
 * kds.js — Kitchen Display System Logic
 * Polls GET /orders every 5s, renders Kanban columns,
 * handles status transitions and Web Audio API chimes.
 */

'use strict';

/* ================================================================
   CONFIGURATION
   ================================================================ */
const API_BASE   = '/orders';
const POLL_MS    = 5000;
const URGENT_MIN = 10; // minutes before card turns red

/* ================================================================
   STATE
   ================================================================ */
let knownPendingIds = new Set(); // track IDs to detect new PENDING orders
let muted           = false;
let audioCtx        = null;
let pollTimer       = null;
let clockTimer      = null;
let elapsedTimer    = null;

// Map orderId → {createdAt, startedAt} for elapsed timers
const orderTimes = {};

/* ================================================================
   AUDIO — Web Audio API synth chime (no asset files needed)
   ================================================================ */
function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playChime() {
    if (muted) return;
    try {
        const ctx = getAudioCtx();
        // 3-note pleasant chime: C5 → E5 → G5
        const notes  = [523.25, 659.25, 783.99];
        const starts = [0, 0.18, 0.36];
        notes.forEach((freq, i) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type      = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + starts[i]);

            const t0 = ctx.currentTime + starts[i];
            gain.gain.setValueAtTime(0, t0);
            gain.gain.linearRampToValueAtTime(0.4, t0 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7);

            osc.start(t0);
            osc.stop(t0 + 0.75);
        });
    } catch (e) {
        console.warn('Audio chime error:', e);
    }
}

function toggleMute() {
    muted = !muted;
    const btn  = document.getElementById('kds-mute-btn');
    const icon = btn.querySelector('i');
    if (muted) {
        btn.classList.remove('active');
        icon.className = 'fa-solid fa-volume-xmark';
        btn.title = 'Bật âm thanh';
    } else {
        btn.classList.add('active');
        icon.className = 'fa-solid fa-volume-high';
        btn.title = 'Tắt âm thanh';
    }
}

/* ================================================================
   CLOCK
   ================================================================ */
function startClock() {
    const clockEl = document.getElementById('kds-clock');
    const dateEl  = document.getElementById('kds-date');
    function tick() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('vi-VN', { hour12: false });
        dateEl.textContent  = now.toLocaleDateString('vi-VN', {
            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }
    tick();
    clockTimer = setInterval(tick, 1000);
}

/* ================================================================
   ELAPSED TIME HELPERS
   ================================================================ */
function elapsedLabel(isoDate) {
    if (!isoDate) return '--';
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    const m = Math.floor(diff / 60), s = diff % 60;
    if (m < 60) return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    const h = Math.floor(m / 60), rm = m % 60;
    return `${h}h ${rm}m`;
}

function isUrgent(isoDate) {
    if (!isoDate) return false;
    return (Date.now() - new Date(isoDate).getTime()) > URGENT_MIN * 60 * 1000;
}

function startElapsedTick() {
    // Every second, update all [data-elapsed] spans
    elapsedTimer = setInterval(() => {
        document.querySelectorAll('[data-elapsed]').forEach(el => {
            const iso = el.getAttribute('data-elapsed');
            el.textContent = elapsedLabel(iso);
        });
        // Update urgency classes
        document.querySelectorAll('.order-card[data-created]').forEach(card => {
            const iso = card.getAttribute('data-created');
            if (isUrgent(iso)) {
                card.classList.add('urgent');
            }
        });
    }, 1000);
}

/* ================================================================
   STATUS CHANGE
   ================================================================ */
async function updateStatus(orderId, newStatus, btnEl) {
    if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
    }
    try {
        const res = await fetch(`/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast(`Đơn #${orderId} → ${statusLabel(newStatus)}`, 'success');
        // Refresh immediately
        await loadOrders();
    } catch (e) {
        showToast(`Lỗi cập nhật đơn #${orderId}: ${e.message}`, 'error');
        if (btnEl) {
            btnEl.disabled = false;
        }
    }
}

function statusLabel(s) {
    return { PENDING: 'Chờ pha chế', PROCESSING: 'Đang pha chế', DELIVERING: 'Sẵn sàng giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' }[s] || s;
}

/* ================================================================
   RENDER HELPERS
   ================================================================ */
function payTag(order) {
    const method = (order.paymentMethod || '').toLowerCase();
    if (method === 'cash') {
        return `<span class="pay-tag cash"><i class="fa-solid fa-money-bill-wave"></i> Tiền mặt</span>`;
    }
    const paid = order.paid || order.paymentStatus === 'PAID';
    return paid
        ? `<span class="pay-tag paid"><i class="fa-solid fa-check-circle"></i> Đã thanh toán</span>`
        : `<span class="pay-tag unpaid"><i class="fa-solid fa-clock"></i> Chưa thanh toán</span>`;
}

function renderItems(items) {
    if (!items || items.length === 0) return '<p style="color:var(--text-dim);font-size:0.78rem">Không có sản phẩm</p>';
    return items.map(it => {
        const blendLine = it.customBlend
            ? `<div class="card-item-blend">🫘 ${it.customBlend}</div>`
            : '';
        return `
            <div class="card-item">
                <span class="card-item-qty">${it.quantity || 1}x</span>
                <div>
                    <div class="card-item-name">${escHtml(it.productName || it.name || 'Sản phẩm')}</div>
                    ${blendLine}
                </div>
            </div>`;
    }).join('');
}

function renderActionBtn(order) {
    switch (order.status) {
        case 'PENDING':
            return `<button class="card-btn btn-start" onclick="updateStatus(${order.id},'PROCESSING',this)">
                        <i class="fa-solid fa-play"></i> Bắt đầu pha
                    </button>`;
        case 'PROCESSING':
            return `<button class="card-btn btn-done" onclick="updateStatus(${order.id},'DELIVERING',this)">
                        <i class="fa-solid fa-check"></i> Hoàn thành pha
                    </button>`;
        case 'DELIVERING':
            return `<button class="card-btn btn-received" onclick="updateStatus(${order.id},'COMPLETED',this)">
                        <i class="fa-solid fa-trophy"></i> Khách đã nhận
                    </button>`;
        default:
            return '';
    }
}

function buildCard(order) {
    const createdAt = order.createdAt || order.created_at;
    const notes     = order.notes || order.note || '';
    const noteHtml  = notes
        ? `<div class="card-notes"><i class="fa-solid fa-note-sticky"></i> ${escHtml(notes)}</div>`
        : '';

    const urgentClass = (order.status === 'PENDING' && isUrgent(createdAt)) ? 'urgent' : '';

    return `
        <div class="order-card ${urgentClass}" data-id="${order.id}" data-created="${createdAt}">
            <div class="card-top">
                <div>
                    <div class="card-id">#${order.id}</div>
                    <div class="card-customer"><i class="fa-solid fa-user" style="font-size:0.68rem;margin-right:4px"></i>${escHtml(order.customerName || order.userName || 'Khách vãng lai')}</div>
                </div>
                <div class="card-elapsed" data-elapsed="${createdAt}">
                    <i class="fa-regular fa-clock"></i>
                    ${elapsedLabel(createdAt)}
                </div>
            </div>
            <div class="card-items">${renderItems(order.items || order.orderItems)}</div>
            ${noteHtml}
            <div class="card-footer">
                ${payTag(order)}
            </div>
            ${renderActionBtn(order)}
        </div>`;
}

function emptyState(message) {
    return `<div class="kds-empty"><i class="fa-solid fa-mug-hot"></i><p>${message}</p></div>`;
}

/* ================================================================
   MAIN LOAD & RENDER
   ================================================================ */
async function loadOrders() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const orders = await res.json();

        const pending    = orders.filter(o => o.status === 'PENDING');
        const processing = orders.filter(o => o.status === 'PROCESSING');
        const delivering = orders.filter(o => o.status === 'DELIVERING');

        // Detect new PENDING orders → chime
        const newPendingIds = new Set(pending.map(o => o.id));
        let hasNew = false;
        newPendingIds.forEach(id => {
            if (!knownPendingIds.has(id)) hasNew = true;
        });
        if (hasNew && knownPendingIds.size > 0) {
            // Only chime after the first successful poll (not on initial page load)
            playChime();
            showToast('🔔 Có đơn hàng mới!', 'info');
        }
        knownPendingIds = newPendingIds;

        // Render columns
        renderColumn('col-pending',    'count-pending',    pending,    'Chưa có đơn chờ pha');
        renderColumn('col-processing', 'count-processing', processing, 'Không có đơn đang pha');
        renderColumn('col-delivering', 'count-delivering', delivering, 'Chưa có đơn sẵn sàng');

        // Active count badge (pending + processing + delivering)
        document.getElementById('kds-active-count').textContent =
            pending.length + processing.length + delivering.length;

    } catch (e) {
        console.error('KDS poll error:', e);
    }
}

function renderColumn(colId, countId, orders, emptyMsg) {
    const colEl   = document.getElementById(colId);
    const countEl = document.getElementById(countId);

    // Preserve scroll position
    const scrollTop = colEl.scrollTop;

    countEl.textContent = orders.length;

    if (orders.length === 0) {
        colEl.innerHTML = emptyState(emptyMsg);
    } else {
        // Sort: oldest first (highest urgency at top)
        const sorted = [...orders].sort((a, b) => {
            const ta = new Date(a.createdAt || a.created_at || 0).getTime();
            const tb = new Date(b.createdAt || b.created_at || 0).getTime();
            return ta - tb;
        });
        colEl.innerHTML = sorted.map(buildCard).join('');
    }

    colEl.scrollTop = scrollTop;
}

/* ================================================================
   POLLING
   ================================================================ */
function startPolling() {
    loadOrders(); // first immediate fetch
    pollTimer = setInterval(loadOrders, POLL_MS);
}

/* ================================================================
   TOAST
   ================================================================ */
function showToast(msg, type = 'info') {
    const container = document.getElementById('kds-toasts');
    const toast = document.createElement('div');
    toast.className = `kds-toast ${type}`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

/* ================================================================
   UTILITY
   ================================================================ */
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Hide loader after first paint
    document.getElementById('kds-loader').style.display = 'none';

    startClock();
    startElapsedTick();
    startPolling();

    // Unlock AudioContext on first user gesture (browser policy)
    document.addEventListener('click', () => {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }, { once: false });
});
