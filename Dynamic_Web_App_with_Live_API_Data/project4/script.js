document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const form = $('searchForm');
  const input = $('cityInput');
  const searchBox = form;
  const results = $('results');
  const recentsWrap = $('recents');
  const recentsChips = $('recentsChips');
  const popularChips = $('popularChips');
  const scopeBtns = document.querySelectorAll('[data-scope]');

  const RECENTS_KEY = 'nimbus-recents';
  const SCOPE_KEY = 'nimbus-scope';
  const UNIT_KEY = 'nimbus-unit';
  const POPULAR = [
    'Islamabad',
    'Karachi',
    'Lahore',
    'Peshawar',
    'Quetta',
    'Multan',
  ];
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
  };

  let unit = store.get(UNIT_KEY, 'C') === 'F' ? 'F' : 'C';
  let scope = store.get(SCOPE_KEY, 'PK') === 'WORLD' ? 'WORLD' : 'PK';
  let reading = null;
  let requestId = 0;
  let lastAction = null;

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );

  const INK = '#2D2A32';
  const face = (cx, cy) =>
    `<circle cx="${cx - 5}" cy="${cy}" r="1.7" fill="${INK}"/><circle cx="${cx + 5}" cy="${cy}" r="1.7" fill="${INK}"/>` +
    `<path d="M${cx - 3.5} ${cy + 4.5}q3.5 3 7 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
    `<circle cx="${cx - 9}" cy="${cy + 3.5}" r="2.3" fill="#FF8C42" opacity=".45"/><circle cx="${cx + 9}" cy="${cy + 3.5}" r="2.3" fill="#FF8C42" opacity=".45"/>`;

  const rays = (cx, cy, r1, r2) => {
    let out = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      out += `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}"/>`;
    }
    return `<g stroke="#FFB347" stroke-width="3.4" stroke-linecap="round">${out}</g>`;
  };

  const cloud = (fill, stroke, transform = '') =>
    `<g ${transform ? `transform="${transform}"` : ''}><path d="M18 46h28a9 9 0 0 0 1.5-17.9A13 13 0 0 0 22.3 25 10 10 0 0 0 18 46Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>${face(32, 37)}</g>`;

  const wrap = (inner) =>
    `<svg viewBox="0 0 64 64" aria-hidden="true">${inner}</svg>`;

  const ICONS = {
    clear: () =>
      wrap(
        rays(32, 32, 19, 26) +
          `<circle cx="32" cy="32" r="14" fill="#FFB347"/>` +
          face(32, 30),
      ),
    moon: () =>
      wrap(
        `<circle cx="32" cy="32" r="16" fill="#FFE2A8"/><circle cx="40" cy="24" r="3" fill="#F4CB85"/><circle cx="24" cy="40" r="2.2" fill="#F4CB85"/><path d="M25 30q2-2.4 4 0M35 30q2-2.4 4 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M28.5 37q3.5 3 7 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="23" cy="34" r="2.3" fill="#FF8C42" opacity=".4"/><circle cx="41" cy="34" r="2.3" fill="#FF8C42" opacity=".4"/><circle cx="12" cy="14" r="1.6" fill="#FFE2A8"/><circle cx="52" cy="46" r="1.6" fill="#FFE2A8"/>`,
      ),
    partly: () =>
      wrap(
        `<circle cx="24" cy="24" r="10" fill="#FFB347"/>${rays(24, 24, 14, 18)}` +
          cloud('#fff', '#E9D5C6', 'translate(8 6) scale(.85)'),
      ),
    cloud: () => wrap(cloud('#fff', '#E9D5C6', 'translate(-3 -3) scale(1.1)')),
    fog: () =>
      wrap(
        cloud('#fff', '#E9D5C6', 'translate(5 -2) scale(.85)') +
          `<g stroke="#D0BEB0" stroke-width="3" stroke-linecap="round"><line x1="16" y1="50" x2="48" y2="50"/><line x1="22" y1="56" x2="54" y2="56"/></g>`,
      ),
    rain: () =>
      wrap(
        cloud('#fff', '#E9D5C6', 'translate(5 -3) scale(.85)') +
          `<g stroke="#5AA9E6" stroke-width="3" stroke-linecap="round"><line x1="24" y1="49" x2="21" y2="57"/><line x1="33" y1="49" x2="30" y2="57"/><line x1="42" y1="49" x2="39" y2="57"/></g>`,
      ),
    storm: () =>
      wrap(
        cloud('#D7CFDB', '#B9AEC0', 'translate(5 -4) scale(.85)') +
          `<polygon points="34,44 25,57 32,57 29,64 41,50 33,50" fill="#FFB347" stroke="#F09A2B" stroke-width="1" stroke-linejoin="round"/>`,
      ),
    snow: () =>
      wrap(
        cloud('#fff', '#E9D5C6', 'translate(5 -3) scale(.85)') +
          `<g fill="#fff" stroke="#9CC9EE" stroke-width="1.4"><circle cx="24" cy="52" r="2.6"/><circle cx="33" cy="57" r="2.6"/><circle cx="42" cy="52" r="2.6"/></g>`,
      ),
  };

  const WMO = {
    0: ['Clear sky', 'clear'],
    1: ['Mainly clear', 'partly'],
    2: ['Partly cloudy', 'partly'],
    3: ['Overcast', 'cloud'],
    45: ['Foggy', 'fog'],
    48: ['Freezing fog', 'fog'],
    51: ['Light drizzle', 'rain'],
    53: ['Drizzle', 'rain'],
    55: ['Dense drizzle', 'rain'],
    56: ['Freezing drizzle', 'rain'],
    57: ['Freezing drizzle', 'rain'],
    61: ['Light rain', 'rain'],
    63: ['Rain', 'rain'],
    65: ['Heavy rain', 'rain'],
    66: ['Freezing rain', 'rain'],
    67: ['Freezing rain', 'rain'],
    71: ['Light snow', 'snow'],
    73: ['Snow', 'snow'],
    75: ['Heavy snow', 'snow'],
    77: ['Snow grains', 'snow'],
    80: ['Rain showers', 'rain'],
    81: ['Rain showers', 'rain'],
    82: ['Heavy showers', 'rain'],
    85: ['Snow showers', 'snow'],
    86: ['Heavy snow showers', 'snow'],
    95: ['Thunderstorm', 'storm'],
    96: ['Thunderstorm with hail', 'storm'],
    99: ['Thunderstorm with hail', 'storm'],
  };

  const describe = (code) => {
    const [text, kind] = WMO[code] || ['Unsettled weather', 'cloud'];
    return { text, kind };
  };

  const iconFor = (code, isDay) => {
    let { kind } = describe(code);
    if (!isDay && kind === 'clear') kind = 'moon';
    if (!isDay && kind === 'partly') kind = 'cloud';
    return ICONS[kind]();
  };

  const moodFor = (code, isDay) => {
    if (!isDay) return 'night';
    const { kind } = describe(code);
    if (kind === 'rain' || kind === 'storm') return 'rain';
    if (kind === 'cloud' || kind === 'fog' || kind === 'snow') return 'cloudy';
    return 'sunny';
  };

  /* ---------- UI icons ---------- */
  const UI = {
    thermo:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0Z"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3Z"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/></svg>',
    arrow: (deg) =>
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${deg}deg);transition:transform .8s cubic-bezier(.16,1,.3,1)"><path d="M12 20V4M12 4l-5 5M12 4l5 5"/></svg>`,
    uv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z"/><path d="M5 19c3-4 6-7 9-9"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:4px;color:#FF8C42"><path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  };

  const toDisplay = (c) =>
    unit === 'C' ? Math.round(c) : Math.round((c * 9) / 5 + 32);
  const fmt = (c) => `${toDisplay(c)}°`;

  const clock = (iso) => {
    const h = +iso.slice(11, 13);
    return `${h % 12 || 12}:${iso.slice(14, 16)} ${h < 12 ? 'AM' : 'PM'}`;
  };
  const hourLabel = (iso) => {
    const h = +iso.slice(11, 13);
    return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
  };

  const COMPASS = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const compass = (deg) => COMPASS[Math.round(deg / 22.5) % 16];

  const uvInfo = (v) =>
    v < 3
      ? ['Low', '#7BC67E']
      : v < 6
        ? ['Moderate', '#FFB347']
        : v < 8
          ? ['High', '#FF8C42']
          : v < 11
            ? ['Very high', '#E85D5D']
            : ['Extreme', '#9B6BB5'];
  const aqiInfo = (v) =>
    v <= 50
      ? ['Good', '#7BC67E']
      : v <= 100
        ? ['Moderate', '#FFB347']
        : v <= 150
          ? ['Unhealthy for some', '#FF8C42']
          : v <= 200
            ? ['Unhealthy', '#E85D5D']
            : v <= 300
              ? ['Very unhealthy', '#9B6BB5']
              : ['Hazardous', '#8E3B46'];

  /* ---------- Recents (last 3, kept in localStorage) ---------- */
  const getRecents = () => {
    const r = store.get(RECENTS_KEY, []);
    return Array.isArray(r) ? r : [];
  };

  const saveRecent = (place) => {
    let list = getRecents().filter(
      (p) =>
        !(
          p.name === place.name &&
          p.country === place.country &&
          p.admin1 === place.admin1
        ),
    );
    list.unshift(place);
    store.set(RECENTS_KEY, list.slice(0, 3));
    renderRecents();
  };

  const renderRecents = () => {
    const list = getRecents();
    recentsWrap.hidden = list.length === 0;
    recentsChips.innerHTML = list
      .map(
        (p, i) =>
          `<button type="button" class="chip" data-recent="${i}" title="${esc(p.label)}">${esc(p.name)}</button>`,
      )
      .join('');
  };

  const renderPopular = () => {
    popularChips.innerHTML = POPULAR.map(
      (c) =>
        `<button type="button" class="chip" data-popular="${c}">${c}</button>`,
    ).join('');
  };

  recentsChips.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-recent]');
    if (!btn) return;
    const place = getRecents()[+btn.dataset.recent];
    if (place) loadPlace(place, { save: true });
  });

  popularChips.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-popular]');
    if (!btn) return;
    input.value = btn.dataset.popular;
    searchCity(btn.dataset.popular, { forcePK: true });
  });

  /* ---------- Scope: Pakistan / Worldwide ---------- */
  const applyScopeUI = () => {
    scopeBtns.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.scope === scope)),
    );
    input.placeholder =
      scope === 'PK'
        ? 'Search a Pakistani city, like Lahore'
        : 'Search any city, like Dubai';
  };

  scopeBtns.forEach((b) =>
    b.addEventListener('click', () => {
      scope = b.dataset.scope;
      store.set(SCOPE_KEY, scope);
      applyScopeUI();
    }),
  );

  /* ---------- Render: loading / error ---------- */
  const renderLoading = () => {
    results.innerHTML = `<div class="state"><div class="spinner"></div><p class="state__text">Checking the sky...</p></div>`;
  };

  const renderError = (title, message, canRetry = false) => {
    results.innerHTML = `
      <div class="state state--error">
        <svg class="state__icon" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M18 46h28a9 9 0 0 0 1.5-17.9A13 13 0 0 0 22.3 25 10 10 0 0 0 18 46Z" fill="#fff" stroke="#E85D5D" stroke-width="2" stroke-linejoin="round"/>
          <path d="M26 35q2-2.4 4 0M36 35q2-2.4 4 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M28 43q4-3 8 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        </svg>
        <h2 class="state__title">${esc(title)}</h2>
        <p class="state__msg">${esc(message)}</p>
        ${canRetry ? '<button type="button" class="state__retry" data-retry>Try again</button>' : ''}
      </div>`;
  };

  /* ---------- Render: dashboard ---------- */
  const sunArc = (r) => {
    const rise = Date.parse(r.sunrise),
      set = Date.parse(r.sunset),
      now = Date.parse(r.time);
    const raw = (now - rise) / (set - rise);
    const p = Math.min(1, Math.max(0, raw));
    const up = raw >= 0 && raw <= 1;
    const cx = 110 - 90 * Math.cos(Math.PI * p);
    const cy = 112 - 90 * Math.sin(Math.PI * p);
    const mins = Math.round((set - rise) / 60000);
    return `
      <svg viewBox="0 0 220 128" role="img" aria-label="Sun position between sunrise and sunset">
        <path d="M20 112A90 90 0 0 1 200 112" fill="none" stroke="rgba(45,42,50,.14)" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round"/>
        <path d="M20 112A90 90 0 0 1 200 112" pathLength="1" fill="none" stroke="#FFB347" stroke-width="5" stroke-linecap="round" stroke-dasharray="${p.toFixed(3)} 1"/>
        <line x1="6" y1="112" x2="214" y2="112" stroke="rgba(45,42,50,.18)" stroke-width="1.5"/>
        <g opacity="${up ? 1 : 0.55}">
          <circle class="sun__glow" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="14" fill="#FFB347"/>
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="9" fill="#FF8C42"/>
        </g>
      </svg>
      <p class="sun__mid">${up ? `${Math.floor(mins / 60)}h ${mins % 60}m of daylight today` : 'The sun is down right now'}</p>
      <div class="sun__row">
        <div><p class="sun__lbl">Sunrise</p><p class="sun__time">${clock(r.sunrise)}</p></div>
        <div><p class="sun__lbl">Sunset</p><p class="sun__time">${clock(r.sunset)}</p></div>
      </div>`;
  };

  const pill = (icon, label, value, sub, meter) => `
    <div class="pill">
      <span class="pill__icon">${icon}</span>
      <div>
        <p class="pill__label">${label}</p>
        <p class="pill__value">${value}</p>
        <p class="pill__sub">${sub}</p>
        ${meter ? `<span class="meter"><i style="width:${Math.max(4, Math.min(100, meter.pct))}%;background:${meter.color}"></i></span>` : ''}
      </div>
    </div>`;

  const countUp = (el, target) => {
    if (reduceMotion) {
      el.textContent = target;
      return;
    }
    const start = performance.now(),
      dur = 800;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const renderDashboard = (animate = true) => {
    if (!reading) return;
    const r = reading;
    const info = describe(r.code);
    document.body.dataset.mood = moodFor(r.code, r.isDay);
    document.title = `Nimbus | ${r.place.name} ${fmt(r.temp)}`;

    const dateText = new Date(r.time).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const uv = r.uv,
      [uvLabel, uvColor] = uvInfo(uv);
    const hasAqi = typeof r.aqi === 'number';
    const [aqiLabel, aqiColor] = hasAqi
      ? aqiInfo(r.aqi)
      : ['Not available', '#C9BDB5'];

    const hoursHtml = r.hours
      .map(
        (h, i) => `
      <div class="hour${i === 0 ? ' is-now' : ''}">
        <p class="hour__time">${i === 0 ? 'Now' : hourLabel(h.time)}</p>
        <div class="hour__icon">${iconFor(h.code, h.isDay)}</div>
        <p class="hour__temp">${fmt(h.temp)}</p>
        <p class="hour__rain">${h.rain >= 20 ? h.rain + '%' : ''}</p>
      </div>`,
      )
      .join('');

    const weekMin = Math.min(...r.days.map((d) => d.lo));
    const weekMax = Math.max(...r.days.map((d) => d.hi));
    const span = Math.max(1, weekMax - weekMin);
    const daysHtml = r.days
      .map((d, i) => {
        const left = ((d.lo - weekMin) / span) * 100;
        const width = Math.max(8, ((d.hi - d.lo) / span) * 100);
        const name =
          i === 0
            ? 'Today'
            : new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
              });
        return `
        <li class="day">
          <span class="day__name">${name}</span>
          <span class="day__icon">${iconFor(d.code, true)}</span>
          <span class="day__rain">${d.rain >= 20 ? d.rain + '%' : ''}</span>
          <span class="range">
            <span class="range__lo">${fmt(d.lo)}</span>
            <span class="range__track"><span class="range__fill" style="left:${left.toFixed(1)}%;width:${width.toFixed(1)}%"></span></span>
            <span class="range__hi">${fmt(d.hi)}</span>
          </span>
        </li>`;
      })
      .join('');

    results.innerHTML = `
      <div class="grid">
        <div class="col">
          <section class="card card--current" style="--i:0">
            <div class="cur__head">
              <div>
                <h2 class="cur__place">${UI.pin}${esc(r.place.name)}</h2>
                <p class="cur__date">${esc([r.place.admin1, r.place.country].filter(Boolean).join(', '))}</p>
                <p class="cur__date">${dateText}, local time ${clock(r.time)}</p>
              </div>
              <div class="unit" role="group" aria-label="Temperature unit">
                <button type="button" data-unit="C" class="${unit === 'C' ? 'is-active' : ''}">&deg;C</button>
                <button type="button" data-unit="F" class="${unit === 'F' ? 'is-active' : ''}">&deg;F</button>
              </div>
            </div>

            <div class="cur__main">
              <div class="cur__icon">${iconFor(r.code, r.isDay)}</div>
              <div>
                <p class="cur__temp"><span id="tempNum">${toDisplay(r.temp)}</span><span class="cur__deg">&deg;</span></p>
                <p class="cur__desc">${info.text}</p>
              </div>
            </div>

            <div class="hilo">
              <span>High<b>${fmt(r.days[0].hi)}</b></span>
              <span>Low<b>${fmt(r.days[0].lo)}</b></span>
            </div>
          </section>

          <section class="card card--stats" style="--i:2">
            <h3 class="card__title">Conditions</h3>
            <div class="stats">
              ${pill(UI.thermo, 'Feels like', fmt(r.feels), 'Apparent temperature')}
              ${pill(UI.drop, 'Humidity', r.humidity + '%', r.humidity > 70 ? 'Feels muggy' : r.humidity < 30 ? 'Very dry air' : 'Comfortable', { pct: r.humidity, color: '#5AA9E6' })}
              ${pill(UI.wind, 'Wind speed', Math.round(r.wind) + ' km/h', 'At 10 m height')}
              ${pill(UI.arrow(r.windDir + 180), 'Wind direction', compass(r.windDir), 'Coming from ' + Math.round(r.windDir) + '&deg;')}
              ${pill(UI.uv, 'UV index', uv.toFixed(1), uvLabel + ', max today', { pct: (uv / 11) * 100, color: uvColor })}
              ${pill(UI.leaf, 'Air quality', hasAqi ? r.aqi : '&ndash;', aqiLabel, hasAqi ? { pct: (r.aqi / 300) * 100, color: aqiColor } : null)}
            </div>
          </section>

          <section class="card card--sun sun" style="--i:4">
            <h3 class="card__title">Sunrise and sunset</h3>
            ${sunArc(r)}
          </section>
        </div>

        <div class="col">
          <section class="card card--hourly" style="--i:1">
            <h3 class="card__title">Next 24 hours</h3>
            <div class="hours" tabindex="0" aria-label="Hourly forecast, scroll sideways">${hoursHtml}</div>
          </section>

          <section class="card card--daily" style="--i:3">
            <h3 class="card__title">7-day forecast</h3>
            <ul class="days">${daysHtml}</ul>
          </section>
        </div>
      </div>`;

    if (animate) countUp($('tempNum'), toDisplay(r.temp));
  };

  /* ---------- Hourly strip: mouse wheel and drag to scroll sideways ---------- */
  results.addEventListener(
    'wheel',
    (e) => {
      const strip = e.target.closest('.hours');
      if (!strip || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const max = strip.scrollWidth - strip.clientWidth;
      if (
        (e.deltaY > 0 && strip.scrollLeft < max) ||
        (e.deltaY < 0 && strip.scrollLeft > 0)
      ) {
        e.preventDefault();
        strip.scrollLeft += e.deltaY;
      }
    },
    { passive: false },
  );

  let dragStrip = null,
    dragX = 0,
    dragLeft = 0;
  results.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    const strip = e.target.closest('.hours');
    if (!strip) return;
    dragStrip = strip;
    dragX = e.clientX;
    dragLeft = strip.scrollLeft;
    strip.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (dragStrip) dragStrip.scrollLeft = dragLeft - (e.clientX - dragX);
  });
  window.addEventListener('pointerup', () => {
    if (dragStrip) dragStrip.classList.remove('is-dragging');
    dragStrip = null;
  });

  results.addEventListener('click', (e) => {
    const u = e.target.closest('[data-unit]');
    if (u) {
      unit = u.dataset.unit;
      store.set(UNIT_KEY, unit);
      renderDashboard(false);
      return;
    }
    if (e.target.closest('[data-retry]') && lastAction) lastAction();
  });

  /* ---------- Data ---------- */
  const mapPlace = (g) => ({
    name: g.name,
    admin1: g.admin1 || '',
    country: g.country || '',
    lat: g.latitude,
    lon: g.longitude,
    label: [g.name, g.admin1, g.country].filter(Boolean).join(', '),
  });

  async function loadPlace(place, { save = true, id = ++requestId } = {}) {
    lastAction = () => loadPlace(place, { save });
    renderLoading();
    try {
      const fUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m` +
        `&hourly=temperature_2m,weather_code,precipitation_probability,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
        `&timezone=auto&forecast_days=7&wind_speed_unit=kmh`;
      const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.lat}&longitude=${place.lon}&current=us_aqi&timezone=auto`;

      const [wRes, aq] = await Promise.all([
        fetch(fUrl),
        fetch(aUrl)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      if (!wRes.ok) throw new Error('weather');
      const w = await wRes.json();
      if (id !== requestId) return;

      const cur = w.current,
        hr = w.hourly,
        d = w.daily;
      const startAt = cur.time.slice(0, 13) + ':00';
      const start = Math.max(
        0,
        hr.time.findIndex((t) => t >= startAt),
      );
      const hours = [];
      for (let i = start; i < start + 24 && i < hr.time.length; i++) {
        hours.push({
          time: hr.time[i],
          temp: hr.temperature_2m[i],
          code: hr.weather_code[i],
          rain: hr.precipitation_probability[i] || 0,
          isDay: !!hr.is_day[i],
        });
      }
      const days = d.time.map((date, i) => ({
        date,
        code: d.weather_code[i],
        hi: d.temperature_2m_max[i],
        lo: d.temperature_2m_min[i],
        rain: d.precipitation_probability_max[i] || 0,
      }));

      reading = {
        place,
        time: cur.time,
        temp: cur.temperature_2m,
        feels: cur.apparent_temperature,
        humidity: Math.round(cur.relative_humidity_2m),
        wind: cur.wind_speed_10m,
        windDir: cur.wind_direction_10m,
        code: cur.weather_code,
        isDay: !!cur.is_day,
        uv: d.uv_index_max[0] || 0,
        aqi: aq && aq.current ? aq.current.us_aqi : null,
        sunrise: d.sunrise[0],
        sunset: d.sunset[0],
        hours,
        days,
      };

      renderDashboard(true);
      if (save) saveRecent(place);
    } catch (err) {
      if (id === requestId)
        renderError(
          "Couldn't reach the weather service",
          'Check your internet connection, then try again.',
          true,
        );
    }
  }

  async function searchCity(raw, { forcePK = false, save = true } = {}) {
    const q = raw.trim();
    if (!q) {
      searchBox.classList.remove('is-shaking');
      void searchBox.offsetWidth;
      searchBox.classList.add('is-shaking');
      input.focus();
      return;
    }
    const id = ++requestId;
    const onlyPK = forcePK || scope === 'PK';
    lastAction = () => searchCity(raw, { forcePK, save });
    renderLoading();

    let match = null;
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json${onlyPK ? '&countryCode=PK' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('geo');
      const data = await res.json();
      if (id !== requestId) return;
      match = data.results && data.results[0];
    } catch (err) {
      if (id === requestId)
        renderError(
          "Couldn't reach the weather service",
          'Check your internet connection, then try again.',
          true,
        );
      return;
    }

    if (!match) {
      renderError(
        'City not found',
        `We couldn't find "${q}"${onlyPK ? ' in Pakistan' : ''}. Check the spelling and try again${scope === 'PK' && !forcePK ? ', or switch to Worldwide' : ''}.`,
      );
      return;
    }
    loadPlace(mapPlace(match), { save, id });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    searchCity(input.value);
  });

  /* ---------- Start ---------- */
  applyScopeUI();
  renderPopular();
  renderRecents();

  const recents = getRecents();
  if (recents.length) loadPlace(recents[0], { save: false });
  else searchCity('Islamabad', { forcePK: true, save: false });
});
