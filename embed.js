(function() {
    'use strict';

    // Глобальный объект виджета
    window.ExitIntentWidget = {
        config: {},
        isShown: false,
        listeners: {},
        stats: {
            shows: 0,
            clicks: 0,
            conversions: 0
        },

        // Инициализация
        init: function(customConfig) {
            const script = document.querySelector('script[data-config]');
            const configPath = script ? script.getAttribute('data-config') : null;
            
            if (configPath && !customConfig) {
                this.loadConfig(configPath);
            } else if (customConfig) {
                this.config = customConfig;
                this.setup();
            }
        },

        // Загрузка конфигурации
        loadConfig: function(path) {
            fetch(path)
                .then(response => response.json())
                .then(config => {
                    this.config = config;
                    this.setup();
                })
                .catch(error => console.error('Error loading config:', error));
        },

        // Настройка виджета
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

        // Создание popup
        createPopup: function() {
            const popup = document.createElement('div');
            popup.id = 'exit-intent-popup';
            popup.className = `popup-overlay ${this.config.theme || 'modern'}`;
            
            popup.innerHTML = `
                <div class="popup-content ${this.config.animation || 'fadeIn'}">
                    <button class="popup-close" onclick="ExitIntentWidget.hide()">&times;</button>
                    <div class="popup-icon">🎁</div>
                    <h2>${this.config.title}</h2>
                    <p>${this.config.message}</p>
                    <div class="coupon-code">
                        <span>couponCode:</span>
                        <strong>${this.config.couponCode}</strong>
                    </div>
                    <div class="popup-buttons">
                        <button class="btn-primary" onclick="ExitIntentWidget.handleConversion()">
                            Получить скидку
                        </button>
                        <button class="btn-secondary" onclick="ExitIntentWidget.hide()">
                            Нет, спасибо
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            this.addStyles();
        },

        // Добавление стилей
        addStyles: function() {
            if (document.getElementById('exit-intent-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'exit-intent-styles';
            styles.textContent = `
                .popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }
                
                .popup-overlay.show {
                    display: flex;
                }
                
                .popup-content {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                
                .popup-close {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                }
                
                .popup-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                }
                
                .popup-content h2 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 24px;
                }
                
                .popup-content p {
                    color: #666;
                    margin-bottom: 20px;
                    font-size: 16px;
                }
                
                .coupon-code {
                    background: #fff3cd;
                    border: 2px dashed #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                
                .coupon-code strong {
                    color: #856404;
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .popup-buttons {
                    display: flex;
                    gap: 10px;
                    flex-direction: column;
                }
                
                .btn-primary {
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: background 0.3s;
                }
                
                .btn-primary:hover {
                    background: #7c3aed;
                }
                
                .btn-secondary {
                    background: #e5e7eb;
                    color: #374151;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .slideUp {
                    animation: slideUp 0.5s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @media (max-width: 480px) {
                    .popup-content {
                        margin: 20px;
                        padding: 20px;
                    }
                }
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

        // Показать popup
        show: function() {
            if (this.isShown) return;
            
            const popup = document.getElementById('exit-intent-popup');
            if (popup) {
                popup.classList.add('show');
                this.isShown = true;
                this.stats.shows++;
                this.trigger('show');
                
                if (this.config.closeTimeout > 0) {
                    setTimeout(() => this.hide(), this.config.closeTimeout);
                }
            }
        },

        // Скрыть popup
        hide: function() {
            const popup = document.getElementById('exit-intent-popup');
            if (popup) {
                popup.classList.remove('show');
                this.isShown = false;
                this.trigger('hide');
            }
        },

        // Обработка конверсии
        handleConversion: function() {
            this.stats.clicks++;
            this.stats.conversions++;
            this.trigger('conversion');
            this.hide();
            
            if (this.config.analytics) {
                // Отправка аналитики
                console.log('Conversion tracked:', this.stats);
            }
        },

        // Привязка событий
        bindEvents: function() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isShown) {
                    this.hide();
                }
            });
        },

        // Система событий
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

    // Автоинициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        ExitIntentWidget.init();
    });
})();
