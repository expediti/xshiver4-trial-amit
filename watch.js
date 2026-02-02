const VIDEO_FILE = "data.json";

async function initWatch() {
    // 1. Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const currentId = params.get("id");

    if (!currentId) {
        window.location.href = "index.html";
        return;
    }

    try {
        // 2. Fetch Data
        const res = await fetch(VIDEO_FILE);
        if (!res.ok) throw new Error("Failed to load video file");
        
        const allVideos = await res.json();
        
        // 3. Find specific video
        const video = allVideos.find(v => v.id === currentId);

        if (video) {
            // Update UI
            document.title = video.title + " - XSHIVER";
            document.getElementById("title").innerText = video.title;
            document.getElementById("description").innerText = video.description || `Watch ${video.title} on XSHIVER.`;

            // Update Tags
            const tagBox = document.getElementById("tags");
            tagBox.innerHTML = "";
            if (video.tags) {
                video.tags.forEach(t => {
                    const s = document.createElement("span");
                    s.className = "tag-pill";
                    s.innerText = `#${t}`;
                    tagBox.appendChild(s);
                });
            }

            // Setup Standard Player
            const player = document.getElementById("player");
            if (player) {
                player.src = video.embedUrl;
                player.poster = video.thumbnailUrl;
                player.load(); // Forces reload of source
                // player.play().catch(() => {}); // Optional: Auto-play
            }

        } else {
            document.getElementById("title").innerText = "Video not found.";
        }

        // 4. Load Suggestions
        const suggestions = allVideos
            .filter(v => v.id !== currentId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 12);

        renderSuggestions(suggestions);

    } catch (e) {
        console.error("Error:", e);
        document.getElementById("title").innerText = "Error loading content.";
    }
}

function renderSuggestions(list) {
    const grid = document.getElementById("related");
    if (!grid) return;
    
    grid.innerHTML = "";

    list.forEach(item => {
        let thumb = item.thumbnailUrl;
        if (thumb.includes("data:image"))
            thumb = "https://placehold.co/600x400/1a1a24/FFF?text=No+Preview";

        const card = document.createElement("div");
        card.className = "card";
        card.onclick = () => (window.location.href = `watch.html?id=${item.id}`);

        card.innerHTML = `
            <div class="card-thumb-container">
                <img src="${thumb}" class="card-thumb" onerror="this.src='https://placehold.co/600x400/1a1a24/FFF?text=No+Image'">
                <span class="duration-badge">${item.duration || "00:00"}</span>
            </div>
            <div class="card-info">
                <div class="card-title">${item.title}</div>
                <div class="card-meta">
                    <span>${item.views || '1k'} views</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", initWatch);
