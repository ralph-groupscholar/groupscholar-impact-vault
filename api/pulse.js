const { getPool } = require("./_db");

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
        snapshot_date,
        active_scholars,
        active_change,
        partner_confidence,
        partner_on_track,
        outcome_proof,
        next_risks
      FROM impact_vault.pulse_metrics
      ORDER BY snapshot_date DESC
      LIMIT 1;
      `
    );

    if (!rows.length) {
      res.status(200).json({ pulse: null });
      return;
    }

    const row = rows[0];

    res.status(200).json({
      pulse: {
        snapshotDate: row.snapshot_date,
        activeScholars: row.active_scholars,
        activeChange: Number(row.active_change),
        partnerConfidence: row.partner_confidence,
        partnerOnTrack: row.partner_on_track,
        outcomeProof: row.outcome_proof,
        nextRisks: row.next_risks,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load pulse metrics." });
  }
};
