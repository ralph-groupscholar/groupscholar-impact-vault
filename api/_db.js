const { Pool } = require("pg");

let pool;

const getConnectionString = () =>
  process.env.GS_IMPACT_VAULT_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

const shouldUseSSL = () =>
  ["require", "verify-full", "verify-ca"].includes(process.env.PGSSLMODE) ||
  process.env.GS_IMPACT_VAULT_DB_SSL === "true";

const getPool = () => {
  if (!pool) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error("Database connection string not configured.");
    }
    pool = new Pool({
      connectionString,
      ssl: shouldUseSSL() ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
};

module.exports = { getPool };
