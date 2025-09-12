const { getPool } = require("./_db");

const formatDueDate = (value) => {
  if (!value) {
    return "No due date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }
  const now = new Date();
  const diffMs = date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays < 0) {
    return `Overdue · ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  }
  if (diffDays === 0) {
    return "Due today";
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
        decision_id,
        title,
        summary,
        owner,
        due_date,
        status,
        priority
      FROM impact_vault.decisions
      ORDER BY due_date ASC NULLS LAST, created_at DESC
      LIMIT 6;
      `
    );

    const decisions = rows.map((row) => ({
      id: row.decision_id,
      title: row.title,
      summary: row.summary,
      owner: row.owner,
      dueDate: row.due_date,
      dueLabel: formatDueDate(row.due_date),
      status: row.status,
      priority: row.priority,
    }));

    res.status(200).json({ decisions });
  } catch (error) {
    res.status(500).json({ error: "Failed to load decisions." });
  }
};
