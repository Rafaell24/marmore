document.addEventListener('DOMContentLoaded', () => {
    // Initial run of page content on first direct load
    initPageContent();

    // Configure Swup v4
    if (typeof Swup !== 'undefined') {
        const swupOptions = {
            // Enable native View Transitions API when supported
            native: true,
            // Match the main container id
            containers: ['#swup']
        };

        // Inject Preload Plugin if loaded
        if (typeof SwupPreloadPlugin !== 'undefined') {
            swupOptions.plugins = [new SwupPreloadPlugin()];
        }

        const swup = new Swup(swupOptions);

        // Run non-GSAP page initializers after content is replaced
        swup.hooks.on('page:view', () => {
            initNonGsapContent();
        });

        // Run GSAP initializers only after the transition animation is complete and stable
        swup.hooks.on('visit:end', () => {
            initGsapContent();
        });
    }
});

/* ==========================================================================
   PAGE RE-INITIALIZERS
   ========================================================================== */
// Centralized function to initialize all content on first page load
function initPageContent() {
    initNonGsapContent();
    initGsapContent();
}

// Initialize static components immediately when DOM is replaced
function initNonGsapContent() {
    initMobileMenu();
    initScrollReveals();
    initPortfolioCarousel();
    initContactForm();

    // Check navbar states immediately
    checkNavbarScroll();
    highlightActiveLink();
}

// Initialize dynamic layout/scroll-dependent elements after transition completes
function initGsapContent() {
    // Kill existing ScrollTriggers to prevent layout/scroll stutters
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    initVideoScrub();
    handleScrollZoom();
    
    // Recalculate ScrollTrigger positions
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }

    // Scroll to URL hash target after ScrollTrigger has updated positions
    handleHashScroll();
}

/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinksList = document.querySelectorAll('.nav-link');

    if (mobileMenuToggle && navMenu) {
        // Reset state on load
        navMenu.classList.remove('is-active');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars-staggered';

        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-active');
            if (navMenu.classList.contains('is-active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars-staggered';
            }
        });

        // Close menu when clicking a link
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-active');
                if (icon) icon.className = 'fa-solid fa-bars-staggered';
            });
        });
    }
}

/* ==========================================================================
   INTERSECTION OBSERVER FOR SCROLL REVEALS
   ========================================================================== */
function initScrollReveals() {
    const revealElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .reveal-scale'
    );

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

/* ==========================================================================
   GSAP + VIDEO HERO SCROLL SEQUENCE
   ========================================================================== */
function initVideoScrub() {
    const video = document.getElementById('hero-video');
    if (!video) return;

    // Ensure video is muted and paused
    video.muted = true;
    video.pause();

    if (video.readyState >= 1) {
        setupVideoScrollTrigger(video);
    } else {
        video.addEventListener('loadedmetadata', () => setupVideoScrollTrigger(video));
    }
}

function setupVideoScrollTrigger(video) {
    const videoDuration = video.duration || 8;
    video.currentTime = 0;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Pin presenting section and scrub through the video timeline
        gsap.to(video, {
            currentTime: videoDuration,
            ease: "none",
            scrollTrigger: {
                trigger: "#apresentacao",
                start: "top top",
                end: "+=300%", // Scroll distance for scrubbing
                scrub: 0.1,    // Very responsive but smooth scrubbing
                pin: true,
                invalidateOnRefresh: true
            }
        });

        // Fade out hero text on scroll start
        gsap.to(".hero-content", {
            opacity: 0,
            y: -50,
            ease: "power1.out",
            scrollTrigger: {
                trigger: "#apresentacao",
                start: "top top",
                end: "+=40%",
                scrub: true
            }
        });

        // Fade out scroll indicator
        gsap.to(".scroll-indicator", {
            opacity: 0,
            ease: "power1.out",
            scrollTrigger: {
                trigger: "#apresentacao",
                start: "top top",
                end: "+=20%",
                scrub: true
            }
        });
    }
}

/* ==========================================================================
   PORTFOLIO INFINITE CAROUSEL CLONING
   ========================================================================== */
function initPortfolioCarousel() {
    const portfolioTrack = document.getElementById('portfolio-track');
    if (portfolioTrack) {
        // Filter out clones to prevent infinite duplicating if re-run
        const originalCards = Array.from(portfolioTrack.children).filter(
            card => !card.hasAttribute('aria-hidden')
        );
        
        // Clear track and re-append original cards to ensure clean state
        portfolioTrack.innerHTML = '';
        originalCards.forEach(card => {
            portfolioTrack.appendChild(card);
        });

        // Clone and append to create the perfect duplicate loop
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('tabindex', '-1');
            portfolioTrack.appendChild(clone);
        });
    }
}

/* ==========================================================================
   CONTACT FORM SUBMISSION TO WHATSAPP
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('quote-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const telefone = document.getElementById('form-phone').value;

        const stoneSelect = document.getElementById('form-stone');
        const pedra = stoneSelect.options[stoneSelect.selectedIndex].text;

        const mensagemProjeto = document.getElementById('form-message').value;

        const mensagem = `
*Nova Solicitação de Orçamento*

👤 Nome: ${nome}

📧 E-mail: ${email}

📱 WhatsApp: ${telefone}

🪨 Pedra de Interesse: ${pedra}

📝 Detalhes do Projeto:
${mensagemProjeto}
`;

        const numeroWhatsapp = '5511975030220';
        const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, '_blank');
        form.reset();
    });
}

/* ==========================================================================
   GLOBAL LISTENERS AND UTILITIES
   ========================================================================== */
function checkNavbarScroll() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;

    if (window.scrollY > 40) {
        navbar.classList.add('is-scrolled');
    } else {
        navbar.classList.remove('is-scrolled');
    }
}

function highlightActiveLink() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;

    const sections = document.querySelectorAll('section');
    const navLinksList = navbar.querySelectorAll('.nav-link');
    let scrollPosition = window.scrollY + 200; // Offset for triggers

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinksList.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href') === `index.html#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

function handleScrollZoom() {
    const scrollZoomImages = document.querySelectorAll('.scroll-zoom');
    scrollZoomImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        if (rect.top < viewHeight && rect.bottom > 0) {
            const totalProgressDistance = viewHeight + rect.height;
            const progressPercentage = (viewHeight - rect.top) / totalProgressDistance;
            const scaleAmount = 1 + (progressPercentage * 0.08);
            const translateYAmount = (progressPercentage - 0.5) * 30;
            img.style.transform = `scale(${scaleAmount}) translateY(${translateYAmount}px)`;
        }
    });
}

function handleHashScroll() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 500);
        }
    }
}

// Global window event listeners (registered once)
function handleGlobalScroll() {
    checkNavbarScroll();
    highlightActiveLink();
    handleScrollZoom();
}
window.addEventListener('scroll', handleGlobalScroll);

window.addEventListener('load', () => {
    handleHashScroll();
});
