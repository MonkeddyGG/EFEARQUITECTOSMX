/**
 * EF Arquitectos MX - Lógica de Interfaz y Cotizador
 * Arquitectura modular Vanilla ES6+ desacoplada de la vista.
 */

document.addEventListener('DOMContentLoaded', () => {
    const COMPANY_PHONE = '529931471682'; // Teléfono oficial EF Arquitectos MX

    // 1. Año dinámico en Footer
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. Menú Responsivo Móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 3. Filtrado de Galería de Proyectos
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery__item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            galleryItems.forEach(item => {
                const matches = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('hide', !matches);
            });
        });
    });

    // 4. Lightbox Modal para Inspección de Proyectos
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4')?.textContent || '';
            if (!img || !lightbox) return;

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = title;
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.hidden = true;
        document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
    });

    // 5. Calculadora de Cotización Preliminar en Tiempo Real
    const serviceSelect = document.getElementById('serviceType');
    const areaRange = document.getElementById('areaRange');
    const areaValue = document.getElementById('areaValue');
    const estimatedPrice = document.getElementById('estimatedPrice');

    const formatMXN = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateEstimate = () => {
        if (!serviceSelect || !areaRange || !estimatedPrice) return 0;
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        const ratePerSqm = Number(selectedOption.dataset.rate || 0);
        const area = Number(areaRange.value || 0);
        const total = ratePerSqm * area;

        if (areaValue) areaValue.textContent = `${area} m²`;
        estimatedPrice.textContent = `${formatMXN(total)} MXN`;
        return total;
    };

    if (serviceSelect && areaRange) {
        serviceSelect.addEventListener('change', calculateEstimate);
        areaRange.addEventListener('input', calculateEstimate);
        calculateEstimate();
    }

    // 6. Envío de Cotización Estructurada a WhatsApp
    const quoteForm = document.getElementById('quoteForm');
    const formFeedback = document.getElementById('formFeedback');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('clientName').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
            const area = areaRange.value;
            const details = document.getElementById('projectDetails').value.trim();
            const estimate = estimatedPrice.textContent;

            if (!name || !phone) {
                formFeedback.textContent = 'Por favor completa tu nombre y teléfono para continuar.';
                formFeedback.style.color = '#b91c1c';
                return;
            }

            formFeedback.textContent = 'Redirigiendo a WhatsApp de EF Arquitectos MX...';
            formFeedback.style.color = '#15803d';

            const message = [
                `Hola *EF Arquitectos MX*, solicito información para un proyecto:`,
                `• *Cliente:* ${name}`,
                `• *Teléfono:* ${phone}`,
                `• *Servicio:* ${serviceText}`,
                `• *Superficie aprox.:* ${area} m²`,
                `• *Estimado web:* ${estimate}`,
                details ? `• *Detalles:* ${details}` : ''
            ].filter(Boolean).join('\n');

            const whatsappUrl = `https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        });
    }
});