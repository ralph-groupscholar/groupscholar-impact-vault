const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".vault-card");
const selectionList = document.querySelector("#selection-list");
const selectionCount = document.querySelector("#selection-count");
const selectionHint = document.querySelector("#selection-hint");
const clearSelection = document.querySelector("#clear-selection");
const balanceValues = document.querySelectorAll(".balance-value");
const briefCallout = document.querySelector("#brief-callout");

const selectedCards = new Map();

const categoryLabels = {
  scholar: "Scholar Journey",
  partner: "Partner Readiness",
  impact: "Impact Proof",
  risk: "Risk Watch",
};

const setActive = (selected) => {
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip === selected);
  });
};

const filterCards = (filter) => {
  cards.forEach((card) => {
    const category = card.dataset.category;
    const show = filter === "all" || filter === category;
    card.style.display = show ? "block" : "none";
  });
};

const buildSelectionItem = (entry) => {
  const item = document.createElement("li");
  item.className = "selection-item";
  item.dataset.id = entry.id;

  const heading = document.createElement("div");
  heading.className = "selection-heading";

  const title = document.createElement("span");
  title.className = "selection-title";
  title.textContent = entry.title;

  const removeButton = document.createElement("button");
  removeButton.className = "selection-remove";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.setAttribute("aria-label", `Remove ${entry.title}`);
  removeButton.addEventListener("click", () => {
    toggleSelection(entry.card);
  });

  heading.appendChild(title);
  heading.appendChild(removeButton);

  const meta = document.createElement("p");
  meta.className = "selection-meta";
  meta.textContent = `${entry.tag} · ${entry.meta}`;

  item.appendChild(heading);
  item.appendChild(meta);

  return item;
};

const updateBalance = () => {
  const counts = { scholar: 0, partner: 0, impact: 0, risk: 0 };
  selectedCards.forEach((entry) => {
    if (counts[entry.category] !== undefined) {
      counts[entry.category] += 1;
    }
  });

  balanceValues.forEach((value) => {
    const category = value.dataset.summary;
    value.textContent = counts[category] || 0;
  });

  const total = selectedCards.size;
  if (total === 0) {
    briefCallout.textContent = "Select signals to unlock a weekly highlight narrative.";
    selectionHint.textContent = "Add 3-5 for a full brief";
    return;
  }

  if (total < 3) {
    const remaining = 3 - total;
    briefCallout.textContent = `Add ${remaining} more signal${remaining === 1 ? "" : "s"} to reach a full brief.`;
    selectionHint.textContent = "Build toward at least three signals";
    return;
  }

  const missing = Object.keys(counts).filter((key) => counts[key] === 0);
  if (missing.length) {
    const label = categoryLabels[missing[0]];
    briefCallout.textContent = `Consider adding ${label.toLowerCase()} to balance the story.`;
    selectionHint.textContent = "Aim for coverage across all four lenses";
    return;
  }

  if (total > 5) {
    briefCallout.textContent = "Trim to five signals to keep the brief crisp.";
    selectionHint.textContent = "Highlight your top priorities";
    return;
  }

  briefCallout.textContent = "Brief pack ready. Share with leadership and partners.";
  selectionHint.textContent = "Balanced coverage achieved";
};

const updateSelectionList = () => {
  selectionList.innerHTML = "";

  if (selectedCards.size === 0) {
    const empty = document.createElement("li");
    empty.className = "selection-empty";
    empty.textContent = "No signals selected yet. Tap a card to add it here.";
    selectionList.appendChild(empty);
    selectionCount.textContent = "0";
    updateBalance();
    return;
  }

  selectedCards.forEach((entry) => {
    selectionList.appendChild(buildSelectionItem(entry));
  });

  selectionCount.textContent = String(selectedCards.size);
  updateBalance();
};

const toggleSelection = (card) => {
  const id = card.dataset.id;
  if (!id) {
    return;
  }

  if (selectedCards.has(id)) {
    selectedCards.delete(id);
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  } else {
    const entry = {
      id,
      card,
      category: card.dataset.category,
      title: card.querySelector("h3")?.textContent?.trim() || "Signal",
      meta: card.querySelector(".card-meta")?.textContent?.trim() || "",
      tag: card.querySelector(".tag")?.textContent?.trim() || "Signal",
    };
    selectedCards.set(id, entry);
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
  }

  updateSelectionList();
};

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    setActive(chip);
    filterCards(filter);
  });
});

cards.forEach((card) => {
  const toggle = () => toggleSelection(card);

  card.addEventListener("click", toggle);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
});

clearSelection?.addEventListener("click", () => {
  selectedCards.clear();
  cards.forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  updateSelectionList();
});

updateSelectionList();
