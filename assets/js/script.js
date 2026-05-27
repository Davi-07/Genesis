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
    const strokeColor = isScrolled ? 'var(--muted-foreground)' : 'currentColor';

    if (isOpen) {
        menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    } else {
        menuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    }
}

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
        mobileMenu.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
        mobileMenu.classList.remove('scrolled');
    }

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

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    atualizarIconeMenu();
});

allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu.classList.remove('open');
        atualizarIconeMenu();

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
        observer.unobserve(entry.target);
    });
}, appearOptions);

fadeUpElements.forEach(el => {
    appearOnScroll.observe(el);
});

setTimeout(() => {
    fadeUpElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('is-visible');
        }
    });
}, 100);


// ==========================================
// Máscara de Telefone (Ghost Text)
// ==========================================
const MASK = '(00) 00000-0000';
const phoneInput = document.getElementById('phone');
const ghostTyped = document.getElementById('ghost-typed');
const ghostRemaining = document.getElementById('ghost-remaining');
const phoneStatus = document.getElementById('phone-status');

if (phoneInput && ghostTyped && ghostRemaining) {
    function applyMask(digits) {
        let result = '', di = 0;
        for (let i = 0; i < MASK.length && di < digits.length; i++) {
            result += MASK[i] === '0' ? digits[di++] : MASK[i];
        }
        return result;
    }

    function updateGhost(formatted) {
        ghostTyped.textContent = MASK.slice(0, formatted.length);
        ghostRemaining.textContent = MASK.slice(formatted.length);
    }

    phoneInput.addEventListener('input', () => {
        const raw = phoneInput.value.replace(/\D/g, '').slice(0, 11);
        phoneInput.value = applyMask(raw);
        updateGhost(phoneInput.value);
        if (phoneStatus) phoneStatus.textContent = '';
    });

    phoneInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newRaw = phoneInput.value.replace(/\D/g, '').slice(0, -1);
            phoneInput.value = applyMask(newRaw);
            updateGhost(phoneInput.value);
        }
    });
}

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
            // ATENÇÃO AQUI: Pegamos o valor do id="phone", mas enviamos com a chave "email" 
            // para não quebrar a API e a Planilha que você já configurou.
            email: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            token: document.querySelector('[name="cf-turnstile-response"]')?.value 
        };

        const phoneRegex = /^\(?\d{2}\)?\s?(9?\d{4})-?\d{4}$/;
        
        if (!phoneRegex.test(formData.email)) {
            formStatus.innerText = 'Por favor, insira um telefone válido com DDD (ex: (31) 99999-9999).';
            formStatus.style.color = 'red';
            return; 
        }

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
                // Limpa o ghost text após enviar
                if (ghostTyped && ghostRemaining) updateGhost(''); 
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