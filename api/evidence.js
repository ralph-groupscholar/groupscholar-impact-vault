const { getPool } = require("./_db");

const formatFreshness = (value) => {
  if (value === null || value === undefined) {
    return "0.0 days";
  }
  const rounded = Math.round(Number(value) * 10) / 10;
  return `${rounded.toFixed(1)} days`;
};

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const pool = getPool();
    const { rows: sourceRows } = await pool.query(
      `
      SELECT
        source_id,
        source_type,
        title,
        summary,
        owner,
        confidence,
        updated_at
      FROM impact_vault.evidence_sources
      ORDER BY updated_at DESC
      LIMIT 8;
      `
    );

    const { rows: metricRows } = await pool.query(
      `
      SELECT
        AVG(freshness_days) AS avg_freshness,
        AVG(coverage_percent) AS avg_coverage,
        COUNT(DISTINCT owner) AS owner_count,
        MAX(updated_at) AS last_sync
      FROM impact_vault.evidence_sources;
      `
    );

    const metrics = metricRows[0] || {};

    const sources = sourceRows.map((row) => ({
      id: row.source_id,
      sourceType: row.source_type,
      title: row.title,
      summary: row.summary,
      owner: row.owner,
      confidence: row.confidence,
      updatedAt: row.updated_at,
    }));

    res.status(200).json({
      metrics: {
        freshness: formatFreshness(metrics.avg_freshness),
        coverage: metrics.avg_coverage ? `${Math.round(Number(metrics.avg_coverage))}%` : "0%",
        owners: metrics.owner_count ? Number(metrics.owner_count) : 0,
        lastSync: metrics.last_sync,
      },
      sources,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load evidence." });
  }
};
