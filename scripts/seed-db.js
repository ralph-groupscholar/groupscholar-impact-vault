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

    console.log("Impact Vault seed complete.");
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
