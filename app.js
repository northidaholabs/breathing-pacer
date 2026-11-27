'use strict';

// ---------- Storage (everything stays in this browser) ----------
const KEY = 'breathing-pacer-settings-v1';
const PIC_KEY = 'breathing-pacer-picture-v1';
const LOG_KEY = 'breathing-pacer-log-v1';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* nothing to do */ } },
};

// A child's own picture: shrunk to a small square and kept only on this device.
let pictureData = store.get(PIC_KEY);
if (pictureData && !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(pictureData)) pictureData = null;

// ---------- Shapes: quiet silhouettes and silly animals, all on the same motion ----------
// Animal faces: open eyes while breathing, happy closed eyes when the session is finished.
const INK = '#1D2530', PINK = '#FF8FA3', BEAK = '#F2A21E';
const LINE = `fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;
function eyes(x1, x2, y, r) {
  const arc = x => `<path d="M${x - r * 0.6} ${y + r * 0.25}q${r * 0.6} ${-r} ${r * 1.2} 0"/>`;
  return `<g fill="#fff"><circle cx="${x1}" cy="${y}" r="${r}"/><circle cx="${x2}" cy="${y}" r="${r}"/></g>`
    + `<g class="look" fill="${INK}"><circle cx="${x1}" cy="${y + 1}" r="${r * 0.5}"/><circle cx="${x2}" cy="${y + 1}" r="${r * 0.5}"/></g>`
    + `<g class="joy" ${LINE}>${arc(x1)}${arc(x2)}</g>`;
}
const cheeks = (x1, x2, y, r) => `<g fill="${PINK}" opacity=".7"><circle cx="${x1}" cy="${y}" r="${r}"/><circle cx="${x2}" cy="${y}" r="${r}"/></g>`;
const SPIKES = Array.from({ length: 11 }, (_, i) => {
  const a = (30 + i * 30) * Math.PI / 180, pt = (r, d) => `${(48 + r * Math.cos(a + d)).toFixed(1)} ${(52 + r * Math.sin(a + d)).toFixed(1)}`;
  return `M${pt(33, -0.17)}L${pt(47, 0)}L${pt(33, 0.17)}z`;
}).join('');

const SHAPES = {
  circle:  { name: 'Circle',  svg: '<circle cx="50" cy="50" r="50"/>' },
  balloon: { name: 'Balloon', svg: '<ellipse cx="50" cy="45" rx="39" ry="45"/><path d="M44 89h12l4 10H40z"/>' },
  rocket:  { name: 'Rocket',  svg: '<path d="M50 1C71 16 77 46 72 74H28C23 46 29 16 50 1z"/><path d="M29 54L10 82l20-6zM71 54l19 28-20-6z"/><path d="M38 76h24l-4 12H42z"/>' },
  whale:   { name: 'Whale',   svg: '<path d="M6 54C6 32 28 22 52 24c20 2 32 13 35 27 3-7 5-14 11-18 1 11 0 20-6 28-9 12-27 18-45 18C22 79 6 71 6 54z"/>' },
  moon:    { name: 'Moon',    svg: '<circle cx="50" cy="50" r="50"/><g fill="#000" opacity=".13"><circle cx="24" cy="34" r="9"/><circle cx="77" cy="68" r="10"/><circle cx="72" cy="23" r="5"/></g>' },
  frog:    { name: 'Frog', face: true, svg: '<ellipse cx="50" cy="62" rx="47" ry="35"/><circle cx="27" cy="27" r="18"/><circle cx="73" cy="27" r="18"/>'
    + eyes(27, 73, 27, 12) + cheeks(15, 85, 62, 6) + `<path d="M26 64q24 20 48 0" ${LINE}/>` },
  cat:     { name: 'Cat', face: true, svg: '<path d="M10 44L13 6l30 16zM90 44L87 6 57 22z"/><ellipse cx="50" cy="58" rx="44" ry="39"/>'
    + eyes(33, 67, 50, 10) + `<path d="M45 64h10l-5 6z" fill="${PINK}"/><path d="M40 73q5 6 10 0q5 6 10 0" ${LINE}/>`
    + `<path d="M3 60l17 4M3 73l17-2M97 60l-17 4M97 73l-17-2" ${LINE} stroke-width="2.5" opacity=".45"/>` },
  puffer:  { name: 'Puffer fish', face: true, svg: `<path d="${SPIKES}"/><path d="M80 52l18-15v30z"/><circle cx="48" cy="52" r="36"/>`
    + '<ellipse cx="48" cy="70" rx="23" ry="14" fill="#fff" opacity=".28"/>' + eyes(35, 61, 43, 10) + cheeks(24, 72, 60, 5)
    + `<ellipse cx="48" cy="66" rx="5" ry="6" fill="${INK}"/>` },
  penguin: { name: 'Penguin', face: true, svg: '<path d="M16 42C3 55 3 72 9 82l11-16zM84 42c13 13 13 30 7 40L80 66z"/><ellipse cx="50" cy="50" rx="36" ry="46"/>'
    + '<ellipse cx="50" cy="66" rx="24" ry="28" fill="#fff"/>' + eyes(38, 62, 27, 8)
    + `<path d="M43 38h14l-7 10z" fill="${BEAK}"/><g fill="${BEAK}"><ellipse cx="36" cy="95" rx="11" ry="4.5"/><ellipse cx="64" cy="95" rx="11" ry="4.5"/></g>` },
  bunny:   { name: 'Bunny', face: true, svg: '<ellipse cx="34" cy="25" rx="10" ry="24"/><ellipse cx="66" cy="25" rx="10" ry="24"/><ellipse cx="50" cy="66" rx="38" ry="33"/>'
    + `<g fill="${PINK}" opacity=".7"><ellipse cx="34" cy="26" rx="4.5" ry="15"/><ellipse cx="66" cy="26" rx="4.5" ry="15"/></g>`
    + eyes(36, 64, 58, 8) + cheeks(22, 78, 72, 5) + `<ellipse cx="50" cy="70" rx="4" ry="3" fill="${PINK}"/>`
    + `<path d="M43 77q3.5 5 7 0q3.5 5 7 0" ${LINE}/><rect x="46" y="81" width="8" height="8" rx="1.5" fill="#fff"/>` },
  monster: { name: 'Monster', face: true, svg: '<path d="M22 24L13 2l19 11zM78 24l9-22-19 11z"/><path d="M10 97V50C10 23 28 12 50 12s40 11 40 38v47l-13-9-13 9-14-9-14 9-13-9z"/>'
    + `<circle cx="50" cy="42" r="17" fill="#fff"/><circle class="look" cx="50" cy="44" r="8" fill="${INK}"/><path class="joy" d="M40 46q10 -16 20 0" ${LINE}/>`
    + `<path d="M29 68q21 17 42 0z" fill="${INK}"/><path d="M37 68l4 6 4-6zM55 68l4 6 4-6z" fill="#fff"/>` },
  own:     { name: 'My picture', get svg() {
    return pictureData
      ? `<defs><clipPath id="pic-clip"><circle cx="50" cy="50" r="50"/></clipPath></defs><image href="${pictureData}" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#pic-clip)"/>`
      : SHAPES.circle.svg;
  } },
};
// "Then" pictures for the first-then strip, drawn in the same flat style as the shapes.
const LINES = 'fill="none" stroke="#000" stroke-opacity=".2" stroke-width="5"';
const THEN = {
  none: '',
  book: '<path d="M47 24C37 16 22 14 8 18v60c14-4 29-2 39 6zM53 24c10-8 25-10 39-6v60c-14-4-29-2-39 6z"/>',
  snack: '<path d="M50 32c-10-8-36-6-36 22 0 22 14 40 25 40 5 0 7-2 11-2s6 2 11 2c11 0 25-18 25-40 0-28-26-30-36-22z"/><path d="M51 27c0-11 6-19 17-21-1 11-7 19-17 21z"/>',
  play: `<circle cx="50" cy="50" r="44"/><g ${LINES}><path d="M50 6c-20 14-20 74 0 88M50 6c20 14 20 74 0 88M6 50h88"/></g>`,
  outside: '<circle cx="50" cy="38" r="34"/><path d="M43 64h14v32H43z"/>',
  music: '<path d="M42 18l42-12v60h-9V24l-24 7v47h-9z"/><ellipse cx="34" cy="78" rx="17" ry="13"/><ellipse cx="67" cy="67" rx="17" ry="13"/>',
  rest: '<path d="M6 26h11v32h77v34H83V78H17v14H6z"/><rect x="22" y="42" width="27" height="13" rx="6.5"/><path d="M54 55c0-8 6-13 15-13h14c7 0 11 5 11 13z"/>',
};
const picture = key => `<svg viewBox="0 0 100 100" aria-hidden="true">${THEN[key]}</svg>`;
const silhouette = key => `<svg viewBox="0 0 100 100" aria-hidden="true">${SHAPES[key].svg}</svg>`;

// ---------- Settings ----------
const DEFAULTS = {
  pace: 10,            // breaths per minute
  stepDown: false,     // start a little faster, then slow to the set pace
  breaths: 5,          // session length, counted in breaths
  rhythm: 'even',      // 'even' | 'longout'
  driver: 'watch',     // 'watch' | 'hold' (press and hold to breathe in)
  pacer: 'rise',       // 'rise' | 'eight' | 'hand'
  soundButton: true,   // show the speaker on the child's screen
  soundOn: true,       // sound starts on; the speaker on the child's screen turns it off
  soundType: 'fun',    // 'tone' | 'voice' | 'fun'
  voice: '',           // name of an on-device voice, '' = device default
  volume: 'normal',    // 'quiet' | 'normal'
  words: false,
  palette: 'sky',      // 'light' | 'dark' | 'warm' | 'soft' | 'sky'
  shapeColor: 'rainbow',   // one colour, or 'rainbow': a new colour each breath
  motion: 'auto',      // 'auto' | 'move' | 'still'
  shape: 'frog',
  childChoice: true,   // child can pick the shape on their screen
  choices: ['frog', 'cat', 'puffer', 'penguin'],
  companion: false,    // a small friend breathes along
  again: true,         // show an "again" button on the finished screen
  cheer: true,         // stars for finished breaths, and a happy ending
  then: 'none',        // first-then strip
  progress: 'dots',    // 'dots' | 'wedge'
  record: false,       // keep a count of finished sessions on this device
};
const ENUMS = {
  rhythm: ['even', 'longout'], driver: ['watch', 'hold'], pacer: ['rise', 'eight', 'hand'],
  soundType: ['tone', 'voice', 'fun'], volume: ['quiet', 'normal'],
  palette: ['light', 'dark', 'warm', 'soft', 'sky'],
  shapeColor: ['rainbow', 'red', 'orange', 'pink', 'teal', 'purple', 'blue', 'green', 'plum', 'clay', 'slate'],
  motion: ['auto', 'move', 'still'], shape: Object.keys(SHAPES), then: Object.keys(THEN),
  progress: ['dots', 'wedge'],
};
const BOOLS = ['stepDown', 'soundButton', 'soundOn', 'words', 'childChoice', 'companion', 'again', 'cheer', 'record'];
const BREATHS = [3, 5, 8, 10, 15, 20, 30];
const VOLUME = { quiet: 0.035, normal: 0.08 };   // hard ceiling on tone loudness
const RAINBOW = ['green', 'teal', 'blue', 'purple', 'pink', 'red', 'orange'];
const STAR = 'M50 4l14 30 32 4-24 22 7 32-29-16-29 16 7-32L4 38l32-4z';
const STAR_COLORS = ['#EFAA00', '#E8503A', '#2FA36B', '#3B8FD9', '#EFAA00', '#C04FB0', '#F07F1E'];
const VOICE_VOLUME = { quiet: 0.45, normal: 0.85 };

// Quick setups change how much the child sees and hears. They leave pace and length alone.
// Quiet and Standard also swap an animal for a plain circle and a rainbow for one calm colour.
const PRESETS = {
  quiet:    { soundButton: false, palette: 'soft',  motion: 'still', words: false, childChoice: false, companion: false, again: false, cheer: false, progress: 'dots' },
  standard: { soundButton: true,  palette: 'light', motion: 'auto',  words: false, childChoice: false, companion: false, again: true,  cheer: false, progress: 'dots', soundType: 'tone', volume: 'quiet' },
  fun:      { soundButton: true,  soundOn: true, palette: 'sky',   motion: 'auto',  words: false, childChoice: true,  companion: false, again: true,  cheer: true,  progress: 'dots', soundType: 'fun', volume: 'normal',
              shape: 'frog', choices: ['frog', 'cat', 'puffer', 'penguin'], shapeColor: 'rainbow' },
  more:     { soundButton: true,  soundOn: true, palette: 'sky',   motion: 'move',  words: true,  childChoice: true,  companion: true,  again: true,  cheer: true,  progress: 'dots', soundType: 'fun', volume: 'normal' },
};
function applyPreset(name) {
  Object.assign(s, PRESETS[name]);
  if (name === 'quiet' || name === 'standard') {
    if (SHAPES[s.shape].face) s.shape = 'circle';
    if (s.shapeColor === 'rainbow') s.shapeColor = 'blue';
  }
}

// Anything read from storage or a link goes through here, so bad values fall back to defaults.
function sanitize(o) {
  const out = { ...DEFAULTS };
  if (!o || typeof o !== 'object') return out;
  for (const k in ENUMS) if (ENUMS[k].includes(o[k])) out[k] = o[k];
  for (const k of BOOLS) if (typeof o[k] === 'boolean') out[k] = o[k];
  const pace = Math.round(Number(o.pace) * 2) / 2;
  if (pace >= 7 && pace <= 14) out.pace = pace;
  if (BREATHS.includes(Number(o.breaths))) out.breaths = Number(o.breaths);
  if (Array.isArray(o.choices)) {
    const c = [...new Set(o.choices.filter(k => k in SHAPES && (k !== 'own' || pictureData)))].slice(0, 4);
    if (c.length >= 2) out.choices = c;
  }
  if (out.shape === 'own' && !pictureData) out.shape = 'circle';
  if (typeof o.voice === 'string') out.voice = o.voice.slice(0, 100);
  return out;
}
// Setups saved before the fun look existed move to Fun once. After that, whatever a grown-up picks stays.
const LOOK = 2;
function load() {
  try {
    const o = JSON.parse(store.get(KEY) || '{}'), out = sanitize(o);
    if (store.get(KEY) && o.look !== LOOK) Object.assign(out, PRESETS.fun);
    return out;
  } catch { return { ...DEFAULTS }; }
}
function save() { store.set(KEY, JSON.stringify({ ...s, look: LOOK })); }   // still works without storage
const s = load();

// ---------- Preset links: settings only, in the part of the address after # ----------
// The picture and the session record never go in a link.
const LINK = { p: 'pace', sd: 'stepDown', b: 'breaths', r: 'rhythm', dr: 'driver', pc: 'pacer', sb: 'soundButton', st: 'soundType',
  v: 'volume', w: 'words', c: 'palette', sc: 'shapeColor', m: 'motion', sh: 'shape', cc: 'childChoice', ch: 'choices',
  co: 'companion', a: 'again', ce: 'cheer', t: 'then', pr: 'progress' };

function presetLink() {
  const q = new URLSearchParams();
  for (const [short, key] of Object.entries(LINK)) {
    let v = s[key];
    if (key === 'shape' && v === 'own') v = 'circle';
    if (key === 'choices') v = v.filter(k => k !== 'own');
    q.set(short, Array.isArray(v) ? v.join('.') : typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  return `${location.origin}${location.pathname}#${q}`;
}
function applyPresetLink() {
  const q = new URLSearchParams(location.hash.slice(1));
  const next = { ...s };
  let found = false;
  for (const [short, key] of Object.entries(LINK)) {
    if (!q.has(short)) continue;
    found = true;
    const raw = q.get(short);
    next[key] = key === 'choices' ? raw.split('.') : BOOLS.includes(key) ? raw === '1'
      : (key === 'pace' || key === 'breaths') ? Number(raw) : raw;
  }
  if (!found) return;
  Object.assign(s, sanitize(next), { soundOn: s.soundOn, record: s.record });   // a link never changes sound on or off, or the record
  save();
  history.replaceState(null, '', location.pathname + location.search);
}

// ---------- Elements ----------
const $ = id => document.getElementById(id);
const child = $('child'), settings = $('settings');
const shape = $('shape'), sil = $('sil'), track = $('track'), guide = $('guide'), pal = $('pal');
const word = $('word'), strip = $('strip'), status = $('status');
const dots = $('dots'), wedge = $('wedge'), choices = $('choices'), stars = $('stars');
const stopBtn = $('stop'), adultsBtn = $('adults'), soundBtn = $('sound'), againBtn = $('again');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------- Timing ----------
// One breath = in, out, then a brief settle at the bottom. No holds.
function timing(period) {
  const settle = Math.min(0.5, period * 0.06);
  const active = period - settle;
  const inTime = active * (s.rhythm === 'longout' ? 0.45 : 0.5);
  return { inTime, outTime: active - inTime };
}
// The plan for a session: when each breath starts and how long it lasts.
// With "start a little faster", the first breaths are quicker and ease down to the set pace.
function schedule() {
  const k = Math.ceil(s.breaths * 0.6), list = [];
  let t = 0;
  for (let i = 0; i < s.breaths; i++) {
    const extra = s.stepDown && i < k ? 3 * (1 - i / k) : 0;
    const period = 60 / (s.pace + extra);
    list.push({ start: t, period });
    t += period;
  }
  return { list, total: t };
}
const ease = x => (1 - Math.cos(Math.PI * x)) / 2;   // smooth, no bounce
const isStill = () => child.dataset.motion === 'still';
const holding = () => s.driver === 'hold';

// ---------- Path pacers: a figure of eight, or the outline of a hand ----------
// The hand is drawn in a 100 x 100 box: wrist, thumb, four fingers, wrist.
// Each finger: base [x, y], lean in degrees, length, half width, and how far up the inner side starts.
const FINGERS = [
  { b: [27, 68], a: -48, L: 27, hw: 6, ro: 10 },    // thumb
  { b: [34, 46], a: -8, L: 34, hw: 5.2 },
  { b: [49, 43], a: 0, L: 38, hw: 5.4 },
  { b: [64, 45], a: 8, L: 35, hw: 5.2 },
  { b: [78, 52], a: 20, L: 27, hw: 4.6 },
];
const WRIST = [[32, 97], [71, 97]];
const GUIDE_H = { eight: 50, hand: 100 };
const SEG_N = 48;

// Ten pieces of outline: up and down each finger, split at the tips and at the webs between fingers.
const HAND = (() => {
  const axes = f => { const r = f.a * Math.PI / 180; return { up: [Math.sin(r), -Math.cos(r)], right: [Math.cos(r), Math.sin(r)] }; };
  const at = (f, u, v) => { const { up, right } = axes(f); return [f.b[0] + u * right[0] + v * up[0], f.b[1] + u * right[1] + v * up[1]]; };
  const side = (f, dir) => {                       // one side of a finger with a quarter-round tip
    const pts = [], lo = dir === 'up' ? 0 : (f.ro || 0), sgn = dir === 'up' ? -1 : 1;
    pts.push(at(f, sgn * f.hw, lo));
    for (let i = 0; i <= 12; i++) { const th = Math.PI / 2 * i / 12; pts.push(at(f, sgn * f.hw * Math.cos(th), f.L - f.hw + f.hw * Math.sin(th))); }
    return dir === 'up' ? pts : pts.reverse();
  };
  const bez = (p0, p1, p2, p3, t0, t1) => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = t0 + (t1 - t0) * i / 16, m = 1 - t;
      pts.push([0, 1].map(k => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]));
    }
    return pts;
  };
  const web = (f, g, t0, t1) => {                  // the rounded dip between two fingers
    const A = at(f, f.hw, f.ro || 0), B = at(g, -g.hw, 0), d = 0.75 * Math.hypot(B[0] - A[0], B[1] - A[1]);
    const fu = axes(f).up, gu = axes(g).up;
    return bez(A, [A[0] - d * fu[0], A[1] - d * fu[1]], [B[0] - d * gu[0], B[1] - d * gu[1]], B, t0, t1);
  };
  const resample = pts => {                        // even steps along the line
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const out = [];
    for (let k = 0, j = 1; k < SEG_N; k++) {
      const want = len[len.length - 1] * k / (SEG_N - 1);
      while (j < pts.length - 1 && len[j] < want) j++;
      const span = len[j] - len[j - 1] || 1, x = (want - len[j - 1]) / span;
      out.push([(pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * x) / 100, (pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * x) / 100]);
    }
    return out;
  };
  const segs = [], F = FINGERS, last = F.length - 1;
  F.forEach((f, i) => {
    const up = axes(f).up, L0 = at(f, -f.hw, 0), R0 = at(f, f.hw, f.ro || 0);
    const lead = i === 0
      ? bez(WRIST[0], [WRIST[0][0], WRIST[0][1] - 10], [L0[0] - 8 * up[0], L0[1] - 8 * up[1]], L0, 0, 1)
      : web(F[i - 1], f, 0.5, 1);
    const tail = i === last
      ? bez(R0, [R0[0] - 24 * up[0], R0[1] - 24 * up[1]], [WRIST[1][0] + 3, WRIST[1][1] - 16], WRIST[1], 0, 1)
      : web(f, F[i + 1], 0, 0.5);
    segs.push(resample([...lead, ...side(f, 'up')]), resample([...side(f, 'down'), ...tail]));
  });
  return segs;
})();

// Breaths 1 to 5 go thumb to little finger; 6 to 10 come back the other way, so the shape never jumps.
function handPoint(n, phase, x) {
  const back = Math.floor(n / 5) % 2 === 1, f = back ? 4 - n % 5 : n % 5;
  const seg = HAND[2 * f + ((phase === 'out') !== back ? 1 : 0)];
  const pos = ease(x) * (SEG_N - 1), i = Math.min(SEG_N - 2, Math.floor(pos)), r = pos - i;
  const a = seg[back ? SEG_N - 1 - i : i], b = seg[back ? SEG_N - 2 - i : i + 1];
  return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
}
function pathPoint(n, phase, x) {
  if (child.dataset.pacer === 'eight') {
    const th = phase === 'in' ? Math.PI * x : Math.PI + Math.PI * x;   // one loop in, the other loop out
    return [0.5 + 0.38 * Math.sin(th), 0.5 - 0.34 * Math.sin(2 * th)];
  }
  return handPoint(n, phase, x);                                       // up a finger in, down it out
}
function drawGuide() {
  const kind = child.dataset.pacer;
  if (kind === 'rise') { guide.innerHTML = ''; return; }
  const h = GUIDE_H[kind], pts = [];
  if (kind === 'eight') for (let i = 0; i <= 96; i++) { const th = 2 * Math.PI * i / 96; pts.push([0.5 + 0.38 * Math.sin(th), 0.5 - 0.34 * Math.sin(2 * th)]); }
  else HAND.forEach(seg => pts.push(...seg));
  guide.setAttribute('viewBox', `0 0 100 ${h}`);
  guide.innerHTML = `<polyline points="${pts.map(p => `${(p[0] * 100).toFixed(1)},${(p[1] * h).toFixed(1)}`).join(' ')}"/>`;
}
function restPoint(finished) {
  if (child.dataset.pacer === 'eight') return [0.5, 0.5];
  return finished ? handPoint(s.breaths - 1, 'out', 1) : HAND[0][0];
}

// ---------- Session ----------
let state = 'ready';     // 'ready' | 'running' | 'done'
let t0 = 0, raf = 0, plan = null, cur = 0, lastBreath = -1, lastPhase = '', wakeLock = null;
let held = false, hx = 0, peaked = false, count = 0, lastT = 0;   // press-and-hold mode

function setState(next) {
  state = next;
  child.dataset.state = next;
  stopBtn.hidden = next !== 'running';
  adultsBtn.hidden = next === 'running';
  againBtn.hidden = !(next === 'done' && s.again);
  choices.hidden = !(s.childChoice && next !== 'running');
  strip.hidden = !(s.then !== 'none' && next !== 'running');
  if (next !== 'running') { delete child.dataset.phase; word.textContent = ''; }
}

// Breaths left: dots (one per breath) or a shrinking circle.
function drawProgress(current, fraction) {
  if (dots.children.length !== s.breaths) {
    dots.replaceChildren(...Array.from({ length: s.breaths }, () => document.createElement('li')));
    dots.classList.toggle('many', s.breaths > 12);
  }
  [...dots.children].forEach((li, i) => {
    if (s.shapeColor === 'rainbow') li.dataset.shapeColor = RAINBOW[i % RAINBOW.length]; else delete li.dataset.shapeColor;
    li.classList.toggle('done', i < current);
    li.classList.toggle('now', i === current && state === 'running');
  });
  wedge.style.setProperty('--left', String(1 - (fraction ?? current / s.breaths)));
}

// Rainbow: the shape takes a new colour each breath.
function tint(i) {
  document.documentElement.dataset.shapeColor = s.shapeColor === 'rainbow' ? RAINBOW[i % RAINBOW.length] : s.shapeColor;
}

// p is how "breathed in" the shape is (0 to 1). pos is where it sits on a path pacer.
function place(p, pos) {
  sil.style.scale = (!isStill() && SHAPES[s.shape].face) ? String(0.86 + 0.14 * p) : '';   // animals puff up as they breathe in
  if (isStill()) {
    shape.style.transform = '';
    shape.style.opacity = 0.3 + 0.7 * p;
  } else if (child.dataset.pacer === 'rise') {
    const travel = track.clientHeight - shape.offsetHeight;
    shape.style.transform = `translateY(${-p * travel}px)`;
    shape.style.opacity = '';
  } else {
    const d = shape.offsetWidth;
    shape.style.transform = `translate(${pos[0] * track.clientWidth - d / 2}px, ${pos[1] * track.clientHeight - d / 2}px)`;
    shape.style.opacity = '';
  }
  pal.style.transform = isStill() ? '' : `scale(${1 + 0.12 * p})`;
}
function rest(finished) {
  place(0, restPoint(finished));
  if (isStill()) shape.style.opacity = '';
}

function showPhase(phase) {
  if (phase === lastPhase) return;
  lastPhase = phase;
  if (!phase) { delete child.dataset.phase; word.textContent = ''; return; }
  child.dataset.phase = phase;
  if (s.words) word.textContent = phase === 'in' ? 'Breathe in' : 'Breathe out';
  if (soundActive() && s.soundType === 'voice') say(phase === 'in' ? 'In' : 'Out');
}

function start() {
  if (state === 'running') return;
  setState('running');
  plan = schedule(); cur = 0; lastBreath = -1; lastPhase = '';
  hx = 0; peaked = false; count = 0; held = false;
  t0 = lastT = performance.now();
  tint(0);
  audioStart();
  if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { wakeLock = l; }).catch(() => {});
  status.textContent = 'Started';
  drawProgress(0);
  raf = requestAnimationFrame(holding() ? holdFrame : frame);
}

// Watch mode: the shape leads and the child follows.
function frame(now) {
  if (state !== 'running') return;
  const t = (now - t0) / 1000;
  if (t >= plan.total) return end('done');
  while (cur < plan.list.length - 1 && t >= plan.list[cur + 1].start) cur++;
  const { inTime, outTime } = timing(plan.list[cur].period);

  const u = t - plan.list[cur].start;
  let phase, x, p;
  if (u < inTime) { phase = 'in'; x = u / inTime; p = ease(x); }
  else if (u < inTime + outTime) { phase = 'out'; x = (u - inTime) / outTime; p = 1 - ease(x); }
  else { phase = 'out'; x = 1; p = 0; }

  place(p, child.dataset.pacer === 'rise' ? null : pathPoint(cur, phase, x));
  audioSet(Math.sin(Math.PI * x), p);
  showPhase(phase);
  if (cur !== lastBreath) { if (lastBreath >= 0) pop(); lastBreath = cur; tint(cur); drawProgress(cur); }
  // The shrinking circle moves smoothly, or once per breath in still mode.
  if (s.progress === 'wedge' && !isStill()) wedge.style.setProperty('--left', String(1 - t / plan.total));
  raf = requestAnimationFrame(frame);
}

// Press-and-hold mode: the child leads. Holding raises the shape slowly, letting go lowers it slowly.
// There is no clock to beat. A breath counts whenever the shape comes back down.
function holdFrame(now) {
  if (state !== 'running') return;
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
  const { inTime, outTime } = timing(60 / s.pace);
  hx = Math.max(0, Math.min(1, hx + (held ? dt / inTime : -dt / outTime)));
  if (hx > 0.3) peaked = true;
  place(ease(hx));
  audioSet(Math.sin(Math.PI * hx), ease(hx));
  showPhase(held ? 'in' : hx > 0 ? 'out' : '');
  if (hx === 0 && peaked) {
    peaked = false; count++;
    if (count >= s.breaths) return end('done');
    pop(); tint(count); drawProgress(count);
  }
  raf = requestAnimationFrame(holdFrame);
}

// Stopping early and finishing look almost the same: the shape comes to rest.
function end(how) {
  cancelAnimationFrame(raf);
  audioStop();
  held = false;
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  rest(how === 'done');
  setState(how === 'done' ? 'done' : 'ready');
  drawProgress(how === 'done' ? s.breaths : 0);
  status.textContent = how === 'done' ? 'Finished' : 'Stopped';
  if (how === 'done') { tune(0.15 + animalSound(s.shape, 0.15)); logSession(); }
}

// ---------- Sound: starts on, and the speaker button turns it off ----------
let ctx = null, osc = null, gain = null;
const soundActive = () => s.soundOn && s.soundButton;

// Tone: one soft low sine that rises on the in-breath and falls on the out-breath.
function audioStart() {
  if (!soundActive() || s.soundType === 'voice') return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = ctx || new AC();
  ctx.resume();
  osc = ctx.createOscillator(); gain = ctx.createGain();
  osc.type = funSound() ? 'triangle' : 'sine'; osc.frequency.value = funSound() ? 330 : 165; gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
}
// level and pitch both run 0 to 1. The tone fades in and out every half breath.
function audioSet(level, pitch) {
  if (!osc) return;
  const now = ctx.currentTime;
  const fun = osc.type === 'triangle';
  gain.gain.setTargetAtTime(VOLUME[s.volume] * level * (fun ? 0.7 : 1), now, 0.06);
  osc.frequency.setTargetAtTime(fun ? 330 + 330 * pitch : 165 + 55 * pitch, now, 0.06);
}
// Fun noises: a slide whistle with the breath, a bloop as each breath lands, a short tune at the end.
// Same volume ceiling as the tone.
const funSound = () => soundActive() && s.soundType === 'fun';
function blip(from, to, wait, len, type) {
  if (!audioCtx()) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + wait;
  o.type = type || 'sine';
  o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(VOLUME[s.volume], t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + len + 0.05);
}
function pop() { if (funSound()) blip(520, 1040, 0, 0.12); }
function tune(wait) { if (funSound()) [523, 659, 784, 1047].forEach((f, i) => blip(f, f, wait + i * 0.14, 0.24, 'triangle')); }

// Animal noises, made on the device from simple tones. Each one is short and uses the same volume ceiling.
// A note: wave type, pitches to glide through (Hz), length (s), start (s), and optional
// flutter (am, Hz), wobble (vib: [rate, depth]) and a soft top end (lp, Hz).
const NOISES = {
  frog:    { len: 0.4, notes: [{ type: 'sawtooth', f: [170, 230], len: 0.13, am: 38, lp: 1400, vol: 0.85 }, { type: 'sawtooth', f: [240, 330], len: 0.2, at: 0.17, am: 38, lp: 1600, vol: 0.85 }] },   // rib-bit
  cat:     { len: 0.65, notes: [{ type: 'sawtooth', f: [520, 820, 780, 480], len: 0.6, lp: 1800, vol: 0.7 }] },                                                                    // meow
  puffer:  { len: 0.4, notes: [0, 0.09, 0.2, 0.27].map((at, i) => ({ f: [350 + i * 90, 900 + i * 150], len: 0.08, at })) },                                                        // bubbles
  penguin: { len: 0.5, notes: [{ type: 'square', f: [420, 360], len: 0.16, am: 30, lp: 1500, vol: 0.6 }, { type: 'square', f: [440, 340], len: 0.22, at: 0.22, am: 30, lp: 1500, vol: 0.6 }] },   // honk honk
  bunny:   { len: 0.55, notes: [{ f: [260, 620, 300], len: 0.22, vib: [14, 40] }, { f: [300, 700, 340], len: 0.24, at: 0.26, vib: [14, 40] }] },                                   // boing boing
  monster: { len: 0.75, notes: [{ type: 'sawtooth', f: [120, 90, 180], len: 0.55, am: 20, lp: 700, vol: 0.85 }, { f: [500, 900], len: 0.1, at: 0.6 }] },                                      // a goofy "blurgh-bip"
};
function audioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = ctx || new AC();
  ctx.resume();
  return ctx;
}
function note(o, wait) {
  const c = audioCtx(); if (!c) return;
  const t = c.currentTime + wait + (o.at || 0), end = t + o.len, peak = VOLUME[s.volume] * (o.vol || 1);
  const src = c.createOscillator(), g = c.createGain(), extra = [];
  src.type = o.type || 'sine';
  src.frequency.setValueAtTime(o.f[0], t);
  o.f.slice(1).forEach((f, i, rest) => src.frequency.exponentialRampToValueAtTime(f, t + o.len * (i + 1) / rest.length));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + Math.min(0.03, o.len / 4));
  g.gain.setValueAtTime(peak, t + o.len * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  let out = src;
  if (o.lp) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; out.connect(lp); out = lp; }
  if (o.am) {                                      // flutter: the level dips and returns many times a second
    const lfo = c.createOscillator(), depth = c.createGain(), trem = c.createGain();
    lfo.frequency.value = o.am; depth.gain.value = 0.5; trem.gain.value = 0.5;
    lfo.connect(depth).connect(trem.gain); out.connect(trem); out = trem; extra.push(lfo);
  }
  if (o.vib) {                                     // wobble: the pitch wavers
    const lfo = c.createOscillator(), depth = c.createGain();
    lfo.frequency.value = o.vib[0]; depth.gain.value = o.vib[1];
    lfo.connect(depth).connect(src.frequency); extra.push(lfo);
  }
  out.connect(g).connect(c.destination);
  for (const n of [src, ...extra]) { n.start(t); n.stop(end + 0.05); }
}
// Plays the animal's noise and says how long it lasts, so the end tune can wait for it.
function animalSound(key, wait = 0) {
  const n = NOISES[key];
  if (!n || !funSound()) return 0;
  n.notes.forEach(o => note(o, wait));
  return n.len;
}
function audioStop() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (!osc) return;
  const o = osc, now = ctx.currentTime;
  gain.gain.setTargetAtTime(0, now, 0.08);
  o.stop(now + 0.6);
  osc = null; gain = null;
}

// Voice: the device says "In" and "Out". Only voices stored on the device are offered,
// so no words are sent to a speech service.
function deviceVoices() {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter(v => v.localService && v.lang.toLowerCase().startsWith('en'));
}
function say(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = deviceVoices().find(v => v.name === s.voice);
  if (v) u.voice = v;
  u.lang = v ? v.lang : 'en';
  u.rate = 0.8; u.pitch = 0.9; u.volume = VOICE_VOLUME[s.volume];
  speechSynthesis.speak(u);
}

// ---------- A quiet record, only if a grown-up turns it on ----------
// One count per day of sessions that reached the end. No streaks, no targets. Never shown to the child.
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function readLog() {
  try { const o = JSON.parse(store.get(LOG_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; }
  catch { return {}; }
}
function logSession() {
  if (!s.record) return;
  const log = readLog(), today = dayKey(new Date());
  log[today] = (Number(log[today]) || 0) + 1;
  const keep = Object.keys(log).sort().slice(-60);
  store.set(LOG_KEY, JSON.stringify(Object.fromEntries(keep.map(k => [k, log[k]]))));
}

// ---------- Child screen controls ----------
function showSound() {
  soundBtn.hidden = !s.soundButton;
  soundBtn.setAttribute('aria-pressed', String(soundActive()));
}
soundBtn.addEventListener('click', e => {
  e.stopPropagation();
  s.soundOn = !s.soundOn; save(); showSound();
  if (state === 'running') { s.soundOn ? audioStart() : audioStop(); }
});
stopBtn.addEventListener('click', e => { e.stopPropagation(); end('stop'); });
adultsBtn.addEventListener('click', e => { e.stopPropagation(); openSettings(); });
againBtn.addEventListener('click', e => { e.stopPropagation(); rest(false); start(); });
choices.addEventListener('click', e => {
  e.stopPropagation();
  const b = e.target.closest('button'); if (!b) return;
  s.shape = b.dataset.shape; save();
  animalSound(s.shape);
  if (state === 'done') { setState('ready'); drawProgress(0); rest(false); }
  drawShape();
});

// Tap anywhere: start, or clear the finished screen. A tap never stops a session.
child.addEventListener('click', () => {
  if (state === 'ready' && !holding()) start();
  else if (state === 'done') { setState('ready'); drawProgress(0); rest(false); }
});
// Press and hold: pressing starts the session and the first in-breath together.
function press() {
  if (!holding() || state === 'done') return;
  if (state === 'ready') start();
  held = true;
}
child.addEventListener('pointerdown', e => { if (!e.target.closest('button')) press(); });
window.addEventListener('pointerup', () => { held = false; });
window.addEventListener('pointercancel', () => { held = false; });
child.addEventListener('contextmenu', e => { if (holding()) e.preventDefault(); });

document.addEventListener('keydown', e => {
  if (!settings.hidden) { if (e.key === 'Escape') closeSettings(); return; }
  if (e.key === 'Escape' && state === 'running') return end('stop');
  if (e.target.closest('button')) return;
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (holding() && state !== 'done') { if (!e.repeat) press(); }
    else if (!e.repeat) child.click();
  }
});
document.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') held = false; });
// If the page is hidden mid-session, stop quietly so it never jumps ahead.
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'running') end('stop'); });
window.addEventListener('resize', () => { if (state !== 'running') rest(state === 'done'); });

// ---------- Look ----------
function drawShape() {
  sil.innerHTML = SHAPES[s.shape].svg;
  child.toggleAttribute('data-own', s.shape === 'own' && !!pictureData);
  child.toggleAttribute('data-face', !!SHAPES[s.shape].face);
  choices.replaceChildren(...s.choices.map(key => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tool pick'; b.dataset.shape = key;
    b.setAttribute('aria-label', SHAPES[key].name);
    b.setAttribute('aria-pressed', String(key === s.shape));
    b.innerHTML = silhouette(key);
    return b;
  }));
  strip.innerHTML = s.then === 'none' ? '' :
    `${silhouette(s.shape)}<svg class="arrow" viewBox="0 0 48 48" aria-hidden="true"><path d="M8 24h28M26 13l11 11-11 11" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>${picture(s.then)}`;
}
function applyLook() {
  const root = document.documentElement;
  root.dataset.palette = s.palette;
  tint(0);
  child.toggleAttribute('data-cheer', s.cheer);
  const still = s.motion === 'still' || (s.motion === 'auto' && reducedMotion.matches);
  child.dataset.motion = still ? 'still' : 'move';
  // Path pacers need movement and a shape that leads, so still mode and press-and-hold use up and down.
  child.dataset.pacer = (still || holding()) ? 'rise' : s.pacer;
  child.dataset.driver = s.driver;
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]').content = bg;
  dots.hidden = s.progress !== 'dots';
  wedge.hidden = s.progress !== 'wedge';
  pal.toggleAttribute('hidden', !s.companion);   // SVG elements have no .hidden property
  showSound();
  drawShape();
  drawGuide();
  setState(state);
  drawProgress(0);
  rest(false);
}
reducedMotion.addEventListener('change', applyLook);

// ---------- Grown-ups screen ----------
const CHIPS = ['stepDown', 'breaths', 'rhythm', 'driver', 'pacer', 'soundButton', 'soundType', 'volume', 'words', 'palette',
  'shapeColor', 'motion', 'shape', 'childChoice', 'companion', 'again', 'cheer', 'then', 'progress', 'record'];

function seconds(n) {
  const r = Math.round(n);
  return r < 60 ? `${r} seconds` : `${Math.floor(r / 60)} min ${String(r % 60).padStart(2, '0')} s`;
}
function fillVoices() {
  const list = deviceVoices(), sel = $('voice');
  sel.replaceChildren(new Option('This device\'s usual voice', ''), ...list.map(v => new Option(`${v.name} (${v.lang})`, v.name)));
  sel.value = list.some(v => v.name === s.voice) ? s.voice : '';
}
function showRecord() {
  $('record-more').hidden = !s.record;
  if (!s.record) return;
  const log = readLog(), rows = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const li = document.createElement('li');
    li.textContent = `${d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}: ${Number(log[dayKey(d)]) || 0}`;
    rows.push(li);
  }
  $('record-out').replaceChildren(...rows);
}
function showSettings() {
  $('pace').value = s.pace;
  $('pace-out').textContent = `${s.pace} breaths a minute (each breath lasts ${(60 / s.pace).toFixed(1)} seconds)`;
  $('breaths-out').textContent = holding()
    ? `${s.breaths} breaths, at the child's own speed`
    : `${s.breaths} breaths takes about ${seconds(schedule().total)}`;
  for (const b of $('age').children) b.setAttribute('aria-pressed', String(Number(b.dataset.pace) === s.pace));
  for (const id of CHIPS) for (const b of $('set-' + id).children) b.setAttribute('aria-pressed', String(b.dataset.v === String(s[id])));
  for (const b of $('choices-set').children) b.setAttribute('aria-pressed', String(s.choices.includes(b.dataset.v)));
  for (const b of document.querySelectorAll('[data-v="own"]')) b.hidden = !pictureData;
  $('remove-picture').hidden = !pictureData;
  $('sound-more').hidden = !s.soundButton;
  $('voice-row').hidden = s.soundType !== 'voice';
  $('choices-wrap').hidden = !s.childChoice;
  $('pacer-wrap').hidden = holding();
  $('set-stepDown').hidden = holding();
  showRecord();
  $('link').value = presetLink();
  $('copy').textContent = 'Copy link';
}
function change(key, value) { s[key] = value; save(); applyLook(); showSettings(); }

$('presets').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  applyPreset(b.dataset.preset); save(); applyLook(); showSettings();
});
$('age').addEventListener('click', e => { const b = e.target.closest('button'); if (b) change('pace', Number(b.dataset.pace)); });
$('pace').addEventListener('input', e => change('pace', Number(e.target.value)));
for (const id of CHIPS) {
  $('set-' + id).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.v;
    change(id, id === 'breaths' ? Number(v) : (v === 'true' ? true : v === 'false' ? false : v));
    if (id === 'shape') animalSound(v);
  });
}
// Shapes offered to the child: between two and four.
$('choices-set').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const has = s.choices.includes(b.dataset.v);
  if (has && s.choices.length <= 2) return;
  if (!has && s.choices.length >= 4) return;
  const next = has ? s.choices.filter(k => k !== b.dataset.v) : [...s.choices, b.dataset.v];
  change('choices', Object.keys(SHAPES).filter(k => next.includes(k)));
});

// The child's own picture: cropped to a small square here in the browser. It is never uploaded.
$('picture-file').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  try {
    const img = await createImageBitmap(file);
    const side = Math.min(img.width, img.height), c = document.createElement('canvas');
    c.width = c.height = 320;
    c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 320, 320);
    const data = c.toDataURL('image/jpeg', 0.85);
    if (!store.set(PIC_KEY, data)) throw new Error('storage');
    pictureData = data;
    $('picture-note').textContent = '';
    change('shape', 'own');
  } catch {
    $('picture-note').textContent = 'That picture could not be used. Try a photo or a PNG or JPEG image.';
  }
});
$('remove-picture').addEventListener('click', () => {
  pictureData = null; store.del(PIC_KEY);
  const left = s.choices.filter(k => k !== 'own');
  s.choices = left.length >= 2 ? left : [...DEFAULTS.choices];
  change('shape', s.shape === 'own' ? 'circle' : s.shape);
});
$('clear-record').addEventListener('click', () => { store.del(LOG_KEY); showRecord(); });

$('voice').addEventListener('change', e => change('voice', e.target.value));
$('try-voice').addEventListener('click', () => say('In. Out.'));
$('copy').addEventListener('click', () => {
  const field = $('link');
  const done = () => { $('copy').textContent = 'Copied'; };
  if (navigator.clipboard) navigator.clipboard.writeText(field.value).then(done).catch(() => field.select());
  else field.select();
});
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', fillVoices);

function openSettings() { child.hidden = true; settings.hidden = false; fillVoices(); showSettings(); window.scrollTo(0, 0); $('done').focus(); }
function closeSettings() { if ('speechSynthesis' in window) speechSynthesis.cancel(); settings.hidden = true; child.hidden = false; applyLook(); }
$('done').addEventListener('click', closeSettings);

// The "then" buttons show the same pictures the child will see.
for (const b of $('set-then').children) if (b.dataset.v !== 'none') b.insertAdjacentHTML('afterbegin', picture(b.dataset.v));

// Stars that pop out around the shape when a session is finished.
stars.innerHTML = STAR_COLORS.map((c, i) => {
  const a = (-90 + (i - 3) * 26) * Math.PI / 180;   // an arc over the top, clear of the buttons beside the shape
  return `<svg viewBox="0 0 100 100" style="--x:${Math.round(Math.cos(a) * 230)}%;--y:${Math.round(Math.sin(a) * 330)}%;--d:${i * 50}ms;fill:${c}"><path d="${STAR}"/></svg>`;
}).join('');

// ---------- Start up ----------
applyPresetLink();
applyLook();
window.addEventListener('hashchange', () => { if (state !== 'running') { applyPresetLink(); applyLook(); if (!settings.hidden) showSettings(); } });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
