const SOURCES = {
    "Instagram Viral": "data/fuckmaza.json",
    "Indian Leaked": "data/bhojpuri.json",
    "Telegram Viral": "data/lol49.json"
};

let cache = {};
let currentCategory = "Instagram Viral";
let currentVideos = [];
let currentPage = 1;
const PER_PAGE = 12;

// ---------- HOURLY ROTATION ----------
function rotate(arr, seed) {
    return [...arr].sort((a, b) =>
        (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0) + seed)
    );
}

// ---------- LOAD CATEGORY ----------
async function loadCategory(name) {
    currentCategory = name;
    currentPage = 1;

    if (!cache[name]) {
        const res = await fetch(SOURCES[name]);
        cache[name] = await res.json();
    }

    const seed = new Date().getHours() + name.length;
    currentVideos = rotate(cache[name], seed);

    renderGrid();
    updateCategoryUI();
}

// ---------- CATEGORY UI ----------
function updateCategoryUI() {
    const buttons = document.querySelectorAll('#categoryTabs button');
    buttons.forEach(b => b.classList.remove('active'));
    const activeButton = document.querySelector(`#categoryTabs button[data-category="${currentCategory}"]`);
    if (activeButton) activeButton.classList.add('active');
}

// ---------- GRID + PAGINATION ----------
function renderGrid(list = currentVideos) {
    const grid = document.getElementById("videoGrid");
    const pageInfo = document.getElementById("pageInfo");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");

    const totalPages = Math.ceil(list.length / PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageVideos = list.slice(start, end);

    grid.innerHTML = "";

    pageVideos.forEach(v => {
        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `
            <img src="${v.thumbnailUrl}">
            <div class="info">
                <b>${v.title}</b><br>
                <small>${v.duration} • ${v.views} views</small>
            </div>
        `;
        d.onclick = () => location = `watch.html?id=${v.id}`;
        grid.appendChild(d);
    });

    if (pageInfo) pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    if (prev) prev.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === totalPages;
}

// ---------- HEADER ----------
function initHeader() {
    const nav = document.getElementById("categoryTabs");
    if (!nav) return;

    Object.keys(SOURCES).forEach(name => {
        const b = document.createElement("button");
        b.innerText = name;
        b.setAttribute('data-category', name);
        b.onclick = () => loadCategory(name);
        nav.appendChild(b);
    });
}

// ---------- SEARCH ----------
function initSearch() {
    const s = document.getElementById("searchInput");
    if (!s) return;

    s.oninput = () => {
        const q = s.value.toLowerCase();
        const all = Object.values(cache).flat();
        currentPage = 1;
        renderGrid(all.filter(v => v.title.toLowerCase().includes(q)));
    };
}

// ---------- BUTTONS ----------
document.addEventListener("click", e => {
    if (e.target.id === "prev") {
        currentPage--;
        renderGrid();
        window.scrollTo(0, 0);
    }
    if (e.target.id === "next") {
        currentPage++;
        renderGrid();
        window.scrollTo(0, 0);
    }
});

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initSearch();
    loadCategory(currentCategory);
});
