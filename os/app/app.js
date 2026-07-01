const greetingEl = document.getElementById("greeting");
const coreTitle = document.getElementById("coreTitle");
const corePanel = document.getElementById("corePanel");
const coreResponse = document.getElementById("coreResponse");
const coreQuestion = document.getElementById("coreQuestion");

const osData = {
  projects: [
    ["Ryan Recording", "Starts in 2 hours"],
    ["Hull Podcast Artwork", "Awaiting approval"],
    ["CSorro OS", "Mission Control and Workspace Engine"]
  ],
  people: [
    ["Ryan", "Creator • replied recently"],
    ["Thumbnail Artist", "Waiting for artwork feedback"],
    ["New Client", "Reply drafted"]
  ],
  assets: [
    ["Episode17_Thumbnail_Final.png", "RyanNotBrian / Assets"],
    ["HullPodcast_Artwork_v2.png", "Hull Podcast / Artwork"],
    ["CSorro_OS_Logo.png", "Brand / Approved"]
  ],
  knowledge: [
    ["Thumbnail Approval Process", "Knowledge Base"],
    ["Creator Workspace Setup", "Workspace Guide"],
    ["OS Build Notes", "Development"]
  ]
};

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good Morning";
  let short = "Morning";
  if (hour >= 12 && hour < 18) { greeting = "Good Afternoon"; short = "Afternoon"; }
  if (hour >= 18) { greeting = "Good Evening"; short = "Evening"; }
  greetingEl.textContent = `${greeting}, Cristian.`;
  coreTitle.textContent = `${short} Cristian. I’ve organised your day.`;
}

function loadWorkspace() {
  const saved = localStorage.getItem("csorroCurrentWorkspace");
  if (!saved) return;
  try {
    const workspace = JSON.parse(saved);
    const grid = document.getElementById("workspaceGrid");
    const card = document.createElement("article");
    card.className = "workspace-card";
    card.dataset.coreQuery = `Open ${workspace.name}`;
    card.innerHTML = `<span>${workspace.type || "Workspace"}</span><h3>${workspace.name}</h3><p>${(workspace.priorities || []).slice(0,3).join(", ") || "Ready to organise."}</p><div class="progress"><i style="width:${workspace.progress || 18}%"></i></div>`;
    grid.prepend(card);
    const item = document.createElement("li");
    item.textContent = `${workspace.name} workspace is ready. I’ve added it to Mission Control.`;
    document.getElementById("coreList").prepend(item);
    document.getElementById("projectsCount").textContent = "4";
    document.getElementById("tasksCount").textContent = "5";
  } catch (e) {}
}

function openCore(query = "") {
  corePanel.classList.remove("hidden");
  if (query) {
    coreQuestion.value = query;
    answerCore(query);
  } else {
    setTimeout(() => coreQuestion.focus(), 80);
  }
}

function closeCore() {
  corePanel.classList.add("hidden");
}

function answerCore(raw) {
  const query = (raw || coreQuestion.value || "").trim();
  if (!query) return;

  coreResponse.innerHTML = `<div class="message"><b>You</b><p>${query}</p></div><div class="message"><b>CORE</b><p class="thinking">Reviewing workspaces... checking projects... searching assets... ready.</p></div>`;

  setTimeout(() => {
    const q = query.toLowerCase();
    let response = "";
    let groups = [];

    if (q.includes("thumbnail") || q.includes("asset") || q.includes("file")) {
      response = "I found the most relevant assets inside CSorro OS. I checked Assets first, then linked projects and workspace history.";
      groups = [["Assets", osData.assets], ["Projects", osData.projects.slice(0,2)], ["Knowledge", [osData.knowledge[0]]]];
    } else if (q.includes("ryan")) {
      response = "Ryan appears across People, Projects and Assets. The recording is the highest priority because it starts soon.";
      groups = [["People", [osData.people[0]]], ["Projects", [osData.projects[0]]], ["Assets", [osData.assets[0]]]];
    } else if (q.includes("first") || q.includes("priority") || q.includes("today")) {
      response = "I recommend starting with Ryan Recording, then Hull Podcast Artwork, then the new client reply. That clears the highest-impact blockers first.";
      groups = [["Recommended order", [["Ryan Recording", "Starts in 2 hours"], ["Hull Podcast Artwork", "Approval needed"], ["New Client Reply", "Draft prepared"]]]];
    } else if (q.includes("people") || q.includes("attention")) {
      response = "Three people currently need attention or are linked to active work.";
      groups = [["People", osData.people]];
    } else if (q.includes("project")) {
      response = "Here are the active projects I found inside CSorro OS.";
      groups = [["Projects", osData.projects]];
    } else {
      response = "I searched your OS first. I found related workspaces, people and knowledge. If this is not enough, I can offer web search later when the backend is connected.";
      groups = [["Projects", osData.projects.slice(0,2)], ["Knowledge", osData.knowledge.slice(0,2)]];
    }

    const html = [`<div class="message core-message"><b>CORE</b><p>${response}</p><div class="os-first">OS data first • Web later</div>`];
    groups.forEach(([name, rows]) => {
      html.push(`<div class="result-group"><h4>${name}</h4>`);
      rows.forEach(([title, meta]) => html.push(`<div class="result"><strong>${title}</strong><span>${meta}</span></div>`));
      html.push(`</div>`);
    });
    html.push(`</div>`);
    coreResponse.innerHTML = `<div class="message"><b>You</b><p>${query}</p></div>` + html.join("");
  }, 500);
}

updateGreeting();
loadWorkspace();

document.getElementById("openCorePanel").addEventListener("click", () => openCore());
document.getElementById("openCoreMini").addEventListener("click", () => openCore());
document.getElementById("openCoreSearch").addEventListener("click", () => openCore());
document.getElementById("closeCorePanel").addEventListener("click", closeCore);
document.getElementById("askCoreButton").addEventListener("click", () => answerCore());
coreQuestion.addEventListener("keydown", (event) => {
  if (event.key === "Enter") answerCore();
});
document.getElementById("commandInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") openCore(event.target.value);
});
document.querySelectorAll("[data-query], [data-core-query]").forEach((el) => {
  el.addEventListener("click", () => openCore(el.dataset.query || el.dataset.coreQuery));
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCore();
  }
  if (event.key === "Escape") closeCore();
});
