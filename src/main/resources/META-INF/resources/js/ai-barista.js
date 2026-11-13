/* ==========================================================================
   AI BARISTA SOMMELIER — Floating Chat Widget
   Self-contained: injects its own CSS, HTML, and logic.
   Usage: <script src="js/ai-barista.js"></script>
   ========================================================================== */

(function () {
  'use strict';

  /* ── MENU KNOWLEDGE BASE ─────────────────────────────────────────────── */
  const MENU = [
    {
      id: 'ca-phe-muoi',
      name: 'Cà phê Muối',
      price: 45000,
      image: 'images/products/ca-phe-muoi.jpg',
      tags: ['salty', 'unique', 'light', 'creamy', 'ít đắng', 'nhẹ nhàng', 'sữa'],
      desc: 'Cà phê muối đặc trưng – vị mặn ngọt hoà quyện với kem sữa béo ngậy.',
    },
    {
      id: 'cold-brew-cam-vang',
      name: 'Cold Brew Cam Vàng',
      price: 55000,
      image: 'images/products/cold-brew-cam-vang.jpg',
      tags: ['cold', 'fruity', 'refresh', 'nắng nóng', 'mát lạnh', 'ít ngọt', 'light', 'nhẹ nhàng'],
      desc: 'Cold Brew ủ lạnh 20 giờ, kết hợp cam vàng tươi – cân bằng độ chua ngọt tự nhiên.',
    },
    {
      id: 'bac-xiu-sua-nuong',
      name: 'Bạc Xỉu Sữa Nướng',
      price: 48000,
      image: 'images/products/bac-xiu-sua-nuong.jpg',
      tags: ['sweet', 'milk', 'light', 'ít caffeine', 'nhẹ nhàng', 'creamy', 'ít ngọt', 'sữa'],
      desc: 'Bạc xỉu truyền thống với sữa nướng thơm phức – lựa chọn hoàn hảo cho người ít caffeine.',
    },
    {
      id: 'espresso-double',
      name: 'Espresso Double Shot',
      price: 42000,
      image: 'images/products/espresso.jpg',
      tags: ['strong', 'caffeine', 'deadline', 'tỉnh táo', 'đậm đà', 'mạnh'],
      desc: 'Double espresso cô đặc – cú đấm caffeine cực mạnh giúp bạn tỉnh táo tuyệt đối.',
    },
    {
      id: 'cold-brew-nito',
      name: 'Nitro Cold Brew',
      price: 60000,
      image: 'images/products/nitro-cold-brew.jpg',
      tags: ['strong', 'caffeine', 'deadline', 'tỉnh táo', 'smooth', 'cold', 'không đường'],
      desc: 'Nitro Cold Brew sủi bọt mịn – năng lượng kéo dài, không đường, không sữa.',
    },
    {
      id: 'combo-coworking',
      name: 'Combo Co-working',
      price: 120000,
      image: 'images/products/combo-coworking.jpg',
      tags: ['coworking', 'combo', 'working', 'không gian', 'làm việc', 'bàn', 'wifi'],
      desc: 'Combo gồm 1 đồ uống tuỳ chọn + bánh ngọt + 4 giờ sử dụng không gian co-working.',
    },
    {
      id: 'banh-croissant-bo-phap',
      name: 'Bánh Croissant Bơ Pháp',
      price: 38000,
      image: 'images/products/croissant.jpg',
      tags: ['food', 'pastry', 'snack', 'nhẹ nhàng', 'ăn kèm', 'sáng'],
      desc: 'Croissant bơ Pháp giòn rụm, nhân bơ tan chảy – cặp đôi hoàn hảo cùng cà phê.',
    },
    {
      id: 'oat-latte',
      name: 'Oat Milk Latte',
      price: 55000,
      image: 'images/products/oat-latte.jpg',
      tags: ['sữa hạt', 'oat milk', 'vegan', 'không lactose', 'light', 'nhẹ nhàng', 'ít ngọt'],
      desc: 'Latte sữa yến mạch thuần thực vật – thơm béo, ít ngọt, thân thiện với người không dung nạp lactose.',
    },
  ];

  /* ── CONVERSATION ENGINE ─────────────────────────────────────────────── */
  const BOT_NAME = 'AI Barista';

  // Returns up to 3 best matching menu items for a query string
  function matchMenu(query) {
    const q = query.toLowerCase();
    const scored = MENU.map(item => {
      let score = 0;
      item.tags.forEach(tag => { if (q.includes(tag)) score += 2; });
      if (q.includes(item.name.toLowerCase())) score += 5;
      // keyword fuzzy bumps
      if ((q.includes('nhẹ') || q.includes('ít ngọt') || q.includes('light')) && item.tags.includes('light')) score += 1;
      if ((q.includes('nắng') || q.includes('nóng') || q.includes('mát')) && item.tags.includes('refresh')) score += 2;
      if ((q.includes('tỉnh') || q.includes('deadline') || q.includes('mạnh')) && item.tags.includes('caffeine')) score += 2;
      if ((q.includes('cowork') || q.includes('co-work') || q.includes('không gian') || q.includes('bàn')) && item.tags.includes('coworking')) score += 3;
      if ((q.includes('sữa hạt') || q.includes('oat') || q.includes('vegan')) && item.tags.includes('sữa hạt')) score += 3;
      if ((q.includes('custom') || q.includes('phối') || q.includes('blend')) ) score -= 10; // handled separately
      return { item, score };
    });
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.item);
  }

  function fmt(price) {
    return price.toLocaleString('vi-VN') + '₫';
  }

  function buildProductCard(item) {
    return `
      <div class="ab-product-card">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='images/logo.png'">
        <div class="ab-product-info">
          <strong>${item.name}</strong>
          <span class="ab-price">${fmt(item.price)}</span>
          <p class="ab-desc">${item.desc}</p>
          <div class="ab-product-actions">
            <a href="product-detail.html?id=${item.id}" class="ab-btn ab-btn-primary">
              <i class="fa-solid fa-eye"></i> Xem chi tiết món
            </a>
          </div>
        </div>
      </div>`;
  }

  function buildBotMessage(html) {
    return `<div class="ab-msg ab-msg-bot"><div class="ab-bubble">${html}</div></div>`;
  }

  function buildUserMessage(text) {
    return `<div class="ab-msg ab-msg-user"><div class="ab-bubble">${escHtml(text)}</div></div>`;
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Core reply logic
  function getReply(userText) {
    const q = userText.toLowerCase();

    // ── Custom Blend branch
    if (q.includes('custom') || q.includes('phối') || q.includes('blend')) {
      return `
        <p>🎨 <strong>Custom Blend Studio</strong> cho phép bạn tự tay phối:</p>
        <ul style="margin:6px 0 10px 16px;font-size:13px;">
          <li>🫘 Tỉ lệ Robusta Honey vs Arabica Cầu Đất</li>
          <li>⚗️ Phương pháp pha (Phin, Cold Brew, Espresso, Pour-over)</li>
          <li>🥛 Loại sữa & độ ngọt theo ý thích</li>
        </ul>
        <div class="ab-action-row">
          <a href="custom-blend.html" class="ab-btn ab-btn-accent">
            <i class="fa-solid fa-flask-vial"></i> Thử Custom Blend ngay
          </a>
        </div>`;
    }

    // ── Co-working branch
    if (q.includes('cowork') || q.includes('co-work') || q.includes('không gian') || q.includes('bàn') || q.includes('gói')) {
      const items = matchMenu(q);
      let cards = items.map(buildProductCard).join('');
      return `
        <p>🏢 <strong>Không gian Co-working</strong> tại Coffee Shop:</p>
        <ul style="margin:6px 0 10px 16px;font-size:13px;">
          <li>📶 WiFi tốc độ cao, ổ cắm riêng mỗi bàn</li>
          <li>🤫 Khu Yên Tĩnh / Khu Họp Nhóm / Khu Cửa Sổ</li>
          <li>☕ Combo đồ uống + bánh + 4h không gian</li>
        </ul>
        ${cards}
        <div class="ab-action-row">
          <a href="booking.html" class="ab-btn ab-btn-accent">
            <i class="fa-solid fa-calendar-check"></i> Đặt bàn Co-working
          </a>
        </div>`;
    }

    // ── General menu recommendation
    const items = matchMenu(q);
    if (items.length > 0) {
      const intro = q.includes('nắng') || q.includes('nóng') || q.includes('mát')
        ? '☀️ Cho ngày nắng nóng, đây là những lựa chọn giải nhiệt tuyệt vời:'
        : q.includes('deadline') || q.includes('tỉnh') || q.includes('mạnh')
          ? '⚡ Cần tỉnh táo chạy deadline? Đây là những lựa chọn cafein mạnh cho bạn:'
          : q.includes('nhẹ') || q.includes('ít ngọt') || q.includes('light')
            ? '🌸 Những lựa chọn nhẹ nhàng, ít ngọt cho bạn:'
            : q.includes('sữa hạt') || q.includes('oat') || q.includes('vegan')
              ? '🌿 Lựa chọn thuần thực vật, không lactose:'
              : '☕ Dựa trên gợi ý của bạn, Barista gợi ý:';
      return `<p>${intro}</p>${items.map(buildProductCard).join('')}`;
    }

    // ── Fallback / greeting
    return `
      <p>Xin chào! Tôi là <strong>AI Barista Sommelier</strong> 🤖☕</p>
      <p>Tôi có thể giúp bạn:</p>
      <ul style="margin:6px 0 10px 16px;font-size:13px;">
        <li>🔍 Tìm đồ uống phù hợp khẩu vị</li>
        <li>⚡ Gợi ý cà phê tỉnh táo cho deadline</li>
        <li>🌿 Lựa chọn theo chế độ ăn (sữa hạt, không đường…)</li>
        <li>🏢 Tư vấn gói Co-working</li>
        <li>🎨 Hướng dẫn tự phối Custom Blend</li>
      </ul>
      <p>Hãy thử nhập câu hỏi hoặc chọn gợi ý bên dưới nhé!</p>`;
  }

  /* ── STYLES ──────────────────────────────────────────────────────────── */
  const CSS = `
    /* === AI Barista Widget === */
    #ab-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    #ab-fab-btn {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6b3a2a 0%, #c8702a 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(107,58,42,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      color: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    #ab-fab-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(107,58,42,0.55); }
    #ab-pulse {
      position: absolute;
      top: -4px; right: -4px;
      background: #e74c3c;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 20px;
      letter-spacing: 0.3px;
      animation: ab-pulse-anim 1.8s infinite;
      white-space: nowrap;
    }
    @keyframes ab-pulse-anim {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }
    #ab-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b3a2a;
      background: rgba(255,255,255,0.92);
      padding: 2px 8px;
      border-radius: 20px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.12);
      pointer-events: none;
    }

    /* === Chat Window === */
    #ab-chat {
      position: fixed;
      bottom: 108px;
      right: 24px;
      z-index: 9998;
      width: 370px;
      max-width: calc(100vw - 32px);
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(107,58,42,0.22), 0 2px 12px rgba(0,0,0,0.10);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom right;
      transition: transform 0.25s cubic-bezier(.4,0,.2,1), opacity 0.25s;
      max-height: 72vh;
    }
    #ab-chat.ab-hidden {
      transform: scale(0.85) translateY(16px);
      opacity: 0;
      pointer-events: none;
    }
    .ab-chat-header {
      background: linear-gradient(135deg, #6b3a2a 0%, #c8702a 100%);
      color: #fff;
      padding: 14px 16px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ab-chat-header .ab-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .ab-chat-header .ab-title { flex: 1; }
    .ab-chat-header .ab-title strong { display: block; font-size: 13.5px; }
    .ab-chat-header .ab-title span { font-size: 10.5px; opacity: 0.85; }
    #ab-close-btn {
      background: rgba(255,255,255,0.18);
      border: none;
      color: #fff;
      border-radius: 50%;
      width: 28px; height: 28px;
      cursor: pointer;
      font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    #ab-close-btn:hover { background: rgba(255,255,255,0.32); }

    /* Messages */
    #ab-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 160px;
    }
    #ab-messages::-webkit-scrollbar { width: 4px; }
    #ab-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    .ab-msg { display: flex; }
    .ab-msg-bot { justify-content: flex-start; }
    .ab-msg-user { justify-content: flex-end; }
    .ab-bubble {
      max-width: 90%;
      padding: 10px 13px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.55;
    }
    .ab-msg-bot .ab-bubble {
      background: #f5f0eb;
      color: #2d1a0e;
      border-bottom-left-radius: 4px;
    }
    .ab-msg-user .ab-bubble {
      background: linear-gradient(135deg, #6b3a2a, #c8702a);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .ab-bubble p { margin: 0 0 6px; }
    .ab-bubble p:last-child { margin-bottom: 0; }
    .ab-bubble ul { padding-left: 18px; margin: 4px 0 8px; }

    /* Product Cards */
    .ab-product-card {
      display: flex;
      gap: 10px;
      background: #fff;
      border: 1px solid #ede0d4;
      border-radius: 12px;
      padding: 10px;
      margin: 6px 0;
    }
    .ab-product-card img {
      width: 70px; height: 70px;
      object-fit: cover;
      border-radius: 9px;
      flex-shrink: 0;
      background: #f5f0eb;
    }
    .ab-product-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .ab-product-info strong { font-size: 13px; color: #3d1f0e; }
    .ab-price { font-size: 12.5px; font-weight: 700; color: #c8702a; }
    .ab-desc { font-size: 11.5px; color: #7a5c47; margin: 2px 0 6px; line-height: 1.4; }
    .ab-product-actions { display: flex; gap: 6px; flex-wrap: wrap; }

    /* Buttons */
    .ab-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 11px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: filter 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .ab-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .ab-btn-primary { background: #6b3a2a; color: #fff; }
    .ab-btn-accent { background: linear-gradient(135deg,#c8702a,#e09050); color: #fff; }
    .ab-action-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

    /* Typing indicator */
    .ab-typing { display: flex; align-items: center; gap: 4px; padding: 10px 13px; }
    .ab-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #c8702a;
      animation: ab-bounce 1.2s infinite;
    }
    .ab-typing span:nth-child(2) { animation-delay: 0.18s; }
    .ab-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes ab-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    /* Chips */
    #ab-chips {
      padding: 8px 12px 4px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      border-top: 1px solid #f0e8e0;
    }
    .ab-chip {
      background: #fff8f3;
      border: 1.5px solid #d9b08c;
      color: #7a3e1a;
      padding: 5px 11px;
      border-radius: 20px;
      font-size: 11.5px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .ab-chip:hover { background: #f0dece; border-color: #c8702a; }

    /* Input row */
    #ab-input-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px 12px;
      border-top: 1px solid #f0e8e0;
    }
    #ab-input {
      flex: 1;
      border: 1.5px solid #d9b08c;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 13px;
      outline: none;
      color: #2d1a0e;
      background: #fffaf7;
      transition: border-color 0.15s;
      font-family: inherit;
    }
    #ab-input:focus { border-color: #c8702a; }
    #ab-send-btn {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6b3a2a, #c8702a);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
      transition: transform 0.15s, filter 0.15s;
    }
    #ab-send-btn:hover { transform: scale(1.08); filter: brightness(1.1); }

    @media (max-width: 420px) {
      #ab-chat { width: calc(100vw - 24px); right: 12px; }
      #ab-fab { right: 16px; bottom: 20px; }
    }
  `;

  /* ── HTML TEMPLATE ───────────────────────────────────────────────────── */
  const CHIPS = [
    'Tìm cà phê nhẹ nhàng, ít ngọt',
    'Cần tỉnh táo chạy deadline đêm',
    'Gợi ý đồ uống cho ngày nắng nóng',
    'Tư vấn gói không gian Co-working',
    'Tự phối vị Custom Blend thế nào?',
  ];

  function buildHTML() {
    const chipsHtml = CHIPS.map(c =>
      `<button class="ab-chip" data-chip="${escHtml(c)}">${escHtml(c)}</button>`
    ).join('');

    return `
      <!-- AI Barista FAB -->
      <div id="ab-fab">
        <button id="ab-fab-btn" aria-label="Mở AI Barista Sommelier" title="AI Barista Sommelier">
          <i class="fa-solid fa-mug-hot"></i>
          <span id="ab-pulse">AI Barista</span>
        </button>
        <span id="ab-label">AI Barista</span>
      </div>

      <!-- Chat Window -->
      <div id="ab-chat" class="ab-hidden" role="dialog" aria-modal="true" aria-label="AI Barista Sommelier">
        <div class="ab-chat-header">
          <div class="ab-avatar">🤖</div>
          <div class="ab-title">
            <strong>AI Barista Sommelier</strong>
            <span>Chuyên gia tư vấn cà phê &amp; khẩu vị</span>
          </div>
          <button id="ab-close-btn" aria-label="Đóng chat"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div id="ab-messages"></div>

        <div id="ab-chips">${chipsHtml}</div>

        <div id="ab-input-row">
          <input id="ab-input" type="text" placeholder="Hỏi Barista bất cứ điều gì…" autocomplete="off" aria-label="Nhập câu hỏi"/>
          <button id="ab-send-btn" aria-label="Gửi"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    `;
  }

  /* ── WIDGET CONTROLLER ───────────────────────────────────────────────── */
  function initWidget() {
    // Avoid double-init
    if (document.getElementById('ab-fab')) return;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Inject HTML
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildHTML();
    while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild);

    // DOM refs
    const fab       = document.getElementById('ab-fab-btn');
    const chat      = document.getElementById('ab-chat');
    const closeBtn  = document.getElementById('ab-close-btn');
    const messages  = document.getElementById('ab-messages');
    const input     = document.getElementById('ab-input');
    const sendBtn   = document.getElementById('ab-send-btn');
    const chips     = document.querySelectorAll('.ab-chip');

    let isOpen = false;

    function toggleChat() {
      isOpen = !isOpen;
      if (isOpen) {
        chat.classList.remove('ab-hidden');
        input.focus();
        if (messages.children.length === 0) {
          appendBot(getReply(''));
        }
      } else {
        chat.classList.add('ab-hidden');
      }
    }

    function appendBot(html) {
      const el = document.createElement('div');
      el.innerHTML = buildBotMessage(html);
      messages.appendChild(el.firstElementChild);
      messages.scrollTop = messages.scrollHeight;
    }

    function appendUser(text) {
      const el = document.createElement('div');
      el.innerHTML = buildUserMessage(text);
      messages.appendChild(el.firstElementChild);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const el = document.createElement('div');
      el.id = 'ab-typing-indicator';
      el.className = 'ab-msg ab-msg-bot';
      el.innerHTML = `<div class="ab-bubble ab-typing"><span></span><span></span><span></span></div>`;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
      const el = document.getElementById('ab-typing-indicator');
      if (el) el.remove();
    }

    function sendMessage(text) {
      text = text.trim();
      if (!text) return;
      appendUser(text);
      input.value = '';
      showTyping();
      // Simulate a short "thinking" delay
      setTimeout(() => {
        hideTyping();
        appendBot(getReply(text));
      }, 650 + Math.random() * 400);
    }

    // Events
    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.chip;
        if (!isOpen) toggleChat();
        setTimeout(() => sendMessage(text), isOpen ? 0 : 300);
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (isOpen && !chat.contains(e.target) && !fab.contains(e.target)) {
        toggleChat();
      }
    });

    // Keyboard accessibility: Escape closes
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) toggleChat();
    });
  }

  /* ── BOOTSTRAP ───────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
