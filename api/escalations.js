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
        escalation_id,
        title,
        summary,
        owner,
        severity,
        status,
        due_date,
        updated_at
      FROM impact_vault.escalations
      ORDER BY due_date ASC NULLS LAST, id DESC
      LIMIT 12;
      `
    );

    const metaResult = await pool.query(
      `
      SELECT
        COUNT(*)::INT AS total,
        MAX(updated_at) AS last_sync
      FROM impact_vault.escalations;
      `
    );
    const metaRow = metaResult.rows[0] || {};

    const escalations = rows.map((row) => ({
      id: row.escalation_id,
      title: row.title,
      summary: row.summary,
      owner: row.owner,
      severity: row.severity,
      status: row.status,
      dueLabel: formatDueLabel(row.due_date),
    }));

    res.status(200).json({
      escalations,
      meta: {
        total: metaRow.total || escalations.length,
        lastSync: metaRow.last_sync,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load escalations." });
  }
};
