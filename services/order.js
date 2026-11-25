const form = document.querySelector('#service-form');
const service = form.elements.service;
const details = form.elements.details;
const result = form.querySelector('.order-result');
const draft = document.querySelector('#draft');
const draftLink = document.querySelector('#draft-link');
const status = form.querySelector('.order-status');
const telegramUrl = 'https://t.me/kotosrol';
const submitButton = form.querySelector('[type="submit"]');

function selectService(value) {
  if ([...service.options].some(option => option.value === value && value)) {
    service.value = value;
    result.hidden = true;
  }
}

selectService(new URLSearchParams(window.location.search).get('service'));

for (const link of document.querySelectorAll('[data-service]')) {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectService(link.dataset.service);
    window.history.replaceState(null, '', link.href);
    document.querySelector('#order').scrollIntoView();
    service.focus({ preventScroll: true });
  });
}

form.addEventListener('input', () => {
  result.hidden = true;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const message = ['Здравствуйте, Александр! Хочу обсудить услугу.', 'Что нужно: ' + service.selectedOptions[0].textContent + '.'];
  const description = details.value.trim();
  if (description) message.push('Задача: ' + description);
  draft.textContent = message.join('\n');
  draftLink.href = telegramUrl + '?text=' + encodeURIComponent(draft.textContent);
  status.textContent = '';
  result.hidden = false;
  draftLink.focus();
});

form.querySelector('.order-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draft.textContent);
    status.textContent = 'Сообщение скопировано.';
  } catch {
    status.textContent = 'Выделите и скопируйте текст черновика выше.';
  }
});

submitButton.disabled = false;

