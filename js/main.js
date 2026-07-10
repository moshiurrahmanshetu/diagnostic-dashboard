/**
 * Diagnostic Dashboard - main.js
 * Vanilla JS logic for layout, dark/light mode toggle, sidebar, and Chart.js initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dark / Light Mode Toggle Setup
  initTheme();

  // 2. Sidebar Toggle for Mobile Devices
  initSidebar();

  // 3. Chart.js Initialization with Theme Awareness
  initCharts();

  // 4. Initialize AOS if present
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true
    });
  }

  // 5. Setup Search Filter
  initSearch();

  // 6. Load User Profile persistent state
  loadUserProfile();
});

// Storing references to Chart.js objects to update them on theme change
let appointmentsChart = null;
let testTypesChart = null;

/**
 * Initialize Dark / Light Theme
 */
function initTheme() {
  const btnLight = document.getElementById('btn-theme-light');
  const btnDark = document.getElementById('btn-theme-dark');
  
  if (!btnLight || !btnDark) return;

  // Read theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  let currentTheme = 'light';

  if (savedTheme) {
    currentTheme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentTheme = 'dark';
  }

  setTheme(currentTheme);

  btnLight.addEventListener('click', () => {
    setTheme('light');
  });

  btnDark.addEventListener('click', () => {
    setTheme('dark');
  });
}

/**
 * Apply selected theme (light / dark)
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Update toggle buttons active class
  const btnLight = document.getElementById('btn-theme-light');
  const btnDark = document.getElementById('btn-theme-dark');

  if (btnLight && btnDark) {
    if (theme === 'dark') {
      btnDark.classList.add('active');
      btnLight.classList.remove('active');
    } else {
      btnLight.classList.add('active');
      btnDark.classList.remove('active');
    }
  }

  // Dynamically update Chart.js colors based on theme change
  updateChartsTheme(theme);
}

/**
 * Initialize Mobile & Desktop Sidebar toggle
 */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  
  if (!sidebar || !toggleBtn) return;

  // Auto-populate data-tooltip attributes for sidebar links
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    const textSpan = link.querySelector('span');
    if (textSpan && !link.hasAttribute('data-tooltip')) {
      link.setAttribute('data-tooltip', textSpan.textContent.trim());
    }
  });

  // Apply saved desktop state immediately
  const savedState = localStorage.getItem('sidebar_state');
  if (window.innerWidth >= 992) {
    if (savedState === 'collapsed') {
      document.body.classList.add('sidebar-collapsed');
      document.body.classList.remove('sidebar-expanded');
    } else {
      document.body.classList.add('sidebar-expanded');
      document.body.classList.remove('sidebar-collapsed');
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.innerWidth < 992) {
      // Mobile drawer toggle behavior
      sidebar.classList.toggle('show');
    } else {
      // Desktop collapse toggle behavior
      if (document.body.classList.contains('sidebar-collapsed')) {
        document.body.classList.remove('sidebar-collapsed');
        document.body.classList.add('sidebar-expanded');
        localStorage.setItem('sidebar_state', 'expanded');
      } else {
        document.body.classList.add('sidebar-collapsed');
        document.body.classList.remove('sidebar-expanded');
        localStorage.setItem('sidebar_state', 'collapsed');
      }
    }
  });

  // Clicking outside sidebar closes it on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 992 && sidebar.classList.contains('show') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
      sidebar.classList.remove('show');
    }
  });
}

/**
 * Initialize Chart.js
 */
function initCharts() {
  const appCtx = document.getElementById('appointmentsChart');
  const typeCtx = document.getElementById('testTypesChart');

  if (!appCtx && !typeCtx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#222b40' : '#e2e8f0';
  const accentColor = isDark ? '#2dd4bf' : '#0d9488';

  // 1. Appointments Trend Line Chart
  if (appCtx) {
    appointmentsChart = new Chart(appCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Appointments',
            data: [65, 78, 72, 89, 95, 110, 105, 120, 115, 130, 145, 160],
            borderColor: accentColor,
            backgroundColor: isDark ? 'rgba(45, 212, 191, 0.1)' : 'rgba(13, 148, 136, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: accentColor
          },
          {
            label: 'Reports Released',
            data: [50, 65, 60, 80, 85, 95, 90, 110, 105, 115, 125, 140],
            borderColor: '#3b82f6', // blue-500
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2,
            pointBackgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: {
                family: 'Inter',
                size: 11
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Inter',
                size: 11
              }
            }
          }
        }
      }
    });
  }

  // 2. Test Types Distribution Doughnut Chart
  if (typeCtx) {
    testTypesChart = new Chart(typeCtx, {
      type: 'doughnut',
      data: {
        labels: ['Blood Hematology', 'MRI & CT Scans', 'Cardiac Profile', 'Thyroid Screens', 'Others'],
        datasets: [{
          data: [40, 25, 15, 12, 8],
          backgroundColor: [
            accentColor,
            '#3b82f6', // blue-500
            '#10b981', // emerald-500
            '#f59e0b', // amber-500
            '#64748b'  // slate-500
          ],
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#151c2c' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 15,
              font: {
                family: 'Inter',
                size: 11
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }
}

/**
 * Dynamically updates chart gridlines, labels, and borders on theme toggle
 */
function updateChartsTheme(theme) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#222b40' : '#e2e8f0';
  const accentColor = isDark ? '#2dd4bf' : '#0d9488';

  if (appointmentsChart) {
    // Update labels and gridlines
    appointmentsChart.options.plugins.legend.labels.color = textColor;
    appointmentsChart.options.scales.x.grid.color = gridColor;
    appointmentsChart.options.scales.x.ticks.color = textColor;
    appointmentsChart.options.scales.y.grid.color = gridColor;
    appointmentsChart.options.scales.y.ticks.color = textColor;

    // Update dataset colors
    appointmentsChart.data.datasets[0].borderColor = accentColor;
    appointmentsChart.data.datasets[0].pointBackgroundColor = accentColor;
    appointmentsChart.data.datasets[0].backgroundColor = isDark ? 'rgba(45, 212, 191, 0.1)' : 'rgba(13, 148, 136, 0.1)';
    
    appointmentsChart.update();
  }

  if (testTypesChart) {
    testTypesChart.options.plugins.legend.labels.color = textColor;
    testTypesChart.data.datasets[0].backgroundColor[0] = accentColor;
    testTypesChart.data.datasets[0].borderColor = isDark ? '#151c2c' : '#ffffff';
    testTypesChart.data.datasets[0].borderWidth = isDark ? 2 : 1;
    
    testTypesChart.update();
  }
}

/**
 * Live search filter on Patient tables and search fields
 */
function initSearch() {
  const searchInput = document.getElementById('search-patient');
  if (!searchInput) return;

  searchInput.addEventListener('keyup', (e) => {
    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.table-searchable tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.indexOf(value) > -1) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}

/**
 * Load and display user profile details persistently
 */
function loadUserProfile() {
  const savedName = localStorage.getItem('user_profile_name') || 'Sarah Jenkins';
  const savedEmail = localStorage.getItem('user_profile_email') || 'sjenkins@mediscan.com';
  const savedRole = localStorage.getItem('user_profile_role') || 'MD, Pathologist';
  const savedImage = localStorage.getItem('user_profile_image');

  // Get initials
  const initials = savedName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Update sidebar user badge
  const badgeNameEl = document.querySelector('.user-badge-name');
  if (badgeNameEl) badgeNameEl.textContent = savedName;

  const badgeRoleEl = document.querySelector('.user-badge-role');
  if (badgeRoleEl) badgeRoleEl.textContent = savedRole;

  const badgeAvatarEl = document.querySelector('.user-badge-avatar');
  if (badgeAvatarEl) {
    if (savedImage) {
      badgeAvatarEl.style.backgroundImage = `url(${savedImage})`;
      badgeAvatarEl.style.backgroundSize = 'cover';
      badgeAvatarEl.style.backgroundPosition = 'center';
      badgeAvatarEl.textContent = '';
    } else {
      badgeAvatarEl.style.backgroundImage = '';
      badgeAvatarEl.textContent = initials;
    }
  }

  // Update navbar avatar
  const profileAvatarEl = document.querySelector('.profile-avatar');
  if (profileAvatarEl) {
    if (savedImage) {
      profileAvatarEl.style.backgroundImage = `url(${savedImage})`;
      profileAvatarEl.style.backgroundSize = 'cover';
      profileAvatarEl.style.backgroundPosition = 'center';
      profileAvatarEl.textContent = '';
    } else {
      profileAvatarEl.style.backgroundImage = '';
      profileAvatarEl.textContent = initials;
    }
  }

  // Update navbar email & name
  const navNameEl = document.querySelector('.dropdown-menu-custom .fw-bold');
  if (navNameEl) navNameEl.textContent = savedName.startsWith('Dr.') ? savedName : `Dr. ${savedName}`;

  const navEmailEl = document.querySelector('.dropdown-menu-custom .text-muted.small');
  if (navEmailEl) navEmailEl.textContent = savedEmail;
}

// Expose globally so external scripts (e.g., settings page) can update the view on saving changes
window.loadUserProfile = loadUserProfile;
