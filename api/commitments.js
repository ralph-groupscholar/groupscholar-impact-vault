const { getPool } = require("./_db");

const formatDueLabel = (value) => {
  if (!value) {
    return "No due date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }
  return `Due ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
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
        commitment_id,
        partner_name,
        milestone,
        owner,
        status,
        confidence,
        due_date,
        impact_value,
        updated_at
      FROM impact_vault.partner_commitments
      ORDER BY due_date ASC NULLS LAST, id DESC
      LIMIT 12;
      `
    );

    const metaResult = await pool.query(
      `
      SELECT
        COUNT(*)::INT AS total,
        MAX(updated_at) AS last_sync
      FROM impact_vault.partner_commitments;
      `
    );
    const metaRow = metaResult.rows[0] || {};

    const statsResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (
          WHERE status ILIKE '%risk%' OR status ILIKE '%blocked%'
        )::INT AS at_risk,
        COUNT(*) FILTER (
          WHERE status ILIKE '%track%' OR status ILIKE '%active%' OR status ILIKE '%on%'
        )::INT AS on_track,
        COUNT(*) FILTER (
          WHERE due_date IS NOT NULL
            AND due_date <= CURRENT_DATE + INTERVAL '7 days'
        )::INT AS due_soon
      FROM impact_vault.partner_commitments;
      `
    );
    const statsRow = statsResult.rows[0] || {};

    const commitments = rows.map((row) => ({
      id: row.commitment_id,
      partner: row.partner_name,
      milestone: row.milestone,
      owner: row.owner,
      status: row.status,
      confidence: row.confidence,
      dueDate: row.due_date,
      dueLabel: formatDueLabel(row.due_date),
      impactValue: row.impact_value,
    }));

    res.status(200).json({
      commitments,
      meta: {
        total: metaRow.total || commitments.length,
        lastSync: metaRow.last_sync,
        stats: {
          onTrack: statsRow.on_track ?? 0,
          atRisk: statsRow.at_risk ?? 0,
          dueSoon: statsRow.due_soon ?? 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load commitments." });
  }
};
