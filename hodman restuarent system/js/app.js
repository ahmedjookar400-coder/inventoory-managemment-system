/**
 * Hodman Restaurant System - Application Shell & Navigation
 */

// Web Audio API Order Chime (No external audio file needed)
window.playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.15);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio chime could not play:', err);
  }
};

// Toast Notifications
window.showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 border-emerald-400' :
                  type === 'warning' ? 'bg-amber-600 border-amber-400' :
                  type === 'error' ? 'bg-red-600 border-red-400' : 'bg-slate-800 border-slate-600';
  
  const icon = type === 'success' ? 'fa-circle-check' :
               type === 'warning' ? 'fa-triangle-exclamation' :
               type === 'error' ? 'fa-circle-xmark' : 'fa-bell';

  toast.className = `flex items-center gap-3 text-white px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold transform transition-all duration-300 translate-y-3 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-sm"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Clock
  const clockEl = document.getElementById('system-clock');
  const updateClock = () => {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  };
  updateClock();
  setInterval(updateClock, 1000);

  // 2. Initialize Subsystems (POS, Reports, Inventory, Admin, Unpaid, Halls, CRM, HR, Purchase, Dashboard, Auth)
  window.initPos();
  window.initReports();
  window.initInventory();
  window.initAdmin();
  window.initUnpaid();
  window.initHalls();
  if (window.initCrm) window.initCrm();
  if (window.initHr) window.initHr();
  if (window.initPurchase) window.initPurchase();
  if (window.initDashboard) window.initDashboard();
  window.initAuth();

  // Test sound on header bell click
  const soundTestBtn = document.getElementById('btn-test-sound');
  if (soundTestBtn) {
    soundTestBtn.addEventListener('click', () => {
      window.playOrderChime();
      window.showToast('Printer / Chime alert test', 'info');
    });
  }

  // 3. System-Wide Dark / Light Theme Manager
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeLabel = document.getElementById('theme-toggle-label');

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.documentElement.classList.add('theme-light');
      if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-xs text-amber-500';
      if (themeLabel) themeLabel.textContent = 'Light';
    } else {
      document.body.classList.remove('theme-light');
      document.documentElement.classList.remove('theme-light');
      if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-xs text-blue-400';
      if (themeLabel) themeLabel.textContent = 'Dark';
    }
  };

  const currentTheme = localStorage.getItem('hodman_theme') || 'dark';
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.body.classList.contains('theme-light');
      const newTheme = isCurrentlyLight ? 'dark' : 'light';
      localStorage.setItem('hodman_theme', newTheme);
      applyTheme(newTheme);
      window.showToast?.(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
    });
  }

  // Mobile Sidebar Toggle
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('left-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  const openSidebar = () => {
    if (sidebar) sidebar.classList.remove('-translate-x-full');
    if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
  };
  const closeSidebar = () => {
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
  };

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar when a nav tab is clicked on mobile
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('.nav-tab') && window.innerWidth < 1024) {
        closeSidebar();
      }
    });
  }
});
