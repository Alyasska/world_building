const PREVIEW_STORAGE_KEY = "world-building-preview-state-v2";
const defaultLocale = document.body.dataset.locale || document.documentElement.lang || "ru";
const page = document.body.dataset.page || "dashboard";

const initialState = {
  locale: defaultLocale,
  characters: [
    {
      id: "char-001",
      kind: "character",
      name: "Илья Ворен",
      slug: "ilya-voren",
      summary: "Архивист, собирающий свидетельства приграничных войн.",
      status: "active",
      canonState: "canonical",
      pronouns: "он/его",
      epithet: "Хранитель Южной описи",
      updatedAt: "2026-04-21",
      tags: ["tag-archive", "tag-witness"],
    },
    {
      id: "char-002",
      kind: "character",
      name: "Мира Сельн",
      slug: "mira-seln",
      summary: "Бывшая штурманка, которая теперь ведёт людей через ветровые дороги.",
      status: "draft",
      canonState: "alternate",
      pronouns: "она/её",
      epithet: "Картограф Ветровой линии",
      updatedAt: "2026-04-19",
      tags: ["tag-travel"],
    },
    {
      id: "char-003",
      kind: "character",
      name: "Товин Рейк",
      slug: "tovin-rake",
      summary: "Посредник между речными синдикатами и сухопутными караванами.",
      status: "active",
      canonState: "uncertain",
      pronouns: "они/их",
      epithet: "Эмиссар Трёх портов",
      updatedAt: "2026-04-18",
      tags: ["tag-frontier", "tag-faction"],
    },
  ],
  places: [
    {
      id: "place-001",
      kind: "place",
      name: "Порт Харис",
      slug: "kharis-port",
      summary: "Торговый город вокруг старой крепости у устья реки.",
      status: "active",
      canonState: "canonical",
      placeKind: "Город",
      locationText: "Южное побережье, устье Ота",
      updatedAt: "2026-04-20",
      tags: ["tag-capital", "tag-travel"],
    },
    {
      id: "place-002",
      kind: "place",
      name: "Серый Лог",
      slug: "grey-hollow",
      summary: "Горная долина с заброшенными обсерваториями и тихими дорогами.",
      status: "draft",
      canonState: "uncertain",
      placeKind: "Долина",
      locationText: "Северо-восточный хребет",
      updatedAt: "2026-04-17",
      tags: ["tag-archive", "tag-frontier"],
    },
    {
      id: "place-003",
      kind: "place",
      name: "Соболиный Перекат",
      slug: "sable-crossing",
      summary: "Речной контрольный пункт с очень строгими записями о проходе.",
      status: "active",
      canonState: "alternate",
      placeKind: "Переправа",
      locationText: "Средний речной путь",
      updatedAt: "2026-04-16",
      tags: ["tag-faction"],
    },
  ],
  tags: [
    { id: "tag-capital", key: "capital", color: "#89b9ff" },
    { id: "tag-faction", key: "faction", color: "#cfa0ff" },
    { id: "tag-witness", key: "witness", color: "#f0b37e" },
    { id: "tag-travel", key: "travel", color: "#7ecdb8" },
    { id: "tag-archive", key: "archive", color: "#d7cf93" },
    { id: "tag-frontier", key: "frontier", color: "#f09aa3" },
  ],
  links: [
    { id: "link-001", fromKind: "character", fromId: "char-001", toKind: "place", toId: "place-001", label: "работает в" },
    { id: "link-002", fromKind: "character", fromId: "char-002", toKind: "place", toId: "place-002", label: "исследует" },
    { id: "link-003", fromKind: "character", fromId: "char-003", toKind: "place", toId: "place-003", label: "контролирует проход" },
  ],
};

const state = loadState();
const viewState = {
  characters: {
    selectedId: state.characters[0]?.id ?? null,
    mode: "create",
    query: "",
  },
  places: {
    selectedId: state.places[0]?.id ?? null,
    mode: "create",
    query: "",
  },
};

let ui = window.getPreviewUiText(state.locale);

bootstrap();

function bootstrap() {
  applyLocale(state.locale);
  wireLocaleToggle();
  wireGlobalSearch();

  if (page === "dashboard") {
    renderDashboard();
  } else if (page === "characters") {
    applySelectionFromQuery("characters");
    wireEntityPage("characters");
  } else if (page === "places") {
    applySelectionFromQuery("places");
    wireEntityPage("places");
  } else if (page === "search") {
    wireSearchPage();
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return structuredClone(initialState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(initialState),
      ...parsed,
      locale: parsed.locale || initialState.locale,
    };
  } catch {
    return structuredClone(initialState);
  }
}

function persistState() {
  window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(state));
}

function applyLocale(locale) {
  state.locale = locale;
  ui = window.getPreviewUiText(locale);
  document.documentElement.lang = locale;
  document.body.dataset.locale = locale;
  document.title = ui.meta.pageTitle[page] ?? ui.meta.pageTitle.dashboard;

  document.querySelectorAll("[data-ui-text]").forEach((node) => {
    const value = getCopy(node.dataset.uiText);
    if (value !== undefined) {
      node.textContent = value;
    }
  });

  document.querySelectorAll("[data-ui-placeholder]").forEach((node) => {
    const value = getCopy(node.dataset.uiPlaceholder);
    if (value !== undefined) {
      node.setAttribute("placeholder", value);
    }
  });

  document.querySelectorAll("[data-locale-choice]").forEach((node) => {
    node.classList.toggle("active", node.dataset.localeChoice === locale);
  });

  activateNav();
  persistState();
}

function wireLocaleToggle() {
  document.querySelectorAll("[data-locale-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLocale(button.dataset.localeChoice);
      rerenderActivePage();
    });
  });
}

function wireGlobalSearch() {
  const form = document.getElementById("global-search-form");
  const input = document.getElementById("global-search-input");
  if (!form || !input) return;

  const currentQuery = new URLSearchParams(window.location.search).get("q") || "";
  input.value = currentQuery;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const target = `./search.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
    window.location.href = target;
  });
}

function activateNav() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const active =
      (page === "dashboard" && href === "./index.html") ||
      (page === "characters" && href === "./characters.html") ||
      (page === "places" && href === "./places.html") ||
      (page === "search" && href === "./search.html");

    link.classList.toggle("active", active);
  });
}

function rerenderActivePage() {
  if (page === "dashboard") {
    renderDashboard();
  } else if (page === "characters") {
    renderEntityPage("characters");
  } else if (page === "places") {
    renderEntityPage("places");
  } else if (page === "search") {
    renderSearchPage();
  }
}

function renderDashboard() {
  const cards = document.getElementById("summary-cards");
  const recent = document.getElementById("recent-records");
  const checklist = document.getElementById("progress-checklist");
  const capabilities = document.getElementById("dashboard-capabilities");
  if (!cards || !recent || !checklist || !capabilities) return;

  cards.innerHTML = [
    renderStatCard(ui.dashboard.stats.characters, state.characters.length),
    renderStatCard(ui.dashboard.stats.places, state.places.length),
    renderStatCard(ui.dashboard.stats.tags, state.tags.length),
    renderStatCard(ui.dashboard.stats.links, state.links.length),
  ].join("");

  const recentRecords = [...state.characters, ...state.places]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  recent.innerHTML = recentRecords
    .map(
      (item) => `
        <article class="list-item">
          <h4>${escapeHtml(item.name)}</h4>
          <p>${escapeHtml(item.slug)} · ${escapeHtml(item.updatedAt)}</p>
          <a href="${buildEntityHref(item.kind, item.id)}" class="button-link">${escapeHtml(ui.common.searchOpenEntity)}</a>
        </article>
      `
    )
    .join("");

  checklist.innerHTML = ui.dashboard.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  capabilities.innerHTML = ui.dashboard.capabilities
    .map((item) => `<article class="list-item"><p>${escapeHtml(item)}</p></article>`)
    .join("");
}

function renderStatCard(copy, value) {
  return `
    <article class="card">
      <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
      <h3>${escapeHtml(copy.title)}</h3>
      <p class="muted">${value} ${escapeHtml(copy.suffix)}</p>
    </article>
  `;
}

function wireEntityPage(entityKey) {
  const refs = getEntityRefs();
  const stateForPage = viewState[entityKey];
  const copy = ui[entityKey];

  refs.filter?.addEventListener("input", (event) => {
    stateForPage.query = event.target.value.trim().toLowerCase();
    renderEntityPage(entityKey);
  });

  refs.newBtn?.addEventListener("click", () => {
    stateForPage.mode = "create";
    refs.form.reset();
    writeMessage(refs.formMessage, copy.messages.createDraft, "success");
    renderEntityPage(entityKey);
  });

  refs.editBtn?.addEventListener("click", () => {
    const selected = getSelectedRecord(entityKey);
    if (!selected) {
      writeMessage(refs.formMessage, copy.messages.selectBeforeEdit, "error");
      return;
    }

    stateForPage.mode = "edit";
    fillEntityForm(entityKey, selected);
    writeMessage(refs.formMessage, `${selected.name} ${ui.common.savedState}`, "success");
    renderEntityPage(entityKey);
  });

  refs.cancelBtn?.addEventListener("click", () => {
    refs.form.reset();
    stateForPage.mode = "create";
    writeMessage(refs.formMessage, copy.messages.resetToCreate, "success");
    renderEntityPage(entityKey);
  });

  refs.deleteBtn?.addEventListener("click", () => {
    const selected = getSelectedRecord(entityKey);
    if (!selected) {
      writeMessage(refs.formMessage, copy.messages.nothingSelectedToDelete, "error");
      return;
    }

    if (!window.confirm(ui.common.deleteConfirm)) {
      return;
    }

    removeEntity(entityKey, selected.id);
    stateForPage.selectedId = state[entityKey][0]?.id ?? null;
    stateForPage.mode = "create";
    refs.form.reset();
    writeMessage(refs.formMessage, copy.messages.removed, "success");
    persistState();
    renderEntityPage(entityKey);
  });

  refs.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = readEntityForm(entityKey);
    if (!payload.name) {
      writeMessage(refs.formMessage, `${copy.form.name} ${ui.common.requiredSuffix}`, "error");
      return;
    }

    if (!payload.slug) {
      payload.slug = slugify(payload.name);
    }

    if (stateForPage.mode === "create") {
      const record = {
        id: `${entityKey.slice(0, -1)}-${Date.now().toString(16).slice(-8)}`,
        kind: entityKey === "characters" ? "character" : "place",
        updatedAt: currentDateStamp(),
        tags: [],
        ...payload,
      };
      state[entityKey].unshift(record);
      stateForPage.selectedId = record.id;
      stateForPage.mode = "edit";
      refs.form.reset();
      writeMessage(refs.formMessage, copy.messages.created, "success");
    } else {
      const selected = getSelectedRecord(entityKey);
      if (!selected) {
        writeMessage(refs.formMessage, copy.messages.selectBeforeSave, "error");
        return;
      }

      Object.assign(selected, payload, { updatedAt: currentDateStamp() });
      writeMessage(refs.formMessage, copy.messages.updated, "success");
    }

    persistState();
    renderEntityPage(entityKey);
  });

  refs.tagForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = getSelectedRecord(entityKey);
    if (!selected) {
      writeMessage(refs.tagMessage, ui.common.selectRecordFirst, "error");
      return;
    }

    const tagId = refs.tagSelect.value;
    if (!tagId) {
      writeMessage(refs.tagMessage, ui.common.selectRecordFirst, "error");
      return;
    }

    if (selected.tags.includes(tagId)) {
      writeMessage(refs.tagMessage, ui.common.tagAlreadyAttached, "error");
      return;
    }

    selected.tags.push(tagId);
    selected.updatedAt = currentDateStamp();
    persistState();
    writeMessage(refs.tagMessage, ui.common.savedState, "success");
    renderEntityPage(entityKey);
  });

  refs.linkForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = getSelectedRecord(entityKey);
    if (!selected) {
      writeMessage(refs.linkMessage, ui.common.selectRecordFirst, "error");
      return;
    }

    const targetId = refs.linkTarget.value;
    const label = refs.linkLabel.value.trim() || ui.common.noValue;
    const targetKind = entityKey === "characters" ? "place" : "character";
    const normalized = normalizeLinkPair(selected.kind, selected.id, targetKind, targetId);

    const exists = state.links.some(
      (link) =>
        link.fromKind === normalized.fromKind &&
        link.fromId === normalized.fromId &&
        link.toKind === normalized.toKind &&
        link.toId === normalized.toId
    );

    if (exists) {
      writeMessage(refs.linkMessage, ui.common.linkAlreadyExists, "error");
      return;
    }

    state.links.push({
      id: `link-${Date.now().toString(16).slice(-8)}`,
      ...normalized,
      label,
    });
    selected.updatedAt = currentDateStamp();
    persistState();
    refs.linkForm.reset();
    writeMessage(refs.linkMessage, ui.common.savedState, "success");
    renderEntityPage(entityKey);
  });

  renderEntityPage(entityKey);
}

function renderEntityPage(entityKey) {
  const refs = getEntityRefs();
  const stateForPage = viewState[entityKey];
  const copy = ui[entityKey];
  const records = state[entityKey];
  const filtered = records.filter((record) => matchesQuery(record, stateForPage.query));

  refs.count.textContent = `${records.length} ${ui.common.itemsSuffix}`;
  refs.formTitle.textContent = stateForPage.mode === "create" ? copy.form.createTitle : copy.form.editTitle;
  refs.formMode.textContent = stateForPage.mode === "create" ? copy.form.createMode : copy.form.editMode;

  refs.list.innerHTML = filtered.length
    ? filtered.map((record) => renderRecordItem(entityKey, record, record.id === stateForPage.selectedId)).join("")
    : `<div class="empty-state">${escapeHtml(ui.common.noMatches)}</div>`;

  refs.list.querySelectorAll(".record-item").forEach((node) => {
    node.addEventListener("click", () => {
      stateForPage.selectedId = node.dataset.id;
      renderEntityPage(entityKey);
    });
  });

  const selected = getSelectedRecord(entityKey);
  refs.selectedStatus.textContent = selected ? `${ui.common.selectedPrefix} ${selected.name}` : ui.common.noSelection;
  refs.detail.innerHTML = selected ? renderEntityDetail(entityKey, selected) : `<div class="empty-state">${escapeHtml(ui.common.selectFromList)}</div>`;

  renderTagSection(selected, refs);
  renderLinkSection(entityKey, selected, refs);
}

function renderRecordItem(entityKey, record, isActive) {
  const copy = ui[entityKey];
  return `
    <article class="record-item ${isActive ? "active" : ""}" data-id="${record.id}">
      <h4>${escapeHtml(record.name)}</h4>
      <p>${escapeHtml(record.slug)}</p>
      <div class="meta-row">
        ${statusBadge(record.status, copy.form.statusOptions[record.status] ?? record.status)}
        <span class="badge">${escapeHtml(copy.form.canonOptions[record.canonState] ?? record.canonState)}</span>
      </div>
    </article>
  `;
}

function renderEntityDetail(entityKey, record) {
  const copy = ui[entityKey];
  const profileMarkup =
    entityKey === "characters"
      ? `${copy.detailLabels.pronouns}: ${escapeHtml(record.pronouns || ui.common.noValue)}<br>${copy.detailLabels.epithet}: ${escapeHtml(record.epithet || ui.common.noValue)}`
      : `${copy.detailLabels.placeKind}: ${escapeHtml(record.placeKind || ui.common.noValue)}<br>${copy.detailLabels.locationText}: ${escapeHtml(record.locationText || ui.common.noValue)}`;

  return `
    <article class="detail-row">
      <p class="detail-label">${escapeHtml(copy.detailLabels.name)}</p>
      <p class="detail-value">${escapeHtml(record.name)}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">${escapeHtml(copy.detailLabels.slug)}</p>
      <p class="detail-value">${escapeHtml(record.slug)}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">${escapeHtml(copy.detailLabels.summary)}</p>
      <p class="detail-value">${escapeHtml(record.summary || ui.common.noSummary)}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">${escapeHtml(copy.detailLabels.profile)}</p>
      <p class="detail-value">${profileMarkup}</p>
    </article>
    <article class="detail-row">
      <p class="detail-label">${escapeHtml(copy.detailLabels.state)}</p>
      <p class="detail-value">${escapeHtml(copy.form.statusOptions[record.status] ?? record.status)} · ${escapeHtml(copy.form.canonOptions[record.canonState] ?? record.canonState)}</p>
    </article>
  `;
}

function renderTagSection(selected, refs) {
  if (!refs.tagList || !refs.tagSelect || !refs.tagCount) return;

  if (!selected) {
    refs.tagList.innerHTML = `<div class="empty-state">${escapeHtml(ui.common.selectFromList)}</div>`;
    refs.tagSelect.innerHTML = `<option value="">${escapeHtml(ui.common.noSelection)}</option>`;
    refs.tagCount.textContent = "0";
    return;
  }

  const attached = state.tags.filter((tag) => selected.tags.includes(tag.id));
  refs.tagCount.textContent = `${attached.length} ${ui.common.itemsSuffix}`;
  refs.tagList.innerHTML = attached.length
    ? attached
        .map(
          (tag) => `
            <span class="tag-chip" style="border-color:${tag.color};">
              ${escapeHtml(resolveTagName(tag))}
              <button type="button" class="chip-remove" data-tag-id="${tag.id}">${escapeHtml(ui.common.removeTag)}</button>
            </span>
          `
        )
        .join("")
    : `<div class="empty-state">${escapeHtml(ui.common.noMatches)}</div>`;

  refs.tagSelect.innerHTML = state.tags
    .map((tag) => `<option value="${tag.id}">${escapeHtml(resolveTagName(tag))}</option>`)
    .join("");

  refs.tagList.querySelectorAll("[data-tag-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selected.tags = selected.tags.filter((tagId) => tagId !== button.dataset.tagId);
      selected.updatedAt = currentDateStamp();
      persistState();
      writeMessage(refs.tagMessage, ui.common.savedState, "success");
      renderEntityPage(selected.kind === "character" ? "characters" : "places");
    });
  });
}

function renderLinkSection(entityKey, selected, refs) {
  if (!refs.linkList || !refs.linkTarget || !refs.linkCount) return;

  const counterpartKey = entityKey === "characters" ? "places" : "characters";
  const counterpartRecords = state[counterpartKey];

  refs.linkTarget.innerHTML = counterpartRecords
    .map((record) => `<option value="${record.id}">${escapeHtml(record.name)}</option>`)
    .join("");

  if (!selected) {
    refs.linkList.innerHTML = `<div class="empty-state">${escapeHtml(ui.common.selectFromList)}</div>`;
    refs.linkCount.textContent = "0";
    return;
  }

  const relatedLinks = state.links.filter((link) => link.fromId === selected.id || link.toId === selected.id);
  refs.linkCount.textContent = `${relatedLinks.length} ${ui.common.itemsSuffix}`;
  refs.linkList.innerHTML = relatedLinks.length
    ? relatedLinks.map((link) => renderLinkItem(selected, link)).join("")
    : `<div class="empty-state">${escapeHtml(ui.common.noMatches)}</div>`;

  refs.linkList.querySelectorAll("[data-link-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.links = state.links.filter((link) => link.id !== button.dataset.linkId);
      persistState();
      writeMessage(refs.linkMessage, ui.common.savedState, "success");
      renderEntityPage(entityKey);
    });
  });
}

function renderLinkItem(selected, link) {
  const target = link.fromId === selected.id ? getEntity(link.toKind, link.toId) : getEntity(link.fromKind, link.fromId);
  const targetHref = target ? buildEntityHref(target.kind, target.id) : "#";
  const targetKindLabel = target ? ui.entityKinds[target.kind] : ui.common.noValue;

  return `
    <article class="link-item">
      <div class="link-header">
        <span class="badge">${escapeHtml(targetKindLabel)}</span>
        <button type="button" class="ghost-button" data-link-id="${link.id}">${escapeHtml(ui.common.removeLink)}</button>
      </div>
      <div class="link-target">${escapeHtml(target?.name || ui.common.noValue)}</div>
      <p>${escapeHtml(link.label || ui.common.noValue)}</p>
      <a href="${targetHref}" class="button-link">${escapeHtml(ui.common.searchOpenEntity)}</a>
    </article>
  `;
}

function wireSearchPage() {
  const form = document.getElementById("search-page-form");
  const input = document.getElementById("search-page-input");
  const coverage = document.getElementById("search-coverage-list");
  if (coverage) {
    coverage.innerHTML = ui.search.coverage.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  if (form && input) {
    input.value = new URLSearchParams(window.location.search).get("q") || "";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const target = `./search.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      window.history.replaceState({}, "", target);
      const navInput = document.getElementById("global-search-input");
      if (navInput) navInput.value = query;
      renderSearchPage();
    });
  }

  renderSearchPage();
}

function renderSearchPage() {
  const resultsNode = document.getElementById("search-results");
  const countNode = document.getElementById("search-count");
  const summaryNode = document.getElementById("search-summary");
  if (!resultsNode || !countNode || !summaryNode) return;

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q")?.trim() || "";
  const pageInput = document.getElementById("search-page-input");
  const navInput = document.getElementById("global-search-input");
  if (pageInput) pageInput.value = query;
  if (navInput) navInput.value = query;

  if (!query) {
    countNode.textContent = "0";
    summaryNode.textContent = ui.common.searchNoQuery;
    resultsNode.innerHTML = `<div class="empty-state">${escapeHtml(ui.common.searchNoQuery)}</div>`;
    return;
  }

  const results = searchRecords(query);
  countNode.textContent = String(results.length);
  summaryNode.textContent = `${ui.common.searchResultsPrefix} "${query}"`;

  resultsNode.innerHTML = results.length
    ? results.map(renderSearchResult).join("")
    : `<div class="empty-state">${escapeHtml(ui.common.searchNoResults)}</div>`;
}

function renderSearchResult(result) {
  const href = buildEntityHref(result.kind, result.id);
  return `
    <article class="search-result">
      <div class="search-result-header">
        <span class="badge">${escapeHtml(ui.entityKinds[result.kind])}</span>
        <a href="${href}" class="button-link">${escapeHtml(ui.common.searchOpenEntity)}</a>
      </div>
      <h4>${escapeHtml(result.name)}</h4>
      <p>${escapeHtml(result.slug)}</p>
      <p>${escapeHtml(result.summary || ui.common.noSummary)}</p>
    </article>
  `;
}

function searchRecords(query) {
  const normalized = query.toLowerCase();
  return [...state.characters, ...state.places].filter((record) => matchesQuery(record, normalized));
}

function matchesQuery(record, query) {
  if (!query) return true;
  const fields = [
    record.name,
    record.slug,
    record.summary,
    record.epithet,
    record.pronouns,
    record.placeKind,
    record.locationText,
  ];
  return fields.some((value) => String(value || "").toLowerCase().includes(query));
}

function readEntityForm(entityKey) {
  const form = document.getElementById("entity-form");
  const payload = {
    name: normalize(form.elements.name.value),
    slug: normalize(form.elements.slug.value),
    summary: normalize(form.elements.summary.value),
    status: normalize(form.elements.status.value) || "draft",
    canonState: normalize(form.elements.canonState.value) || "canonical",
  };

  if (entityKey === "characters") {
    payload.pronouns = normalize(form.elements.pronouns.value);
    payload.epithet = normalize(form.elements.epithet.value);
  } else {
    payload.placeKind = normalize(form.elements.placeKind.value);
    payload.locationText = normalize(form.elements.locationText.value);
  }

  return payload;
}

function fillEntityForm(entityKey, record) {
  const form = document.getElementById("entity-form");
  form.elements.name.value = record.name || "";
  form.elements.slug.value = record.slug || "";
  form.elements.summary.value = record.summary || "";
  form.elements.status.value = record.status || "draft";
  form.elements.canonState.value = record.canonState || "canonical";

  if (entityKey === "characters") {
    form.elements.pronouns.value = record.pronouns || "";
    form.elements.epithet.value = record.epithet || "";
  } else {
    form.elements.placeKind.value = record.placeKind || "";
    form.elements.locationText.value = record.locationText || "";
  }
}

function getEntityRefs() {
  return {
    list: document.getElementById("entity-list"),
    count: document.getElementById("entity-count"),
    detail: document.getElementById("entity-detail"),
    selectedStatus: document.getElementById("entity-selected-status"),
    filter: document.getElementById("entity-filter"),
    form: document.getElementById("entity-form"),
    formTitle: document.getElementById("entity-form-title"),
    formMode: document.getElementById("entity-form-mode"),
    formMessage: document.getElementById("entity-form-message"),
    newBtn: document.getElementById("entity-new-btn"),
    editBtn: document.getElementById("entity-edit-btn"),
    deleteBtn: document.getElementById("entity-delete-btn"),
    cancelBtn: document.getElementById("entity-cancel-btn"),
    tagList: document.getElementById("entity-tags"),
    tagSelect: document.getElementById("tag-select"),
    tagForm: document.getElementById("tag-form"),
    tagMessage: document.getElementById("tag-message"),
    tagCount: document.getElementById("tag-count"),
    linkList: document.getElementById("entity-links"),
    linkTarget: document.getElementById("link-target"),
    linkLabel: document.getElementById("link-label"),
    linkForm: document.getElementById("link-form"),
    linkMessage: document.getElementById("link-message"),
    linkCount: document.getElementById("link-count"),
  };
}

function getSelectedRecord(entityKey) {
  const selectedId = viewState[entityKey].selectedId;
  return state[entityKey].find((record) => record.id === selectedId) ?? null;
}

function getEntity(kind, id) {
  const collection = kind === "character" ? state.characters : state.places;
  return collection.find((record) => record.id === id) ?? null;
}

function buildEntityHref(kind, id) {
  const pageName = kind === "character" ? "characters" : "places";
  return `./${pageName}.html?select=${encodeURIComponent(id)}`;
}

function applySelectionFromQuery(entityKey) {
  const selectedId = new URLSearchParams(window.location.search).get("select");
  if (!selectedId) return;
  const exists = state[entityKey].some((record) => record.id === selectedId);
  if (exists) {
    viewState[entityKey].selectedId = selectedId;
    viewState[entityKey].mode = "edit";
  }
}

function removeEntity(entityKey, id) {
  state[entityKey] = state[entityKey].filter((record) => record.id !== id);
  state.links = state.links.filter((link) => link.fromId !== id && link.toId !== id);
}

function normalizeLinkPair(fromKind, fromId, toKind, toId) {
  const left = `${fromKind}:${fromId}`;
  const right = `${toKind}:${toId}`;

  if (left <= right) {
    return { fromKind, fromId, toKind, toId };
  }

  return { fromKind: toKind, fromId: toId, toKind: fromKind, toId: fromId };
}

function resolveTagName(tag) {
  return ui.tags.names[tag.key] ?? tag.key;
}

function statusBadge(status, label) {
  const className = status === "active" ? "is-active" : status === "archived" ? "is-archived" : "is-draft";
  return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

function writeMessage(node, text, tone) {
  if (!node) return;
  node.textContent = text;
  node.classList.remove("error", "success");
  node.classList.add(tone === "error" ? "error" : "success");
}

function getCopy(path) {
  return String(path ?? "")
    .split(".")
    .reduce((current, segment) => (current == null ? undefined : current[segment]), ui);
}

function normalize(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length ? trimmed : "";
}

function slugify(value) {
  const source = normalize(value)
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return source || "item";
}

function currentDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
