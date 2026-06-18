// js/charts.js — KeralaPulse Chart configurations
// NOTE: This file is intentionally named charts.js (not chart.js) to
// avoid clashing with the Chart.js library itself.

'use strict';

/* ===================================================
   Shared helpers
   =================================================== */
function getAccentColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#00C853';
}

function getTextColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--text-secondary').trim() || '#5A6A7A';
}

function getBgCard() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-card').trim() || '#FFFFFF';
}

function getBorder() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--border').trim() || 'rgba(0,0,0,0.08)';
}

const NEUTRAL = '#8A9BB0';

/* Shared Chart.js defaults */
function chartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          color: getTextColor(),
          font: { family: "'Inter', sans-serif", size: 11 },
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 4,
        }
      },
      tooltip: {
        backgroundColor: getBgCard(),
        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
        bodyColor: getTextColor(),
        borderColor: getBorder(),
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        titleFont: { family: "'Outfit', sans-serif", weight: '700', size: 12 },
        bodyFont: { family: "'Inter', sans-serif", size: 11 },
      }
    },
    scales: {
      x: {
        grid: { color: getBorder(), lineWidth: 0.5 },
        ticks: { color: getTextColor(), font: { size: 10, family: "'Inter', sans-serif" } },
        border: { color: getBorder() }
      },
      y: {
        grid: { color: getBorder(), lineWidth: 0.5 },
        ticks: { color: getTextColor(), font: { size: 10, family: "'Inter', sans-serif" } },
        border: { color: getBorder() }
      }
    }
  };
}

/* ===================================================
   1. Weekly Temperature Line Chart
   =================================================== */
function initTempChart() {
  const canvas = document.getElementById('chart-temperature');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const accent = getAccentColor();
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(0,200,83,0.35)');
  grad.addColorStop(1, 'rgba(0,200,83,0)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Temperature (°C)',
        data: [29, 31, 33, 30, 28, 32, 31],
        borderColor: accent,
        backgroundColor: grad,
        pointBackgroundColor: accent,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.42,
        fill: true,
        borderWidth: 2.5,
      }]
    },
    options: {
      ...chartDefaults(),
      plugins: {
        ...chartDefaults().plugins,
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y}°C`
          }
        }
      },
      scales: {
        ...chartDefaults().scales,
        y: {
          ...chartDefaults().scales.y,
          min: 24, max: 38,
          ticks: {
            ...chartDefaults().scales.y.ticks,
            callback: v => v + '°'
          }
        }
      }
    }
  });
}

/* ===================================================
   2. Gold Price Trend
   =================================================== */
function initGoldChart() {
  const canvas = document.getElementById('chart-gold');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const goldColor = '#FFB300';
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(255,179,0,0.35)');
  grad.addColorStop(1, 'rgba(255,179,0,0)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: '22K Gold (₹/g)',
        data: [8750, 8780, 8800, 8760, 8820, 8800, 8800],
        borderColor: goldColor,
        backgroundColor: grad,
        pointBackgroundColor: goldColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.42,
        fill: true,
        borderWidth: 2.5,
      }]
    },
    options: {
      ...chartDefaults(),
      plugins: {
        ...chartDefaults().plugins,
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: { label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}/g` }
        }
      },
      scales: {
        ...chartDefaults().scales,
        y: {
          ...chartDefaults().scales.y,
          min: 8700, max: 8900,
          ticks: {
            ...chartDefaults().scales.y.ticks,
            callback: v => '₹' + v.toLocaleString('en-IN')
          }
        }
      }
    }
  });
}

/* ===================================================
   3. Fuel Price Trend (Petrol + Diesel)
   =================================================== */
function initFuelChart() {
  const canvas = document.getElementById('chart-fuel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const accent = getAccentColor();

  const gradP = ctx.createLinearGradient(0, 0, 0, 200);
  gradP.addColorStop(0, 'rgba(0,200,83,0.25)');
  gradP.addColorStop(1, 'rgba(0,200,83,0)');

  const gradD = ctx.createLinearGradient(0, 0, 0, 200);
  gradD.addColorStop(0, 'rgba(41,121,255,0.20)');
  gradD.addColorStop(1, 'rgba(41,121,255,0)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Petrol (₹/L)',
          data: [104.50, 104.50, 104.50, 104.50, 104.50, 104.50, 104.50],
          borderColor: accent,
          backgroundColor: gradP,
          pointBackgroundColor: accent,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
          borderWidth: 2.5,
        },
        {
          label: 'Diesel (₹/L)',
          data: [92.20, 92.20, 92.20, 92.35, 92.20, 92.20, 92.20],
          borderColor: '#2979FF',
          backgroundColor: gradD,
          pointBackgroundColor: '#2979FF',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
          borderWidth: 2.5,
        }
      ]
    },
    options: {
      ...chartDefaults(),
      plugins: {
        ...chartDefaults().plugins,
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toFixed(2)}` }
        }
      },
      scales: {
        ...chartDefaults().scales,
        y: {
          ...chartDefaults().scales.y,
          min: 88, max: 108,
          ticks: {
            ...chartDefaults().scales.y.ticks,
            callback: v => '₹' + v
          }
        }
      }
    }
  });
}

/* ===================================================
   Init all charts on the page
   =================================================== */
function initAllCharts() {
  initTempChart();
  initGoldChart();
  initFuelChart();
}

/* Re-render charts when theme changes so colours update */
const _kpChartRefs = [];

function destroyAndReinit() {
  // Destroy any Chart.js instances registered on our canvases
  ['chart-temperature', 'chart-gold', 'chart-fuel'].forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
    }
  });
  setTimeout(initAllCharts, 50);
}

document.addEventListener('DOMContentLoaded', () => {
  initAllCharts();

  /* Listen for theme toggle to refresh chart colours */
  document.addEventListener('kp:themechange', destroyAndReinit);
});
