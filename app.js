const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const mobileViewport = window.matchMedia('(max-width: 860px)');
const background = document.querySelectorAll('.skip-link, .site-header .brand, main, footer');

const setMenu = (open) => {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.classList.toggle('is-open', open);
  mobileNav.inert = !open;
  background.forEach((element) => { element.inert = open; });
  document.body.classList.toggle('menu-open', open);
};

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  setMenu(open);
  if (open) mobileNav.querySelector('a')?.focus();
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenu(false);
    if (!link.getAttribute('href').startsWith('#')) return;
    const section = document.querySelector(link.hash);
    section?.setAttribute('tabindex', '-1');
    section?.focus({ preventScroll: true });
  });
});

document.addEventListener('keydown', (event) => {
  if (menuToggle?.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') {
    setMenu(false);
    menuToggle.focus();
  }
  if (event.key !== 'Tab') return;
  const links = mobileNav.querySelectorAll('a');
  if (event.shiftKey && document.activeElement === menuToggle) {
    event.preventDefault();
    links[links.length - 1]?.focus();
  } else if (!event.shiftKey && document.activeElement === links[links.length - 1]) {
    event.preventDefault();
    menuToggle.focus();
  }
});
mobileViewport.addEventListener('change', () => setMenu(false));
window.addEventListener('pageshow', () => setMenu(false));

const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.documentElement.classList.add('animate-reveal');
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());

const form = document.querySelector('[data-brief-form]');
if (form) {
  const steps = [...form.querySelectorAll('[data-step]')];
  const nextButton = form.querySelector('[data-next]');
  const backButton = form.querySelector('[data-back]');
  const controls = form.querySelector('[data-controls]');
  const result = form.querySelector('[data-result]');
  const summary = form.querySelector('[data-summary]');
  const telegramLink = form.querySelector('[data-telegram-link]');
  const resetButton = form.querySelector('[data-reset]');
  const progress = form.querySelector('[data-progress]');
  const copyButton = form.querySelector('[data-copy]');
  const copyStatus = form.querySelector('[data-copy-status]');
  let activeStep = 1;
  let draft = '';

  const focusStep = () => {
    const legend = steps[activeStep - 1].querySelector('legend');
    legend.setAttribute('tabindex', '-1');
    legend.focus();
  };

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft);
      copyStatus.textContent = 'Сообщение скопировано.';
    } catch {
      copyStatus.textContent = 'Копирование недоступно. Выделите текст сообщения выше.';
    }
  });

  const selectedValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const syncStep = () => {
    steps.forEach((step) => {
      const isActive = Number(step.dataset.step) === activeStep;
      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    });
    backButton.disabled = activeStep === 1;
    nextButton.disabled = !selectedValue(['service', 'stage', 'priority'][activeStep - 1]);
    nextButton.innerHTML = activeStep === 3 ? 'Собрать сообщение <span>→</span>' : 'Дальше <span>→</span>';
    progress.style.width = `${activeStep * 33.333}%`;
  };

  const finishBrief = () => {
    const service = selectedValue('service');
    const stage = selectedValue('stage');
    const priority = selectedValue('priority');
    const details = form.elements.details.value.trim();
    const messageLines = [
      'Здравствуйте, Александр! Хочу обсудить задачу.',
      `Что нужно: ${service}.`,
      `Сейчас: ${stage.toLowerCase()}.`,
      `Приоритет: ${priority.toLowerCase()}.`,
    ];
    if (details) messageLines.push(`Детали: ${details}`);
    draft = messageLines.join('\n');
    copyStatus.textContent = '';

    summary.textContent = draft;
    telegramLink.href = `https://t.me/kotosrol?text=${encodeURIComponent(draft)}`;
    steps.forEach((step) => { step.hidden = true; });
    controls.hidden = true;
    result.hidden = false;
    progress.style.width = '100%';
    result.querySelector('a').focus();
  };

  form.addEventListener('submit', (event) => event.preventDefault());

  form.addEventListener('change', (event) => {
    if (event.target.matches('input[type="radio"]')) syncStep();
  });

  nextButton.addEventListener('click', () => {
    if (nextButton.disabled) return;
    if (activeStep === 3) {
      finishBrief();
      return;
    }
    activeStep += 1;
    syncStep();
    focusStep();
  });

  backButton.addEventListener('click', () => {
    if (activeStep === 1) return;
    activeStep -= 1;
    syncStep();
    focusStep();
  });

  resetButton.addEventListener('click', () => {
    result.hidden = true;
    controls.hidden = false;
    activeStep = 1;
    syncStep();
    focusStep();
  });

  syncStep();
}
