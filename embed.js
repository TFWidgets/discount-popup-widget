(function() {
    'use strict';

    // Базовые CSS стили с унифицированными CSS-переменными
    const inlineCSS = `
        .dpw-overlay {
            position: fixed;
            inset: 0;
            background: var(--dpw-overlay, rgba(15,23,42,0.6));
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(8px);
            font-family: var(--dpw-font, 'Inter', system-ui, sans-serif);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .dpw-overlay.show {
            opacity: 1;
        }
        
        .dpw-card {
            width: min(92vw, 480px);
            background: var(--dpw-bg, #ffffff);
            border-radius: var(--dpw-widget-radius, 18px);
            box-shadow: var(--dpw-shadow, 0 25px 70px rgba(0,0,0,0.35));
            position: relative;
            overflow: hidden;
            transform: scale(0.8) translateY(20px);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .dpw-overlay.show .dpw-card {
            transform: scale(1) translateY(0);
        }
        
        .dpw-ribbon {
            height: var(--dpw-ribbon-height, 100px);
            background: var(--dpw-header-bg, linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%));
            position: relative;
        }
        
        .dpw-ribbon::after {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--dpw-overlay-inner, 
                radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            );
        }
        
        .dpw-content {
            padding: var(--dpw-padding, 24px 28px 32px);
            text-align: center;
            position: relative;
            color: var(--dpw-text-color, #333333);
        }
        
        .dpw-close {
            position: absolute;
            top: 12px;
            right: 16px;
            background: rgba(0,0,0,0.1);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            color: var(--dpw-text-color, #333333);
            font-size: 18px;
            transition: all 0.2s ease;
        }
        
        .dpw-close:hover {
            background: rgba(0,0,0,0.15);
            transform: scale(1.1);
        }
        
        .dpw-icon {
            position: absolute;
            top: var(--dpw-icon-top, -36px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--dpw-icon-bg, #fff);
            width: var(--dpw-icon-size, 68px);
            height: var(--dpw-icon-size, 68px);
            border-radius: var(--dpw-block-radius, 18px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--dpw-icon-font-size, 32px);
            box-shadow: var(--dpw-icon-shadow, 0 12px 28px rgba(0,0,0,0.25));
            border: var(--dpw-block-border, 3px solid rgba(255,255,255,0.8));
            animation: dpw-bounce var(--dpw-bounce-duration, 2.5s) ease-in-out infinite;
        }
        
        .dpw-title {
            margin: var(--dpw-title-margin, 24px 0 8px 0);
            font-size: var(--dpw-title-size, 1.6em);
            font-weight: var(--dpw-title-weight, 800);
            letter-spacing: var(--dpw-title-spacing, -0.3px);
            color: var(--dpw-title-color, inherit);
            text-shadow: var(--dpw-text-shadow, none);
        }
        
        .dpw-message {
            margin: 0 0 20px 0;
            font-size: var(--dpw-subtitle-size, 1.05em);
            opacity: var(--dpw-subtitle-opacity, 0.85);
            line-height: 1.4;
            color: var(--dpw-subtitle-color, inherit);
            font-weight: var(--dpw-subtitle-weight, 400);
        }
        
        .dpw-coupon {
            background: var(--dpw-coupon-bg, #fff3cd);
            border: var(--dpw-coupon-border, 2px dashed #f59e0b);
            padding: var(--dpw-coupon-padding, 16px);
            margin: var(--dpw-coupon-margin, 20px 0 24px);
            border-radius: var(--dpw-coupon-radius, 12px);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }
        
        .dpw-coupon:hover {
            transform: translateY(-1px);
            box-shadow: var(--dpw-coupon-shadow-hover, 0 4px 12px rgba(0,0,0,0.1));
        }
        
        .dpw-coupon.copied {
            background: var(--dpw-coupon-copied-bg, #d1fae5);
            border-color: var(--dpw-coupon-copied-border, #10b981);
        }
        
        .dpw-coupon-label {
            display: block;
            font-size: var(--dpw-coupon-label-size, 0.85em);
            color: var(--dpw-coupon-text, #7c2d12);
            opacity: 0.8;
            margin-bottom: 4px;
        }
        
        .dpw-coupon-code {
            font-size: var(--dpw-coupon-code-size, 1.3em);
            font-weight: var(--dpw-coupon-code-weight, 800);
            color: var(--dpw-coupon-text, #7c2d12);
            font-family: var(--dpw-value-font, 'JetBrains Mono', 'SF Mono', monospace);
            letter-spacing: var(--dpw-coupon-code-spacing, 1px);
        }
        
        .dpw-copy-hint {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: var(--dpw-hint-size, 0.7em);
            opacity: 0.6;
            color: var(--dpw-coupon-text, #7c2d12);
        }
        
        .dpw-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--dpw-gap, 12px);
        }
        
        .dpw-btn-primary {
            background: var(--dpw-btn-primary-bg, linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%));
            color: var(--dpw-btn-primary-color, white);
            border: none;
            padding: var(--dpw-block-padding, 16px 32px);
            border-radius: var(--dpw-btn-radius, 12px);
            font-size: var(--dpw-btn-size, 1.1em);
            font-weight: var(--dpw-btn-weight, 700);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            font-family: var(--dpw-btn-font, inherit);
        }
        
        .dpw-btn-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%);
        }
        
        .dpw-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--dpw-btn-shadow-hover, 0 8px 24px rgba(139, 92, 246, 0.4));
        }
        
        .dpw-btn-secondary {
            background: var(--dpw-btn-secondary-bg, #f1f5f9);
            color: var(--dpw-btn-secondary-color, #333333);
            border: none;
            padding: var(--dpw-btn-secondary-padding, 12px 24px);
            border-radius: var(--dpw-btn-secondary-radius, 10px);
            font-size: var(--dpw-btn-secondary-size, 0.95em);
            font-weight: var(--dpw-btn-secondary-weight, 600);
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: var(--dpw-btn-secondary-opacity, 0.8);
        }
        
        .dpw-btn-secondary:hover {
            opacity: 1;
            background: var(--dpw-btn-secondary-bg-hover, #e2e8f0);
        }
        
        .dpw-logo {
            max-height: var(--dpw-logo-height, 32px);
            max-width: var(--dpw-logo-width, 140px);
            margin: 8px auto 0;
            display: block;
        }
        
        .dpw-loading {
            text-align: center;
            padding: var(--dpw-loading-padding, 40px);
            color: var(--dpw-loading-color, #666);
        }
        
        .dpw-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(139,92,246,0.2);
            border-top: 3px solid #8b5cf6;
            border-radius: 50%;
            animation: dpw-spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes dpw-bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-6px); }
        }
        
        @keyframes dpw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .dpw-content {
                padding: var(--dpw-padding-mobile, 20px 24px 28px);
            }
            .dpw-title {
                font-size: var(--dpw-title-size-mobile, 1.4em);
            }
            .dpw-message {
                font-size: var(--dpw-subtitle-size-mobile, 1em);
            }
        }
    `;

    window.DiscountPopups = window.DiscountPopups || {};

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[DiscountPopupWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        // Защита от повторного выполнения
        if (currentScript.dataset.dpwMounted === '1') return;
        currentScript.dataset.dpwMounted = '1';

        console.log(`[DiscountPopupWidget] 🚀 Инициализация виджета "${clientId}"`);

        if (!document.querySelector('#discount-popup-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'discount-popup-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `dpw-${clientId}-${Date.now()}`;
        
        console.log(`[DiscountPopupWidget] 📋 Загружаем конфиг для "${clientId}"`);

        // Загружаем конфигурацию
        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                console.log(`[DiscountPopupWidget] 📋 Финальный конфиг для "${clientId}":`, finalConfig);
                
                const widget = createDiscountPopupWidget(finalConfig, uniqueClass, clientId);
                window.DiscountPopups[clientId] = widget;
                setupTriggers(widget, finalConfig);
                console.log(`[DiscountPopupWidget] ✅ Виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[DiscountPopupWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                const widget = createDiscountPopupWidget(defaultConfig, uniqueClass, clientId);
                window.DiscountPopups[clientId] = widget;
                setupTriggers(widget, defaultConfig);
            });

    } catch (error) {
        console.error('[DiscountPopupWidget] 💥 Критическая ошибка:', error);
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
            icon: "",
            iconHtml: "&#127873;", // 🎁 как HTML entity
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

        // Сливаем объекты первого уровня
        for (const key of ['style']) {
            if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
                result[key] = { ...(base[key] || {}), ...(override[key] || {}) };
            }
        }

        // Сливаем объекты второго уровня в style 
        if (result.style) {
            for (const subKey of ['colors', 'borderRadius', 'sizes', 'shadow']) {
                if (base.style[subKey] && typeof base.style[subKey] === 'object' && !Array.isArray(base.style[subKey])) {
                    result.style[subKey] = { ...(base.style[subKey] || {}), ...(override.style?.[subKey] || {}) };
                }
            }
        }

        // Поддержка старого формата theme/colors для обратной совместимости
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
        // Локальный конфиг для разработки
        if (clientId === 'local') {
            const localScript = document.querySelector('#dpw-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#dpw-local-config)');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[DiscountPopupWidget] 📄 Локальный конфиг загружен:`, config);
                return config;
            } catch (err) {
                throw new Error('Ошибка парсинга локального JSON: ' + err.message);
            }
        }

        // Загрузка с сервера
        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        console.log(`[DiscountPopupWidget] 🌐 Загружаем конфиг: ${configUrl}`);
        
        const response = await fetch(configUrl, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log(`[DiscountPopupWidget] ✅ Серверный конфиг загружен:`, config);
        return config;
    }

    function createDiscountPopupWidget(config, uniqueClass, id) {
        
        const overlay = document.createElement('div');
        overlay.className = `dpw-overlay ${uniqueClass}`;
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);

        // Применяем кастомные стили
        applyCustomStyles(uniqueClass, config.style);

        // Безопасное отображение иконки
        const iconHtml = renderIcon(config);

        // HTML структура
        overlay.innerHTML = `
            <div class="dpw-card" role="dialog" aria-modal="true">
                <div class="dpw-ribbon"></div>
                <div class="dpw-content">
                    <button class="dpw-close" aria-label="Close">×</button>
                    ${config.logo ? `<img class="dpw-logo" src="${escapeAttr(config.logo)}" alt="Logo">` : ''}
                    <div class="dpw-icon">${iconHtml}</div>
                    <h2 class="dpw-title">${escapeHtml(config.title)}</h2>
                    <p class="dpw-message">${escapeHtml(config.message)}</p>
                    
                    <div class="dpw-coupon" tabindex="0" role="button" aria-label="Copy coupon code">
                        <span class="dpw-coupon-label">Promo Code:</span>
                        <strong class="dpw-coupon-code">${escapeHtml(config.couponCode)}</strong>
                        <span class="dpw-copy-hint">Click to copy</span>
                    </div>
                    
                    <div class="dpw-buttons">
                        <button class="dpw-btn-primary" type="button">
                            ${escapeHtml(config.buttonText)}
                        </button>
                        <button class="dpw-btn-secondary" type="button">
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
            isShown: false,
            
            show() {
                if (this.isShown || !shouldShowByFrequency(this.config.frequency, this.id)) return;
                
                this.overlay.style.display = 'flex';
                setTimeout(() => this.overlay.classList.add('show'), 10);
                this.overlay.setAttribute('aria-hidden', 'false');
                
                this.isShown = true;
                markAsShown(this.config.frequency, this.id);
            },
            
            hide() {
                if (!this.isShown) return;
                
                this.overlay.classList.remove('show');
                setTimeout(() => this.overlay.style.display = 'none', 300);
                this.overlay.setAttribute('aria-hidden', 'true');
                
                this.isShown = false;
            },
            
            copyCoupon() {
                const code = this.config.couponCode || '';
                const btn = this.overlay.querySelector('.dpw-btn-primary');
                const coupon = this.overlay.querySelector('.dpw-coupon');
                
                navigator.clipboard.writeText(code).then(() => {
                    btn.textContent = 'Copied!';
                    coupon.classList.add('copied');
                    
                    setTimeout(() => {
                        btn.textContent = this.config.buttonText;
                        coupon.classList.remove('copied');
                    }, 1500);
                }).catch(() => {
                    // Fallback для старых браузеров
                    const textArea = document.createElement('textarea');
                    textArea.value = code;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                });
            }
        };

        // Обработчики событий
        setupEventHandlers(widget);
        
        return widget;
    }

    function applyCustomStyles(uniqueClass, style) {
        const styleId = `dpw-style-${uniqueClass}`;
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = generateUniqueStyles(uniqueClass, style);
    }


    function generateUniqueStyles(uniqueClass, style) {
        const s = style;
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};
        const fs = sizes.fontSize || 1;

        return `
            .${uniqueClass} {
                --dpw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --dpw-value-font: ${s.valueFontFamily || "'JetBrains Mono', 'SF Mono', monospace"};
                --dpw-bg: ${colors.background || "#ffffff"};
                --dpw-widget-radius: ${borderRadius.widget || 18}px;
                --dpw-padding: ${sizes.padding || 24}px 28px 32px;
                --dpw-padding-mobile: ${Math.round((sizes.padding || 24) * 0.8)}px 24px 28px;
                --dpw-text-color: ${colors.text || "#333333"};
                --dpw-overlay: ${colors.overlay || "rgba(15,23,42,0.6)"};
                --dpw-header-bg: ${colors.headerBackground || "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"};
                --dpw-shadow: ${shadow.widget || "0 25px 70px rgba(0,0,0,0.35)"};
                --dpw-shadow-hover: ${shadow.widgetHover || "0 35px 90px rgba(0,0,0,0.45)"};
                --dpw-text-shadow: ${shadow.text || "none"};
                --dpw-ribbon-height: ${sizes.ribbonHeight || 100}px;
                --dpw-icon-size: ${sizes.iconSize || 68}px;
                --dpw-icon-font-size: ${Math.round((sizes.iconSize || 68) * 0.47)}px;
                --dpw-icon-top: ${Math.round((sizes.iconSize || 68) * -0.53)}px;
                --dpw-icon-bg: ${colors.blockBackground || "rgba(255,255,255,0.8)"};
                --dpw-block-border: ${sizes.iconSize >= 60 ? 3 : 2}px solid ${colors.blockBorder || "rgba(255,255,255,0.8)"};
                --dpw-block-radius: ${borderRadius.blocks || 12}px;
                --dpw-icon-shadow: ${shadow.iconShadow || "0 12px 28px rgba(0,0,0,0.25)"};
                --dpw-bounce-duration: 2.5s;
                --dpw-title-size: ${1.6 * fs}em;
                --dpw-title-size-mobile: ${1.4 * fs}em;
                --dpw-title-weight: 800;
                --dpw-title-spacing: -0.3px;
                --dpw-title-margin: ${Math.round(24 * fs)}px 0 8px 0;
                --dpw-subtitle-size: ${1.05 * fs}em;
                --dpw-subtitle-size-mobile: ${1.0 * fs}em;
                --dpw-subtitle-opacity: 0.85;
                --dpw-subtitle-weight: 400;
                --dpw-gap: ${sizes.gap || 12}px;
                --dpw-block-padding: ${sizes.blockPadding || 16}px 32px;
                --dpw-btn-radius: ${borderRadius.blocks || 12}px;
                --dpw-btn-size: ${1.1 * fs}em;
                --dpw-btn-weight: 700;
                --dpw-btn-font: inherit;
                --dpw-btn-primary-bg: ${colors.btnPrimary || "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"};
                --dpw-btn-primary-color: ${colors.btnPrimaryText || "white"};
                --dpw-btn-shadow-hover: ${shadow.btnHover || "0 8px 24px rgba(139, 92, 246, 0.4)"};
                --dpw-btn-secondary-bg: ${colors.btnSecondary || "#f1f5f9"};
                --dpw-btn-secondary-color: ${colors.btnSecondaryText || "#333333"};
                --dpw-btn-secondary-bg-hover: ${colors.btnSecondaryHover || "#e2e8f0"};
                --dpw-btn-secondary-padding: 12px 24px;
                --dpw-btn-secondary-radius: 10px;
                --dpw-btn-secondary-size: ${0.95 * fs}em;
                --dpw-btn-secondary-weight: 600;
                --dpw-btn-secondary-opacity: 0.8;
                --dpw-coupon-bg: ${colors.couponBg || "#fff3cd"};
                --dpw-coupon-border: 2px dashed ${colors.couponBorder || "#f59e0b"};
                --dpw-coupon-padding: ${sizes.blockPadding || 16}px;
                --dpw-coupon-margin: 20px 0 24px;
                --dpw-coupon-radius: ${borderRadius.blocks || 12}px;
                --dpw-coupon-shadow-hover: ${shadow.couponHover || "0 4px 12px rgba(0,0,0,0.1)"};
                --dpw-coupon-copied-bg: ${colors.couponCopiedBg || "#d1fae5"};
                --dpw-coupon-copied-border: ${colors.couponCopiedBorder || "#10b981"};
                --dpw-coupon-text: ${colors.couponText || "#7c2d12"};
                --dpw-coupon-label-size: ${0.85 * fs}em;
                --dpw-coupon-code-size: ${1.3 * fs}em;
                --dpw-coupon-code-weight: 800;
                --dpw-coupon-code-spacing: 1px;
                --dpw-hint-size: ${0.7 * fs}em;
                --dpw-logo-height: 32px;
                --dpw-logo-width: 140px;
            }
        `;
    }

    function renderIcon(config) {
        // Приоритет: iconHtml > icon > дефолт
        if (config.iconHtml && config.iconHtml.trim()) {
            // Если это HTML entity или простой HTML - вставляем как есть
            if (config.iconHtml.includes('&') || config.iconHtml.includes('<')) {
                return config.iconHtml;
            }
            // Если это эмодзи - экранируем
            return escapeHtml(config.iconHtml);
        }
        
        if (config.icon && config.icon.trim()) {
            return escapeHtml(config.icon);
        }
        
        // Дефолтная иконка
        return '&#127873;'; // 🎁
    }

    function setupEventHandlers(widget) {
        const { overlay } = widget;
        
        // Закрытие по клику на оверлей
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) widget.hide();
        });
        
        // Кнопка закрытия
        overlay.querySelector('.dpw-close').addEventListener('click', () => widget.hide());
        
        // Кнопка отказа
        overlay.querySelector('.dpw-btn-secondary').addEventListener('click', () => widget.hide());
        
        // Копирование купона
        overlay.querySelector('.dpw-coupon').addEventListener('click', () => widget.copyCoupon());
        
        // Основная кнопка (копирует купон и закрывает)
        overlay.querySelector('.dpw-btn-primary').addEventListener('click', () => {
            widget.copyCoupon();
            setTimeout(() => widget.hide(), 1000);
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && widget.isShown) {
                widget.hide();
            }
        });
    }

    function setupTriggers(widget, config) {
        if (config.triggerDelay > 0) {
            setTimeout(() => widget.show(), config.triggerDelay);
        }

        if (config.showOnExit) {
            let hasTriggered = false;
            document.addEventListener('mouseleave', (e) => {
                if (e.clientY <= 0 && !hasTriggered && !widget.isShown) {
                    widget.show();
                    hasTriggered = true;
                }
            });
        }

        if (config.showOnScroll > 0) {
            let hasTriggered = false;
            window.addEventListener('scroll', () => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercent >= config.showOnScroll && !hasTriggered && !widget.isShown) {
                    widget.show();
                    hasTriggered = true;
                }
            });
        }
    }

    function shouldShowByFrequency(frequency, id) {
        if (frequency === 'always') return true;
        
        if (frequency === 'session') {
            return !sessionStorage.getItem(`dpw-shown-${id}`);
        }
        
        const lastShown = parseInt(localStorage.getItem(`dpw-lastShown-${id}`)) || 0;
        const now = Date.now();
        const intervals = { 
            '24h': 24 * 60 * 60 * 1000, 
            '3d': 3 * 24 * 60 * 60 * 1000 
        };
        
        return (now - lastShown) > (intervals[frequency] || 0);
    }

    function markAsShown(frequency, id) {
        if (frequency === 'session') {
            sessionStorage.setItem(`dpw-shown-${id}`, '1');
        } else if (frequency !== 'always') {
            localStorage.setItem(`dpw-lastShown-${id}`, Date.now().toString());
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function escapeAttr(text) {
        return String(text || '').replace(/"/g, '&quot;');
    }
})();
