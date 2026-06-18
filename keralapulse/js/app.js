// js/app.js — KeralaPulse core app logic
'use strict';

/* ===================================================
   THEME MANAGEMENT
   Applied before first paint via inline script in <head>
   This module handles the toggle interaction.
   =================================================== */
const THEME_KEY = 'kp_theme';
const SEARCH_KEY = 'kp_recent_searches';

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  // Sync all theme toggle checkboxes on the page
  document.querySelectorAll('.theme-checkbox').forEach(el => {
    el.checked = (theme === 'dark');
  });

  // Update header icon
  const sunIcon = document.getElementById('theme-sun');
  const moonIcon = document.getElementById('theme-moon');
  if (sunIcon && moonIcon) {
    sunIcon.style.display = theme === 'dark' ? 'none' : 'inline';
    moonIcon.style.display = theme === 'dark' ? 'inline' : 'none';
  }

  document.dispatchEvent(new CustomEvent('kp:themechange', { detail: { theme } }));
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/* ===================================================
   RIPPLE EFFECT
   =================================================== */
function addRipple(e) {
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;

  const rect = btn.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top  = `${e.clientY - rect.top  - radius}px`;
  circle.classList.add('ripple');

  btn.querySelectorAll('.ripple').forEach(r => r.remove());
  btn.appendChild(circle);
}

function initRipples() {
  document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', addRipple);
  });
}

/* ===================================================
   ACTIVE NAV SYNC
   =================================================== */
function syncActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html':     ['nav-home',     'topnav-home'],
    '':               ['nav-home',     'topnav-home'],
    'news.html':      ['nav-news',     'topnav-news'],
    'districts.html': ['nav-districts','topnav-districts'],
    'settings.html':  ['nav-settings', 'topnav-settings'],
  };

  // Handle map anchor
  const isMap = window.location.hash === '#map';
  const ids = isMap ? ['nav-map', 'topnav-map'] : (map[page] || ['nav-home', 'topnav-home']);

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  });
}

/* ===================================================
   SEARCH MODAL
   =================================================== */
const SEARCH_DATA = [
  { type: 'district', label: 'Thiruvananthapuram', icon: 'bi-geo-alt' },
  { type: 'district', label: 'Kollam',              icon: 'bi-geo-alt' },
  { type: 'district', label: 'Pathanamthitta',      icon: 'bi-geo-alt' },
  { type: 'district', label: 'Alappuzha',           icon: 'bi-geo-alt' },
  { type: 'district', label: 'Kottayam',            icon: 'bi-geo-alt' },
  { type: 'district', label: 'Idukki',              icon: 'bi-geo-alt' },
  { type: 'district', label: 'Ernakulam',           icon: 'bi-geo-alt' },
  { type: 'district', label: 'Thrissur',            icon: 'bi-geo-alt' },
  { type: 'district', label: 'Palakkad',            icon: 'bi-geo-alt' },
  { type: 'district', label: 'Malappuram',          icon: 'bi-geo-alt' },
  { type: 'district', label: 'Kozhikode',           icon: 'bi-geo-alt' },
  { type: 'district', label: 'Wayanad',             icon: 'bi-geo-alt' },
  { type: 'district', label: 'Kannur',              icon: 'bi-geo-alt' },
  { type: 'district', label: 'Kasaragod',           icon: 'bi-geo-alt' },
  { type: 'topic', label: 'Weather',     icon: 'bi-cloud-sun' },
  { type: 'topic', label: 'Gold Price',  icon: 'bi-gem' },
  { type: 'topic', label: 'Fuel Price',  icon: 'bi-fuel-pump' },
  { type: 'topic', label: 'Onam Festival', icon: 'bi-stars' },
  { type: 'topic', label: 'Politics',    icon: 'bi-newspaper' },
  { type: 'topic', label: 'Sports',      icon: 'bi-trophy' },
  { type: 'topic', label: 'Health',      icon: 'bi-heart-pulse' },
  { type: 'topic', label: 'Education',   icon: 'bi-book' },
  { type: 'topic', label: 'Tourism',     icon: 'bi-camera' },
  { type: 'topic', label: 'Agriculture', icon: 'bi-tree' },
];

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_KEY)) || [];
  } catch { return []; }
}

function saveSearch(query) {
  if (!query.trim()) return;
  let recents = getRecentSearches();
  recents = recents.filter(r => r.toLowerCase() !== query.toLowerCase());
  recents.unshift(query);
  recents = recents.slice(0, 6);
  localStorage.setItem(SEARCH_KEY, JSON.stringify(recents));
}

function renderSearchResults(query) {
  const resultsEl = document.getElementById('search-results');
  const recentEl  = document.getElementById('search-recent');
  if (!resultsEl) return;

  if (!query) {
    resultsEl.style.display = 'none';
    if (recentEl) recentEl.style.display = 'block';
    renderRecentSearches();
    return;
  }

  if (recentEl) recentEl.style.display = 'none';
  resultsEl.style.display = 'block';

  const q = query.toLowerCase();
  const matches = SEARCH_DATA.filter(d => d.label.toLowerCase().includes(q));

  if (matches.length === 0) {
    resultsEl.innerHTML = `
      <div class="search-results-section">
        <div class="text-center py-3" style="color:var(--text-muted);font-size:.85rem;">
          <i class="bi bi-search" style="font-size:1.5rem;display:block;margin-bottom:8px;"></i>
          No results for "<strong>${escHtml(query)}</strong>"
        </div>
      </div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div class="search-results-section">
      <div class="section-label">Results (${matches.length})</div>
      ${matches.map(m => `
        <div class="search-result-item" data-label="${escHtml(m.label)}" tabindex="0" role="button">
          <i class="bi ${m.icon}"></i>
          <span>${escHtml(m.label)}</span>
          <span style="font-size:.68rem;color:var(--text-muted);margin-left:auto;text-transform:uppercase;letter-spacing:.5px">${m.type}</span>
        </div>`).join('')}
    </div>`;

  resultsEl.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      saveSearch(item.dataset.label);
      closeSearch();
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter') { saveSearch(item.dataset.label); closeSearch(); }
    });
  });
}

function renderRecentSearches() {
  const recentEl = document.getElementById('search-recent');
  if (!recentEl) return;

  const recents = getRecentSearches();
  if (recents.length === 0) {
    recentEl.innerHTML = `
      <div class="search-results-section">
        <div class="section-label">Suggestions</div>
        ${SEARCH_DATA.slice(0,6).map(d => `
          <div class="search-result-item" data-label="${escHtml(d.label)}" tabindex="0" role="button">
            <i class="bi ${d.icon}"></i><span>${escHtml(d.label)}</span>
          </div>`).join('')}
      </div>`;
  } else {
    recentEl.innerHTML = `
      <div class="search-results-section">
        <div class="section-label d-flex justify-content-between align-items-center">
          Recent
          <button id="clear-recents" style="font-size:.68rem;color:var(--accent);font-weight:600;background:none;border:none;cursor:pointer;padding:0">Clear</button>
        </div>
        ${recents.map(r => `
          <div class="search-result-item" data-label="${escHtml(r)}" tabindex="0" role="button">
            <i class="bi bi-clock-history"></i><span>${escHtml(r)}</span>
          </div>`).join('')}
      </div>`;

    document.getElementById('clear-recents')?.addEventListener('click', () => {
      localStorage.removeItem(SEARCH_KEY);
      renderRecentSearches();
    });
  }

  recentEl.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      saveSearch(item.dataset.label);
      closeSearch();
    });
  });
}

function openSearch() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  const input = modal.querySelector('#search-input');
  if (input) setTimeout(() => input.focus(), 50);
  renderRecentSearches();
}

function closeSearch() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  renderSearchResults('');
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function initSearch() {
  document.getElementById('search-btn')?.addEventListener('click', openSearch);
  document.getElementById('search-close')?.addEventListener('click', closeSearch);

  const modal = document.getElementById('search-modal');
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeSearch();
  });

  document.getElementById('search-input')?.addEventListener('input', e => {
    renderSearchResults(e.target.value.trim());
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });

  document.getElementById('search-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('search-input')?.value.trim();
    if (q) { saveSearch(q); closeSearch(); }
  });
}

/* ===================================================
   SKELETON LOADERS → fade in real content
   =================================================== */
function initSkeletons() {
  const skeletons = document.querySelectorAll('.skeleton-wrapper');
  const cards     = document.querySelectorAll('.dashboard-card');

  if (!skeletons.length) {
    // If no skeletons, just animate cards
    cards.forEach(c => c.classList.add('fade-in-up'));
    return;
  }

  setTimeout(() => {
    skeletons.forEach(s => {
      s.style.transition = 'opacity 0.3s ease';
      s.style.opacity = '0';
      setTimeout(() => { s.style.display = 'none'; }, 300);
    });
    cards.forEach((c, i) => {
      setTimeout(() => {
        c.style.display = '';
        c.classList.add('fade-in-up');
      }, 80 * i);
    });
  }, 700);
}

/* ===================================================
   DISTRICT DATA
   =================================================== */
const DISTRICTS = [
  {
    id: 'kasaragod', name: 'Kasaragod', hq: 'Kasaragod',
    population: '13.07 L', area: '1,992 km²', literacy: '90.1%',
    taluks: ['Kasaragod', 'Hosdurg', 'Veldur', 'Manjeshwar'],
    color: '#00C853'
  },
  {
    id: 'kannur', name: 'Kannur', hq: 'Kannur',
    population: '25.24 L', area: '2,966 km²', literacy: '95.0%',
    taluks: ['Kannur', 'Thalassery', 'Irikkur', 'Kuthuparamba', 'Payyanur'],
    color: '#00BFA5'
  },
  {
    id: 'wayanad', name: 'Wayanad', hq: 'Kalpetta',
    population: '8.17 L', area: '2,132 km²', literacy: '89.0%',
    taluks: ['Mananthavady', 'Sulthan Bathery', 'Vythiri'],
    color: '#1DE9B6'
  },
  {
    id: 'kozhikode', name: 'Kozhikode', hq: 'Kozhikode',
    population: '30.87 L', area: '2,345 km²', literacy: '95.8%',
    taluks: ['Kozhikode', 'Vadakara', 'Quilandy', 'Thamarassery'],
    color: '#00E5FF'
  },
  {
    id: 'malappuram', name: 'Malappuram', hq: 'Malappuram',
    population: '41.13 L', area: '3,550 km²', literacy: '93.6%',
    taluks: ['Tirur', 'Ponnani', 'Perintalmanna', 'Nilambur', 'Ernad', 'Perinthalmanna'],
    color: '#29B6F6'
  },
  {
    id: 'palakkad', name: 'Palakkad', hq: 'Palakkad',
    population: '28.10 L', area: '4,480 km²', literacy: '89.3%',
    taluks: ['Palakkad', 'Mannarghat', 'Ottappalam', 'Chittur', 'Alathur'],
    color: '#81D4FA'
  },
  {
    id: 'thrissur', name: 'Thrissur', hq: 'Thrissur',
    population: '31.21 L', area: '3,032 km²', literacy: '95.2%',
    taluks: ['Thrissur', 'Mukundapuram', 'Thalappilly', 'Kodungallur', 'Chavakkad'],
    color: '#80CBC4'
  },
  {
    id: 'ernakulam', name: 'Ernakulam', hq: 'Kakkanad',
    population: '32.82 L', area: '3,068 km²', literacy: '95.8%',
    taluks: ['Ernakulam', 'Paravur', 'Aluva', 'Kothamangalam', 'Muvattupuzha', 'Kanayannur'],
    color: '#A5D6A7'
  },
  {
    id: 'idukki', name: 'Idukki', hq: 'Painavu',
    population: '11.08 L', area: '4,479 km²', literacy: '91.6%',
    taluks: ['Devikulam', 'Udumbanchola', 'Peerumade', 'Idukki', 'Thodupuzha'],
    color: '#C5E1A5'
  },
  {
    id: 'kottayam', name: 'Kottayam', hq: 'Kottayam',
    population: '19.74 L', area: '2,208 km²', literacy: '97.2%',
    taluks: ['Kottayam', 'Meenachil', 'Vaikom', 'Changanassery', 'Kanjirappally'],
    color: '#E6EE9C'
  },
  {
    id: 'alappuzha', name: 'Alappuzha', hq: 'Alappuzha',
    population: '21.28 L', area: '1,414 km²', literacy: '96.2%',
    taluks: ['Ambalappuzha', 'Kuttanad', 'Cherthala', 'Mavelikkara', 'Karthikappally'],
    color: '#FFF59D'
  },
  {
    id: 'pathanamthitta', name: 'Pathanamthitta', hq: 'Pathanamthitta',
    population: '11.97 L', area: '2,642 km²', literacy: '96.6%',
    taluks: ['Kozhencherry', 'Thiruvalla', 'Adoor', 'Mallappally', 'Ranni', 'Konni'],
    color: '#FFCC80'
  },
  {
    id: 'kollam', name: 'Kollam', hq: 'Kollam',
    population: '26.35 L', area: '2,491 km²', literacy: '94.1%',
    taluks: ['Kollam', 'Punalur', 'Kunnathur', 'Kottarakkara', 'Pathanapuram'],
    color: '#FFAB91'
  },
  {
    id: 'thiruvananthapuram', name: 'Thiruvananthapuram', hq: 'Thiruvananthapuram',
    population: '33.02 L', area: '2,192 km²', literacy: '93.0%',
    taluks: ['Thiruvananthapuram', 'Nedumangad', 'Varkala', 'Kattakada', 'Chirayinkeezhu', 'Neyyattinkara'],
    color: '#F48FB1'
  },
];

/* ===================================================
   DISTRICT MODAL (used from map + districts page)
   =================================================== */
function openDistrictModal(districtId) {
  const d = DISTRICTS.find(x => x.id === districtId);
  if (!d) return;

  const literacyNum = parseFloat(d.literacy);

  const modal = document.getElementById('district-modal');
  if (!modal) return;

  document.getElementById('dm-name').textContent       = d.name;
  document.getElementById('dm-hq').textContent         = d.hq;
  document.getElementById('dm-population').textContent = d.population;
  document.getElementById('dm-area').textContent       = d.area;
  document.getElementById('dm-literacy-val').textContent = d.literacy;
  document.getElementById('dm-literacy-bar').style.width  = literacyNum + '%';
  document.getElementById('dm-taluks').innerHTML =
    d.taluks.map(t => `<span class="stat-badge me-1 mb-1">${t}</span>`).join('');

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

/* ===================================================
   KERALA SVG MAP (inline, scripted)
   =================================================== */
function initMap() {
  document.querySelectorAll('.district-path').forEach(path => {
    const tooltip = document.querySelector('.map-tooltip');

    path.addEventListener('mouseenter', e => {
      if (tooltip) {
        tooltip.textContent = path.dataset.name;
        tooltip.style.display = 'block';
      }
    });

    path.addEventListener('mousemove', e => {
      if (tooltip) {
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top  = (e.clientY - 32) + 'px';
      }
    });

    path.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
    });

    path.addEventListener('click', () => {
      openDistrictModal(path.dataset.id);
    });

    path.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openDistrictModal(path.dataset.id);
    });
  });
}

/* ===================================================
   SETTINGS PAGE — notification toggle
   =================================================== */
function initSettings() {
  const notifToggle = document.getElementById('notifications-toggle');
  const notifKey = 'kp_notifications';

  if (notifToggle) {
    notifToggle.checked = localStorage.getItem(notifKey) === 'true';
    notifToggle.addEventListener('change', () => {
      localStorage.setItem(notifKey, notifToggle.checked);
    });
  }

  // Theme toggles in settings
  document.querySelectorAll('.theme-checkbox').forEach(el => {
    el.checked = getTheme() === 'dark';
    el.addEventListener('change', toggleTheme);
  });
}

/* ===================================================
   BOOT
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Apply theme early (also done in inline head script but re-apply for toggles)
  applyTheme(getTheme());

  // Wire theme toggle button
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  syncActiveNav();
  initRipples();
  initSearch();
  initSkeletons();
  initMap();
  initSettings();

  // Expose for districts page
  window.KP = { openDistrictModal, DISTRICTS };
});
