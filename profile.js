const form = document.querySelector('#lead-form');
const status = document.querySelector('#lead-status');
const share = document.querySelector('#share');
const shareStatus = document.querySelector('#share-status');

if (location.protocol === 'https:' && (navigator.share || navigator.clipboard)) {
  share.hidden = false;
  share.addEventListener('click', async () => {
    const url = new URL(location.pathname, location.origin);
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: url.href });
      } else {
        await navigator.clipboard.writeText(url.href);
        shareStatus.textContent = 'Profile link copied.';
      }
    } catch (error) {
      if (error.name !== 'AbortError') shareStatus.textContent = 'Copy this page’s address to share it.';
    }
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  button.disabled = true;
  status.textContent = 'Sending…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(new FormData(form)),
      signal: AbortSignal.timeout(12000)
    });
    if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error();
    const data = await response.json();
    if (!response.ok || data.saved !== true) {
      status.textContent = data.message || 'Delivery could not be confirmed. Try again or email me directly.';
      return;
    }
    form.reset();
    status.textContent = 'Thanks. Your details were received.';
  } catch {
    status.textContent = 'Delivery could not be confirmed. Try again or email me directly.';
  } finally {
    button.disabled = false;
  }
});
