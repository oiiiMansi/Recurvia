// Enhanced Website Script with Performance Optimizations and Modern Features

class WebsiteManager {
    constructor() {
        this.state = {
            currentTestimonial: 0,
            isScrolling: false,
            observers: new Map(),
            animations: new Map()
        };
        
        this.config = {
            scrollThrottle: 16, // ~60fps
            animationDuration: 300,
            testimonialInterval: 5000,
            navOffset: 70
        };
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            this.initThemeSystem();
            this.initNavigation();
            this.initPortfolioFilter();
            this.initFormHandlers();
            this.initScrollEffects();
            this.initTestimonialSlider();
            this.initAnimations();
            this.initTypedText();
            this.initServiceWorker();
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }

    // Enhanced Theme System with System Preference Detection
    initThemeSystem() {
        const toggleSwitch = document.querySelector('#checkbox');
        const themeIcon = document.getElementById('themeIcon');
        
        if (!toggleSwitch || !themeIcon) return;

        // Check for saved theme or system preference
        const savedTheme = this.getStoredTheme();
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        this.setTheme(isDarkMode, false);
        toggleSwitch.checked = isDarkMode;

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.setTheme(e.matches, true);
                toggleSwitch.checked = e.matches;
            }
        });

        toggleSwitch.addEventListener('change', (e) => {
            this.setTheme(e.target.checked, true);
        });
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch {
            return null;
        }
    }

    setTheme(isDark, save = true) {
        document.documentElement.classList.toggle('dark-mode', isDark);
        
        if (save) {
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (error) {
                console.warn('Unable to save theme preference:', error);
            }
        }

        this.updateThemeIcon(isDark);
        
        // Dispatch custom event for theme change
        document.dispatchEvent(new CustomEvent('themechange', { 
            detail: { isDark } 
        }));
    }

    updateThemeIcon(isDark) {
        const themeIcon = document.getElementById('themeIcon');
        if (!themeIcon) return;

        themeIcon.classList.remove('fa-moon', 'fa-sun');
        themeIcon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
    }

    // Enhanced Navigation with Debounced Scroll
    initNavigation() {
        const navbar = document.querySelector('.navbar');
        const menuBtn = document.getElementById('openMenu');
        const navLinks = document.getElementById('navLinks');
        const navLinksItems = document.querySelectorAll('.nav-links ul li a');

        if (!navbar) return;

        // Mobile menu toggle
        menuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks?.classList.toggle('show');
        });

        // Close menu on link click
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks?.classList.remove('show');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (navLinks && !navLinks.contains(e.target) && e.target !== menuBtn) {
                navLinks.classList.remove('show');
            }
        });

        // Optimized scroll handler with debouncing
        let scrollTimeout;
        const handleScroll = () => {
            if (scrollTimeout) return;
            
            scrollTimeout = requestAnimationFrame(() => {
                const scrolled = window.scrollY > 100;
                navbar.classList.toggle('scrolled', scrolled);
                this.updateActiveNavLink();
                scrollTimeout = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Smooth scrolling for anchor links
        this.initSmoothScrolling();
    }

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - this.config.navOffset;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    updateActiveNavLink() {
        if (this.state.isScrolling) return;
        
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links ul li a');
        let current = '';

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    // Enhanced Portfolio Filter with Animation Queue
    initPortfolioFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        if (!filterBtns.length || !portfolioItems.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // Prevent multiple rapid clicks
                if (btn.disabled) return;
                btn.disabled = true;

                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                await this.animatePortfolioFilter(portfolioItems, filterValue);
                
                btn.disabled = false;
            });
        });
    }

    async animatePortfolioFilter(items, filterValue) {
        const hidePromises = [];
        const showPromises = [];

        items.forEach(item => {
            const category = item.getAttribute('data-category');
            const shouldShow = filterValue === 'all' || category === filterValue;
            
            if (shouldShow && item.style.display === 'none') {
                showPromises.push(this.showPortfolioItem(item));
            } else if (!shouldShow && item.style.display !== 'none') {
                hidePromises.push(this.hidePortfolioItem(item));
            }
        });

        // Hide items first, then show new ones
        await Promise.all(hidePromises);
        await Promise.all(showPromises);
    }

    showPortfolioItem(item) {
        return new Promise(resolve => {
            item.style.display = 'block';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            requestAnimationFrame(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                
                setTimeout(resolve, this.config.animationDuration);
            });
        });
    }

    hidePortfolioItem(item) {
        return new Promise(resolve => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                item.style.display = 'none';
                resolve();
            }, this.config.animationDuration);
        });
    }

    // Enhanced Form Handlers with Validation
    initFormHandlers() {
        this.initContactForm();
        this.initNewsletterForm();
    }

    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = this.getFormData(form);
            const validation = this.validateContactForm(formData);
            
            if (!validation.isValid) {
                this.showFormError(validation.errors.join('\n'));
                return;
            }

            await this.submitForm('/api/contact', formData, form, 'Thank you for your message! We will get back to you soon.');
        });
    }

    initNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            
            if (!this.isValidEmail(email)) {
                this.showFormError('Please enter a valid email address.');
                return;
            }

            await this.submitForm('/api/newsletter', { email }, form, 'Thank you for subscribing! You\'ll receive our newsletter soon.');
        });
    }

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        return data;
    }

    validateContactForm(data) {
        const errors = [];
        
        if (!data.name || data.name.length < 2) {
            errors.push('Name must be at least 2 characters long.');
        }
        
        if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address.');
        }
        
        if (!data.subject || data.subject.length < 3) {
            errors.push('Subject must be at least 3 characters long.');
        }
        
        if (!data.message || data.message.length < 10) {
            errors.push('Message must be at least 10 characters long.');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async submitForm(url, data, form, successMessage) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            this.setButtonLoading(submitBtn, true);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showFormSuccess(successMessage);
                form.reset();
            } else {
                throw new Error(result.message || 'Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError(error.message || 'There was an error submitting the form. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false, originalText);
        }
    }

    setButtonLoading(button, isLoading, originalText = null) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = button.textContent.includes('Subscrib') ? 'Subscribing...' : 'Sending...';
        } else {
            button.disabled = false;
            button.textContent = originalText || button.dataset.originalText || button.textContent;
        }
    }

    showFormSuccess(message) {
        // Enhanced notification system
        this.showNotification(message, 'success');
    }

    showFormError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create or update notification element
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 350px;
            `;
            document.body.appendChild(notification);
        }

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        // Show notification
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Hide after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 5000);
    }

    // Enhanced Scroll Effects with Intersection Observer
    initScrollEffects() {
        const fadeElements = document.querySelectorAll('.service-card, .portfolio-item, .about-content, .founder-card');
        
        if (!fadeElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });

        fadeElements.forEach(element => {
            observer.observe(element);
        });

        this.state.observers.set('fadeIn', observer);
    }

    // Enhanced Testimonial Slider with Touch Support
    initTestimonialSlider() {
        const testimonials = document.querySelectorAll('.testimonial');
        
        if (testimonials.length <= 1) return;

        // Initialize testimonials
        testimonials.forEach((testimonial, index) => {
            testimonial.style.display = index === 0 ? 'block' : 'none';
            testimonial.style.opacity = index === 0 ? '1' : '0';
        });

        // Auto-rotate testimonials
        const rotateTestimonials = () => {
            const current = testimonials[this.state.currentTestimonial];
            const next = (this.state.currentTestimonial + 1) % testimonials.length;
            const nextTestimonial = testimonials[next];

            this.crossFadeTestimonials(current, nextTestimonial);
            this.state.currentTestimonial = next;
        };

        setInterval(rotateTestimonials, this.config.testimonialInterval);

        // Add touch support for mobile
        this.addTestimonialTouchSupport(testimonials);
    }

    crossFadeTestimonials(current, next) {
        current.style.transition = 'opacity 0.5s ease';
        next.style.display = 'block';
        next.style.opacity = '0';
        next.style.transition = 'opacity 0.5s ease';

        requestAnimationFrame(() => {
            current.style.opacity = '0';
            next.style.opacity = '1';
        });

        setTimeout(() => {
            current.style.display = 'none';
        }, 500);
    }

    addTestimonialTouchSupport(testimonials) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const container = testimonials[0]?.parentElement;
        if (!container) return;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        container.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextTestimonial(testimonials);
                } else {
                    this.prevTestimonial(testimonials);
                }
            }
            
            isDragging = false;
        }, { passive: true });
    }

    nextTestimonial(testimonials) {
        const current = testimonials[this.state.currentTestimonial];
        const next = (this.state.currentTestimonial + 1) % testimonials.length;
        const nextTestimonial = testimonials[next];

        this.crossFadeTestimonials(current, nextTestimonial);
        this.state.currentTestimonial = next;
    }

    prevTestimonial(testimonials) {
        const current = testimonials[this.state.currentTestimonial];
        const prev = (this.state.currentTestimonial - 1 + testimonials.length) % testimonials.length;
        const prevTestimonial = testimonials[prev];

        this.crossFadeTestimonials(current, prevTestimonial);
        this.state.currentTestimonial = prev;
    }

    // Enhanced Animations with Performance Optimization
    initAnimations() {
        this.initFounderAnimations();
        this.initScrollAnimations();
        this.addAnimationStyles();
    }

    initFounderAnimations() {
        const founderImages = document.querySelectorAll('.founder-img');
        
        founderImages.forEach((image, index) => {
            image.classList.add('pulse-animation');
            image.style.transitionDelay = `${index * 200}ms`;
            
            // Use passive event listeners for better performance
            image.addEventListener('mouseenter', () => {
                image.classList.remove('pulse-animation');
                image.classList.add('hover-animation');
            }, { passive: true });
            
            image.addEventListener('mouseleave', () => {
                image.classList.remove('hover-animation');
                setTimeout(() => {
                    image.classList.add('pulse-animation');
                }, 300);
            }, { passive: true });
        });
    }

    initScrollAnimations() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollAnimations() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Parallax effects for hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            const parallaxSpeed = scrollY * 0.5;
            heroSection.style.transform = `translateY(${parallaxSpeed}px)`;
        }
    }

    addAnimationStyles() {
        if (document.getElementById('enhanced-animations')) return;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'enhanced-animations';
        styleSheet.textContent = `
            .service-card, .portfolio-item, .about-content, .founder-card {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                           transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .fade-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(37, 216, 206, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(37, 216, 206, 0); }
                100% { box-shadow: 0 0 0 0 rgba(37, 216, 206, 0); }
            }
            
            @keyframes rotate {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(3deg); }
                75% { transform: rotate(-3deg); }
                100% { transform: rotate(0deg); }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .pulse-animation {
                animation: pulse 2s infinite;
            }
            
            .hover-animation {
                animation: rotate 0.5s ease;
                box-shadow: 0 0 30px rgba(37, 216, 206, 0.6);
                transform: scale(1.05);
            }
            
            .founder-card {
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .founder-card:hover {
                transform: translateY(-15px);
            }
            
            .slide-in-up {
                animation: slideInUp 0.6s ease forwards;
            }
            
            /* Loading states */
            .loading {
                position: relative;
                overflow: hidden;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            /* Smooth transitions for theme changes */
            * {
                transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        
        document.head.appendChild(styleSheet);
    }

    // Enhanced Typed Text with Error Handling
    initTypedText() {
        const element = document.getElementById('element');
        if (!element || typeof Typed === 'undefined') return;

        try {
            new Typed('#element', {
                strings: ['Code.', 'Evolve.', 'Repeat.', 'Innovate.', 'Create.'],
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 1000,
                startDelay: 500,
                loop: true,
                showCursor: true,
                cursorChar: '|',
                smartBackspace: true
            });
        } catch (error) {
            console.error('Error initializing Typed.js:', error);
            // Fallback to simple text rotation
            this.initSimpleTextRotation(element);
        }
    }

    initSimpleTextRotation(element) {
        const texts = ['Code.', 'Evolve.', 'Repeat.', 'Innovate.', 'Create.'];
        let currentIndex = 0;
        
        setInterval(() => {
            element.textContent = texts[currentIndex];
            currentIndex = (currentIndex + 1) % texts.length;
        }, 2000);
    }

    // Service Worker for Performance
    initServiceWorker() {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Cleanup method for page unload
    cleanup() {
        // Clear intervals and observers
        this.state.observers.forEach(observer => observer.disconnect());
        this.state.animations.forEach(animation => animation.cancel && animation.cancel());
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize the website manager
const websiteManager = new WebsiteManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    websiteManager.cleanup();
});

// Export for potential external use
window.WebsiteManager = WebsiteManager;