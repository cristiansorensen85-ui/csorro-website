let workspaceType = "";
let workspaceName = "";
const screens = [...document.querySelectorAll(".screen")];
const steps = [...document.querySelectorAll(".step")];

function go(step) {
  screens.forEach((screen) => screen.classList.remove("active"));
  steps.forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${step}`).classList.add("active");
  document.querySelector(`.step[data-step="${step}"]`).classList.add("active");
}

function updatePreview() {
  document.getElementById("previewName").textContent = workspaceName || "New Workspace";
  document.getElementById("previewType").textContent = workspaceType ? `${workspaceType} workspace` : "Choose a workspace type";
}

document.querySelectorAll(".choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    document.querySelectorAll(".choice").forEach((c) => c.classList.remove("selected"));
    choice.classList.add("selected");
    workspaceType = choice.dataset.type;
    updatePreview();
    setTimeout(() => go(2), 250);
  });
});

document.getElementById("workspaceName").addEventListener("input", (event) => {
  workspaceName = event.target.value;
  updatePreview();
});

document.getElementById("nameNext").addEventListener("click", () => {
  workspaceName = document.getElementById("workspaceName").value || "CSorro OS";
  updatePreview();
  go(3);
});

document.getElementById("buildWorkspace").addEventListener("click", () => {
  const selected = [...document.querySelectorAll(".checks input:checked")].map((input) => input.value);
  const modules = document.getElementById("previewModules");
  modules.innerHTML = "";
  selected.forEach((item) => {
    const span = document.createElement("span");
    span.textContent = item;
    modules.appendChild(span);
  });
  go(4);
});
