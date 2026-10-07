/**
 * lib/db.ts — MySQL connection pool for Next.js
 * ใช้ mysql2/promise สำหรับ async queries
 *
 * ต้องติดตั้ง: npm install mysql2
 * ตั้งค่า environment variables ใน .env.local หรือ Vercel dashboard
 */
import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host:               process.env.DB_HOST     || "187.127.108.153",
    port:               parseInt(process.env.DB_PORT || "3306"),
    database:           process.env.DB_NAME     || "iks_corporate",
    user:               process.env.DB_USER     || "iks_user",
    password:           process.env.DB_PASSWORD || "",
    waitForConnections: true,
    connectionLimit:    5,        // serverless — ใช้น้อยๆ
    connectTimeout:     10_000,
    charset:            "utf8mb4",
  });
}

// Re-use pool ระหว่าง hot-reloads ใน dev
const pool: mysql.Pool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (global._mysqlPool ??= createPool());

export default pool;
