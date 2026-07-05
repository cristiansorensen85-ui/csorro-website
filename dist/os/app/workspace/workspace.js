let workspaceType = "";
let workspaceName = "";
let preset = "";
let customGoal = "";

const screens = [...document.querySelectorAll(".screen")];
const steps = [...document.querySelectorAll(".step")];
const progressFill = document.getElementById("progressFill");

const presets = {
  creator: {
    advice: "Creators usually need a clear content flow, a place for assets, and simple approvals. I’ll keep it focused.",
    modules: [
      ["Projects", "Plan videos, campaigns, series and deliverables."],
      ["Content Calendar", "Know what is being created, reviewed and published."],
      ["Asset Library", "Store thumbnails, videos, scripts, brand assets and files."],
      ["Knowledge Base", "Keep ideas, scripts, notes and repeatable processes in one place."],
      ["Client Portal", "Let clients or collaborators approve work without seeing everything."],
      ["CORE Automation", "Summaries, reminders and suggested next steps."]
    ]
  },
  business: {
    advice: "Businesses need structure, visibility and a calm way to manage people, projects and clients.",
    modules: [
      ["Projects", "Track work, goals, deadlines and responsibilities."],
      ["People", "Manage staff, freelancers, collaborators and permissions."],
      ["Client Portal", "Give clients a clean place to review updates and approve work."],
      ["Knowledge Base", "Store processes, documents, policies and decisions."],
      ["Opportunities", "Track leads, partnerships and future work."],
      ["CORE Automation", "Prepare briefings, organise information and reduce admin."]
    ]
  },
  agency: {
    advice: "Agencies need repeatable client workflows, clear approvals, and visibility across multiple projects.",
    modules: [
      ["Client Workspaces", "Separate each client safely with the right permissions."],
      ["Projects", "Manage campaigns, deliverables and timelines."],
      ["Team Collaboration", "Keep designers, editors, managers and clients aligned."],
      ["Asset Library", "Store brand assets, approvals and files per client."],
      ["Opportunities", "Manage leads, proposals and future work."],
      ["CORE Automation", "Summaries, task suggestions and client updates."]
    ]
  },
  project: {
    advice: "Project managers need clarity, deadlines, ownership and fewer scattered conversations.",
    modules: [
      ["Projects", "Plan phases, deadlines, tasks and ownership."],
      ["Tasks", "Track what needs doing, who owns it and what is blocked."],
      ["Calendar", "Keep deadlines, meetings and milestones visible."],
      ["Knowledge Base", "Store plans, decisions, notes and documentation."],
      ["People", "Manage roles, responsibilities and access."],
      ["CORE Automation", "Prepare daily priorities and highlight risks."]
    ]
  },
  starter: {
    advice: "No problem. I’ll set up a simple, safe workspace that works for most new ventures.",
    modules: [
      ["Projects", "A simple place to organise what you are building."],
      ["Tasks", "Clear next steps so you always know what to do."],
      ["Storage", "Company drive for files, reviews, media and documents."],
      ["Knowledge", "A simple notebook for decisions, notes and how things work."],
      ["People", "Add collaborators when you are ready."],
      ["CORE Automation", "Guidance, summaries and reminders when you need them."]
    ]
  },
  custom: {
    advice: "I’ll recommend a flexible setup based on your description.",
    modules: [
      ["Projects", "Organise the work into clear areas."],
      ["Tasks", "Break the work into manageable next steps."],
      ["Storage", "Keep workspace files, media and reviews together."],
      ["Knowledge", "Store decisions, notes and guidance."],
      ["People", "Add the right people when needed."],
      ["CORE Automation", "Help organise and guide the workspace."]
    ]
  }
};

function go(step) {
  screens.forEach((screen) => screen.classList.remove("active"));
  steps.forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${step}`).classList.add("active");
  document.querySelector(`.step[data-step="${step}"]`).classList.add("active");
  progressFill.style.width = `${step * 20}%`;
}

function updatePreview() {
  document.getElementById("previewName").textContent = workspaceName || "New Workspace";
  document.getElementById("previewType").textContent = workspaceType ? `${workspaceType} workspace` : "CORE will shape this around your goal.";
  const active = presets[preset] || presets.starter;
  document.getElementById("coreAdvice").textContent = active.advice;
}

function renderRecommendations() {
  const active = presets[preset] || presets.starter;
  const wrap = document.getElementById("recommendations");
  const preview = document.getElementById("previewModules");
  wrap.innerHTML = "";
  preview.innerHTML = "";

  active.modules.forEach(([name, desc], index) => {
    const card = document.createElement("label");
    card.className = "module-card";
    card.innerHTML = `<input type="checkbox" value="${name}" ${index < 5 ? "checked" : ""}/><div><b>${name}</b><p>${desc}</p></div>`;
    wrap.appendChild(card);

    if (index < 5) {
      const tag = document.createElement("span");
      tag.textContent = name;
      preview.appendChild(tag);
    }
  });

  wrap.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", updatePreviewModules);
  });
}

function updatePreviewModules() {
  const preview = document.getElementById("previewModules");
  preview.innerHTML = "";
  [...document.querySelectorAll("#recommendations input:checked")].forEach((input) => {
    const tag = document.createElement("span");
    tag.textContent = input.value;
    preview.appendChild(tag);
  });
}

document.getElementById("beginFlow").addEventListener("click", () => go(2));

document.querySelectorAll(".goal-card").forEach((choice) => {
  choice.addEventListener("click", () => {
    document.querySelectorAll(".goal-card").forEach((c) => c.classList.remove("selected"));
    choice.classList.add("selected");
    workspaceType = choice.dataset.type;
    preset = choice.dataset.preset;
    updatePreview();

    if (preset === "custom") {
      document.getElementById("customBox").classList.remove("hidden");
      return;
    }

    renderRecommendations();
    setTimeout(() => go(3), 250);
  });
});

document.getElementById("customContinue").addEventListener("click", () => {
  customGoal = document.getElementById("customGoal").value.trim();
  if (customGoal) {
    document.getElementById("coreAdvice").textContent = `Based on “${customGoal}”, I’ll create a flexible workspace you can adjust later.`;
  }
  renderRecommendations();
  go(3);
});

document.getElementById("workspaceName").addEventListener("input", (event) => {
  workspaceName = event.target.value;
  updatePreview();
});

document.querySelectorAll(".examples button").forEach((btn) => {
  btn.addEventListener("click", () => {
    workspaceName = btn.dataset.name;
    document.getElementById("workspaceName").value = workspaceName;
    updatePreview();
  });
});

document.getElementById("nameNext").addEventListener("click", () => {
  workspaceName = document.getElementById("workspaceName").value || "CSorro OS";
  updatePreview();
  renderRecommendations();
  go(4);
});

document.getElementById("buildWorkspace").addEventListener("click", () => {
  const selected = [...document.querySelectorAll("#recommendations input:checked")].map((input) => input.value);
  const workspace = {
    name: workspaceName || "CSorro OS",
    type: workspaceType || "Workspace",
    preset: preset || "starter",
    customGoal,
    priorities: selected,
    createdAt: new Date().toISOString(),
    progress: 18
  };
  localStorage.setItem("csorroCurrentWorkspace", JSON.stringify(workspace));
  go(5);
});
