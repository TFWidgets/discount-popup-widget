/*!
 * TF Widgets — Discount Popup v2
 * Встраивание: <script src=".../embed.js" data-id="CLIENT_ID"></script>
 * Конфиг клиента: configs/CLIENT_ID.json (формат v1 поддерживается, все новые поля необязательные)
 * Классы и CSS-переменные: префикс bhw- (общий для всех виджетов TF Widgets)
 */
(function () {
    'use strict';
    var VERSION = '2.0.0';
    var LOG = '[TFW Discount]';
    // Где работает живое превью BHWDiscountPopup.render() (конфигуратор на сайте)
    var PREVIEW_DOMAINS = ['tf-widgets.com', '*.tf-widgets.com', '9ac5za-h1.myshopify.com'];

    var PRESET_ICONS = Object.freeze({
        gift: '🎁', fire: '🔥', star: '⭐', heart: '❤️', cart: '🛒', bell: '🔔',
        percent: '💸', tag: '🏷️', lightning: '⚡', sparkles: '✨'
    });

    /* =========================================================
       БАЗОВЫЕ СТИЛИ (один раз на страницу). Все значения — из CSS-переменных --bhw-*
       ========================================================= */
    var inlineCSS = `
        .bhw-overlay {
            position: fixed; inset: 0; z-index: 2147483000;
            display: none; align-items: center; justify-content: center;
            padding: 20px; overflow-y: auto; box-sizing: border-box;
            background: var(--bhw-overlay, rgba(10,10,12,0.55));
            -webkit-backdrop-filter: blur(var(--bhw-overlay-blur, 6px)); backdrop-filter: blur(var(--bhw-overlay-blur, 6px));
            font-family: var(--bhw-font, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif);
            -webkit-font-smoothing: antialiased;
            opacity: 0; transition: opacity .35s ease;
        }
        .bhw-overlay *, .bhw-overlay *::before, .bhw-overlay *::after { box-sizing: border-box; }
        .bhw-overlay.show { opacity: 1; }
        .bhw-overlay.bhw-inline { position: absolute; z-index: 1; }

        /* угловой вариант: без затемнения, карточка в углу */
        .bhw-overlay.bhw-layout-corner {
            background: none; -webkit-backdrop-filter: none; backdrop-filter: none;
            pointer-events: none; padding: 20px;
            align-items: flex-end; justify-content: var(--bhw-corner-justify, flex-end);
        }
        .bhw-layout-corner .bhw-card { pointer-events: auto; max-width: 360px; }

        .bhw-card {
            position: relative; overflow: hidden; margin: auto;
            width: 100%; max-width: var(--bhw-card-width, 440px);
            background: var(--bhw-bg, #ffffff); color: var(--bhw-text-color, #111111);
            border: 1px solid var(--bhw-card-border, rgba(0,0,0,.06));
            border-radius: var(--bhw-widget-radius, 22px);
            box-shadow: var(--bhw-shadow, 0 30px 80px -20px rgba(0,0,0,.45));
            transform: translateY(22px) scale(.96);
            transition: transform .5s cubic-bezier(.2,.8,.2,1);
            text-align: center;
        }
        .bhw-overlay.show .bhw-card { transform: none; }
        .bhw-card:focus { outline: none; }
        .bhw-overlay .bhw-ribbon, .bhw-overlay .bhw-main { display: block; }
        .bhw-layout-corner .bhw-card { margin: 0; }

        /* сплит: картинка слева */
        .bhw-layout-split .bhw-card { max-width: var(--bhw-split-width, 720px); display: grid; grid-template-columns: 42% 1fr; text-align: left; }
        .bhw-media { display: none; position: relative; min-height: 100%; background: var(--bhw-header-bg, #eee) center / cover no-repeat; }
        .bhw-layout-split .bhw-media { display: block; }
        .bhw-layout-split .bhw-ribbon { display: none; }

        .bhw-ribbon { height: var(--bhw-ribbon-height, 0px); background: var(--bhw-header-bg, transparent); position: relative; }
        .bhw-ribbon::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 25% 25%, rgba(255,255,255,.18) 0%, transparent 55%); }

        .bhw-content { position: relative; padding: var(--bhw-padding, 34px 30px 28px); }
        .bhw-close {
            position: absolute; top: 12px; right: 12px; z-index: 3;
            width: 36px; height: 36px; margin: 0; padding: 0; border: 0; border-radius: 50%;
            display: grid; place-items: center; cursor: pointer;
            background: color-mix(in srgb, var(--bhw-text-color, #111) 7%, transparent);
            color: var(--bhw-text-color, #111); font: 400 20px/1 system-ui, sans-serif;
            transition: background .2s, transform .2s;
        }
        .bhw-close:hover { background: color-mix(in srgb, var(--bhw-text-color, #111) 14%, transparent); transform: rotate(90deg); }
        .bhw-close:focus-visible, .bhw-btn-primary:focus-visible, .bhw-btn-secondary:focus-visible, .bhw-coupon:focus-visible { outline: 2px solid var(--bhw-accent, #ff5a36); outline-offset: 3px; }
        .bhw-ribbon ~ .bhw-content .bhw-close { top: calc(12px - var(--bhw-ribbon-height, 0px)); background: rgba(255,255,255,.22); color: #fff; }

        .bhw-logo { display: block; max-height: 30px; max-width: 130px; margin: 0 auto 14px; object-fit: contain; }
        .bhw-layout-split .bhw-logo { margin-left: 0; }

        .bhw-icon {
            position: absolute; top: var(--bhw-icon-top, -36px); left: 50%;
            width: var(--bhw-icon-size, 68px); height: var(--bhw-icon-size, 68px);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
            font-size: var(--bhw-icon-font-size, 32px); line-height: 1;
            background: var(--bhw-icon-bg, #fff); border: var(--bhw-block-border, 3px solid rgba(255,255,255,.8));
            border-radius: var(--bhw-block-radius, 18px); box-shadow: var(--bhw-icon-shadow, 0 12px 28px rgba(0,0,0,.25));
            transform: translateX(-50%); animation: bhw-bounce 2.6s ease-in-out infinite;
        }
        .bhw-no-ribbon .bhw-icon { position: relative; top: 0; left: auto; margin: 0 auto 14px; transform: none; animation: none; }
        .bhw-layout-split .bhw-icon { margin-left: 0; }
        .bhw-icon-emoji { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
        .bhw-icon-image { display: block; width: 70%; height: 70%; object-fit: contain; }

        .bhw-eyebrow {
            display: inline-block; margin: 0 0 10px; padding: 5px 11px; border-radius: 999px;
            font-size: .72em; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
            color: var(--bhw-accent, #ff5a36); background: color-mix(in srgb, var(--bhw-accent, #ff5a36) 12%, transparent);
        }
        .bhw-offer {
            margin: 0 0 6px; font-family: var(--bhw-offer-font, inherit);
            font-size: var(--bhw-offer-size, 3.4em); font-weight: 900; line-height: .95; letter-spacing: -.045em;
            color: var(--bhw-accent, #ff5a36);
        }
        .bhw-title {
            margin: var(--bhw-title-margin, 0 0 8px); padding: 0;
            font-family: inherit; font-size: var(--bhw-title-size, 1.45em); font-weight: 800; line-height: 1.15; letter-spacing: -.02em;
            color: var(--bhw-title-color, inherit); text-shadow: var(--bhw-text-shadow, none);
        }
        .bhw-message { margin: 0 auto 20px; max-width: 34ch; font-size: var(--bhw-subtitle-size, .98em); line-height: 1.5; opacity: .72; }
        .bhw-layout-split .bhw-message { margin-left: 0; }

        /* купон-билет с вырезами по бокам */
        .bhw-coupon {
            position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px;
            margin: 0 0 16px; padding: 14px 16px 14px 20px; cursor: pointer; text-align: left;
            background: var(--bhw-coupon-bg, #fff4ef); color: var(--bhw-coupon-text, #7a2513);
            border: var(--bhw-coupon-border, 2px dashed #ff5a36); border-radius: var(--bhw-coupon-radius, 14px);
            -webkit-mask: radial-gradient(circle 9px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 9px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat;
                    mask: radial-gradient(circle 9px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 9px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat;
            transition: transform .2s, background .2s, border-color .2s;
        }
        .bhw-coupon:hover { transform: translateY(-1px); }
        .bhw-coupon-label { display: block; font-size: .7em; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .7; margin: 0 0 2px; }
        .bhw-coupon-code { display: block; font-family: var(--bhw-value-font, ui-monospace, 'SF Mono', Menlo, monospace); font-size: var(--bhw-coupon-code-size, 1.35em); font-weight: 800; letter-spacing: .06em; word-break: break-all; }
        .bhw-copy-hint {
            flex: none; padding: 7px 12px; border-radius: 999px; font-size: .75em; font-weight: 700;
            background: var(--bhw-coupon-text, #7a2513); color: var(--bhw-coupon-bg, #fff4ef);
        }
        .bhw-coupon.copied { background: var(--bhw-coupon-copied-bg, #e8f8ef); border-color: var(--bhw-coupon-copied-border, #16a34a); }
        .bhw-coupon.copied .bhw-copy-hint { background: var(--bhw-coupon-copied-border, #16a34a); color: #fff; }

        .bhw-buttons { display: flex; flex-direction: column; gap: var(--bhw-gap, 6px); }
        .bhw-btn-primary, .bhw-btn-secondary {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; margin: 0; min-height: 48px; border: 0; cursor: pointer; text-decoration: none;
            font-family: inherit; line-height: 1.2; -webkit-tap-highlight-color: transparent;
        }
        .bhw-btn-primary {
            position: relative; overflow: hidden;
            padding: 14px 22px; border-radius: var(--bhw-btn-radius, 14px);
            background: var(--bhw-btn-primary-bg, #ff5a36); color: var(--bhw-btn-primary-color, #fff);
            font-size: var(--bhw-btn-size, 1em); font-weight: 700;
            transition: transform .2s, box-shadow .2s, filter .2s;
        }
        .bhw-btn-primary:hover { transform: translateY(-1px); box-shadow: var(--bhw-btn-shadow-hover, 0 10px 26px -8px rgba(255,90,54,.6)); filter: brightness(1.04); }
        .bhw-btn-secondary {
            padding: 10px 16px; border-radius: 10px; background: var(--bhw-btn-secondary-bg, transparent);
            color: var(--bhw-btn-secondary-color, inherit); font-size: .88em; font-weight: 600; opacity: .6; transition: opacity .2s, background .2s;
        }
        .bhw-btn-secondary:hover { opacity: 1; background: var(--bhw-btn-secondary-bg-hover, rgba(0,0,0,.04)); }
        .bhw-fine { margin: 10px 0 0; font-size: .74em; line-height: 1.45; opacity: .5; }
        .bhw-fine:empty { display: none; }

        /* ярлычок после закрытия: можно открыть снова */
        .bhw-teaser {
            position: fixed; bottom: 20px; z-index: 2147482999; display: none; align-items: center; gap: 8px;
            padding: 11px 16px 11px 14px; border: 0; border-radius: 999px; cursor: pointer;
            background: var(--bhw-btn-primary-bg, #ff5a36); color: var(--bhw-btn-primary-color, #fff);
            font: 700 14px var(--bhw-font, 'Inter', system-ui, sans-serif); line-height: 1;
            box-shadow: 0 14px 32px -10px rgba(0,0,0,.45); transform: translateY(20px); opacity: 0;
            transition: transform .4s cubic-bezier(.2,.8,.2,1), opacity .3s;
        }
        .bhw-teaser.show { transform: none; opacity: 1; }
        .bhw-teaser.bhw-inline { position: absolute; }
        .bhw-teaser-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: bhw-pulse 1.6s ease-in-out infinite; }

        @keyframes bhw-bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }
        @keyframes bhw-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

        @media (max-width: 560px) {
            .bhw-overlay { padding: 12px; }
            .bhw-overlay:not(.bhw-layout-corner) { align-items: flex-end; }
            .bhw-layout-split .bhw-card { grid-template-columns: 1fr; text-align: center; }
            .bhw-layout-split .bhw-media { min-height: 140px; }
            .bhw-layout-split .bhw-message, .bhw-layout-split .bhw-logo, .bhw-layout-split .bhw-icon { margin-left: auto; }
            .bhw-content { padding: var(--bhw-padding-mobile, 28px 22px 22px); }
            .bhw-title { font-size: var(--bhw-title-size-mobile, 1.3em); }
            .bhw-offer { font-size: calc(var(--bhw-offer-size, 3.4em) * .85); }
            .bhw-layout-corner .bhw-card { max-width: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            .bhw-overlay, .bhw-card, .bhw-teaser { transition: none !important; }
            .bhw-icon, .bhw-teaser-dot { animation: none !important; }
        }

        /* защита от тем сайта, которые красят весь текст через color: ... !important */
        .bhw-overlay .bhw-card { color: var(--bhw-text-color, #111) !important; }
        .bhw-overlay .bhw-card :where(*) { color: inherit !important; }
        .bhw-overlay .bhw-card .bhw-ribbon ~ .bhw-content .bhw-close { color: #fff !important; }
        .bhw-overlay .bhw-card .bhw-offer, .bhw-overlay .bhw-card .bhw-eyebrow { color: var(--bhw-accent, #ff5a36) !important; }
        .bhw-overlay .bhw-card .bhw-coupon { color: var(--bhw-coupon-text, #7a2513) !important; }
        .bhw-overlay .bhw-card .bhw-copy-hint { color: var(--bhw-coupon-bg, #fff4ef) !important; }
        .bhw-overlay .bhw-card .bhw-coupon.copied .bhw-copy-hint { color: #fff !important; }
        .bhw-overlay .bhw-card .bhw-btn-primary, .bhw-overlay .bhw-card .bhw-btn-primary * { color: var(--bhw-btn-primary-color, #fff) !important; }
        .bhw-overlay .bhw-card .bhw-btn-secondary { color: var(--bhw-btn-secondary-color, inherit) !important; }
        .bhw-teaser, .bhw-teaser * { color: var(--bhw-btn-primary-color, #fff) !important; }
    `;

    /* =========================================================
       ПУБЛИЧНЫЕ API
       ========================================================= */
    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    var BHW = window.BusinessHoursWidgets;
    BHW.discountPopups = BHW.discountPopups || {};
    BHW.discountPopupPresets = PRESET_ICONS;
    // v1-совместимость
    BHW.createOrUpdateDiscountPopup = function (clientId, newConfig, options) {
        options = options || {};
        var id = normalizeId(clientId || 'demo');
        if (BHW.discountPopups[id] && BHW.discountPopups[id].destroy) BHW.discountPopups[id].destroy();
        injectBaseStyles();
        var widget = createWidget(normalizeConfig(newConfig || {}), 'bhw-discount-' + id.replace(/[^a-z0-9_-]/gi, '') + '-' + Date.now(), id, {});
        BHW.discountPopups[id] = widget;
        setupTriggers(widget, widget.config);
        if (options.showImmediately) widget.show(true);
        return widget;
    };
    BHW.reloadDiscountPopup = BHW.createOrUpdateDiscountPopup;
    BHW.getDiscountPopupConfigTemplate = function () { return JSON.parse(JSON.stringify(getDefaultConfig())); };

    // Живое превью для конфигуратора: BHWDiscountPopup.render(container, config) -> { update, setState, destroy }
    var api = window.BHWDiscountPopup = window.BHWDiscountPopup || {};
    api.version = VERSION;
    api.defaults = getDefaultConfig;
    api.checkAccess = bhwCheckAccess;
    api.render = function (container, config) {
        var noop = { destroy: function () {}, update: function () {}, setState: function () {} };
        if (!bhwCheckAccess({ domains: PREVIEW_DOMAINS }).ok) { console.warn(LOG, 'preview is only available on tf-widgets.com'); return noop; }
        injectBaseStyles();
        if (container._bhwDiscDestroy) container._bhwDiscDestroy();
        var cls = container.__bhwDiscClass || (container.__bhwDiscClass = 'bhw-discount-preview-' + Math.random().toString(36).slice(2, 8));
        var widget = null, st = 'popup';
        function build(cfg, instant) {
            if (widget) widget.destroy();
            widget = createWidget(normalizeConfig(cfg || {}), cls, 'preview', { inline: container, instant: instant });
            widget.setState(st);
        }
        build(config, false);
        var ctrl = {
            update: function (cfg) { build(cfg, true); },
            setState: function (s) { st = s; if (widget) widget.setState(s); },
            destroy: function () { if (widget) widget.destroy(); widget = null; container._bhwDiscDestroy = null; }
        };
        container._bhwDiscDestroy = ctrl.destroy;
        return ctrl;
    };

    /* =========================================================
       АВТОЗАПУСК ПО <script data-id="...">
       ========================================================= */
    try {
        var currentScript = document.currentScript || (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
        if (currentScript && currentScript.dataset && currentScript.dataset.id && currentScript.dataset.bhwMounted !== '1') {
            currentScript.dataset.bhwMounted = '1';
            var debug = currentScript.dataset.debug === '1';
            var clientId = normalizeId(currentScript.dataset.id);
            var baseUrl = getBasePath(currentScript.src);
            loadConfig(clientId, baseUrl)
                .then(function (fetched) {
                    var access = bhwCheckAccess(fetched);
                    if (!access.ok) {
                        console.warn(LOG, 'widget "' + clientId + '" is not active on ' + (location.hostname || 'this page') + ': ' + access.reason);
                        return;
                    }
                    if (debug) console.log(LOG, 'config "' + clientId + '":', fetched);
                    var mount = function () { BHW.createOrUpdateDiscountPopup(clientId, fetched); };
                    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
                })
                .catch(function (error) {
                    // Нет конфига = нет виджета
                    console.warn(LOG, 'config "' + clientId + '" not loaded:', error.message);
                });
        }
    } catch (error) {
        console.error(LOG, 'critical error:', error);
    }

    /* =========================================================
       ФУНКЦИИ
       ========================================================= */
    function injectBaseStyles() {
        if (!document.getElementById('business-hours-discount-popup-widget-styles')) {
            var style = document.createElement('style');
            style.id = 'business-hours-discount-popup-widget-styles';
            style.textContent = inlineCSS;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    /* ---------------------------------------------------------
       ДОСТУП (общий блок для всех виджетов TF Widgets — копировать без изменений)
       В конфиге клиента:
         "active": true,                       // false = виджет выключен (например, подписка отменена)
         "domains": ["client.com", "client-shop.myshopify.com", "*.client.com"]
       "client.com" разрешает client.com и www.client.com,
       "*.client.com" — любые поддомены (shop.client.com и т.д.).
       Без списка domains виджет не запускается.
       На localhost и при открытии файла с компьютера работает всегда (для тестов).
       --------------------------------------------------------- */
    function bhwCheckAccess(config) {
        config = config || {};
        if (config.active === false) return { ok: false, reason: 'widget is switched off ("active": false)' };
        var host = String(location.hostname || '').toLowerCase().replace(/^www\./, '');
        if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return { ok: true };
        var list = config.domains;
        if (typeof list === 'string') list = list.split(/[\s,]+/);
        if (!Array.isArray(list) || !list.length) return { ok: false, reason: 'no "domains" in config' };
        for (var i = 0; i < list.length; i++) {
            var d = String(list[i] || '').trim().toLowerCase()
                .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^www\./, '');
            if (!d) continue;
            if (d.indexOf('*.') === 0) {
                var base = d.slice(2);
                if (host === base || host.slice(-(base.length + 1)) === '.' + base) return { ok: true };
            } else if (host === d) {
                return { ok: true };
            }
        }
        return { ok: false, reason: 'domain is not in "domains"' };
    }

    function normalizeId(id) { return String(id || 'demo').replace(/\.(json|js)$/i, ''); }
    function getBasePath(src) {
        if (!src) return './';
        try { var url = new URL(src, location.href); return url.origin + url.pathname.replace(/\/[^\/]*$/, '/'); }
        catch (error) { return './'; }
    }

    function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            var el = document.querySelector('#bhw-discount-local-config, #dpw-local-config');
            if (!el) return Promise.reject(new Error('#bhw-discount-local-config not found'));
            try { return Promise.resolve(JSON.parse(el.textContent)); } catch (e) { return Promise.reject(e); }
        }
        var url = baseUrl + 'configs/' + encodeURIComponent(clientId) + '.json?v=' + Date.now();
        return fetch(url, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }

    function getDefaultConfig() {
        return {
            // "modal" — по центру; "split" — с картинкой слева (imageUrl); "corner" — карточка в углу без затемнения
            layout: 'modal',
            cornerPosition: 'right',         // для corner: right | left
            imageUrl: '',
            eyebrow: 'Welcome offer',
            offer: '20% OFF',                // крупная надпись со скидкой (можно пусто)
            title: 'Your first order',
            message: 'Use this code at checkout. It works on everything in the store.',
            couponCode: 'SAVE20',
            couponLabel: 'Your code',
            copyText: 'Copy',
            copiedText: 'Copied',
            buttonText: 'Copy code & shop',
            buttonUrl: '',                   // если задан — после копирования кода переход по ссылке
            dismissText: 'No, thanks',
            finePrint: '',
            icon: { type: 'none', value: '' },
            logo: '',
            teaser: { enabled: true, text: 'Get 20% off', position: 'left' },
            // триггеры (формат v1)
            triggerDelay: 5000,              // мс; 0 = не показывать по времени
            showOnExit: true,                // при попытке уйти (ПК)
            showOnScroll: 0,                 // % прокрутки
            mobileExitFallback: true,        // на телефоне вместо ухода — после 50% прокрутки
            frequency: 'session',            // session | 24h | 3d | 7d | always
            style: {
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                valueFontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                overlayBlur: 6,
                colors: {
                    background: '#ffffff',
                    text: '#111111',
                    accent: '#ff5a36',
                    headerBackground: 'linear-gradient(135deg, #ff7a45 0%, #ff3d2e 100%)',
                    overlay: 'rgba(10, 10, 12, 0.55)',
                    border: 'rgba(0, 0, 0, 0.06)',
                    btnPrimary: '#ff5a36',
                    btnPrimaryText: '#ffffff',
                    btnSecondary: 'transparent',
                    btnSecondaryText: '#111111',
                    btnSecondaryHover: 'rgba(0, 0, 0, 0.04)',
                    couponBg: '#fff4ef',
                    couponBorder: '#ff5a36',
                    couponText: '#7a2513',
                    couponCopiedBg: '#e8f8ef',
                    couponCopiedBorder: '#16a34a',
                    blockBackground: '#ffffff',
                    blockBorder: 'rgba(255, 255, 255, 0.9)'
                },
                borderRadius: { widget: 22, blocks: 14 },
                sizes: { fontSize: 1, width: 440, padding: 34, gap: 6, iconSize: 64, ribbonHeight: 0 },
                shadow: {
                    widget: '0 30px 80px -20px rgba(0, 0, 0, 0.45)',
                    btnHover: '0 10px 26px -8px rgba(255, 90, 54, 0.6)',
                    iconShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
                    text: 'none'
                }
            }
        };
    }

    /* v1-конфиг (фиолетовая шапка с подарком) выглядит как задумано: лента + иконка, без крупной скидки */
    function normalizeConfig(raw) {
        raw = raw || {};
        var legacy = !raw.layout;
        var base = getDefaultConfig();
        if (legacy) {
            base.eyebrow = ''; base.offer = ''; base.couponLabel = 'Promo code';
            base.buttonText = 'Get discount';
            base.icon = { type: 'preset', value: 'gift' };
            base.teaser.enabled = false;
            base.triggerDelay = 0; base.showOnExit = false; base.mobileExitFallback = false;
            base.style.sizes.ribbonHeight = 100;
            base.style.colors.headerBackground = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
            base.style.colors.btnPrimary = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
            base.style.colors.accent = '#7c3aed';
        }
        var cfg = mergeDeep(base, raw);
        // v1: тема {primary, secondary, ...}
        if (raw.theme && typeof raw.theme === 'object') {
            var t = raw.theme, g = 'linear-gradient(135deg, ' + (t.primary || '#8b5cf6') + ' 0%, ' + (t.secondary || '#6d28d9') + ' 100%)';
            cfg.style.colors.headerBackground = g; cfg.style.colors.btnPrimary = g;
            ['background', 'text', 'overlay', 'couponBg', 'couponBorder', 'couponText'].forEach(function (k) { if (t[k]) cfg.style.colors[k] = t[k]; });
            if (t.borderRadius) cfg.style.borderRadius.widget = t.borderRadius;
        }
        var rc = (raw.style && raw.style.colors) || {};
        if (!rc.accent && rc.btnPrimary) { var m = String(rc.btnPrimary).match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)/i); if (m) cfg.style.colors.accent = m[0]; }
        // v1: iconHtml / icon строкой
        if (typeof raw.icon === 'string' || (raw.iconHtml && !isObj(raw.icon))) cfg.icon = legacyIcon(raw.iconHtml || raw.icon);
        return cfg;
    }

    function legacyIcon(v) {
        var s = String(v || '').trim();
        if (!s) return { type: 'preset', value: 'gift' };
        if (/^https:\/\//i.test(s)) return { type: 'image', value: s };
        if (PRESET_ICONS[s]) return { type: 'preset', value: s };
        var t = document.createElement('textarea'); t.innerHTML = s;
        return { type: 'emoji', value: t.value };
    }

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function mergeDeep(base, over) {
        var out = {};
        Object.keys(base || {}).forEach(function (k) { out[k] = isObj(base[k]) ? mergeDeep(base[k], {}) : base[k]; });
        Object.keys(over || {}).forEach(function (k) {
            var v = over[k];
            if (isObj(v) && isObj(out[k])) out[k] = mergeDeep(out[k], v);
            else if (v !== undefined) out[k] = v;
        });
        return out;
    }

    function cssValue(v, fallback) { if (v === undefined || v === null || v === '') return fallback; return String(v).replace(/[;{}<>]/g, ''); }
    function num(v, fallback) { var n = Number(v); return isFinite(n) && v !== '' && v !== null ? n : fallback; }
    function safeUrl(url) {
        var u = String(url || '').trim();
        if (!u) return '';
        if (/^https?:/i.test(u) || /^\/(?!\/)/.test(u)) return u;
        if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
        return '';
    }
    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function renderIcon(icon) {
        icon = icon || {};
        if (icon.type === 'preset') return '<span class="bhw-icon-emoji">' + escapeHtml(PRESET_ICONS[icon.value] || '🎁') + '</span>';
        if (icon.type === 'emoji' && icon.value) return '<span class="bhw-icon-emoji">' + escapeHtml(String(icon.value).slice(0, 8)) + '</span>';
        if (icon.type === 'image' && /^https:\/\//i.test(icon.value || '')) return '<img class="bhw-icon-image" src="' + escapeHtml(icon.value) + '" alt="">';
        return '';
    }

    function applyCustomStyles(uniqueClass, style, cfg) {
        var id = 'bhw-discount-style-' + uniqueClass;
        var el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; (document.head || document.documentElement).appendChild(el); }
        el.textContent = generateUniqueStyles(uniqueClass, style, cfg);
        return id;
    }

    function generateUniqueStyles(uniqueClass, style, cfg) {
        var s = style || {}, c = s.colors || {}, z = s.sizes || {}, r = s.borderRadius || {}, sh = s.shadow || {};
        var fs = num(z.fontSize, 1), icon = num(z.iconSize, 64), pad = num(z.padding, 34);
        var ribbon = cfg.layout === 'split' ? 0 : num(z.ribbonHeight, 0);
        var sel = '.' + uniqueClass + ', .' + uniqueClass + '-teaser';
        return sel + '{' +
            '--bhw-font:' + cssValue(s.fontFamily, "'Inter', system-ui, sans-serif") + ';' +
            '--bhw-value-font:' + cssValue(s.valueFontFamily, 'ui-monospace, monospace') + ';' +
            '--bhw-overlay:' + cssValue(c.overlay, 'rgba(10,10,12,0.55)') + ';' +
            '--bhw-overlay-blur:' + num(s.overlayBlur, 6) + 'px;' +
            '--bhw-bg:' + cssValue(c.background, '#ffffff') + ';' +
            '--bhw-text-color:' + cssValue(c.text, '#111111') + ';' +
            '--bhw-accent:' + cssValue(c.accent, '#ff5a36') + ';' +
            '--bhw-card-border:' + cssValue(c.border, 'rgba(0,0,0,0.06)') + ';' +
            '--bhw-card-width:' + num(z.width, 440) + 'px;' +
            '--bhw-split-width:' + Math.round(num(z.width, 440) * 1.64) + 'px;' +
            '--bhw-header-bg:' + (cfg.layout === 'split' && safeUrl(cfg.imageUrl) ? 'url("' + safeUrl(cfg.imageUrl).replace(/["\\]/g, '') + '")' : cssValue(c.headerBackground, 'transparent')) + ';' +
            '--bhw-ribbon-height:' + ribbon + 'px;' +
            '--bhw-widget-radius:' + num(r.widget, 22) + 'px;' +
            '--bhw-block-radius:' + num(r.blocks, 14) + 'px;' +
            '--bhw-btn-radius:' + num(r.blocks, 14) + 'px;' +
            '--bhw-coupon-radius:' + num(r.blocks, 14) + 'px;' +
            '--bhw-padding:' + pad + 'px 30px ' + Math.round(pad * .8) + 'px;' +
            '--bhw-padding-mobile:' + Math.round(pad * .8) + 'px 22px 22px;' +
            '--bhw-gap:' + num(z.gap, 6) + 'px;' +
            '--bhw-icon-size:' + icon + 'px;' +
            '--bhw-icon-font-size:' + Math.round(icon * .47) + 'px;' +
            '--bhw-icon-top:' + Math.round(icon * -0.53) + 'px;' +
            '--bhw-icon-bg:' + cssValue(c.blockBackground, '#ffffff') + ';' +
            '--bhw-block-border:' + (icon >= 60 ? 3 : 2) + 'px solid ' + cssValue(c.blockBorder, 'rgba(255,255,255,0.9)') + ';' +
            '--bhw-icon-shadow:' + cssValue(sh.iconShadow, '0 12px 28px rgba(0,0,0,0.2)') + ';' +
            '--bhw-offer-size:' + (3.4 * fs).toFixed(3) + 'em;' +
            '--bhw-title-size:' + (1.45 * fs).toFixed(3) + 'em;' +
            '--bhw-title-size-mobile:' + (1.3 * fs).toFixed(3) + 'em;' +
            '--bhw-subtitle-size:' + (0.98 * fs).toFixed(3) + 'em;' +
            '--bhw-btn-size:' + (1 * fs).toFixed(3) + 'em;' +
            '--bhw-coupon-code-size:' + (1.35 * fs).toFixed(3) + 'em;' +
            '--bhw-btn-primary-bg:' + cssValue(c.btnPrimary, '#ff5a36') + ';' +
            '--bhw-btn-primary-color:' + cssValue(c.btnPrimaryText, '#ffffff') + ';' +
            '--bhw-btn-shadow-hover:' + cssValue(sh.btnHover, 'none') + ';' +
            '--bhw-btn-secondary-bg:' + cssValue(c.btnSecondary, 'transparent') + ';' +
            '--bhw-btn-secondary-color:' + cssValue(c.btnSecondaryText, 'inherit') + ';' +
            '--bhw-btn-secondary-bg-hover:' + cssValue(c.btnSecondaryHover, 'rgba(0,0,0,0.04)') + ';' +
            '--bhw-coupon-bg:' + cssValue(c.couponBg, '#fff4ef') + ';' +
            '--bhw-coupon-border:2px dashed ' + cssValue(c.couponBorder, '#ff5a36') + ';' +
            '--bhw-coupon-text:' + cssValue(c.couponText, '#7a2513') + ';' +
            '--bhw-coupon-copied-bg:' + cssValue(c.couponCopiedBg, '#e8f8ef') + ';' +
            '--bhw-coupon-copied-border:' + cssValue(c.couponCopiedBorder, '#16a34a') + ';' +
            '--bhw-shadow:' + cssValue(sh.widget, '0 30px 80px -20px rgba(0,0,0,0.45)') + ';' +
            '--bhw-text-shadow:' + cssValue(sh.text, 'none') + ';' +
            '--bhw-corner-justify:' + (cfg.cornerPosition === 'left' ? 'flex-start' : 'flex-end') + ';' +
            '}';
    }

    /* ---------------- построение виджета ---------------- */
    function createWidget(config, uniqueClass, id, opts) {
        opts = opts || {};
        var inline = opts.inline || null;
        var uid = 'bhw-d-' + Math.random().toString(36).slice(2, 8);
        var layout = ['modal', 'split', 'corner'].indexOf(config.layout) >= 0 ? config.layout : 'modal';
        if (layout === 'split' && !safeUrl(config.imageUrl)) layout = 'modal';
        var iconMarkup = renderIcon(config.icon);
        var ribbon = layout !== 'split' && num(config.style.sizes.ribbonHeight, 0) > 0;
        var styleId = applyCustomStyles(uniqueClass, config.style, { layout: layout, imageUrl: config.imageUrl });

        var overlay = document.createElement('div');
        overlay.className = 'bhw-overlay bhw-layout-' + layout + ' ' + uniqueClass + (ribbon ? '' : ' bhw-no-ribbon') + (iconMarkup ? '' : ' bhw-no-icon') + (inline ? ' bhw-inline' : '');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('data-bhw-id', id);

        var logo = safeUrl(config.logo);
        var code = String(config.couponCode || '');
        overlay.innerHTML =
            '<div class="bhw-card" tabindex="-1" role="dialog" aria-modal="' + (layout === 'corner' ? 'false' : 'true') + '" aria-labelledby="' + uid + '-t">' +
                '<div class="bhw-media" aria-hidden="true"></div>' +
                '<div class="bhw-main">' +
                    (ribbon ? '<div class="bhw-ribbon"></div>' : '') +
                    '<div class="bhw-content">' +
                        '<button class="bhw-close" type="button" aria-label="Close">&times;</button>' +
                        (logo ? '<img class="bhw-logo" src="' + escapeHtml(logo) + '" alt="">' : '') +
                        (iconMarkup ? '<div class="bhw-icon" aria-hidden="true">' + iconMarkup + '</div>' : '') +
                        (config.eyebrow ? '<span class="bhw-eyebrow">' + escapeHtml(config.eyebrow) + '</span>' : '') +
                        (config.offer ? '<p class="bhw-offer">' + escapeHtml(config.offer) + '</p>' : '') +
                        '<h2 class="bhw-title" id="' + uid + '-t">' + escapeHtml(config.title) + '</h2>' +
                        (config.message ? '<p class="bhw-message">' + escapeHtml(config.message) + '</p>' : '') +
                        (code ? '<div class="bhw-coupon" tabindex="0" role="button" aria-label="Copy code ' + escapeHtml(code) + '">' +
                            '<span><span class="bhw-coupon-label">' + escapeHtml(config.couponLabel) + '</span>' +
                            '<strong class="bhw-coupon-code">' + escapeHtml(code) + '</strong></span>' +
                            '<span class="bhw-copy-hint" aria-live="polite">' + escapeHtml(config.copyText) + '</span></div>' : '') +
                        '<div class="bhw-buttons">' +
                            '<button class="bhw-btn-primary" type="button">' + escapeHtml(config.buttonText) + '</button>' +
                            (config.dismissText ? '<button class="bhw-btn-secondary" type="button">' + escapeHtml(config.dismissText) + '</button>' : '') +
                        '</div>' +
                        '<p class="bhw-fine">' + escapeHtml(config.finePrint || '') + '</p>' +
                    '</div>' +
                '</div>' +
            '</div>';

        var teaser = null;
        if (config.teaser && config.teaser.enabled && config.teaser.text) {
            teaser = document.createElement('button');
            teaser.type = 'button';
            teaser.className = 'bhw-teaser ' + uniqueClass + '-teaser' + (inline ? ' bhw-inline' : '');
            teaser.style[config.teaser.position === 'right' ? 'right' : 'left'] = '20px';
            teaser.innerHTML = '<span class="bhw-teaser-dot" aria-hidden="true"></span>' + escapeHtml(config.teaser.text);
        }

        var host = inline || document.body;
        host.appendChild(overlay);
        if (teaser) host.appendChild(teaser);

        var card = overlay.querySelector('.bhw-card');
        var cleanups = [], lastFocus = null;
        function on(t, e, h, o) { t.addEventListener(e, h, o); cleanups.push(function () { t.removeEventListener(e, h, o); }); }
        function later(fn, ms) { var t = setTimeout(fn, ms); cleanups.push(function () { clearTimeout(t); }); }

        var widget = {
            overlay: overlay, config: config, id: id, styleId: styleId, isShown: false, cleanups: cleanups,
            show: function (force) {
                if (this.isShown) return;
                if (!force && !shouldShowByFrequency(config.frequency, id)) return;
                if (teaser) teaser.classList.remove('show');
                overlay.style.display = 'flex';
                overlay.setAttribute('aria-hidden', 'false');
                if (opts.instant) { overlay.classList.add('show'); opts.instant = false; }
                else requestAnimationFrame(function () { requestAnimationFrame(function () { overlay.classList.add('show'); }); });
                this.isShown = true;
                if (!force && !inline) markAsShown(config.frequency, id);
                if (!inline && layout !== 'corner') {
                    lastFocus = document.activeElement;
                    later(function () { try { card.focus({ preventScroll: true }); } catch (e) {} }, 60);
                }
            },
            hide: function () {
                if (!this.isShown) return;
                overlay.classList.remove('show');
                overlay.setAttribute('aria-hidden', 'true');
                this.isShown = false;
                later(function () { overlay.style.display = 'none'; if (teaser) { teaser.style.display = 'inline-flex'; requestAnimationFrame(function () { teaser.classList.add('show'); }); } }, inline ? 0 : 320);
                if (lastFocus && lastFocus.focus && !inline) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
            },
            copyCoupon: function () {
                var cp = overlay.querySelector('.bhw-coupon'), hint = overlay.querySelector('.bhw-copy-hint');
                return copyText(code).then(function () {
                    if (cp) cp.classList.add('copied');
                    if (hint) hint.textContent = config.copiedText || 'Copied';
                    later(function () { if (cp) cp.classList.remove('copied'); if (hint) hint.textContent = config.copyText || 'Copy'; }, 1800);
                }, function () { console.warn(LOG, 'copy failed'); });
            },
            setState: function (st) {
                if (st === 'teaser') {
                    overlay.classList.remove('show'); overlay.style.display = 'none'; this.isShown = false;
                    if (teaser) { teaser.style.display = 'inline-flex'; teaser.classList.add('show'); }
                    return;
                }
                if (teaser) { teaser.classList.remove('show'); teaser.style.display = 'none'; }
                this.show(true);
                var cp = overlay.querySelector('.bhw-coupon'), hint = overlay.querySelector('.bhw-copy-hint');
                if (cp) cp.classList.toggle('copied', st === 'copied');
                if (hint) hint.textContent = st === 'copied' ? (config.copiedText || 'Copied') : (config.copyText || 'Copy');
            },
            destroy: function () {
                cleanups.forEach(function (fn) { try { fn(); } catch (e) {} });
                cleanups.length = 0;
                overlay.remove(); if (teaser) teaser.remove();
                var s = document.getElementById(styleId); if (s) s.remove();
                if (BHW.discountPopups[id] === this) delete BHW.discountPopups[id];
            }
        };

        // обработчики
        on(overlay, 'click', function (e) { if (e.target === overlay && layout !== 'corner') widget.hide(); });
        on(overlay.querySelector('.bhw-close'), 'click', function () { widget.hide(); });
        var sec = overlay.querySelector('.bhw-btn-secondary'); if (sec) on(sec, 'click', function () { widget.hide(); });
        var cp = overlay.querySelector('.bhw-coupon');
        if (cp) {
            on(cp, 'click', function () { widget.copyCoupon(); });
            on(cp, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); widget.copyCoupon(); } });
        }
        on(overlay.querySelector('.bhw-btn-primary'), 'click', function () {
            var url = safeUrl(config.buttonUrl);
            (code ? widget.copyCoupon() : Promise.resolve()).then(function () {
                if (url && !inline) { later(function () { window.location.href = url; }, 450); }
                else later(function () { widget.hide(); }, 900);
            });
        });
        if (teaser) on(teaser, 'click', function () { widget.show(true); });
        if (!inline) on(document, 'keydown', function (e) {
            if (!widget.isShown) return;
            if (e.key === 'Escape') widget.hide();
            if (e.key === 'Tab' && layout !== 'corner') trapFocus(e, card);
        });

        return widget;
    }

    function trapFocus(e, card) {
        var f = [].filter.call(card.querySelectorAll('button, [tabindex="0"], a[href]'), function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (!card.contains(document.activeElement) || document.activeElement === card) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    /* ---------------- триггеры и частота ---------------- */
    function setupTriggers(widget, cfg) {
        var add = function (t, e, h, o) { t.addEventListener(e, h, o); widget.cleanups.push(function () { t.removeEventListener(e, h, o); }); };
        var shown = false;
        var fire = function () { if (shown || widget.isShown) return; shown = true; widget.show(); };
        var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;

        if (num(cfg.triggerDelay, 0) > 0) { var t = setTimeout(fire, num(cfg.triggerDelay, 0)); widget.cleanups.push(function () { clearTimeout(t); }); }
        if (cfg.showOnExit && !touch) add(document, 'mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) fire(); });
        var scrollAt = num(cfg.showOnScroll, 0) > 0 ? num(cfg.showOnScroll, 0) : (cfg.showOnExit && cfg.mobileExitFallback && touch ? 50 : 0);
        if (scrollAt > 0) add(window, 'scroll', function () {
            var max = document.documentElement.scrollHeight - window.innerHeight; if (max <= 0) return;
            if (window.scrollY / max * 100 >= scrollAt) fire();
        }, { passive: true });
    }

    function storage(kind) { try { var s = window[kind]; s.setItem('__bhw', '1'); s.removeItem('__bhw'); return s; } catch (e) { return null; } }
    function shouldShowByFrequency(frequency, id) {
        if (frequency === 'always') return true;
        if (frequency === 'session') { var ss = storage('sessionStorage'); return !(ss && ss.getItem('bhw-discount-shown-' + id)); }
        var ls = storage('localStorage');
        var last = parseInt((ls && ls.getItem('bhw-discount-lastShown-' + id)) || '0', 10) || 0;
        var H = 3600000, intervals = { '24h': 24 * H, '3d': 72 * H, '7d': 168 * H };
        return (Date.now() - last) > (intervals[frequency] || 0);
    }
    function markAsShown(frequency, id) {
        if (frequency === 'session') { var ss = storage('sessionStorage'); if (ss) ss.setItem('bhw-discount-shown-' + id, '1'); }
        else if (frequency !== 'always') { var ls = storage('localStorage'); if (ls) ls.setItem('bhw-discount-lastShown-' + id, String(Date.now())); }
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
        }
        return fallbackCopy(text);
    }
    function fallbackCopy(text) {
        return new Promise(function (resolve, reject) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
                document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, ta.value.length);
                var ok = document.execCommand('copy'); ta.remove();
                ok ? resolve() : reject(new Error('copy failed'));
            } catch (e) { reject(e); }
        });
    }
})();
