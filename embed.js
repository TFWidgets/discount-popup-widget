(function () {
    'use strict';

    const PRESET_ICONS = Object.freeze({
        gift: '🎁',
        fire: '🔥',
        star: '⭐',
        heart: '❤️',
        cart: '🛒',
        bell: '🔔',
        percent: '💸',
        tag: '🏷️',
        lightning: '⚡',
        sparkles: '✨'
    });

    const inlineCSS = `
        .bhw-overlay {
            position: fixed;
            inset: 0;
            background: var(--bhw-overlay, rgba(15,23,42,0.6));
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(8px);
            font-family: var(--bhw-font, 'Inter', system-ui, sans-serif);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .bhw-overlay.show {
            opacity: 1;
        }

        .bhw-card {
            width: min(92vw, 480px);
            background: var(--bhw-bg, #ffffff);
            border-radius: var(--bhw-widget-radius, 18px);
            box-shadow: var(--bhw-shadow, 0 25px 70px rgba(0,0,0,0.35));
            position: relative;
            overflow: hidden;
            transform: scale(0.8) translateY(20px);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bhw-overlay.show .bhw-card {
            transform: scale(1) translateY(0);
        }

        .bhw-ribbon {
            height: var(--bhw-ribbon-height, 100px);
            background: var(--bhw-header-bg, linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%));
            position: relative;
        }

        .bhw-ribbon::after {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--bhw-overlay-inner,
                radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            );
        }

        .bhw-content {
            padding: var(--bhw-padding, 24px 28px 32px);
            text-align: center;
            position: relative;
            color: var(--bhw-text-color, #333333);
        }

        .bhw-close {
            position: absolute;
            top: 12px;
            right: 16px;
            background: rgba(0,0,0,0.1);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            color: var(--bhw-text-color, #333333);
            font-size: 18px;
            transition: all 0.2s ease;
        }

        .bhw-close:hover {
            background: rgba(0,0,0,0.15);
            transform: scale(1.1);
        }

        .bhw-icon {
            position: absolute;
            top: var(--bhw-icon-top, -36px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--bhw-icon-bg, #fff);
            width: var(--bhw-icon-size, 68px);
            height: var(--bhw-icon-size, 68px);
            border-radius: var(--bhw-block-radius, 18px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--bhw-icon-font-size, 32px);
            box-shadow: var(--bhw-icon-shadow, 0 12px 28px rgba(0,0,0,0.25));
            border: var(--bhw-block-border, 3px solid rgba(255,255,255,0.8));
            animation: bhw-bounce var(--bhw-bounce-duration, 2.5s) ease-in-out infinite;
            overflow: hidden;
            line-height: 1;
        }

        .bhw-icon-emoji {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            line-height: 1;
        }

        .bhw-icon-image {
            display: block;
            width: 70%;
            height: 70%;
            object-fit: contain;
        }

        .bhw-no-icon .bhw-title {
            margin-top: 0;
        }

        .bhw-title {
            margin: var(--bhw-title-margin, 24px 0 8px 0);
            font-size: var(--bhw-title-size, 1.6em);
            font-weight: var(--bhw-title-weight, 800);
            letter-spacing: var(--bhw-title-spacing, -0.3px);
            color: var(--bhw-title-color, inherit);
            text-shadow: var(--bhw-text-shadow, none);
        }

        .bhw-message {
            margin: 0 0 20px 0;
            font-size: var(--bhw-subtitle-size, 1.05em);
            opacity: var(--bhw-subtitle-opacity, 0.85);
            line-height: 1.4;
            color: var(--bhw-subtitle-color, inherit);
            font-weight: var(--bhw-subtitle-weight, 400);
        }

        .bhw-coupon {
            background: var(--bhw-coupon-bg, #fff3cd);
            border: var(--bhw-coupon-border, 2px dashed #f59e0b);
            padding: var(--bhw-coupon-padding, 16px);
            margin: var(--bhw-coupon-margin, 20px 0 24px);
            border-radius: var(--bhw-coupon-radius, 12px);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .bhw-coupon:hover {
            transform: translateY(-1px);
            box-shadow: var(--bhw-coupon-shadow-hover, 0 4px 12px rgba(0,0,0,0.1));
        }

        .bhw-coupon.copied {
            background: var(--bhw-coupon-copied-bg, #d1fae5);
            border-color: var(--bhw-coupon-copied-border, #10b981);
        }

        .bhw-coupon-label {
            display: block;
            font-size: var(--bhw-coupon-label-size, 0.85em);
            color: var(--bhw-coupon-text, #7c2d12);
            opacity: 0.8;
            margin-bottom: 4px;
        }

        .bhw-coupon-code {
            font-size: var(--bhw-coupon-code-size, 1.3em);
            font-weight: var(--bhw-coupon-code-weight, 800);
            color: var(--bhw-coupon-text, #7c2d12);
            font-family: var(--bhw-value-font, 'JetBrains Mono', 'SF Mono', monospace);
            letter-spacing: var(--bhw-coupon-code-spacing, 1px);
        }

        .bhw-copy-hint {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: var(--bhw-hint-size, 0.7em);
            opacity: 0.6;
            color: var(--bhw-coupon-text, #7c2d12);
        }

        .bhw-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--bhw-gap, 12px);
        }

        .bhw-btn-primary {
            background: var(--bhw-btn-primary-bg, linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%));
            color: var(--bhw-btn-primary-color, white);
            border: none;
            padding: var(--bhw-block-padding, 16px 32px);
            border-radius: var(--bhw-btn-radius, 12px);
            font-size: var(--bhw-btn-size, 1.1em);
            font-weight: var(--bhw-btn-weight, 700);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            font-family: var(--bhw-btn-font, inherit);
        }

        .bhw-btn-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%);
        }

        .bhw-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--bhw-btn-shadow-hover, 0 8px 24px rgba(139, 92, 246, 0.4));
        }

        .bhw-btn-secondary {
            background: var(--bhw-btn-secondary-bg, #f1f5f9);
            color: var(--bhw-btn-secondary-color, #333333);
            border: none;
            padding: var(--bhw-btn-secondary-padding, 12px 24px);
            border-radius: var(--bhw-btn-secondary-radius, 10px);
            font-size: var(--bhw-btn-secondary-size, 0.95em);
            font-weight: var(--bhw-btn-secondary-weight, 600);
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: var(--bhw-btn-secondary-opacity, 0.8);
        }

        .bhw-btn-secondary:hover {
            opacity: 1;
            background: var(--bhw-btn-secondary-bg-hover, #e2e8f0);
        }

        .bhw-logo {
            max-height: var(--bhw-logo-height, 32px);
            max-width: var(--bhw-logo-width, 140px);
            margin: 8px auto 0;
            display: block;
        }

        .bhw-loading {
            text-align: center;
            padding: var(--bhw-loading-padding, 40px);
            color: var(--bhw-loading-color, #666);
        }

        .bhw-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(139,92,246,0.2);
            border-top: 3px solid #8b5cf6;
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes bhw-bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-6px); }
        }

        @keyframes bhw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
            .bhw-content {
                padding: var(--bhw-padding-mobile, 20px 24px 28px);
            }
            .bhw-title {
                font-size: var(--bhw-title-size-mobile, 1.4em);
            }
            .bhw-message {
                font-size: var(--bhw-subtitle-size-mobile, 1em);
            }
        }
    `;

    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.discountPopups = window.BusinessHoursWidgets.discountPopups || {};
    window.BusinessHoursWidgets.discountPopupPresets = PRESET_ICONS;

    const BHW = window.BusinessHoursWidgets;

    BHW.createOrUpdateDiscountPopup = function (clientId, newConfig, options = {}) {
        const normalizedId = normalizeId(clientId || 'demo');
        const finalConfig = mergeDeep(getDefaultConfig(), newConfig || {});

        const existing = BHW.discountPopups[normalizedId];
        if (existing && typeof existing.destroy === 'function') {
            existing.destroy();
        }

        ensureBaseStyles();

        const uniqueClass = `bhw-discount-${normalizedId}-${Date.now()}`;
        const widget = createDiscountPopupWidget(finalConfig, uniqueClass, normalizedId);
        BHW.discountPopups[normalizedId] = widget;
        setupTriggers(widget, finalConfig);

        if (options.showImmediately) {
            widget.show(true);
        }

        return widget;
    };

    BHW.reloadDiscountPopup = BHW.createOrUpdateDiscountPopup;

    BHW.getDiscountPopupConfigTemplate = function () {
        return JSON.parse(JSON.stringify(getDefaultConfig()));
    };

    try {
        const currentScript = document.currentScript || (function () {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        if (!currentScript) return;

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[BusinessHoursDiscountPopupWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        ensureBaseStyles();

        const baseUrl = getBasePath(currentScript.src);

        console.log(`[BusinessHoursDiscountPopupWidget] 🚀 Инициализация виджета "${clientId}"`);

        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                BHW.createOrUpdateDiscountPopup(clientId, fetchedConfig);
                console.log(`[BusinessHoursDiscountPopupWidget] ✅ Виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[BusinessHoursDiscountPopupWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                BHW.createOrUpdateDiscountPopup(clientId, getDefaultConfig());
            });
    } catch (error) {
        console.error('[BusinessHoursDiscountPopupWidget] 💥 Критическая ошибка:', error);
    }

    function ensureBaseStyles() {
        if (!document.querySelector('#business-hours-discount-popup-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'business-hours-discount-popup-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }
    }

    function normalizeId(id) {
        return (id || 'demo').replace(/\.(json|js)$/i, '');
    }

    function getBasePath(src) {
        if (!src) return './';
        try {
            const url = new URL(src, location.href);
            return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
        } catch (error) {
            return './';
        }
    }

    function getDefaultConfig() {
        return {
            title: "Don't leave!",
            message: "Get 20% off your first purchase",
            couponCode: "SAVE20",
            icon: {
                type: 'preset',
                value: 'gift'
            },
            buttonText: "Get discount",
            dismissText: "No, thanks",
            triggerDelay: 0,
            showOnExit: false,
            showOnScroll: 0,
            frequency: "session",
            logo: "",
            style: {
                fontFamily: "'Inter', system-ui, sans-serif",
                valueFontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                colors: {
                    background: "#ffffff",
                    text: "#333333",
                    headerBackground: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    overlay: "rgba(15,23,42,0.6)",
                    blockBackground: "rgba(255,255,255,0.8)",
                    blockBorder: "rgba(255,255,255,0.8)",
                    blockHover: "rgba(255,255,255,0.9)",
                    borderHover: "rgba(255,255,255,1.0)",
                    btnPrimary: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    btnPrimaryText: "white",
                    btnSecondary: "#f1f5f9",
                    btnSecondaryText: "#333333",
                    btnSecondaryHover: "#e2e8f0",
                    couponBg: "#fff3cd",
                    couponBorder: "#f59e0b",
                    couponText: "#7c2d12",
                    couponCopiedBg: "#d1fae5",
                    couponCopiedBorder: "#10b981"
                },
                borderRadius: {
                    widget: 18,
                    blocks: 12
                },
                sizes: {
                    fontSize: 1.0,
                    padding: 24,
                    blockPadding: 16,
                    gap: 12,
                    iconSize: 68,
                    ribbonHeight: 100
                },
                shadow: {
                    widget: "0 25px 70px rgba(0,0,0,0.35)",
                    widgetHover: "0 35px 90px rgba(0,0,0,0.45)",
                    text: "none",
                    btnHover: "0 8px 24px rgba(139, 92, 246, 0.4)",
                    iconShadow: "0 12px 28px rgba(0,0,0,0.25)",
                    couponHover: "0 4px 12px rgba(0,0,0,0.1)"
                }
            }
        };
    }

    function mergeDeep(base, override) {
        const result = { ...base, ...override };

        if (base.icon && typeof base.icon === 'object' && override.icon && typeof override.icon === 'object' && !Array.isArray(override.icon)) {
            result.icon = { ...base.icon, ...override.icon };
        }

        if (base.style && typeof base.style === 'object') {
            result.style = { ...(base.style || {}), ...(override.style || {}) };
        }

        if (result.style) {
            for (const subKey of ['colors', 'borderRadius', 'sizes', 'shadow']) {
                if (base.style[subKey] && typeof base.style[subKey] === 'object') {
                    result.style[subKey] = {
                        ...(base.style[subKey] || {}),
                        ...(override.style?.[subKey] || {})
                    };
                }
            }
        }

        if (override?.theme) {
            const theme = override.theme;
            result.style.colors.headerBackground = `linear-gradient(135deg, ${theme.primary || '#8b5cf6'} 0%, ${theme.secondary || '#6d28d9'} 100%)`;
            result.style.colors.btnPrimary = `linear-gradient(135deg, ${theme.primary || '#8b5cf6'} 0%, ${theme.secondary || '#6d28d9'} 100%)`;
            result.style.colors.background = theme.background || result.style.colors.background;
            result.style.colors.text = theme.text || result.style.colors.text;
            result.style.colors.overlay = theme.overlay || result.style.colors.overlay;
            result.style.colors.couponBg = theme.couponBg || result.style.colors.couponBg;
            result.style.colors.couponBorder = theme.couponBorder || result.style.colors.couponBorder;
            result.style.colors.couponText = theme.couponText || result.style.colors.couponText;
            result.style.borderRadius.widget = theme.borderRadius || result.style.borderRadius.widget;
        }

        return result;
    }

    async function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            const localScript = document.querySelector('#bhw-discount-local-config, #dpw-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#bhw-discount-local-config)');
            }
            try {
                return JSON.parse(localScript.textContent);
            } catch (err) {
                throw new Error('Ошибка парсинга локального JSON: ' + err.message);
            }
        }

        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        const response = await fetch(configUrl, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    function createDiscountPopupWidget(config, uniqueClass, id) {
        const normalizedIcon = normalizeIconConfig(config);
        const iconMarkup = renderIcon(normalizedIcon);

        const overlay = document.createElement('div');
        overlay.className = `bhw-overlay ${uniqueClass}${iconMarkup ? '' : ' bhw-no-icon'}`;
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('data-bhw-id', id);
        document.body.appendChild(overlay);

        const styleId = applyCustomStyles(uniqueClass, config.style, !!iconMarkup);

        overlay.innerHTML = `
            <div class="bhw-card" role="dialog" aria-modal="true">
                <div class="bhw-ribbon"></div>
                <div class="bhw-content">
                    <button class="bhw-close" aria-label="Close">×</button>
                    ${config.logo ? `<img class="bhw-logo" src="${escapeAttr(config.logo)}" alt="Logo">` : ''}
                    ${iconMarkup ? `<div class="bhw-icon" aria-hidden="true">${iconMarkup}</div>` : ''}
                    <h2 class="bhw-title">${escapeHtml(config.title)}</h2>
                    <p class="bhw-message">${escapeHtml(config.message)}</p>

                    <div class="bhw-coupon" tabindex="0" role="button" aria-label="Copy coupon code">
                        <span class="bhw-coupon-label">Promo Code:</span>
                        <strong class="bhw-coupon-code">${escapeHtml(config.couponCode)}</strong>
                        <span class="bhw-copy-hint">Click to copy</span>
                    </div>

                    <div class="bhw-buttons">
                        <button class="bhw-btn-primary" type="button">
                            ${escapeHtml(config.buttonText)}
                        </button>
                        <button class="bhw-btn-secondary" type="button">
                            ${escapeHtml(config.dismissText)}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const widget = {
            overlay,
            config,
            id,
            styleId,
            isShown: false,
            cleanups: [],

            show(force = false) {
                if (this.isShown) return;
                if (!force && !shouldShowByFrequency(this.config.frequency, this.id)) return;

                this.overlay.style.display = 'flex';

                requestAnimationFrame(() => {
                    this.overlay.classList.add('show');
                });

                this.overlay.setAttribute('aria-hidden', 'false');
                this.isShown = true;

                if (!force) {
                    markAsShown(this.config.frequency, this.id);
                }
            },

            hide() {
                if (!this.isShown && this.overlay.style.display === 'none') return;

                this.overlay.classList.remove('show');

                const timeoutId = setTimeout(() => {
                    this.overlay.style.display = 'none';
                }, 300);

                this.cleanups.push(() => clearTimeout(timeoutId));
                this.overlay.setAttribute('aria-hidden', 'true');
                this.isShown = false;
            },

            copyCoupon() {
                const code = this.config.couponCode || '';
                const btn = this.overlay.querySelector('.bhw-btn-primary');
                const coupon = this.overlay.querySelector('.bhw-coupon');

                copyText(code)
                    .then(() => {
                        if (btn) btn.textContent = 'Copied!';
                        if (coupon) coupon.classList.add('copied');

                        const timeoutId = setTimeout(() => {
                            if (btn) btn.textContent = this.config.buttonText;
                            if (coupon) coupon.classList.remove('copied');
                        }, 1500);

                        this.cleanups.push(() => clearTimeout(timeoutId));
                    })
                    .catch(() => {
                        console.warn('[BusinessHoursDiscountPopupWidget] Не удалось скопировать промокод');
                    });
            },

            destroy() {
                this.cleanups.forEach(fn => {
                    try { fn(); } catch (_) {}
                });
                this.cleanups = [];

                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }

                if (this.styleId) {
                    const styleNode = document.getElementById(this.styleId);
                    if (styleNode) styleNode.remove();
                }

                if (BHW.discountPopups[this.id] === this) {
                    delete BHW.discountPopups[this.id];
                }
            }
        };

        setupEventHandlers(widget);
        return widget;
    }

    function applyCustomStyles(uniqueClass, style, hasIcon) {
        const styleId = `bhw-discount-style-${uniqueClass}`;
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = generateUniqueStyles(uniqueClass, style, hasIcon);
        return styleId;
    }

    function generateUniqueStyles(uniqueClass, style, hasIcon) {
        const s = style || {};
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};
        const fs = sizes.fontSize || 1;
        const titleTopMargin = hasIcon ? Math.round(24 * fs) : 0;

        return `
            .${uniqueClass} {
                --bhw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --bhw-value-font: ${s.valueFontFamily || "'JetBrains Mono', 'SF Mono', monospace"};
                --bhw-bg: ${colors.background || "#ffffff"};
                --bhw-widget-radius: ${borderRadius.widget || 18}px;
                --bhw-padding: ${sizes.padding || 24}px 28px 32px;
                --bhw-padding-mobile: ${Math.round((sizes.padding || 24) * 0.8)}px 24px 28px;
                --bhw-text-color: ${colors.text || "#333333"};
                --bhw-overlay: ${colors.overlay || "rgba(15,23,42,0.6)"};
                --bhw-header-bg: ${colors.headerBackground || "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"};
                --bhw-shadow: ${shadow.widget || "0 25px 70px rgba(0,0,0,0.35)"};
                --bhw-shadow-hover: ${shadow.widgetHover || "0 35px 90px rgba(0,0,0,0.45)"};
                --bhw-text-shadow: ${shadow.text || "none"};
                --bhw-ribbon-height: ${sizes.ribbonHeight || 100}px;
                --bhw-icon-size: ${sizes.iconSize || 68}px;
                --bhw-icon-font-size: ${Math.round((sizes.iconSize || 68) * 0.47)}px;
                --bhw-icon-top: ${Math.round((sizes.iconSize || 68) * -0.53)}px;
                --bhw-icon-bg: ${colors.blockBackground || "rgba(255,255,255,0.8)"};
                --bhw-block-border: ${(sizes.iconSize || 68) >= 60 ? 3 : 2}px solid ${colors.blockBorder || "rgba(255,255,255,0.8)"};
                --bhw-block-radius: ${borderRadius.blocks || 12}px;
                --bhw-icon-shadow: ${shadow.iconShadow || "0 12px 28px rgba(0,0,0,0.25)"};
                --bhw-bounce-duration: 2.5s;
                --bhw-title-size: ${1.6 * fs}em;
                --bhw-title-size-mobile: ${1.4 * fs}em;
                --bhw-title-weight: 800;
                --bhw-title-spacing: -0.3px;
                --bhw-title-margin: ${titleTopMargin}px 0 8px 0;
                --bhw-subtitle-size: ${1.05 * fs}em;
                --bhw-subtitle-size-mobile: ${1.0 * fs}em;
                --bhw-subtitle-opacity: 0.85;
                --bhw-subtitle-weight: 400;
                --bhw-gap: ${sizes.gap || 12}px;
                --bhw-block-padding: ${sizes.blockPadding || 16}px 32px;
                --bhw-btn-radius: ${borderRadius.blocks || 12}px;
                --bhw-btn-size: ${1.1 * fs}em;
                --bhw-btn-weight: 700;
                --bhw-btn-font: inherit;
                --bhw-btn-primary-bg: ${colors.btnPrimary || "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"};
                --bhw-btn-primary-color: ${colors.btnPrimaryText || "white"};
                --bhw-btn-shadow-hover: ${shadow.btnHover || "0 8px 24px rgba(139, 92, 246, 0.4)"};
                --bhw-btn-secondary-bg: ${colors.btnSecondary || "#f1f5f9"};
                --bhw-btn-secondary-color: ${colors.btnSecondaryText || "#333333"};
                --bhw-btn-secondary-bg-hover: ${colors.btnSecondaryHover || "#e2e8f0"};
                --bhw-btn-secondary-padding: 12px 24px;
                --bhw-btn-secondary-radius: 10px;
                --bhw-btn-secondary-size: ${0.95 * fs}em;
                --bhw-btn-secondary-weight: 600;
                --bhw-btn-secondary-opacity: 0.8;
                --bhw-coupon-bg: ${colors.couponBg || "#fff3cd"};
                --bhw-coupon-border: 2px dashed ${colors.couponBorder || "#f59e0b"};
                --bhw-coupon-padding: ${sizes.blockPadding || 16}px;
                --bhw-coupon-margin: 20px 0 24px;
                --bhw-coupon-radius: ${borderRadius.blocks || 12}px;
                --bhw-coupon-shadow-hover: ${shadow.couponHover || "0 4px 12px rgba(0,0,0,0.1)"};
                --bhw-coupon-copied-bg: ${colors.couponCopiedBg || "#d1fae5"};
                --bhw-coupon-copied-border: ${colors.couponCopiedBorder || "#10b981"};
                --bhw-coupon-text: ${colors.couponText || "#7c2d12"};
                --bhw-coupon-label-size: ${0.85 * fs}em;
                --bhw-coupon-code-size: ${1.3 * fs}em;
                --bhw-coupon-code-weight: 800;
                --bhw-coupon-code-spacing: 1px;
                --bhw-hint-size: ${0.7 * fs}em;
                --bhw-logo-height: 32px;
                --bhw-logo-width: 140px;
            }
        `;
    }

    function normalizeIconConfig(config) {
        const iconConfig = config?.icon;

        if (iconConfig && typeof iconConfig === 'object' && !Array.isArray(iconConfig)) {
            const type = String(iconConfig.type || 'preset').trim().toLowerCase();
            const value = String(iconConfig.value ?? '').trim();

            if (type === 'none') {
                return { type: 'none', value: '' };
            }

            if (type === 'preset') {
                return {
                    type: 'preset',
                    value: PRESET_ICONS[value] ? value : 'gift'
                };
            }

            if (type === 'emoji') {
                return {
                    type: 'emoji',
                    value: value || '🎁'
                };
            }

            if (type === 'image') {
                return {
                    type: 'image',
                    value: isValidImageSource(value) ? value : ''
                };
            }
        }

        const legacyRaw = firstNonEmpty(
            typeof config?.iconHtml === 'string' ? config.iconHtml : '',
            typeof config?.icon === 'string' ? config.icon : ''
        );

        if (!legacyRaw) {
            return { type: 'preset', value: 'gift' };
        }

        const raw = String(legacyRaw).trim();

        if (isValidImageSource(raw)) {
            return { type: 'image', value: raw };
        }

        if (PRESET_ICONS[raw]) {
            return { type: 'preset', value: raw };
        }

        const decoded = decodeHtmlEntities(raw);

        if (PRESET_ICONS[decoded]) {
            return { type: 'preset', value: decoded };
        }

        return {
            type: 'emoji',
            value: decoded || '🎁'
        };
    }

    function renderIcon(icon) {
        if (!icon || icon.type === 'none') return '';

        if (icon.type === 'preset') {
            return `<span class="bhw-icon-emoji">${escapeHtml(PRESET_ICONS[icon.value] || '🎁')}</span>`;
        }

        if (icon.type === 'emoji') {
            return `<span class="bhw-icon-emoji">${escapeHtml(icon.value || '🎁')}</span>`;
        }

        if (icon.type === 'image' && icon.value) {
            return `<img class="bhw-icon-image" src="${escapeAttr(icon.value)}" alt="" />`;
        }

        return `<span class="bhw-icon-emoji">🎁</span>`;
    }

    function setupEventHandlers(widget) {
        const { overlay } = widget;

        const on = (target, event, handler, options) => {
            target.addEventListener(event, handler, options);
            widget.cleanups.push(() => target.removeEventListener(event, handler, options));
        };

        on(overlay, 'click', (e) => {
            if (e.target === overlay) widget.hide();
        });

        const closeBtn = overlay.querySelector('.bhw-close');
        const secondaryBtn = overlay.querySelector('.bhw-btn-secondary');
        const coupon = overlay.querySelector('.bhw-coupon');
        const primaryBtn = overlay.querySelector('.bhw-btn-primary');

        if (closeBtn) on(closeBtn, 'click', () => widget.hide());
        if (secondaryBtn) on(secondaryBtn, 'click', () => widget.hide());
        if (coupon) on(coupon, 'click', () => widget.copyCoupon());

        if (primaryBtn) {
            on(primaryBtn, 'click', () => {
                widget.copyCoupon();
                const timeoutId = setTimeout(() => widget.hide(), 1000);
                widget.cleanups.push(() => clearTimeout(timeoutId));
            });
        }

        on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && widget.isShown) {
                widget.hide();
            }
        });
    }

    function setupTriggers(widget, config) {
        if (config.triggerDelay > 0) {
            const timeoutId = setTimeout(() => widget.show(), config.triggerDelay);
            widget.cleanups.push(() => clearTimeout(timeoutId));
        }

        if (config.showOnExit) {
            let hasTriggered = false;

            const leaveHandler = (e) => {
                if (e.clientY <= 0 && !hasTriggered && !widget.isShown) {
                    widget.show();
                    hasTriggered = true;
                }
            };

            document.addEventListener('mouseleave', leaveHandler);
            widget.cleanups.push(() => document.removeEventListener('mouseleave', leaveHandler));
        }

        if (config.showOnScroll > 0) {
            let hasTriggered = false;

            const scrollHandler = () => {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                if (maxScroll <= 0) return;

                const scrollPercent = (window.scrollY / maxScroll) * 100;

                if (scrollPercent >= config.showOnScroll && !hasTriggered && !widget.isShown) {
                    widget.show();
                    hasTriggered = true;
                }
            };

            window.addEventListener('scroll', scrollHandler);
            widget.cleanups.push(() => window.removeEventListener('scroll', scrollHandler));
        }
    }

    function shouldShowByFrequency(frequency, id) {
        if (frequency === 'always') return true;

        if (frequency === 'session') {
            return !sessionStorage.getItem(`bhw-discount-shown-${id}`);
        }

        const lastShown = parseInt(localStorage.getItem(`bhw-discount-lastShown-${id}`), 10) || 0;
        const now = Date.now();

        const intervals = {
            '24h': 24 * 60 * 60 * 1000,
            '3d': 3 * 24 * 60 * 60 * 1000
        };

        return (now - lastShown) > (intervals[frequency] || 0);
    }

    function markAsShown(frequency, id) {
        if (frequency === 'session') {
            sessionStorage.setItem(`bhw-discount-shown-${id}`, '1');
        } else if (frequency !== 'always') {
            localStorage.setItem(`bhw-discount-lastShown-${id}`, Date.now().toString());
        }
    }

    function copyText(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.setAttribute('readonly', '');
                textArea.style.position = 'absolute';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, textArea.value.length);

                const success = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (success) resolve();
                else reject(new Error('execCommand copy failed'));
            } catch (error) {
                reject(error);
            }
        });
    }

    function isValidImageSource(value) {
        return /^https?:\/\//i.test(value) || /^data:image\//i.test(value);
    }

    function firstNonEmpty(...values) {
        for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return '';
    }

    function decodeHtmlEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text || '';
        return textarea.value;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function escapeAttr(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
})();
