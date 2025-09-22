const { getPool } = require("./_db");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const pool = getPool();
    const cardsResult = await pool.query(
      `
      SELECT
        card_id,
        tag,
        time_label,
        title,
        summary,
        owner,
        next_step,
        accent
      FROM impact_vault.cohort_momentum_cards
      ORDER BY order_index ASC, updated_at DESC;
      `
    );
    const timelineResult = await pool.query(
      `
      SELECT
        timeline_id,
        week_label,
        title,
        summary,
        highlight
      FROM impact_vault.cohort_momentum_timeline
      ORDER BY order_index ASC;
      `
    );

    const cards = cardsResult.rows.map((row) => ({
      id: row.card_id,
      tag: row.tag,
      timeLabel: row.time_label,
      title: row.title,
      summary: row.summary,
      owner: row.owner,
      nextStep: row.next_step,
      accent: row.accent,
    }));

    const timeline = timelineResult.rows.map((row) => ({
      id: row.timeline_id,
      weekLabel: row.week_label,
      title: row.title,
      summary: row.summary,
      highlight: row.highlight,
    }));

    res.status(200).json({ cards, timeline });
  } catch (error) {
    res.status(500).json({ error: "Failed to load cohort momentum updates." });
  }
};
