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
