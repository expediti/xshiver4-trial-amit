const id = new URLSearchParams(location.search).get("id");

async function initWatch() {
    if (!id) return;

    for (const [name, url] of Object.entries({
        "Instagram Viral": "data/fuckmaza.json",
        "Indian Leaked": "data/bhojpuri.json",
        "Telegram Viral": "data/lol49.json"
    })) {
        const res = await fetch(url);
        const data = await res.json();
        const video = data.find(v => v.id === id);

        if (video) {
            player.src = video.embedUrl;
            title.innerText = video.title;
            description.innerText = video.description;

            video.tags.forEach(t => {
                const s = document.createElement("span");
                s.innerText = `#${t}`;
                tags.appendChild(s);
            });

            renderRelated(video, data);
            break;
        }
    }
}

function renderRelated(current, all) {
    const related = all.filter(v =>
        v.id !== current.id &&
        v.tags.some(t => current.tags.includes(t))
    ).slice(0, 6);

    const relatedList = document.getElementById("related");
    relatedList.innerHTML = "";

    related.forEach(v => {
        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `
            <img src="${v.thumbnailUrl}">
            <div class="info">${v.title}</div>
        `;
        d.onclick = () => location = `watch.html?id=${v.id}`;
        relatedList.appendChild(d);
    });
}

document.addEventListener("DOMContentLoaded", initWatch);
