const chips = document.querySelectorAll(".chip");
const vaultGrid = document.querySelector("#vault-grid");
const vaultCount = document.querySelector("#vault-count");
const vaultUpdated = document.querySelector("#vault-updated");
const vaultStatus = document.querySelector("#vault-status");
const refreshSignals = document.querySelector("#refresh-signals");
let cards = [];

const selectionList = document.querySelector("#selection-list");
const selectionCount = document.querySelector("#selection-count");
const selectionHint = document.querySelector("#selection-hint");
const clearSelection = document.querySelector("#clear-selection");
const balanceValues = document.querySelectorAll(".balance-value");
const briefCallout = document.querySelector("#brief-callout");
const briefOutput = document.querySelector("#brief-output");
const briefDraft = document.querySelector("#brief-draft");
const copyBrief = document.querySelector("#copy-brief");
const downloadBrief = document.querySelector("#download-brief");
const saveBrief = document.querySelector("#save-brief");
const briefStatus = document.querySelector("#brief-status");
const briefTitleInput = document.querySelector("#brief-title");
const briefOwnerInput = document.querySelector("#brief-owner");

const briefArchiveList = document.querySelector("#brief-archive-list");
const briefArchiveStatus = document.querySelector("#brief-archive-status");

const decisionGrid = document.querySelector("#decision-grid");
const decisionStatus = document.querySelector("#decision-status");

const escalationsGrid = document.querySelector("#escalations-grid");
const escalationsStatus = document.querySelector("#escalations-status");
const refreshEscalations = document.querySelector("#refresh-escalations");
const escalationsCount = document.querySelector("#escalations-count");
const escalationsUpdated = document.querySelector("#escalations-updated");

const pulseUpdated = document.querySelector("#pulse-updated");
const pulseActiveCount = document.querySelector("#pulse-active-count");
const pulseActiveMeta = document.querySelector("#pulse-active-meta");
const pulsePartnerConfidence = document.querySelector("#pulse-partner-confidence");
const pulsePartnerMeta = document.querySelector("#pulse-partner-meta");
const pulseOutcomeProof = document.querySelector("#pulse-outcome-proof");
const pulseOutcomeMeta = document.querySelector("#pulse-outcome-meta");
const pulseRiskCount = document.querySelector("#pulse-risk-count");
const pulseRiskMeta = document.querySelector("#pulse-risk-meta");

const selectedCards = new Map();

const categoryLabels = {
  scholar: "Scholar Journey",
  partner: "Partner Readiness",
  impact: "Impact Proof",
  risk: "Risk Watch",
};

const fallbackSignals = [
  {
    id: "signal-1",
    category: "scholar",
    tag: "Scholar Journey",
    title: "Retention lift after cohort mentoring pilot",
    summary:
      "Scholars in the peer-mentored cohort completed 1.8x more milestones with a 12% higher retention rate than control groups.",
    owner: "Scholar Success",
    evidence: "Survey + CRM",
    timeLabel: "2 days ago",
  },
  {
    id: "signal-2",
    category: "partner",
    tag: "Partner Readiness",
    title: "Employer partners ready for spring placement surge",
    summary:
      "9 partners have confirmed placement slots with onboarding assets delivered and hiring managers trained on support standards.",
    owner: "Partnerships",
    evidence: "Partner CRM",
    timeLabel: "3 days ago",
  },
  {
    id: "signal-3",
    category: "impact",
    tag: "Impact Proof",
    title: "First-gen graduation outcomes verified",
    summary:
      "17 scholars officially crossed graduation milestones, with 11 landing in roles aligned to their declared pathways.",
    owner: "Impact",
    evidence: "Institutional records",
    timeLabel: "4 days ago",
  },
  {
    id: "signal-4",
    category: "risk",
    tag: "Risk Watch",
    title: "Financial aid gaps emerging for two campuses",
    summary:
      "Aid offices report delayed award packaging; recommend targeted outreach and bridge funding contingency planning.",
    owner: "Operations",
    evidence: "Campus reports",
    timeLabel: "Yesterday",
  },
  {
    id: "signal-5",
    category: "impact",
    tag: "Impact Proof",
    title: "Scholar leadership pipeline hits 80% participation",
    summary:
      "Leadership programming participation increased after introducing micro-credentialing and alumni storytelling sessions.",
    owner: "Programs",
    evidence: "Attendance + LMS",
    timeLabel: "5 days ago",
  },
  {
    id: "signal-6",
    category: "scholar",
    tag: "Scholar Journey",
    title: "Well-being check-ins signal higher stress in finals window",
    summary:
      "Mental health touchpoints show a 22% increase in stress markers; deploy finals week support plan and advisor staffing.",
    owner: "Care Team",
    evidence: "Check-in dashboard",
    timeLabel: "6 days ago",
  },
];

const fallbackPulse = {
  snapshotDate: new Date().toISOString().slice(0, 10),
  activeScholars: 482,
  activeChange: 0.06,
  partnerConfidence: 92,
  partnerOnTrack: 14,
  outcomeProof: 38,
  nextRisks: 3,
};

const fallbackDecisions = [
  {
    id: "decision-1",
    title: "Bridge fund approved for aid delays",
    summary:
      "$48k released for two campuses, tied to weekly FAFSA packaging updates and a 14-day reforecast milestone.",
    owner: "Finance + Ops",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 13)).toISOString().slice(0, 10),
    status: "In progress",
    priority: "High",
  },
  {
    id: "decision-2",
    title: "Advisor surge coverage for finals week",
    summary:
      "Temporary support added to reduce wait time below 24 hours and stabilize well-being check-ins during high stress windows.",
    owner: "Scholar Success",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().slice(0, 10),
    status: "Active",
    priority: "Medium",
  },
  {
    id: "decision-3",
    title: "Partner onboarding refresh sprint",
    summary:
      "Training modules refreshed with support standards, escalation paths, and new mentoring expectations for spring placements.",
    owner: "Partnerships",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().slice(0, 10),
    status: "Scheduled",
    priority: "Medium",
  },
];

const fallbackEscalations = [
  {
    id: "escalation-001",
    title: "Bridge funding approvals for two campuses",
    summary:
      "Aid packaging delays are extending beyond 10 days; temporary funding approvals needed to prevent stop-outs.",
    owner: "Operations",
    severity: "High",
    status: "Open",
    dueLabel: "Due in 3 days",
  },
  {
    id: "escalation-002",
    title: "Advisor coverage gap for finals week",
    summary:
      "Well-being check-ins show a 22% stress increase; deploy surge advisors and triage scripts.",
    owner: "Scholar Success",
    severity: "Medium",
    status: "In Progress",
    dueLabel: "Due tomorrow",
  },
  {
    id: "escalation-003",
    title: "Partner onboarding refresher for spring placements",
    summary:
      "Three employers need updated support playbooks before onboarding; coordinate training sessions.",
    owner: "Partnerships",
    severity: "Low",
    status: "Watching",
    dueLabel: "Due in 1 week",
  },
];

const formatBriefDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getBriefTitle = () => {
  const value = briefTitleInput?.value?.trim();
  return value || `Group Scholar Impact Brief — ${formatBriefDate()}`;
};

const getBriefOwner = () => {
  const value = briefOwnerInput?.value?.trim();
  return value || "Impact Ops";
};

const formatPulseUpdated = (value) => {
  if (!value) {
    return "Updated today";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Updated today";
  }
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays <= 0) {
    return "Updated today";
  }
  if (diffDays === 1) {
    return "Updated yesterday";
  }
  return `Updated ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
};

const formatVaultUpdated = (value) => {
  if (!value) {
    return "Last sync: Today";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Last sync: Today";
  }
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays <= 0) {
    return "Last sync: Today";
  }
  if (diffDays === 1) {
    return "Last sync: Yesterday";
  }
  return `Last sync: ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
};

const updateVaultMeta = ({ signals, meta, usedFallback }) => {
  if (vaultCount) {
    const total = meta?.total || signals.length;
    vaultCount.textContent = `${total} signals`;
  }
  if (vaultUpdated) {
    vaultUpdated.textContent = formatVaultUpdated(meta?.lastSync || new Date());
  }
  if (vaultStatus) {
    vaultStatus.textContent = usedFallback
      ? "Showing cached signals. Live sync unavailable."
      : `Live sync complete. ${signals.length} signals loaded.`;
  }
};

const formatEscalationStatus = (value) => {
  if (!value) {
    return "Pending";
  }
  return value;
};

const formatEscalationsUpdated = (value) => {
  if (!value) {
    return "Last sync: Today";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Last sync: Today";
  }
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays <= 0) {
    return "Last sync: Today";
  }
  if (diffDays === 1) {
    return "Last sync: Yesterday";
  }
  return `Last sync: ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
};

const buildEscalationCard = (escalation) => {
  const card = document.createElement("article");
  card.className = "escalation-card";

  const severity = (escalation.severity || "Medium").toLowerCase();
  card.classList.add(`severity-${severity}`);

  const header = document.createElement("div");
  header.className = "escalation-header";

  const title = document.createElement("h3");
  title.className = "escalation-title";
  title.textContent = escalation.title || "Escalation";

  const meta = document.createElement("div");
  meta.className = "escalation-meta";

  const severityChip = document.createElement("span");
  severityChip.className = "escalation-chip";
  severityChip.textContent = escalation.severity || "Medium";

  const statusChip = document.createElement("span");
  statusChip.className = "escalation-chip subtle";
  statusChip.textContent = formatEscalationStatus(escalation.status);

  meta.appendChild(severityChip);
  meta.appendChild(statusChip);

  header.appendChild(title);
  header.appendChild(meta);

  const summary = document.createElement("p");
  summary.className = "escalation-summary";
  summary.textContent = escalation.summary || "Details pending.";

  const footer = document.createElement("div");
  footer.className = "escalation-footer";

  const owner = document.createElement("span");
  owner.textContent = `Owner: ${escalation.owner || "Impact Ops"}`;

  const due = document.createElement("span");
  due.textContent = escalation.dueLabel || "Due soon";

  footer.appendChild(owner);
  footer.appendChild(due);

  card.appendChild(header);
  card.appendChild(summary);
  card.appendChild(footer);

  return card;
};

const renderEscalations = (escalations) => {
  if (!escalationsGrid) {
    return;
  }
  escalationsGrid.innerHTML = "";

  if (!escalations.length) {
    const empty = document.createElement("div");
    empty.className = "escalation-card placeholder";
    empty.innerHTML =
      "<p class=\"escalation-title\">No escalations active.</p><p class=\"escalation-summary\">Use the vault to log new urgent needs.</p>";
    escalationsGrid.appendChild(empty);
    return;
  }

  escalations.forEach((escalation) => {
    escalationsGrid.appendChild(buildEscalationCard(escalation));
  });
};

const loadEscalations = async ({ isRefresh = false } = {}) => {
  if (!escalationsGrid) {
    return;
  }
  if (refreshEscalations) {
    refreshEscalations.disabled = true;
  }
  if (escalationsStatus) {
    escalationsStatus.textContent = isRefresh
      ? "Refreshing escalation queue..."
      : "Loading escalation queue…";
  }

  let escalations = fallbackEscalations;
  let meta = { total: fallbackEscalations.length, lastSync: new Date().toISOString() };
  let usedFallback = true;
  try {
    const response = await fetch("/api/escalations");
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.escalations)) {
        escalations = payload.escalations;
        meta = payload.meta || meta;
        usedFallback = false;
      }
    }
  } catch (error) {
    // Keep fallback data.
  }

  renderEscalations(escalations);
  if (escalationsCount) {
    const total = meta?.total || escalations.length;
    escalationsCount.textContent = `${total} escalations`;
  }
  if (escalationsUpdated) {
    escalationsUpdated.textContent = formatEscalationsUpdated(meta?.lastSync);
  }
  if (escalationsStatus) {
    escalationsStatus.textContent = usedFallback
      ? "Showing cached escalations. Live sync unavailable."
      : `Live queue synced. ${escalations.length} escalations loaded.`;
  }
  if (refreshEscalations) {
    refreshEscalations.disabled = false;
  }
};

const getCounts = () => {
  const counts = { scholar: 0, partner: 0, impact: 0, risk: 0 };
  selectedCards.forEach((entry) => {
    if (counts[entry.category] !== undefined) {
      counts[entry.category] += 1;
    }
  });
  return counts;
};

const setActive = (selected) => {
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip === selected);
  });
};

const getActiveFilter = () =>
  document.querySelector(".chip.active")?.dataset.filter || "all";

const updateVaultEmptyState = (visibleCount) => {
  if (!vaultGrid) {
    return;
  }
  const existing = vaultGrid.querySelector(".vault-empty");
  if (visibleCount > 0) {
    if (existing) {
      existing.remove();
    }
    return;
  }
  if (!existing) {
    const empty = document.createElement("div");
    empty.className = "vault-empty";
    empty.textContent = "No signals match this filter yet.";
    vaultGrid.appendChild(empty);
  }
};

const filterCards = (filter) => {
  let visible = 0;
  cards.forEach((card) => {
    const category = card.dataset.category;
    const show = filter === "all" || filter === category;
    card.style.display = show ? "block" : "none";
    if (show) {
      visible += 1;
    }
  });
  updateVaultEmptyState(visible);
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
  const counts = getCounts();

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
    briefCallout.textContent = `Add ${remaining} more signal${
      remaining === 1 ? "" : "s"
    } to reach a full brief.`;
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

const buildBriefText = () => {
  const total = selectedCards.size;
  const counts = getCounts();
  const lines = [];

  lines.push(getBriefTitle());
  lines.push(`Owner: ${getBriefOwner()}`);
  lines.push(`Signals selected: ${total}`);
  lines.push(
    `Balance: Scholar ${counts.scholar} | Partner ${counts.partner} | Impact ${counts.impact} | Risk ${counts.risk}`
  );
  lines.push("");

  if (total === 0) {
    lines.push("Select 3-5 signals to generate a full brief pack.");
    return lines.join("\n");
  }

  lines.push("Highlights:");
  selectedCards.forEach((entry) => {
    const label = categoryLabels[entry.category] || "Signal";
    const meta = entry.meta ? ` (${entry.meta})` : "";
    lines.push(`- [${label}] ${entry.title}${meta}`);
  });
  lines.push("");
  lines.push(`Narrative guidance: ${briefCallout.textContent}`);

  return lines.join("\n");
};

const setBriefActions = () => {
  const hasSelection = selectedCards.size > 0;
  if (copyBrief) {
    copyBrief.disabled = !hasSelection;
  }
  if (downloadBrief) {
    downloadBrief.disabled = !hasSelection;
  }
  if (saveBrief) {
    saveBrief.disabled = !hasSelection;
  }
};

const updateBriefOutput = () => {
  const text = buildBriefText();
  if (briefOutput) {
    if (briefStatus) {
      briefStatus.textContent = "";
    }
    briefOutput.value = text;
  }
  if (briefDraft) {
    briefDraft.textContent = text;
  }
};

const buildArchiveCard = (brief) => {
  const card = document.createElement("article");
  card.className = "archive-card";

  const title = document.createElement("p");
  title.className = "archive-title";
  title.textContent = brief.title || "Impact Brief";

  const meta = document.createElement("p");
  meta.className = "archive-meta";
  meta.textContent = `${brief.owner || "Impact Ops"} · ${brief.dateLabel || "Saved"}`;

  const summary = document.createElement("p");
  summary.className = "archive-meta";
  summary.textContent = `${brief.total} signals · ${brief.balance}`;

  const cover = document.createElement("div");
  cover.className = "archive-cover";
  brief.coverage.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "archive-chip";
    chip.textContent = item;
    cover.appendChild(chip);
  });

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(summary);
  card.appendChild(cover);
  return card;
};

const renderArchive = (briefs) => {
  if (!briefArchiveList) {
    return;
  }
  briefArchiveList.innerHTML = "";

  if (!briefs.length) {
    const empty = document.createElement("div");
    empty.className = "archive-card placeholder";
    empty.innerHTML = `\n      <p class="archive-title">No briefs saved yet.</p>\n      <p class="archive-meta">Save your first brief to build the weekly record.</p>\n    `;
    briefArchiveList.appendChild(empty);
    return;
  }

  briefs.forEach((brief) => {
    briefArchiveList.appendChild(buildArchiveCard(brief));
  });
};

const loadArchive = async () => {
  if (briefArchiveStatus) {
    briefArchiveStatus.textContent = "Loading archive…";
  }
  let briefs = [];
  try {
    const response = await fetch("/api/briefs");
    if (response.ok) {
      const payload = await response.json();
      briefs = payload.briefs || [];
    }
  } catch (error) {
    // Keep empty.
  }

  renderArchive(briefs);
  if (briefArchiveStatus) {
    briefArchiveStatus.textContent =
      briefs.length > 0 ? `Last saved: ${briefs[0].dateLabel}` : "No briefs saved yet.";
  }
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
    updateBriefOutput();
    setBriefActions();
    return;
  }

  selectedCards.forEach((entry) => {
    selectionList.appendChild(buildSelectionItem(entry));
  });

  selectionCount.textContent = String(selectedCards.size);
  updateBalance();
  updateBriefOutput();
  setBriefActions();
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

const attachCardEvents = () => {
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
};

const renderSignals = (signals) => {
  if (!vaultGrid) {
    return;
  }

  vaultGrid.innerHTML = "";

  if (!signals.length) {
    const empty = document.createElement("div");
    empty.className = "vault-empty";
    empty.textContent = "No signals available yet.";
    vaultGrid.appendChild(empty);
    cards = [];
    updateSelectionList();
    return;
  }

  signals.forEach((signal) => {
    const card = document.createElement("article");
    card.className = "vault-card";
    card.dataset.id = signal.id;
    card.dataset.category = signal.category;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-pressed", "false");

    const top = document.createElement("div");
    top.className = "card-top";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = signal.tag;

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = signal.timeLabel || "Updated";

    top.appendChild(tag);
    top.appendChild(time);

    const title = document.createElement("h3");
    title.textContent = signal.title;

    const summary = document.createElement("p");
    summary.textContent = signal.summary;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = `Owner: ${signal.owner} · Evidence: ${signal.evidence}`;

    card.appendChild(top);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(meta);

    const existing = selectedCards.get(signal.id);
    if (existing) {
      existing.card = card;
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
    }

    vaultGrid.appendChild(card);
  });

  cards = Array.from(document.querySelectorAll(".vault-card"));
  attachCardEvents();
  filterCards(getActiveFilter());
  updateSelectionList();
};

const loadSignals = async ({ isRefresh = false } = {}) => {
  if (!vaultGrid) {
    return;
  }

  if (refreshSignals) {
    refreshSignals.disabled = true;
  }
  if (vaultStatus) {
    vaultStatus.textContent = isRefresh ? "Refreshing live signals..." : "Loading live signals…";
  }
  vaultGrid.innerHTML = '<div class="vault-loading">Loading live signals...</div>';

  let signals = fallbackSignals;
  let meta = { total: fallbackSignals.length, lastSync: new Date().toISOString() };
  let usedFallback = true;
  try {
    const response = await fetch("/api/signals");
    if (response.ok) {
      const payload = await response.json();
      if (payload.signals?.length) {
        signals = payload.signals;
        meta = payload.meta || meta;
        usedFallback = false;
      }
    }
  } catch (error) {
    // Fall back to local data.
  }

  renderSignals(signals);
  updateVaultMeta({ signals, meta, usedFallback });
  if (refreshSignals) {
    refreshSignals.disabled = false;
  }
};

const loadPulse = async () => {
  let pulse = fallbackPulse;
  try {
    const response = await fetch("/api/pulse");
    if (response.ok) {
      const payload = await response.json();
      if (payload.pulse) {
        pulse = payload.pulse;
      }
    }
  } catch (error) {
    // Keep fallback values.
  }

  if (pulseUpdated) {
    pulseUpdated.textContent = formatPulseUpdated(pulse.snapshotDate);
  }
  if (pulseActiveCount) {
    pulseActiveCount.textContent = String(pulse.activeScholars);
  }
  if (pulseActiveMeta) {
    const change = Math.round(pulse.activeChange * 100);
    pulseActiveMeta.textContent = `${change >= 0 ? "+" : ""}${change}% month-over-month`;
  }
  if (pulsePartnerConfidence) {
    pulsePartnerConfidence.textContent = `${pulse.partnerConfidence}%`;
  }
  if (pulsePartnerMeta) {
    pulsePartnerMeta.textContent = `${pulse.partnerOnTrack} partners on track`;
  }
  if (pulseOutcomeProof) {
    pulseOutcomeProof.textContent = String(pulse.outcomeProof);
  }
  if (pulseOutcomeMeta) {
    pulseOutcomeMeta.textContent = "Verified milestones";
  }
  if (pulseRiskCount) {
    pulseRiskCount.textContent = String(pulse.nextRisks);
  }
  if (pulseRiskMeta) {
    pulseRiskMeta.textContent =
      pulse.nextRisks === 0 ? "No escalations pending" : `${pulse.nextRisks} escalations pending`;
  }
};

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    setActive(chip);
    filterCards(filter);
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

refreshSignals?.addEventListener("click", () => {
  loadSignals({ isRefresh: true });
});

refreshEscalations?.addEventListener("click", () => {
  loadEscalations({ isRefresh: true });
});

briefTitleInput?.addEventListener("input", () => {
  updateBriefOutput();
});

briefOwnerInput?.addEventListener("input", () => {
  updateBriefOutput();
});

copyBrief?.addEventListener("click", async () => {
  if (!briefOutput) {
    return;
  }

  const text = briefOutput.value;
  try {
    await navigator.clipboard.writeText(text);
    if (briefStatus) {
      briefStatus.textContent = "Brief copied to clipboard.";
    }
  } catch (error) {
    briefOutput.select();
    document.execCommand("copy");
    if (briefStatus) {
      briefStatus.textContent = "Brief copied. Paste it into your briefing deck.";
    }
  }
});

downloadBrief?.addEventListener("click", () => {
  if (!briefOutput) {
    return;
  }

  const blob = new Blob([briefOutput.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `impact-brief-${stamp}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  if (briefStatus) {
    briefStatus.textContent = "Brief downloaded as text.";
  }
});

saveBrief?.addEventListener("click", async () => {
  if (!briefOutput) {
    return;
  }
  if (saveBrief) {
    saveBrief.disabled = true;
  }
  if (briefStatus) {
    briefStatus.textContent = "Saving brief to vault…";
  }

  const counts = getCounts();
  const selections = Array.from(selectedCards.values()).map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    meta: entry.meta,
    tag: entry.tag,
  }));

  try {
    const response = await fetch("/api/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: getBriefTitle(),
        owner: getBriefOwner(),
        narrative: briefOutput.value,
        selections,
        counts,
      }),
    });
    if (!response.ok) {
      throw new Error("Save failed");
    }
    if (briefStatus) {
      briefStatus.textContent = "Brief saved. Archive updated.";
    }
    await loadArchive();
  } catch (error) {
    if (briefStatus) {
      briefStatus.textContent = "Save failed. Try again.";
    }
  } finally {
    setBriefActions();
  }
});

loadSignals();
loadPulse();
updateSelectionList();
loadArchive();
loadEscalations();
