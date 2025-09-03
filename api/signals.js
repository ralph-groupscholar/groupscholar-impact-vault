const { getPool } = require("./_db");

const formatRelativeDate = (value) => {
  if (!value) {
    return "Updated";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Updated";
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

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `
      SELECT
        signal_id,
        category,
        tag,
        title,
        summary,
        owner,
        evidence,
        observed_at
      FROM impact_vault.signals
      ORDER BY observed_at DESC, id DESC
      LIMIT 24;
      `
    );
    const metaResult = await pool.query(
      `
      SELECT
        COUNT(*)::INT AS total,
        MAX(updated_at) AS last_sync
      FROM impact_vault.signals;
      `
    );
    const metaRow = metaResult.rows[0] || {};

    const signals = rows.map((row) => ({
      id: row.signal_id,
      category: row.category,
      tag: row.tag,
      title: row.title,
      summary: row.summary,
      owner: row.owner,
      evidence: row.evidence,
      timeLabel: formatRelativeDate(row.observed_at),
    }));

    res.status(200).json({
      signals,
      meta: {
        total: metaRow.total || signals.length,
        lastSync: metaRow.last_sync,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load signals." });
  }
};
