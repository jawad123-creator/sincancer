(() => {
  const byId = (id) => document.getElementById(id);
  const feedback = byId('share-feedback');
  const announce = (message) => { if (feedback) feedback.textContent = message; };
  const copyLink = async () => {
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement('textarea');
        field.value = url; field.setAttribute('readonly', '');
        field.style.position = 'absolute'; field.style.left = '-9999px';
        document.body.appendChild(field); field.select();
        const ok = document.execCommand('copy'); field.remove();
        if (!ok) throw new Error('No se pudo copiar');
      }
      announce('Enlace copiado. ¡Gracias por compartir!');
    } catch {
      announce('No se pudo copiar automáticamente. Copia la dirección desde la barra del navegador.');
    }
  };
  const share = async () => {
    const data = { title: document.title, text: 'Información sobre el cáncer y transparencia en las donaciones.', url: window.location.href.split('#')[0] };
    if (navigator.share) {
      try { await navigator.share(data); } catch (error) { if (error.name !== 'AbortError') announce('No se pudo abrir el menú para compartir.'); }
    } else {
      await copyLink();
    }
  };
  byId('copy-link')?.addEventListener('click', copyLink);
  byId('share-hero')?.addEventListener('click', share);
  byId('native-share')?.addEventListener('click', share);
  const year = byId('year');
  if (year) year.textContent = new Date().getFullYear();

  // No analytics or advertising scripts are loaded by this starter site.
  // Add a provider only after reviewing its terms and configuring valid consent.
  const banner = byId('cookie-banner');
  const settings = byId('cookie-settings');
  const storeChoice = (choice) => {
    try { localStorage.setItem('sincancer-cookie-choice', choice); } catch {}
    if (banner) banner.hidden = true;
  };
  const showBanner = () => { if (banner) banner.hidden = false; };
  let savedChoice = null;
  try { savedChoice = localStorage.getItem('sincancer-cookie-choice'); } catch {}
  if (!savedChoice) showBanner();
  byId('accept-cookies')?.addEventListener('click', () => storeChoice('accepted-optional'));
  byId('reject-cookies')?.addEventListener('click', () => storeChoice('essential-only'));
  settings?.addEventListener('click', showBanner);
})();