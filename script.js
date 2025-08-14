// ===== Config =====
const BACKEND_URL = "http://localhost:5000"; // change to your hosted URL later
const songs = { happy: [], sad: [], romantic: [], energetic: [] };

// ===== Utils =====
function ytThumb(url) {
  // Robust thumbnail fallback if backend thumb missing
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.pathname.includes("/shorts/")) id = u.pathname.split("/shorts/")[1].split("/")[0];
    else if (u.pathname.includes("/embed/")) id = u.pathname.split("/embed/")[1].split("/")[0];
    id = (id || "").split("&")[0].trim();
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "https://i.imgur.com/3ZQ3Z3Z.png";
  } catch { return "https://i.imgur.com/3ZQ3Z3Z.png"; }
}

function card(song) {
  const a = document.createElement('a');
  a.href = song.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'card';

  const img = document.createElement('img');
  img.src = song.thumb || ytThumb(song.url);
  img.alt = song.title;

  const t = document.createElement('div');
  t.className = 'title';
  t.textContent = song.title;

  a.append(img, t);
  return a;
}

// ===== UI =====
function renderList(moodKey) {
  const container = document.getElementById('songList');
  const title = document.getElementById('listTitle');
  container.innerHTML = '';
  title.textContent = `${moodKey[0].toUpperCase()}${moodKey.slice(1)} • Top 10 Telugu songs`;

  (songs[moodKey] || []).forEach(s => container.appendChild(card(s)));
}

function suggestRandom(moodKey) {
  const pool = songs[moodKey];
  if (!pool || !pool.length) return;

  const pick = pool[Math.floor(Math.random() * pool.length)];
  const wrap = document.getElementById('suggestion');
  const a = document.getElementById('suggestionLink');
  const img = document.getElementById('suggestionThumb');
  const title = document.getElementById('suggestionTitle');

  a.href = pick.url;
  img.src = pick.thumb || ytThumb(pick.url);
  img.alt = pick.title;
  title.textContent = pick.title;

  wrap.classList.remove('hide');
}

async function loadSongs() {
  const loader = document.getElementById('loader');
  try {
    const res = await fetch(`${BACKEND_URL}/songs`, { cache: "no-store" });
    const data = await res.json();
    Object.assign(songs, data);
  } catch (e) {
    console.error("Failed to load songs:", e);
    alert("Could not fetch trending songs. Please try again later.");
  } finally {
    loader?.classList.add('hidden');
  }
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", async () => {
  await loadSongs();

  document.querySelectorAll('#moods button').forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      renderList(mood);
      suggestRandom(mood);
    });
  });
});
