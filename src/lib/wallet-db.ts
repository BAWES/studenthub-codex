/**
 * Wallet Database Client
 *
 * Provides a pooled MySQL connection to the wallet database, which is a
 * separate database server from the main StudentHub database. This is used
 * for balance/wallet related queries (balance_account, balance_transaction).
 *
 * Configure via WALLET_DATABASE_URL in .env, e.g.:
 *   WALLET_DATABASE_URL="mysql://user:***@host:port/database"
 */

import { createPool, type Pool } from "mysql2/promise";

let pool: Pool | null = null;

function getWalletPool(): Pool {
  if (pool) return pool;

  const url = process.env.WALLET_DATABASE_URL;
  if (!url) {
    throw new Error(
      "WALLET_DATABASE_URL is not set. Add it to .env to enable wallet/balance queries.",
    );
  }

  pool = createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  return pool;
}

/**
 * Execute a raw SQL query against the wallet database.
 * Uses parameterized queries to prevent SQL injection.
 */
export async function walletQuery<T = any>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const p = getWalletPool();
  const result = await (p.query as any)(sql, params);
  const rows: T = result[0] as T;
  return rows;
}

/**
 * Execute a write query (INSERT/UPDATE/DELETE) against the wallet database.
 * Returns the result header.
 */
export async function walletExecute(
  sql: string,
  params: unknown[] = [],
): Promise<{ affectedRows: number; insertId: number }> {
  const p = getWalletPool();
  const [result] = await (p.execute as any)(sql, params);
  return {
    affectedRows: (result as import("mysql2/promise").ResultSetHeader)
      .affectedRows,
    insertId: (result as import("mysql2/promise").ResultSetHeader).insertId,
  };
}

/**
 * Gracefully close the wallet database pool. Call during app shutdown.
 */
export async function closeWalletPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
