const modal = document.getElementById("projectModal");
const input = document.getElementById("projectNameInput");

document.getElementById("newProject").addEventListener("click", () => {
  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 60);
});

function closeModal(){
  modal.classList.add("hidden");
  input.value = "";
}

function createProject(){
  const name = input.value.trim();
  if (!name) return;
  const grid = document.getElementById("projectsGrid");
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `<div class="status active">Active</div><h2>${name}</h2><p>New project created locally for preview.</p><div class="meta"><span>0%</span><span>New</span></div><div class="progress"><i style="width:0%"></i></div><button>Open project</button>`;
  grid.prepend(card);
  closeModal();
}

document.getElementById("createProjectConfirm").addEventListener("click", createProject);
document.getElementById("closeProjectModal").addEventListener("click", closeModal);
document.getElementById("cancelProject").addEventListener("click", closeModal);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") createProject();
  if (event.key === "Escape") closeModal();
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
