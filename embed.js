(function() {
    'use strict';

const DEFAULTS = {
    title: "Don't leave!",
    message: "Get 20% off your first purchase",
    couponCode: "SAVE20",
    theme: "modern",
    animation: "fadeIn",
    icon: "🎁",
    buttonText: "Get Discount",
    dismissText: "No, thanks",
    showOnExit: true,
    triggerDelay: 0,
    showOnScroll: 0,
    closeTimeout: 0,
    frequency: "session", // 'always' | 'session' | '24h' | '3d'
    analytics: true,
    colors: {
        primary: "#8b5cf6",
        secondary: "#e5e7eb",
        text: "#333333",
        background: "#ffffff",
        overlay: "rgba(0,0,0,0.5)",
        couponBg: "#fff3cd",
        couponBorder: "#ffc107",
        couponText: "#856404"
    },
    logo: ""
};



    // Global widget object
    window.ExitIntentWidget = {
        config: {},
        isShown: false,
        listeners: {},
        stats: {
            shows: 0,
            clicks: 0,
            conversions: 0
        },

        // Initialization
        init: function(customConfig) {
    const script = document.currentScript || document.querySelector('script[src*="embed.js"]');
    const configPath = script ? script.getAttribute('data-config') : null;
    const widgetId = script ? script.getAttribute('data-widget-id') : null;

    if (customConfig) {
        this.config = this.validateAndMerge(customConfig);
        this.setup();
        return;
    }
    
    if (configPath) {
        this.loadConfig(configPath);
        return;
    }
    
    if (widgetId) {
        this.loadConfig(`https://discount.tf-widgets.com/api/config/${widgetId}`);
        return;
    }
    
    // Fallback: собираем из data-* атрибутов
    this.config = this.validateAndMerge(this.parseDataAttributes(script));
    this.setup();
},

parseDataAttributes: function(script) {
    if (!script) return {};
    const d = script.dataset;
    
    return {
        title: d.title,
        message: d.message,
        couponCode: d.couponCode,
        theme: d.theme,
        animation: d.animation,
        icon: d.icon,
        buttonText: d.buttonText,
        dismissText: d.dismissText,
        showOnExit: d.showOnExit === 'true',
        triggerDelay: parseInt(d.triggerDelay) || 0,
        showOnScroll: parseInt(d.showOnScroll) || 0,
        closeTimeout: parseInt(d.closeTimeout) || 0,
        frequency: d.frequency,
        logo: d.logo,
        colors: {
            primary: d.primaryColor,
            secondary: d.secondaryColor,
            text: d.textColor,
            background: d.backgroundColor,
            overlay: d.overlayColor,
            couponBg: d.couponBg,
            couponBorder: d.couponBorder,
            couponText: d.couponText
        }
    };
},

validateAndMerge: function(config) {
    const merged = JSON.parse(JSON.stringify(DEFAULTS));
    
    function mergeDeep(target, source) {
        Object.keys(source || {}).forEach(key => {
            const value = source[key];
            if (value == null) return;
            
            if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
                mergeDeep(target[key], value);
            } else {
                // Санитизация строк
                if (typeof value === 'string') {
                    target[key] = value.substring(0, 300).replace(/<[^>]*>/g, '');
                } else {
                    target[key] = value;
                }
            }
        });
    }
    
    mergeDeep(merged, config);
    
    // Валидация числовых значений
    merged.triggerDelay = Math.max(0, Math.min(600000, merged.triggerDelay));
    merged.showOnScroll = Math.max(0, Math.min(100, merged.showOnScroll));
    merged.closeTimeout = Math.max(0, Math.min(600000, merged.closeTimeout));
    
    if (!['always', 'session', '24h', '3d'].includes(merged.frequency)) {
        merged.frequency = 'session';
    }
    
    return merged;
},

shouldShowByFrequency: function() {
    const key = 'exitWidget:lastShown';
    
    if (this.config.frequency === 'always') return true;
    
    if (this.config.frequency === 'session') {
        return !sessionStorage.getItem('exitWidget:shown');
    }
    
    const lastShown = parseInt(localStorage.getItem(key)) || 0;
    const now = Date.now();
    const intervals = { '24h': 24 * 60 * 60 * 1000, '3d': 3 * 24 * 60 * 60 * 1000 };
    
    return (now - lastShown) > (intervals[this.config.frequency] || 0);
},

        // Load configuration
        loadConfig: function(path) {
    fetch(path)
        .then(response => response.json())
        .then(config => {
            this.config = this.validateAndMerge(config); 
            this.setup();
        })
        .catch(error => console.error('Error loading config:', error));
},

        // Setup widget
        setup: function() {
            this.createPopup();
            this.bindEvents();
            
            if (this.config.showOnExit) {
                this.setupExitIntent();
            }
            
            if (this.config.triggerDelay) {
                setTimeout(() => this.show(), this.config.triggerDelay);
            }
            
            if (this.config.showOnScroll) {
                this.setupScrollTrigger();
            }
        },

        // Create popup
        
createPopup: function() {
    const popup = document.createElement('div');
    popup.id = 'exit-intent-popup';
    popup.className = `popup-overlay ${this.config.theme || 'modern'}`;
    
    const logoHtml = this.config.logo ? 
        `<img src="${this.config.logo}" alt="Logo" class="popup-logo">` : '';
    
    popup.innerHTML = `
        <div class="popup-content ${this.config.animation || 'fadeIn'}">
            <button class="popup-close" onclick="ExitIntentWidget.hide()">&times;</button>
            ${logoHtml}
            <div class="popup-icon">${this.config.icon}</div>
            <h2>${this.config.title}</h2>
            <p>${this.config.message}</p>
            <div class="coupon-code">
                <span>Promo Code:</span>
                <strong>${this.config.couponCode}</strong>
            </div>
            <div class="popup-buttons">
                <button class="btn-primary" onclick="ExitIntentWidget.handleConversion()">
                    ${this.config.buttonText}
                </button>
                <button class="btn-secondary" onclick="ExitIntentWidget.hide()">
                    ${this.config.dismissText}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    this.addStyles();
},


        // Add styles

addStyles: function() {
    if (document.getElementById('exit-intent-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'exit-intent-styles';
    
    // CSS-переменные из конфига
    const c = this.config.colors;
    const cssVars = `
        :root {
            --eiw-primary: ${c.primary};
            --eiw-secondary: ${c.secondary};
            --eiw-text: ${c.text};
            --eiw-bg: ${c.background};
            --eiw-overlay: ${c.overlay};
            --eiw-coupon-bg: ${c.couponBg};
            --eiw-coupon-border: ${c.couponBorder};
            --eiw-coupon-text: ${c.couponText};
        }
    `;
    
    styles.textContent = cssVars + `
        .popup-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: var(--eiw-overlay); display: none; justify-content: center; align-items: center;
            z-index: 10000; backdrop-filter: blur(5px);
        }
        .popup-overlay.show { display: flex; }
        .popup-content {
            background: var(--eiw-bg); color: var(--eiw-text);
            padding: 30px; border-radius: 15px; text-align: center;
            max-width: 400px; width: 90%; position: relative;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .popup-logo { 
            max-width: 120px; max-height: 40px; 
            margin: 0 auto 15px; display: block; 
        }
        .popup-close { 
            position: absolute; top: 10px; right: 15px; 
            background: none; border: none; font-size: 24px; 
            cursor: pointer; color: #999; 
        }
        .popup-icon { font-size: 48px; margin-bottom: 15px; }
        .popup-content h2 { color: var(--eiw-text); margin-bottom: 15px; font-size: 24px; }
        .popup-content p { color: var(--eiw-text); margin-bottom: 20px; font-size: 16px; opacity: 0.8; }
        .coupon-code {
            background: var(--eiw-coupon-bg); border: 2px dashed var(--eiw-coupon-border);
            padding: 15px; margin: 20px 0; border-radius: 8px;
        }
        .coupon-code strong { color: var(--eiw-coupon-text); font-size: 18px; font-weight: bold; }
        .popup-buttons { display: flex; gap: 10px; flex-direction: column; }
        .btn-primary {
            background: var(--eiw-primary); color: white; border: none;
            padding: 12px 24px; border-radius: 8px; cursor: pointer;
            font-size: 16px; font-weight: bold; transition: all 0.3s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary {
            background: var(--eiw-secondary); color: var(--eiw-text);
            border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;
        }
        .fadeIn { animation: fadeIn 0.5s ease-out; }
        .slideUp { animation: slideUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) { .popup-content { margin: 20px; padding: 20px; } }
    `;
    
    document.head.appendChild(styles);
},


        // Exit Intent
        setupExitIntent: function() {
            let hasTriggered = false;
            
            document.addEventListener('mouseleave', (e) => {
                if (e.clientY <= 0 && !hasTriggered && !this.isShown) {
                    this.show();
                    hasTriggered = true;
                }
            });
        },

        // Scroll Trigger
        setupScrollTrigger: function() {
            let hasTriggered = false;
            
            window.addEventListener('scroll', () => {
                const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercent >= this.config.showOnScroll && !hasTriggered && !this.isShown) {
                    this.show();
                    hasTriggered = true;
                }
            });
        },

        // Show popup
show: function() {
    if (this.isShown || !this.shouldShowByFrequency()) return;
    
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.classList.add('show');
        this.isShown = true;
        this.stats.shows++;
        this.trigger('show');
        
        // Сохраняем время показа
        localStorage.setItem('exitWidget:lastShown', Date.now().toString());
        sessionStorage.setItem('exitWidget:shown', '1');
        
        if (this.config.closeTimeout > 0) {
            setTimeout(() => this.hide(), this.config.closeTimeout);
        }
    }
},

        // Hide popup
        hide: function() {
            const popup = document.getElementById('exit-intent-popup');
            if (popup) {
                popup.classList.remove('show');
                this.isShown = false;
                this.trigger('hide');
            }
        },

        // Handle conversion
        handleConversion: function() {
            this.stats.clicks++;
            this.stats.conversions++;
            this.trigger('conversion');
            this.hide();
            
            if (this.config.analytics) {
                // Send analytics
                console.log('Conversion tracked:', this.stats);
            }
        },

        // Bind events
        bindEvents: function() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isShown) {
                    this.hide();
                }
            });
        },

        // Event system
        on: function(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },

        trigger: function(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => callback(data));
            }
        }
    };

    // Auto init on page load
    document.addEventListener('DOMContentLoaded', function() {
        ExitIntentWidget.init();
    });
})();
