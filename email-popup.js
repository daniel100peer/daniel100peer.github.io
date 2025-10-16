// Email Capture Pop-up JavaScript
// Smart triggers and engagement functionality

(function() {
    'use strict';
    
    // Configuration
    const config = {
        timeDelay: 15000, // Show after 15 seconds
        scrollPercentage: 50, // Show after 50% scroll
        exitIntentDelay: 1000, // Delay for exit intent
        cookieName: 'quantedge_email_captured',
        cookieExpiry: 30, // Days
        notificationInterval: 45000 // Show notifications every 45 seconds
    };
    
    // State management
    let popupShown = false;
    let exitIntentActive = false;
    
    // DOM Elements
    const emailPopup = document.getElementById('email-popup');
    const popupClose = document.getElementById('popup-close');
    const emailForm = document.getElementById('email-form');
    const floatingBtn = document.getElementById('floating-email-btn');
    const successMessage = document.getElementById('success-message');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationText = document.getElementById('notification-text');
    
    // Check if user already submitted email
    function hasSubmittedEmail() {
        return getCookie(config.cookieName) === 'true';
    }
    
    // Cookie functions
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    // Show popup
    function showPopup() {
        if (!popupShown && !hasSubmittedEmail()) {
            emailPopup.classList.add('active');
            popupShown = true;
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Hide popup
    function hidePopup() {
        emailPopup.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Show success message
    function showSuccess() {
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }
    
    // Show notification
    function showNotification(text) {
        notificationText.textContent = text;
        notificationBadge.classList.add('show');
        
        setTimeout(() => {
            notificationBadge.classList.remove('show');
        }, 5000);
    }
    
    // Random notifications
    const notifications = [
        "A trader from New York just shared their momentum strategy!",
        "Someone in London is exploring our arbitrage solutions",
        "A quant developer just submitted their custom strategy idea",
        "New strategy submission from Singapore!",
        "A hedge fund manager is interested in our algorithms",
        "Fresh strategy concept received from Tokyo!"
    ];
    
    function showRandomNotification() {
        if (!hasSubmittedEmail()) {
            const randomIndex = Math.floor(Math.random() * notifications.length);
            showNotification(notifications[randomIndex]);
        }
    }
    
    // Trigger: Time-based
    function setupTimeBasedTrigger() {
        setTimeout(() => {
            showPopup();
        }, config.timeDelay);
    }
    
    // Trigger: Scroll-based
    function setupScrollTrigger() {
        let scrollTriggered = false;
        
        window.addEventListener('scroll', () => {
            if (!scrollTriggered) {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercent >= config.scrollPercentage) {
                    scrollTriggered = true;
                    showPopup();
                }
            }
        });
    }
    
    // Trigger: Exit intent
    function setupExitIntentTrigger() {
        document.addEventListener('mousemove', (e) => {
            if (!exitIntentActive && e.clientY <= 5) {
                exitIntentActive = true;
                
                setTimeout(() => {
                    showPopup();
                }, config.exitIntentDelay);
            }
        });
    }
    
    // Trigger: Page engagement (time on specific sections)
    function setupEngagementTrigger() {
        // Track time spent on strategy sections
        const strategySection = document.querySelector('.strategy-overview, .blog-strategies-grid');
        
        if (strategySection) {
            let inView = false;
            let viewTime = 0;
            const requiredTime = 10000; // 10 seconds
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        inView = true;
                        const checkInterval = setInterval(() => {
                            if (inView) {
                                viewTime += 1000;
                                if (viewTime >= requiredTime) {
                                    clearInterval(checkInterval);
                                    showPopup();
                                }
                            } else {
                                clearInterval(checkInterval);
                            }
                        }, 1000);
                    } else {
                        inView = false;
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(strategySection);
        }
    }
    
    // Handle form submission
    function handleFormSubmission(e) {
        e.preventDefault();
        
        const email = document.getElementById('popup-email').value;
        const selectedStrategies = [];
        
        document.querySelectorAll('input[name="strategy"]:checked').forEach(checkbox => {
            selectedStrategies.push(checkbox.value);
        });
        
        // Here you would normally send this data to your server
        console.log('Email captured:', email);
        console.log('Interested in:', selectedStrategies);
        
        // Set cookie
        setCookie(config.cookieName, 'true', config.cookieExpiry);
        
        // Hide popup and show success
        hidePopup();
        showSuccess();
        
        // Optional: Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_capture', {
                'event_category': 'engagement',
                'event_label': 'popup_form',
                'value': selectedStrategies.length
            });
        }
    }
    
    // Event listeners
    function setupEventListeners() {
        // Close button
        if (popupClose) {
            popupClose.addEventListener('click', hidePopup);
        }
        
        // Click outside to close
        emailPopup.addEventListener('click', (e) => {
            if (e.target === emailPopup) {
                hidePopup();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && emailPopup.classList.contains('active')) {
                hidePopup();
            }
        });
        
        // Form submission
        if (emailForm) {
            emailForm.addEventListener('submit', handleFormSubmission);
        }
        
        // Floating button
        if (floatingBtn) {
            floatingBtn.addEventListener('click', showPopup);
        }
    }
    
    // Smart trigger logic
    function initializeSmartTriggers() {
        const currentPage = window.location.pathname;
        
        // Different triggers for different pages
        if (currentPage.includes('strategy') || currentPage.includes('strategies')) {
            // On strategy pages, be more aggressive
            setupTimeBasedTrigger();
            setupScrollTrigger();
            setupEngagementTrigger();
        } else if (currentPage.includes('service')) {
            // On service pages, use scroll and exit intent
            setupScrollTrigger();
            setupExitIntentTrigger();
        } else {
            // On other pages, use time and exit intent
            setupTimeBasedTrigger();
            setupExitIntentTrigger();
        }
    }
    
    // Initialize notifications
    function initializeNotifications() {
        // Show first notification after 30 seconds
        setTimeout(() => {
            showRandomNotification();
            
            // Then show periodically
            setInterval(showRandomNotification, config.notificationInterval);
        }, 30000);
    }
    
    // A/B Testing functionality
    function setupABTesting() {
        const variant = Math.random() > 0.5 ? 'A' : 'B';
        
        if (variant === 'A') {
            document.querySelector('.popup-title').textContent = "Got a Brilliant Trading Strategy in Mind?";
        } else {
            document.querySelector('.popup-title').textContent = "Ready to Build Your Next Big Trading Idea?";
        }
        
        // Track variant
        emailPopup.setAttribute('data-variant', variant);
    }
    
    // Initialize everything
    function init() {
        // Don't initialize if user already submitted
        if (hasSubmittedEmail()) {
            // Hide floating button if email already captured
            if (floatingBtn) {
                floatingBtn.style.display = 'none';
            }
            return;
        }
        
        setupEventListeners();
        initializeSmartTriggers();
        initializeNotifications();
        setupABTesting();
        
        // Add floating button animation
        if (floatingBtn) {
            setTimeout(() => {
                floatingBtn.style.opacity = '1';
                floatingBtn.style.transform = 'scale(1)';
            }, 5000);
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export functions for external use
    window.QuantEdgePopup = {
        show: showPopup,
        hide: hidePopup,
        reset: function() {
            document.cookie = config.cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            popupShown = false;
        }
    };
})();