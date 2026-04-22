const store = {
  characters: [
    {
      id: "char-001",
      name: "Ilya Voren",
      slug: "ilya-voren",
      summary: "Archivist and witness of border wars.",
      status: "active",
      canonState: "canonical",
      pronouns: "he/him",
      epithet: "Archivist of the Southern Ledger",
      updatedAt: "2026-04-20",
    },
    {
      id: "char-002",
      name: "Mira Seln",
      slug: "mira-seln",
      summary: "Former navigator, now city guide.",
      status: "draft",
      canonState: "alternate",
      pronouns: "she/her",
      epithet: "Cartographer of the Windline",
      updatedAt: "2026-04-18",
    },
    {
      id: "char-003",
      name: "Tovin Rake",
      slug: "tovin-rake",
      summary: "Broker between dock syndicates and inland caravans.",
      status: "active",
      canonState: "uncertain",
      pronouns: "they/them",
      epithet: "Three-Port Envoy",
      updatedAt: "2026-04-16",
    },
  ],
  places: [
    {
      id: "place-001",
      name: "Kharis Port",
      slug: "kharis-port",
      summary: "Coastal trade city built around an old fortress.",
      status: "active",
      canonState: "canonical",
      placeKind: "City",
      locationText: "Southern coast, mouth of the Oth river",
      updatedAt: "2026-04-19",
    },
    {
      id: "place-002",
      name: "Grey Hollow",
      slug: "grey-hollow",
      summary: "Mountain valley known for abandoned observatories.",
      status: "draft",
      canonState: "uncertain",
      placeKind: "Valley",
      locationText: "Northeast ridge belt",
      updatedAt: "2026-04-17",
    },
    {
      id: "place-003",
      name: "Sable Crossing",
      slug: "sable-crossing",
      summary: "River checkpoint with strict customs records.",
      status: "active",
      canonState: "alternate",
      placeKind: "Checkpoint",
      locationText: "Mid-river toll route",
      updatedAt: "2026-04-15",
    },
  ],
};

const viewState = {
  characters: {
    selectedId: store.characters[0]?.id ?? null,
    mode: "create",
    query: "",
  },
  places: {
    selectedId: store.places[0]?.id ?? null,
    mode: "create",
    query: "",
  },
};

const page = document.body.dataset.page;

activateNav();

if (page === "dashboard") {
  renderDashboard();
}

if (page === "characters") {
  wireEntityPage("characters", {
    ids: {
      list: "characters-list",
      count: "characters-count",
      detail: "character-detail",
      selectedStatus: "character-selected-status",
      search: "character-search",
      form: "character-form",
      formTitle: "character-form-title",
      formMode: "character-form-mode",
      formMessage: "character-form-message",
      newBtn: "character-new-btn",
      editBtn: "character-edit-btn",
      deleteBtn: "character-delete-btn",
      cancelBtn: "character-cancel-btn",
    },
    fields: ["name", "slug", "summary", "pronouns", "epithet", "status", "canonState"],
    required: ["name"],
  });
}

if (page === "places") {
  wireEntityPage("places", {
    ids: {
      list: "places-list",
      count: "places-count",
      detail: "place-detail",
      selectedStatus: "place-selected-status",
      search: "place-search",
      form: "place-form",
      formTitle: "place-form-title",
      formMode: "place-form-mode",
      formMessage: "place-form-message",
      newBtn: "place-new-btn",
      editBtn: "place-edit-btn",
      deleteBtn: "place-delete-btn",
      cancelBtn: "place-cancel-btn",
    },
    fields: ["name", "slug", "summary", "placeKind", "locationText", "status", "canonState"],
    required: ["name"],
  });
}

function activateNav() {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  navLinks.forEach((link) => {
    const target = link.getAttribute("href");
    const active =
      (page === "dashboard" && target === "./index.html") ||
      (page === "characters" && target === "./characters.html") ||
      (page === "places" && target === "./places.html");

    if (active) {
      link.classList.add("active");
    }
  });
}

function renderDashboard() {
  const cards = document.getElementById("summary-cards");
  const recent = document.getElementById("recent-records");
  const checklist = document.getElementById("progress-checklist");
  if (!cards || !recent || !checklist) return;

  cards.innerHTML = `
    <article class="card">
      <p class="eyebrow">Coverage</p>
      <h3>Characters</h3>
      <p class="muted">${store.characters.length} mock records</p>
    </article>
    <article class="card">
      <p class="eyebrow">Coverage</p>
      <h3>Places</h3>
      <p class="muted">${store.places.length} mock records</p>
    </article>
    <article class="card">
      <p class="eyebrow">Flow state</p>
      <h3>Create / Edit layout</h3>
      <p class="muted">Present in both entity pages</p>
    </article>
    <article class="card">
      <p class="eyebrow">Backend</p>
      <h3>Preview data mode</h3>
      <p class="muted">No live API requests</p>
    </article>
  `;

  const mergedRecent = [...store.characters, ...store.places]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  recent.innerHTML = mergedRecent
    .map(
      (item) => `
      <article class="list-item">
        <h4>${item.name}</h4>
        <p class="muted">${item.slug} | Updated ${item.updatedAt}</p>
      </article>
    `
    )
    .join("");

  checklist.innerHTML = `
    <li>Navigation shell reflects current MVP scope.</li>
    <li>Characters page supports list, detail, and form composition.</li>
    <li>Places page mirrors the same interaction pattern.</li>
    <li>Form validation surface is visible for required fields.</li>
    <li>No Story or Map dead-end routes in preview navigation.</li>
  `;
}

function wireEntityPage(entityKey, config) {
  const state = viewState[entityKey];
  const refs = getRefs(config.ids);

  if (!refs.list || !refs.form || !refs.search) {
    return;
  }

  refs.search.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderEntityPage(entityKey, config, refs);
  });

  refs.newBtn?.addEventListener("click", () => {
    state.mode = "create";
    refs.form.reset();
    writeMessage(refs.formMessage, "Creating new record draft.", "success");
    renderEntityPage(entityKey, config, refs);
  });

  refs.editBtn?.addEventListener("click", () => {
    const selected = getSelectedRecord(entityKey);
    if (!selected) {
      writeMessage(refs.formMessage, "Select a record before editing.", "error");
      return;
    }

    state.mode = "edit";
    fillForm(refs.form, config.fields, selected);
    writeMessage(refs.formMessage, `Editing ${selected.name}.`, "success");
    renderEntityPage(entityKey, config, refs);
  });

  refs.cancelBtn?.addEventListener("click", () => {
    refs.form.reset();
    state.mode = "create";
    writeMessage(refs.formMessage, "Form reset. Back in create mode.", "success");
    renderEntityPage(entityKey, config, refs);
  });

  refs.deleteBtn?.addEventListener("click", () => {
    const list = store[entityKey];
    const selected = getSelectedRecord(entityKey);
    if (!selected) {
      writeMessage(refs.formMessage, "Nothing selected to delete.", "error");
      return;
    }

    const confirmed = window.confirm(`Delete ${selected.name}? (Preview only)`);
    if (!confirmed) {
      return;
    }

    const nextList = list.filter((entry) => entry.id !== selected.id);
    store[entityKey] = nextList;
    state.selectedId = nextList[0]?.id ?? null;
    state.mode = "create";
    refs.form.reset();
    writeMessage(refs.formMessage, `${selected.name} removed from preview list.`, "success");
    renderEntityPage(entityKey, config, refs);
  });

  refs.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = readForm(refs.form, config.fields);
    const missing = config.required.find((field) => !payload[field]);

    if (missing) {
      writeMessage(refs.formMessage, `${capitalize(missing)} is required.`, "error");
      return;
    }

    if (!payload.slug) {
      payload.slug = slugify(payload.name);
    }

    if (state.mode === "create") {
      payload.id = `${entityKey.slice(0, -1)}-${Date.now().toString(16).slice(-6)}`;
      payload.updatedAt = currentDateStamp();
      store[entityKey].unshift(payload);
      state.selectedId = payload.id;
      writeMessage(refs.formMessage, `${payload.name} created in preview state.`, "success");
      refs.form.reset();
      state.mode = "edit";
    } else {
      const selected = getSelectedRecord(entityKey);
      if (!selected) {
        writeMessage(refs.formMessage, "Select a record before saving edits.", "error");
        return;
      }

      Object.assign(selected, payload, { updatedAt: currentDateStamp() });
      writeMessage(refs.formMessage, `${selected.name} updated in preview state.`, "success");
    }

    renderEntityPage(entityKey, config, refs);
  });

  renderEntityPage(entityKey, config, refs);
}

function renderEntityPage(entityKey, config, refs) {
  const state = viewState[entityKey];
  const list = store[entityKey];
  const filtered = list.filter((item) => {
    if (!state.query) return true;
    return item.name.toLowerCase().includes(state.query) || item.slug.toLowerCase().includes(state.query);
  });

  refs.count.textContent = `${list.length} items`;
  refs.formTitle.textContent = state.mode === "create" ? `Create ${singular(entityKey)}` : `Edit ${singular(entityKey)}`;
  refs.formMode.textContent = `Mode: ${state.mode}`;

  refs.list.innerHTML = filtered.length
    ? filtered
        .map((item) => {
          const activeClass = item.id === state.selectedId ? "active" : "";
          return `
            <article class="record-item ${activeClass}" data-id="${item.id}">
              <h4>${item.name}</h4>
              <p>${item.slug}</p>
              <div class="meta-row">
                ${statusBadge(item.status)}
                <span class="badge">${item.canonState}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="muted">No matching records in preview state.</p>`;

  refs.list.querySelectorAll(".record-item").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedId = node.dataset.id;
      renderEntityPage(entityKey, config, refs);
    });
  });

  const selected = getSelectedRecord(entityKey);
  refs.selectedStatus.textContent = selected ? `Selected: ${selected.name}` : "No selection";
  refs.detail.innerHTML = selected ? buildDetailMarkup(entityKey, selected) : `<p class="muted">Select a record from the list.</p>`;
}

function getRefs(ids) {
  const refs = {};
  Object.entries(ids).forEach(([key, value]) => {
    refs[key] = document.getElementById(value);
  });
  return refs;
}

function getSelectedRecord(entityKey) {
  const selectedId = viewState[entityKey].selectedId;
  return store[entityKey].find((entry) => entry.id === selectedId) ?? null;
}

function fillForm(form, fields, value) {
  fields.forEach((field) => {
    if (!(field in form.elements)) return;
    form.elements[field].value = value[field] ?? "";
  });
}

function readForm(form, fields) {
  const payload = {};
  fields.forEach((field) => {
    if (!(field in form.elements)) return;
    payload[field] = normalize(form.elements[field].value);
  });
  return payload;
}

function buildDetailMarkup(entityKey, item) {
  if (entityKey === "characters") {
    return `
      <article class="detail-row">
        <p class="detail-label">Name</p>
        <p class="detail-value">${item.name}</p>
      </article>
      <article class="detail-row">
        <p class="detail-label">Slug</p>
        <p class="detail-value">${item.slug}</p>
      </article>
      <article class="detail-row">
        <p class="detail-label">Summary</p>
        <p class="detail-value">${item.summary || "No summary"}</p>
      </article>
      <article class="detail-row">
        <p class="detail-label">Profile</p>
        <p class="detail-value">Pronouns: ${item.pronouns || "-"}<br/>Epithet: ${item.epithet || "-"}</p>
      </article>
      <article class="detail-row">
        <p class="detail-label">State</p>
        <p class="detail-value">${item.status} | ${item.canonState}</p>
      </article>
    `;
  }

  return `
    <article class="detail-row">
      <p class="detail-label">Name</p>
      <p class="detail-value">${item.name}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">Slug</p>
      <p class="detail-value">${item.slug}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">Summary</p>
      <p class="detail-value">${item.summary || "No summary"}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">Location profile</p>
      <p class="detail-value">Kind: ${item.placeKind || "-"}<br/>Location: ${item.locationText || "-"}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">State</p>
      <p class="detail-value">${item.status} | ${item.canonState}</p>
    </article>
  `;
}

function statusBadge(status) {
  const className =
    status === "active" ? "is-active" : status === "archived" ? "is-archived" : "is-draft";
  return `<span class="badge ${className}">${status}</span>`;
}

function singular(value) {
  return value.endsWith("s") ? capitalize(value.slice(0, -1)) : capitalize(value);
}

function writeMessage(node, text, tone) {
  if (!node) return;
  node.textContent = text;
  node.classList.remove("error", "success");
  node.classList.add(tone === "error" ? "error" : "success");
}

function normalize(value) {
  const next = String(value ?? "").trim();
  return next.length > 0 ? next : "";
}

function slugify(value) {
  return (
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function currentDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function capitalize(value) {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
