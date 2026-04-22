const data = {
  characters: [
    {
      id: "char-001",
      name: "Ilya Voren",
      slug: "ilya-voren",
      summary: "Archivist and witness of border wars.",
      status: "active",
      canonState: "canonical",
    },
    {
      id: "char-002",
      name: "Mira Seln",
      slug: "mira-seln",
      summary: "Former navigator, now city guide.",
      status: "draft",
      canonState: "alternate",
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
    },
    {
      id: "place-002",
      name: "Grey Hollow",
      slug: "grey-hollow",
      summary: "Mountain valley known for abandoned observatories.",
      status: "draft",
      canonState: "uncertain",
    },
  ],
};

const page = document.body.dataset.page;
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

function renderDashboard() {
  const container = document.getElementById("summary-cards");
  if (!container) return;

  container.innerHTML = `
    <article class="card">
      <h3>Characters</h3>
      <p>${data.characters.length} mock records</p>
    </article>
    <article class="card">
      <h3>Places</h3>
      <p>${data.places.length} mock records</p>
    </article>
  `;
}

function renderList(elementId, items) {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
      <article class="item">
        <h3>${item.name}</h3>
        <p><strong>Slug:</strong> ${item.slug}</p>
        <p>${item.summary}</p>
        <p>
          <span class="badge">status: ${item.status}</span>
          <span class="badge">canon: ${item.canonState}</span>
        </p>
      </article>
    `
    )
    .join("");
}

if (page === "dashboard") {
  renderDashboard();
}

if (page === "characters") {
  renderList("characters-list", data.characters);
}

if (page === "places") {
  renderList("places-list", data.places);
}
