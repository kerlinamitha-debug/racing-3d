export function initUI({ onStartRace, onOpenPanel, onCameraChange, onNitro, onBrake, onGas, onSteer, onPause }) {
  const loading = document.querySelector('#loading-screen');
  const progress = document.querySelector('#loading-progress');
  const percent = document.querySelector('#loading-percent');
  const menu = document.querySelector('#main-menu');
  const panel = document.querySelector('#panel');
  const raceHud = document.querySelector('#race-hud');
  const toast = document.querySelector('#toast');
  let loadingValue = 0;
  const loadingTimer = setInterval(() => {
    loadingValue = Math.min(94, loadingValue + 7 + Math.random() * 10);
    progress.style.width = loadingValue + '%';
    percent.textContent = Math.floor(loadingValue) + '%';
  }, 130);
  const hideLoading = () => {
    clearInterval(loadingTimer);
    progress.style.width = '100%';
    percent.textContent = '100%';
    setTimeout(() => {
      loading.classList.add('is-hidden');
      menu.classList.remove('is-hidden');
    }, 260);
  };
  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const openPanel = (title, description, actionLabel = 'KEMBALI', action = null) => {
    panel.querySelector('h2').textContent = title;
    panel.querySelector('p').textContent = description;
    const actions = panel.querySelector('.panel-actions');
    actions.innerHTML = '';
    const back = document.createElement('button');
    back.textContent = 'KEMBALI';
    back.addEventListener('click', () => panel.classList.add('is-hidden'));
    actions.appendChild(back);
    if (action) {
      const go = document.createElement('button');
      go.className = 'confirm';
      go.textContent = actionLabel;
      go.addEventListener('click', () => { panel.classList.add('is-hidden'); action(); });
      actions.appendChild(go);
    }
    panel.classList.remove('is-hidden');
  };
  document.querySelectorAll('[data-menu]').forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.dataset.menu;
      if (choice === 'quick') {
        openPanel('QUICK RACE', 'Pilih cara bermain. Tahap ini menyiapkan pintu masuk balapan; sistem sirkuit dan AI akan dikembangkan berikutnya.', 'MULAI LATIHAN', onStartRace);
      } else if (choice === 'career') {
        openPanel('CAREER', 'Mode Career akan berisi kejuaraan, poin, hadiah, dan progres pembukaan mobil pada tahap pengembangan berikutnya.');
      } else if (choice === 'garage') {
        panel.classList.add('is-hidden');
        showToast('Kamu berada di Garage 3D. Mobil dapat diputar dengan kamera preview.');
      } else if (choice === 'tuning') {
        openPanel('CAR TUNING', 'Modifikasi warna, livery, ban, dan performa akan ditambahkan setelah fondasi garasi selesai.');
      } else if (choice === 'settings') {
        panel.querySelector('h2').textContent = 'SETTINGS';
        panel.querySelector('p').textContent = 'Sesuaikan suara dan kualitas tampilan. Pengaturan grafis lanjutan akan ditambahkan bertahap.';
        panel.querySelector('.panel-actions').innerHTML = '<label class="settings-row">Volume <input id="volume-setting" type="range" min="0" max="100" value="70"></label><label class="settings-row">Kualitas grafis <select id="quality-setting"><option>High</option><option>Balanced</option><option>Performance</option></select></label><div class="panel-actions"><button id="settings-back">KEMBALI</button></div>';
        panel.querySelector('#settings-back').addEventListener('click', () => panel.classList.add('is-hidden'));
        panel.classList.remove('is-hidden');
      }
    });
  });
  document.querySelector('#panel-close').addEventListener('click', () => panel.classList.add('is-hidden'));
  document.querySelector('#camera-button').addEventListener('click', onCameraChange);
  document.querySelector('#nitro-button').addEventListener('pointerdown', e => { e.preventDefault(); onNitro(true); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => document.querySelector('#nitro-button').addEventListener(type, () => onNitro(false)));
  document.querySelector('#pause-button').addEventListener('click', onPause);
  const bindHold = (selector, start, stop) => {
    const el = document.querySelector(selector);
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('active'); start(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => el.addEventListener(type, () => { el.classList.remove('active'); stop(); }));
  };
  bindHold('#touch-gas', () => onGas(true), () => onGas(false));
  bindHold('#touch-brake', () => onBrake(true), () => onBrake(false));
  bindHold('#touch-left', () => onSteer(-1), () => onSteer(0));
  bindHold('#touch-right', () => onSteer(1), () => onSteer(0));
  return { hideLoading, showToast, showMenu: () => { menu.classList.remove('is-hidden'); raceHud.classList.add('is-hidden'); }, hideMenu: () => menu.classList.add('is-hidden'), showRaceHud: () => raceHud.classList.remove('is-hidden'), openPanel };
}