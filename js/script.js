// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Dark mode toggle functionality
    const toggleSwitch = document.querySelector('#checkbox');
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = localStorage.getItem('theme');
    
    // Check for saved theme preference or respect OS preference
    if (currentTheme) {
        document.documentElement.classList.toggle('dark-mode', currentTheme === 'dark');
        toggleSwitch.checked = currentTheme === 'dark';
        updateThemeIcon(currentTheme === 'dark');
    } else {
        // Use OS preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark-mode', prefersDarkMode);
        toggleSwitch.checked = prefersDarkMode;
        updateThemeIcon(prefersDarkMode);
    }
    
    // Toggle theme on switch change
    toggleSwitch.addEventListener('change', switchTheme);
    
    function switchTheme(e) {
        const isDark = e.target.checked;
        document.documentElement.classList.toggle('dark-mode', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }
    
    function updateThemeIcon(isDark) {
        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Navigation functionality
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.getElementById('openMenu');
    const navLinks = document.getElementById('navLinks');
    const navLinksItems = document.querySelectorAll('.nav-links ul li a');

    // Toggle mobile menu
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Close menu when clicking on nav links
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('show');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && e.target !== menuBtn) {
            navLinks.classList.remove('show');
        }
    });

    // Change navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Portfolio filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(filterBtn => {
                filterBtn.classList.remove('active');
            });
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Form submission
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.getElementById('newsletterForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Show loading indicator
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Send data to backend API
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    alert(`Thank you for your message, ${name}! We will get back to you soon.`);
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error
                    alert('There was an error sending your message. Please try again.');
                    console.error('Error:', data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error sending your message. Please try again.');
            })
            .finally(() => {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get email
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Show loading indicator
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            // Send data to backend API
            fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    alert(`Thank you for subscribing with ${email}! You'll receive our newsletter soon.`);
                    
                    // Reset form
                    newsletterForm.reset();
                } else {
                    // Show error or already subscribed message
                    alert(data.message || 'There was an error subscribing to the newsletter. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error subscribing to the newsletter. Please try again.');
            })
            .finally(() => {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Testimonial slider
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    
    if (testimonials.length > 1) {
        // Only setup slider if there are multiple testimonials
        setInterval(() => {
            testimonials[currentTestimonial].style.display = 'none';
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = 'block';
        }, 5000);
    }

    // Initialize all testimonials except first to be hidden
    if (testimonials.length > 0) {
        testimonials.forEach((item, index) => {
            if (index !== 0) {
                item.style.display = 'none';
            }
        });
    }

    // Add active class to navigation based on scroll position
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinksItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Animation on scroll
    const fadeElements = document.querySelectorAll('.service-card, .portfolio-item, .about-content, .founder-card');
    
    const fadeIn = () => {
        fadeElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Founder image animation
    const founderImages = document.querySelectorAll('.founder-img');
    
    // Apply pulse animation
    founderImages.forEach(image => {
        image.classList.add('pulse-animation');
        
        // Add staggered entrance animations
        const delay = Array.from(founderImages).indexOf(image) * 200;
        image.style.transitionDelay = `${delay}ms`;
        
        // Add interactive effect on hover
        image.addEventListener('mouseenter', () => {
            image.classList.remove('pulse-animation');
            image.classList.add('hover-animation');
        });
        
        image.addEventListener('mouseleave', () => {
            image.classList.remove('hover-animation');
            setTimeout(() => {
                image.classList.add('pulse-animation');
            }, 300);
        });
    });
    
    // Initial check
    fadeIn();
    
    // Check on scroll
    window.addEventListener('scroll', fadeIn);
});

// Add CSS to make animation work (adding directly to script to avoid additional file)
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .service-card, .portfolio-item, .about-content, .founder-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(37, 216, 206, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(37, 216, 206, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(37, 216, 206, 0);
            }
        }
        
        @keyframes rotate {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(3deg); }
            75% { transform: rotate(-3deg); }
            100% { transform: rotate(0deg); }
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
        
        .hover-animation {
            animation: rotate 0.5s ease;
            box-shadow: 0 0 30px rgba(37, 216, 206, 0.6);
        }
        
        .founder-card {
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .founder-card:hover {
            transform: translateY(-15px);
        }
    </style>
`); 

document.addEventListener("DOMContentLoaded", function () {
    var typed = new Typed('#element', {
      strings: ['Code.', 'Evolve.', 'Repeat.'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true
    });
  });