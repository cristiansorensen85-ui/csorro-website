document.getElementById("newProject").addEventListener("click", () => {
  const name = prompt("Project name");
  if (!name) return;
  const grid = document.getElementById("projectsGrid");
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `<div class="status active">Active</div><h2>${name}</h2><p>New project created locally for preview.</p><div class="meta"><span>0%</span><span>New</span></div><div class="progress"><i style="width:0%"></i></div><button>Open project</button>`;
  grid.prepend(card);
});
