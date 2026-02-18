(function () {
  'use strict';

  // ============================================
  // CONFIGURACIÓN OFICIAL (API TASA)
  // ============================================
  const CONFIG = {
    tokenEndpoint: 'https://api-tasa.valormas.gov.co:5002/ask/generate-embed-token',
    clientId: 'cron-hourly',
    tokenDurationMinutes: 60,
    renewalInterval: 55 * 60 * 1000,
    origin: window.location.origin,
    welcomeMessage: '¡Hola! Soy Tasa tu asistente virtual.',
    audioEnabled: true,
    maxRetries: 3
  };

  let tokenRenewalCron = null;
  let retryCount = 0;
  let initialized = false;   // 👈 indica si ya se inició el chat
  let initializing = false;  // 👈 evita doble inicialización si hacen doble clic rápido

  const btn = document.getElementById('abrir-talia');
  const chat = document.getElementById('chat-talia');
  const pill = document.getElementById('talia-pill');

  // ============================================
  // GENERAR TOKEN
  // ============================================
  async function generateNewToken() {
    try {
      const response = await fetch(CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: CONFIG.origin,
          clientId: CONFIG.clientId,
          welcomeMessage: CONFIG.welcomeMessage,
          audioEnabled: CONFIG.audioEnabled,
          expirationMinutes: CONFIG.tokenDurationMinutes,
          creationDate: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('HTTP ' + response.status);

      const result = await response.json();

      if (result.success && result.data && result.data.token) {
        retryCount = 0;
        return result.data.token;
      } else {
        throw new Error(result.message || 'Error generando token');
      }
    } catch (error) {
      console.error('❌ Error generando token TALIA:', error);
      if (retryCount < CONFIG.maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 5000));
        return generateNewToken();
      }
      return null;
    }
  }

  // ============================================
  // ENVIAR TOKEN NUEVO AL IFRAME
  // ============================================
  function sendTokenToChat(token) {
    if (!chat || !chat.contentWindow) return;
    try {
      chat.contentWindow.postMessage({
        type: 'TASA_CHAT_NEW_TOKEN',
        token: token,
        timestamp: Date.now()
      }, '*');
    } catch (e) {
      console.error('❌ Error enviando token al iframe TALIA:', e);
    }
  }

  // ============================================
  // CRON DE RENOVACIÓN
  // ============================================
  function startTokenRenewalCron() {
    if (tokenRenewalCron) clearInterval(tokenRenewalCron);

    tokenRenewalCron = setInterval(async () => {
      const newToken = await generateNewToken();
      if (newToken) {
        sendTokenToChat(newToken);
      } else {
        console.error('❌ No se pudo renovar el token TALIA en el CRON');
      }
    }, CONFIG.renewalInterval);
  }

  // ============================================
  // ESCUCHAR SOLICITUDES DEL CHAT
  // ============================================
  window.addEventListener('message', async function (event) {
    const data = event.data || {};
    if (data.type === 'TASA_CHAT_TOKEN_RENEWAL_REQUEST') {
      const newToken = await generateNewToken();
      if (newToken) {
        sendTokenToChat(newToken);
      }
    }
  });

  // ============================================
  // INICIALIZAR (SOLO LA PRIMERA VEZ)
  // ============================================
  async function initializeChatIfNeeded() {
    if (initialized || initializing) return;
    initializing = true;

    const initialToken = await generateNewToken();
    if (!initialToken) {
      console.error('❌ No se pudo generar el token inicial para TALIA');
      initializing = false;
      return;
    }

    // Asignar src al iframe solo ahora
    chat.src = 'https://tasa-chat.valormas.gov.co/chat-tasa?token=' + initialToken;

    // Arrancar cron de renovación
    startTokenRenewalCron();

    initialized = true;
    initializing = false;
  }

  // ============================================
  // BURBUJA: ABRIR / CERRAR
  // ============================================
  btn.addEventListener('click', async () => {
    // 1️⃣ Si aún no se ha iniciado, generar token + setear iframe
    if (!initialized) {
      await initializeChatIfNeeded();
      if (!initialized) {
        // si falló, no intentamos abrir el chat
        return;
      }
    }

    // 2️⃣ Alternar visibilidad
    const isOpen = chat.classList.contains('open');
    if (isOpen) {
      chat.classList.remove('open');
      chat.classList.add('closed');
      btn.setAttribute('aria-expanded', 'false');
      if (pill) pill.style.display = 'inline-block';
    } else {
      chat.classList.remove('closed');
      chat.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      if (pill) pill.style.display = 'none';
    }
  });

  // ESC para cerrar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && chat.style.opacity === '1') {
      btn.click();
    }
  });

})();