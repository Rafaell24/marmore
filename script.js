

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
       GSAP + VIDEO HERO SCROLL SEQUENCE
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    const video = document.getElementById('hero-video');

    function initVideoScrub() {
        if (!video) return;

        // Ensure video is muted and paused
        video.muted = true;
        video.pause();

        if (video.readyState >= 1) {
            setupVideoScrollTrigger();
        } else {
            video.addEventListener('loadedmetadata', setupVideoScrollTrigger);
        }
    }

    function setupVideoScrollTrigger() {
        const videoDuration = video.duration || 8;
        video.currentTime = 0;

        // Pin presenting section and scrub through the video timeline
        gsap.to(video, {
            currentTime: videoDuration,
            ease: "none",
            scrollTrigger: {
                trigger: "#apresentacao",
                start: "top top",
                end: "+=300%", // Scroll distance for scrubbing (300% viewport height)
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

    initVideoScrub();

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


