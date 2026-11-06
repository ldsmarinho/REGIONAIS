if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/REGIONAIS/sw.js')
      .catch(error => console.error('Erro ao registrar o service worker:', error));
  });
}

let deferredInstallPrompt;
const installDialog = document.getElementById('pwa-install-dialog');
const installButton = document.createElement('button');

installButton.id = 'install-btn';
installButton.className = 'btn-reset pwa-install-button';
installButton.type = 'button';
installButton.innerHTML = '<i class="fa-solid fa-download" aria-hidden="true"></i> Instalar aplicativo';
installButton.addEventListener('click', installPwa);

document.getElementById('pwa-install-confirm').addEventListener('click', installPwa);
document.getElementById('pwa-install-dismiss').addEventListener('click', () => {
  installDialog.close();
});

async function installPwa() {
  if (!deferredInstallPrompt) return;

  const installPrompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  installDialog.close();

  try {
    await installPrompt.prompt();
    await installPrompt.userChoice;
  } catch (error) {
    console.error('Erro ao solicitar a instalação do aplicativo:', error);
  } finally {
    installButton.remove();
  }
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!installDialog.open) installDialog.showModal();
  document.querySelector('.filter-card').append(installButton);
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installDialog.open) installDialog.close();
  document.getElementById('install-btn')?.remove();
});

const iosInstallDialog = document.getElementById('pwa-ios-install-dialog');
document.getElementById('pwa-ios-install-dismiss').addEventListener('click', () => {
  iosInstallDialog.close();
});

const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isRunningStandalone = navigator.standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches;

if (isIosDevice && !isRunningStandalone) {
  window.addEventListener('load', () => {
    if (!installDialog.open) iosInstallDialog.showModal();
  });
}
