/**
 * Contact form: prefill from `?topic=&item=`, validation with errors under each field,
 * and an honest submit. With PUBLIC_FORM_ENDPOINT set the form is POSTed as JSON and
 * reports success only after a 2xx response; without it the visitor's e-mail program
 * opens with the message ready, and the status line says exactly that.
 */

import { fill } from '../i18n/fill';
import type { Topic } from '../i18n/routes';

type ErrorKey = 'name' | 'contact' | 'phone' | 'email' | 'message' | 'consent';

interface FormConfig {
  endpoint: string;
  email: string;
  phone: string;
  locale: string;
  /** Item names for `?item=`, per topic (offer departments under equipment, rental equipment under rental). */
  items: Partial<Record<Topic, Record<string, string>>>;
  topics: Record<Topic, string>;
  prefill: Record<'equipment' | 'equipmentGeneral' | 'rental' | 'rentalGeneral' | 'advice' | 'funding', string>;
  errors: Record<ErrorKey | 'summary', string>;
  status: Record<'sending' | 'success' | 'error' | 'mailto', string>;
  mail: { subject: string; consentYes: string; labels: Record<'name' | 'phone' | 'email' | 'topic' | 'message', string> };
}

/** Own-property lookup: query values such as `constructor` or `__proto__` never match. */
const own = <T>(record: Record<string, T> | undefined, key: string | null): T | undefined =>
  record && key !== null && Object.hasOwn(record, key) ? record[key] : undefined;

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) setUp(form);

function setUp(form: HTMLFormElement): void {
  const config = JSON.parse(form.dataset.config ?? '{}') as FormConfig;
  const control = <T extends HTMLElement>(name: string) => form.elements.namedItem(name) as T;
  const name = control<HTMLInputElement>('name');
  const phone = control<HTMLInputElement>('phone');
  const email = control<HTMLInputElement>('email');
  const topic = control<HTMLSelectElement>('topic');
  const message = control<HTMLTextAreaElement>('message');
  const consent = control<HTMLInputElement>('consent');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  let attempted = false;

  // JavaScript takes over validation; without it the browser's own checks and mailto: action apply.
  form.noValidate = true;

  // --- Prefill from the button that led here --------------------------------
  const params = new URLSearchParams(window.location.search);
  const requestedItem = params.get('item');

  /** The suggested message for a topic; names the item from the link when it belongs to that topic. */
  function templateFor(chosen: string): string {
    const item = own(config.items[chosen as Topic], requestedItem);
    const templates: Partial<Record<Topic, string>> = {
      equipment: item ? fill(config.prefill.equipment, { item }) : config.prefill.equipmentGeneral,
      rental: item ? fill(config.prefill.rental, { item }) : config.prefill.rentalGeneral,
      advice: config.prefill.advice,
      funding: config.prefill.funding,
    };
    return own(templates, chosen) ?? '';
  }

  // The text the form wrote itself. While the message still equals it (or is empty), changing the
  // topic swaps in the new topic's suggestion; once the visitor writes their own text, it is never replaced.
  let lastGenerated = '';
  const suggest = (chosen: string) => {
    if (message.value.trim() !== '' && message.value !== lastGenerated) return;
    lastGenerated = templateFor(chosen);
    // Setting the value does not move focus (it stays on the select) and fires no input event.
    message.value = lastGenerated;
  };

  const requested = params.get('topic');
  if (requested && own(config.topics, requested) !== undefined) {
    topic.value = requested;
    suggest(requested);
  }
  // Runs before the form-level `change` listener below, so validation sees the new message.
  topic.addEventListener('change', () => suggest(topic.value));

  // --- Validation -------------------------------------------------------------
  function validate(): Partial<Record<ErrorKey, string>> {
    const errors: Partial<Record<ErrorKey, string>> = {};
    const phoneValue = phone.value.trim();
    const emailValue = email.value.trim();
    if (!name.value.trim()) errors.name = config.errors.name;
    if (!phoneValue && !emailValue) errors.contact = config.errors.contact;
    if (phoneValue && phoneValue.replace(/\D/g, '').length < 9) errors.phone = config.errors.phone;
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) errors.email = config.errors.email;
    if (!message.value.trim()) errors.message = config.errors.message;
    if (!consent.checked) errors.consent = config.errors.consent;
    return errors;
  }

  function showErrors(errors: Partial<Record<ErrorKey, string>>): void {
    form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((element) => {
      const text = errors[element.dataset.errorFor as ErrorKey];
      element.textContent = text ?? '';
      element.hidden = !text;
    });
    const invalid: [HTMLElement, boolean][] = [
      [name, Boolean(errors.name)],
      [phone, Boolean(errors.phone || errors.contact)],
      [email, Boolean(errors.email || errors.contact)],
      [message, Boolean(errors.message)],
      [consent, Boolean(errors.consent)],
    ];
    for (const [element, isInvalid] of invalid) {
      if (isInvalid) element.setAttribute('aria-invalid', 'true');
      else element.removeAttribute('aria-invalid');
    }
  }

  function setStatus(text: string, state: 'error' | 'sending' | 'success' | 'info' | 'none'): void {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = state;
  }

  // After the first attempt, errors update as the visitor corrects the fields.
  const revalidate = () => {
    if (!attempted) return;
    const errors = validate();
    showErrors(errors);
    if (Object.keys(errors).length === 0 && status?.dataset.state === 'error') setStatus('', 'none');
  };
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);

  // --- Submit -----------------------------------------------------------------
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    attempted = true;
    const errors = validate();
    showErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus(config.errors.summary, 'error');
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const data = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      topic: topic.value,
      message: message.value.trim(),
      consent: true,
      locale: config.locale,
      page: window.location.href,
    };

    if (config.endpoint) {
      setStatus(config.status.sending, 'sending');
      if (submit) submit.disabled = true;
      try {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        attempted = false;
        setStatus(config.status.success, 'success');
      } catch {
        setStatus(fill(config.status.error, { phone: config.phone }), 'error');
      } finally {
        if (submit) submit.disabled = false;
      }
      return;
    }

    const { labels } = config.mail;
    const topicLabel = own(config.topics, data.topic) ?? data.topic;
    const body = [
      `${labels.name}: ${data.name}`,
      data.phone ? `${labels.phone}: ${data.phone}` : null,
      data.email ? `${labels.email}: ${data.email}` : null,
      `${labels.topic}: ${topicLabel}`,
      '',
      `${labels.message}:`,
      data.message,
      '',
      config.mail.consentYes,
    ]
      .filter((line) => line !== null)
      .join('\r\n');
    const subject = `${config.mail.subject}: ${topicLabel}`;
    window.location.href = `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(fill(config.status.mailto, { email: config.email, phone: config.phone }), 'info');
  });
}
