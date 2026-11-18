import 'server-only';
import { Pool, types } from 'pg';

// numeric → number (ราคา, พิกัด)
types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));
// date → 'YYYY-MM-DD' string (ไม่แปลง timezone)
types.setTypeParser(1082, (v) => v);

type Pools = { pub: Pool; admin: Pool };

const g = globalThis as unknown as { __iksPools?: Pools };

function makePool(url: string | undefined, name: string) {
  if (!url) throw new Error(`Missing ${name} environment variable`);
  return new Pool({ connectionString: url, max: 8, idleTimeoutMillis: 30_000 });
}

function pools(): Pools {
  if (!g.__iksPools) {
    g.__iksPools = {
      pub: makePool(process.env.DATABASE_URL_PUBLIC, 'DATABASE_URL_PUBLIC'),
      admin: makePool(process.env.DATABASE_URL_ADMIN, 'DATABASE_URL_ADMIN'),
    };
  }
  return g.__iksPools;
}

/** หน้าเว็บ: role iks_web_public (อ่านได้เฉพาะ published_* + ส่ง lead) */
export function publicDb() {
  return pools().pub;
}

/** โหมดพรีวิว/หลังบ้าน: role iks_web_admin (เห็นข้อมูลตัวอย่างด้วย) */
export function adminDb() {
  return pools().admin;
}
