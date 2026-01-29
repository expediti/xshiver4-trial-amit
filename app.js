// --- CONFIGURATION ---
const SOURCES = {
    "Instagram Viral": "data/fuckmaza.json",
    "Indian Leaked": "data/bhojpuri.json",
    "Telegram Viral": "data/lol49.json"
};

const PER_PAGE = 16;

// --- STATE ---
let cache = {}; // Stores loaded JSON data to prevent re-fetching
let currentCategory = "Instagram Viral"; // Default start category
let currentVideos = [];
let currentPage = 1;

// ---------- LOAD CATEGORY ----------
async function loadCategory(name) {
    currentCategory = name;
    currentPage = 1;
    const url = SOURCES[name];

    // Show loading state
    const grid = document.getElementById("videoGrid");
    if(grid) grid.innerHTML = `<p style="color:white; text-align:center; padding:20px;">Loading ${name}...</p>`;

    try {
        // Fetch if not in cache
        if (!cache[name]) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load ${url}`);
            cache[name] = await res.json();
        }

        // Apply Data
        currentVideos = cache[name];
        
        // Update UI
        updateCategoryUI();
        renderGrid();

    } catch (e) {
        console.error(e);
        if(grid) grid.innerHTML = `<p style="color:red; text-align:center;">Error loading data. Check if <b>${url}</b> exists.</p>`;
    }
}

// ---------- CATEGORY BUTTONS UI ----------
function updateCategoryUI() {
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(b => {
        if (b.innerText === currentCategory) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
}

// ---------- RENDER GRID ----------
function renderGrid(customList = null) {
    const grid = document.getElementById("videoGrid");
    const pageInfo = document.getElementById("pageInfo");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");

    if (!grid) return;

    let list = customList || currentVideos;

    // Pagination
    const totalPages = Math.ceil(list.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = 1;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageVideos = list.slice(start, end);

    grid.innerHTML = "";

    pageVideos.forEach(v => {
        // Random Views Logic (as requested)
        const randomViews = Math.floor(Math.random() * 900 + 100) + 'k';

        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `
            <div class="card-thumb-container">
                <img 
                    src="${v.thumbnailUrl}" 
                    class="card-thumb" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://placehold.co/600x400/151525/FFF?text=No+Preview';"
                >
                <span class="duration-badge">${v.duration || '00:00'}</span>
            </div>
            <div class="card-info">
                <div class="card-title">${v.title}</div>
                <div class="card-meta">
                    <span>${randomViews} views</span>
                </div>
            </div>
        `;
        // Navigate to watch page
        d.onclick = () => window.location.href = `watch.html?id=${v.id}`;
        grid.appendChild(d);
    });

    // Update Controls
    if (pageInfo) pageInfo.innerText = `${currentPage} / ${totalPages}`;
    
    if (prev) {
        prev.disabled = currentPage === 1;
        prev.onclick = () => { currentPage--; renderGrid(customList); window.scrollTo(0,0); };
    }
    if (next) {
        next.disabled = currentPage === totalPages;
        next.onclick = () => { currentPage++; renderGrid(customList); window.scrollTo(0,0); };
    }
}

// ---------- INIT HEADER BUTTONS ----------
function initHeader() {
    const nav = document.getElementById("categoryTabs");
    if (!nav) return;
    nav.innerHTML = "";

    Object.keys(SOURCES).forEach(name => {
        const b = document.createElement("button");
        b.className = "cat-btn";
        b.innerText = name;
        b.onclick = () => loadCategory(name);
        nav.appendChild(b);
    });
}

// ---------- SEARCH ----------
function initSearch() {
    const s = document.getElementById("searchInput");
    if (!s) return;

    s.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        
        // Search inside the CURRENT category array
        if (!q) {
            renderGrid();
            return;
        }
        
        const results = currentVideos.filter(v => v.title.toLowerCase().includes(q));
        currentPage = 1; // Reset page on search
        renderGrid(results);
    };
}

// ---------- APP START ----------
document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initSearch();
    loadCategory(currentCategory); // Load default category
});
