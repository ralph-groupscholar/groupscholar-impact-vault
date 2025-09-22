const { Client } = require("pg");

const connectionString =
  process.env.GS_IMPACT_VAULT_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Missing database connection string.");
  process.exit(1);
}

const shouldUseSSL =
  ["require", "verify-full", "verify-ca"].includes(process.env.PGSSLMODE) ||
  process.env.GS_IMPACT_VAULT_DB_SSL === "true";

const formatDate = (date) => date.toISOString().slice(0, 10);
const offsetDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};
const forwardDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const signals = [
  {
    signal_id: "signal-1",
    category: "scholar",
    tag: "Scholar Journey",
    title: "Retention lift after cohort mentoring pilot",
    summary:
      "Scholars in the peer-mentored cohort completed 1.8x more milestones with a 12% higher retention rate than control groups.",
    owner: "Scholar Success",
    evidence: "Survey + CRM",
    observed_at: offsetDays(2),
  },
  {
    signal_id: "signal-2",
    category: "partner",
    tag: "Partner Readiness",
    title: "Employer partners ready for spring placement surge",
    summary:
      "9 partners have confirmed placement slots with onboarding assets delivered and hiring managers trained on support standards.",
    owner: "Partnerships",
    evidence: "Partner CRM",
    observed_at: offsetDays(3),
  },
  {
    signal_id: "signal-3",
    category: "impact",
    tag: "Impact Proof",
    title: "First-gen graduation outcomes verified",
    summary:
      "17 scholars officially crossed graduation milestones, with 11 landing in roles aligned to their declared pathways.",
    owner: "Impact",
    evidence: "Institutional records",
    observed_at: offsetDays(4),
  },
  {
    signal_id: "signal-4",
    category: "risk",
    tag: "Risk Watch",
    title: "Financial aid gaps emerging for two campuses",
    summary:
      "Aid offices report delayed award packaging; recommend targeted outreach and bridge funding contingency planning.",
    owner: "Operations",
    evidence: "Campus reports",
    observed_at: offsetDays(1),
  },
  {
    signal_id: "signal-5",
    category: "impact",
    tag: "Impact Proof",
    title: "Scholar leadership pipeline hits 80% participation",
    summary:
      "Leadership programming participation increased after introducing micro-credentialing and alumni storytelling sessions.",
    owner: "Programs",
    evidence: "Attendance + LMS",
    observed_at: offsetDays(5),
  },
  {
    signal_id: "signal-6",
    category: "scholar",
    tag: "Scholar Journey",
    title: "Well-being check-ins signal higher stress in finals window",
    summary:
      "Mental health touchpoints show a 22% increase in stress markers; deploy finals week support plan and advisor staffing.",
    owner: "Care Team",
    evidence: "Check-in dashboard",
    observed_at: offsetDays(6),
  },
];

const pulse = {
  snapshot_date: formatDate(new Date()),
  active_scholars: 482,
  active_change: 0.06,
  partner_confidence: 92,
  partner_on_track: 14,
  outcome_proof: 38,
  next_risks: 3,
};

const briefSamples = [
  {
    brief_id: "brief-001",
    title: "Impact Brief — Early February",
    owner: "Impact Ops",
    narrative:
      "Impact Brief — Early February\nOwner: Impact Ops\nSignals selected: 4\nBalance: Scholar 1 | Partner 1 | Impact 1 | Risk 1\n\nHighlights:\n- [Scholar Journey] Retention lift after cohort mentoring pilot\n- [Partner Readiness] Employer partners ready for spring placement surge\n- [Impact Proof] First-gen graduation outcomes verified\n- [Risk Watch] Financial aid gaps emerging for two campuses\n\nNarrative guidance: Brief pack ready. Share with leadership and partners.",
    selections: [
      { id: "signal-1", title: "Retention lift after cohort mentoring pilot", category: "scholar" },
      { id: "signal-2", title: "Employer partners ready for spring placement surge", category: "partner" },
      { id: "signal-3", title: "First-gen graduation outcomes verified", category: "impact" },
      { id: "signal-4", title: "Financial aid gaps emerging for two campuses", category: "risk" },
    ],
    counts: { scholar: 1, partner: 1, impact: 1, risk: 1 },
    created_at: "NOW() - INTERVAL '3 days'",
  },
  {
    brief_id: "brief-002",
    title: "Impact Brief — Placement Readiness",
    owner: "Scholar Success",
    narrative:
      "Impact Brief — Placement Readiness\nOwner: Scholar Success\nSignals selected: 3\nBalance: Scholar 1 | Partner 1 | Impact 1 | Risk 0\n\nHighlights:\n- [Scholar Journey] Well-being check-ins signal higher stress in finals window\n- [Partner Readiness] Employer partners ready for spring placement surge\n- [Impact Proof] Scholar leadership pipeline hits 80% participation\n\nNarrative guidance: Consider adding risk watch to balance the story.",
    selections: [
      { id: "signal-6", title: "Well-being check-ins signal higher stress in finals window", category: "scholar" },
      { id: "signal-2", title: "Employer partners ready for spring placement surge", category: "partner" },
      { id: "signal-5", title: "Scholar leadership pipeline hits 80% participation", category: "impact" },
    ],
    counts: { scholar: 1, partner: 1, impact: 1, risk: 0 },
    created_at: "NOW() - INTERVAL '1 day'",
  },
];

const escalationSamples = [
  {
    escalation_id: "escalation-001",
    title: "Bridge funding approvals for two campuses",
    summary:
      "Aid packaging delays are extending beyond 10 days; temporary funding approvals needed to prevent stop-outs.",
    owner: "Operations",
    severity: "High",
    status: "Open",
    due_date: offsetDays(-3),
  },
  {
    escalation_id: "escalation-002",
    title: "Advisor coverage gap for finals week",
    summary:
      "Well-being check-ins show a 22% stress increase; deploy surge advisors and triage scripts.",
    owner: "Scholar Success",
    severity: "Medium",
    status: "In Progress",
    due_date: offsetDays(-1),
  },
  {
    escalation_id: "escalation-003",
    title: "Partner onboarding refresher for spring placements",
    summary:
      "Three employers need updated support playbooks before onboarding; coordinate training sessions.",
    owner: "Partnerships",
    severity: "Low",
    status: "Watching",
    due_date: offsetDays(-7),
  },
  {
    escalation_id: "escalation-004",
    title: "Scholar housing stability risk",
    summary:
      "Two cohorts flagged housing insecurity; coordinate emergency grants and community partners.",
    owner: "Care Team",
    severity: "High",
    status: "Open",
    due_date: offsetDays(-2),
  },
];

const evidenceSources = [
  {
    source_id: "evidence-001",
    source_type: "Scholar CRM",
    title: "Retention + completion dashboard",
    summary:
      "82% of scholars on pace to hit term milestones, with peer mentoring the top lift.",
    owner: "Scholar Ops",
    confidence: "High",
    freshness_days: 2.4,
    coverage_percent: 92,
    updated_at: "NOW() - INTERVAL '3 hours'",
  },
  {
    source_id: "evidence-002",
    source_type: "Partner Pulse",
    title: "Placement demand forecast",
    summary:
      "Hiring managers flagged 19 roles as ready, with onboarding support locked in.",
    owner: "Partnerships",
    confidence: "Medium",
    freshness_days: 1.2,
    coverage_percent: 88,
    updated_at: "NOW() - INTERVAL '1 day'",
  },
  {
    source_id: "evidence-003",
    source_type: "Impact QA",
    title: "Outcome verification log",
    summary:
      "38 milestones audited with supporting documentation attached per scholar.",
    owner: "Impact",
    confidence: "High",
    freshness_days: 3.1,
    coverage_percent: 95,
    updated_at: "NOW() - INTERVAL '2 days'",
  },
  {
    source_id: "evidence-004",
    source_type: "Risk Watch",
    title: "Escalations requiring decisions",
    summary:
      "Three scholars need bridge funding approvals within 72 hours.",
    owner: "Care Team",
    confidence: "High",
    freshness_days: 0.6,
    coverage_percent: 97,
    updated_at: "NOW() - INTERVAL '4 hours'",
  },
  {
    source_id: "evidence-005",
    source_type: "Scholar Voice",
    title: "Advisor feedback notes",
    summary:
      "Latest check-ins highlight housing stability risks for two cohorts.",
    owner: "Scholar Success",
    confidence: "Medium",
    freshness_days: 4.3,
    coverage_percent: 86,
    updated_at: "NOW() - INTERVAL '4 days'",
  },
];

const voiceMetrics = {
  snapshot_date: formatDate(new Date()),
  checkins_count: 214,
  sentiment_score: 0.42,
  sentiment_change: 0.11,
  needs_flagged: 19,
  updated_at: "NOW() - INTERVAL '2 hours'",
};

const voiceEntries = [
  {
    entry_id: "voice-001",
    tag: "Well-being",
    quote: "The mentoring pods make the workload feel doable.",
    summary:
      "Scholars in STEM majors report higher confidence when mentor check-ins happen twice weekly during midterms.",
    owner: "Scholar Success",
    action: "Lock mentor coverage",
    highlight: false,
    observed_at: "NOW() - INTERVAL '6 hours'",
  },
  {
    entry_id: "voice-002",
    tag: "Career Readiness",
    quote: "We need more interview practice before placement.",
    summary:
      "12 scholars asked for mock interviews tied to partner roles, especially in health and operations tracks.",
    owner: "Partnerships",
    action: "Schedule mock series",
    highlight: false,
    observed_at: "NOW() - INTERVAL '1 day'",
  },
  {
    entry_id: "voice-003",
    tag: "Financial Stability",
    quote: "My aid package still hasn’t arrived.",
    summary:
      "Two campuses reported delayed disbursements; bridge funding requests are pending for six scholars.",
    owner: "Operations",
    action: "Approve bridge funding",
    highlight: true,
    observed_at: "NOW() - INTERVAL '3 hours'",
  },
];

const momentumCards = [
  {
    card_id: "momentum-001",
    tag: "Lift Tracker",
    time_label: "This week",
    title: "Persistence acceleration",
    summary: "Mentored cohorts showed +9% persistence after the new onboarding sequence.",
    owner: "Scholar Success",
    next_step: "Expand to 3 campuses",
    accent: false,
    order_index: 1,
  },
  {
    card_id: "momentum-002",
    tag: "Funding Forecast",
    time_label: "Next 30 days",
    title: "Aid runway and bridge triggers",
    summary: "$86k bridge capacity available with two campuses flagged for disbursement lag.",
    owner: "Finance",
    next_step: "Packaging slips > 10 days",
    accent: true,
    order_index: 2,
  },
  {
    card_id: "momentum-003",
    tag: "Partner Follow-through",
    time_label: "Rolling",
    title: "Placement readiness",
    summary: "7 employers completed readiness playbooks; 3 need advisor syncs this week.",
    owner: "Partnerships",
    next_step: "Readiness huddle on Tues",
    accent: false,
    order_index: 3,
  },
];

const momentumTimeline = [
  {
    timeline_id: "timeline-001",
    week_label: "Week 1 Focus",
    title: "Stabilize aid packaging",
    summary: "Daily check-ins with campus aid offices and bridge approvals pre-cleared.",
    highlight: false,
    order_index: 1,
  },
  {
    timeline_id: "timeline-002",
    week_label: "Week 2 Focus",
    title: "Activate mentoring push",
    summary: "Scale peer mentor cohort sessions with early-alert flagging for at-risk scholars.",
    highlight: false,
    order_index: 2,
  },
  {
    timeline_id: "timeline-003",
    week_label: "Week 3 Focus",
    title: "Partner pipeline sync",
    summary: "Confirm placement interviews and refresh manager support playbooks.",
    highlight: false,
    order_index: 3,
  },
  {
    timeline_id: "timeline-004",
    week_label: "Week 4 Focus",
    title: "Impact proof handoff",
    summary: "Audit outcomes, capture scholar voice, and ship the board-ready snapshot.",
    highlight: true,
    order_index: 4,
  },
];

const decisions = [
  {
    decision_id: "decision-001",
    title: "Bridge fund approved for aid delays",
    summary:
      "$48k released for two campuses, tied to weekly FAFSA packaging updates and a 14-day reforecast milestone.",
    owner: "Finance + Ops",
    due_date: forwardDays(13),
    status: "In progress",
    priority: "High",
    created_at: "NOW() - INTERVAL '2 days'",
  },
  {
    decision_id: "decision-002",
    title: "Advisor surge coverage for finals week",
    summary:
      "Temporary support added to reduce wait time below 24 hours and stabilize well-being check-ins during high stress windows.",
    owner: "Scholar Success",
    due_date: forwardDays(6),
    status: "Active",
    priority: "Medium",
    created_at: "NOW() - INTERVAL '1 day'",
  },
  {
    decision_id: "decision-003",
    title: "Partner onboarding refresh sprint",
    summary:
      "Training modules refreshed with support standards, escalation paths, and new mentoring expectations for spring placements.",
    owner: "Partnerships",
    due_date: forwardDays(20),
    status: "Scheduled",
    priority: "Medium",
    created_at: "NOW() - INTERVAL '3 days'",
  },
  {
    decision_id: "decision-004",
    title: "Impact evidence audit for board packet",
    summary:
      "Cross-check graduation outcomes and placement confirmations before the next board-ready briefing.",
    owner: "Impact QA",
    due_date: forwardDays(10),
    status: "Queued",
    priority: "High",
    created_at: "NOW() - INTERVAL '4 days'",
  },
];

const commitments = [
  {
    commitment_id: "commitment-001",
    partner_name: "Northbridge Health Systems",
    milestone: "Confirm 24 spring internship placements",
    owner: "Partnerships",
    status: "On track",
    confidence: "High",
    due_date: forwardDays(12),
    impact_value: "$420k projected wage lift",
  },
  {
    commitment_id: "commitment-002",
    partner_name: "CivicTech Labs",
    milestone: "Deliver interview prep cohort for 32 scholars",
    owner: "Career Readiness",
    status: "At risk",
    confidence: "Medium",
    due_date: forwardDays(6),
    impact_value: "32 scholars placement-ready",
  },
  {
    commitment_id: "commitment-003",
    partner_name: "Sunrise Manufacturing",
    milestone: "Launch on-site mentor pairing",
    owner: "Partner Success",
    status: "Active",
    confidence: "High",
    due_date: forwardDays(20),
    impact_value: "18 mentor matches confirmed",
  },
  {
    commitment_id: "commitment-004",
    partner_name: "Atlas Logistics",
    milestone: "Finalize onboarding playbook refresh",
    owner: "Operations",
    status: "In review",
    confidence: "Low",
    due_date: forwardDays(9),
    impact_value: "Reduce onboarding time by 20%",
  },
  {
    commitment_id: "commitment-005",
    partner_name: "Harbor Finance",
    milestone: "Confirm scholarship co-funding for summer cohort",
    owner: "Fundraising",
    status: "On track",
    confidence: "Medium",
    due_date: forwardDays(15),
    impact_value: "$150k co-funding commitment",
  },
];

const run = async () => {
  const client = new Client({
    connectionString,
    ssl: shouldUseSSL ? { rejectUnauthorized: false } : false,
  });

  await client.connect();

  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS impact_vault;");
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.signals (
        id SERIAL PRIMARY KEY,
        signal_id TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        tag TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        owner TEXT NOT NULL,
        evidence TEXT NOT NULL,
        observed_at DATE NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.pulse_metrics (
        id SERIAL PRIMARY KEY,
        snapshot_date DATE UNIQUE NOT NULL,
        active_scholars INTEGER NOT NULL,
        active_change NUMERIC(5, 4) NOT NULL,
        partner_confidence INTEGER NOT NULL,
        partner_on_track INTEGER NOT NULL,
        outcome_proof INTEGER NOT NULL,
        next_risks INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.briefs (
        id SERIAL PRIMARY KEY,
        brief_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        owner TEXT NOT NULL,
        narrative TEXT NOT NULL,
        selections JSONB NOT NULL,
        counts JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.decisions (
        id SERIAL PRIMARY KEY,
        decision_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        owner TEXT NOT NULL,
        due_date DATE,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.escalations (
        id SERIAL PRIMARY KEY,
        escalation_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        owner TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        due_date DATE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.evidence_sources (
        id SERIAL PRIMARY KEY,
        source_id TEXT UNIQUE NOT NULL,
        source_type TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        owner TEXT NOT NULL,
        confidence TEXT NOT NULL,
        freshness_days NUMERIC(6, 2) NOT NULL,
        coverage_percent NUMERIC(6, 2) NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.scholar_voice_metrics (
        id SERIAL PRIMARY KEY,
        snapshot_date DATE UNIQUE NOT NULL,
        checkins_count INTEGER NOT NULL,
        sentiment_score NUMERIC(6, 2) NOT NULL,
        sentiment_change NUMERIC(6, 2) NOT NULL,
        needs_flagged INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.scholar_voice_entries (
        id SERIAL PRIMARY KEY,
        entry_id TEXT UNIQUE NOT NULL,
        tag TEXT NOT NULL,
        quote TEXT NOT NULL,
        summary TEXT NOT NULL,
        owner TEXT NOT NULL,
        action TEXT NOT NULL,
        highlight BOOLEAN NOT NULL DEFAULT FALSE,
        observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.cohort_momentum_cards (
        id SERIAL PRIMARY KEY,
        card_id TEXT UNIQUE NOT NULL,
        tag TEXT NOT NULL,
        time_label TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        owner TEXT NOT NULL,
        next_step TEXT NOT NULL,
        accent BOOLEAN NOT NULL DEFAULT FALSE,
        order_index INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.cohort_momentum_timeline (
        id SERIAL PRIMARY KEY,
        timeline_id TEXT UNIQUE NOT NULL,
        week_label TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        highlight BOOLEAN NOT NULL DEFAULT FALSE,
        order_index INTEGER NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_vault.partner_commitments (
        id SERIAL PRIMARY KEY,
        commitment_id TEXT UNIQUE NOT NULL,
        partner_name TEXT NOT NULL,
        milestone TEXT NOT NULL,
        owner TEXT NOT NULL,
        status TEXT NOT NULL,
        confidence TEXT NOT NULL,
        due_date DATE,
        impact_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    for (const signal of signals) {
      await client.query(
        `
        INSERT INTO impact_vault.signals
          (signal_id, category, tag, title, summary, owner, evidence, observed_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (signal_id)
        DO UPDATE SET
          category = EXCLUDED.category,
          tag = EXCLUDED.tag,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          owner = EXCLUDED.owner,
          evidence = EXCLUDED.evidence,
          observed_at = EXCLUDED.observed_at,
          updated_at = NOW();
        `,
        [
          signal.signal_id,
          signal.category,
          signal.tag,
          signal.title,
          signal.summary,
          signal.owner,
          signal.evidence,
          signal.observed_at,
        ]
      );
    }

    await client.query(
      `
      INSERT INTO impact_vault.pulse_metrics
        (snapshot_date, active_scholars, active_change, partner_confidence, partner_on_track, outcome_proof, next_risks)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (snapshot_date)
      DO UPDATE SET
        active_scholars = EXCLUDED.active_scholars,
        active_change = EXCLUDED.active_change,
        partner_confidence = EXCLUDED.partner_confidence,
        partner_on_track = EXCLUDED.partner_on_track,
        outcome_proof = EXCLUDED.outcome_proof,
        next_risks = EXCLUDED.next_risks,
        updated_at = NOW();
      `,
      [
        pulse.snapshot_date,
        pulse.active_scholars,
        pulse.active_change,
        pulse.partner_confidence,
        pulse.partner_on_track,
        pulse.outcome_proof,
        pulse.next_risks,
      ]
    );

    for (const brief of briefSamples) {
      await client.query(
        `
        INSERT INTO impact_vault.briefs
          (brief_id, title, owner, narrative, selections, counts, created_at)
        VALUES
          ($1, $2, $3, $4, $5::jsonb, $6::jsonb, ${brief.created_at})
        ON CONFLICT (brief_id)
        DO UPDATE SET
          title = EXCLUDED.title,
          owner = EXCLUDED.owner,
          narrative = EXCLUDED.narrative,
          selections = EXCLUDED.selections,
          counts = EXCLUDED.counts,
          created_at = EXCLUDED.created_at;
        `,
        [
          brief.brief_id,
          brief.title,
          brief.owner,
          brief.narrative,
          JSON.stringify(brief.selections),
          JSON.stringify(brief.counts),
        ]
      );
    }

    for (const escalation of escalationSamples) {
      await client.query(
        `
        INSERT INTO impact_vault.escalations
          (escalation_id, title, summary, owner, severity, status, due_date)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (escalation_id)
        DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          owner = EXCLUDED.owner,
          severity = EXCLUDED.severity,
          status = EXCLUDED.status,
          due_date = EXCLUDED.due_date,
          updated_at = NOW();
        `,
        [
          escalation.escalation_id,
          escalation.title,
          escalation.summary,
          escalation.owner,
          escalation.severity,
          escalation.status,
          escalation.due_date,
        ]
      );
    }

    for (const source of evidenceSources) {
      await client.query(
        `
        INSERT INTO impact_vault.evidence_sources
          (source_id, source_type, title, summary, owner, confidence, freshness_days, coverage_percent, updated_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, ${source.updated_at})
        ON CONFLICT (source_id)
        DO UPDATE SET
          source_type = EXCLUDED.source_type,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          owner = EXCLUDED.owner,
          confidence = EXCLUDED.confidence,
          freshness_days = EXCLUDED.freshness_days,
          coverage_percent = EXCLUDED.coverage_percent,
          updated_at = EXCLUDED.updated_at;
        `,
        [
          source.source_id,
          source.source_type,
          source.title,
          source.summary,
          source.owner,
          source.confidence,
          source.freshness_days,
          source.coverage_percent,
        ]
      );
    }

    await client.query(
      `
      INSERT INTO impact_vault.scholar_voice_metrics
        (snapshot_date, checkins_count, sentiment_score, sentiment_change, needs_flagged, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, ${voiceMetrics.updated_at})
      ON CONFLICT (snapshot_date)
      DO UPDATE SET
        checkins_count = EXCLUDED.checkins_count,
        sentiment_score = EXCLUDED.sentiment_score,
        sentiment_change = EXCLUDED.sentiment_change,
        needs_flagged = EXCLUDED.needs_flagged,
        updated_at = EXCLUDED.updated_at;
      `,
      [
        voiceMetrics.snapshot_date,
        voiceMetrics.checkins_count,
        voiceMetrics.sentiment_score,
        voiceMetrics.sentiment_change,
        voiceMetrics.needs_flagged,
      ]
    );

    for (const entry of voiceEntries) {
      await client.query(
        `
        INSERT INTO impact_vault.scholar_voice_entries
          (entry_id, tag, quote, summary, owner, action, highlight, observed_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, ${entry.observed_at})
        ON CONFLICT (entry_id)
        DO UPDATE SET
          tag = EXCLUDED.tag,
          quote = EXCLUDED.quote,
          summary = EXCLUDED.summary,
          owner = EXCLUDED.owner,
          action = EXCLUDED.action,
          highlight = EXCLUDED.highlight,
          observed_at = EXCLUDED.observed_at;
        `,
        [
          entry.entry_id,
          entry.tag,
          entry.quote,
          entry.summary,
          entry.owner,
          entry.action,
          entry.highlight,
        ]
      );
    }

    for (const card of momentumCards) {
      await client.query(
        `
        INSERT INTO impact_vault.cohort_momentum_cards
          (card_id, tag, time_label, title, summary, owner, next_step, accent, order_index)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (card_id)
        DO UPDATE SET
          tag = EXCLUDED.tag,
          time_label = EXCLUDED.time_label,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          owner = EXCLUDED.owner,
          next_step = EXCLUDED.next_step,
          accent = EXCLUDED.accent,
          order_index = EXCLUDED.order_index,
          updated_at = NOW();
        `,
        [
          card.card_id,
          card.tag,
          card.time_label,
          card.title,
          card.summary,
          card.owner,
          card.next_step,
          card.accent,
          card.order_index,
        ]
      );
    }

    for (const item of momentumTimeline) {
      await client.query(
        `
        INSERT INTO impact_vault.cohort_momentum_timeline
          (timeline_id, week_label, title, summary, highlight, order_index)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (timeline_id)
        DO UPDATE SET
          week_label = EXCLUDED.week_label,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          highlight = EXCLUDED.highlight,
          order_index = EXCLUDED.order_index;
        `,
        [
          item.timeline_id,
          item.week_label,
          item.title,
          item.summary,
          item.highlight,
          item.order_index,
        ]
      );
    }

    for (const decision of decisions) {
      await client.query(
        `
        INSERT INTO impact_vault.decisions
          (decision_id, title, summary, owner, due_date, status, priority, created_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, ${decision.created_at})
        ON CONFLICT (decision_id)
        DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          owner = EXCLUDED.owner,
          due_date = EXCLUDED.due_date,
          status = EXCLUDED.status,
          priority = EXCLUDED.priority,
          created_at = EXCLUDED.created_at;
        `,
        [
          decision.decision_id,
          decision.title,
          decision.summary,
          decision.owner,
          decision.due_date,
          decision.status,
          decision.priority,
        ]
      );
    }

    for (const commitment of commitments) {
      await client.query(
        `
        INSERT INTO impact_vault.partner_commitments
          (commitment_id, partner_name, milestone, owner, status, confidence, due_date, impact_value)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (commitment_id)
        DO UPDATE SET
          partner_name = EXCLUDED.partner_name,
          milestone = EXCLUDED.milestone,
          owner = EXCLUDED.owner,
          status = EXCLUDED.status,
          confidence = EXCLUDED.confidence,
          due_date = EXCLUDED.due_date,
          impact_value = EXCLUDED.impact_value,
          updated_at = NOW();
        `,
        [
          commitment.commitment_id,
          commitment.partner_name,
          commitment.milestone,
          commitment.owner,
          commitment.status,
          commitment.confidence,
          commitment.due_date,
          commitment.impact_value,
        ]
      );
    }

    console.log("Impact Vault seed complete.");
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
