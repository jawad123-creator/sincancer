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
  const loadExternalScript = (src, attributes = {}) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
    document.body.appendChild(script);
    return script;
  };
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
      doc.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"></body></html>');
      doc.close();
      const configScript = doc.createElement('script');
      configScript.textContent = 'var atOptions={key:"' + config.key + '",format:"iframe",height:' + config.height + ',width:' + config.width + ',params:{}};';
      doc.body.appendChild(configScript);
      const networkScript = doc.createElement('script');
      networkScript.src = 'https://www.highrevenueformat.com/' + config.key + '/invoke.js';
      networkScript.async = true;
      networkScript.onload = () => loadNext(index + 1);
      networkScript.onerror = () => loadNext(index + 1);
      doc.body.appendChild(networkScript);
    };
    loadNext(0);

    // Native ad unit.
    const nativeSlot = byId('native-ad-slot');
    if (nativeSlot && !nativeSlot.dataset.loaded) {
      nativeSlot.dataset.loaded = 'true';
      const nativeContainer = document.createElement('div');
      nativeContainer.id = 'container-a609aa5baa281946f3978d91f6e7f4d5';
      nativeSlot.appendChild(nativeContainer);
      loadExternalScript('https://pl31172636.profitableratecpmnetwork.com/a609aa5baa281946f3978d91f6e7f4d5/invoke.js', {'data-cfasync':'false'});
    }

    // Social bar is enabled only after optional-cookie consent.
    if (!document.querySelector('script[data-sincancer-socialbar]')) {
      loadExternalScript('https://pl31198060.profitableratecpmnetwork.com/14/41/a6/1441a6308d99f419a586dc758e38f62a.js', {'data-sincancer-socialbar':'true'});
    }

    // Popunder: at most once per browser session, and only after consent.
    let popunderSeen = false;
    try { popunderSeen = sessionStorage.getItem('sincancer_popunder_seen') === '1'; } catch {}
    if (!popunderSeen) {
      try { sessionStorage.setItem('sincancer_popunder_seen', '1'); } catch {}
      loadExternalScript('https://pl31198058.profitableratecpmnetwork.com/55/9f/e7/559fe752a937dcc608a0d073e947a5c3.js', {'data-sincancer-popunder':'true'});
    }
  };
  const storeChoice = (choice) => {
    try { localStorage.setItem('sincancer-cookie-choice', choice); } catch {}
    if (banner) banner.hidden = true;
    if (choice === 'accepted-optional') loadAds();
    else if (adsLoaded) window.location.reload();
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