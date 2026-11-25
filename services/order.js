const form = document.querySelector('#service-form');
const services = Array.from(form.querySelectorAll('[name="service"]'));
const details = form.querySelector('#details');
const fields = form.querySelector('.order-fields');
const result = form.querySelector('.order-result');
const draft = document.querySelector('#draft');
const draftLink = document.querySelector('#draft-link');
const status = form.querySelector('.order-status');
const telegramUrl = draftLink.href;
const submitButton = form.querySelector('[type="submit"]');

function selectService(value) {
  const choice = services.find(radio => radio.value === value);
  services.forEach(radio => { radio.checked = radio === choice; });
  fields.hidden = false;
  result.hidden = true;
  return choice;
}

const serviceFromLocation = () => selectService(new URLSearchParams(window.location.search).get('service'));
serviceFromLocation();
window.addEventListener('popstate', serviceFromLocation);

for (const link of document.querySelectorAll('[data-service]')) {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const choice = selectService(link.dataset.service);
    if (link.href !== window.location.href) window.history.pushState(null, '', link.href);
    document.querySelector('#order').scrollIntoView({ block: 'start' });
    choice?.focus({ preventScroll: true });
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const checked = services.find(radio => radio.checked);
  if (!checked) return;
  const serviceName = checked.labels[0].textContent.trim();
  const message = ['Здравствуйте, Александр! Хочу обсудить услугу.', 'Что нужно: ' + serviceName + '.'];
  const description = details.value.trim();
  if (description) message.push('Задача: ' + description);
  draft.textContent = message.join('\n');
  draftLink.href = telegramUrl + '?text=' + encodeURIComponent(draft.textContent);
  status.hidden = true;
  fields.hidden = true;
  result.hidden = false;
  result.querySelector('h3').focus();
});

form.querySelector('.order-edit').addEventListener('click', () => {
  fields.hidden = false;
  result.hidden = true;
  details.focus();
});

form.querySelector('.order-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draft.textContent);
    status.textContent = 'Сообщение скопировано.';
  } catch {
    status.textContent = 'Выделите и скопируйте текст черновика выше.';
  }
  status.hidden = false;
});

submitButton.disabled = false;

