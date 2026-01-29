const id = new URLSearchParams(location.search).get("id");

// List of all data files to check
const DATA_FILES = [
    "data/fuckmaza.json",
    "data/bhojpuri.json",
    "data/lol49.json"
];

async function initWatch() {
    if (!id) {
        document.getElementById("title").innerText = "Video Not Found";
        return;
    }

    try {
        let foundVideo = null;
        let allVideos = [];

        // Fetch ALL files to ensure we find the ID and have suggestions
        const promises = DATA_FILES.map(url => 
            fetch(url)
                .then(res => res.json())
                .catch(err => {
                    console.warn("Failed to load:", url);
                    return []; // Continue even if one fails
                })
        );

        const results = await Promise.all(promises);
        
        // Merge all data
        allVideos = results.flat();
        
        // Find the video
        foundVideo = allVideos.find(v => v.id === id);

        if (foundVideo) {
            // Setup Player
            const player = document.getElementById("player");
            player.src = foundVideo.embedUrl;
            player.poster = foundVideo.thumbnailUrl;

            // Setup Info
            document.getElementById("title").innerText = foundVideo.title;
            document.getElementById("description").innerText = foundVideo.description || "";

            // Setup Tags
            const tagBox = document.getElementById("tags");
            tagBox.innerHTML = "";
            if (foundVideo.tags) {
                foundVideo.tags.forEach(t => {
                    const s = document.createElement("span");
                    s.className = "tag-pill";
                    s.innerText = `#${t}`;
                    tagBox.appendChild(s);
                });
            }

            renderRelated(foundVideo, allVideos);
        } else {
            document.getElementById("title").innerText = "Video unavailable or deleted.";
        }
    } catch (e) {
        console.error(e);
        document.getElementById("title").innerText = "Error loading video.";
    }
}

function renderRelated(current, all) {
    const list = document.getElementById("related");
    list.innerHTML = "";

    // 1. Filter out current video
    // 2. Shuffle
    // 3. Take 10
    const suggestions = all
        .filter(v => v.id !== current.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

    suggestions.forEach(v => {
        // Random Views
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
        d.onclick = () => window.location.href = `watch.html?id=${v.id}`;
        list.appendChild(d);
    });
}

document.addEventListener("DOMContentLoaded", initWatch);
