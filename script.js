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

  const banner = byId('cookie-banner');
  const settings = byId('cookie-settings');
  const adSlots = {
    'banner-300x250': { key: 'f177569624c6dd37ca61725706854f70', width: 300, height: 250 },
    'banner-728x90': { key: '4dc1319aa7ca2d9e4cee5cd26c710cf9', width: 728, height: 90 },
    'banner-320x50': { key: '3f17c555bf8527101418eba1f505d7d4', width: 320, height: 50 }
  };
  let adsLoaded = false;
  const loadAds = () => {
    if (adsLoaded) return;
    adsLoaded = true;
    // Load each provider script one at a time so its global atOptions isn't overwritten.
    const slots = Object.entries(adSlots);
    const loadNext = (index) => {
      if (index >= slots.length) return;
      const [slotId, config] = slots[index];
      const slot = document.querySelector('[data-ad="' + slotId + '"]');
      if (!slot) return loadNext(index + 1);
      const frame = document.createElement('iframe');
      frame.title = 'Anuncio';
      frame.width = String(config.width);
      frame.height = String(config.height);
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      frame.style.cssText = 'border:0;max-width:100%;overflow:hidden';
      slot.appendChild(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><script>var atOptions={key:"' + config.key + '",format:"iframe",height:' + config.height + ',width:' + config.width + ',params:{}};<\\/script><script src="https://www.highrevenueformat.com/' + config.key + '/invoke.js"><\\/script></body></html>');
      doc.close();
      loadNext(index + 1);
    };
    loadNext(0);
  };
  const storeChoice = (choice) => {
    try { localStorage.setItem('sincancer-cookie-choice', choice); } catch {}
    if (banner) banner.hidden = true;
    if (choice === 'accepted-optional') loadAds();
  };
  const showBanner = () => { if (banner) banner.hidden = false; };
  let savedChoice = null;
  try { savedChoice = localStorage.getItem('sincancer-cookie-choice'); } catch {}
  if (!savedChoice) showBanner();
  else if (savedChoice === 'accepted-optional') loadAds();
  byId('accept-cookies')?.addEventListener('click', () => storeChoice('accepted-optional'));
  byId('reject-cookies')?.addEventListener('click', () => storeChoice('essential-only'));
  settings?.addEventListener('click', showBanner);
})();