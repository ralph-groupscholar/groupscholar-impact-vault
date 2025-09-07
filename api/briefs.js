const { randomUUID } = require("crypto");
const { getPool } = require("./_db");

const formatRelativeDate = (value) => {
  if (!value) {
    return "Saved";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved";
  }
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays <= 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  return `${diffDays} days ago`;
};

const buildBalanceLabel = (counts) =>
  `S ${counts.scholar || 0} · P ${counts.partner || 0} · I ${counts.impact || 0} · R ${counts.risk || 0}`;

const buildCoverage = (counts) => [
  `Scholar ${counts.scholar || 0}`,
  `Partner ${counts.partner || 0}`,
  `Impact ${counts.impact || 0}`,
  `Risk ${counts.risk || 0}`,
];

const parseBody = (req) => {
  if (!req.body) {
    return null;
  }
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body;
};

const safeText = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
};

module.exports = async (req, res) => {
  const pool = getPool();

  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        `
        SELECT
          brief_id,
          title,
          owner,
          counts,
          created_at
        FROM impact_vault.briefs
        ORDER BY created_at DESC
        LIMIT 6;
        `
      );

      const briefs = rows.map((row) => {
        const counts = row.counts || {};
        return {
          id: row.brief_id,
          title: row.title,
          owner: row.owner,
          dateLabel: formatRelativeDate(row.created_at),
          total:
            (counts.scholar || 0) +
            (counts.partner || 0) +
            (counts.impact || 0) +
            (counts.risk || 0),
          balance: buildBalanceLabel(counts),
          coverage: buildCoverage(counts),
        };
      });

      res.status(200).json({ briefs });
    } catch (error) {
      res.status(500).json({ error: "Failed to load briefs." });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = parseBody(req);
      if (!body) {
        res.status(400).json({ error: "Missing payload." });
        return;
      }

      const title = safeText(body.title, "Group Scholar Impact Brief");
      const owner = safeText(body.owner, "Impact Ops");
      const narrative = safeText(body.narrative, "");
      const selections = Array.isArray(body.selections) ? body.selections : [];
      const counts = body.counts && typeof body.counts === "object" ? body.counts : {};

      const briefId = typeof randomUUID === "function" ? randomUUID() : `brief-${Date.now()}`;

      await pool.query(
        `
        INSERT INTO impact_vault.briefs
          (brief_id, title, owner, narrative, selections, counts)
        VALUES
          ($1, $2, $3, $4, $5::jsonb, $6::jsonb);
        `,
        [briefId, title, owner, narrative, JSON.stringify(selections), JSON.stringify(counts)]
      );

      res.status(201).json({ ok: true, id: briefId });
    } catch (error) {
      res.status(500).json({ error: "Failed to save brief." });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
};
