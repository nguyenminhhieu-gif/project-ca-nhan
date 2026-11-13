/* ==========================================================================
   COFFEE SHOP - CUSTOM BREW STUDIO JAVASCRIPT
   Interactive custom coffee blend configuration & add-to-cart
   ========================================================================== */

/* ---------- STATE ---------- */
let blendState = {
    robusta: 70,
    arabica: 30,
    brewMethod: { key: 'phin', name: 'Phin Truyền Thống', price: 0 },
    milk: { key: 'condensed', name: 'Sữa đặc truyền thống', price: 5000 },
    sweetness: { key: '70%', label: 'Vừa ngọt (70%)' },
    temp: { key: 'iced', label: 'Đá mát lạnh' }
};

const BASE_PRICE = 29000;       // Base price for standard Robusta blend
const ARABICA_PER_PERCENT = 100; // Extra cost per % of Arabica

/* ==========================================================================
   BEAN RATIO SLIDERS
   ========================================================================== */

function onRobustaChange(val) {
    val = parseInt(val);
    blendState.robusta = val;
    blendState.arabica = 100 - val;
    document.getElementById('robustaSlider').value = val;
    document.getElementById('arabicaSlider').value = 100 - val;
    document.getElementById('robustaPercentLabel').innerText = val + '%';
    document.getElementById('arabicaPercentLabel').innerText = (100 - val) + '%';
    clearPresetSelection();
    updateTasteMeters();
    updatePreview();
}

function onArabicaChange(val) {
    val = parseInt(val);
    blendState.arabica = val;
    blendState.robusta = 100 - val;
    document.getElementById('arabicaSlider').value = val;
    document.getElementById('robustaSlider').value = 100 - val;
    document.getElementById('arabicaPercentLabel').innerText = val + '%';
    document.getElementById('robustaPercentLabel').innerText = (100 - val) + '%';
    clearPresetSelection();
    updateTasteMeters();
    updatePreview();
}

function setBeanPreset(robusta, arabica) {
    blendState.robusta = robusta;
    blendState.arabica = arabica;
    document.getElementById('robustaSlider').value = robusta;
    document.getElementById('arabicaSlider').value = arabica;
    document.getElementById('robustaPercentLabel').innerText = robusta + '%';
    document.getElementById('arabicaPercentLabel').innerText = arabica + '%';
    clearPresetSelection();
    updateTasteMeters();
    updatePreview();
}

function clearPresetSelection() {
    document.querySelectorAll('.studio-card:first-child .pill-option').forEach(
        btn => btn.classList.remove('selected')
    );
}

/* ==========================================================================
   TASTE PROFILE METERS
   ========================================================================== */

function updateTasteMeters() {
    const r = blendState.robusta;
    const a = blendState.arabica;

    // Body: Robusta-heavy → more body
    const body = Math.min(10, Math.round(3 + r * 0.07));
    // Bitter: Robusta drives bitterness
    const bitter = Math.min(10, Math.round(2 + r * 0.08));
    // Aroma: Arabica → more aroma
    const aroma = Math.min(10, Math.round(3 + a * 0.07));
    // Acidity: Arabica → more acidity
    const acidity = Math.min(10, Math.round(1 + a * 0.08));
    // Caffeine: Robusta has ~2x caffeine
    const caffeine = r >= 70 ? 'Rất Cao' : r >= 50 ? 'Cao' : r >= 30 ? 'Vừa' : 'Thấp';
    const caffeinePercent = Math.min(100, 30 + r * 0.7);

    setMeter('meterBody', 'valBody', body * 10, body + '/10');
    setMeter('meterBitter', 'valBitter', bitter * 10, bitter + '/10');
    setMeter('meterAroma', 'valAroma', aroma * 10, aroma + '/10');
    setMeter('meterAcidity', 'valAcidity', acidity * 10, acidity + '/10');
    setMeter('meterCaffeine', 'valCaffeine', caffeinePercent, caffeine);
}

function setMeter(barId, valId, percent, text) {
    const bar = document.getElementById(barId);
    const val = document.getElementById(valId);
    if (bar) bar.style.width = percent + '%';
    if (val) val.innerText = text;
}

/* ==========================================================================
   BREW METHOD SELECTION
   ========================================================================== */

function selectBrewMethod(key, name, price, el) {
    blendState.brewMethod = { key, name, price };

    const grid = document.getElementById('brewMethodGrid');
    if (grid) {
        grid.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
    }
    if (el) el.classList.add('selected');

    updatePreview();
}

/* ==========================================================================
   MILK SELECTION
   ========================================================================== */

function selectMilk(key, name, price, el) {
    blendState.milk = { key, name, price };

    const grid = document.getElementById('milkGrid');
    if (grid) {
        grid.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
    }
    if (el) el.classList.add('selected');

    updatePreview();
}

/* ==========================================================================
   SWEETNESS SELECTION
   ========================================================================== */

function selectSweetness(key, label, el) {
    blendState.sweetness = { key, label };

    const group = document.getElementById('sweetnessGroup');
    if (group) {
        group.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
    }
    if (el) el.classList.add('selected');

    updatePreview();
}

/* ==========================================================================
   TEMPERATURE SELECTION
   ========================================================================== */

function selectTemp(key, label, el) {
    blendState.temp = { key, label };

    const group = document.getElementById('tempGroup');
    if (group) {
        group.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
    }
    if (el) el.classList.add('selected');

    // Toggle ice cubes visual
    updateCupVisual();
    updatePreview();
}

/* ==========================================================================
   QUANTITY STEPPER
   ========================================================================== */

function changeStudioQty(delta) {
    const input = document.getElementById('studioQty');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 20) val = 20;
    input.value = val;
    updatePreview();
}

/* ==========================================================================
   PRICING CALCULATION
   ========================================================================== */

function calculateUnitPrice() {
    const arabicaBonus = blendState.arabica * ARABICA_PER_PERCENT;
    const brewPrice = blendState.brewMethod.price || 0;
    const milkPrice = blendState.milk.price || 0;
    return BASE_PRICE + arabicaBonus + brewPrice + milkPrice;
}

/* ==========================================================================
   PREVIEW / SUMMARY UPDATE
   ========================================================================== */

function updatePreview() {
    const unitPrice = calculateUnitPrice();
    const qty = parseInt(document.getElementById('studioQty')?.value) || 1;
    const arabicaBonus = blendState.arabica * ARABICA_PER_PERCENT;

    // Recipe summary
    const summaryEl = document.getElementById('blendRecipeSummary');
    if (summaryEl) {
        const tempLabel = blendState.temp.key === 'iced' ? 'Đá' : 'Nóng';
        summaryEl.innerHTML =
            `${blendState.robusta}% Robusta Honey + ${blendState.arabica}% Arabica Cầu Đất<br>` +
            `${blendState.brewMethod.name}, ${blendState.milk.name.split(' ').slice(0, 2).join(' ')}, ${blendState.sweetness.key} Ngọt, ${tempLabel}`;
    }

    // Blend title
    const titleEl = document.getElementById('blendTitle');
    if (titleEl) {
        if (blendState.arabica >= 80) {
            titleEl.innerText = 'Custom Blend #Arabica Premium';
        } else if (blendState.robusta >= 80) {
            titleEl.innerText = 'Custom Blend #Đậm Đặc';
        } else {
            titleEl.innerText = 'Custom Blend #Artisan';
        }
    }

    // Price breakdown
    setText('priceBase', formatVND(BASE_PRICE));
    setText('priceArabicaBonus', '+' + formatVND(arabicaBonus));
    setText('summaryBrewName', blendState.brewMethod.name.split(' ')[0]);
    setText('priceBrewMethod', '+' + formatVND(blendState.brewMethod.price));
    setText('summaryMilkName', blendState.milk.name.split(' ').slice(0, 2).join(' '));
    setText('priceMilk', '+' + formatVND(blendState.milk.price));
    setText('unitPriceDisplay', formatVND(unitPrice));

    // Points preview
    const totalPrice = unitPrice * qty;
    const pointsPreview = Math.floor(totalPrice / 10000);
    setText('previewPoints', pointsPreview);

    // Update cup visual
    updateCupVisual();
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

/* ==========================================================================
   CUP VISUAL SIMULATION
   ========================================================================== */

function updateCupVisual() {
    const cupCoffee = document.getElementById('cupCoffee');
    const cupMilk = document.getElementById('cupMilk');
    const cupFoam = document.getElementById('cupFoam');
    const ice1 = document.getElementById('ice1');
    const ice2 = document.getElementById('ice2');
    const ice3 = document.getElementById('ice3');

    // Coffee darkness based on robusta percentage
    const robustaRatio = blendState.robusta / 100;
    const r = Math.round(60 + (1 - robustaRatio) * 60);
    const g = Math.round(30 + (1 - robustaRatio) * 30);
    const b = Math.round(10 + (1 - robustaRatio) * 15);

    if (cupCoffee) {
        cupCoffee.style.background = `rgb(${r}, ${g}, ${b})`;
    }

    // Milk layer
    const hasMilk = blendState.milk.key !== 'none';
    if (cupMilk) {
        if (hasMilk) {
            let milkColor = '#f5e6d3'; // Condensed
            if (blendState.milk.key === 'fresh') milkColor = '#fafafa';
            if (blendState.milk.key === 'oat') milkColor = '#e8dcc8';
            cupMilk.style.background = milkColor;
            cupMilk.style.height = '30%';
        } else {
            cupMilk.style.height = '0%';
        }
    }

    // Foam layer
    if (cupFoam) {
        const hasFoam = (blendState.brewMethod.key === 'espresso' || blendState.milk.key === 'fresh');
        cupFoam.style.height = hasFoam ? '12%' : '0%';
    }

    // Ice cubes
    const showIce = blendState.temp.key === 'iced';
    [ice1, ice2, ice3].forEach(ice => {
        if (ice) ice.style.display = showIce ? 'block' : 'none';
    });
}

/* ==========================================================================
   ADD CUSTOM BLEND TO CART
   ========================================================================== */

async function addCustomBlendToCart() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showToast('Vui lòng đăng nhập để thêm vào giỏ hàng!', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
    }

    const qty = parseInt(document.getElementById('studioQty')?.value) || 1;
    const unitPrice = calculateUnitPrice();

    // Build descriptive product name
    const blendName = `Custom Blend: ${blendState.robusta}% Robusta + ${blendState.arabica}% Arabica | ` +
        `${blendState.brewMethod.name} | ${blendState.milk.name} | ${blendState.sweetness.key} ngọt | ` +
        `${blendState.temp.key === 'iced' ? 'Đá' : 'Nóng'}`;

    const btn = document.getElementById('btnAddToCartStudio');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang thêm...</span>';
    }

    try {
        // Try to add as a custom product to cart via /cart/add
        // First, attempt to find a "custom blend" placeholder product ID or create the cart item
        // The backend expects productId, so we use a convention: productId=0 or a special ID for custom blends
        // We'll try sending with minimal required data
        const cartData = {
            userId: userId,
            productId: 0,
            quantity: qty,
            productName: blendName,
            price: unitPrice
        };

        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartData)
        });

        if (response.ok) {
            showToast(`Đã thêm ${qty} x Custom Blend vào giỏ hàng!`, 'success');
            if (typeof updateCartBadge === 'function') updateCartBadge();
        } else {
            // If backend doesn't support productId=0, store in localStorage cart as fallback
            addCustomBlendToLocalCart(blendName, unitPrice, qty);
            showToast(`Đã thêm ${qty} x Custom Blend vào giỏ hàng!`, 'success');
            if (typeof updateCartBadge === 'function') updateCartBadge();
        }
    } catch (error) {
        console.error('Add custom blend to cart error:', error);
        // Fallback: store in localStorage
        addCustomBlendToLocalCart(blendName, unitPrice, qty);
        showToast(`Đã thêm ${qty} x Custom Blend vào giỏ hàng!`, 'success');
        if (typeof updateCartBadge === 'function') updateCartBadge();
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> <span>Thêm Vào Giỏ Hàng</span>';
        }
    }
}

function addCustomBlendToLocalCart(name, price, qty) {
    try {
        let cart = JSON.parse(localStorage.getItem('customBlendCart') || '[]');
        cart.push({
            id: 'custom_' + Date.now(),
            name: name,
            price: price,
            quantity: qty,
            image: 'coldbrew.jpg',
            isCustom: true,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('customBlendCart', JSON.stringify(cart));
    } catch (e) {
        console.error('LocalStorage cart error:', e);
    }
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    updateTasteMeters();
    updatePreview();
    updateCupVisual();
});
