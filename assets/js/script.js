// ==========================================
// ==========================================
// Navbar Lógica (Scroll e Mobile Menu)
// ==========================================
const navbar = document.getElementById('navbar');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const allNavLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

function atualizarIconeMenu() {
    const isScrolled = window.scrollY > 20;
    const isOpen = mobileMenu.classList.contains('open');

    // Define a cor: muted-foreground se escrolado, currentColor se não
    const strokeColor = isScrolled ? 'var(--muted-foreground)' : 'currentColor';

    if (isOpen) {
        // Ícone de Fechar (X)
        menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"      stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></   line></svg>`;
    } else {
        // Ícone de Menu (Sanduíche)
        menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"      stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6"   x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    }
}



// Mudar fundo do Navbar no scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
        mobileMenu.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
        mobileMenu.classList.remove('scrolled');
    }

    // Atualiza o ícone sempre que rolar a página
    atualizarIconeMenu();


    let currentSectionId = '';

    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 150) {
            currentSectionId = section.getAttribute('id');
        }
    });

    allNavLinks.forEach(link => {
        link.classList.toggle(
            'is-active',
            link.getAttribute('href') === `#${currentSectionId}`
        );
    });  
});

// Toggle Menu Mobile
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');

    // Atualiza o ícone sempre que clicar no botão
    atualizarIconeMenu();
});

// Smooth scroll para todos os links e fechar mobile menu ao clicar
allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Fechar menu mobile
        mobileMenu.classList.remove('open');
        atualizarIconeMenu();

        // Smooth scroll
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ==========================================
// Intersection Observer (Animações de entrada)
// ==========================================
const fadeUpElements = document.querySelectorAll('.fade-up');

const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        // Para a animação rodar apenas uma vez (como viewport={{ once: true }} no Framer Motion)
        observer.unobserve(entry.target);
    });
}, appearOptions);

fadeUpElements.forEach(el => {
    appearOnScroll.observe(el);
});

// Disparar observer imediatamente para elementos do topo (Hero)
setTimeout(() => {
    fadeUpElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('is-visible');
        }
    });
}, 100);

// ==========================================
// Lógica de Envio do Formulário
// ==========================================
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            token: document.querySelector('[name="cf-turnstile-response"]')?.value 
        };

        if (!formData.token) {
            formStatus.innerText = 'Por favor, confirme que você não é um robô.';
            formStatus.style.color = 'red';
            return;
        }

        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'ENVIANDO...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                formStatus.innerText = 'Mensagem enviada com sucesso!';
                formStatus.style.color = 'var(--primary)';
                contactForm.reset();
            } else {
                throw new Error('Falha no servidor');
            }
        } catch (error) {
            formStatus.innerText = 'Ocorreu um erro ao enviar. Tente novamente.';
            formStatus.style.color = 'red';
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}