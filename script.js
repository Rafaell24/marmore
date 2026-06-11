document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       STICKY / CAPSULE NAVBAR SCROLL EFFECT
       ========================================================================== */
    const navbar = document.getElementById('main-navbar');

    function checkNavbarScroll() {
        if (window.scrollY > 40) {
            navbar.classList.add('is-scrolled');
        } else {
            navbar.classList.remove('is-scrolled');
        }
    }

    // Initial check in case of page refresh/reload while scrolled
    checkNavbarScroll();
    window.addEventListener('scroll', checkNavbarScroll);

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinksList = document.querySelectorAll('.nav-link');

    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('is-active');
        // Toggle icon between hamburger and close
        const icon = mobileMenuToggle.querySelector('i');
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
            mobileMenuToggle.querySelector('i').className = 'fa-solid fa-bars-staggered';
        });
    });

    /* ==========================================================================
       ACTIVE LINK HIGHLIGHT ON SCROLL
       ========================================================================== */
    const sections = document.querySelectorAll('section');

    function highlightActiveLink() {
        let scrollPosition = window.scrollY + 200; // Offset for triggers

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinksList.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveLink);

    /* ==========================================================================
       INTERSECTION OBSERVER FOR SCROLL REVEALS
       ========================================================================== */
    const revealElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .reveal-scale'
    );

    const observerOptions = {
        root: null, // viewport
        threshold: 0.1, // trigger when 10% is visible
        rootMargin: '0px 0px -50px 0px' // offset bottom slightly
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Once it is revealed, we can stop observing it
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* ==========================================================================
       GSAP + CANVAS HERO SCROLL SEQUENCE
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    const canvas = document.getElementById('hero-canvas');
    const context = canvas.getContext('2d');

    const frameCount = 147;
    const preloadedImages = [];
    let currentFrameIndex = 0;

    // Cover rendering logic
    function renderFrame(index) {
        if (!preloadedImages[index]) return;
        currentFrameIndex = index;
        const img = preloadedImages[index];

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Clear canvas
        context.clearRect(0, 0, w, h);

        const canvasRatio = w / h;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawWidth = w;
            drawHeight = w / imgRatio;
            drawX = 0;
            drawY = (h - drawHeight) / 2;
        } else {
            drawWidth = h * imgRatio;
            drawHeight = h;
            drawX = (w - drawWidth) / 2;
            drawY = 0;
        }

        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }

    function resizeCanvas() {
        const scale = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
        context.scale(scale, scale);
        renderFrame(currentFrameIndex);
    }

    // Preload all 25 images
    function preloadImages(callback) {
        let loadedCount = 0;
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = `frame/IMG${i}.jpg`;
            img.onload = () => {
                loadedCount++;
                preloadedImages[i - 1] = img;

                // Render frame 0 immediately when loaded
                if (i === 1 && currentFrameIndex === 0) {
                    renderFrame(0);
                }

                if (loadedCount === frameCount) {
                    callback();
                }
            };
            img.onerror = () => {
                console.error(`Error preloading image frame/IMG${i}.jpg`);
                loadedCount++;
                if (loadedCount === frameCount) {
                    callback();
                }
            };
        }
    }

    // Initialize Canvas Size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Preload and initialize GSAP timeline
    preloadImages(() => {
        // Initial render of first frame once everything is loaded
        renderFrame(0);

        const scrollSequence = { frame: 0 };

        // Pin presenting section and scrub through images
        gsap.to(scrollSequence, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: "#apresentacao",
                start: "top top",
                end: "+=200%",
                scrub: 0.5,
                pin: true,
                onUpdate: () => {
                    renderFrame(Math.round(scrollSequence.frame));
                }
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
    });

    /* ==========================================================================
       DYNAMIC IMAGE ZOOM/PARALLAX ON SCROLL (Services Section)
       ========================================================================== */
    const scrollZoomImages = document.querySelectorAll('.scroll-zoom');

    window.addEventListener('scroll', () => {
        scrollZoomImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Check if image is within the visible viewport
            if (rect.top < viewHeight && rect.bottom > 0) {
                // Calculate percentage of element progression in viewport (0 to 1)
                const totalProgressDistance = viewHeight + rect.height;
                const progressPercentage = (viewHeight - rect.top) / totalProgressDistance;

                // Fine-tune scale: range from 1.0 to 1.08
                const scaleAmount = 1 + (progressPercentage * 0.08);

                // Fine-tune vertical shift for slow parallax effect (range: -15px to 15px)
                const translateYAmount = (progressPercentage - 0.5) * 30;

                img.style.transform = `scale(${scaleAmount}) translateY(${translateYAmount}px)`;
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('quote-form');

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

        const numeroWhatsapp = '5511975030220'; // Seu número

        const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, '_blank');

        form.reset();
    });

});

window.addEventListener('load', () => {
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
});


