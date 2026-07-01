const greetingEl = document.getElementById("greeting");
const timeEl = document.getElementById("liveTime");
const dateEl = document.getElementById("todayDate");

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 18) greeting = "Good Afternoon";
  if (hour >= 18) greeting = "Good Evening";

  greetingEl.textContent = `${greeting}, Cristian.`;
  timeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  dateEl.textContent = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}

updateClock();
setInterval(updateClock, 1000 * 15);

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
  });
});

const modal = document.getElementById("coreModal");
const openBriefing = document.getElementById("openBriefing");
const askCoreTop = document.getElementById("askCoreTop");
const closeModal = document.getElementById("closeModal");
const closeModal2 = document.getElementById("closeModal2");

function openCore() {
  modal.classList.remove("hidden");
}

function closeCore() {
  modal.classList.add("hidden");
}

openBriefing.addEventListener("click", openCore);
askCoreTop.addEventListener("click", openCore);
closeModal.addEventListener("click", closeCore);
closeModal2.addEventListener("click", closeCore);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeCore();
});

document.getElementById("notificationButton").addEventListener("click", () => {
  document.getElementById("notificationsPanel").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("commandInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    openCore();
  }
});


function loadWorkspace() {
  const saved = localStorage.getItem("csorroCurrentWorkspace");
  if (!saved) return;

  try {
    const workspace = JSON.parse(saved);
    const workspaceRows = document.querySelectorAll(".workspace-row");

    if (workspaceRows.length > 0) {
      const first = workspaceRows[0];
      const title = first.querySelector("strong");
      const subtitle = first.querySelector("span");
      const progress = first.querySelector(".mini-progress i");

      if (title) title.textContent = workspace.name;
      if (subtitle) subtitle.textContent = `${workspace.type} workspace • ${workspace.priorities.slice(0, 3).join(", ")}`;
      if (progress) progress.style.width = `${workspace.progress || 12}%`;
    }

    const coreList = document.querySelector(".core-panel ul");
    if (coreList) {
      const item = document.createElement("li");
      item.textContent = `${workspace.name} workspace has been created and is ready to organise.`;
      coreList.prepend(item);
    }

    const statusDue = document.querySelector(".status-strip div:nth-child(4) strong");
    if (statusDue) statusDue.textContent = "Workspace ready";
  } catch (error) {
    console.warn("Could not load saved workspace", error);
  }
}

loadWorkspace();
