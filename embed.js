(() => {
  'use strict';

  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  // Красивый дефолт с минимальными настройками
  const defaultConfig = {
    title: "Don't leave!",
    message: "Get 20% off your first purchase",
    couponCode: "SAVE20",
    icon: "🎁",
    buttonText: "Get discount",
    dismissText: "No, thanks",
    triggerDelay: 0,
    showOnExit: false,
    showOnScroll: 0,
    frequency: "session",
    theme: {
      primary: "#8b5cf6",
      secondary: "#6d28d9",
      background: "#ffffff",
      text: "#333333",
      overlay: "rgba(15,23,42,0.6)",
      couponBg: "#fff3cd",
      couponBorder: "#f59e0b",
      couponText: "#7c2d12",
      borderRadius: 18
    },
    fontFamily: "'Inter', system-ui, sans-serif"
  };

  // Глобальный объект для демо-кнопок
  window.DiscountPopups = window.DiscountPopups || {};

  scripts.forEach(async (script) => {
    if (script.dataset.dpwMounted === '1') return;
    script.dataset.dpwMounted = '1';

    const id = (script.dataset.id || 'demo').replace(/\.(json|js)$/, '');
    const basePath = getBasePath(script.src);
    const cfg = await loadConfig(id, basePath);

    mountWidget(script, cfg, id);
  });

  function mountWidget(host, cfg, id) {
    const config = mergeDeep(defaultConfig, cfg || {});
    
    // Поддержка старого формата colors
    if (cfg && cfg.colors) {
      config.theme.primary = cfg.colors.primary || config.theme.primary;
      config.theme.secondary = cfg.colors.secondary || config.theme.secondary;
      config.theme.background = cfg.colors.background || config.theme.background;
      config.theme.text = cfg.colors.text || config.theme.text;
      config.theme.overlay = cfg.colors.overlay || config.theme.overlay;
      config.theme.couponBg = cfg.colors.couponBg || config.theme.couponBg;
      config.theme.couponBorder = cfg.colors.couponBorder || config.theme.couponBorder;
      config.theme.couponText = cfg.colors.couponText || config.theme.couponText;
    }

    const uniqueClass = `dpw-${id}-${Date.now()}`;
    const widget = createPopupWidget(config, uniqueClass, id);
    
    // Сохраняем для демо-кнопок
    window.DiscountPopups[id] = widget;

    // Настраиваем триггеры
    setupTriggers(widget, config);
  }

  function createPopupWidget(config, uniqueClass, id) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = `dpw-overlay ${uniqueClass}`;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    // Генерируем стили
    const style = document.createElement('style');
    style.textContent = generateStyles(config, uniqueClass);
    document.head.appendChild(style);

    // HTML структура с градиентной лентой
    overlay.innerHTML = `
      <div class="dpw-card" role="dialog" aria-modal="true">
        <div class="dpw-ribbon"></div>
        <div class="dpw-content">
          <button class="dpw-close" aria-label="Close">×</button>
          ${config.logo ? `<img class="dpw-logo" src="${escapeAttr(config.logo)}" alt="Logo">` : ''}
          <div class="dpw-icon">${escapeHtml(config.icon)}</div>
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

  function generateStyles(config, uniqueClass) {
    const t = config.theme;
    const gradient = `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`;
    
    return `
      .${uniqueClass}.dpw-overlay {
        position: fixed;
        inset: 0;
        background: ${t.overlay};
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        backdrop-filter: blur(8px);
        font-family: ${config.fontFamily};
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .${uniqueClass}.dpw-overlay.show {
        opacity: 1;
      }
      
      .${uniqueClass} .dpw-card {
        width: min(92vw, 480px);
        background: ${t.background};
        border-radius: ${t.borderRadius}px;
        box-shadow: 0 25px 70px rgba(0,0,0,0.35);
        position: relative;
        overflow: hidden;
        transform: scale(0.8) translateY(20px);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .${uniqueClass}.show .dpw-card {
        transform: scale(1) translateY(0);
      }
      
      .${uniqueClass} .dpw-ribbon {
        height: 100px;
        background: ${gradient};
        position: relative;
      }
      
      .${uniqueClass} .dpw-ribbon::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 25% 20%, rgba(255,255,255,0.2) 0%, transparent 60%);
      }
      
      .${uniqueClass} .dpw-content {
        padding: 24px 28px 32px;
        text-align: center;
        position: relative;
        color: ${t.text};
      }
      
      .${uniqueClass} .dpw-close {
        position: absolute;
        top: 12px;
        right: 16px;
        background: rgba(0,0,0,0.1);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        color: ${t.text};
        font-size: 18px;
        transition: all 0.2s ease;
      }
      
      .${uniqueClass} .dpw-close:hover {
        background: rgba(0,0,0,0.15);
        transform: scale(1.1);
      }
      
      .${uniqueClass} .dpw-icon {
        position: absolute;
        top: -36px;
        left: 50%;
        transform: translateX(-50%);
        background: #fff;
        width: 68px;
        height: 68px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.25);
        border: 3px solid rgba(255,255,255,0.8);
        animation: dpw-bounce-${uniqueClass} 2.5s ease-in-out infinite;
      }
      
      .${uniqueClass} .dpw-title {
        margin: 24px 0 8px 0;
        font-size: 1.6em;
        font-weight: 800;
        letter-spacing: -0.3px;
      }
      
      .${uniqueClass} .dpw-message {
        margin: 0 0 20px 0;
        font-size: 1.05em;
        opacity: 0.85;
        line-height: 1.4;
      }
      
      .${uniqueClass} .dpw-coupon {
        background: ${t.couponBg};
        border: 2px dashed ${t.couponBorder};
        padding: 16px;
        margin: 20px 0 24px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .${uniqueClass} .dpw-coupon:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .${uniqueClass} .dpw-coupon.copied {
        background: #d1fae5;
        border-color: #10b981;
      }
      
      .${uniqueClass} .dpw-coupon-label {
        display: block;
        font-size: 0.85em;
        color: ${t.couponText};
        opacity: 0.8;
        margin-bottom: 4px;
      }
      
      .${uniqueClass} .dpw-coupon-code {
        font-size: 1.3em;
        font-weight: 800;
        color: ${t.couponText};
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        letter-spacing: 1px;
      }
      
      .${uniqueClass} .dpw-copy-hint {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.7em;
        opacity: 0.6;
        color: ${t.couponText};
      }
      
      .${uniqueClass} .dpw-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .${uniqueClass} .dpw-btn-primary {
        background: ${gradient};
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 1.1em;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .${uniqueClass} .dpw-btn-primary::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%);
      }
      
      .${uniqueClass} .dpw-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
      }
      
      .${uniqueClass} .dpw-btn-secondary {
        background: #f1f5f9;
        color: ${t.text};
        border: none;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 0.95em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.8;
      }
      
      .${uniqueClass} .dpw-btn-secondary:hover {
        opacity: 1;
        background: #e2e8f0;
      }
      
      .${uniqueClass} .dpw-logo {
        max-height: 32px;
        max-width: 140px;
        margin: 8px auto 0;
        display: block;
      }
      
      @keyframes dpw-bounce-${uniqueClass} {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-6px); }
      }
      
      @media (max-width: 480px) {
        .${uniqueClass} .dpw-content {
          padding: 20px 24px 28px;
        }
        
        .${uniqueClass} .dpw-title {
          font-size: 1.4em;
        }
        
        .${uniqueClass} .dpw-message {
          font-size: 1em;
        }
      }
    `;
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

  // Вспомогательные функции
  async function loadConfig(id, basePath) {
    const url = `${basePath}configs/${id}.json`;
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return defaultConfig;
      return await r.json();
    } catch {
      return defaultConfig;
    }
  }

  function getBasePath(src) {
    try {
      const u = new URL(src, location.href);
      return u.pathname.replace(/\/[^\/]*$/, '/');
    } catch { return './'; }
  }

  function mergeDeep(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = mergeDeep(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
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
