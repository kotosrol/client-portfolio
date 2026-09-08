const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

const setMenu = (open) => {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
};

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

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
  let activeStep = 1;

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
    const message = messageLines.join('\n');

    summary.textContent = `${service}. ${stage}. ${priority}.${details ? `\n${details}` : ''}`;
    telegramLink.href = `https://t.me/kotosrol?text=${encodeURIComponent(message)}`;
    steps.forEach((step) => { step.hidden = true; });
    controls.hidden = true;
    result.hidden = false;
    progress.style.width = '100%';
    result.querySelector('a').focus({ preventScroll: true });
  };

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
    steps[activeStep - 1].querySelector('legend')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  backButton.addEventListener('click', () => {
    if (activeStep === 1) return;
    activeStep -= 1;
    syncStep();
  });

  resetButton.addEventListener('click', () => {
    result.hidden = true;
    controls.hidden = false;
    activeStep = 1;
    syncStep();
    steps[0].querySelector('input:checked')?.focus({ preventScroll: true });
  });

  document.querySelectorAll('[data-preset]').forEach((link) => {
    link.addEventListener('click', () => {
      const input = form.querySelector(`[data-service="${link.dataset.preset}"]`);
      if (!input) return;
      input.checked = true;
      activeStep = 1;
      result.hidden = true;
      controls.hidden = false;
      syncStep();
    });
  });

  syncStep();
}
