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

    console.log("Impact Vault seed complete.");
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
