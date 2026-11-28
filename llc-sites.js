/* ==========================================================================
   llc-sites.js — Master Website Directory for LLC (landrcy.github.io)
   Add new websites to the TOP of window.LLC_SITES with an ISO date (`added`)
   so both the categorized home page and the Newest view update automatically.
   ========================================================================== */

window.LLC_CATEGORIES = [
  { id: 'games', title: 'Games' },
  { id: 'projects', title: 'Projects' },
  { id: 'tools', title: 'Tools' },
];

// Minimal 20x20 crisp line-art SVG icons (one tailored to each website)
window.LLC_ICONS = {
  gallery:
    '<rect x="3" y="4" width="14" height="12" rx="1"/><path d="M3 13l4-4 3 3 2.5-2.5L17 13"/><circle cx="7.5" cy="7.5" r="1"/>',
  atlas:
    '<circle cx="10" cy="10" r="7"/><ellipse cx="10" cy="10" rx="3.2" ry="7"/><path d="M3.5 7.5h13M3.5 12.5h13"/>',
  terrain:
    '<path d="M2.5 15.5c2.2-5 4.2-8.5 6.3-8.5 1.9 0 3.2 3.2 4.7 3.2 1.2 0 2.3-1.8 4-3.7"/><path d="M2.5 15.5h15"/>',
  recommend:
    '<rect x="3" y="5" width="14" height="11" rx="1.2"/><path d="M3 8.5h14M6.5 5l1.5 3.5M11.5 5l1.5 3.5"/>',
  quiz_roguelike:
    '<path d="M10 3.2l5.8 3v4.4c0 3.1-2.5 5.3-5.8 6.3-3.3-1-5.8-3.2-5.8-6.3V6.2L10 3.2z"/><path d="M10 7.2v3.6M10 13.1h.01"/>',
  ddom:
    '<rect x="3.5" y="3.5" width="5.5" height="5.5" rx=".7"/><rect x="11" y="3.5" width="5.5" height="5.5" rx=".7"/><rect x="3.5" y="11" width="5.5" height="5.5" rx=".7"/><rect x="11" y="11" width="5.5" height="5.5" rx=".7"/>',
  forge:
    '<path d="M3 11.5h14l-1.5 3H4.5L3 11.5z"/><path d="M6 14.5l-1 2.5h10l-1-2.5"/><path d="M7.5 11.5V8.5h6l2.5-2.2H9.5"/>',
  typefall:
    '<path d="M5 5h10M10 5v10.5M7.5 15.5h5"/><path d="M15.2 11.5v4.5M13.6 14.4l1.6 1.6 1.6-1.6"/>',
  shaders:
    '<rect x="4" y="4" width="8.5" height="8.5"/><rect x="7.5" y="7.5" width="8.5" height="8.5"/><path d="M4 4l3.5 3.5M12.5 4L16 7.5M4 12.5L7.5 16M12.5 12.5L16 16"/>',
  channels:
    '<rect x="3" y="5" width="14" height="10" rx="2"/><polygon points="8.6,7.8 13,10 8.6,12.2" fill="currentColor" stroke="none"/>',
  cards:
    '<rect x="4.5" y="4" width="8.5" height="12" rx="1"/><path d="M13 6h2.2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8.8"/><path d="M8.75 8.3l1.3 1.7-1.3 1.7-1.3-1.7z"/>',
  cast:
    '<path d="M5 4v7.5a3.5 3.5 0 0 0 7 0V9.5"/><path d="M10.2 10.8L12 9l1.8 1.8"/><path d="M3 16c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 5 0"/>',
  mine:
    '<path d="M4.5 15.5L13 7"/><path d="M8.2 4.5c2.7.5 5 2.5 6.8 5.2"/><path d="M11.8 5.2l3 3"/>',
  rhythm:
    '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r="2.6"/><path d="M10 3.5V2M10 18v-1.5M3.5 10H2M18 10h-1.5"/>',
  terra:
    '<circle cx="10" cy="10" r="4.6"/><ellipse cx="10" cy="10" rx="8.2" ry="2.7" transform="rotate(-22 10 10)"/>',
  aiquiz:
    '<circle cx="10" cy="10" r="6.5"/><path d="M8.2 8.2a2 2 0 1 1 2.9 1.8c-.7.4-1.1.8-1.1 1.6"/><circle cx="10" cy="14" r=".6" fill="currentColor" stroke="none"/>',
  escape:
    '<path d="M5 16.5V4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v12"/><path d="M3.5 16.5h13"/><circle cx="12.2" cy="10.2" r=".8" fill="currentColor" stroke="none"/>',
  tung:
    '<ellipse cx="10" cy="6.5" rx="5.5" ry="2.2"/><path d="M4.5 6.5v6.8c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V6.5"/><path d="M6.8 10.8l6.4-2.2"/>',
  museum:
    '<path d="M3.5 7.5L10 3.5l6.5 4H3.5z"/><path d="M5.5 7.5v7M8.5 7.5v7M11.5 7.5v7M14.5 7.5v7M3 16h14"/>',
  wam:
    '<path d="M5 15l9.5-9.5M11.5 5.5h3v3"/><path d="M7.5 10.5l2 2M4 16l2-2"/>',
  void_game:
    '<circle cx="10" cy="10" r="3" fill="currentColor" stroke="none"/><path d="M10 3.5a6.5 6.5 0 0 1 6.2 4.6M10 16.5a6.5 6.5 0 0 1-6.2-4.6"/><circle cx="15.8" cy="13.5" r="1"/>',
  sea:
    '<path d="M8.5 3.5h3v2.3l2 2.2v6.8a1.2 1.2 0 0 1-1.2 1.2H7.7a1.2 1.2 0 0 1-1.2-1.2V8l2-2.2V3.5z"/><path d="M6.8 12.2c1.2-.6 2.1.6 3.2 0s2-.6 3.2 0"/>',
  ashaad:
    '<path d="M10 3.5c3 4 5 6.6 5 9a5 5 0 1 1-10 0c0-2.4 2-5 5-9z"/><circle cx="8.4" cy="12.2" r=".7" fill="currentColor" stroke="none"/><circle cx="11.6" cy="12.2" r=".7" fill="currentColor" stroke="none"/>',
};

// Ordered newest-first! Each new website gets added right at the top.
window.LLC_SITES = [
  {
    id: 'pixel-art-gallery',
    title: 'Pixel Art Gallery',
    desc: 'Walkable community art museum for paintings, easels, 3D sculptures, videos, and interpretive art.',
    url: 'https://landrcy.github.io/pixel-art-gallery/',
    category: 'projects',
    added: '2026-11-28',
    icon: 'gallery',
    color: '#b84a31',
  },
  {
    id: 'atlas',
    title: 'Atlas',
    desc: 'Spinning 3D Earth travel tracker for pinning places you have visited with photos, dates, and notes.',
    url: 'https://landrcy.github.io/atlas/',
    category: 'tools',
    added: '2026-11-28',
    icon: 'atlas',
    color: '#2563a8',
  },
  {
    id: 'terrain',
    title: 'Smooth Terrain Studio',
    desc: 'Sculpt and shape smooth 2.5D terrain right in the browser.',
    url: 'https://landrcy.github.io/Terrain/',
    category: 'tools',
    added: '2026-11-27',
    icon: 'terrain',
    color: '#2d7a56',
  },
  {
    id: 'recommend',
    title: 'Recommend',
    desc: 'Find your next movie, TV show, book, or video game with streaming lookup.',
    url: 'https://landrcy.github.io/movie/',
    category: 'tools',
    added: '2026-11-27',
    icon: 'recommend',
    color: '#c47b1c',
  },
  {
    id: 'roguelike-quiz',
    title: 'Roguelike Quiz',
    desc: 'Trivia quiz for The Binding of Isaac and Slay the Spire 2.',
    url: 'https://landrcy.github.io/roguelike-quiz/',
    category: 'games',
    added: '2026-11-26',
    icon: 'quiz_roguelike',
    color: '#a33244',
  },
  {
    id: 'ddom',
    title: 'DDOM',
    desc: 'Daily Dose of Maggie — an interactive mosaic built from photos of Maggie.',
    url: 'https://landrcy.github.io/ddom/',
    category: 'projects',
    added: '2026-11-26',
    icon: 'ddom',
    color: '#c96f32',
  },
  {
    id: 'forge',
    title: 'FORGE',
    desc: 'Cozy pixel blacksmith game where you forge weapons and inscribe runes.',
    url: 'https://landrcy.github.io/forge/',
    category: 'games',
    added: '2026-11-26',
    icon: 'forge',
    color: '#d45a1e',
  },
  {
    id: 'typefall',
    title: 'typefall',
    desc: 'Interactive falling-letter text physics playground.',
    url: '/typefall/',
    category: 'projects',
    added: '2026-11-25',
    icon: 'typefall',
    color: '#7a5a3a',
  },
  {
    id: 'lan4drcy',
    title: 'lan4drcy',
    desc: 'Real-time WebGL fractals and 4D shader explorer.',
    url: '/lan4drcy/',
    category: 'projects',
    added: '2026-11-25',
    icon: 'shaders',
    color: '#0f7f99',
  },
  {
    id: 'youtube',
    title: 'LLC Powered Channels',
    desc: 'Live subscriber and view counter for Landry\'s YouTube channels.',
    url: '/youtube/',
    category: 'tools',
    added: '2026-11-25',
    icon: 'channels',
    color: '#c22929',
  },
  {
    id: 'llccards',
    title: 'LLC Cards',
    desc: 'Black-and-white trading card game with booster packs, binders, and duels.',
    url: 'https://landrcy.github.io/llccards/',
    category: 'games',
    added: '2026-11-20',
    icon: 'cards',
    color: '#2b2b30',
  },
  {
    id: 'cast',
    title: 'CAST',
    desc: 'First-person pixel fishing game on a quiet dock.',
    url: 'https://landrcy.github.io/cast/',
    category: 'games',
    added: '2026-11-17',
    icon: 'cast',
    color: '#1b7f9c',
  },
  {
    id: 'mine',
    title: 'MINE',
    desc: 'Mark tunnels and send robots underground to dig and haul ore.',
    url: 'https://landrcy.github.io/mine/',
    category: 'games',
    added: '2026-11-17',
    icon: 'mine',
    color: '#b07f0e',
  },
  {
    id: 'lsu',
    title: 'LSU',
    desc: 'Minimalist aim-and-click rhythm game.',
    url: '/lsu/',
    category: 'games',
    added: '2026-11-14',
    icon: 'rhythm',
    color: '#cf2762',
  },
  {
    id: 'terra',
    title: 'Terra',
    desc: 'Design a pixel planet and place it in a shared solar system.',
    url: 'https://landrcy.github.io/terra/',
    category: 'projects',
    added: '2026-11-10',
    icon: 'terra',
    color: '#9e7432',
  },
  {
    id: 'ai-quiz',
    title: 'AI Quiz',
    desc: 'Spot real vs. AI-generated pixel art and writing.',
    url: 'https://landrcy.github.io/ai-quiz/',
    category: 'games',
    added: '2026-11-10',
    icon: 'aiquiz',
    color: '#168096',
  },
  {
    id: 'escape-ca',
    title: 'Escape CA',
    desc: 'Horror chase game set at College Academy.',
    url: 'https://landrcy.github.io/escape-ca/',
    category: 'games',
    added: '2026-11-02',
    icon: 'escape',
    color: '#bd2632',
  },
  {
    id: 'ttt',
    title: 'Talk to Tung',
    desc: 'Ask Tung Tung Tung Sahur anything for a loud drum-powered answer.',
    url: 'https://landrcy.github.io/ttt/',
    category: 'projects',
    added: '2026-10-28',
    icon: 'tung',
    color: '#8c5228',
  },
  {
    id: 'pixel-museum',
    title: 'Pixel Museum',
    desc: 'Explorable pixel-art museum with themed rooms and relics.',
    url: 'https://landrcy.github.io/pixel-museum/',
    category: 'projects',
    added: '2026-10-27',
    icon: 'museum',
    color: '#5a4a8f',
  },
  {
    id: 'wam',
    title: 'W.A.M.',
    desc: 'Pixel timing-combat RPG with a warrior, archer, and mage.',
    url: 'https://landrcy.github.io/wam/',
    category: 'games',
    added: '2026-10-27',
    icon: 'wam',
    color: '#2b7849',
  },
  {
    id: 'the-void',
    title: 'The Void',
    desc: 'Pixel space exploration game at the edge of a black hole.',
    url: 'https://landrcy.github.io/the-void/',
    category: 'games',
    added: '2026-10-23',
    icon: 'void_game',
    color: '#7538bd',
  },
  {
    id: 'sea-of-thought',
    title: 'Sea of Thought',
    desc: 'Write a message in a bottle, toss it into a pixel ocean, and read what strangers left.',
    url: 'https://landrcy.github.io/sea-of-thought/',
    category: 'projects',
    added: '2026-10-23',
    icon: 'sea',
    color: '#226994',
  },
  {
    id: 'binding-of-ashaad',
    title: 'The Binding of Ashaad',
    desc: 'Browser roguelike in the basement with tears, cursed items, and bosses.',
    url: 'https://landrcy.github.io/binding-of-ashaad/',
    category: 'games',
    added: '2026-10-22',
    icon: 'ashaad',
    color: '#3d6999',
  },
];
