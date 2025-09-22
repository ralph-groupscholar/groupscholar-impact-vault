const { getPool } = require("./_db");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const pool = getPool();
    const metricsResult = await pool.query(
      `
      SELECT
        snapshot_date,
        checkins_count,
        sentiment_score,
        sentiment_change,
        needs_flagged,
        updated_at
      FROM impact_vault.scholar_voice_metrics
      ORDER BY snapshot_date DESC
      LIMIT 1;
      `
    );
    const entriesResult = await pool.query(
      `
      SELECT
        entry_id,
        tag,
        quote,
        summary,
        owner,
        action,
        highlight,
        observed_at
      FROM impact_vault.scholar_voice_entries
      ORDER BY observed_at DESC
      LIMIT 6;
      `
    );

    const metricsRow = metricsResult.rows[0];
    const metrics = metricsRow
      ? {
          snapshotDate: metricsRow.snapshot_date,
          checkinsCount: metricsRow.checkins_count,
          sentimentScore: Number(metricsRow.sentiment_score),
          sentimentChange: Number(metricsRow.sentiment_change),
          needsFlagged: metricsRow.needs_flagged,
          updatedAt: metricsRow.updated_at,
        }
      : null;

    const entries = entriesResult.rows.map((row) => ({
      id: row.entry_id,
      tag: row.tag,
      quote: row.quote,
      summary: row.summary,
      owner: row.owner,
      action: row.action,
      highlight: row.highlight,
      observedAt: row.observed_at,
    }));

    res.status(200).json({ metrics, entries });
  } catch (error) {
    res.status(500).json({ error: "Failed to load scholar voice updates." });
  }
};
